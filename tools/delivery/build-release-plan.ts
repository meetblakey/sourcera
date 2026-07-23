#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
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
import { basename, dirname, resolve } from "node:path";
import {
  assertLinearPlanningContractFingerprints,
  canonicalLinearFingerprint,
  type LinearFingerprint,
} from "./lib/linear-live.js";
import type { LinearProgramScope } from "./lib/linear-program-scope.js";
import {
  assertLinearProjectScope,
  type LinearProjectScope,
} from "./lib/linear-project-scope.js";
import { parseLinearRuntimeInventory } from "./lib/linear-source-policy.js";
import {
  applyLinearDispositions,
  parseLinearDispositions,
} from "./lib/linear-dispositions.js";
import { releasePolicyFindings } from "./lib/release-policy.js";
import type {
  ReleaseAssignment,
  ReleaseDefinition,
  ReleaseId,
  ReleasePolicy,
} from "./lib/model.js";
import { parseFeatureInventory } from "./lib/sources.js";
import {
  assertCompleteLinearFingerprint,
} from "./linear-fingerprint-overlay.js";

interface PlannedIssue {
  id: string;
  sourceId: string | null;
  release: ReleaseId | null;
}

interface LiveIssue {
  identifier: string;
  stateType: string;
  archivedAt: string | null;
  releases: string[];
}

interface LinearSnapshot {
  generatedAt: string;
  linearCapture: {
    schemaVersion: number;
    capturedAt: string;
    fingerprintSha256: string;
    source: {
      repository: string;
      commit: string;
      ref: string;
      runId: string;
      runAttempt: string;
    };
  };
  issues: PlannedIssue[];
  linearFingerprint: LinearFingerprint;
}

const ALLOWED_ARGUMENTS = new Set([
  "--root",
  "--linear",
  "--policy",
  "--releases",
  "--linear-project-scope",
  "--linear-program-scope",
  "--inventory",
  "--dispositions",
  "--feature-dependencies",
  "--stamp",
  "--runtime-dependencies",
  "--out",
]);

function argumentsByName(): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    const name = process.argv[index];
    const value = process.argv[index + 1];
    if (!name || !ALLOWED_ARGUMENTS.has(name) || !value || value.startsWith("--")) {
      throw new Error(`Invalid argument near ${name ?? "end"}`);
    }
    if (values.has(name)) throw new Error(`Duplicate argument ${name}`);
    values.set(name, value);
  }
  return values;
}

function fail(messages: string[]): never {
  throw new Error(`Linear release readback invalid:\n${messages.join("\n")}`);
}

