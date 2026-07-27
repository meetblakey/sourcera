import { realpathSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import type { LinearFingerprint } from "./linear-live.js";
import type { LinearProgramScope } from "./linear-program-scope.js";
import type { SourceRequirement } from "./model.js";
import { parseRuntimeGate } from "./sources.js";
import {
  resolveLinearSourceChecksum,
  verifySourceChecksumContract,
  type SourceChecksumContract,
} from "./source-checksums.js";

type LiveIssue = LinearFingerprint["issues"][number];

export interface LinearSourceAmbiguity {
  issueId: string;
  sourceId: string;
  sourceDocument: string;
  section: string;
  rationale: string;
}

export interface LinearSourceDisposition {
  sourceId: string;
  disposition: "superseded" | "cleared";
  replacementSourceId: string | null;
  supersededIssueIds: string[];
  rationale: string;
}

export interface LinearSourceSplit {
  sourceId: string;
  primaryIssueId: string;
  executableIssueIds: string[];
  rationale: string;
}

export interface LinearSourcePolicy {
  schemaVersion: 1;
  coordinationIssueIds: string[];
  sourceAmbiguities: LinearSourceAmbiguity[];
  sourceDispositions: LinearSourceDisposition[];
  splits: LinearSourceSplit[];
}

export interface SourceDerivedSnapshotIssue extends Record<string, unknown> {
  id: string;
  sourceId: string | null;
  sourceFamilyId: string | null;
  dependencies: string[];
  kind?: string;
}

export interface LinearRuntimeDependency {
  requirementId: string;
  dependencies: string[];
  rationale: string;
}

export interface LinearRuntimeDependencyContract {
  dependencies: LinearRuntimeDependency[];
}

const ISSUE_ID = /^[A-Z][A-Z0-9]*-\d+$/;
const SOURCE_ID = /^(?:F-(?:AE-|BC-)?\d{3}|RG:[a-z0-9_]+)$/;

function active(issue: LiveIssue): boolean {
  return issue.archivedAt === null && issue.stateType !== "canceled";
}

function requiresLiveOwner(source: SourceRequirement): boolean {
  return source.disposition === "executable" ||
    (source.disposition === "proof_only" &&
      source.requirementId.startsWith("RG:"));
}

function sortedUnique(values: unknown, label: string): string[] {
  if (
    !Array.isArray(values) ||
    values.some((value) => typeof value !== "string" || !value.trim()) ||
    new Set(values).size !== values.length
  ) {
    throw new Error(`${label} must be a unique string array`);
  }
  return [...values].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }),
  );
}

function assertRationale(value: unknown, label: string): void {
  if (typeof value !== "string" || value.trim().length < 20) {
    throw new Error(`${label} rationale is incomplete`);
  }
}

function assertExactKeys(
  value: unknown,
  keys: readonly string[],
  label: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value);
  const missing = keys.filter((key) => !actual.includes(key));
  const unexpected = actual.filter((key) => !keys.includes(key));
  if (missing.length || unexpected.length) {
    throw new Error(`${label} has a noncanonical shape`);
  }
}

export function parseLinearRuntimeInventory(
  stampJson: string,
  dependencyContractJson: string,
): SourceRequirement[] {
  const runtimeRequirements = parseRuntimeGate(stampJson);
  const parsed = JSON.parse(dependencyContractJson) as unknown;
  assertExactKeys(
    parsed,
    ["dependencies"],
    "Linear runtime dependency contract",
  );
  if (!Array.isArray(parsed.dependencies)) {
    throw new Error("Linear runtime dependency contract is invalid");
  }
  const dependenciesById = new Map<string, string[]>();
  for (const [index, raw] of parsed.dependencies.entries()) {
    assertExactKeys(
      raw,
      ["requirementId", "dependencies", "rationale"],
      `Linear runtime dependency ${index + 1}`,
    );
    const requirementId = raw.requirementId;
    const rationale = raw.rationale;
    if (
      typeof requirementId !== "string" ||
      !/^RG:[a-z0-9_]+$/.test(requirementId) ||
      dependenciesById.has(requirementId) ||
      typeof rationale !== "string" ||
      rationale.trim().length < 20
    ) {
      throw new Error(
        `Linear runtime dependency ${String(requirementId || index + 1)} is invalid`,
      );
    }
    dependenciesById.set(
      requirementId,
      sortedUnique(
        raw.dependencies,
        `Linear runtime dependency ${requirementId} dependencies`,
      ),
    );
  }
  const stampIds = new Set(
    runtimeRequirements.map((requirement) => requirement.requirementId),
  );
  const missing = [...stampIds].filter((id) => !dependenciesById.has(id));
  const unexpected = [...dependenciesById.keys()].filter(
    (id) => !stampIds.has(id),
  );
  if (missing.length || unexpected.length) {
    throw new Error(
      `Linear runtime inventory differs from stamp: missing ${missing.join(", ") || "none"}; unexpected ${unexpected.join(", ") || "none"}`,
    );
  }
  return runtimeRequirements.map((requirement) => ({
    ...requirement,
    dependencies: dependenciesById.get(requirement.requirementId)!,
  }));
}

