import { createHash, createHmac, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  linkSync,
  mkdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";

import {
  createConvexProductionProbePayload,
  readConvexProductionTarget,
  type ConvexProductionTarget,
} from "@sourcera/domain/convex";

const SAMPLE_COUNT = 20;
const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const SHA256 = /^[a-f0-9]{64}$/i;
const SAFE_ENVIRONMENT_KEYS = [
  "CI",
  "FORCE_COLOR",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "NODE_EXTRA_CA_CERTS",
  "NO_COLOR",
  "PATH",
  "SHELL",
  "SSL_CERT_DIR",
  "SSL_CERT_FILE",
  "TEMP",
  "TERM",
  "TMP",
  "TMPDIR",
  "TZ",
] as const;
const BOOTSTRAP_ENVIRONMENT_KEYS = [
  "GITHUB_REPOSITORY",
  "GITHUB_RUN_ATTEMPT",
  "GITHUB_RUN_ID",
  "SOURCERA_CONVEX_CANARY_SECRET",
  "SOURCERA_ENV",
  "SOURCERA_KNOWN_GOOD_SHA",
  "SOURCERA_RELEASE_APPROVED_SHA",
] as const;
const FORBIDDEN_BOOTSTRAP_CREDENTIAL_KEYS = [
  "CONVEX_ADMIN_KEY",
  "CONVEX_DEPLOY_KEY",
  "CONVEX_DEPLOYMENT",
  "CONVEX_SELF_HOSTED_ADMIN_KEY",
  "CONVEX_SELF_HOSTED_URL",
  "CONVEX_URL",
  "GH_TOKEN",
  "GITHUB_TOKEN",
  "NEXT_PUBLIC_CONVEX_URL",
  "SOURCERA_RELEASE_GITHUB_TOKEN",
  "VERCEL_TOKEN",
] as const;

export type ConvexProductionBootstrapEnvironment = Record<
  string,
  string | undefined
>;

export interface ConvexProductionBootstrapIdentity {
  approvedCandidateSha: string;
  canarySecret: string;
  githubRepository: "meetblakey/sourcera";
  githubRunAttempt: 1;
  githubRunId: number;
  knownGoodSha: string;
}

export interface GithubProductionApprovalReceipt {
  approval: {
    reviewer: { id: 15627406; login: "meetblakey" };
    state: "approved";
  };
  approvedSha: string;
  checkedAt: string;
  environment: "sourcera-production-release";
  event: "github_production_release_approval_receipt";
  repository: "meetblakey/sourcera";
  result: "passed";
  run: { attempt: 1; headSha: string; id: number };
  schemaVersion: 1;
  sourceProofSha256: string;
}

export interface ConvexProductionBootstrapArguments {
  approvalReceiptPath: string;
  receiptOutputPath: string;
}

export interface ConvexProductionBootstrapQueryArguments {
  authorization: string;
  commitSha: string;
  deploymentName: string;
  environment: "production";
  issuedAt: number;
  nonceHash: string;
  releaseApprovedSha: string;
  sample: number;
}

export interface ConvexProductionGenesisReceipt {
  anchorAllowed: true;
  approvedCandidateSha: string;
  checkedAt: string;
  checkout: {
    candidateSha: string;
    clean: true;
    knownGoodIsAncestor: true;
    knownGoodSha: string;
  };
  credentialClass: "canary_hmac_only";
  event: "convex_production_genesis_receipt";
  github: {
    approvalReceiptSha256: string;
    environment: "sourcera-production-release";
    headSha: string;
    runAttempt: 1;
    runId: number;
  };
  knownGoodSha: string;
  promotionAllowed: false;
  proof: {
    function: "foundation:observeProductionProbe";
    kind: "observe_only_missing_nonce";
    latencyP95Ms: number;
    latencyP99Ms: number;
    nonceSetSha256: string;
    nullResponses: 20;
    responsesSha256: string;
    sampleCount: 20;
  };
  providerMutationCount: 0;
  result: "passed";
  runtimeIdentity: {
    buildCommitSha: string;
    deploymentName: string;
  };
  schemaVersion: 1;
  target: ConvexProductionTarget;
}

export interface ConvexProductionGenesisExpectation {
  approvedCandidateSha: string;
  approvalReceiptSha256: string;
  githubRunAttempt: number;
  githubRunId: number;
  knownGoodSha: string;
  target: ConvexProductionTarget;
}

export interface ConvexProductionBootstrapInput {
  approvedCandidateSha: string;
  canarySecret: string;
  checkout: ConvexProductionGenesisReceipt["checkout"];
  github: ConvexProductionGenesisReceipt["github"];
  knownGoodSha: string;
  target: ConvexProductionTarget;
}

export interface ConvexProductionBootstrapDependencies {
  monotonicNow?: () => number;
  now?: () => number;
  query(arguments_: ConvexProductionBootstrapQueryArguments): Promise<unknown>;
  randomId?: () => string;
  sampleTimeoutMs?: number;
}

function percentile(values: number[], percentileValue: number) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.max(0, Math.ceil(percentileValue * sorted.length) - 1);
  return sorted[index];
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Convex genesis bootstrap read timed out")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readConvexProductionBootstrapEnvironment(
  source: ConvexProductionBootstrapEnvironment,
): ConvexProductionBootstrapIdentity {
  const forbidden = FORBIDDEN_BOOTSTRAP_CREDENTIAL_KEYS.find(
    (key) => source[key] !== undefined,
  );
  if (forbidden) {
    throw new Error(`${forbidden} is forbidden in the Convex bootstrap lane`);
  }
  const canarySecret = source.SOURCERA_CONVEX_CANARY_SECRET;
  const knownGoodSha = source.SOURCERA_KNOWN_GOOD_SHA;
  const approvedCandidateSha = source.SOURCERA_RELEASE_APPROVED_SHA;
  const runId = Number(source.GITHUB_RUN_ID);
  const runAttempt = Number(source.GITHUB_RUN_ATTEMPT);
  if (
    !canarySecret ||
    canarySecret.length < 32 ||
    canarySecret !== canarySecret.trim() ||
    source.SOURCERA_ENV !== "production" ||
    !knownGoodSha ||
    !FULL_GIT_COMMIT_SHA.test(knownGoodSha) ||
    !approvedCandidateSha ||
    !FULL_GIT_COMMIT_SHA.test(approvedCandidateSha) ||
    knownGoodSha === approvedCandidateSha ||
    source.GITHUB_REPOSITORY !== "meetblakey/sourcera" ||
    !Number.isSafeInteger(runId) ||
    runId < 1 ||
    runAttempt !== 1
  ) {
    throw new Error("Convex bootstrap environment is incomplete");
  }
  return {
    approvedCandidateSha,
    canarySecret,
    githubRepository: "meetblakey/sourcera",
    githubRunAttempt: 1,
    githubRunId: runId,
    knownGoodSha,
  };
}

