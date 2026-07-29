#!/usr/bin/env tsx
import { createHash } from "node:crypto";
import {
  lstatSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

import { verifyExactGitCommitProvenance } from "./lib/git-commit-provenance.js";
import type { LinearNativeIdentityCapture } from "./lib/linear-live.js";
import {
  buildLinearRequirementLabelReplacementCandidate,
  canonicalLinearRequirementLabelReplacementCandidateJson,
} from "./lib/linear-requirement-label-replacement.js";

const FLAGS = [
  "--fingerprint",
  "--issue-descriptions",
  "--native-identity",
  "--capture-receipt",
  "--program-scope",
  "--github-execution",
  "--new-label-id",
  "--repository-root",
  "--out",
] as const;
const INPUT_FLAGS = [
  "--fingerprint",
  "--issue-descriptions",
  "--native-identity",
  "--capture-receipt",
  "--program-scope",
  "--github-execution",
] as const;
const CANONICAL_REPOSITORY = "meetblakey/sourcera";
const CANONICAL_REF = "refs/heads/main";
const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const POSITIVE_INTEGER = /^[1-9]\d*$/;
const CANONICAL_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

type Flag = typeof FLAGS[number];
type InputFlag = typeof INPUT_FLAGS[number];
type JsonObject = Record<string, unknown>;

function fail(message: string): never {
  throw new Error(`Requirement label replacement builder: ${message}`);
}

function argumentsMap(argv: string[]): Map<Flag, string> {
  if (argv.length !== FLAGS.length * 2) fail("arguments are missing, invalid, or duplicated");
  const allowed = new Set<string>(FLAGS);
  const values = new Map<Flag, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key || !allowed.has(key) || !value || value.startsWith("--") || values.has(key as Flag)) {
      fail("arguments are missing, invalid, or duplicated");
    }
    values.set(key as Flag, value);
  }
  if (FLAGS.some((flag) => !values.has(flag))) fail("arguments are missing, invalid, or duplicated");
  return values;
}

function exactObject(value: unknown, keys: readonly string[], label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const row = value as JsonObject;
  if (JSON.stringify(Object.keys(row).sort()) !== JSON.stringify([...keys].sort())) {
    fail(`${label} keys differ`);
  }
  return row;
}