function canonicalSourcePath(repositoryRoot: string, sourceDocument: string): string {
  const path = resolve(repositoryRoot, sourceDocument);
  const relativePath = relative(repositoryRoot, path);
  if (
    relativePath === "" ||
    relativePath.startsWith("..") ||
    isAbsolute(relativePath)
  ) {
    throw new Error(`Linear provenance source ${sourceDocument} is outside the repository`);
  }
  return realpathSync(path);
}

export function assertLinearSourcePolicy(policy: LinearSourcePolicy): void {
  assertExactKeys(
    policy,
    [
      "schemaVersion",
      "coordinationIssueIds",
      "sourceAmbiguities",
      "sourceDispositions",
      "splits",
    ],
    "Linear source policy",
  );
  if (
    policy.schemaVersion !== 1 ||
    !Array.isArray(policy.sourceAmbiguities) ||
    !Array.isArray(policy.sourceDispositions) ||
    !Array.isArray(policy.splits)
  ) {
    throw new Error("Linear source policy schema is invalid");
  }
  if (policy.sourceAmbiguities.length) {
    throw new Error("Linear source ambiguity exceptions are not permitted");
  }
  const coordination = sortedUnique(
    policy.coordinationIssueIds,
    "Linear coordination issue IDs",
  );
  if (coordination.some((id) => !ISSUE_ID.test(id))) {
    throw new Error("Linear coordination issue ID is invalid");
  }
  const ambiguityIssues = new Set<string>();
  for (const row of policy.sourceAmbiguities) {
    assertExactKeys(
      row,
      ["issueId", "sourceId", "sourceDocument", "section", "rationale"],
      "Linear source ambiguity",
    );
    if (
      !ISSUE_ID.test(row.issueId) ||
      !SOURCE_ID.test(row.sourceId) ||
      !row.sourceDocument?.trim() ||
      !row.section?.trim() ||
      ambiguityIssues.has(row.issueId)
    ) {
      throw new Error(`Linear source ambiguity ${row.issueId} is invalid`);
    }
    ambiguityIssues.add(row.issueId);
    assertRationale(row.rationale, `Linear source ambiguity ${row.issueId}`);
  }
  const dispositionSources = new Set<string>();
  const retiredIssueOwners = new Map<string, string>();
  for (const row of policy.sourceDispositions) {
    assertExactKeys(
      row,
      [
        "sourceId",
        "disposition",
        "replacementSourceId",
        "supersededIssueIds",
        "rationale",
      ],
      "Linear source disposition",
    );
    const issueIds = sortedUnique(
      row.supersededIssueIds,
      `${row.sourceId} superseded issue IDs`,
    );
    if (
      !SOURCE_ID.test(row.sourceId) ||
      dispositionSources.has(row.sourceId) ||
      !["superseded", "cleared"].includes(row.disposition) ||
      issueIds.length === 0 ||
      issueIds.some((id) => !ISSUE_ID.test(id)) ||
      (row.disposition === "superseded" &&
        (!row.replacementSourceId || !SOURCE_ID.test(row.replacementSourceId))) ||
      (row.disposition === "cleared" && row.replacementSourceId !== null)
    ) {
      throw new Error(`Linear source disposition ${row.sourceId} is invalid`);
    }
    dispositionSources.add(row.sourceId);
    for (const issueId of issueIds) {
      const prior = retiredIssueOwners.get(issueId);
      if (prior) {
        throw new Error(
          `Linear retired issue ${issueId} is assigned to ${prior} and ${row.sourceId}`,
        );
      }
      retiredIssueOwners.set(issueId, row.sourceId);
    }
    assertRationale(row.rationale, `Linear source disposition ${row.sourceId}`);
  }
  const splitSources = new Set<string>();
  const splitIssueOwners = new Map<string, string>();
  for (const row of policy.splits) {
    assertExactKeys(
      row,
      ["sourceId", "primaryIssueId", "executableIssueIds", "rationale"],
      "Linear source split",
    );
    const executable = sortedUnique(
      row.executableIssueIds,
      `${row.sourceId} executable issue IDs`,
    );
    if (
      !SOURCE_ID.test(row.sourceId) ||
      !ISSUE_ID.test(row.primaryIssueId) ||
      splitSources.has(row.sourceId) ||
      executable.some((id) => !ISSUE_ID.test(id) || id === row.primaryIssueId)
    ) {
      throw new Error(`Linear source split ${row.sourceId} is invalid`);
    }
    splitSources.add(row.sourceId);
    for (const issueId of [row.primaryIssueId, ...executable]) {
      const prior = splitIssueOwners.get(issueId);
      if (prior) {
        throw new Error(`Linear issue ${issueId} splits ${prior} and ${row.sourceId}`);
      }
      splitIssueOwners.set(issueId, row.sourceId);
    }
    assertRationale(row.rationale, `Linear source split ${row.sourceId}`);
  }
  for (const [issueId, sourceId] of splitIssueOwners) {
    if (coordination.includes(issueId)) {
      throw new Error(
        `Linear coordination issue ${issueId} cannot own executable source split ${sourceId}`,
      );
    }
  }
}