export function createConvexProductionBootstrapEnvironment(
  source: ConvexProductionBootstrapEnvironment,
): ConvexProductionBootstrapEnvironment {
  const isolated: ConvexProductionBootstrapEnvironment = {};
  for (const key of [
    ...SAFE_ENVIRONMENT_KEYS,
    ...BOOTSTRAP_ENVIRONMENT_KEYS,
  ]) {
    if (source[key] !== undefined) isolated[key] = source[key];
  }
  readConvexProductionBootstrapEnvironment(isolated);
  return isolated;
}

function requireExactKeys(
  value: Record<string, unknown>,
  expected: string[],
  context: string,
) {
  const actual = Object.keys(value).sort();
  const required = [...expected].sort();
  if (
    actual.length !== required.length ||
    actual.some((key, index) => key !== required[index])
  ) {
    throw new Error(`${context} fields are invalid`);
  }
}

export function readGithubProductionApprovalReceipt(
  value: unknown,
  expected: Omit<ConvexProductionBootstrapIdentity, "canarySecret" | "knownGoodSha">,
): GithubProductionApprovalReceipt {
  if (!isRecord(value)) {
    throw new Error("GitHub production approval receipt is incomplete");
  }
  requireExactKeys(
    value,
    [
      "approval",
      "approvedSha",
      "checkedAt",
      "environment",
      "event",
      "repository",
      "result",
      "run",
      "schemaVersion",
      "sourceProofSha256",
    ],
    "GitHub production approval receipt",
  );
  if (
    value.schemaVersion !== 1 ||
    value.event !== "github_production_release_approval_receipt" ||
    value.result !== "passed" ||
    value.approvedSha !== expected.approvedCandidateSha ||
    !FULL_GIT_COMMIT_SHA.test(expected.approvedCandidateSha) ||
    value.repository !== expected.githubRepository ||
    value.environment !== "sourcera-production-release" ||
    typeof value.checkedAt !== "string" ||
    new Date(value.checkedAt).toISOString() !== value.checkedAt ||
    typeof value.sourceProofSha256 !== "string" ||
    !SHA256.test(value.sourceProofSha256) ||
    !isRecord(value.run) ||
    !isRecord(value.approval)
  ) {
    throw new Error("GitHub production approval receipt is invalid");
  }
  requireExactKeys(value.run, ["attempt", "headSha", "id"], "GitHub run");
  if (
    value.run.id !== expected.githubRunId ||
    value.run.attempt !== expected.githubRunAttempt ||
    value.run.attempt !== 1 ||
    value.run.headSha !== expected.approvedCandidateSha
  ) {
    throw new Error("GitHub production approval run is invalid");
  }
  requireExactKeys(
    value.approval,
    ["reviewer", "state"],
    "GitHub environment approval",
  );
  if (
    value.approval.state !== "approved" ||
    !isRecord(value.approval.reviewer)
  ) {
    throw new Error("GitHub environment approval is invalid");
  }
  requireExactKeys(
    value.approval.reviewer,
    ["id", "login"],
    "GitHub approval reviewer",
  );
  if (
    value.approval.reviewer.id !== 15627406 ||
    value.approval.reviewer.login !== "meetblakey"
  ) {
    throw new Error("GitHub approval reviewer is invalid");
  }
  return value as unknown as GithubProductionApprovalReceipt;
}

