import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionTargets from "../config/production-targets.json";
import {
  type VercelProductionBaselineStageReceipt,
  stageVercelProductionBaseline,
} from "./lib/vercel-production-baseline";
import {
  createVercelProductionBaselineProvider,
  requireOutsideRepository,
  writePrivateJsonReceipt,
} from "./lib/vercel-production-baseline-provider";
import {
  readVercelProductionBaselineGithubHandoff,
  type VercelProductionBaselineGithubHandoff,
} from "./lib/vercel-production-baseline-workflow";
import { readProductionPreflightBundle } from "./lib/production-release-workflow";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const SHA256 = /^[a-f0-9]{64}$/;
const FULL_GIT_COMMIT_SHA = /^[a-f0-9]{40}$/i;

export interface VercelProductionBaselineWorkflowBinding {
  approvalArtifactDigest: string;
  githubApprovalSha256: string;
  githubHandoffSha256: string;
  githubProofSha256: string;
  identity: {
    approvedSha: string;
    repository: "meetblakey/sourcera";
    runAttempt: 1;
    runId: number;
  };
  preflightArtifactDigest: string;
  preflightReceiptSha256: string;
  reasonSha256: string;
}

export interface StageVercelProductionBaselineArguments {
  githubApprovalPath?: string;
  githubHandoffPath?: string;
  githubProofPath?: string;
  preflightDirectory?: string;
  receiptPath: string;
}

interface WorkflowEvidenceArguments {
  githubApprovalPath: string;
  githubHandoffPath: string;
  githubProofPath: string;
  preflightDirectory: string;
}

type ProcessEnvironment = Record<string, string | undefined>;