export function assertLinearSourcePolicyContracts(
  policy: LinearSourcePolicy,
  sourceRequirements: readonly SourceRequirement[],
): void {
  assertLinearSourcePolicy(policy);
  const sourceById = new Map(
    sourceRequirements.map((source) => [source.requirementId, source]),
  );
  if (sourceById.size !== sourceRequirements.length) {
    throw new Error("Canonical source requirement inventory is duplicated");
  }
  const dispositionSources = new Set(
    policy.sourceDispositions.map((row) => row.sourceId),
  );
  for (const row of policy.sourceDispositions) {
    const source = sourceById.get(row.sourceId);
    const expectedDisposition = row.disposition === "superseded"
      ? "superseded"
      : "narrative_context";
    if (!source || source.disposition !== expectedDisposition) {
      throw new Error(
        `Linear source disposition ${row.sourceId} differs from the canonical disposition`,
      );
    }
    if (
      (row.disposition === "superseded" &&
        source.replacementId !== row.replacementSourceId) ||
      (row.disposition === "cleared" && source.replacementId !== undefined)
    ) {
      throw new Error(
        `Linear source disposition ${row.sourceId} replacement differs from the canonical disposition`,
      );
    }
    if (row.replacementSourceId) {
      const replacement = sourceById.get(row.replacementSourceId);
      if (
        row.replacementSourceId === row.sourceId ||
        !replacement ||
        dispositionSources.has(row.replacementSourceId) ||
        !requiresLiveOwner(replacement)
      ) {
        throw new Error(
          `Linear source disposition ${row.sourceId} has an invalid replacement chain`,
        );
      }
    }
  }
  for (const split of policy.splits) {
    const source = sourceById.get(split.sourceId);
    if (
      !source ||
      source.disposition !== "executable" ||
      dispositionSources.has(split.sourceId)
    ) {
      throw new Error(
        `Linear source split ${split.sourceId} is not a canonical executable source`,
      );
    }
  }
}

function newSnapshotIssue(live: LiveIssue): SourceDerivedSnapshotIssue {
  return {
    id: live.identifier,
    sourceId: null,
    sourceFamilyId: null,
    title: live.title,
    kind: active(live) ? "executable" : "retired_source",
    labels: [...live.labels],
    release: live.releases[0] ?? null,
    milestone: live.milestone,
    dependencies: [],
    owner: live.assignee,
    reviewer: null,
    estimate: live.estimate,
    paths: [],
    tests: { success: null, failure: null, recovery: null },
    rollout: null,
    rollback: null,
    telemetry: null,
    proof: null,
    sourceVersion: null,
    sourceSection: null,
    outcome: null,
    parentId: live.parent,
  };
}