export function readConvexProductionBootstrapArguments(
  arguments_: string[],
  repositoryRoot: string,
): ConvexProductionBootstrapArguments {
  const values = new Map<string, string>();
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];
    if (
      !["--approval-receipt", "--receipt-out"].includes(option ?? "") ||
      !value?.trim() ||
      value.startsWith("--") ||
      values.has(option)
    ) {
      throw new Error(
        "Usage: bootstrap-convex-production --approval-receipt <path> --receipt-out <path>",
      );
    }
    values.set(option, value);
  }
  if (values.size !== 2) {
    throw new Error(
      "Usage: bootstrap-convex-production --approval-receipt <path> --receipt-out <path>",
    );
  }
  const approvalReceiptPath = canonicalizePotentialPath(
    values.get("--approval-receipt")!,
  );
  const receiptOutputPath = canonicalizePotentialPath(
    values.get("--receipt-out")!,
  );
  requireOutsideRepository(approvalReceiptPath, repositoryRoot);
  requireOutsideRepository(receiptOutputPath, repositoryRoot);
  if (!existsSync(approvalReceiptPath)) {
    throw new Error("--approval-receipt must name an existing receipt");
  }
  if (existsSync(receiptOutputPath)) {
    throw new Error("--receipt-out must not already exist");
  }
  if (approvalReceiptPath === receiptOutputPath) {
    throw new Error("Convex bootstrap receipt paths must be distinct");
  }
  return { approvalReceiptPath, receiptOutputPath };
}

function gitCommand(repositoryRoot: string, arguments_: string[]) {
  const environment: NodeJS.ProcessEnv = {
    NODE_ENV: process.env.NODE_ENV ?? "production",
  };
  for (const key of SAFE_ENVIRONMENT_KEYS) {
    if (process.env[key] !== undefined) environment[key] = process.env[key];
  }
  const result = spawnSync("git", arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
  });
  if (result.error || result.status !== 0) {
    throw new Error("Convex genesis bootstrap Git proof failed");
  }
  return result.stdout.trim();
}

