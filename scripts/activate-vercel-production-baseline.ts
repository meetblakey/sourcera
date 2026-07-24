import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionTargets from "../config/production-targets.json";
import {
  reconcileVercelProductionBaseline,
  resumeVercelProductionBaseline,
  type VercelProductionBaselineExecutionReceipt,
  type VercelProductionBaselineStageReceipt,
} from "./lib/vercel-production-baseline";
import {
  createVercelProductionBaselineProvider,
  requireOutsideRepository,
  writePrivateJsonReceipt,
  type VercelProductionBaselineProvider,
} from "./lib/vercel-production-baseline-provider";
import {
  type VercelProductionBaselineWorkflowBinding,
  validateVercelProductionBaselineWorkflowEvidence,
} from "./stage-vercel-production-baseline";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const SHA256 = /^[a-f0-9]{64}$/;

interface PersistedStageReceipt extends VercelProductionBaselineStageReceipt {
  workflowBinding?: VercelProductionBaselineWorkflowBinding;
}

export interface ActivateVercelProductionBaselineArguments {
  githubApprovalPath?: string;
  githubHandoffPath?: string;
  githubProofPath?: string;
  preflightDirectory?: string;
  receiptPath: string;
  stageReceiptPath: string;
  stageReceiptSha256?: string;
}

export type ActivationResult =
  | VercelProductionBaselineExecutionReceipt
  | {
      approvedSha?: string;
      checkedAt: string;
      error: string;
      event:
        | "vercel_production_baseline_failure_receipt"
        | "vercel_production_baseline_recovery_required_receipt";
      result: "failed" | "recovery_required";
      rollbackClaimed: false;
      stageReceiptRawSha256?: string;
      trafficMutated: boolean | "unknown";
    };

function sha256(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function canonicalInputPath(value: string, root: string, option: string) {
  const result = requireOutsideRepository(value, root, option);
  if (!existsSync(result)) throw new Error(`${option} does not exist`);
  return result;
}

function readPairs(arguments_: string[]) {
  if (arguments_.length % 2 !== 0) {
    throw new Error("baseline activation arguments must be option/value pairs");
  }
  const values = new Map<string, string>();
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index]!;
    const value = arguments_[index + 1]!;
    if (!value || value.startsWith("--") || values.has(option)) {
      throw new Error("baseline activation arguments are incomplete or duplicated");
    }
    values.set(option, value);
  }
  return values;
}