function existingNode(path: string): ReturnType<typeof lstatSync> | null {
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
  return leftIdentity.dev === rightIdentity.dev && leftIdentity.ino === rightIdentity.ino;
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

const argv = argumentsByName();
const repositoryRoot = realpathSync(
  execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trim(),
);
const root = realpathSync(resolve(argv.get("--root") ?? repositoryRoot));
if (root !== repositoryRoot) {
  throw new Error("--root must use the current canonical repository");
}
const linearPath = resolve(
  root,
  argv.get("--linear") ?? "delivery/linear-snapshot.json",
);
const policyPath = resolve(
  root,
  argv.get("--policy") ?? "delivery/release-policy.json",
);
const releasesPath = resolve(
  root,
  argv.get("--releases") ?? "delivery/releases.json",
);
const projectScopePath = resolve(
  root,
  argv.get("--linear-project-scope") ?? "delivery/linear-project-scope.json",
);
const programScopePath = resolve(
  root,
  argv.get("--linear-program-scope") ?? "delivery/linear-program-scope.json",
);
const inventoryPath = resolve(
  root,
  argv.get("--inventory") ?? "_audit/FEATURE_INVENTORY.md",
);
const dispositionsPath = resolve(
  root,
  argv.get("--dispositions") ?? "delivery/dispositions.json",
);
const featureDependenciesPath = resolve(
  root,
  argv.get("--feature-dependencies") ?? "delivery/feature-dependencies.json",
);
const stampPath = resolve(
  root,
  argv.get("--stamp") ?? "/tmp/stamp.json",
);
const runtimeDependenciesPath = resolve(
  root,
  argv.get("--runtime-dependencies") ?? "delivery/runtime-gate-dependencies.json",
);
const outPath = resolve(
  root,
  argv.get("--out") ?? "delivery/release-plan.json",
);

const outputNode = existingNode(outPath);
if (outputNode?.isSymbolicLink()) throw new Error("Output path cannot be a symlink");
if (outputNode && !outputNode.isFile()) {
  throw new Error("Output path must be a regular file");
}
const outputIdentity = resolve(realpathSync(dirname(outPath)), basename(outPath));
for (const [name, inputPath] of Object.entries({
  linear: linearPath,
  policy: policyPath,
  releases: releasesPath,
  projectScope: projectScopePath,
  programScope: programScopePath,
  inventory: inventoryPath,
  dispositions: dispositionsPath,
  featureDependencies: featureDependenciesPath,
  stamp: stampPath,
  runtimeDependencies: runtimeDependenciesPath,
})) {
  if (
    realpathSync(inputPath) === outputIdentity ||
    sameFilesystemObject(outPath, inputPath)
  ) {
    throw new Error(`Output path equals input ${name}`);
  }
}

for (const [label, actual, canonical] of [
  ["policy", policyPath, resolve(root, "delivery/release-policy.json")],
  ["releases", releasesPath, resolve(root, "delivery/releases.json")],
  ["project scope", projectScopePath, resolve(root, "delivery/linear-project-scope.json")],
  ["program scope", programScopePath, resolve(root, "delivery/linear-program-scope.json")],
  ["inventory", inventoryPath, resolve(root, "_audit/FEATURE_INVENTORY.md")],
  ["dispositions", dispositionsPath, resolve(root, "delivery/dispositions.json")],
  ["feature dependencies", featureDependenciesPath, resolve(root, "delivery/feature-dependencies.json")],
  ["runtime dependencies", runtimeDependenciesPath, resolve(root, "delivery/runtime-gate-dependencies.json")],
] as const) {
  if (realpathSync(actual) !== realpathSync(canonical)) {
    throw new Error(`${label} must use the canonical repository file`);
  }
}

const policy = JSON.parse(readFileSync(policyPath, "utf8")) as ReleasePolicy;
const releases = (
  JSON.parse(readFileSync(releasesPath, "utf8")) as {
    releases: ReleaseDefinition[];
  }
).releases;
const projectScope = JSON.parse(
  readFileSync(projectScopePath, "utf8"),
) as LinearProjectScope;
const programScope = JSON.parse(
  readFileSync(programScopePath, "utf8"),
) as LinearProgramScope;
JSON.parse(readFileSync(featureDependenciesPath, "utf8"));
const baseFeatureSources = parseFeatureInventory(
  readFileSync(inventoryPath, "utf8"),
);
const featureSources = applyLinearDispositions(
  baseFeatureSources,
  parseLinearDispositions(
    JSON.parse(readFileSync(dispositionsPath, "utf8")),
    baseFeatureSources,
  ),
);
const runtimeSources = parseLinearRuntimeInventory(
  readFileSync(stampPath, "utf8"),
  readFileSync(runtimeDependenciesPath, "utf8"),
);
const policyFindings = releasePolicyFindings([], policy, releases);
if (policyFindings.length) {
  fail(policyFindings.map((finding) => `${finding.code}: ${finding.message}`));
}

const snapshot = JSON.parse(readFileSync(linearPath, "utf8")) as LinearSnapshot;
if (!Array.isArray(snapshot.issues) || !snapshot.issues.length) {
  fail(["Linear snapshot has no planned issues"]);
}
for (const inventory of [
  "issues",
  "releasePipelines",
  "releases",
  "projects",
  "projectMilestones",
] as const) {
  if (
    !snapshot.linearFingerprint ||
    !Array.isArray(snapshot.linearFingerprint[inventory]) ||
    !snapshot.linearFingerprint[inventory].length
  ) {
    fail([`Linear snapshot has no complete ${inventory} fingerprint inventory`]);
  }
}
if (!snapshot.linearFingerprint.program) {
  fail(["Linear snapshot has no canonical program topology"]);
}
const fingerprint = canonicalLinearFingerprint(snapshot.linearFingerprint);
assertCompleteLinearFingerprint(fingerprint);
assertLinearProjectScope(projectScope, fingerprint.projects);
assertLinearPlanningContractFingerprints(programScope, fingerprint);

const receipt = snapshot.linearCapture;
const receiptSource = receipt?.source;
const sourceKeys = receiptSource && typeof receiptSource === "object"
  ? Object.keys(receiptSource).sort()
  : [];
const fingerprintJson = `${JSON.stringify(fingerprint, null, 2)}\n`;
const fingerprintSha256 = createHash("sha256")
  .update(fingerprintJson)
  .digest("hex");
if (
  !receipt ||
  Object.keys(receipt).sort().join(",") !==
    "capturedAt,fingerprintSha256,schemaVersion,source" ||
  receipt?.schemaVersion !== 1 ||
  !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(receipt?.capturedAt ?? "") ||
  snapshot.generatedAt !== receipt?.capturedAt ||
  receipt?.fingerprintSha256 !== fingerprintSha256 ||
  sourceKeys.join(",") !== "commit,ref,repository,runAttempt,runId" ||
  receiptSource?.repository !== "meetblakey/sourcera" ||
  !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(receiptSource?.commit ?? "") ||
  receiptSource?.ref !== "refs/heads/main" ||
  !/^[1-9]\d*$/.test(receiptSource?.runId ?? "") ||
  !/^[1-9]\d*$/.test(receiptSource?.runAttempt ?? "")
) {
  fail(["Linear snapshot capture receipt is missing or invalid"]);
}

const errors: string[] = [];
const liveByIdentifier = new Map<string, LiveIssue>();
for (const issue of fingerprint.issues) {
  if (!issue.identifier || liveByIdentifier.has(issue.identifier)) {
    errors.push(`Live issue identity ${issue.identifier || "<empty>"} is missing or duplicated`);
    continue;
  }
  liveByIdentifier.set(issue.identifier, issue);
}

const allowedReleaseIds = new Set<string>(policy.allowedReleaseIds);
const sourceIds = new Set<string>();
const assignments: ReleaseAssignment[] = [];
for (const issue of snapshot.issues) {
  if (issue.sourceId === null) continue;
  if (!issue.id || !issue.sourceId) {
    errors.push("Mapped snapshot issue lacks an issue or source identity");
    continue;
  }
  if (sourceIds.has(issue.sourceId)) {
    errors.push(`${issue.sourceId} is mapped to more than one Linear issue`);
    continue;
  }
  sourceIds.add(issue.sourceId);

  const live = liveByIdentifier.get(issue.id);
  if (!live) {
    errors.push(`${issue.sourceId} owner ${issue.id} is absent from the live fingerprint`);
    continue;
  }
  if (live.archivedAt != null || live.stateType === "canceled") {
    errors.push(`${issue.sourceId} owner ${issue.id} is canceled or archived`);
    continue;
  }
  if (
    !Array.isArray(live.releases) ||
    live.releases.length !== 1 ||
    !allowedReleaseIds.has(live.releases[0] ?? "")
  ) {
    errors.push(`${issue.sourceId} owner ${issue.id} must have exactly one R0-R5 native release`);
    continue;
  }
  const nativeRelease = live.releases[0] as ReleaseId;
  if (issue.release !== nativeRelease) {
    errors.push(
      `${issue.sourceId} projection ${String(issue.release)} differs from live ${nativeRelease}`,
    );
    continue;
  }
  assignments.push({
    requirementId: issue.sourceId,
    release: nativeRelease,
    rationale: "Generated readback of the issue's native Linear release.",
  });
}

if (!assignments.length) errors.push("Linear snapshot has no source-mapped release owners");
const expectedSourceIds = new Set([
  ...featureSources
    .filter((source) => source.disposition === "executable")
    .map((source) => source.requirementId),
  ...runtimeSources.map((source) => source.requirementId),
]);
for (const sourceId of [...expectedSourceIds].sort()) {
  if (!sourceIds.has(sourceId)) {
    errors.push(`${sourceId} has no source-mapped Linear release owner`);
  }
}
for (const sourceId of [...sourceIds].sort()) {
  if (!expectedSourceIds.has(sourceId)) {
    errors.push(`${sourceId} is not in the canonical executable or runtime inventory`);
  }
}
if (errors.length) fail(errors);

assignments.sort((left, right) =>
  left.requirementId.localeCompare(right.requirementId, undefined, {
    numeric: true,
  }),
);
atomicWrite(outputIdentity, `${JSON.stringify({ assignments }, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ assignments: assignments.length })}\n`);
