#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { descriptionFingerprint } from "./lib/fingerprint.js";
import { canonicalLinearRelationKey } from "./lib/linear-live.js";

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
  title: string;
  description?: string | null;
  updatedAt: string;
  estimate?: { value?: number } | number | null;
  status: string;
  statusType: string;
  labels?: string[];
  assignee?: string | null;
  team?: string;
  project?: string | null;
  projectMilestone?: { name: string } | null;
  parentId?: string | null;
  releases?: Array<{ version?: string | null }>;
  relations?: unknown;
}

interface RuntimeDependency {
  requirementId: string;
  dependencies: string[];
}

function estimateValue(value: LiveIssue["estimate"]): number | null {
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

const root = resolve(process.argv[2] ?? ".");
const livePath = process.argv[3];
const snapshotPath = resolve(root, "delivery/linear-snapshot.json");
const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
const live = JSON.parse(readFileSync(livePath ? resolve(livePath) : 0, "utf8")) as {
  issues: LiveIssue[];
  releasePipelines: Array<Record<string, any>>;
  releases: Array<Record<string, any>>;
};
const runtime = JSON.parse(
  readFileSync(
    resolve(root, "delivery/runtime-gate-dependencies.json"),
    "utf8",
  ),
) as { dependencies: RuntimeDependency[] };

const runtimeBySource = new Map(
  runtime.dependencies.map((row) => [row.requirementId, row.dependencies]),
);
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
    dependencies: sourceId?.startsWith("RG:")
      ? runtimeBySource.get(sourceId) ?? []
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

const priorFingerprintById = new Map(
  snapshot.linearFingerprint.issues.map((issue: Record<string, any>) => [
    issue.identifier,
    issue,
  ]),
);
const relationsById = new Map(
  live.issues.map((issue) => [issue.id, new Set(liveRelationKeys(issue))]),
);
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

snapshot.linearFingerprint = {
  issues: live.issues
    .map((issue) => {
      const prior = priorFingerprintById.get(issue.id) as Record<string, any> | undefined;
      const liveRelease = releaseByIssue.get(issue.id) ?? null;
      return {
        identifier: issue.id,
        title: issue.title,
        descriptionFingerprint: descriptionFingerprint(issue.description),
        updatedAt: issue.updatedAt,
        estimate: estimateValue(issue.estimate),
        state: issue.status,
        stateType: issue.statusType,
        labels: [...(issue.labels ?? [])].sort(),
        assignee: issue.assignee ?? null,
        team: prior?.team ?? issue.team ?? "",
        project: issue.project ?? null,
        milestone: issue.projectMilestone?.name ?? null,
        parent: issue.parentId ?? null,
        releases: liveRelease ? [liveRelease] : [],
        relations: [...(relationsById.get(issue.id) ?? [])].sort(),
      };
    })
    .sort((left, right) => left.identifier.localeCompare(right.identifier)),
  releasePipelines: live.releasePipelines
    .map((pipeline) => ({
      id: pipeline.id,
      name: pipeline.name,
      updatedAt: pipeline.updatedAt,
      type: pipeline.type,
      isProduction: pipeline.isProduction,
      teams: (pipeline.teams ?? []).map((team: any) => team.key).sort(),
      stages: (pipeline.stages ?? [])
        .map((stage: any) => ({
          id: stage.id,
          name: stage.name,
          type: stage.type,
        }))
        .sort((left: any, right: any) => left.id.localeCompare(right.id)),
    }))
    .sort((left, right) => left.id.localeCompare(right.id)),
  releases: live.releases
    .map((release) => ({
      id: release.id,
      name: release.name,
      version: release.version,
      updatedAt: release.updatedAt,
      pipeline: release.pipeline.id,
      stage: release.stage.id,
      stageType: release.stage.type,
    }))
    .sort((left, right) => left.id.localeCompare(right.id)),
};

writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({ issues: snapshot.issues.length, releases: snapshot.releases.length })}\n`,
);