export function readCleanConvexProductionBootstrapCheckout(
  repositoryRoot: string,
  knownGoodSha: string,
  approvedCandidateSha: string,
): ConvexProductionGenesisReceipt["checkout"] {
  if (
    !FULL_GIT_COMMIT_SHA.test(knownGoodSha) ||
    !FULL_GIT_COMMIT_SHA.test(approvedCandidateSha) ||
    knownGoodSha === approvedCandidateSha
  ) {
    throw new Error("Convex genesis checkout SHAs are invalid");
  }
  const canonicalRoot = realpathSync(repositoryRoot);
  const topLevel = realpathSync(
    gitCommand(canonicalRoot, ["rev-parse", "--show-toplevel"]),
  );
  const headSha = gitCommand(canonicalRoot, ["rev-parse", "HEAD"]);
  const status = gitCommand(canonicalRoot, [
    "status",
    "--porcelain",
    "--untracked-files=all",
  ]);
  if (topLevel !== canonicalRoot || headSha !== approvedCandidateSha || status) {
    throw new Error("Convex genesis bootstrap requires a clean exact checkout");
  }
  gitCommand(canonicalRoot, ["cat-file", "-e", `${knownGoodSha}^{commit}`]);
  gitCommand(canonicalRoot, [
    "merge-base",
    "--is-ancestor",
    knownGoodSha,
    approvedCandidateSha,
  ]);
  return {
    candidateSha: approvedCandidateSha,
    clean: true,
    knownGoodIsAncestor: true,
    knownGoodSha,
  };
}

export async function createConvexProductionGenesisReceipt(
  input: ConvexProductionBootstrapInput,
  dependencies: ConvexProductionBootstrapDependencies,
): Promise<ConvexProductionGenesisReceipt> {
  if (
    !FULL_GIT_COMMIT_SHA.test(input.knownGoodSha) ||
    !FULL_GIT_COMMIT_SHA.test(input.approvedCandidateSha) ||
    input.knownGoodSha === input.approvedCandidateSha
  ) {
    throw new Error("Convex genesis bootstrap requires distinct exact Git SHAs");
  }
  if (input.canarySecret.length < 32) {
    throw new Error("Convex genesis bootstrap canary secret is invalid");
  }
  const target = readConvexProductionTarget(
    input.target.deploymentName,
    input.target.deploymentUrl,
  );
  if (
    input.checkout.candidateSha !== input.approvedCandidateSha ||
    input.checkout.knownGoodSha !== input.knownGoodSha ||
    input.checkout.clean !== true ||
    input.checkout.knownGoodIsAncestor !== true ||
    input.github.approvalReceiptSha256 === undefined ||
    !SHA256.test(input.github.approvalReceiptSha256) ||
    input.github.environment !== "sourcera-production-release" ||
    input.github.headSha !== input.approvedCandidateSha ||
    input.github.runAttempt !== 1 ||
    !Number.isSafeInteger(input.github.runId) ||
    input.github.runId < 1
  ) {
    throw new Error("Convex genesis bootstrap release binding is invalid");
  }

  const now = dependencies.now ?? Date.now;
  const monotonicNow = dependencies.monotonicNow ?? performance.now.bind(performance);
  const randomId = dependencies.randomId ?? randomUUID;
  const sampleTimeoutMs = dependencies.sampleTimeoutMs ?? 5_000;
  if (
    !Number.isSafeInteger(sampleTimeoutMs) ||
    sampleTimeoutMs < 1 ||
    sampleTimeoutMs > 30_000
  ) {
    throw new Error("Convex genesis bootstrap timeout is invalid");
  }
  const observations: Array<{
    latencyMs: number;
    nonceHash: string;
    result: null;
  }> = [];

  for (let sample = 1; sample <= SAMPLE_COUNT; sample += 1) {
    const issuedAt = now();
    const nonceHash = sha256(
      [
        input.knownGoodSha,
        input.approvedCandidateSha,
        String(input.github.runId),
        String(sample),
        randomId(),
      ].join(":"),
    );
    const unsigned = {
      commitSha: input.knownGoodSha,
      deploymentName: target.deploymentName,
      environment: "production" as const,
      issuedAt,
      nonceHash,
      releaseApprovedSha: input.knownGoodSha,
      sample,
    };
    const arguments_: ConvexProductionBootstrapQueryArguments = {
      authorization: createHmac("sha256", input.canarySecret)
        .update(createConvexProductionProbePayload("observe", unsigned))
        .digest("hex"),
      ...unsigned,
    };
    const startedAt = monotonicNow();
    const result = await withTimeout(
      dependencies.query(arguments_),
      sampleTimeoutMs,
    );
    const latencyMs = Math.max(0, Math.round(monotonicNow() - startedAt));
    if (result !== null) {
      throw new Error("Convex genesis bootstrap nonce already exists");
    }
    observations.push({ latencyMs, nonceHash, result });
  }

  const nonces = observations.map(({ nonceHash }) => nonceHash);
  const latencies = observations.map(({ latencyMs }) => latencyMs);
  const receipt: ConvexProductionGenesisReceipt = {
    anchorAllowed: true,
    approvedCandidateSha: input.approvedCandidateSha,
    checkedAt: new Date(now()).toISOString(),
    checkout: input.checkout,
    credentialClass: "canary_hmac_only",
    event: "convex_production_genesis_receipt",
    github: input.github,
    knownGoodSha: input.knownGoodSha,
    promotionAllowed: false,
    proof: {
      function: "foundation:observeProductionProbe",
      kind: "observe_only_missing_nonce",
      latencyP95Ms: percentile(latencies, 0.95),
      latencyP99Ms: percentile(latencies, 0.99),
      nonceSetSha256: sha256([...nonces].sort().join("\n")),
      nullResponses: 20,
      responsesSha256: sha256(JSON.stringify(observations)),
      sampleCount: 20,
    },
    providerMutationCount: 0,
    result: "passed",
    runtimeIdentity: {
      buildCommitSha: input.knownGoodSha,
      deploymentName: target.deploymentName,
    },
    schemaVersion: 1,
    target,
  };
  return readPassingConvexProductionGenesisReceipt(receipt, {
    approvedCandidateSha: input.approvedCandidateSha,
    approvalReceiptSha256: input.github.approvalReceiptSha256,
    githubRunAttempt: input.github.runAttempt,
    githubRunId: input.github.runId,
    knownGoodSha: input.knownGoodSha,
    target: input.target,
  });
}

