#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { descriptionFingerprint } from "./lib/fingerprint.js";
import { canonicalLinearRelationKey } from "./lib/linear-live.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";

interface LiveRelationReference {
  id: string;
}

interface LiveRelations {
  blocks: LiveRelationReference[];
  blockedBy: LiveRelationReference[];
  relatedTo: LiveRelationReference[];
  duplicateOf: LiveRelationReference | null;
}

interface LiveIssue {
  id: string;
  linearId?: string | null;
  title: string;
  description?: string | null;
  updatedAt: string;
  estimate?: { value?: number } | number | null;
  priority?: { value?: number } | number | null;
  archivedAt?: string | null;
  status: string;
  statusType: string;
  labels?: string[];
  assignee?: string | null;
  assigneeId?: string | null;
  team?: string;
  teamKey?: string;
  teamId?: string;
  projectId?: string | null;
  project?: string | null;
  projectMilestone?: { id: string; name: string } | null;
  parentId?: string | null;
  releases?: Array<{ version?: string | null }>;
  relations?: unknown;
}

interface RuntimeDependency {
  requirementId: string;
  dependencies: string[];
}

interface LiveProject {
  id: string;
  name: string;
  updatedAt: string;
  archivedAt?: string | null;
}

interface LiveProjectMilestone {
  id: string;
  name: string;
  projectId: string;
  project: string;
  archivedAt?: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function strictUtcTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_UTC.test(value)) return false;
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

function archiveState(value: unknown, label: string): string | null {
  if (value === undefined) return "unavailable";
  if (value === null || strictUtcTimestamp(value)) return value;
  throw new Error(`${label} archivedAt is invalid`);
}

function issueArchiveState(issue: LiveIssue): string | null {
  const state = archiveState(issue.archivedAt, `Linear issue ${issue.id}`);
  return state === null && issue.linearId == null ? "unavailable" : state;
}

function estimateValue(value: LiveIssue["estimate"]): number | null {
  if (typeof value === "number") return value;
  return value?.value ?? null;
}

function priorityValue(value: LiveIssue["priority"]): number | null {
  if (typeof value === "number") return value;
  return value?.value ?? null;
}