function parseObject(raw: Buffer, label: string): JsonObject {
  let value: unknown;
  try {
    value = JSON.parse(raw.toString("utf8"));
  } catch {
    fail(`${label} is not valid JSON`);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be a JSON object`);
  return value as JsonObject;
}

function sha256(raw: Buffer): string {
  return createHash("sha256").update(raw).digest("hex");
}

function exactRepositoryRoot(supplied: string): string {
  const absolute = resolve(supplied);
  let metadata: ReturnType<typeof lstatSync>;
  try {
    metadata = lstatSync(absolute);
  } catch {
    fail("repository root does not exist");
  }
  if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
    fail("repository root must be a real directory");
  }
  return realpathSync(absolute);
}

interface InputFile {
  flag: InputFlag;
  path: string;
  raw: Buffer;
  identity: string;
}

function regularInput(flag: InputFlag, supplied: string): InputFile {
  const absolute = resolve(supplied);
  let metadata: ReturnType<typeof lstatSync>;
  try {
    metadata = lstatSync(absolute);
  } catch {
    fail(`${flag} does not exist`);
  }
  if (metadata.isSymbolicLink() || !metadata.isFile()) {
    fail(`${flag} must be a regular non-symlink file`);
  }
  return {
    flag,
    path: realpathSync(absolute),
    raw: readFileSync(absolute),
    identity: `${metadata.dev}:${metadata.ino}`,
  };
}

function assertDistinctInputs(files: readonly InputFile[]): void {
  if (new Set(files.map((file) => file.path)).size !== files.length ||
    new Set(files.map((file) => file.identity)).size !== files.length) {
    fail("all input paths must be distinct regular files");
  }
}

function exactOutput(supplied: string, inputs: readonly InputFile[]): string {
  const absolute = resolve(supplied);
  try {
    lstatSync(absolute);
    fail("output already exists; overwrite is forbidden");
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
  }
  if (inputs.some((file) => file.path === absolute)) fail("output must be distinct from every input");
  const parent = dirname(absolute);
  let metadata: ReturnType<typeof lstatSync>;
  try {
    metadata = lstatSync(parent);
  } catch {
    fail("output parent does not exist");
  }
  if (metadata.isSymbolicLink() || !metadata.isDirectory()) fail("output parent must be a real directory");
  return absolute;
}

function assertCanonicalSource(source: JsonObject): {
  repository: string;
  commit: string;
  ref: string;
  runId: string;
  runAttempt: string;
} {
  const repository = source.repository;
  const commit = source.commit;
  const ref = source.ref;
  const runId = source.runId;
  const runAttempt = source.runAttempt;
  if (repository !== CANONICAL_REPOSITORY || ref !== CANONICAL_REF ||
    typeof commit !== "string" || !COMMIT.test(commit) ||
    typeof runId !== "string" || !POSITIVE_INTEGER.test(runId) ||
    typeof runAttempt !== "string" || !POSITIVE_INTEGER.test(runAttempt)) {
    fail("capture source is not one full canonical GitHub main execution identity");
  }
  const current = {
    repository: process.env.GITHUB_REPOSITORY,
    commit: process.env.GITHUB_SHA,
    ref: process.env.GITHUB_REF,
    runId: process.env.GITHUB_RUN_ID,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT,
  };
  if (Object.values(current).some((value) => value === undefined) ||
    repository !== current.repository || commit !== current.commit || ref !== current.ref ||
    runId !== current.runId || runAttempt !== current.runAttempt) {
    fail("capture source differs from the current GitHub main execution identity");
  }
  return { repository, commit, ref, runId, runAttempt };
}

const values = argumentsMap(process.argv.slice(2));
const repositoryRoot = exactRepositoryRoot(values.get("--repository-root")!);
const inputFiles = INPUT_FLAGS.map((flag) => regularInput(flag, values.get(flag)!));
assertDistinctInputs(inputFiles);
const files = new Map(inputFiles.map((file) => [file.flag, file]));
const output = exactOutput(values.get("--out")!, inputFiles);
const canonicalProgramPath = join(repositoryRoot, "delivery/linear-program-scope.json");
if (files.get("--program-scope")!.path !== canonicalProgramPath) {
  fail("program scope must be the canonical repository path");
}

const fingerprintRaw = files.get("--fingerprint")!.raw;
const descriptionsRaw = files.get("--issue-descriptions")!.raw;
const nativeRaw = files.get("--native-identity")!.raw;
const receiptRaw = files.get("--capture-receipt")!.raw;
const programRaw = files.get("--program-scope")!.raw;
const executionRaw = files.get("--github-execution")!.raw;
parseObject(fingerprintRaw, "fingerprint");
parseObject(descriptionsRaw, "issue descriptions");
const native = parseObject(nativeRaw, "native identity") as unknown as LinearNativeIdentityCapture;
const program = parseObject(programRaw, "program scope");
if (program.schemaVersion !== 3) fail("program scope schemaVersion must be 3");

const receipt = exactObject(parseObject(receiptRaw, "capture receipt"), [
  "schemaVersion",
  "captureMode",
  "capturedAt",
  "fingerprintSha256",
  "acceptedFingerprintSha256",
  "artifactSha256s",
  "source",
], "capture receipt");
const artifacts = exactObject(receipt.artifactSha256s, [
  "fingerprint",
  "nativeIdentity",
  "documents",
  "issueDescriptions",
], "capture receipt artifact hashes");
const source = exactObject(receipt.source, [
  "repository",
  "commit",
  "ref",
  "runId",
  "runAttempt",
], "capture receipt source");
const capturedAt = receipt.capturedAt;
const fingerprintSha256 = sha256(fingerprintRaw);
if (receipt.schemaVersion !== 2 || receipt.captureMode !== "live" ||
  typeof capturedAt !== "string" || !CANONICAL_UTC.test(capturedAt) ||
  Number.isNaN(Date.parse(capturedAt)) || new Date(capturedAt).toISOString() !== capturedAt ||
  receipt.fingerprintSha256 !== fingerprintSha256 ||
  receipt.acceptedFingerprintSha256 !== fingerprintSha256 ||
  artifacts.fingerprint !== fingerprintSha256 ||
  artifacts.nativeIdentity !== sha256(nativeRaw) ||
  artifacts.issueDescriptions !== sha256(descriptionsRaw) ||
  typeof artifacts.documents !== "string" || !DIGEST.test(artifacts.documents)) {
  fail("capture receipt schema or artifact hashes differ from the supplied capture bytes");
}
const sourceIdentity = assertCanonicalSource(source);

const execution = exactObject(parseObject(executionRaw, "GitHub execution provenance"), [
  "schemaVersion",
  "kind",
  "repository",
  "commit",
  "ref",
  "runId",
  "runAttempt",
], "GitHub execution provenance");
if (execution.schemaVersion !== 1 || execution.kind !== "github-execution" ||
  execution.repository !== sourceIdentity.repository || execution.commit !== sourceIdentity.commit ||
  execution.ref !== sourceIdentity.ref || execution.runId !== sourceIdentity.runId ||
  execution.runAttempt !== sourceIdentity.runAttempt) {
  fail("GitHub execution provenance differs from the capture receipt source");
}

verifyExactGitCommitProvenance({
  repositoryRoot,
  sourceCommit: sourceIdentity.commit,
  paths: ["delivery/linear-program-scope.json"],
});

const candidate = buildLinearRequirementLabelReplacementCandidate({
  native,
  sourceCommit: sourceIdentity.commit,
  nativeIdentitySha256: sha256(nativeRaw),
  captureReceiptSha256: sha256(receiptRaw),
  newLabelId: values.get("--new-label-id")!,
});
writeFileSync(output, canonicalLinearRequirementLabelReplacementCandidateJson(candidate), {
  flag: "wx",
  mode: 0o600,
});
process.stdout.write(`${JSON.stringify({
  ok: true,
  mutationAuthorized: candidate.mutationAuthorized,
  root: candidate.root,
  expectedCurrentRoot: candidate.expectedCurrentRoot,
  protectedNativeStateRoot: candidate.protectedNativeStateRoot,
  operationsRoot: candidate.operationsRoot,
  operations: candidate.operations.length,
  requirements: candidate.issues.length,
  sourceCommit: candidate.sourceCommit,
})}\n`);