export function readPassingConvexProductionGenesisReceipt(
  value: unknown,
  expected: ConvexProductionGenesisExpectation,
): ConvexProductionGenesisReceipt {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    value.event !== "convex_production_genesis_receipt" ||
    value.result !== "passed" ||
    value.anchorAllowed !== true ||
    value.promotionAllowed !== false ||
    value.providerMutationCount !== 0 ||
    value.knownGoodSha !== expected.knownGoodSha ||
    value.approvedCandidateSha !== expected.approvedCandidateSha ||
    !isRecord(value.target) ||
    value.target.deploymentName !== expected.target.deploymentName ||
    value.target.deploymentUrl !== expected.target.deploymentUrl ||
    !isRecord(value.github) ||
    value.github.approvalReceiptSha256 !== expected.approvalReceiptSha256 ||
    value.github.runId !== expected.githubRunId ||
    value.github.runAttempt !== expected.githubRunAttempt
  ) {
    throw new Error("Convex genesis receipt does not match this release");
  }
  requireExactKeys(
    value,
    [
      "anchorAllowed",
      "approvedCandidateSha",
      "checkedAt",
      "checkout",
      "credentialClass",
      "event",
      "github",
      "knownGoodSha",
      "promotionAllowed",
      "proof",
      "providerMutationCount",
      "result",
      "runtimeIdentity",
      "schemaVersion",
      "target",
    ],
    "Convex genesis receipt",
  );
  if (
    !FULL_GIT_COMMIT_SHA.test(expected.knownGoodSha) ||
    !FULL_GIT_COMMIT_SHA.test(expected.approvedCandidateSha) ||
    expected.knownGoodSha === expected.approvedCandidateSha ||
    !SHA256.test(expected.approvalReceiptSha256) ||
    !Number.isSafeInteger(expected.githubRunId) ||
    expected.githubRunId < 1 ||
    expected.githubRunAttempt !== 1 ||
    typeof value.checkedAt !== "string" ||
    new Date(value.checkedAt).toISOString() !== value.checkedAt ||
    value.credentialClass !== "canary_hmac_only"
  ) {
    throw new Error("Convex genesis receipt header is invalid");
  }

  const target = value.target;
  requireExactKeys(target, ["deploymentName", "deploymentUrl"], "Convex target");
  readConvexProductionTarget(
    String(target.deploymentName),
    String(target.deploymentUrl),
  );

  const github = value.github;
  requireExactKeys(
    github,
    [
      "approvalReceiptSha256",
      "environment",
      "headSha",
      "runAttempt",
      "runId",
    ],
    "Convex genesis GitHub binding",
  );
  if (
    github.environment !== "sourcera-production-release" ||
    github.headSha !== expected.approvedCandidateSha ||
    !SHA256.test(String(github.approvalReceiptSha256)) ||
    github.runAttempt !== 1 ||
    !Number.isSafeInteger(github.runId) ||
    Number(github.runId) < 1
  ) {
    throw new Error("Convex genesis GitHub binding is invalid");
  }

  if (!isRecord(value.checkout)) {
    throw new Error("Convex genesis checkout proof is invalid");
  }
  requireExactKeys(
    value.checkout,
    ["candidateSha", "clean", "knownGoodIsAncestor", "knownGoodSha"],
    "Convex genesis checkout proof",
  );
  if (
    value.checkout.candidateSha !== expected.approvedCandidateSha ||
    value.checkout.knownGoodSha !== expected.knownGoodSha ||
    value.checkout.clean !== true ||
    value.checkout.knownGoodIsAncestor !== true
  ) {
    throw new Error("Convex genesis checkout proof is invalid");
  }

  if (!isRecord(value.proof)) {
    throw new Error("Convex genesis observe-only proof is invalid");
  }
  requireExactKeys(
    value.proof,
    [
      "function",
      "kind",
      "latencyP95Ms",
      "latencyP99Ms",
      "nonceSetSha256",
      "nullResponses",
      "responsesSha256",
      "sampleCount",
    ],
    "Convex genesis observe-only proof",
  );
  if (
    value.proof.function !== "foundation:observeProductionProbe" ||
    value.proof.kind !== "observe_only_missing_nonce" ||
    value.proof.sampleCount !== SAMPLE_COUNT ||
    value.proof.nullResponses !== SAMPLE_COUNT ||
    !SHA256.test(String(value.proof.nonceSetSha256)) ||
    !SHA256.test(String(value.proof.responsesSha256)) ||
    typeof value.proof.latencyP95Ms !== "number" ||
    value.proof.latencyP95Ms < 0 ||
    value.proof.latencyP95Ms > 500 ||
    typeof value.proof.latencyP99Ms !== "number" ||
    value.proof.latencyP99Ms < value.proof.latencyP95Ms ||
    value.proof.latencyP99Ms > 1_000
  ) {
    throw new Error("Convex genesis observe-only proof is invalid");
  }

  if (!isRecord(value.runtimeIdentity)) {
    throw new Error("Convex genesis runtime identity is invalid");
  }
  requireExactKeys(
    value.runtimeIdentity,
    ["buildCommitSha", "deploymentName"],
    "Convex genesis runtime identity",
  );
  if (
    value.runtimeIdentity.buildCommitSha !== expected.knownGoodSha ||
    value.runtimeIdentity.deploymentName !== expected.target.deploymentName
  ) {
    throw new Error("Convex genesis runtime identity is invalid");
  }
  return value as unknown as ConvexProductionGenesisReceipt;
}

