#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  applyFeatureDependencies,
  type FeatureDependencyRepair,
} from "./lib/dependencies.js";
import { validateGraph } from "./lib/graph.js";
import {
  canonicalLinearRelationKey,
  type LinearFingerprint,
} from "./lib/linear-live.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";
import type {
  Disposition,
  ManifestRow,
  ReleaseAssignment,
  ReleaseId,
  SourceRequirement,
} from "./lib/model.js";
import { parseFeatureInventory } from "./lib/sources.js";

interface DispositionOverride {
  requirementId: string;
  disposition: Disposition;
}

interface RuntimeDependency {
  requirementId: string;
  dependencies: string[];
}

interface SnapshotMapping {
  id: string;
  sourceId: string | null;
}

interface SnapshotInput {
  issues: SnapshotMapping[];
  linearFingerprint: LinearFingerprint;
}

interface ReleaseChange {
  issueId: string;
  sourceId: string;
  before: string[];
  after: string[];
  beforeReleaseIds: string[];
  afterReleaseIds: string[];
}

interface BlockChange {
  relation: string;
  prerequisiteIssueId: string;
  prerequisiteSourceId: string;
  dependentIssueId: string;
  dependentSourceId: string;
}

interface RelationExpectation {
  issueId: string;
  relations: string[];
}

const RELEASE_SEQUENCE: Record<ReleaseId, number> = {
  R0: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
};

const DISPOSITIONS = new Set<Disposition>([
  "executable",
  "proof_only",
  "narrative_context",
  "superseded",
  "retired_source",
]);

const compare = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name?.startsWith("--") || !value) {
      throw new Error(`Invalid argument near ${name ?? "end"}`);
    }
    if (values.has(name)) throw new Error(`Duplicate argument ${name}`);
    values.set(name, value);
  }
  return values;
}

