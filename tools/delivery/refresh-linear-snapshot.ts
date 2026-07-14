#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

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
}

interface RuntimeDependency {
  requirementId: string;
  dependencies: string[];
}

function descriptionFingerprint(value: string | null | undefined): string {
  let hash = 0x811c9dc5;
  for (const character of (value ?? "").slice(0, 400)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function estimateValue(value: LiveIssue["estimate"]): number | null {
  if (typeof value === "number") return value;
  return value?.value ?? null;
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
const releasePlan = JSON.parse(
  readFileSync(resolve(root, "delivery/release-plan.json"), "utf8"),
) as { assignments: Array<{ requirementId: string; release: string }> };
const runtime = JSON.parse(
  readFileSync(
    resolve(root, "delivery/runtime-gate-dependencies.json"),
    "utf8",
  ),
) as { dependencies: RuntimeDependency[] };

const releaseBySource = new Map(
  releasePlan.assignments.map((row) => [row.requirementId, row.release]),
);
const runtimeBySource = new Map(
  runtime.dependencies.map((row) => [row.requirementId, row.dependencies]),
);
const sourceByIssue = new Map<string, string>();
const issueBySource = new Map<string, string>();
for (const issue of snapshot.issues) {
  if (!issue.sourceId) continue;
  sourceByIssue.set(issue.id, issue.sourceId);
  issueBySource.set(issue.sourceId, issue.id);
}
const liveById = new Map(live.issues.map((issue) => [issue.id, issue]));

snapshot.generatedAt = new Date().toISOString();
snapshot.issues = snapshot.issues.map((issue: Record<string, any>) => {
  const current = liveById.get(issue.id);
  if (!current) return issue;
  const sourceId = issue.sourceId as string | null;
  return {
    ...issue,
    title: current.title,
    labels: [...(current.labels ?? [])].sort(),
    release: sourceId ? releaseBySource.get(sourceId) ?? issue.release : issue.release,
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
const relationsById = new Map<string, Set<string>>();
for (const issue of live.issues) {
  const prior = priorFingerprintById.get(issue.id) as Record<string, any> | undefined;
  relationsById.set(
    issue.id,
    new Set(
      (prior?.relations ?? []).filter((key: string) => {
        const [, left, right] = key.split(":");
        return !sourceByIssue.get(left)?.startsWith("RG:") &&
          !sourceByIssue.get(right)?.startsWith("RG:");
      }),
    ),
  );
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

snapshot.linearFingerprint = {
  issues: live.issues
    .map((issue) => {
      const prior = priorFingerprintById.get(issue.id) as Record<string, any> | undefined;
      const sourceId = sourceByIssue.get(issue.id);
      const liveReleases = (issue.releases ?? [])
        .map((release) => release.version)
        .filter(Boolean);
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
        releases: (liveReleases.length
          ? liveReleases
          : sourceId
            ? [releaseBySource.get(sourceId)]
            : prior?.releases ?? [])
          .filter(Boolean)
          .sort(),
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