function canonicalizePotentialPath(value: string) {
  let ancestor = path.resolve(value);
  const missing: string[] = [];
  while (!existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  return path.join(realpathSync(ancestor), ...missing);
}

function requireOutsideRepository(value: string, repositoryRoot: string) {
  const canonicalRoot = realpathSync(repositoryRoot);
  const relative = path.relative(canonicalRoot, value);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("Convex genesis receipt must remain outside the repository");
  }
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error;
}

export function writeConvexProductionGenesisReceipt(
  receiptPath: string,
  receipt: unknown,
  repositoryRoot: string,
  expected: ConvexProductionGenesisExpectation,
) {
  const validated = readPassingConvexProductionGenesisReceipt(
    receipt,
    expected,
  );
  const outputPath = canonicalizePotentialPath(receiptPath);
  requireOutsideRepository(outputPath, repositoryRoot);
  const directory = path.dirname(outputPath);
  mkdirSync(directory, { recursive: true });
  const temporaryPath = path.join(
    directory,
    `.${path.basename(outputPath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  writeFileSync(temporaryPath, `${JSON.stringify(validated, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  try {
    linkSync(temporaryPath, outputPath);
  } catch (error) {
    if (isNodeError(error) && error.code === "EEXIST") {
      throw new Error(`Convex genesis receipt already exists: ${outputPath}`);
    }
    throw error;
  } finally {
    rmSync(temporaryPath, { force: true });
  }
  return outputPath;
}
