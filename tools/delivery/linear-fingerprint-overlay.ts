#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  closeSync,
  linkSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import {
  canonicalLinearRelationKey,
  type LinearFingerprint,
} from "./lib/linear-live.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";

interface CaptureSource {
  repository: string;
  commit: string;
  ref: string;
  runId: string;
  runAttempt: string;
}

interface CaptureReceipt {
  schemaVersion: 1;
  capturedAt: string;
  fingerprintSha256: string;
  source: CaptureSource;
}

interface SnapshotIssue extends Record<string, unknown> {
  id: string;
  sourceId: string | null;
  dependencies: string[];
}

interface Snapshot extends Record<string, unknown> {
  generatedAt: string;
  issues: SnapshotIssue[];
  projects: Array<Record<string, unknown> & { id: string }>;
  milestones: Array<Record<string, unknown> & { id: string }>;
  releases: Array<Record<string, unknown> & { id: string }>;
  linearFingerprint: LinearFingerprint;
}

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const ISSUE_STATE_TYPES = new Set([
  "triage",
  "backlog",
  "unstarted",
  "started",
  "completed",
  "canceled",
]);
const PIPELINE_TYPES = new Set(["continuous", "scheduled"]);
const STAGE_TYPES = new Set(["planned", "started", "completed", "canceled"]);

function strictUtcTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_UTC.test(value)) return false;
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

function argumentsByName(): Map<string, string> {
  const allowed = new Set([
    "--snapshot",
    "--fingerprint",
    "--receipt",
    "--linear-project-scope",
    "--out",
  ]);
  const sourceOverrides = new Set([
    "--repository",
    "--commit",
    "--ref",
    "--run-id",
    "--run-attempt",
  ]);
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(`Invalid argument near ${name ?? "end of command"}`);
    }
    if (!allowed.has(name)) {
      if (sourceOverrides.has(name)) {
        throw new Error(`${name} cannot override the GitHub run source`);
      }
      throw new Error(`Unsupported argument ${name}`);
    }
    if (values.has(name)) throw new Error(`Duplicate argument ${name}`);
    values.set(name, value);
  }
  return values;
}

function requiredPath(arguments_: Map<string, string>, name: string): string {
  const value = arguments_.get(name)?.trim();
  if (!value) throw new Error(`${name} is required`);
  return resolve(value);
}

function expectedSource(): CaptureSource {
  const resolveValue = (environment: string): string => {
    const value = process.env[environment]?.trim();
    if (!value) {
      throw new Error(`${environment} is required`);
    }
    return value;
  };
  return {
    repository: resolveValue("GITHUB_REPOSITORY"),
    commit: resolveValue("GITHUB_SHA"),
    ref: resolveValue("GITHUB_REF"),
    runId: resolveValue("GITHUB_RUN_ID"),
    runAttempt: resolveValue("GITHUB_RUN_ATTEMPT"),
  };
}

function assertReceipt(
  value: unknown,
  fingerprintJson: string,
  expected: CaptureSource,
): CaptureReceipt {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Linear capture receipt is invalid");
  }
  assertExactKeys(
    value,
    ["schemaVersion", "capturedAt", "fingerprintSha256", "source"],
    "Linear capture receipt",
  );
  const receipt = value as Partial<CaptureReceipt>;
  assertExactKeys(
    receipt.source,
    ["repository", "commit", "ref", "runId", "runAttempt"],
    "Linear capture receipt source",
  );
  const fingerprintSha256 = createHash("sha256")
    .update(fingerprintJson)
    .digest("hex");
  if (
    receipt.schemaVersion !== 1 ||
    !strictUtcTimestamp(receipt.capturedAt) ||
    receipt.fingerprintSha256 !== fingerprintSha256 ||
    !receipt.source ||
    Object.entries(expected).some(
      ([field, expectedValue]) =>
        receipt.source?.[field as keyof CaptureSource] !== expectedValue,
    )
  ) {
    throw new Error(
      "Linear capture receipt does not match the fingerprint and run source",
    );
  }
  if (
    receipt.source.repository !== "meetblakey/sourcera" ||
    !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(receipt.source.commit) ||
    receipt.source.ref !== "refs/heads/main" ||
    !/^[1-9]\d*$/.test(receipt.source.runId) ||
    !/^[1-9]\d*$/.test(receipt.source.runAttempt)
  ) {
    throw new Error("Linear capture receipt canonical source is invalid");
  }
  return receipt as CaptureReceipt;
}