function unique(values: readonly string[], label: string): string[] {
  if (values.some((value) => typeof value !== "string" || !value.trim())) {
    throw new Error(`${label} contains an empty value`);
  }
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} contains duplicate values`);
  }
  return [...values].sort(compare);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseJson<T>(value: string, label: string): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(`${label} is not valid JSON`, { cause: error });
  }
}

function assertCompleteFingerprint(value: unknown): asserts value is LinearFingerprint {
  if (!value || typeof value !== "object") {
    throw new Error("Complete Linear fingerprint is required");
  }
  const candidate = value as Partial<LinearFingerprint>;
  for (const key of [
    "issues",
    "releasePipelines",
    "releases",
    "projects",
    "projectMilestones",
  ] as const) {
    if (!Array.isArray(candidate[key])) {
      throw new Error(`Complete Linear fingerprint requires ${key}`);
    }
  }
  for (const key of ["projects", "projectMilestones"] as const) {
    if (!candidate[key]?.length) {
      throw new Error(`Complete Linear fingerprint requires non-empty ${key}`);
    }
  }
}

function canonicalRelation(value: string): [string, string, string] {
  const parts = value.split(":");
  if (parts.length !== 3) throw new Error(`Noncanonical Linear relation ${value}`);
  const [type, left, right] = parts;
  const canonical = canonicalLinearRelationKey(type, left, right);
  if (canonical !== value || left === right) {
    throw new Error(`Noncanonical Linear relation ${value}`);
  }
  return [type, left, right];
}

function findCycle(adjacency: Map<string, Set<string>>): string[] | null {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (node: string, trail: string[]): string[] | null => {
    if (visiting.has(node)) {
      const start = trail.indexOf(node);
      return [...trail.slice(start), node];
    }
    if (visited.has(node)) return null;
    visiting.add(node);
    for (const dependent of [...(adjacency.get(node) ?? [])].sort(compare)) {
      const cycle = visit(dependent, [...trail, node]);
      if (cycle) return cycle;
    }
    visiting.delete(node);
    visited.add(node);
    return null;
  };
  for (const node of [...adjacency.keys()].sort(compare)) {
    const cycle = visit(node, []);
    if (cycle) return cycle;
  }
  return null;
}

const argv = argumentsByName();
const root = resolve(argv.get("--root") ?? ".");
const paths = {
  dispositions: resolve(
    root,
    argv.get("--dispositions") ?? "delivery/dispositions.json",
  ),
  featureDependencies: resolve(
    root,
    argv.get("--feature-dependencies") ??
      "delivery/feature-dependencies.json",
  ),
  inventory: resolve(
    root,
    argv.get("--inventory") ?? "_audit/FEATURE_INVENTORY.md",
  ),
  linearProjectScope: resolve(
    root,
    argv.get("--linear-project-scope") ??
      "delivery/linear-project-scope.json",
  ),
  releasePlan: resolve(
    root,
    argv.get("--release-plan") ?? "delivery/release-plan.json",
  ),
  runtimeDependencies: resolve(
    root,
    argv.get("--runtime-dependencies") ??
      "delivery/runtime-gate-dependencies.json",
  ),
  snapshot: resolve(
    root,
    argv.get("--snapshot") ?? "delivery/linear-snapshot.json",
  ),
};
const outArg = argv.get("--out");
if (!outArg) throw new Error("--out is required");
const outPath = resolve(root, outArg);

const raw = {
  dispositions: readFileSync(paths.dispositions, "utf8"),
  featureDependencies: readFileSync(paths.featureDependencies, "utf8"),
  inventory: readFileSync(paths.inventory, "utf8"),
  linearProjectScope: readFileSync(paths.linearProjectScope, "utf8"),
  releasePlan: readFileSync(paths.releasePlan, "utf8"),
  runtimeDependencies: readFileSync(paths.runtimeDependencies, "utf8"),
  snapshot: readFileSync(paths.snapshot, "utf8"),
};

const dispositionInput = parseJson<{ overrides: DispositionOverride[] }>(
  raw.dispositions,
  "Disposition input",
);
if (!Array.isArray(dispositionInput.overrides)) {
  throw new Error("Disposition input requires overrides");
}
const sourceRows = parseFeatureInventory(raw.inventory);
const sourceIds = new Set(sourceRows.map((row) => row.requirementId));
const overrideById = new Map<string, Disposition>();
for (const override of dispositionInput.overrides) {
  if (!sourceIds.has(override.requirementId)) {
    throw new Error(`Disposition references unknown ${override.requirementId}`);
  }
  if (overrideById.has(override.requirementId)) {
    throw new Error(`Duplicate disposition for ${override.requirementId}`);
  }
  if (!DISPOSITIONS.has(override.disposition)) {
    throw new Error(`Invalid disposition for ${override.requirementId}`);
  }
  overrideById.set(override.requirementId, override.disposition);
}

const repairInput = parseJson<{
  schemaVersion: number;
  repairs: FeatureDependencyRepair[];
}>(raw.featureDependencies, "Feature dependency input");
if (repairInput.schemaVersion !== 1 || !Array.isArray(repairInput.repairs)) {
  throw new Error("Feature dependency input must use schemaVersion 1");
}
const features = applyFeatureDependencies(
  sourceRows.map((row) => ({
    ...row,
    disposition: overrideById.get(row.requirementId) ?? row.disposition,
  })),
  repairInput.repairs,
);
const graphFindings = validateGraph(
  features.map<ManifestRow>((feature) => ({
    ...feature,
    release: null,
    issueId: null,
  })),
  [],
);
if (graphFindings.length) {
  throw new Error(
    `Source feature graph invalid: ${graphFindings
      .map((finding) => `${finding.code}: ${finding.message}`)
      .join("; ")}`,
  );
}
const executableIds = new Set(
  features
    .filter((feature) => feature.disposition === "executable")
    .map((feature) => feature.requirementId),
);
const executableFeatures = features
  .filter((feature) => feature.disposition === "executable")
  .map((feature) => ({
    ...feature,
    dependencies: feature.dependencies.filter((dependencyId) =>
      executableIds.has(dependencyId)
    ),
  }))
  .sort((left, right) => compare(left.requirementId, right.requirementId));

const runtimeInput = parseJson<{ dependencies: RuntimeDependency[] }>(
  raw.runtimeDependencies,
  "Runtime dependency input",
);
if (!Array.isArray(runtimeInput.dependencies)) {
  throw new Error("Runtime dependency input requires dependencies");
}
const runtimeById = new Map<string, RuntimeDependency>();
for (const row of runtimeInput.dependencies) {
  if (!row.requirementId?.startsWith("RG:")) {
    throw new Error(`Invalid runtime source ${row.requirementId}`);
  }
  if (runtimeById.has(row.requirementId)) {
    throw new Error(`Duplicate runtime dependency ${row.requirementId}`);
  }
  const dependencies = unique(
    row.dependencies,
    `Runtime source ${row.requirementId} dependencies`,
  );
  if (!dependencies.length) {
    throw new Error(`Runtime source ${row.requirementId} has no behavior owner`);
  }
  for (const dependencyId of dependencies) {
    if (!executableIds.has(dependencyId)) {
      throw new Error(
        `Runtime source ${row.requirementId} references non-executable ${dependencyId}`,
      );
    }
  }
  runtimeById.set(row.requirementId, { ...row, dependencies });
}
const runtimeRows = [...runtimeById.values()].sort((left, right) =>
  compare(left.requirementId, right.requirementId)
);

const expectedSourceIds = new Set([
  ...executableFeatures.map((feature) => feature.requirementId),
  ...runtimeRows.map((row) => row.requirementId),
]);
const releaseInput = parseJson<{ assignments: ReleaseAssignment[] }>(
  raw.releasePlan,
  "Release plan",
);
if (!Array.isArray(releaseInput.assignments)) {
  throw new Error("Release plan requires assignments");
}
const assignmentById = new Map<string, ReleaseAssignment>();
for (const assignment of releaseInput.assignments) {
  if (assignmentById.has(assignment.requirementId)) {
    throw new Error(`Duplicate release assignment ${assignment.requirementId}`);
  }
  if (!expectedSourceIds.has(assignment.requirementId)) {
    throw new Error(`Release plan contains non-executable ${assignment.requirementId}`);
  }
  if (!(assignment.release in RELEASE_SEQUENCE)) {
    throw new Error(`Release plan contains invalid ${assignment.release}`);
  }
  if (!assignment.rationale?.trim()) {
    throw new Error(`Release assignment ${assignment.requirementId} lacks rationale`);
  }
  assignmentById.set(assignment.requirementId, assignment);
}
for (const requirementId of [...expectedSourceIds].sort(compare)) {
  if (!assignmentById.has(requirementId)) {
    throw new Error(`Release plan is missing ${requirementId}`);
  }
}

const sourceGraph: SourceRequirement[] = [
  ...executableFeatures,
  ...runtimeRows.map<SourceRequirement>((row) => ({
    requirementId: row.requirementId,
    outcome: `Prove runtime gate ${row.requirementId.slice(3)}`,
    sourceDoc: "live runtime gate",
    sourceVersion: "live",
    section: "live",
    dependencies: row.dependencies,
    disposition: "proof_only",
  })),
];
const sourceAdjacency = new Map<string, Set<string>>(
  sourceGraph.map((row) => [row.requirementId, new Set<string>()]),
);
for (const row of sourceGraph) {
  const dependentRelease = assignmentById.get(row.requirementId)!.release;
  for (const dependencyId of row.dependencies) {
    if (!expectedSourceIds.has(dependencyId)) {
      throw new Error(`${row.requirementId} depends on unknown ${dependencyId}`);
    }
    sourceAdjacency.get(dependencyId)!.add(row.requirementId);
    const dependencyRelease = assignmentById.get(dependencyId)!.release;
    if (
      RELEASE_SEQUENCE[dependencyRelease] > RELEASE_SEQUENCE[dependentRelease]
    ) {
      throw new Error(
        `Cross-release inversion: ${row.requirementId} ${dependentRelease} depends on ${dependencyId} ${dependencyRelease}`,
      );
    }
  }
}
const sourceCycle = findCycle(sourceAdjacency);
if (sourceCycle) {
  throw new Error(`Source dependency cycle: ${sourceCycle.join(" -> ")}`);
}

const snapshot = parseJson<SnapshotInput>(raw.snapshot, "Linear snapshot");
if (!Array.isArray(snapshot.issues)) {
  throw new Error("Linear snapshot requires issue mappings");
}
assertCompleteFingerprint(snapshot.linearFingerprint);
const projectScope = parseJson<LinearProjectScope>(
  raw.linearProjectScope,
  "Linear project scope",
);
const trackedProjectIds = new Set(
  assertLinearProjectScope(projectScope, snapshot.linearFingerprint.projects),
);
const projectById = new Map(
  snapshot.linearFingerprint.projects.map((project) => [project.id, project]),
);
const milestoneIds = new Set<string>();
const milestoneNames = new Set<string>();
for (const milestone of snapshot.linearFingerprint.projectMilestones) {
  const project = projectById.get(milestone.projectId);
  const scopedName = `${milestone.projectId}:${milestone.name}`;
  if (
    !milestone.id?.trim() ||
    !milestone.name?.trim() ||
    !milestone.updatedAt ||
    Number.isNaN(Date.parse(milestone.updatedAt)) ||
    milestoneIds.has(milestone.id) ||
    milestoneNames.has(scopedName) ||
    !trackedProjectIds.has(milestone.projectId) ||
    !project ||
    project.name !== milestone.project
  ) {
    throw new Error("Linear project milestone fingerprint is incomplete or inconsistent");
  }
  milestoneIds.add(milestone.id);
  milestoneNames.add(scopedName);
}
const liveById = new Map<string, LinearFingerprint["issues"][number]>();
const relationsByIssue = new Map<string, Set<string>>();
for (const issue of snapshot.linearFingerprint.issues) {
  if (!issue.identifier?.trim() || liveById.has(issue.identifier)) {
    throw new Error(`Linear fingerprint has duplicate or empty issue ${issue.identifier}`);
  }
  if (!issue.updatedAt || Number.isNaN(Date.parse(issue.updatedAt))) {
    throw new Error(`Linear issue ${issue.identifier} has invalid updatedAt`);
  }
  const releases = unique(issue.releases, `Linear issue ${issue.identifier} releases`);
  const relations = unique(
    issue.relations,
    `Linear issue ${issue.identifier} relations`,
  );
  liveById.set(issue.identifier, { ...issue, releases, relations });
  relationsByIssue.set(issue.identifier, new Set(relations));
}
const allRelations = new Set(
  [...relationsByIssue.values()].flatMap((relations) => [...relations]),
);
for (const relation of [...allRelations].sort(compare)) {
  const [, left, right] = canonicalRelation(relation);
  if (!liveById.has(left) || !liveById.has(right)) {
    throw new Error(`Relation ${relation} has an uncaptured endpoint`);
  }
  if (
    !relationsByIssue.get(left)!.has(relation) ||
    !relationsByIssue.get(right)!.has(relation)
  ) {
    throw new Error(`Relation ${relation} is not present on both endpoints`);
  }
}

const releaseIdByMembership = new Map<string, string>();
const releaseIds = new Set<string>();
for (const release of snapshot.linearFingerprint.releases) {
  if (!release.id?.trim() || releaseIds.has(release.id)) {
    throw new Error(`Linear fingerprint has duplicate or empty release ${release.id}`);
  }
  releaseIds.add(release.id);
  const membership = release.version ?? release.id;
  if (releaseIdByMembership.has(membership)) {
    throw new Error(`Linear fingerprint has duplicate release membership ${membership}`);
  }
  releaseIdByMembership.set(membership, release.id);
}
for (const issue of liveById.values()) {
  for (const membership of issue.releases) {
    if (!releaseIdByMembership.has(membership)) {
      throw new Error(
        `Linear issue ${issue.identifier} references uncaptured release ${membership}`,
      );
    }
  }
}

const mappingRowsBySource = new Map<string, SnapshotMapping[]>();
const snapshotIssueIds = new Set<string>();
for (const mapping of snapshot.issues) {
  if (!mapping.id?.trim() || snapshotIssueIds.has(mapping.id)) {
    throw new Error(`Linear snapshot has duplicate or empty mapping ${mapping.id}`);
  }
  snapshotIssueIds.add(mapping.id);
  if (!mapping.sourceId) continue;
  const rows = mappingRowsBySource.get(mapping.sourceId) ?? [];
  rows.push(mapping);
  mappingRowsBySource.set(mapping.sourceId, rows);
}
const issueBySource = new Map<string, string>();
const sourceByIssue = new Map<string, string>();
for (const requirementId of [...expectedSourceIds].sort(compare)) {
  const rows = mappingRowsBySource.get(requirementId) ?? [];
  const kind = requirementId.startsWith("RG:") ? "Runtime" : "Executable";
  if (!rows.length) {
    throw new Error(`${kind} source ${requirementId} has no Linear mapping`);
  }
  if (rows.length > 1) {
    throw new Error(`${kind} source ${requirementId} has duplicate Linear mappings`);
  }
  const issueId = rows[0].id;
  if (!liveById.has(issueId)) {
    throw new Error(`${kind} source ${requirementId} maps to uncaptured ${issueId}`);
  }
  const priorSource = sourceByIssue.get(issueId);
  if (priorSource) {
    throw new Error(`Linear issue ${issueId} maps both ${priorSource} and ${requirementId}`);
  }
  issueBySource.set(requirementId, issueId);
  sourceByIssue.set(issueId, requirementId);
}

const activeIssueIds = new Set(issueBySource.values());
for (const relation of [...allRelations].sort(compare)) {
  const [type, prerequisiteIssueId, dependentIssueId] = relation.split(":");
  if (
    type !== "blocks" ||
    !activeIssueIds.has(prerequisiteIssueId) ||
    !activeIssueIds.has(dependentIssueId)
  ) {
    continue;
  }
  const prerequisiteSourceId = sourceByIssue.get(prerequisiteIssueId)!;
  const dependentSourceId = sourceByIssue.get(dependentIssueId)!;
  const prerequisiteRelease = assignmentById.get(prerequisiteSourceId)!.release;
  const dependentRelease = assignmentById.get(dependentSourceId)!.release;
  if (
    RELEASE_SEQUENCE[prerequisiteRelease] >
      RELEASE_SEQUENCE[dependentRelease]
  ) {
    throw new Error(
      `Active mapped block ${relation} inverts releases: ${prerequisiteSourceId} ${prerequisiteRelease} blocks ${dependentSourceId} ${dependentRelease}`,
    );
  }
}

const desiredBlocks = new Map<string, BlockChange>();
for (const row of sourceGraph) {
  for (const dependencyId of row.dependencies) {
    const prerequisiteIssueId = issueBySource.get(dependencyId)!;
    const dependentIssueId = issueBySource.get(row.requirementId)!;
    const relation = canonicalLinearRelationKey(
      "blocks",
      prerequisiteIssueId,
      dependentIssueId,
    );
    desiredBlocks.set(relation, {
      relation,
      prerequisiteIssueId,
      prerequisiteSourceId: dependencyId,
      dependentIssueId,
      dependentSourceId: row.requirementId,
    });
  }
}
const blockAdditions = [...desiredBlocks.values()]
  .filter(
    (change) =>
      !relationsByIssue.get(change.prerequisiteIssueId)!.has(change.relation),
  )
  .sort((left, right) => compare(left.relation, right.relation));

const linearAdjacency = new Map<string, Set<string>>(
  [...activeIssueIds].map((issueId) => [issueId, new Set<string>()]),
);
for (const relation of allRelations) {
  const [type, prerequisite, dependent] = relation.split(":");
  if (
    type === "blocks" &&
    activeIssueIds.has(prerequisite) &&
    activeIssueIds.has(dependent)
  ) {
    linearAdjacency.get(prerequisite)!.add(dependent);
  }
}
for (const change of blockAdditions) {
  linearAdjacency.get(change.prerequisiteIssueId)!.add(change.dependentIssueId);
}
const linearCycle = findCycle(linearAdjacency);
if (linearCycle) {
  throw new Error(
    `Planned Linear blocks create a cycle: ${linearCycle.join(" -> ")}`,
  );
}

const releaseChanges: ReleaseChange[] = [];
for (const requirementId of [...expectedSourceIds].sort(compare)) {
  const issueId = issueBySource.get(requirementId)!;
  const issue = liveById.get(issueId)!;
  const release = assignmentById.get(requirementId)!.release;
  const before = [...issue.releases].sort();
  for (const membership of before) {
    if (!/^R[0-5]$/.test(membership)) {
      throw new Error(
        `Linear issue ${issueId} has ungoverned release ${membership}`,
      );
    }
  }
  const targetReleaseId = releaseIdByMembership.get(release);
  if (!targetReleaseId) {
    throw new Error(`Linear fingerprint has no release identity for ${release}`);
  }
  const after = [release];
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    releaseChanges.push({
      issueId,
      sourceId: requirementId,
      before,
      after,
      beforeReleaseIds: before.map((membership) =>
        releaseIdByMembership.get(membership)!
      ),
      afterReleaseIds: [targetReleaseId],
    });
  }
}
releaseChanges.sort((left, right) => compare(left.issueId, right.issueId));

const relationIssueIds = new Set(
  blockAdditions.flatMap((change) => [
    change.prerequisiteIssueId,
    change.dependentIssueId,
  ]),
);
const expectedRelationsByIssue: RelationExpectation[] = [
  ...relationIssueIds,
]
  .sort(compare)
  .map((issueId) => ({
    issueId,
    relations: [
      ...(relationsByIssue.get(issueId) ?? []),
      ...blockAdditions
        .filter(
          (change) =>
            change.prerequisiteIssueId === issueId ||
            change.dependentIssueId === issueId,
        )
        .map((change) => change.relation),
    ].sort(compare),
  }));
const rollbackRelationsByIssue: RelationExpectation[] = [
  ...relationIssueIds,
]
  .sort(compare)
  .map((issueId) => ({
    issueId,
    relations: [...(relationsByIssue.get(issueId) ?? [])].sort(compare),
  }));
const guardedIssueIds = new Set([
  ...releaseChanges.map((change) => change.issueId),
  ...relationIssueIds,
]);

const plan = {
  schemaVersion: 1,
  inputSha256: {
    dispositions: sha256(raw.dispositions),
    featureDependencies: sha256(raw.featureDependencies),
    inventory: sha256(raw.inventory),
    linearProjectScope: sha256(raw.linearProjectScope),
    releasePlan: sha256(raw.releasePlan),
    runtimeDependencies: sha256(raw.runtimeDependencies),
    snapshot: sha256(raw.snapshot),
  },
  guards: {
    issues: [...guardedIssueIds].sort(compare).map((issueId) => ({
      issueId,
      updatedAt: liveById.get(issueId)!.updatedAt,
    })),
  },
  releaseChanges,
  blockAdditions,
  expectedRelationsByIssue,
  rollback: {
    releaseChanges: releaseChanges.map((change) => ({
      issueId: change.issueId,
      sourceId: change.sourceId,
      before: change.after,
      after: change.before,
      beforeReleaseIds: change.afterReleaseIds,
      afterReleaseIds: change.beforeReleaseIds,
    })),
    blockRemovals: blockAdditions,
    expectedRelationsByIssue: rollbackRelationsByIssue,
  },
};

writeFileSync(outPath, `${JSON.stringify(plan, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ out: outPath })}\n`);
