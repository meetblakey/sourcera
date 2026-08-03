#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  writeSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

import { LinearRequirementLabelHttpTransport } from "./lib/linear-requirement-label-http-transport.js";
import {
  assertLinearRequirementLabelFinalizeTransitionContract,
  assertLinearRequirementLabelReplacementCandidate,
  canonicalLinearRequirementLabelReplacementFinalReceiptJson,
  compensateLinearRequirementLabelReplacementPhase,
  compareLinearRequirementLabelReplacementStableCaptures,
  executeLinearRequirementLabelReplacementPhase,
  verifyLinearRequirementLabelAcceptedProtectedTransition,
  verifyLinearRequirementLabelRenameRecoveryState,
  verifyLinearRequirementLabelReplacementFinal,
  verifyLinearRequirementLabelReplacementFinalWithTransition,
  verifyLinearRequirementLabelReplacementUsage,
  type LinearRequirementLabelCapture,
  type LinearRequirementLabelExpectedLabel,
  type LinearRequirementLabelFinalizeTransitionContract,
  type LinearRequirementLabelReplacementCandidate,
  type LinearRequirementLabelReplacementPhase,
  type LinearRequirementLabelReplacementPhaseReceipt,
  type LinearRequirementLabelReplacementTransport,
} from "./lib/linear-requirement-label-replacement.js";

const DIGEST = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;
const SAFE_RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/;
const POSITIVE_INTEGER = /^[1-9]\d*$/;
const CANONICAL_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_INPUT_BYTES = 64 * 1024 * 1024;
const MUTATION_PHASES = new Set(["rename", "create", "replace", "retire"] as const);
const PHASES = new Set(["rename", "create", "replace", "verify", "retire", "finalize"] as const);
const IMMUTABLE_MIGRATION_PATHS = [
  ".github/workflows/linear-requirement-label-replacement.yml",
  "delivery/linear-requirement-label-finalize-transition.json",
  "delivery/linear-program-scope.json",
  "delivery/linear-project-scope.json",
  "tools/delivery",
  "tools/spec-lint/package.json",
  "tools/spec-lint/package-lock.json",
] as const;
const DIAGNOSTIC_CONTROL_TRANSITION_PATHS = [
  ".github/workflows/linear-requirement-label-replacement.yml",
  "tools/delivery/lib/linear-requirement-label-replacement.ts",
  "tools/delivery/linear-requirement-label-replacement-runner-cli.test.ts",
  "tools/delivery/linear-requirement-label-replacement-workflow.test.ts",
  "tools/delivery/linear-requirement-label-replacement.test.ts",
  "tools/delivery/run-linear-requirement-label-replacement.ts",
] as const;
const FINALIZE_CONTROL_TRANSITION_PATHS = [
  ...DIAGNOSTIC_CONTROL_TRANSITION_PATHS,
  "delivery/linear-requirement-label-finalize-transition.json",
] as const;

type RunnerPhase = "rename" | "create" | "replace" | "verify" | "retire" | "finalize";
type JsonRecord = Record<string, unknown>;

interface CliArgs {
  apply: boolean;
  compensate: boolean;
  candidate: string;
  phase: RunnerPhase;
  expectedRoot: string;
  nativeIdentity: string;
  captureReceipt: string;
  runId: string;
  journalOut: string;
  receiptOut: string;
  chunkReceiptsOut: string;
  failureSummaryOut?: string;
  previousReceipt?: string;
  previousJournal?: string;
  expectedPreviousReceiptRoot?: string;
  resumeJournal?: string;
  expectedResumeJournalSha256?: string;
  resumeReceipts?: string;
  expectedResumeReceiptsSha256?: string;
  secondNativeIdentity?: string;
  secondCaptureReceipt?: string;
  controlTransitionSource?: string;
  controlTransitionCandidateRoot?: string;
  controlTransitionHead?: string;
  controlTransitionBeforeRoot?: string;
  controlTransitionAfterRoot?: string;
  finalizeTransition?: string;
  expectedFinalizeTransitionRoot?: string;
}

interface ControlTransition {
  source: string;
  candidateRoot: string;
  head: string;
  beforeRoot: string;
  afterRoot: string;
}

type FailureCode =
  | "input_validation"
  | "capture_validation"
  | "predecessor_validation"
  | "protected_state_validation"
  | "protected_state_transition_validation"
  | "retirement_replay_validation"
  | "final_usage_validation"
  | "stable_capture_validation"
  | "phase_validation"
  | "phase_execution"
  | "evidence_persistence";

interface CaptureDiagnostic {
  oldLabelCount: number;
  newLabelCount: number;
  oldLabelArchivedAtIsNull: boolean | null;
  oldLabelRetiredAtIsNull: boolean | null;
  labelTotal: number;
  oldLabelUses: number;
  newLabelUses: number;
  outsideNewLabelUses: number;
  activeRequirementLabelCount: number;
  protectedRootMatches: boolean;
}

interface FailureSummaryState {
  schemaVersion: 1;
  kind: "linear-requirement-label-replacement-failure-summary";
  phase: RunnerPhase | null;
  code: FailureCode;
  candidateRoot: string | null;
  firstCaptureRoot: string | null;
  secondCaptureRoot: string | null;
  differingCatalogs: string[] | null;
  firstCatalogRoots: Record<string, string> | null;
  secondCatalogRoots: Record<string, string> | null;
  firstCapture: CaptureDiagnostic | null;
  secondCapture: CaptureDiagnostic | null;
}

interface RunnerReceipt {
  schemaVersion: 1;
  kind: "linear-requirement-label-replacement-runner-receipt";
  candidateRoot: string;
  operationsRoot: string;
  phase: RunnerPhase;
  direction: "forward" | "compensation";
  runId: string;
  nativeIdentitySha256: string;
  captureReceiptSha256: string;
  secondNativeIdentitySha256: string | null;
  secondCaptureReceiptSha256: string | null;
  journalSha256: string;
  coreReceipts: LinearRequirementLabelReplacementPhaseReceipt[];
  applied: number;
  alreadyApplied: number;
  compensated: number;
  alreadyCompensated: number;
  verification: JsonRecord | null;
  previousReceiptRoot: string | null;
  complete: true;
  root: string;
}

interface ValidatedCapture {
  native: LinearRequirementLabelCapture;
  nativeSha256: string;
  receiptSha256: string;
}

function fail(message: string): never {
  throw new Error(`Linear Requirement label replacement runner: ${message}`);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const encoded = JSON.stringify(value);
    if (encoded === undefined) fail("canonical data contains undefined");
    return encoded;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const row = value as JsonRecord;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(row[key])}`).join(",")}}`;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function exactObject(value: unknown, keys: readonly string[], label: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const row = value as JsonRecord;
  if (Object.keys(row).sort().join("\0") !== [...keys].sort().join("\0")) fail(`${label} fields differ`);
  return row;
}

function parsedJson(raw: Buffer, label: string): unknown {
  try {
    return JSON.parse(raw.toString("utf8")) as unknown;
  } catch {
    fail(`${label} is not valid JSON`);
  }
}