export function readActivationArguments(
  arguments_: string[],
  root = repositoryRoot,
): ActivateVercelProductionBaselineArguments {
  const values = readPairs(arguments_);
  const allowed = new Set([
    "--github-approval",
    "--github-handoff",
    "--github-proof",
    "--preflight-dir",
    "--receipt-out",
    "--stage-receipt",
    "--stage-receipt-sha256",
  ]);
  if ([...values.keys()].some((key) => !allowed.has(key))) {
    throw new Error("unknown Vercel baseline activation argument");
  }
  const stage = values.get("--stage-receipt");
  const output = values.get("--receipt-out");
  if (!stage || !output) {
    throw new Error(
      "Usage: activate-vercel-production-baseline --preflight-dir <path> --github-proof <path> --github-approval <path> --github-handoff <path> --stage-receipt <path> --receipt-out <path>",
    );
  }
  const stageReceiptPath = canonicalInputPath(
    stage,
    root,
    "--stage-receipt",
  );
  const receiptPath = requireOutsideRepository(output, root, "receipt output");
  if (stageReceiptPath === receiptPath) {
    throw new Error("stage and activation receipt paths must be distinct");
  }
  if (existsSync(receiptPath)) {
    throw new Error(`receipt output already exists: ${receiptPath}`);
  }
  const expectedRawSha = values.get("--stage-receipt-sha256");
  if (expectedRawSha && !SHA256.test(expectedRawSha)) {
    throw new Error("--stage-receipt-sha256 must be a SHA-256 digest");
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
  return {
    ...(evidenceCount === 0
      ? {}
      : {
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
        }),
    receiptPath,
    stageReceiptPath,
    ...(expectedRawSha ? { stageReceiptSha256: expectedRawSha } : {}),
  };
}

export async function readExactStageReceipt(
  receiptPath: string,
  expectedRawSha256?: string,
) {
  const raw = readFileSync(receiptPath, "utf8");
  const rawSha256 = sha256(raw);
  if (expectedRawSha256 && rawSha256 !== expectedRawSha256) {
    throw new Error("stage receipt exact bytes do not match the approved SHA-256");
  }
  let receipt: PersistedStageReceipt;
  try {
    receipt = JSON.parse(raw) as PersistedStageReceipt;
  } catch (cause) {
    throw new Error("stage receipt is not JSON", { cause });
  }
  if (
    !receipt ||
    typeof receipt !== "object" ||
    typeof receipt.sha256 !== "string" ||
    !SHA256.test(receipt.sha256) ||
    typeof receipt.canonical !== "string" ||
    sha256(receipt.canonical) !== receipt.sha256
  ) {
    throw new Error("stage receipt internal hash is invalid");
  }
  return { raw, rawSha256, receipt };
}

export async function writeActivationReceipt(
  outputPath: string,
  receipt: Record<string, unknown>,
  root = repositoryRoot,
) {
  if (
    !["failed", "passed", "recovery_required"].includes(
      String(receipt.result),
    ) ||
    receipt.rollbackClaimed !== false
  ) {
    throw new Error("activation receipt must be truthful and must never claim rollback");
  }
  writePrivateJsonReceipt(outputPath, receipt, root);
}

function evidenceArguments(parsed: ActivateVercelProductionBaselineArguments) {
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

function exactBinding(
  actual: VercelProductionBaselineWorkflowBinding | undefined,
  expected: VercelProductionBaselineWorkflowBinding,
) {
  if (!actual || JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error("stage receipt workflow binding does not match exact approval bytes");
  }
}

export function createActivationFailureReceipt(options: {
  approvedSha?: string;
  error: unknown;
  rawSha256?: string;
  trafficMutated?: boolean | "unknown";
}) : ActivationResult {
  const trafficMutated = options.trafficMutated ?? "unknown";
  const result = trafficMutated === false ? "failed" : "recovery_required";
  return {
    ...(options.approvedSha ? { approvedSha: options.approvedSha } : {}),
    checkedAt: new Date().toISOString(),
    error: options.error instanceof Error
      ? options.error.message
      : String(options.error),
    event: result === "failed"
      ? "vercel_production_baseline_failure_receipt"
      : "vercel_production_baseline_recovery_required_receipt",
    result,
    rollbackClaimed: false,
    ...(options.rawSha256
      ? { stageReceiptRawSha256: options.rawSha256 }
      : {}),
    trafficMutated,
  };
}

export async function main(arguments_ = process.argv.slice(2)) {
  const parsed = readActivationArguments(arguments_);
  let provider: VercelProductionBaselineProvider | undefined;
  let stage: Awaited<ReturnType<typeof readExactStageReceipt>> | undefined;
  let approvedSha: string | undefined;
  let output = createActivationFailureReceipt({
    error: "activation did not produce a result",
    trafficMutated: "unknown",
  }) as unknown as Record<string, unknown>;
  let signalExitCode: number | undefined;
  const handlers = new Map<NodeJS.Signals, () => void>();
  for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"] as const) {
    const handler = () => {
      signalExitCode = { SIGHUP: 129, SIGINT: 130, SIGTERM: 143 }[signal];
      provider?.requestStop();
    };
    handlers.set(signal, handler);
    process.once(signal, handler);
  }
  try {
    const evidence = await validateVercelProductionBaselineWorkflowEvidence(
      evidenceArguments(parsed),
      process.env,
      { allowActivationRetry: true },
    );
    approvedSha = evidence.approvedSha;
    const stageArtifactDigest = process.env.SOURCERA_STAGE_ARTIFACT_DIGEST;
    if (!stageArtifactDigest || !SHA256.test(stageArtifactDigest)) {
      throw new Error("SOURCERA_STAGE_ARTIFACT_DIGEST must be a SHA-256 digest");
    }
    stage = await readExactStageReceipt(
      parsed.stageReceiptPath,
      parsed.stageReceiptSha256,
    );
    exactBinding(stage.receipt.workflowBinding, evidence.binding);
    provider = createVercelProductionBaselineProvider({
      approvedSha: evidence.approvedSha,
      config: productionTargets,
      environment: process.env,
      releaseRunId: evidence.releaseRunId,
      remoteMainPolicy: evidence.currentAttempt === 1
        ? "exact"
        : "descendant-recovery",
      repositoryRoot,
    });
    if (signalExitCode) provider.requestStop();
    const result = await resumeVercelProductionBaseline({
      config: productionTargets,
      dependencies: provider.dependencies,
      expectedStageReceiptSha256: stage.receipt.sha256,
      receipt: stage.receipt,
      repositoryRoot,
    });
    output = {
      ...result,
      activationBinding: {
        activationRunAttempt: evidence.currentAttempt,
        sourceWorkflowBinding: evidence.binding,
        stageArtifactDigest,
        stageReceiptRawSha256: stage.rawSha256,
      },
    };
  } catch (error) {
    let trafficMutated: boolean | "unknown" = "unknown";
    if (provider && stage) {
      try {
        trafficMutated = (
          await reconcileVercelProductionBaseline({
            dependencies: provider.dependencies,
            receipt: stage.receipt,
            repositoryRoot,
          })
        ).trafficMutated;
      } catch {
        trafficMutated = "unknown";
      }
    }
    output = createActivationFailureReceipt({
      approvedSha,
      error,
      rawSha256: stage?.rawSha256,
      trafficMutated,
    }) as unknown as Record<string, unknown>;
  } finally {
    let cleanupError: unknown;
    if (provider) {
      try {
        await provider.cleanup();
      } catch (error) {
        cleanupError = error;
      }
    }
    for (const [signal, handler] of handlers) process.off(signal, handler);
    if (cleanupError !== undefined) {
      const cleanupMessage = cleanupError instanceof Error
        ? cleanupError.message
        : String(cleanupError);
      if (output.result === "passed") {
        output = {
          ...output,
          error: `provider cleanup failed after activation: ${cleanupMessage}`,
          event: "vercel_production_baseline_recovery_required_receipt",
          result: "recovery_required",
          rollbackClaimed: false,
        };
      } else {
        output = {
          ...output,
          error: `${String(output.error ?? "activation failed")}; provider cleanup failed: ${cleanupMessage}`,
        };
      }
    }
  }
  await writeActivationReceipt(parsed.receiptPath, output);
  process.stdout.write(`${JSON.stringify(output)}\n`);
  if (signalExitCode) {
    process.exitCode = signalExitCode;
  } else if (output.result !== "passed") {
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "Vercel baseline activation failed"}\n`,
    );
    process.exitCode = 1;
  });
}