function sha256(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function requiredEnvironment(environment: ProcessEnvironment, key: string) {
  const value = environment[key];
  if (typeof value !== "string" || !value || value !== value.trim()) {
    throw new Error(`${key} is required for the Vercel production baseline`);
  }
  return value;
}

function requiredDigest(environment: ProcessEnvironment, key: string) {
  const value = requiredEnvironment(environment, key);
  if (!SHA256.test(value)) throw new Error(`${key} must be a SHA-256 digest`);
  return value;
}

function safeInteger(value: string, key: string) {
  if (!/^\d+$/.test(value)) throw new Error(`${key} must be numeric`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${key} is invalid`);
  }
  return parsed;
}

function canonicalInputPath(value: string, root: string, option: string) {
  const result = requireOutsideRepository(value, root, option);
  if (!existsSync(result)) throw new Error(`${option} does not exist`);
  return result;
}

function readPairs(arguments_: string[]) {
  const values = new Map<string, string>();
  if (arguments_.length % 2 !== 0) {
    throw new Error("baseline arguments must be option/value pairs");
  }
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index]!;
    const value = arguments_[index + 1]!;
    if (!value || value.startsWith("--") || values.has(option)) {
      throw new Error("baseline arguments are incomplete or duplicated");
    }
    values.set(option, value);
  }
  return values;
}

export function readStageArguments(
  arguments_: string[],
  root = repositoryRoot,
): StageVercelProductionBaselineArguments {
  const values = readPairs(arguments_);
  const allowed = new Set([
    "--github-approval",
    "--github-handoff",
    "--github-proof",
    "--preflight-dir",
    "--receipt-out",
  ]);
  if ([...values.keys()].some((key) => !allowed.has(key))) {
    throw new Error("unknown Vercel baseline stage argument");
  }
  const receipt = values.get("--receipt-out");
  if (!receipt) {
    throw new Error(
      "Usage: stage-vercel-production-baseline --preflight-dir <path> --github-proof <path> --github-approval <path> --github-handoff <path> --receipt-out <path>",
    );
  }
  const evidenceOptions = [
    "--preflight-dir",
    "--github-proof",
    "--github-approval",
    "--github-handoff",
  ];
  const evidenceCount = evidenceOptions.filter((option) => values.has(option)).length;
  if (evidenceCount !== 0 && evidenceCount !== evidenceOptions.length) {
    throw new Error("baseline workflow evidence paths must be supplied together");
  }
  const receiptPath = requireOutsideRepository(
    receipt,
    root,
    "receipt output",
  );
  if (existsSync(receiptPath)) {
    throw new Error(`receipt output already exists: ${receiptPath}`);
  }
  if (evidenceCount === 0) return { receiptPath };
  return {
    githubApprovalPath: canonicalInputPath(
      values.get("--github-approval")!,
      root,
      "--github-approval",
    ),
    githubHandoffPath: canonicalInputPath(
      values.get("--github-handoff")!,
      root,
      "--github-handoff",
    ),
    githubProofPath: canonicalInputPath(
      values.get("--github-proof")!,
      root,
      "--github-proof",
    ),
    preflightDirectory: canonicalInputPath(
      values.get("--preflight-dir")!,
      root,
      "--preflight-dir",
    ),
    receiptPath,
  };
}

function requireEvidenceArguments(
  parsed: StageVercelProductionBaselineArguments,
): WorkflowEvidenceArguments {
  if (
    !parsed.githubApprovalPath ||
    !parsed.githubHandoffPath ||
    !parsed.githubProofPath ||
    !parsed.preflightDirectory
  ) {
    throw new Error("protected workflow evidence is required before Vercel access");
  }
  return {
    githubApprovalPath: parsed.githubApprovalPath,
    githubHandoffPath: parsed.githubHandoffPath,
    githubProofPath: parsed.githubProofPath,
    preflightDirectory: parsed.preflightDirectory,
  };
}

export async function validateVercelProductionBaselineWorkflowEvidence(
  arguments_: WorkflowEvidenceArguments,
  environment: ProcessEnvironment,
  options: { allowActivationRetry: boolean },
) {
  const approvedSha = requiredEnvironment(
    environment,
    "SOURCERA_RELEASE_APPROVED_SHA",
  );
  if (!FULL_GIT_COMMIT_SHA.test(approvedSha)) {
    throw new Error("SOURCERA_RELEASE_APPROVED_SHA must be a full Git SHA");
  }
  const repository = requiredEnvironment(environment, "GITHUB_REPOSITORY");
  if (repository !== "meetblakey/sourcera") {
    throw new Error("GITHUB_REPOSITORY does not match the baseline pin");
  }
  const runId = safeInteger(
    requiredEnvironment(environment, "GITHUB_RUN_ID"),
    "GITHUB_RUN_ID",
  );
  const currentAttempt = safeInteger(
    requiredEnvironment(environment, "GITHUB_RUN_ATTEMPT"),
    "GITHUB_RUN_ATTEMPT",
  );
  if (!options.allowActivationRetry && currentAttempt !== 1) {
    throw new Error("baseline staging is restricted to workflow attempt 1");
  }
  const identity = {
    approvedSha,
    repository: "meetblakey/sourcera" as const,
    runAttempt: 1 as const,
    runId,
  };
  const preflight = await readProductionPreflightBundle(
    arguments_.preflightDirectory,
    identity,
  );
  const githubProofRaw = readFileSync(arguments_.githubProofPath, "utf8");
  const githubApprovalRaw = readFileSync(arguments_.githubApprovalPath, "utf8");
  const githubHandoffRaw = readFileSync(arguments_.githubHandoffPath, "utf8");
  let githubHandoffValue: unknown;
  try {
    githubHandoffValue = JSON.parse(githubHandoffRaw) as unknown;
  } catch (cause) {
    throw new Error("Vercel baseline GitHub handoff is not JSON", { cause });
  }
  const preflightArtifactDigest = requiredDigest(
    environment,
    "SOURCERA_PREFLIGHT_ARTIFACT_DIGEST",
  );
  const reason = requiredEnvironment(environment, "SOURCERA_BASELINE_REASON");
  if (environment.SOURCERA_BASELINE_FORWARD_ONLY_ACK !== "true") {
    throw new Error("SOURCERA_BASELINE_FORWARD_ONLY_ACK must be true");
  }
  const handoff = readVercelProductionBaselineGithubHandoff(
    githubHandoffValue,
    {
      forwardOnlyAcknowledged: true,
      githubProofRaw,
      identity,
      preflightArtifactDigest,
      preflightReceiptRaw: preflight.receiptRaw,
      protectedReviewerProofRaw: githubApprovalRaw,
      reason,
    },
  );
  const binding: VercelProductionBaselineWorkflowBinding = {
    approvalArtifactDigest: requiredDigest(
      environment,
      "SOURCERA_APPROVAL_ARTIFACT_DIGEST",
    ),
    githubApprovalSha256: sha256(githubApprovalRaw),
    githubHandoffSha256: sha256(githubHandoffRaw),
    githubProofSha256: sha256(githubProofRaw),
    identity,
    preflightArtifactDigest,
    preflightReceiptSha256: sha256(preflight.receiptRaw),
    reasonSha256: sha256(reason),
  };
  return {
    approvedSha,
    binding,
    currentAttempt,
    handoff: handoff as VercelProductionBaselineGithubHandoff,
    releaseRunId: `baseline-${runId}`,
  };
}

export async function cleanupVercelProductionBaselineStage(
  cleanupProvider: () => Promise<void>,
  options: {
    primaryError?: unknown;
    receiptPublished: boolean;
    warn?: (message: string) => void;
  },
) {
  try {
    await cleanupProvider();
  } catch (cleanupError) {
    if (options.primaryError === undefined && !options.receiptPublished) {
      throw cleanupError;
    }
    const detail = cleanupError instanceof Error
      ? cleanupError.message
      : String(cleanupError);
    const context = options.receiptPublished
      ? "exact stage receipt retained for recovery"
      : "primary staging failure retained";
    (options.warn ?? ((message) => process.stderr.write(`${message}\n`)))(
      `Vercel baseline cleanup failed; ${context}: ${detail}`,
    );
  }
}

export async function main(arguments_ = process.argv.slice(2)) {
  const parsed = readStageArguments(arguments_);
  const evidence = await validateVercelProductionBaselineWorkflowEvidence(
    requireEvidenceArguments(parsed),
    process.env,
    { allowActivationRetry: false },
  );
  const provider = createVercelProductionBaselineProvider({
    approvedSha: evidence.approvedSha,
    config: productionTargets,
    environment: process.env,
    releaseRunId: evidence.releaseRunId,
    repositoryRoot,
  });
  let receiptPublished = false;
  const dependencies = {
    ...provider.dependencies,
    persistStageReceipt: async (
      receipt: VercelProductionBaselineStageReceipt,
    ) => {
      writePrivateJsonReceipt(
        parsed.receiptPath,
        { ...receipt, workflowBinding: evidence.binding },
        repositoryRoot,
      );
      receiptPublished = true;
    },
  };
  let signalExitCode: number | undefined;
  const handlers = new Map<NodeJS.Signals, () => void>(
    (["SIGHUP", "SIGINT", "SIGTERM"] as const).map((signal) => [
      signal,
      () => {
        signalExitCode = { SIGHUP: 129, SIGINT: 130, SIGTERM: 143 }[signal];
        provider.requestStop();
      },
    ]),
  );
  for (const [signal, handler] of handlers) process.once(signal, handler);
  let primaryError: unknown;
  try {
    const receipt = await stageVercelProductionBaseline({
      approvedSha: evidence.approvedSha,
      config: productionTargets,
      dependencies,
      repositoryRoot,
    });
    process.stdout.write(
      `${JSON.stringify({ receiptSha256: receipt.sha256, result: "staged" })}\n`,
    );
    if (signalExitCode) process.exitCode = signalExitCode;
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    try {
      await cleanupVercelProductionBaselineStage(
        () => provider.cleanup(),
        { primaryError, receiptPublished },
      );
    } finally {
      for (const [signal, handler] of handlers) process.off(signal, handler);
    }
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "Vercel baseline staging failed"}\n`,
    );
    process.exitCode = 1;
  });
}