function uniqueRawFlagValue(argv: string[], flag: string): string | undefined {
  const indexes = argv.flatMap((value, index) => value === flag ? [index] : []);
  if (indexes.length !== 1) return undefined;
  const value = argv[indexes[0]! + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

const runnerArgv = process.argv.slice(2);
const preliminaryPhase = uniqueRawFlagValue(runnerArgv, "--phase");
const preliminaryFailureSummaryOut = uniqueRawFlagValue(runnerArgv, "--failure-summary-out");
const failureSummary: FailureSummaryState = {
  schemaVersion: 1,
  kind: "linear-requirement-label-replacement-failure-summary",
  phase: preliminaryPhase && PHASES.has(preliminaryPhase as RunnerPhase)
    ? preliminaryPhase as RunnerPhase
    : null,
  code: "input_validation",
  candidateRoot: null,
  firstCaptureRoot: null,
  secondCaptureRoot: null,
  differingCatalogs: null,
  firstCatalogRoots: null,
  secondCatalogRoots: null,
  firstCapture: null,
  secondCapture: null,
};
let resolvedFailureSummaryOut: string | undefined;

function parseArgs(argv: string[]): CliArgs {
  let apply = false;
  let compensate = false;
  const values = new Map<string, string>();
  const valueFlags = new Set([
    "--candidate", "--phase", "--expected-root", "--native-identity", "--capture-receipt",
    "--run-id", "--journal-out", "--receipt-out", "--chunk-receipts-out", "--previous-receipt",
    "--previous-journal", "--expected-previous-receipt-root", "--resume-journal", "--expected-resume-journal-sha256",
    "--resume-receipts", "--expected-resume-receipts-sha256",
    "--second-native-identity", "--second-capture-receipt", "--failure-summary-out",
    "--control-transition-source", "--control-transition-candidate-root", "--control-transition-head",
    "--control-transition-before-root", "--control-transition-after-root",
    "--finalize-transition", "--expected-finalize-transition-root",
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--apply") {
      if (apply) fail("--apply is duplicated");
      apply = true;
      continue;
    }
    if (flag === "--compensate") {
      if (compensate) fail("--compensate is duplicated");
      compensate = true;
      continue;
    }
    if (!flag || !valueFlags.has(flag)) fail(`unknown argument ${flag ?? ""}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--") || values.has(flag)) fail(`${flag} is missing or duplicated`);
    values.set(flag, value);
    index += 1;
  }
  for (const flag of [
    "--candidate", "--phase", "--expected-root", "--native-identity", "--capture-receipt",
    "--run-id", "--journal-out", "--receipt-out", "--chunk-receipts-out",
  ]) if (!values.has(flag)) fail(`${flag} is required`);
  const phaseValue = values.get("--phase")!;
  if (!PHASES.has(phaseValue as RunnerPhase)) fail("--phase is invalid");
  const phase = phaseValue as RunnerPhase;
  const expectedRoot = values.get("--expected-root")!;
  const runId = values.get("--run-id")!;
  if (!DIGEST.test(expectedRoot)) fail("--expected-root is invalid");
  if (!SAFE_RUN_ID.test(runId)) fail("--run-id is invalid");
  const previousReceipt = values.get("--previous-receipt");
  const previousJournal = values.get("--previous-journal");
  const expectedPreviousReceiptRoot = values.get("--expected-previous-receipt-root");
  const resumeJournal = values.get("--resume-journal");
  const expectedResumeJournalSha256 = values.get("--expected-resume-journal-sha256");
  const resumeReceipts = values.get("--resume-receipts");
  const expectedResumeReceiptsSha256 = values.get("--expected-resume-receipts-sha256");
  const secondNativeIdentity = values.get("--second-native-identity");
  const secondCaptureReceipt = values.get("--second-capture-receipt");
  const controlTransitionSource = values.get("--control-transition-source");
  const controlTransitionCandidateRoot = values.get("--control-transition-candidate-root");
  const controlTransitionHead = values.get("--control-transition-head");
  const controlTransitionBeforeRoot = values.get("--control-transition-before-root");
  const controlTransitionAfterRoot = values.get("--control-transition-after-root");
  const finalizeTransition = values.get("--finalize-transition");
  const expectedFinalizeTransitionRoot = values.get("--expected-finalize-transition-root");
  const mutation = MUTATION_PHASES.has(phase as LinearRequirementLabelReplacementPhase);
  if (apply !== mutation) fail("--apply is required only for mutation phases");
  if (compensate && !mutation) fail("--compensate is valid only for mutation phases");
  const previousValues = [previousReceipt, previousJournal, expectedPreviousReceiptRoot];
  if (previousValues.some((value) => value !== undefined) && previousValues.some((value) => value === undefined)) {
    fail("previous phase material must be supplied as one exact set");
  }
  if (expectedPreviousReceiptRoot !== undefined && !DIGEST.test(expectedPreviousReceiptRoot)) {
    fail("--expected-previous-receipt-root is invalid");
  }
  if (phase === "rename") {
    if (!compensate && previousReceipt) fail("forward rename cannot accept previous phase material");
    if (compensate && !previousReceipt && !resumeJournal) {
      fail("rename compensation requires either its forward receipt or a pinned failed-run resume journal");
    }
  } else if (!previousReceipt || !DIGEST.test(expectedPreviousReceiptRoot!)) {
    fail(`${phase} requires an exact previous receipt, journal, and root`);
  }
  const resumeValues = [resumeJournal, expectedResumeJournalSha256, resumeReceipts, expectedResumeReceiptsSha256];
  if (resumeValues.some((value) => value !== undefined) && resumeValues.some((value) => value === undefined) ||
    (resumeJournal !== undefined && (!mutation || !DIGEST.test(expectedResumeJournalSha256!) ||
      !DIGEST.test(expectedResumeReceiptsSha256!)))) {
    fail("resume journal and receipt arguments are invalid or outside mutation phases");
  }
  if ((secondNativeIdentity === undefined) !== (secondCaptureReceipt === undefined) ||
    (phase === "finalize") !== (secondNativeIdentity !== undefined)) {
    fail("second stable capture arguments are required only for finalize");
  }
  const transitionValues = [controlTransitionSource, controlTransitionCandidateRoot, controlTransitionHead,
    controlTransitionBeforeRoot, controlTransitionAfterRoot];
  if (transitionValues.some((value) => value !== undefined) &&
    (transitionValues.some((value) => value === undefined) ||
      !COMMIT.test(controlTransitionSource!) || !COMMIT.test(controlTransitionHead!) ||
      !DIGEST.test(controlTransitionCandidateRoot!) || !DIGEST.test(controlTransitionBeforeRoot!) ||
      !DIGEST.test(controlTransitionAfterRoot!))) {
    fail("control transition arguments must be one exact commit and digest set");
  }
  if ((finalizeTransition === undefined) !== (expectedFinalizeTransitionRoot === undefined) ||
    (finalizeTransition !== undefined && (phase !== "finalize" || !DIGEST.test(expectedFinalizeTransitionRoot!)))) {
    fail("finalize transition arguments are invalid or outside finalize");
  }
  return {
    apply,
    compensate,
    candidate: values.get("--candidate")!,
    phase,
    expectedRoot,
    nativeIdentity: values.get("--native-identity")!,
    captureReceipt: values.get("--capture-receipt")!,
    runId,
    journalOut: values.get("--journal-out")!,
    receiptOut: values.get("--receipt-out")!,
    chunkReceiptsOut: values.get("--chunk-receipts-out")!,
    failureSummaryOut: values.get("--failure-summary-out"),
    previousReceipt,
    previousJournal,
    expectedPreviousReceiptRoot,
    resumeJournal,
    expectedResumeJournalSha256,
    resumeReceipts,
    expectedResumeReceiptsSha256,
    secondNativeIdentity,
    secondCaptureReceipt,
    controlTransitionSource,
    controlTransitionCandidateRoot,
    controlTransitionHead,
    controlTransitionBeforeRoot,
    controlTransitionAfterRoot,
    finalizeTransition,
    expectedFinalizeTransitionRoot,
  };
}

function readSafeInput(pathValue: string, label: string, allowEmpty = false): Buffer {
  const absolute = resolve(pathValue);
  let descriptor: number | null = null;
  try {
    const metadata = lstatSync(absolute);
    if (metadata.isSymbolicLink() || !metadata.isFile()) fail(`${label} must be a regular non-symlink file`);
    descriptor = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
    const opened = fstatSync(descriptor);
    if (!opened.isFile() || (!allowEmpty && opened.size < 1) || opened.size > MAX_INPUT_BYTES) fail(`${label} size is unsafe`);
    const bytes = readFileSync(descriptor);
    if (bytes.length !== opened.size) fail(`${label} changed while being read`);
    return bytes;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Linear Requirement label replacement runner:")) throw error;
    return fail(`${label} is unavailable or unsafe`);
  } finally {
    if (descriptor !== null) closeSync(descriptor);
  }
}

function pathExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function newOutputPath(pathValue: string, label: string): string {
  const absolute = resolve(pathValue);
  let parent: string;
  try {
    parent = realpathSync(dirname(absolute));
  } catch {
    fail(`${label} parent is unavailable`);
  }
  const metadata = lstatSync(parent);
  if (!metadata.isDirectory() || metadata.isSymbolicLink()) fail(`${label} parent is unsafe`);
  const output = join(parent, basename(absolute));
  if (pathExists(output)) fail(`${label} must be a new path`);
  return output;
}

function writeAll(descriptor: number, value: string | Buffer): void {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8");
  let offset = 0;
  while (offset < buffer.length) {
    const written = writeSync(descriptor, buffer, offset, buffer.length - offset, null);
    if (written < 1) fail("durable output write did not advance");
    offset += written;
  }
}

function openDurableOutput(path: string): {
  append(value: string | Buffer): void;
  close(): void;
} {
  const descriptor = openSync(
    path,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600,
  );
  let closed = false;
  return {
    append(value): void {
      if (closed) fail("durable output is closed");
      writeAll(descriptor, value);
      fsyncSync(descriptor);
    },
    close(): void {
      if (closed) return;
      fsyncSync(descriptor);
      closeSync(descriptor);
      closed = true;
    },
  };
}

function writeNewDurable(path: string, value: string | Buffer): void {
  const output = openDurableOutput(path);
  try {
    output.append(value);
  } finally {
    output.close();
  }
}

function secretFreeEnvironment(): NodeJS.ProcessEnv {
  const environment = { ...process.env };
  delete environment.LINEAR_API_KEY;
  environment.GIT_OPTIONAL_LOCKS = "0";
  return environment;
}

function controlTreeRoot(repositoryRoot: string, commit: string, environment: NodeJS.ProcessEnv): string {
  const tree = spawnSync("git", ["--no-optional-locks", "ls-tree", "-r", "-z", commit, "--", ...IMMUTABLE_MIGRATION_PATHS], {
    cwd: repositoryRoot,
    encoding: "buffer",
    env: environment,
  });
  if (tree.status !== 0 || tree.signal || tree.error) fail("migration control tree is unavailable");
  return sha256(tree.stdout);
}

function soleParent(
  repositoryRoot: string,
  commit: string,
  environment: NodeJS.ProcessEnv,
): string | null {
  const readback = spawnSync("git", ["--no-optional-locks", "rev-list", "--parents", "-n", "1", commit], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
  });
  if (readback.status !== 0 || readback.signal || readback.error) fail("migration control lineage is unavailable");
  const lineage = readback.stdout.trim().split(/\s+/);
  return lineage.length === 2 && lineage[0] === commit ? lineage[1]! : null;
}

function changedControlPaths(
  repositoryRoot: string,
  before: string,
  after: string,
  environment: NodeJS.ProcessEnv,
): string[] {
  const changed = spawnSync("git", [
    "--no-optional-locks", "diff", "--name-only", "-z", before, after,
  ], { cwd: repositoryRoot, encoding: "buffer", env: environment });
  if (changed.status !== 0 || changed.signal || changed.error) fail("changed migration control paths are unavailable");
  return changed.stdout.toString("utf8").split("\0").filter(Boolean).sort();
}

function exactPathSet(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.join("\0") === [...expected].sort().join("\0");
}

function repositoryHead(
  sourceCommit: string,
  candidateRoot: string,
  transition?: ControlTransition,
  finalizeTransition?: LinearRequirementLabelFinalizeTransitionContract,
): { root: string; head: string } {
  const environment = secretFreeEnvironment();
  const top = spawnSync("git", ["--no-optional-locks", "rev-parse", "--show-toplevel"], {
    cwd: process.cwd(), encoding: "utf8", env: environment,
  });
  if (top.status !== 0 || top.signal || top.error || !top.stdout.trim()) fail("repository root is unavailable");
  const root = realpathSync(top.stdout.trim());
  const head = spawnSync("git", ["--no-optional-locks", "rev-parse", "--verify", "HEAD^{commit}"], {
    cwd: root, encoding: "utf8", env: environment,
  });
  if (head.status !== 0 || head.signal || head.error || !COMMIT.test(head.stdout.trim())) fail("repository HEAD is unavailable");
  const current = head.stdout.trim();
  if (current === sourceCommit) {
    if (transition || finalizeTransition) fail("control transition is not valid without a later main HEAD");
  } else {
    const ancestor = spawnSync("git", ["--no-optional-locks", "merge-base", "--is-ancestor", sourceCommit, current], {
      cwd: root, encoding: "utf8", env: environment,
    });
    const unchanged = spawnSync("git", [
      "--no-optional-locks", "diff", "--quiet", sourceCommit, current, "--", ...IMMUTABLE_MIGRATION_PATHS,
    ], { cwd: root, encoding: "utf8", env: environment });
    if (ancestor.status !== 0 || ancestor.signal || ancestor.error || unchanged.signal || unchanged.error ||
      (unchanged.status !== 0 && unchanged.status !== 1)) {
      fail("HEAD is not a safe descendant with byte-identical migration controls");
    }
    if (unchanged.status === 0) {
      if (transition || finalizeTransition) fail("control transition was supplied for byte-identical migration controls");
    } else {
      const directDiagnostic = transition !== undefined && finalizeTransition === undefined &&
        transition.source === sourceCommit && transition.candidateRoot === candidateRoot &&
        transition.head === current && soleParent(root, current, environment) === sourceCommit &&
        controlTreeRoot(root, sourceCommit, environment) === transition.beforeRoot &&
        controlTreeRoot(root, current, environment) === transition.afterRoot &&
        exactPathSet(changedControlPaths(root, sourceCommit, current, environment), DIAGNOSTIC_CONTROL_TRANSITION_PATHS);
      const exactFinalizeChain = transition !== undefined && finalizeTransition !== undefined &&
        sourceCommit === finalizeTransition.candidateSourceCommit && candidateRoot === finalizeTransition.candidateRoot &&
        transition.source === finalizeTransition.diagnosticCommit && transition.candidateRoot === candidateRoot &&
        transition.head === current && transition.beforeRoot === finalizeTransition.diagnosticControlTreeRoot &&
        soleParent(root, current, environment) === finalizeTransition.diagnosticCommit &&
        soleParent(root, finalizeTransition.diagnosticCommit, environment) === sourceCommit &&
        controlTreeRoot(root, sourceCommit, environment) === finalizeTransition.candidateControlTreeRoot &&
        controlTreeRoot(root, finalizeTransition.diagnosticCommit, environment) === finalizeTransition.diagnosticControlTreeRoot &&
        controlTreeRoot(root, current, environment) === transition.afterRoot &&
        exactPathSet(
          changedControlPaths(root, sourceCommit, finalizeTransition.diagnosticCommit, environment),
          DIAGNOSTIC_CONTROL_TRANSITION_PATHS,
        ) && exactPathSet(
          changedControlPaths(root, finalizeTransition.diagnosticCommit, current, environment),
          FINALIZE_CONTROL_TRANSITION_PATHS,
        );
      if (!directDiagnostic && !exactFinalizeChain) {
        fail("changed migration controls lack an exact digest-pinned transition");
      }
    }
  }
  return { root, head: current };
}

function validateCapture(input: {
  nativeRaw: Buffer;
  receiptRaw: Buffer;
  candidate: LinearRequirementLabelReplacementCandidate;
  head: string;
  label: string;
}): ValidatedCapture {
  const native = parsedJson(input.nativeRaw, `${input.label} native identity`) as LinearRequirementLabelCapture;
  if (native?.schemaVersion !== 1 || native.coverage?.complete !== true || native.workspace?.id !== input.candidate.workspaceId) {
    fail(`${input.label} native identity is incomplete or from another workspace`);
  }
  if (native.labels.some((label) => !Object.prototype.hasOwnProperty.call(label, "retiredAt") ||
    (label.retiredAt !== null && (typeof label.retiredAt !== "string" || label.retiredAt.length === 0)))) {
    fail(`${input.label} native identity lacks exact label retirement proof`);
  }
  const receipt = exactObject(parsedJson(input.receiptRaw, `${input.label} capture receipt`), [
    "schemaVersion", "captureMode", "capturedAt", "fingerprintSha256", "acceptedFingerprintSha256",
    "artifactSha256s", "source",
  ], `${input.label} capture receipt`);
  const artifacts = exactObject(receipt.artifactSha256s, [
    "fingerprint", "nativeIdentity", "documents", "issueDescriptions",
  ], `${input.label} capture receipt artifact hashes`);
  const source = exactObject(receipt.source, ["repository", "commit", "ref", "runId", "runAttempt"], `${input.label} capture receipt source`);
  const nativeSha256 = sha256(input.nativeRaw);
  if (receipt.schemaVersion !== 2 || receipt.captureMode !== "live" || typeof receipt.capturedAt !== "string" ||
    !CANONICAL_UTC.test(receipt.capturedAt) || Number.isNaN(Date.parse(receipt.capturedAt)) ||
    typeof receipt.fingerprintSha256 !== "string" || !DIGEST.test(receipt.fingerprintSha256) ||
    receipt.acceptedFingerprintSha256 !== receipt.fingerprintSha256 || artifacts.fingerprint !== receipt.fingerprintSha256 ||
    artifacts.nativeIdentity !== nativeSha256 || typeof artifacts.documents !== "string" || !DIGEST.test(artifacts.documents) ||
    typeof artifacts.issueDescriptions !== "string" || !DIGEST.test(artifacts.issueDescriptions)) {
    fail(`${input.label} capture receipt does not bind the supplied native identity`);
  }
  if (source.repository !== "meetblakey/sourcera" || source.ref !== "refs/heads/main" ||
    source.commit !== input.head ||
    typeof source.runId !== "string" || !POSITIVE_INTEGER.test(source.runId) ||
    typeof source.runAttempt !== "string" || !POSITIVE_INTEGER.test(source.runAttempt) ||
    (process.env.GITHUB_REPOSITORY !== undefined && source.repository !== process.env.GITHUB_REPOSITORY) ||
    (process.env.GITHUB_SHA !== undefined && source.commit !== process.env.GITHUB_SHA) ||
    (process.env.GITHUB_REF !== undefined && source.ref !== process.env.GITHUB_REF) ||
    (process.env.GITHUB_RUN_ID !== undefined && source.runId !== process.env.GITHUB_RUN_ID) ||
    (process.env.GITHUB_RUN_ATTEMPT !== undefined && source.runAttempt !== process.env.GITHUB_RUN_ATTEMPT)) {
    fail(`${input.label} capture receipt is not exact canonical main and HEAD provenance`);
  }
  return {
    native,
    nativeSha256,
    receiptSha256: sha256(input.receiptRaw),
  };
}

function runnerReceiptBody(receipt: RunnerReceipt): Omit<RunnerReceipt, "root"> {
  const { root: _root, ...body } = receipt;
  return body;
}

function validateCoreReceiptShape(value: unknown, candidate: LinearRequirementLabelReplacementCandidate, index: number): LinearRequirementLabelReplacementPhaseReceipt {
  const row = exactObject(value, [
    "schemaVersion", "kind", "candidateRoot", "operationsRoot", "phase", "direction", "chunk",
    "completedOperations", "phaseOperationCount", "phaseComplete", "journalRecordCount", "journalSha256",
    "terminalRecordSha256", "protectedNativeStateRoot", "previousReceiptRoot", "root",
  ], `previous core receipt ${index + 1}`) as unknown as LinearRequirementLabelReplacementPhaseReceipt;
  if (row.schemaVersion !== 1 || row.kind !== "linear-requirement-label-replacement-phase-receipt" ||
    row.candidateRoot !== candidate.root || row.operationsRoot !== candidate.operationsRoot ||
    !MUTATION_PHASES.has(row.phase) || (row.direction !== "forward" && row.direction !== "compensation") ||
    !DIGEST.test(row.journalSha256) || !DIGEST.test(row.terminalRecordSha256) || !DIGEST.test(row.root) ||
    row.protectedNativeStateRoot !== candidate.protectedNativeStateRoot ||
    row.root !== sha256(canonicalJson((({ root: _root, ...body }) => body)(row)))) {
    fail(`previous core receipt ${index + 1} is invalid`);
  }
  return row;
}

function parseResumeReceipts(input: {
  raw: Buffer;
  expectedSha256: string;
  candidate: LinearRequirementLabelReplacementCandidate;
  phase: LinearRequirementLabelReplacementPhase;
  direction: "forward" | "compensation";
  previousRoot: string | null;
}): LinearRequirementLabelReplacementPhaseReceipt[] {
  if (sha256(input.raw) !== input.expectedSha256) fail("resume receipt digest differs");
  const text = input.raw.toString("utf8");
  if (text !== "" && !text.endsWith("\n")) fail("resume receipts are not newline terminated");
  const receipts = text === "" ? [] : text.trimEnd().split("\n").map((line, index) => {
    let value: unknown;
    try {
      value = JSON.parse(line) as unknown;
    } catch {
      fail(`resume core receipt ${index + 1} is not valid JSON`);
    }
    return validateCoreReceiptShape(value, input.candidate, index);
  });
  let previousRoot = input.previousRoot;
  let compensationSeen = false;
  for (const receipt of receipts) {
    if (receipt.phase !== input.phase || receipt.previousReceiptRoot !== previousRoot ||
      (input.direction === "forward" && receipt.direction !== "forward") ||
      (input.direction === "compensation" && receipt.direction === "forward" && compensationSeen)) {
      fail("resume core receipts are detached from their exact phase or predecessor");
    }
    if (receipt.direction === "compensation") compensationSeen = true;
    previousRoot = receipt.root;
  }
  return receipts;
}

function predecessor(phase: RunnerPhase): RunnerPhase | null {
  if (phase === "rename") return null;
  if (phase === "create") return "rename";
  if (phase === "replace") return "create";
  if (phase === "verify") return "replace";
  if (phase === "retire") return "verify";
  return "retire";
}

function parsePreviousReceipt(
  raw: Buffer,
  expectedRoot: string,
  candidate: LinearRequirementLabelReplacementCandidate,
  nextPhase: RunnerPhase,
  nextDirection: "forward" | "compensation",
): RunnerReceipt {
  const row = exactObject(parsedJson(raw, "previous phase receipt"), [
    "schemaVersion", "kind", "candidateRoot", "operationsRoot", "phase", "runId", "nativeIdentitySha256",
    "captureReceiptSha256", "secondNativeIdentitySha256", "secondCaptureReceiptSha256",
    "direction", "journalSha256", "coreReceipts", "applied", "alreadyApplied", "compensated", "alreadyCompensated", "verification", "previousReceiptRoot",
    "complete", "root",
  ], "previous phase receipt") as unknown as RunnerReceipt;
  if (row.schemaVersion !== 1 || row.kind !== "linear-requirement-label-replacement-runner-receipt" ||
    row.candidateRoot !== candidate.root || row.operationsRoot !== candidate.operationsRoot ||
    (nextDirection === "forward" && row.phase !== predecessor(nextPhase)) ||
    (row.direction !== "forward" && row.direction !== "compensation") ||
    !SAFE_RUN_ID.test(row.runId) || row.complete !== true ||
    !DIGEST.test(row.nativeIdentitySha256) || !DIGEST.test(row.captureReceiptSha256) ||
    (row.secondNativeIdentitySha256 !== null && !DIGEST.test(row.secondNativeIdentitySha256)) ||
    (row.secondCaptureReceiptSha256 !== null && !DIGEST.test(row.secondCaptureReceiptSha256)) ||
    !DIGEST.test(row.journalSha256) ||
    !Array.isArray(row.coreReceipts) || !Number.isInteger(row.applied) || row.applied < 0 ||
    !Number.isInteger(row.alreadyApplied) || row.alreadyApplied < 0 ||
    !Number.isInteger(row.compensated) || row.compensated < 0 ||
    !Number.isInteger(row.alreadyCompensated) || row.alreadyCompensated < 0 ||
    (row.previousReceiptRoot !== null && !DIGEST.test(row.previousReceiptRoot)) ||
    (row.phase === "rename" && row.direction === "forward") !== (row.previousReceiptRoot === null) ||
    (["verify", "finalize"].includes(row.phase) !== (row.verification !== null)) ||
    ((row.phase === "finalize") !== (row.secondNativeIdentitySha256 !== null)) ||
    ((row.phase === "finalize") !== (row.secondCaptureReceiptSha256 !== null)) ||
    row.root !== expectedRoot || row.root !== sha256(canonicalJson(runnerReceiptBody(row)))) {
    fail("previous phase receipt is invalid, detached, or has the wrong predecessor");
  }
  row.coreReceipts = row.coreReceipts.map((receipt, index) => validateCoreReceiptShape(receipt, candidate, index));
  let priorCoreRoot: string | null = null;
  for (const receipt of row.coreReceipts) {
    if (receipt.previousReceiptRoot !== priorCoreRoot) fail("previous core receipt chain is broken");
    priorCoreRoot = receipt.root;
  }
  const expectedTerminalPhase = row.phase === "verify" ? "replace" : row.phase === "finalize" ? "retire" : row.phase;
  const expectedTerminalDirection = row.direction === "compensation" ? "compensation" : "forward";
  const terminal = row.coreReceipts.at(-1);
  if (!terminal || terminal.phase !== expectedTerminalPhase || terminal.direction !== expectedTerminalDirection || terminal.phaseComplete !== true) {
    fail("previous phase receipt lacks its complete terminal core receipt");
  }
  return row;
}

function protectedNativeRoot(
  native: LinearRequirementLabelCapture,
  candidate: LinearRequirementLabelReplacementCandidate,
): string {
  const { issues, labels, coverage, ...rest } = native;
  const ignored = new Set([candidate.oldLabel.id, candidate.newLabel.id]);
  const projection = {
    ...rest,
    issues: issues
      .map((issue) => ({
        ...issue,
        labelIds: [...issue.labelIds].sort().filter((id) => !ignored.has(id)),
      }))
      .sort((left, right) => left.issueUuid.localeCompare(right.issueUuid)),
    labels: labels
      .filter((label) => !ignored.has(label.id))
      .map((label) => structuredClone(label))
      .sort((left, right) => left.id.localeCompare(right.id)),
    coverage: { complete: coverage?.complete === true },
  };
  return sha256(canonicalJson(projection));
}

function captureDiagnostic(
  native: LinearRequirementLabelCapture,
  candidate: LinearRequirementLabelReplacementCandidate,
): CaptureDiagnostic {
  const old = native.labels.filter((label) => label.id === candidate.oldLabel.id);
  const replacement = native.labels.filter((label) => label.id === candidate.newLabel.id);
  const expected = new Set(candidate.issues.map((issue) => issue.issueId));
  const newUses = native.issues.filter((issue) => issue.labelIds.includes(candidate.newLabel.id));
  return {
    oldLabelCount: old.length,
    newLabelCount: replacement.length,
    oldLabelArchivedAtIsNull: old.length === 1 ? old[0]!.archivedAt === null : null,
    oldLabelRetiredAtIsNull: old.length === 1 ? old[0]!.retiredAt === null : null,
    labelTotal: native.labels.length,
    oldLabelUses: native.issues.filter((issue) => issue.labelIds.includes(candidate.oldLabel.id)).length,
    newLabelUses: newUses.length,
    outsideNewLabelUses: newUses.filter((issue) =>
      !expected.has(issue.issueUuid) || issue.teamId !== candidate.requirementsTeamId || issue.archivedAt !== null).length,
    activeRequirementLabelCount: native.labels.filter((label) =>
      label.name === candidate.newLabel.name && label.archivedAt === null && label.retiredAt === null).length,
    protectedRootMatches: protectedNativeRoot(native, candidate) === candidate.protectedNativeStateRoot,
  };
}

class CaptureReplayTransport implements LinearRequirementLabelReplacementTransport {
  private readonly labels: Map<string, LinearRequirementLabelCapture["labels"][number]>;
  private readonly issues: Map<string, LinearRequirementLabelCapture["issues"][number]>;

  constructor(private readonly capture: LinearRequirementLabelCapture) {
    this.labels = new Map(capture.labels.map((label) => [label.id, structuredClone(label)]));
    this.issues = new Map(capture.issues.map((issue) => [issue.issueUuid, structuredClone(issue)]));
  }

  async readLabel(id: string) {
    return structuredClone(this.labels.get(id) ?? null);
  }

  async readIssue(id: string) {
    return structuredClone(this.issues.get(id) ?? null);
  }

  async listIssueIdsByLabel(id: string): Promise<string[]> {
    return this.capture.issues.filter((issue) => issue.labelIds.includes(id)).map((issue) => issue.issueUuid).sort();
  }

  async renameLabel(): Promise<void> { fail("credential-free replay attempted a rename"); }
  async createLabel(): Promise<void> { fail("credential-free replay attempted a create"); }
  async replaceIssueLabels(): Promise<void> { fail("credential-free replay attempted an issue mutation"); }
  async setLabelRetired(): Promise<void> { fail("credential-free replay attempted retirement"); }
}

class CaptureBoundTransport implements LinearRequirementLabelReplacementTransport {
  constructor(
    private readonly http: LinearRequirementLabelHttpTransport,
  ) {}

  async readLabel(id: string) {
    const state = await this.http.readLabel(id);
    if (state === null) return null;
    return {
      id: state.id,
      name: state.name,
      color: state.color,
      description: state.description,
      archivedAt: state.archivedAt,
      retiredAt: state.retiredAt,
      inheritedFromId: state.inheritedFromId,
      isGroup: state.isGroup,
      parentId: state.parentId,
      parentName: state.parentName,
      teamId: state.teamId,
      teamKey: state.teamKey,
    };
  }

  async readIssue(id: string) {
    const state = await this.http.readIssue(id);
    if (state.trashed === true || state.id !== id) fail("direct issue readback differs from its exact identity");
    return {
      issueUuid: state.id,
      identifier: state.identifier,
      title: state.title,
      archivedAt: state.archivedAt,
      descriptionSha256: state.descriptionSha256,
      teamId: state.teamId,
      stateId: state.stateId,
      projectId: state.projectId,
      estimate: state.estimate,
      priority: state.priority,
      dueDate: state.dueDate,
      cycleId: state.cycleId,
      milestoneId: state.milestoneId,
      releaseIds: [...state.releaseIds],
      parentIssueUuid: state.parentIssueUuid,
      assigneeId: state.assigneeId,
      labelIds: [...state.labelIds],
      relationIds: [...state.relationIds],
    };
  }

  async listIssueIdsByLabel(id: string): Promise<string[]> {
    return this.http.listIssueIdsByLabel(id);
  }

  async renameLabel(input: { id: string; name: string }): Promise<void> {
    await this.http.renameLabel(input.id, input.name);
  }

  async createLabel(input: LinearRequirementLabelExpectedLabel): Promise<void> {
    if (input.teamId === null) fail("replacement label team is unavailable");
    await this.http.createLabel({
      id: input.id,
      name: input.name,
      color: input.color,
      description: input.description,
      teamId: input.teamId,
      isGroup: false,
      parentId: null,
    });
  }

  async replaceIssueLabels(input: { issueId: string; labelIds: string[] }): Promise<void> {
    await this.http.replaceIssueLabels(input.issueId, input.labelIds);
  }

  async setLabelRetired(input: { id: string; retired: boolean }): Promise<void> {
    if (input.retired) await this.http.retireLabel(input.id);
    else await this.http.restoreLabel(input.id);
  }
}

function receiptJson(receipt: RunnerReceipt): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

async function main(): Promise<void> {
  const args = parseArgs(runnerArgv);
  failureSummary.phase = args.phase;

  // Resolve every input and output identity before parsing artifacts or consulting credentials.
  const candidateRaw = readSafeInput(args.candidate, "candidate");
  const nativeRaw = readSafeInput(args.nativeIdentity, "native identity");
  const captureReceiptRaw = readSafeInput(args.captureReceipt, "capture receipt");
  const previousReceiptRaw = args.previousReceipt ? readSafeInput(args.previousReceipt, "previous phase receipt") : undefined;
  const previousJournalRaw = args.previousJournal ? readSafeInput(args.previousJournal, "previous phase journal").toString("utf8") : undefined;
  const resumeJournalRaw = args.resumeJournal ? readSafeInput(args.resumeJournal, "resume journal").toString("utf8") : undefined;
  const resumeReceiptsRaw = args.resumeReceipts ? readSafeInput(args.resumeReceipts, "resume core receipts", true) : undefined;
  const secondNativeRaw = args.secondNativeIdentity ? readSafeInput(args.secondNativeIdentity, "second native identity") : undefined;
  const secondCaptureReceiptRaw = args.secondCaptureReceipt ? readSafeInput(args.secondCaptureReceipt, "second capture receipt") : undefined;
  const finalizeTransitionRaw = args.finalizeTransition
    ? readSafeInput(args.finalizeTransition, "finalize transition contract")
    : undefined;
  const journalOut = newOutputPath(args.journalOut, "journal output");
  const receiptOut = newOutputPath(args.receiptOut, "receipt output");
  const chunkReceiptsOut = newOutputPath(args.chunkReceiptsOut, "chunk receipt output");
  resolvedFailureSummaryOut = args.failureSummaryOut
    ? newOutputPath(args.failureSummaryOut, "failure summary output")
    : undefined;
  const outputPaths = [journalOut, receiptOut, chunkReceiptsOut, resolvedFailureSummaryOut]
    .filter((value): value is string => value !== undefined);
  if (new Set(outputPaths).size !== outputPaths.length) fail("runner outputs must differ");

  const candidate = assertLinearRequirementLabelReplacementCandidate(
    parsedJson(candidateRaw, "candidate") as LinearRequirementLabelReplacementCandidate,
  );
  failureSummary.candidateRoot = candidate.root;
  if (candidate.root !== args.expectedRoot) fail("candidate root differs from --expected-root");
  const finalizeTransition = finalizeTransitionRaw ? assertLinearRequirementLabelFinalizeTransitionContract(
    parsedJson(finalizeTransitionRaw, "finalize transition contract") as LinearRequirementLabelFinalizeTransitionContract,
    candidate,
    args.expectedFinalizeTransitionRoot!,
    args.expectedPreviousReceiptRoot!,
  ) : undefined;
  const transition = args.controlTransitionSource ? {
    source: args.controlTransitionSource,
    candidateRoot: args.controlTransitionCandidateRoot!,
    head: args.controlTransitionHead!,
    beforeRoot: args.controlTransitionBeforeRoot!,
    afterRoot: args.controlTransitionAfterRoot!,
  } : undefined;
  const repository = repositoryHead(candidate.sourceCommit, candidate.root, transition, finalizeTransition);
  if (process.env.GITHUB_REPOSITORY !== undefined && process.env.GITHUB_REPOSITORY !== "meetblakey/sourcera") fail("GitHub repository is not canonical");
  if (process.env.GITHUB_REF !== undefined && process.env.GITHUB_REF !== "refs/heads/main") fail("GitHub ref is not exact main");
  if (process.env.GITHUB_SHA !== undefined && process.env.GITHUB_SHA !== repository.head) fail("GitHub SHA differs from repository HEAD");

  failureSummary.code = "capture_validation";
  const capture = validateCapture({
    nativeRaw,
    receiptRaw: captureReceiptRaw,
    candidate,
    head: repository.head,
    label: "phase",
  });
  failureSummary.firstCapture = captureDiagnostic(capture.native, candidate);
  failureSummary.code = "predecessor_validation";
  const previous = previousReceiptRaw
    ? parsePreviousReceipt(
      previousReceiptRaw,
      args.expectedPreviousReceiptRoot!,
      candidate,
      args.phase,
      args.compensate ? "compensation" : "forward",
    )
    : undefined;
  if (previous && (!previousJournalRaw || !previousJournalRaw.endsWith("\n") ||
    sha256(previousJournalRaw) !== previous.journalSha256)) {
    fail("previous phase journal differs from its sealed receipt digest");
  }
  let journalRaw = previousJournalRaw ?? "";
  let coreReceipts = previous?.coreReceipts ?? [];
  if (resumeJournalRaw !== undefined) {
    if (!resumeJournalRaw.endsWith("\n") || sha256(resumeJournalRaw) !== args.expectedResumeJournalSha256 ||
      !resumeJournalRaw.startsWith(journalRaw) || resumeJournalRaw.length < journalRaw.length) {
      fail("resume journal digest or predecessor prefix differs");
    }
    journalRaw = resumeJournalRaw;
    const resumed = parseResumeReceipts({
      raw: resumeReceiptsRaw!,
      expectedSha256: args.expectedResumeReceiptsSha256!,
      candidate,
      phase: args.phase as LinearRequirementLabelReplacementPhase,
      direction: args.compensate ? "compensation" : "forward",
      previousRoot: coreReceipts.at(-1)?.root ?? null,
    });
    coreReceipts = [...coreReceipts, ...resumed];
  }

  let secondCapture: ValidatedCapture | undefined;
  if (secondNativeRaw && secondCaptureReceiptRaw) {
    failureSummary.code = "capture_validation";
    secondCapture = validateCapture({
      nativeRaw: secondNativeRaw,
      receiptRaw: secondCaptureReceiptRaw,
      candidate,
      head: repository.head,
      label: "second",
    });
    failureSummary.secondCapture = captureDiagnostic(secondCapture.native, candidate);
  }

  const comparison = secondCapture
    ? compareLinearRequirementLabelReplacementStableCaptures(capture.native, secondCapture.native)
    : undefined;
  if (comparison) {
    failureSummary.firstCaptureRoot = comparison.firstCaptureRoot;
    failureSummary.secondCaptureRoot = comparison.secondCaptureRoot;
    failureSummary.differingCatalogs = comparison.differingCatalogs;
    failureSummary.firstCatalogRoots = comparison.firstCatalogRoots;
    failureSummary.secondCatalogRoots = comparison.secondCatalogRoots;
  }

  if (finalizeTransition) {
    failureSummary.code = "protected_state_transition_validation";
    verifyLinearRequirementLabelAcceptedProtectedTransition(
      candidate,
      capture.native,
      finalizeTransition,
      finalizeTransition.root,
      args.expectedPreviousReceiptRoot!,
    );
    verifyLinearRequirementLabelAcceptedProtectedTransition(
      candidate,
      secondCapture!.native,
      finalizeTransition,
      finalizeTransition.root,
      args.expectedPreviousReceiptRoot!,
    );
  } else {
    failureSummary.code = "protected_state_validation";
    if (!failureSummary.firstCapture.protectedRootMatches ||
      (failureSummary.secondCapture && !failureSummary.secondCapture.protectedRootMatches)) {
      fail("protected issue, body, relation, or native metadata drifted before the phase");
    }
  }

  let verification: JsonRecord | null = null;
  failureSummary.code = "phase_validation";
  if (args.phase === "rename" && !args.compensate && sha256(canonicalJson(capture.native)) !== candidate.expectedCurrentRoot) {
    if (resumeJournalRaw === undefined) fail("rename capture differs from the candidate expected-current root");
    verifyLinearRequirementLabelRenameRecoveryState(candidate, capture.native);
    const replay = await executeLinearRequirementLabelReplacementPhase({
      candidate,
      expectedCandidateRoot: candidate.root,
      phase: "rename",
      authorization: {
        candidateRoot: candidate.root,
        phase: "rename",
        confirmation: "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
      },
      runId: args.runId,
      transport: new CaptureReplayTransport(capture.native),
      resumeJournalRaw: journalRaw,
      expectedResumeJournalSha256: sha256(journalRaw),
      receipts: coreReceipts,
    });
    if (replay.applied !== 0 || replay.alreadyApplied !== 1) {
      fail("rename recovery capture is not the exact journal-proven post-rename state");
    }
  }
  if (args.phase === "verify") {
    const replay = await executeLinearRequirementLabelReplacementPhase({
      candidate,
      expectedCandidateRoot: candidate.root,
      phase: "replace",
      authorization: {
        candidateRoot: candidate.root,
        phase: "replace",
        confirmation: "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
      },
      runId: args.runId,
      transport: new CaptureReplayTransport(capture.native),
      resumeJournalRaw: journalRaw,
      expectedResumeJournalSha256: sha256(journalRaw),
      receipts: coreReceipts,
    });
    if (replay.applied !== 0 || replay.appendedJournalRaw !== "") fail("replace proof was not a read-only complete replay");
    coreReceipts = [...coreReceipts, ...replay.receipts];
    verification = verifyLinearRequirementLabelReplacementUsage(candidate, capture.native, { oldRetired: false });
  }
  if (args.phase === "finalize") {
    failureSummary.code = "retirement_replay_validation";
    const replay = await executeLinearRequirementLabelReplacementPhase({
      candidate,
      expectedCandidateRoot: candidate.root,
      phase: "retire",
      authorization: {
        candidateRoot: candidate.root,
        phase: "retire",
        confirmation: "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
      },
      runId: args.runId,
      transport: new CaptureReplayTransport(capture.native),
      resumeJournalRaw: journalRaw,
      expectedResumeJournalSha256: sha256(journalRaw),
      receipts: coreReceipts,
    });
    if (replay.applied !== 0 || replay.appendedJournalRaw !== "") fail("retirement proof was not a read-only complete replay");
    coreReceipts = [...coreReceipts, ...replay.receipts];
    failureSummary.code = "stable_capture_validation";
    const final = finalizeTransition
      ? verifyLinearRequirementLabelReplacementFinalWithTransition({
        candidate,
        transition: finalizeTransition,
        expectedTransitionRoot: finalizeTransition.root,
        expectedPreviousReceiptRoot: args.expectedPreviousReceiptRoot!,
        first: capture.native,
        second: secondCapture!.native,
        firstCaptureSha256: capture.nativeSha256,
        secondCaptureSha256: secondCapture!.nativeSha256,
      })
      : verifyLinearRequirementLabelReplacementFinal({
        candidate,
        first: capture.native,
        second: secondCapture!.native,
        firstCaptureSha256: capture.nativeSha256,
        secondCaptureSha256: secondCapture!.nativeSha256,
      });
    verification = JSON.parse(canonicalLinearRequirementLabelReplacementFinalReceiptJson(final)) as JsonRecord;
  }

  // Pure validation is complete. Only mutation phases consult the credential or build HTTP state.
  let applied = 0;
  let alreadyApplied = 0;
  let compensated = 0;
  let alreadyCompensated = 0;
  failureSummary.code = "evidence_persistence";
  const journal = openDurableOutput(journalOut);
  const chunkReceipts = openDurableOutput(chunkReceiptsOut);
  try {
    if (journalRaw.length > 0) journal.append(journalRaw);
    if (resumeReceiptsRaw && resumeReceiptsRaw.length > 0) chunkReceipts.append(resumeReceiptsRaw);
    if (MUTATION_PHASES.has(args.phase as LinearRequirementLabelReplacementPhase)) {
      failureSummary.code = "phase_execution";
      const credential = process.env.LINEAR_API_KEY;
      if (!credential) fail("LINEAR_API_KEY is unavailable");
      const transport = new CaptureBoundTransport(
        new LinearRequirementLabelHttpTransport({ credential }),
      );
      const phase = args.phase as LinearRequirementLabelReplacementPhase;
      const common = {
        candidate,
        expectedCandidateRoot: args.expectedRoot,
        phase,
        runId: args.runId,
        transport,
        resumeJournalRaw: journalRaw || undefined,
        expectedResumeJournalSha256: journalRaw ? sha256(journalRaw) : undefined,
        receipts: coreReceipts,
        journalSink: (line: string) => journal.append(line),
        receiptSink: (receipt: LinearRequirementLabelReplacementPhaseReceipt) => {
          chunkReceipts.append(`${JSON.stringify(receipt)}\n`);
        },
      };
      if (args.compensate) {
        const result = await compensateLinearRequirementLabelReplacementPhase({
          ...common,
          resumeJournalRaw: journalRaw,
          expectedResumeJournalSha256: sha256(journalRaw),
          authorization: {
            candidateRoot: candidate.root,
            phase,
            confirmation: "COMPENSATE_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
          },
        });
        journalRaw = result.journalRaw;
        coreReceipts = [...coreReceipts, ...result.receipts];
        compensated = result.compensated;
        alreadyCompensated = result.alreadyCompensated;
      } else {
        const result = await executeLinearRequirementLabelReplacementPhase({
          ...common,
          authorization: {
            candidateRoot: candidate.root,
            phase,
            confirmation: "APPLY_LINEAR_REQUIREMENT_LABEL_REPLACEMENT_PHASE",
          },
        });
        journalRaw = result.journalRaw;
        coreReceipts = [...coreReceipts, ...result.receipts];
        applied = result.applied;
        alreadyApplied = result.alreadyApplied;
      }
      failureSummary.code = "evidence_persistence";
    }
  } finally {
    chunkReceipts.close();
    journal.close();
  }

  const durableJournal = readSafeInput(journalOut, "durable journal output").toString("utf8");
  if (durableJournal !== journalRaw || !durableJournal.endsWith("\n")) fail("durable journal output differs from the validated chain");
  const body = {
    schemaVersion: 1 as const,
    kind: "linear-requirement-label-replacement-runner-receipt" as const,
    candidateRoot: candidate.root,
    operationsRoot: candidate.operationsRoot,
    phase: args.phase,
    direction: args.compensate ? "compensation" as const : "forward" as const,
    runId: args.runId,
    nativeIdentitySha256: capture.nativeSha256,
    captureReceiptSha256: capture.receiptSha256,
    secondNativeIdentitySha256: secondCapture?.nativeSha256 ?? null,
    secondCaptureReceiptSha256: secondCapture?.receiptSha256 ?? null,
    journalSha256: sha256(journalRaw),
    coreReceipts,
    applied,
    alreadyApplied,
    compensated,
    alreadyCompensated,
    verification,
    previousReceiptRoot: previous?.root ?? null,
    complete: true as const,
  };
  const receipt: RunnerReceipt = { ...body, root: sha256(canonicalJson(body)) };
  writeNewDurable(receiptOut, receiptJson(receipt));
  process.stdout.write(`${JSON.stringify({
    ok: true,
    phase: args.phase,
    direction: receipt.direction,
    candidateRoot: candidate.root,
    applied,
    alreadyApplied,
    compensated,
    alreadyCompensated,
    journalSha256: receipt.journalSha256,
    receiptRoot: receipt.root,
  })}\n`);
}

main().catch(() => {
  try {
    const path = resolvedFailureSummaryOut ?? (preliminaryFailureSummaryOut
      ? newOutputPath(preliminaryFailureSummaryOut, "failure summary output")
      : undefined);
    if (path) writeNewDurable(path, `${JSON.stringify(failureSummary, null, 2)}\n`);
  } catch {
    // The primary failure remains fail-closed and generic if evidence cannot be written safely.
  }
  process.stderr.write("Linear Requirement label replacement failed\n");
  process.exitCode = 1;
});