function indexById<T extends { id: string }>(
  rows: T[],
  label: string,
): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    if (!row?.id || result.has(row.id)) {
      throw new Error(`${label} inventory is invalid or duplicated`);
    }
    result.set(row.id, row);
  }
  return result;
}

function assertExactInventoryIdSet<
  Baseline extends { id: string },
  Live extends { id: string },
>(
  baseline: Baseline[],
  live: Live[],
  label: string,
): void {
  const baselineById = indexById(baseline, `Snapshot ${label}`);
  const liveById = indexById(live, `Live ${label}`);
  const missing = [...baselineById.keys()]
    .filter((id) => !liveById.has(id))
    .sort();
  const unexpected = [...liveById.keys()]
    .filter((id) => !baselineById.has(id))
    .sort();
  if (!missing.length && !unexpected.length) return;
  const details = [
    ...(missing.length ? [`missing live IDs ${missing.join(", ")}`] : []),
    ...(unexpected.length
      ? [`unexpected live IDs ${unexpected.join(", ")}`]
      : []),
  ];
  throw new Error(`Linear ${label} ID set differs: ${details.join("; ")}`);
}

function validArchiveState(value: unknown): value is string | null {
  return value === null || strictUtcTimestamp(value);
}

function assertIssueIdentity(issue: LinearFingerprint["issues"][number]): void {
  if (!UUID.test(issue.linearId ?? "")) {
    throw new Error(
      `Linear issue ${issue.identifier} stable Linear ID is invalid`,
    );
  }
  if (
    !/^[A-Z][A-Z0-9]*-\d+$/.test(issue.identifier) ||
    !issue.title?.trim() ||
    !SHA256.test(issue.descriptionFingerprint) ||
    !strictUtcTimestamp(issue.updatedAt) ||
    (issue.estimate !== null &&
      (typeof issue.estimate !== "number" ||
        !Number.isFinite(issue.estimate) ||
        issue.estimate < 0)) ||
    !issue.state?.trim() ||
    !issue.stateType?.trim()
  ) {
    throw new Error(`Linear issue ${issue.identifier} identity is incomplete`);
  }
  if (!ISSUE_STATE_TYPES.has(issue.stateType)) {
    throw new Error(`Linear issue ${issue.identifier} state type is invalid`);
  }
  if (
    !Number.isInteger(issue.priority) ||
    issue.priority < 0 ||
    issue.priority > 4
  ) {
    throw new Error(`Linear issue ${issue.identifier} priority is invalid`);
  }
  if (!validArchiveState(issue.archivedAt)) {
    throw new Error(`Linear issue ${issue.identifier} archivedAt is invalid`);
  }
  if (
    !Array.isArray(issue.labels) ||
    issue.labels.some((label) => typeof label !== "string" || !label.trim()) ||
    new Set(issue.labels).size !== issue.labels.length
  ) {
    throw new Error(`Linear issue ${issue.identifier} labels are invalid`);
  }
  if (
    (issue.assignee === null) !== (issue.assigneeId === null) ||
    (issue.assignee !== null &&
      (!issue.assignee.trim() || !UUID.test(issue.assigneeId ?? "")))
  ) {
    throw new Error(
      `Linear issue ${issue.identifier} assignee identity is incomplete`,
    );
  }
  const teamPrefix = issue.identifier.split("-")[0];
  if (
    !issue.team?.trim() ||
    issue.team !== teamPrefix ||
    !UUID.test(issue.teamId)
  ) {
    throw new Error(
      `Linear issue ${issue.identifier} team identity is incomplete`,
    );
  }
  if (
    (issue.projectId === null) !== (issue.project === null) ||
    (issue.projectId !== null &&
      (!UUID.test(issue.projectId) || !issue.project?.trim()))
  ) {
    throw new Error(
      `Linear issue ${issue.identifier} project identity is incomplete`,
    );
  }
  if (
    (issue.milestoneId === null) !== (issue.milestone === null) ||
    (issue.milestoneId !== null &&
      (!UUID.test(issue.milestoneId) ||
        !issue.milestone?.trim() ||
        issue.projectId === null))
  ) {
    throw new Error(
      `Linear issue ${issue.identifier} milestone identity is incomplete`,
    );
  }
  if (
    (issue.parent !== null &&
      (typeof issue.parent !== "string" || !issue.parent.trim())) ||
    !Array.isArray(issue.releases) ||
    !Array.isArray(issue.relations)
  ) {
    throw new Error(`Linear issue ${issue.identifier} links are invalid`);
  }
}