export function deriveLinearPlanningIssues(
  snapshotIssues: readonly SourceDerivedSnapshotIssue[],
  liveIssues: readonly LiveIssue[],
  scopedProjectIds: ReadonlySet<string>,
  policy: LinearSourcePolicy,
  sourceRequirements: readonly SourceRequirement[],
  repositoryRoot: string,
  checksumContract: SourceChecksumContract,
  programScope?: LinearProgramScope,
): SourceDerivedSnapshotIssue[] {
  assertLinearSourcePolicyContracts(policy, sourceRequirements);
  const checksumFindings = verifySourceChecksumContract(
    checksumContract,
    repositoryRoot,
  );
  if (checksumFindings.length) {
    throw new Error(
      checksumFindings
        .map((finding) => `${finding.sourceId}: ${finding.message}`)
        .join("\n"),
    );
  }
  const liveById = new Map(liveIssues.map((issue) => [issue.identifier, issue]));
  const coordination = new Set(policy.coordinationIssueIds);
  const planningDecisions = new Map(
    programScope?.schemaVersion === 3
      ? programScope.projectDocumentDecisionContract.trackedDecisions.map(
          (decision) => [decision.decisionIdentifier, decision] as const,
        )
      : [],
  );
  if ([...planningDecisions.keys()].some((id) => coordination.has(id))) {
    throw new Error("Planning Decision issue cannot also be a coordination issue");
  }
  const sourceById = new Map(
    sourceRequirements.map((source) => [source.requirementId, source]),
  );
  if (sourceById.size !== sourceRequirements.length) {
    throw new Error("Canonical source requirement inventory is duplicated");
  }
  const dispositionBySource = new Map(
    policy.sourceDispositions.map((row) => [row.sourceId, row]),
  );
  for (const disposition of policy.sourceDispositions) {
    for (const issueId of disposition.supersededIssueIds) {
      const issue = liveById.get(issueId);
      if (!issue || active(issue)) {
        throw new Error(
          `${disposition.sourceId} superseded issue ${issueId} is missing or active`,
        );
      }
    }
  }

  const issues: SourceDerivedSnapshotIssue[] = snapshotIssues
    .filter((issue) => {
      const live = liveById.get(issue.id);
      return Boolean(
        live &&
          active(live) &&
          live.projectId !== null &&
          scopedProjectIds.has(live.projectId),
      );
    })
    .map((issue) => ({
      ...issue,
      sourceId: null,
      sourceFamilyId: null,
      dependencies: [],
    }));
  const issueById = new Map(issues.map((issue) => [issue.id, issue]));
  if (issueById.size !== issues.length) {
    throw new Error("Snapshot issue inventory is duplicated");
  }
  const activeScoped = liveIssues.filter(
    (issue) =>
      active(issue) &&
      issue.projectId !== null &&
      scopedProjectIds.has(issue.projectId),
  );
  for (const live of activeScoped) {
    if (!issueById.has(live.identifier)) {
      const issue = newSnapshotIssue(live);
      issues.push(issue);
      issueById.set(issue.id, issue);
    }
  }
  for (const issueId of coordination) {
    const live = liveById.get(issueId);
    const planned = issueById.get(issueId);
    if (!live || !active(live) || !planned) {
      throw new Error(`Coordination issue ${issueId} is missing or inactive`);
    }
    if (!activeScoped.some((candidate) => candidate.parent === issueId)) {
      throw new Error(`Coordination issue ${issueId} has no active native child`);
    }
    planned.kind = "parent";
    planned.sourceId = null;
    planned.sourceFamilyId = null;
  }

  const derivedBySource = new Map<string, string[]>();
  for (const live of activeScoped) {
    if (coordination.has(live.identifier)) continue;
    const planningDecision = planningDecisions.get(live.identifier);
    if (planningDecision) {
      if (
        live.title !== planningDecision.decisionTitle ||
        live.projectId !== planningDecision.decisionProjectId ||
        (planningDecision.resolution === "completed"
          ? live.stateType !== "completed"
          : ["completed", "canceled", "duplicate"].includes(live.stateType))
      ) {
        throw new Error(
          `Planning Decision ${live.identifier} differs from its tracked identity or lifecycle`,
        );
      }
      const planned = issueById.get(live.identifier)!;
      planned.kind = "decision";
      planned.sourceId = null;
      planned.sourceFamilyId = null;
      continue;
    }
    const provenance = live.sourceProvenance;
    if (
      !provenance?.sourceId ||
      !provenance.sourceDocuments.length ||
      (!provenance.section && provenance.sectionBundleCount === null) ||
      !provenance.sourceChecksum
    ) {
      throw new Error(`Active Linear issue ${live.identifier} lacks exact source provenance`);
    }
    for (const sourceDocument of provenance.sourceDocuments) {
      canonicalSourcePath(repositoryRoot, sourceDocument);
    }
    const source = sourceById.get(provenance.sourceId);
    if (
      !source ||
      dispositionBySource.has(source.requirementId) ||
      !requiresLiveOwner(source)
    ) {
      throw new Error(
        `Active Linear issue ${live.identifier} source provenance resolves 0 requirements`,
      );
    }
    if (
      provenance.sourceDocument !== null &&
      source.sourceDoc !== provenance.sourceDocument
    ) {
      throw new Error(
        `Active Linear issue ${live.identifier} source document differs from registered ${source.requirementId}`,
      );
    }
    const expectedChecksum = resolveLinearSourceChecksum(
      source,
      provenance,
      checksumContract,
      repositoryRoot,
    ).sha256;
    if (expectedChecksum !== provenance.sourceChecksum) {
      throw new Error(
        `Active Linear issue ${live.identifier} source slice checksum has drifted`,
      );
    }
    const owners = derivedBySource.get(source.requirementId) ?? [];
    owners.push(live.identifier);
    derivedBySource.set(source.requirementId, owners);
  }
  for (const source of sourceById.values()) {
    if (
      requiresLiveOwner(source) &&
      !dispositionBySource.has(source.requirementId) &&
      !derivedBySource.has(source.requirementId)
    ) {
      throw new Error(
        `Canonical source ${source.requirementId} has no active Linear owner`,
      );
    }
  }

  const splitBySource = new Map(policy.splits.map((row) => [row.sourceId, row]));
  const usedSplits = new Set<string>();
  for (const [sourceId, issueIds] of derivedBySource) {
    const ordered = [...issueIds].sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true }),
    );
    const split = splitBySource.get(sourceId);
    let primaryIssueId: string;
    if (ordered.length === 1) {
      if (split) {
        throw new Error(`Linear source split ${sourceId} is no longer needed`);
      }
      primaryIssueId = ordered[0];
    } else {
      if (!split) {
        throw new Error(`${sourceId} has multiple live issues without split policy`);
      }
      const expected = [split.primaryIssueId, ...split.executableIssueIds].sort(
        (left, right) => left.localeCompare(right, undefined, { numeric: true }),
      );
      if (JSON.stringify(expected) !== JSON.stringify(ordered)) {
        throw new Error(`${sourceId} live issue split has drifted`);
      }
      primaryIssueId = split.primaryIssueId;
      usedSplits.add(sourceId);
    }
    const source = sourceById.get(sourceId)!;
    for (const issueId of ordered) {
      const planned = issueById.get(issueId)!;
      planned.kind = source.disposition;
      planned.sourceVersion = source.sourceVersion;
      const provenance = liveById.get(issueId)!.sourceProvenance!;
      planned.sourceSection = provenance.section ??
        `${provenance.sectionBundleCount} registered slices`;
      planned.outcome = source.outcome;
      planned.sourceFamilyId = sourceId;
      if (issueId === primaryIssueId) planned.sourceId = sourceId;
    }
  }
  if (usedSplits.size !== policy.splits.length) {
    throw new Error("Linear source policy contains an unused split exception");
  }
  for (const issue of issues) {
    if (!liveById.has(issue.id)) {
      throw new Error(`Tracked Linear issue ${issue.id} is missing`);
    }
    if (coordination.has(issue.id) && issue.sourceId !== null) {
      throw new Error(`Coordination issue ${issue.id} became executable`);
    }
  }
  return issues;
}