function liveRelationKeys(issue: LiveIssue): string[] {
  const value = issue.relations;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Linear issue ${issue.id} relations are invalid`);
  }
  const relations = value as Partial<LiveRelations>;
  const keys = new Set<string>();
  for (const field of ["blocks", "blockedBy", "relatedTo"] as const) {
    const references = relations[field];
    if (!Array.isArray(references)) {
      throw new Error(`Linear issue ${issue.id} relations are invalid`);
    }
    for (const reference of references) {
      if (
        !reference ||
        typeof reference !== "object" ||
        typeof reference.id !== "string" ||
        !reference.id.trim()
      ) {
        throw new Error(`Linear issue ${issue.id} relations are invalid`);
      }
      keys.add(canonicalLinearRelationKey(field, issue.id, reference.id));
    }
  }
  if (relations.duplicateOf !== null) {
    const reference = relations.duplicateOf;
    if (
      !reference ||
      typeof reference !== "object" ||
      typeof reference.id !== "string" ||
      !reference.id.trim()
    ) {
      throw new Error(`Linear issue ${issue.id} relations are invalid`);
    }
    keys.add(canonicalLinearRelationKey("duplicateOf", issue.id, reference.id));
  }
  return [...keys].sort();
}

function liveTeamKey(issue: LiveIssue): string {
  const derived = /^([A-Z][A-Z0-9]*)-\d+$/.exec(issue.id)?.[1];
  const explicit = issue.teamKey?.trim();
  if (explicit) {
    if (!/^[A-Z][A-Z0-9]*$/.test(explicit)) {
      throw new Error(`Linear issue ${issue.id} team key is invalid`);
    }
    if (derived && explicit !== derived) {
      throw new Error(
        `Linear issue ${issue.id} team key ${explicit} does not match ${derived}`,
      );
    }
    return explicit;
  }
  if (derived) return derived;
  throw new Error(`Linear issue ${issue.id} requires an explicit team key`);
}

const root = resolve(process.argv[2] ?? ".");
const livePath = process.argv[3];
const projectScopeFlagIndex = process.argv.indexOf("--linear-project-scope");
if (
  projectScopeFlagIndex >= 0 &&
  !process.argv[projectScopeFlagIndex + 1]
) {
  throw new Error("--linear-project-scope requires a path");
}
const projectScopePath = projectScopeFlagIndex >= 0
  ? resolve(process.argv[projectScopeFlagIndex + 1])
  : resolve(root, "delivery/linear-project-scope.json");
const snapshotPath = resolve(root, "delivery/linear-snapshot.json");
const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
const projectScope = JSON.parse(
  readFileSync(projectScopePath, "utf8"),
) as LinearProjectScope;
const live = JSON.parse(readFileSync(livePath ? resolve(livePath) : 0, "utf8")) as {
  issues: LiveIssue[];
  releasePipelines: Array<Record<string, any>>;
  releases: Array<Record<string, any>>;
  projects: LiveProject[];
  projectMilestones: LiveProjectMilestone[];
};
if (!Array.isArray(live.projects) || live.projects.length === 0) {
  throw new Error("Live Linear projects inventory is required");
}
if (!Array.isArray(live.projectMilestones) || !live.projectMilestones.length) {
  throw new Error("Live Linear project milestones inventory is required");
}
const trackedProjects = Array.isArray(snapshot.projects)
  ? snapshot.projects as Array<Record<string, unknown>>
  : [];
const trackedProjectIds = assertLinearProjectScope(
  projectScope,
  trackedProjects as Array<{ id: string }>,
);
const trackedProjectIdSet = new Set(trackedProjectIds);
for (const projectId of [...trackedProjectIdSet].sort()) {
  const count = live.projects.filter((project) => project.id === projectId).length;
  if (count === 0) {
    throw new Error(`Tracked Linear project ${projectId} is missing`);
  }
  if (count > 1) {
    throw new Error(`Tracked Linear project ${projectId} is duplicated`);
  }
}
const scopedProjects = live.projects.filter((project) =>
  trackedProjectIdSet.has(project.id)
);
assertLinearProjectScope(projectScope, scopedProjects);
const allProjectById = new Map(
  live.projects.map((project) => [project.id, project]),
);
if (
  live.projects.some(
    (project) =>
      !project.id?.trim() ||
      !project.name?.trim() ||
      !strictUtcTimestamp(project.updatedAt) ||
      (project.archivedAt !== undefined &&
        project.archivedAt !== null &&
        !strictUtcTimestamp(project.archivedAt)),
  )
) {
  throw new Error("Live Linear projects inventory is incomplete or duplicate");
}
const scopedMilestones = live.projectMilestones.filter((milestone) =>
  trackedProjectIdSet.has(milestone.projectId)
);
const allMilestoneById = new Map(
  live.projectMilestones.map((milestone) => [milestone.id, milestone]),
);
if (
  live.projectMilestones.some(
    (milestone) =>
      !milestone.id?.trim() ||
      !milestone.name?.trim() ||
      !milestone.projectId?.trim() ||
      !milestone.project?.trim() ||
      live.projects.find((project) => project.id === milestone.projectId)
        ?.name !== milestone.project,
  ) ||
  new Set(scopedMilestones.map((milestone) => milestone.id)).size !==
    scopedMilestones.length ||
  new Set(
      scopedMilestones.map((milestone) =>
        `${milestone.projectId}:${milestone.name}`
      ),
    ).size !== scopedMilestones.length
) {
  throw new Error(
    "Live Linear project milestones inventory is incomplete or duplicate",
  );
}
for (const issue of live.issues) {
  if (!strictUtcTimestamp(issue.updatedAt)) {
    throw new Error(`Linear issue ${issue.id} updatedAt is invalid`);
  }
  if (
    issue.linearId !== undefined &&
    issue.linearId !== null &&
    !UUID.test(issue.linearId)
  ) {
    throw new Error(`Linear issue ${issue.id} stable Linear ID is invalid`);
  }
  const priority = priorityValue(issue.priority);
  if (!Number.isInteger(priority) || priority! < 0 || priority! > 4) {
    throw new Error(`Linear issue ${issue.id} priority is invalid`);
  }
  issueArchiveState(issue);
  const assignee = issue.assignee ?? null;
  const assigneeId = issue.assigneeId ?? null;
  if (
    (assignee === null) !== (assigneeId === null) ||
    (assignee !== null && (!assignee.trim() || !assigneeId!.trim()))
  ) {
    throw new Error(`Linear issue ${issue.id} assignee identity is incomplete`);
  }
  issue.assignee = assignee;
  issue.assigneeId = assigneeId;
  if (!issue.teamId?.trim()) {
    throw new Error(`Linear issue ${issue.id} team identity is incomplete`);
  }
  if (Boolean(issue.projectId) !== Boolean(issue.project)) {
    throw new Error(`Linear issue ${issue.id} has partial project identity`);
  }
  if (issue.projectId) {
    const project = allProjectById.get(issue.projectId);
    if (!project || project.name !== issue.project) {
      throw new Error(`Linear issue ${issue.id} references an unknown project`);
    }
  }
  if (issue.projectMilestone) {
    const milestone = allMilestoneById.get(issue.projectMilestone.id);
    if (
      !issue.projectId ||
      !milestone ||
      milestone.name !== issue.projectMilestone.name ||
      milestone.projectId !== issue.projectId ||
      milestone.project !== issue.project
    ) {
      throw new Error(`Linear issue ${issue.id} references an unknown milestone`);
    }
  }
}
const runtime = JSON.parse(
  readFileSync(
    resolve(root, "delivery/runtime-gate-dependencies.json"),
    "utf8",
  ),
) as { dependencies: RuntimeDependency[] };

const issueBySource = new Map<string, string>();
for (const issue of snapshot.issues) {
  if (!issue.sourceId) continue;
  issueBySource.set(issue.sourceId, issue.id);
}
const liveById = new Map(live.issues.map((issue) => [issue.id, issue]));
const missingTrackedIssueIds = snapshot.issues
  .map((issue: Record<string, any>) => issue.id as string)
  .filter((issueId: string) => !liveById.has(issueId))
  .sort();
if (missingTrackedIssueIds.length) {
  throw new Error(
    `Tracked Linear issues ${missingTrackedIssueIds.join(", ")} are missing from live input`,
  );
}
const releaseByIssue = new Map(
  live.issues.map((issue) => {
    const releases = (issue.releases ?? [])
      .map((release) => release.version)
      .filter((version): version is string => /^R[0-5]$/.test(version ?? ""));
    if (releases.length > 1) {
      throw new Error(
        `Multiple R0-R5 releases found for Linear issue ${issue.id}: ${releases.join(", ")}`,
      );
    }
    return [issue.id, releases[0] ?? null] as const;
  }),
);
const relationsById = new Map(
  live.issues.map((issue) => [issue.id, new Set<string>()]),
);
for (const issue of live.issues) {
  for (const relation of liveRelationKeys(issue)) {
    const [, left, right] = relation.split(":");
    for (const endpoint of [left, right]) {
      const endpointRelations = relationsById.get(endpoint);
      if (!endpointRelations) {
        throw new Error(
          `Linear relation endpoint ${endpoint} was not captured`,
        );
      }
      endpointRelations.add(relation);
    }
  }
}
for (const row of runtime.dependencies) {
  const gate = issueBySource.get(row.requirementId);
  if (!gate) throw new Error(`Missing Linear issue for ${row.requirementId}`);
  for (const dependencyId of row.dependencies) {
    const dependency = issueBySource.get(dependencyId);
    if (!dependency) throw new Error(`Missing Linear issue for ${dependencyId}`);
    const relation = `blocks:${dependency}:${gate}`;
    relationsById.get(dependency)?.add(relation);
    relationsById.get(gate)?.add(relation);
  }
}
const sourceByIssue = new Map<string, string>(
  snapshot.issues
    .filter((issue: Record<string, any>) => issue.sourceId)
    .map((issue: Record<string, any>) => [
      issue.id as string,
      issue.sourceId as string,
    ]),
);
const dependenciesByIssue = new Map<string, string[]>(
  snapshot.issues.map((issue: Record<string, any>) => {
    if (!issue.sourceId) {
      return [issue.id, issue.dependencies ?? []] as const;
    }
    const dependencies = new Set<string>();
    for (const dependencyId of issue.dependencies ?? []) {
      if (!issueBySource.has(dependencyId)) dependencies.add(dependencyId);
    }
    for (const relation of relationsById.get(issue.id) ?? []) {
      const [type, prerequisite, dependent] = relation.split(":");
      if (type !== "blocks" || dependent !== issue.id) continue;
      const sourceId = sourceByIssue.get(prerequisite);
      if (!sourceId) {
        throw new Error(
          `Linear source issue ${issue.id} blocker ${prerequisite} has no source mapping`,
        );
      }
      dependencies.add(sourceId);
    }
    return [issue.id, [...dependencies].sort()] as const;
  }),
);

snapshot.generatedAt = new Date().toISOString();
snapshot.issues = snapshot.issues.map((issue: Record<string, any>) => {
  const current = liveById.get(issue.id);
  if (!current) return issue;
  const sourceId = issue.sourceId as string | null;
  return {
    ...issue,
    parentId: current.parentId ?? null,
    title: current.title,
    labels: [...(current.labels ?? [])].sort(),
    release: releaseByIssue.get(issue.id) ?? null,
    milestone: current.projectMilestone?.name ?? null,
    dependencies: sourceId
      ? dependenciesByIssue.get(issue.id) ?? []
      : issue.dependencies,
    owner: current.assignee ?? null,
    estimate: estimateValue(current.estimate),
  };
});

snapshot.releases = live.releases
  .map((release) => ({
    id: release.id,
    version: release.version,
    name: release.name,
    pipeline: release.pipeline?.name ?? null,
    stage: release.stage?.name ?? null,
    startDate: release.startDate ?? null,
    targetDate: release.targetDate ?? null,
    updatedAt: release.updatedAt,
  }))
  .sort((left, right) => left.version.localeCompare(right.version));

const existingProjectById = new Map<string, Record<string, unknown>>(
  (Array.isArray(snapshot.projects) ? snapshot.projects : [])
    .filter((project: Record<string, unknown>) => typeof project.id === "string")
    .map((project: Record<string, unknown>) => [project.id as string, project]),
);
const existingMilestoneById = new Map<string, Record<string, unknown>>(
  (Array.isArray(snapshot.milestones) ? snapshot.milestones : [])
    .filter(
      (milestone: Record<string, unknown>) => typeof milestone.id === "string",
    )
    .map((milestone: Record<string, unknown>) => [
      milestone.id as string,
      milestone,
    ]),
);
snapshot.projects = scopedProjects
  .map((project) => ({
    ...(existingProjectById.get(project.id) ?? {}),
    ...project,
  }))
  .sort((left, right) => left.id.localeCompare(right.id));
snapshot.milestones = scopedMilestones
  .map(({ id, name, projectId, project }) => ({
    ...(existingMilestoneById.get(id) ?? {}),
    id,
    name,
    projectId,
    project,
  }))
  .sort((left, right) => left.id.localeCompare(right.id));

snapshot.linearFingerprint = {
  issues: live.issues
    .map((issue) => {
      const liveRelease = releaseByIssue.get(issue.id) ?? null;
      return {
        linearId: issue.linearId ?? null,
        identifier: issue.id,
        title: issue.title,
        descriptionFingerprint: descriptionFingerprint(issue.description),
        updatedAt: issue.updatedAt,
        estimate: estimateValue(issue.estimate),
        priority: priorityValue(issue.priority),
        archivedAt: issueArchiveState(issue),
        state: issue.status,
        stateType: issue.statusType,
        labels: [...(issue.labels ?? [])].sort(),
        assignee: issue.assignee ?? null,
        assigneeId: issue.assigneeId ?? null,
        team: liveTeamKey(issue),
        teamId: issue.teamId!,
        projectId: issue.projectId ?? null,
        project: issue.project ?? null,
        milestoneId: issue.projectMilestone?.id ?? null,
        milestone: issue.projectMilestone?.name ?? null,
        parent: issue.parentId ?? null,
        releases: liveRelease ? [liveRelease] : [],
        relations: [...(relationsById.get(issue.id) ?? [])].sort(),
      };
    })
    .sort((left, right) => left.identifier.localeCompare(right.identifier)),
  releasePipelines: live.releasePipelines
    .map((pipeline) => {
      if (!strictUtcTimestamp(pipeline.updatedAt)) {
        throw new Error(`Linear release pipeline ${pipeline.id} updatedAt is invalid`);
      }
      const teams = (pipeline.teams ?? []).map((team: any) => {
        if (!team?.id?.trim() || !team?.key?.trim()) {
          throw new Error(`Linear release pipeline ${pipeline.id} team identity is incomplete`);
        }
        return { id: team.id, key: team.key };
      }).sort((left: any, right: any) => left.id.localeCompare(right.id));
      const stages = (pipeline.stages ?? []).map((stage: any) => {
        if (
          !stage?.id?.trim() ||
          !stage?.name?.trim() ||
          !stage?.type?.trim() ||
          typeof stage.position !== "number" ||
          !Number.isFinite(stage.position) ||
          typeof stage.frozen !== "boolean"
        ) {
          throw new Error(`Linear release pipeline ${pipeline.id} stage is incomplete`);
        }
        return {
          id: stage.id,
          name: stage.name,
          type: stage.type,
          archivedAt: archiveState(
            stage.archivedAt,
            `Linear release stage ${stage.id}`,
          ),
          position: stage.position,
          frozen: stage.frozen,
        };
      }).sort((left: any, right: any) => left.id.localeCompare(right.id));
      return {
        id: pipeline.id,
        name: pipeline.name,
        updatedAt: pipeline.updatedAt,
        archivedAt: archiveState(
          pipeline.archivedAt,
          `Linear release pipeline ${pipeline.id}`,
        ),
        type: pipeline.type,
        isProduction: pipeline.isProduction,
        teams,
        stages,
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id)),
  releases: live.releases
    .map((release) => {
      if (!strictUtcTimestamp(release.updatedAt)) {
        throw new Error(`Linear release ${release.id} updatedAt is invalid`);
      }
      return {
        id: release.id,
        name: release.name,
        version: release.version,
        updatedAt: release.updatedAt,
        archivedAt: archiveState(
          release.archivedAt,
          `Linear release ${release.id}`,
        ),
        pipeline: release.pipeline.id,
        stage: release.stage.id,
        stageType: release.stage.type,
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id)),
  projects: scopedProjects
    .map((project) => ({
      ...project,
      archivedAt: archiveState(
        project.archivedAt,
        `Linear project ${project.id}`,
      ),
    }))
    .sort((left, right) => left.id.localeCompare(right.id)),
  projectMilestones: scopedMilestones
    .map(({ id, name, projectId, project, archivedAt }) => ({
      id,
      name,
      projectId,
      project,
      archivedAt: archiveState(
        archivedAt,
        `Linear project milestone ${id}`,
      ),
    }))
    .sort((left, right) => left.id.localeCompare(right.id)),
};

writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({ issues: snapshot.issues.length, releases: snapshot.releases.length })}\n`,
);
