import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, realpathSync } from "node:fs";
import { link, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionTargets from "../config/production-targets.json";
import {
  type CommandInvocation,
  type CommandResult,
  type VercelProductionStageReceipt,
  stageVercelProductionRelease,
} from "./lib/vercel-production-release";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export function readReceiptOutputPath(
  arguments_: string[],
  root: string,
): string | undefined {
  if (arguments_.length === 0) return undefined;
  if (
    arguments_.length !== 2 ||
    arguments_[0] !== "--receipt-out" ||
    !arguments_[1]?.trim()
  ) {
    throw new Error("Usage: stage-vercel-production [--receipt-out <path>]");
  }
  const outputPath = canonicalizePotentialPath(path.resolve(root, arguments_[1]));
  requireOutsideRepository(outputPath, root);
  return outputPath;
}

function requireOutsideRepository(value: string, root: string) {
  const canonicalRoot = realpathSync(root);
  const relative = path.relative(canonicalRoot, value);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error("Receipt output must remain outside the repository");
  }
}

function canonicalizePotentialPath(value: string): string {
  let existingAncestor = value;
  const missingSegments: string[] = [];
  while (!existsSync(existingAncestor)) {
    const parent = path.dirname(existingAncestor);
    if (parent === existingAncestor) break;
    missingSegments.unshift(path.basename(existingAncestor));
    existingAncestor = parent;
  }
  return path.join(realpathSync(existingAncestor), ...missingSegments);
}

function requireCompleteReceipt(receipt: VercelProductionStageReceipt) {
  const applications = ["marketplace", "buyer", "seller"];
  if (
    receipt.schemaVersion !== 1 ||
    receipt.event !== "vercel_production_stage_receipt" ||
    receipt.applications.length !== applications.length ||
    receipt.applications.some(
      (application, index) =>
        application.application !== applications[index] ||
        application.target !== "production" ||
        application.state !== "READY" ||
        application.substate !== "STAGED" ||
        application.providerGitSha !== receipt.approvedSha ||
        application.health.commitSha !== receipt.approvedSha ||
        application.health.domain !== application.application ||
        application.health.environment !== "production" ||
        application.health.status !== "ok",
    )
  ) {
    throw new Error("Receipt does not contain the complete staged application set");
  }
}

export async function writeVercelProductionStageReceipt(
  receiptPath: string,
  receipt: VercelProductionStageReceipt,
) {
  requireCompleteReceipt(receipt);
  const outputPath = canonicalizePotentialPath(path.resolve(receiptPath));
  requireOutsideRepository(outputPath, repositoryRoot);
  const directory = path.dirname(outputPath);
  await mkdir(directory, { recursive: true });
  const temporaryPath = path.join(
    directory,
    `.${path.basename(outputPath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  await writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  try {
    await link(temporaryPath, outputPath);
  } catch (error) {
    const code = isNodeError(error) ? error.code : undefined;
    if (code === "EEXIST") {
      throw new Error(`Receipt output already exists: ${outputPath}`);
    }
    throw error;
  } finally {
    await unlink(temporaryPath).catch(() => undefined);
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}

function execute(invocation: CommandInvocation): CommandResult {
  const result = spawnSync(invocation.command, invocation.arguments, {
    cwd: invocation.cwd,
    encoding: "utf8",
    env: invocation.environment,
    maxBuffer: 16 * 1024 * 1024,
  });
  return {
    error: result.error,
    status: result.status,
    stderr: result.stderr ?? "",
    stdout: result.stdout ?? "",
  };
}

export async function main(arguments_ = process.argv.slice(2)) {
  const approvedSha = process.env.SOURCERA_RELEASE_APPROVED_SHA;
  if (!approvedSha) {
    throw new Error("SOURCERA_RELEASE_APPROVED_SHA is required");
  }
  const receiptOutputPath = readReceiptOutputPath(arguments_, repositoryRoot);
  const receipt = stageVercelProductionRelease({
    approvedSha,
    config: productionTargets,
    environment: process.env,
    releaseRunId: randomUUID(),
    repositoryRoot,
    run: execute,
  });
  if (receiptOutputPath) {
    await writeVercelProductionStageReceipt(receiptOutputPath, receipt);
  }
  process.stdout.write(`${JSON.stringify(receipt)}\n`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Staging failed";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
