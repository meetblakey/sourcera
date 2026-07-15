#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
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
  ReleaseDefinition,
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

interface LinearReleaseScope {
  schemaVersion: 1;
  evidence: {
    capturedAt: string;
    source: string;
    validationTrigger: string;
  };
  pipeline: {
    id: string;
    name: string;
    type: string;
    plannedStage: {
      id: string;
      name: string;
      position: number;
    };
    teams: Array<{ id: string; key: string }>;
  };
  releases: Array<{ id: string; version: ReleaseId }>;
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

const ARGUMENTS = new Set([
  "--root",
  "--inventory",
  "--dispositions",
  "--feature-dependencies",
  "--runtime-dependencies",
  "--release-plan",
  "--release-catalog",
  "--linear-project-scope",
  "--linear-release-scope",
  "--snapshot",
  "--out",
  "--allow-outside-root",
]);

const PIPELINE_TYPES = new Set(["continuous", "scheduled"]);
const STAGE_TYPES = new Set(["planned", "started", "completed", "canceled"]);
const ISSUE_STATE_TYPES = new Set([
  "triage",
  "backlog",
  "unstarted",
  "started",
  "completed",
  "canceled",
]);

const compare = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true });

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name?.startsWith("--")) {
      throw new Error(`Invalid argument near ${name ?? "end"}`);
    }
    if (!ARGUMENTS.has(name)) throw new Error(`Unknown argument ${name}`);
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${name}`);
    }
    if (values.has(name)) throw new Error(`Duplicate argument ${name}`);
    values.set(name, value);
  }
  return values;
}

function outputIdentity(path: string): string {
  const parent = realpathSync(dirname(path));
  return resolve(parent, basename(path));
}

function existingOutputNode(path: string): ReturnType<typeof lstatSync> | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function sameFilesystemObject(left: string, right: string): boolean {
  if (!existsSync(left) || !existsSync(right)) return false;
  const leftIdentity = statSync(left, { bigint: true });
  const rightIdentity = statSync(right, { bigint: true });
  return leftIdentity.dev === rightIdentity.dev &&
    leftIdentity.ino === rightIdentity.ino;
}

function inside(root: string, path: string): boolean {
  const difference = relative(root, path);
  return difference === "" ||
    (difference !== ".." &&
      !difference.startsWith(`..${sep}`) &&
      !isAbsolute(difference));
}

function atomicWrite(path: string, contents: string): void {
  const temporary = resolve(
    dirname(path),
    `.${basename(path)}.tmp-${process.pid}-${randomUUID()}`,
  );
  let descriptor: number | null = null;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    writeFileSync(descriptor, contents);
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;
    renameSync(temporary, path);
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    if (existsSync(temporary)) unlinkSync(temporary);
  }
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
  for (const key of [
    "issues",
    "releasePipelines",
    "releases",
    "projects",
    "projectMilestones",
  ] as const) {
    if (!candidate[key]?.length) {
      throw new Error(`Complete Linear fingerprint requires non-empty ${key}`);
    }
  }
}

function validText(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim());
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function validUtcTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_UTC.test(value)) return false;
  try {
    return new Date(value).toISOString() === value;
  } catch {
    return false;
  }
}

function assertReleaseCatalog(value: unknown): ReleaseDefinition[] {
  const releases = (value as { releases?: unknown })?.releases;
  const expected = Object.keys(RELEASE_SEQUENCE) as ReleaseId[];
  if (
    !Array.isArray(releases) ||
    releases.length !== expected.length ||
    releases.some((row, index) => {
      const candidate = row as Partial<ReleaseDefinition> | null;
      return !candidate ||
        candidate.id !== expected[index] ||
        candidate.sequence !== index;
    })
  ) {
    throw new Error("Release catalog must contain exact R0-R5 sequence");
  }
  for (const row of releases as ReleaseDefinition[]) {
    if (
      !validText(row.name) ||
      !validText(row.customerHypothesis) ||
      !validText(row.operationalHypothesis) ||
      !validText(row.pilot) ||
      !Array.isArray(row.metrics) ||
      !row.metrics.length ||
      row.metrics.some((metric) => !validText(metric)) ||
      new Set(row.metrics).size !== row.metrics.length ||
      !validText(row.customerGate) ||
      !validText(row.operationalGate)
    ) {
      throw new Error(`Release catalog ${row.id} is incomplete`);
    }
  }
  return releases as ReleaseDefinition[];
}

function assertLinearReleaseScope(value: unknown): LinearReleaseScope {
  const scope = value as Partial<LinearReleaseScope> | null;
  if (
    !scope ||
    scope.schemaVersion !== 1 ||
    !scope.evidence ||
    !validUtcTimestamp(scope.evidence.capturedAt) ||
    !validText(scope.evidence.source) ||
    !validText(scope.evidence.validationTrigger) ||
    !scope.pipeline ||
    !validText(scope.pipeline.id) ||
    !UUID.test(scope.pipeline.id) ||
    !validText(scope.pipeline.name) ||
    !PIPELINE_TYPES.has(scope.pipeline.type) ||
    !scope.pipeline.plannedStage ||
    !validText(scope.pipeline.plannedStage.id) ||
    !UUID.test(scope.pipeline.plannedStage.id) ||
    !validText(scope.pipeline.plannedStage.name) ||
    typeof scope.pipeline.plannedStage.position !== "number" ||
    !Number.isFinite(scope.pipeline.plannedStage.position)
  ) {
    throw new Error("Linear release scope is incomplete or invalid");
  }
  const teams = scope.pipeline.teams;
  if (
    !Array.isArray(teams) ||
    !teams.length ||
    teams.some(
      (team) =>
        !validText(team?.id) ||
        !UUID.test(team.id) ||
        !validText(team?.key) ||
        !/^[A-Z][A-Z0-9]*$/.test(team.key),
    ) ||
    new Set(teams.map((team) => team.id)).size !== teams.length ||
    new Set(teams.map((team) => team.key)).size !== teams.length
  ) {
    throw new Error("Linear release scope teams are incomplete or duplicated");
  }
  const expected = Object.keys(RELEASE_SEQUENCE) as ReleaseId[];
  if (
    !Array.isArray(scope.releases) ||
    scope.releases.length !== expected.length ||
    scope.releases.some(
      (release, index) =>
        !validText(release?.id) ||
        !UUID.test(release.id) ||
        release.version !== expected[index],
    ) ||
    new Set(scope.releases.map((release) => release.id)).size !==
      scope.releases.length
  ) {
    throw new Error("Linear release scope must contain exact R0-R5 identities");
  }
  return scope as LinearReleaseScope;
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
  linearReleaseScope: resolve(
    root,
    argv.get("--linear-release-scope") ??
      "delivery/linear-release-scope.json",
  ),
  releaseCatalog: resolve(
    root,
    argv.get("--release-catalog") ?? "delivery/releases.json",
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
const allowOutsideRoot = argv.get("--allow-outside-root");
if (allowOutsideRoot !== undefined && allowOutsideRoot !== "true") {
  throw new Error("--allow-outside-root requires true");
}
const requestedOutPath = resolve(root, outArg);
const outputNode = existingOutputNode(requestedOutPath);
if (outputNode?.isSymbolicLink()) {
  throw new Error("Output path cannot be a symlink");
}
if (outputNode && !outputNode.isFile()) {
  throw new Error("Output path must be a regular file");
}
const outPath = outputIdentity(requestedOutPath);
const rootIdentity = realpathSync(root);
if (allowOutsideRoot !== "true" && !inside(rootIdentity, outPath)) {
  throw new Error("Output path must remain inside root");
}
for (const [name, inputPath] of Object.entries(paths)) {
  if (
    realpathSync(inputPath) === outPath ||
    sameFilesystemObject(outPath, inputPath)
  ) {
    throw new Error(`Output path equals input ${name}`);
  }
}

const raw = {
  dispositions: readFileSync(paths.dispositions, "utf8"),
  featureDependencies: readFileSync(paths.featureDependencies, "utf8"),
  inventory: readFileSync(paths.inventory, "utf8"),
  linearProjectScope: readFileSync(paths.linearProjectScope, "utf8"),
  linearReleaseScope: readFileSync(paths.linearReleaseScope, "utf8"),
  releaseCatalog: readFileSync(paths.releaseCatalog, "utf8"),
  releasePlan: readFileSync(paths.releasePlan, "utf8"),
  runtimeDependencies: readFileSync(paths.runtimeDependencies, "utf8"),
  snapshot: readFileSync(paths.snapshot, "utf8"),
};

const releaseCatalog = assertReleaseCatalog(
  parseJson<unknown>(raw.releaseCatalog, "Release catalog"),
);
const releaseCatalogById = new Map(
  releaseCatalog.map((release) => [release.id, release]),
);
const linearReleaseScope = assertLinearReleaseScope(
  parseJson<unknown>(raw.linearReleaseScope, "Linear release scope"),
);

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
const pipelineById = new Map<
  string,
  LinearFingerprint["releasePipelines"][number]
>();
const stageById = new Map<
  string,
  {
    pipelineId: string;
    stage: LinearFingerprint["releasePipelines"][number]["stages"][number];
  }
>();
for (const pipeline of snapshot.linearFingerprint.releasePipelines) {
  if (
    !validText(pipeline.id) ||
    !validText(pipeline.name) ||
    !validUtcTimestamp(pipeline.updatedAt) ||
    !PIPELINE_TYPES.has(pipeline.type) ||
    typeof pipeline.isProduction !== "boolean" ||
    pipelineById.has(pipeline.id)
  ) {
    throw new Error(`Linear release pipeline ${String(pipeline.id)} is invalid or duplicated`);
  }
  if (
    pipeline.archivedAt !== null &&
    !validUtcTimestamp(pipeline.archivedAt)
  ) {
    throw new Error(`Linear release pipeline ${pipeline.id} has invalid archivedAt`);
  }
  if (
    !Array.isArray(pipeline.teams) ||
    !pipeline.teams.length ||
    pipeline.teams.some(
      (team) =>
        !validText(team?.id) ||
        !validText(team?.key) ||
        !/^[A-Z][A-Z0-9]*$/.test(team.key),
    ) ||
    new Set(pipeline.teams.map((team) => team.id)).size !==
      pipeline.teams.length ||
    new Set(pipeline.teams.map((team) => team.key)).size !==
      pipeline.teams.length
  ) {
    throw new Error(`Linear release pipeline ${pipeline.id} has invalid teams`);
  }
  if (!Array.isArray(pipeline.stages) || !pipeline.stages.length) {
    throw new Error(`Linear release pipeline ${pipeline.id} has invalid stages`);
  }
  const localStageIds = new Set<string>();
  for (const stage of pipeline.stages) {
    if (
      !validText(stage.id) ||
      !validText(stage.name) ||
      !STAGE_TYPES.has(stage.type) ||
      (stage.archivedAt !== null && !validUtcTimestamp(stage.archivedAt)) ||
      typeof stage.position !== "number" ||
      !Number.isFinite(stage.position) ||
      typeof stage.frozen !== "boolean" ||
      localStageIds.has(stage.id) ||
      stageById.has(stage.id)
    ) {
      throw new Error(`Linear release pipeline ${pipeline.id} has invalid stages`);
    }
    localStageIds.add(stage.id);
    stageById.set(stage.id, { pipelineId: pipeline.id, stage });
  }
  pipelineById.set(pipeline.id, pipeline);
}

const releaseIdByMembership = new Map<string, string>();
const releaseIds = new Set<string>();
for (const release of snapshot.linearFingerprint.releases) {
  if (
    !validText(release.id) ||
    !validText(release.name) ||
    !validUtcTimestamp(release.updatedAt) ||
    releaseIds.has(release.id) ||
    (release.version !== null && !validText(release.version))
  ) {
    throw new Error(`Linear release ${String(release.id)} is invalid or duplicated`);
  }
  if (
    release.archivedAt !== null &&
    !validUtcTimestamp(release.archivedAt)
  ) {
    throw new Error(`Linear release ${release.id} has invalid archivedAt`);
  }
  const pipeline = pipelineById.get(release.pipeline);
  if (!pipeline) {
    throw new Error(`Linear release ${release.id} references unknown pipeline ${release.pipeline}`);
  }
  const stage = stageById.get(release.stage);
  if (!stage || stage.pipelineId !== pipeline.id) {
    throw new Error(`Linear release ${release.id} references unknown stage ${release.stage}`);
  }
  if (stage.stage.type !== release.stageType) {
    throw new Error(`Linear release ${release.id} stage type differs from its pipeline stage`);
  }
  releaseIds.add(release.id);
  const membership = release.version ?? release.id;
  if (releaseIdByMembership.has(membership)) {
    throw new Error(`Linear fingerprint has duplicate release membership ${membership}`);
  }
  releaseIdByMembership.set(membership, release.id);
}
for (const release of Object.keys(RELEASE_SEQUENCE) as ReleaseId[]) {
  if (!releaseIdByMembership.has(release)) {
    throw new Error(`Linear fingerprint is missing canonical release ${release}`);
  }
}

const canonicalPipeline = pipelineById.get(linearReleaseScope.pipeline.id);
if (!canonicalPipeline) {
  throw new Error("Canonical release pipeline identity differs from pinned scope");
}
if (canonicalPipeline.name !== linearReleaseScope.pipeline.name) {
  throw new Error("Canonical release pipeline name differs from pinned scope");
}
if (canonicalPipeline.type !== linearReleaseScope.pipeline.type) {
  throw new Error("Canonical release pipeline type differs from pinned scope");
}
if (!canonicalPipeline.isProduction) {
  throw new Error("Canonical release pipeline must be production");
}
if (canonicalPipeline.archivedAt !== null) {
  throw new Error("Canonical release pipeline is archived");
}
const normalizedTeams = (teams: Array<{ id: string; key: string }>) =>
  [...teams]
    .map(({ id, key }) => ({ id, key }))
    .sort((left, right) =>
      left.id.localeCompare(right.id) || left.key.localeCompare(right.key)
    );
if (
  JSON.stringify(normalizedTeams(canonicalPipeline.teams)) !==
    JSON.stringify(normalizedTeams(linearReleaseScope.pipeline.teams))
) {
  throw new Error("Canonical pipeline teams differ from pinned scope");
}
const plannedStage = canonicalPipeline.stages.find(
  (stage) => stage.id === linearReleaseScope.pipeline.plannedStage.id,
);
if (!plannedStage || plannedStage.type !== "planned") {
  throw new Error("Canonical planned stage identity differs from pinned scope");
}
if (plannedStage.name !== linearReleaseScope.pipeline.plannedStage.name) {
  throw new Error("Canonical planned stage name differs from pinned scope");
}
if (plannedStage.position !== linearReleaseScope.pipeline.plannedStage.position) {
  throw new Error("Canonical planned stage position differs from pinned scope");
}
if (plannedStage.archivedAt !== null) {
  throw new Error("Canonical planned stage is archived");
}
if (plannedStage.frozen) {
  throw new Error("Canonical planned stage is frozen");
}
for (const scopedRelease of linearReleaseScope.releases) {
  const catalogRelease = releaseCatalogById.get(scopedRelease.version)!;
  const liveRelease = snapshot.linearFingerprint.releases.find(
    (release) => release.id === scopedRelease.id,
  );
  if (!liveRelease || liveRelease.version !== scopedRelease.version) {
    throw new Error(
      `Canonical ${scopedRelease.version} release identity differs from pinned scope`,
    );
  }
  if (liveRelease.name !== catalogRelease.name) {
    throw new Error(
      `Canonical ${scopedRelease.version} release name differs from release catalog`,
    );
  }
  if (liveRelease.archivedAt !== null) {
    throw new Error(`Canonical ${scopedRelease.version} release is archived`);
  }
  if (
    liveRelease.pipeline !== canonicalPipeline.id ||
    liveRelease.stage !== plannedStage.id ||
    liveRelease.stageType !== "planned"
  ) {
    throw new Error(
      `Canonical ${scopedRelease.version} release is not in the pinned planned stage`,
    );
  }
  releaseIdByMembership.set(scopedRelease.version, scopedRelease.id);
}

const projectById = new Map<
  string,
  LinearFingerprint["projects"][number]
>();
for (const project of snapshot.linearFingerprint.projects) {
  if (
    !validText(project.id) ||
    !validText(project.name) ||
    !validUtcTimestamp(project.updatedAt) ||
    projectById.has(project.id)
  ) {
    throw new Error(`Linear project ${String(project.id)} is invalid or duplicated`);
  }
  if (
    project.archivedAt !== null &&
    !validUtcTimestamp(project.archivedAt)
  ) {
    throw new Error(`Linear project ${project.id} has invalid archivedAt`);
  }
  projectById.set(project.id, project);
}
const trackedProjectIds = new Set(
  assertLinearProjectScope(projectScope, snapshot.linearFingerprint.projects),
);
const milestoneIds = new Set<string>();
const milestoneNames = new Set<string>();
const milestoneById = new Map<
  string,
  LinearFingerprint["projectMilestones"][number]
>();
for (const milestone of snapshot.linearFingerprint.projectMilestones) {
  const project = projectById.get(milestone.projectId);
  const scopedName = `${milestone.projectId}:${milestone.name}`;
  if (
    !milestone.id?.trim() ||
    !milestone.name?.trim() ||
    !milestone.projectId?.trim() ||
    !milestone.project?.trim() ||
    milestoneIds.has(milestone.id) ||
    milestoneNames.has(scopedName) ||
    (milestone.archivedAt !== null &&
      !validUtcTimestamp(milestone.archivedAt)) ||
    !trackedProjectIds.has(milestone.projectId) ||
    !project ||
    project.name !== milestone.project
  ) {
    throw new Error("Linear project milestone fingerprint is incomplete or inconsistent");
  }
  milestoneIds.add(milestone.id);
  milestoneNames.add(scopedName);
  milestoneById.set(milestone.id, milestone);
}
const liveById = new Map<string, LinearFingerprint["issues"][number]>();
const relationsByIssue = new Map<string, Set<string>>();
const teamIdByKey = new Map<string, string>();
const teamKeyById = new Map<string, string>();
const assigneeNameById = new Map<string, string>();
const projectNameById = new Map(
  [...projectById.values()].map((project) => [project.id, project.name]),
);
const milestoneIdentityById = new Map(
  [...milestoneById.values()].map((milestone) => [
    milestone.id,
    `${milestone.name}\u0000${milestone.projectId}\u0000${milestone.project}`,
  ]),
);
const stableIssueIds = new Set<string>();
for (const issue of snapshot.linearFingerprint.issues) {
  if (
    !validText(issue.identifier) ||
    !/^[A-Z][A-Z0-9]*-\d+$/.test(issue.identifier) ||
    liveById.has(issue.identifier)
  ) {
    throw new Error(`Linear fingerprint has duplicate or empty issue ${issue.identifier}`);
  }
  if (typeof issue.linearId !== "string" || !UUID.test(issue.linearId)) {
    throw new Error(`Linear issue ${issue.identifier} has no valid stable Linear ID`);
  }
  if (stableIssueIds.has(issue.linearId)) {
    throw new Error(`Linear fingerprint has duplicate stable Linear ID ${issue.linearId}`);
  }
  stableIssueIds.add(issue.linearId);
  if (!validText(issue.title)) {
    throw new Error(`Linear issue ${issue.identifier} has invalid title`);
  }
  if (!/^[a-f0-9]{64}$/.test(issue.descriptionFingerprint)) {
    throw new Error(`Linear issue ${issue.identifier} has invalid description fingerprint`);
  }
  if (!validUtcTimestamp(issue.updatedAt)) {
    throw new Error(`Linear issue ${issue.identifier} has invalid updatedAt`);
  }
  if (
    issue.estimate !== null &&
    (typeof issue.estimate !== "number" ||
      !Number.isFinite(issue.estimate) ||
      issue.estimate < 0)
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid estimate`);
  }
  if (
    !Number.isInteger(issue.priority) ||
    issue.priority < 0 ||
    issue.priority > 4
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid priority`);
  }
  if (!validText(issue.state)) {
    throw new Error(`Linear issue ${issue.identifier} has invalid state`);
  }
  if (!validText(issue.stateType) || !ISSUE_STATE_TYPES.has(issue.stateType)) {
    throw new Error(`Linear issue ${issue.identifier} has invalid state type`);
  }
  if (
    issue.archivedAt !== null &&
    !validUtcTimestamp(issue.archivedAt)
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid archivedAt`);
  }
  if (
    !Array.isArray(issue.labels) ||
    issue.labels.some((label) => !validText(label)) ||
    new Set(issue.labels).size !== issue.labels.length
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid labels`);
  }
  if ((issue.assignee === null) !== (issue.assigneeId === null)) {
    throw new Error(`Linear issue ${issue.identifier} has partial assignee identity`);
  }
  if (
    issue.assignee !== null &&
    (!validText(issue.assignee) || !validText(issue.assigneeId))
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid assignee identity`);
  }
  if (
    !validText(issue.team) ||
    !/^[A-Z][A-Z0-9]*$/.test(issue.team) ||
    !validText(issue.teamId) ||
    issue.identifier.split("-")[0] !== issue.team
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid team identity`);
  }
  if ((issue.projectId === null) !== (issue.project === null)) {
    throw new Error(`Linear issue ${issue.identifier} has partial project identity`);
  }
  if (
    issue.projectId !== null &&
    (!validText(issue.projectId) || !validText(issue.project))
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid project identity`);
  }
  if ((issue.milestoneId === null) !== (issue.milestone === null)) {
    throw new Error(`Linear issue ${issue.identifier} has partial milestone identity`);
  }
  if (
    issue.milestoneId !== null &&
    (!validText(issue.milestoneId) ||
      !validText(issue.milestone) ||
      issue.projectId === null ||
      issue.project === null)
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid milestone identity`);
  }
  if (
    issue.parent !== null &&
    (!validText(issue.parent) ||
      !/^[A-Z][A-Z0-9]*-\d+$/.test(issue.parent))
  ) {
    throw new Error(`Linear issue ${issue.identifier} has invalid parent`);
  }
  if (issue.parent === issue.identifier) {
    throw new Error(`Linear issue ${issue.identifier} cannot parent itself`);
  }
  if (!Array.isArray(issue.releases)) {
    throw new Error(`Linear issue ${issue.identifier} has invalid releases`);
  }
  if (!Array.isArray(issue.relations)) {
    throw new Error(`Linear issue ${issue.identifier} has invalid relations`);
  }
  const releases = unique(issue.releases, `Linear issue ${issue.identifier} releases`);
  const relations = unique(
    issue.relations,
    `Linear issue ${issue.identifier} relations`,
  );

  const priorTeamId = teamIdByKey.get(issue.team);
  const priorTeamKey = teamKeyById.get(issue.teamId);
  if (
    (priorTeamId !== undefined && priorTeamId !== issue.teamId) ||
    (priorTeamKey !== undefined && priorTeamKey !== issue.team)
  ) {
    throw new Error(`Linear issue ${issue.identifier} has inconsistent team identity`);
  }
  teamIdByKey.set(issue.team, issue.teamId);
  teamKeyById.set(issue.teamId, issue.team);
  if (issue.assigneeId !== null) {
    const priorAssignee = assigneeNameById.get(issue.assigneeId);
    if (priorAssignee !== undefined && priorAssignee !== issue.assignee) {
      throw new Error(`Linear issue ${issue.identifier} has inconsistent assignee identity`);
    }
    assigneeNameById.set(issue.assigneeId, issue.assignee!);
  }
  if (issue.projectId !== null) {
    const priorProject = projectNameById.get(issue.projectId);
    if (priorProject !== undefined && priorProject !== issue.project) {
      throw new Error(`Linear issue ${issue.identifier} has inconsistent project identity`);
    }
    projectNameById.set(issue.projectId, issue.project!);
  }
  if (issue.milestoneId !== null) {
    const identity = `${issue.milestone}\u0000${issue.projectId}\u0000${issue.project}`;
    const priorMilestone = milestoneIdentityById.get(issue.milestoneId);
    if (priorMilestone !== undefined && priorMilestone !== identity) {
      throw new Error(`Linear issue ${issue.identifier} has inconsistent milestone identity`);
    }
    milestoneIdentityById.set(issue.milestoneId, identity);
  }
  liveById.set(issue.identifier, { ...issue, releases, relations });
  relationsByIssue.set(issue.identifier, new Set(relations));
}
for (const issue of liveById.values()) {
  if (issue.parent !== null && !liveById.has(issue.parent)) {
    throw new Error(`Linear issue ${issue.identifier} has uncaptured parent ${issue.parent}`);
  }
  for (const membership of issue.releases) {
    if (!releaseIdByMembership.has(membership)) {
      throw new Error(
        `Linear issue ${issue.identifier} references uncaptured release ${membership}`,
      );
    }
  }
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
const canonicalTeamIdentities = new Set(
  linearReleaseScope.pipeline.teams.map((team) => `${team.key}:${team.id}`),
);
for (const requirementId of [...expectedSourceIds].sort(compare)) {
  const rows = mappingRowsBySource.get(requirementId) ?? [];
  const kind = requirementId.startsWith("RG:") ? "Runtime" : "Executable";
  if (!rows.length) {
    throw new Error(`${kind} source ${requirementId} has no Linear mapping`);
  }
  if (rows.length > 1) {
    throw new Error(
      `${kind} source ${requirementId} has duplicate Linear mappings: ${rows
        .map((row) => row.id)
        .sort(compare)
        .join(", ")}`,
    );
  }
  const issueId = rows[0].id;
  const issue = liveById.get(issueId);
  if (!issue) {
    throw new Error(`${kind} source ${requirementId} maps to uncaptured ${issueId}`);
  }
  if (issue.stateType === "canceled") {
    throw new Error(`${kind} source ${requirementId} maps to canceled issue ${issueId}`);
  }
  if (issue.archivedAt !== null) {
    throw new Error(`${kind} source ${requirementId} maps to archived issue ${issueId}`);
  }
  if (!canonicalTeamIdentities.has(`${issue.team}:${issue.teamId}`)) {
    throw new Error(
      `Mapped issue team ${issue.team}:${issue.teamId} is absent from canonical pipeline`,
    );
  }
  if (!issue.projectId || !trackedProjectIds.has(issue.projectId)) {
    throw new Error(
      `${kind} source ${requirementId} maps outside canonical project scope`,
    );
  }
  const project = projectById.get(issue.projectId);
  if (project?.archivedAt !== null) {
    throw new Error(`${kind} source ${requirementId} maps to archived project`);
  }
  const milestone = issue.milestoneId
    ? milestoneById.get(issue.milestoneId)
    : undefined;
  if (!milestone || milestone.projectId !== issue.projectId) {
    throw new Error(
      `${kind} source ${requirementId} maps outside canonical milestone inventory`,
    );
  }
  if (milestone.archivedAt !== null) {
    throw new Error(`${kind} source ${requirementId} maps to archived milestone`);
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
    linearReleaseScope: sha256(raw.linearReleaseScope),
    releaseCatalog: sha256(raw.releaseCatalog),
    releasePlan: sha256(raw.releasePlan),
    runtimeDependencies: sha256(raw.runtimeDependencies),
    snapshot: sha256(raw.snapshot),
  },
  guards: {
    issues: [...guardedIssueIds].sort(compare).map((issueId) => ({
      issueId,
      linearId: liveById.get(issueId)!.linearId,
      teamId: liveById.get(issueId)!.teamId,
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

atomicWrite(outPath, `${JSON.stringify(plan, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ out: outPath })}\n`);