function assertUnique<T>(
  rows: readonly T[],
  key: (row: T) => string,
  label: string,
): void {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = key(row);
    if (!value || seen.has(value)) {
      throw new Error(`${label} inventory is duplicate or incomplete`);
    }
    seen.add(value);
  }
}

function assertNoRawLinearDescriptions(
  value: unknown,
  path = "fingerprint",
): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoRawLinearDescriptions(entry, `${path}[${index}]`),
    );
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, entry] of Object.entries(value)) {
    if (key === "description" || key === "issueDescriptions") {
      throw new Error(
        `Raw Linear description field is forbidden at ${path}.${key}`,
      );
    }
    assertNoRawLinearDescriptions(entry, `${path}.${key}`);
  }
}

function assertExactKeys(
  value: unknown,
  expected: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is not an object`);
  }
  const expectedSet = new Set(expected);
  const actual = Object.keys(value);
  const unexpected = actual.filter((key) => !expectedSet.has(key)).sort();
  if (unexpected.length) {
    throw new Error(`Unexpected ${unexpected.join(", ")} in ${label}`);
  }
  const missing = expected.filter((key) => !Object.hasOwn(value, key));
  if (missing.length) {
    throw new Error(`Missing ${missing.join(", ")} in ${label}`);
  }
}

function assertExactFingerprintShape(fingerprint: LinearFingerprint): void {
  assertExactKeys(
    fingerprint,
    ["issues", "releasePipelines", "releases", "projects", "projectMilestones"],
    "Linear fingerprint",
  );
  for (const issue of fingerprint.issues) {
    assertExactKeys(
      issue,
      [
        "linearId",
        "identifier",
        "title",
        "descriptionFingerprint",
        "updatedAt",
        "estimate",
        "priority",
        "archivedAt",
        "state",
        "stateType",
        "labels",
        "assignee",
        "assigneeId",
        "team",
        "teamId",
        "projectId",
        "project",
        "milestoneId",
        "milestone",
        "parent",
        "releases",
        "relations",
      ],
      `Linear issue ${issue.identifier ?? "unknown"}`,
    );
  }
  for (const pipeline of fingerprint.releasePipelines) {
    if (!PIPELINE_TYPES.has(pipeline.type)) {
      throw new Error(`Linear release pipeline ${pipeline.id} type is invalid`);
    }
    assertExactKeys(
      pipeline,
      [
        "id",
        "name",
        "updatedAt",
        "archivedAt",
        "type",
        "isProduction",
        "teams",
        "stages",
      ],
      `Linear release pipeline ${pipeline.id ?? "unknown"}`,
    );
    for (const team of pipeline.teams) {
      assertExactKeys(
        team,
        ["id", "key"],
        `Linear release pipeline ${pipeline.id} team`,
      );
    }
    for (const stage of pipeline.stages) {
      if (!STAGE_TYPES.has(stage.type)) {
        throw new Error(
          `Linear release pipeline ${pipeline.id} stage type is invalid`,
        );
      }
      assertExactKeys(
        stage,
        ["id", "name", "type", "archivedAt", "position", "frozen"],
        `Linear release pipeline ${pipeline.id} stage`,
      );
    }
  }
  for (const release of fingerprint.releases) {
    assertExactKeys(
      release,
      [
        "id",
        "name",
        "version",
        "updatedAt",
        "archivedAt",
        "pipeline",
        "stage",
        "stageType",
      ],
      `Linear release ${release.id ?? "unknown"}`,
    );
  }
  for (const project of fingerprint.projects) {
    assertExactKeys(
      project,
      ["id", "name", "updatedAt", "archivedAt"],
      `Linear project ${project.id ?? "unknown"}`,
    );
  }
  for (const milestone of fingerprint.projectMilestones) {
    assertExactKeys(
      milestone,
      ["id", "name", "projectId", "project", "archivedAt"],
      `Linear project milestone ${milestone.id ?? "unknown"}`,
    );
  }
}

function assertFingerprintTopology(fingerprint: LinearFingerprint): void {
  assertUnique(fingerprint.issues, (issue) => issue.identifier, "Linear issue");
  assertUnique(
    fingerprint.issues,
    (issue) => issue.linearId ?? "",
    "Linear stable issue ID",
  );
  assertUnique(
    fingerprint.releasePipelines,
    (pipeline) => pipeline.id,
    "Linear release pipeline",
  );
  assertUnique(fingerprint.releases, (release) => release.id, "Linear release");
  assertUnique(
    fingerprint.releases,
    (release) => release.version ?? release.id,
    "Linear release version",
  );
  assertUnique(fingerprint.projects, (project) => project.id, "Linear project");
  assertUnique(
    fingerprint.projectMilestones,
    (milestone) => milestone.id,
    "Linear project milestone",
  );
  assertUnique(
    fingerprint.projectMilestones,
    (milestone) => `${milestone.projectId}:${milestone.name}`,
    "Linear project milestone project/name",
  );

  const issueById = new Map(
    fingerprint.issues.map((issue) => [issue.identifier, issue]),
  );
  const projectById = new Map(
    fingerprint.projects.map((project) => [project.id, project]),
  );
  const milestoneById = new Map(
    fingerprint.projectMilestones.map((milestone) => [milestone.id, milestone]),
  );
  const releaseKeys = new Set(
    fingerprint.releases.map((release) => release.version ?? release.id),
  );
  const relationHolders = new Map<string, Set<string>>();
  const teamIdByKey = new Map<string, string>();
  const teamKeyById = new Map<string, string>();
  const assigneeNameById = new Map<string, string>();
  for (const issue of fingerprint.issues) {
    const priorTeamId = teamIdByKey.get(issue.team);
    const priorTeamKey = teamKeyById.get(issue.teamId);
    if (
      (priorTeamId !== undefined && priorTeamId !== issue.teamId) ||
      (priorTeamKey !== undefined && priorTeamKey !== issue.team)
    ) {
      throw new Error(
        `Linear issue ${issue.identifier} has inconsistent team identity`,
      );
    }
    teamIdByKey.set(issue.team, issue.teamId);
    teamKeyById.set(issue.teamId, issue.team);
    if (issue.assigneeId !== null) {
      const priorAssignee = assigneeNameById.get(issue.assigneeId);
      if (priorAssignee !== undefined && priorAssignee !== issue.assignee) {
        throw new Error(
          `Linear issue ${issue.identifier} has inconsistent assignee identity`,
        );
      }
      assigneeNameById.set(issue.assigneeId, issue.assignee!);
    }
    if (issue.parent !== null) {
      if (issue.parent === issue.identifier || !issueById.has(issue.parent)) {
        throw new Error(
          `Linear issue ${issue.identifier} parent is missing or orphaned`,
        );
      }
    }
    if (new Set(issue.releases).size !== issue.releases.length) {
      throw new Error(
        `Linear issue ${issue.identifier} releases are duplicated`,
      );
    }
    if (issue.releases.length > 1) {
      throw new Error(`Linear issue ${issue.identifier} has multiple releases`);
    }
    if (issue.releases.some((release) => !releaseKeys.has(release))) {
      throw new Error(`Linear issue ${issue.identifier} release is orphaned`);
    }
    if (issue.projectId !== null) {
      const project = projectById.get(issue.projectId);
      const inactiveLegacy =
        issue.archivedAt !== null ||
        issue.stateType.toLowerCase() === "canceled";
      if (!project && !inactiveLegacy) {
        throw new Error(
          `Linear issue ${issue.identifier} project is unknown or orphaned`,
        );
      }
      if (project && project.name !== issue.project) {
        throw new Error(
          `Linear issue ${issue.identifier} project is unknown or orphaned`,
        );
      }
      if (project && issue.milestoneId !== null) {
        const milestone = milestoneById.get(issue.milestoneId);
        if (
          !milestone ||
          milestone.name !== issue.milestone ||
          milestone.projectId !== issue.projectId ||
          milestone.project !== issue.project
        ) {
          throw new Error(
            `Linear issue ${issue.identifier} milestone is unknown or orphaned`,
          );
        }
      }
    }
    if (new Set(issue.relations).size !== issue.relations.length) {
      throw new Error(
        `Linear issue ${issue.identifier} relations are duplicated`,
      );
    }
    for (const relation of issue.relations) {
      const parts = relation.split(":");
      if (parts.length !== 3) {
        throw new Error(`Linear issue ${issue.identifier} relation is invalid`);
      }
      const [type, left, right] = parts;
      let canonical: string;
      try {
        canonical = canonicalLinearRelationKey(type, left, right);
      } catch {
        throw new Error(`Linear issue ${issue.identifier} relation is invalid`);
      }
      if (
        canonical !== relation ||
        (left !== issue.identifier && right !== issue.identifier) ||
        !issueById.has(left) ||
        !issueById.has(right)
      ) {
        throw new Error(
          `Linear issue ${issue.identifier} relation has a missing endpoint`,
        );
      }
      const holders = relationHolders.get(relation) ?? new Set<string>();
      holders.add(issue.identifier);
      relationHolders.set(relation, holders);
    }
  }
  for (const [relation, holders] of relationHolders) {
    const [, left, right] = relation.split(":");
    if (!holders.has(left) || !holders.has(right) || holders.size !== 2) {
      throw new Error(`Linear relation ${relation} is asymmetric`);
    }
  }

  for (const project of fingerprint.projects) {
    if (
      !UUID.test(project.id) ||
      !project.name?.trim() ||
      !strictUtcTimestamp(project.updatedAt) ||
      !validArchiveState(project.archivedAt)
    ) {
      throw new Error(
        `Linear project ${project.id} identity or archivedAt is invalid`,
      );
    }
  }
  for (const milestone of fingerprint.projectMilestones) {
    const project = projectById.get(milestone.projectId);
    if (
      !UUID.test(milestone.id) ||
      !milestone.name?.trim() ||
      !project ||
      project.name !== milestone.project ||
      !validArchiveState(milestone.archivedAt)
    ) {
      throw new Error(
        `Linear project milestone ${milestone.id} is orphaned or invalid`,
      );
    }
  }

  const pipelineById = new Map(
    fingerprint.releasePipelines.map((pipeline) => [pipeline.id, pipeline]),
  );
  const stageIds = new Set<string>();
  for (const pipeline of fingerprint.releasePipelines) {
    if (
      !UUID.test(pipeline.id) ||
      !pipeline.name?.trim() ||
      !pipeline.type?.trim() ||
      !strictUtcTimestamp(pipeline.updatedAt) ||
      !validArchiveState(pipeline.archivedAt) ||
      typeof pipeline.isProduction !== "boolean" ||
      !Array.isArray(pipeline.teams) ||
      !pipeline.teams.length ||
      !Array.isArray(pipeline.stages) ||
      !pipeline.stages.length
    ) {
      throw new Error(
        `Linear release pipeline ${pipeline.id} identity or archivedAt is invalid`,
      );
    }
    assertUnique(
      pipeline.teams,
      (team) => team.id,
      `Linear release pipeline ${pipeline.id} team`,
    );
    if (
      new Set(pipeline.teams.map((team) => team.key)).size !==
      pipeline.teams.length
    ) {
      throw new Error(
        `Duplicate team key in Linear release pipeline ${pipeline.id}`,
      );
    }
    assertUnique(
      pipeline.stages,
      (stage) => stage.id,
      `Linear release pipeline ${pipeline.id} stage`,
    );
    for (const team of pipeline.teams) {
      if (!UUID.test(team.id) || !/^[A-Z][A-Z0-9]*$/.test(team.key)) {
        throw new Error(
          `Linear release pipeline ${pipeline.id} team identity is invalid`,
        );
      }
    }
    for (const stage of pipeline.stages) {
      if (stageIds.has(stage.id)) {
        throw new Error(`Linear release stage ${stage.id} is duplicated`);
      }
      stageIds.add(stage.id);
      if (
        !UUID.test(stage.id) ||
        !stage.name?.trim() ||
        !stage.type?.trim() ||
        !validArchiveState(stage.archivedAt) ||
        !Number.isFinite(stage.position) ||
        typeof stage.frozen !== "boolean"
      ) {
        throw new Error(
          `Linear release pipeline ${pipeline.id} stage identity is invalid`,
        );
      }
    }
  }
  for (const release of fingerprint.releases) {
    const pipeline = pipelineById.get(release.pipeline);
    const stage = pipeline?.stages.find(
      (candidate) => candidate.id === release.stage,
    );
    if (
      !UUID.test(release.id) ||
      !release.name?.trim() ||
      (release.version !== null && !release.version.trim()) ||
      !strictUtcTimestamp(release.updatedAt) ||
      !validArchiveState(release.archivedAt) ||
      !pipeline ||
      !stage ||
      release.stageType !== stage.type
    ) {
      throw new Error(`Linear release ${release.id} is orphaned or invalid`);
    }
  }
}

function buildCandidate(
  snapshot: Snapshot,
  fingerprint: LinearFingerprint,
  receipt: CaptureReceipt,
  scope: LinearProjectScope,
): Snapshot & { linearCapture: CaptureReceipt } {
  assertNoRawLinearDescriptions(fingerprint);
  assertNoRawLinearDescriptions(snapshot, "snapshot");
  assertExactFingerprintShape(fingerprint);
  for (const inventory of [
    "issues",
    "releasePipelines",
    "releases",
    "projects",
    "projectMilestones",
  ] as const) {
    if (
      !Array.isArray(fingerprint?.[inventory]) ||
      !fingerprint[inventory].length
    ) {
      throw new Error(`Linear fingerprint ${inventory} inventory is required`);
    }
  }
  for (const issue of fingerprint.issues) assertIssueIdentity(issue);
  assertFingerprintTopology(fingerprint);
  if (
    !Array.isArray(snapshot.issues) ||
    !Array.isArray(snapshot.projects) ||
    !Array.isArray(snapshot.milestones) ||
    !Array.isArray(snapshot.releases)
  ) {
    throw new Error("Linear snapshot planning inventories are incomplete");
  }
  assertExactInventoryIdSet(snapshot.projects, fingerprint.projects, "project");
  assertExactInventoryIdSet(
    snapshot.milestones,
    fingerprint.projectMilestones,
    "milestone",
  );
  assertExactInventoryIdSet(snapshot.releases, fingerprint.releases, "release");
  const scopedProjectIds = new Set(
    assertLinearProjectScope(scope, fingerprint.projects),
  );
  const liveIssueById = new Map(
    fingerprint.issues.map((issue) => [issue.identifier, issue]),
  );
  const snapshotIssueById = indexById(snapshot.issues, "Snapshot issue");
  for (const live of fingerprint.issues) {
    if (
      live.projectId !== null &&
      scopedProjectIds.has(live.projectId) &&
      !snapshotIssueById.has(live.identifier)
    ) {
      throw new Error(
        `Scoped Linear issue ${live.identifier} is absent from the plan`,
      );
    }
  }
  const sourceByIssue = new Map<string, string>();
  const issueBySource = new Map<string, string>();
  for (const issue of snapshot.issues) {
    if (issue.sourceId === null) continue;
    if (typeof issue.sourceId !== "string" || !issue.sourceId.trim()) {
      throw new Error(`Snapshot issue ${issue.id} source mapping is invalid`);
    }
    const existing = issueBySource.get(issue.sourceId);
    if (existing) {
      throw new Error(
        `Duplicate source mapping ${issue.sourceId} on ${existing} and ${issue.id}`,
      );
    }
    sourceByIssue.set(issue.id, issue.sourceId);
    issueBySource.set(issue.sourceId, issue.id);
  }
  const issues = snapshot.issues.map((planned) => {
    const live = liveIssueById.get(planned.id);
    if (!live) throw new Error(`Tracked Linear issue ${planned.id} is missing`);
    const liveRelease = live.releases[0] ?? null;
    if (liveRelease !== null && !/^R[0-5]$/.test(liveRelease)) {
      throw new Error(
        `Planned Linear issue ${planned.id} has an invalid release ${liveRelease}`,
      );
    }
    const dependencies = planned.sourceId
      ? live.relations
          .flatMap((relation) => {
            const [type, prerequisite, dependent] = relation.split(":");
            if (type !== "blocks" || dependent !== planned.id) return [];
            if (!snapshotIssueById.has(prerequisite)) {
              throw new Error(
                `Linear blocker ${prerequisite} for ${planned.id} is not mapped`,
              );
            }
            const sourceId = sourceByIssue.get(prerequisite);
            if (!sourceId) {
              throw new Error(
                `Linear blocker ${prerequisite} for ${planned.id} has no source mapping`,
              );
            }
            return [sourceId];
          })
          .sort()
      : planned.dependencies;
    return {
      ...planned,
      parentId: live.parent,
      title: live.title,
      labels: [...live.labels],
      release: liveRelease,
      milestone: live.milestone,
      dependencies: [...new Set(dependencies)],
      owner: live.assignee,
      estimate: live.estimate,
    };
  });

  const existingProjects = indexById(snapshot.projects, "Snapshot project");
  const projects = fingerprint.projects.map((project) => ({
    ...(existingProjects.get(project.id) ?? {}),
    ...project,
  }));
  const existingMilestones = indexById(
    snapshot.milestones,
    "Snapshot milestone",
  );
  const milestones = fingerprint.projectMilestones.map((milestone) => ({
    ...(existingMilestones.get(milestone.id) ?? {}),
    ...milestone,
  }));
  const existingReleases = indexById(snapshot.releases, "Snapshot release");
  const pipelineById = new Map(
    fingerprint.releasePipelines.map((pipeline) => [pipeline.id, pipeline]),
  );
  const releases = fingerprint.releases.map((release) => {
    const pipeline = pipelineById.get(release.pipeline);
    const stage = pipeline?.stages.find(
      (candidate) => candidate.id === release.stage,
    );
    if (!pipeline || !stage) {
      throw new Error(
        `Linear release ${release.id} has an orphan pipeline or stage`,
      );
    }
    return {
      ...(existingReleases.get(release.id) ?? {}),
      id: release.id,
      version: release.version,
      name: release.name,
      pipeline: pipeline.name,
      stage: stage.name,
      updatedAt: release.updatedAt,
      archivedAt: release.archivedAt,
    };
  });
  return {
    ...snapshot,
    generatedAt: receipt.capturedAt,
    linearCapture: receipt,
    issues,
    releases,
    projects,
    milestones,
    linearFingerprint: fingerprint,
  };
}

function writeExclusiveAtomic(path: string, contents: string): void {
  const temporary = resolve(dirname(path), `.${randomUUID()}.tmp`);
  let descriptor: number | null = null;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    writeFileSync(descriptor, contents, { encoding: "utf8" });
    closeSync(descriptor);
    descriptor = null;
    linkSync(temporary, path);
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    try {
      unlinkSync(temporary);
    } catch {
      // The temporary path may not exist after an earlier failure.
    }
  }
}

function main(): void {
  const arguments_ = argumentsByName();
  const snapshotPath = requiredPath(arguments_, "--snapshot");
  const fingerprintPath = requiredPath(arguments_, "--fingerprint");
  const receiptPath = requiredPath(arguments_, "--receipt");
  const scopePath = requiredPath(arguments_, "--linear-project-scope");
  const outPath = requiredPath(arguments_, "--out");
  if (outPath === snapshotPath) {
    throw new Error("--out must not overwrite --snapshot");
  }
  const repositoryRoot = realpathSync(
    resolve(
      execFileSync("git", ["rev-parse", "--show-toplevel"], {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim(),
    ),
  );
  const canonicalOutput = join(
    realpathSync(dirname(outPath)),
    basename(outPath),
  );
  const relativeOutput = relative(repositoryRoot, canonicalOutput);
  if (
    relativeOutput === "" ||
    (!relativeOutput.startsWith("..") && !isAbsolute(relativeOutput))
  ) {
    throw new Error("--out must be outside the repository");
  }
  const fingerprintJson = readFileSync(fingerprintPath, "utf8");
  const fingerprint = JSON.parse(fingerprintJson) as LinearFingerprint;
  const receipt = assertReceipt(
    JSON.parse(readFileSync(receiptPath, "utf8")),
    fingerprintJson,
    expectedSource(),
  );
  const candidate = buildCandidate(
    JSON.parse(readFileSync(snapshotPath, "utf8")) as Snapshot,
    fingerprint,
    receipt,
    JSON.parse(readFileSync(scopePath, "utf8")) as LinearProjectScope,
  );
  writeExclusiveAtomic(
    canonicalOutput,
    `${JSON.stringify(candidate, null, 2)}\n`,
  );
  process.stdout.write(
    `${JSON.stringify({ out: canonicalOutput, issues: candidate.issues.length })}\n`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
