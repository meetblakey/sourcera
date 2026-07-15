import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { link, mkdir, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionTargets from "../config/production-targets.json";
import {
  type CommandInvocation,
  type CommandResult,
  type ReleaseProcessEnvironment,
  type VercelProductionStageReceipt,
  createVercelProductionGitEnvironment,
  stageVercelProductionRelease,
} from "./lib/vercel-production-release";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

type VercelStagingSignal = "SIGHUP" | "SIGINT" | "SIGTERM";

interface CleanupVercelStagingWorktreeOptions {
  environment?: ReleaseProcessEnvironment;
  removeDirectory?: (directory: string) => void;
  repositoryRoot: string;
  run?: (invocation: CommandInvocation) => CommandResult;
  temporaryRoot: string;
  worktreeRoot: string;
}

export function readReceiptOutputPath(
  arguments_: string[],
  root: string,
): string {
  if (
    arguments_.length !== 2 ||
    arguments_[0] !== "--receipt-out" ||
    !arguments_[1]?.trim()
  ) {
    throw new Error("Usage: stage-vercel-production --receipt-out <path>");
  }
  const outputPath = canonicalizePotentialPath(path.resolve(root, arguments_[1]));
  requireOutsideRepository(outputPath, root);
  if (existsSync(outputPath)) {
    throw new Error(`Receipt output already exists: ${outputPath}`);
  }
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
    env: invocation.environment as NodeJS.ProcessEnv | undefined,
    maxBuffer: 16 * 1024 * 1024,
  });
  return {
    error: result.error,
    status: result.status,
    stderr: result.stderr ?? "",
    stdout: result.stdout ?? "",
  };
}

export function cleanupVercelStagingWorktree(
  options: CleanupVercelStagingWorktreeOptions,
) {
  const run = options.run ?? execute;
  const environment = createVercelProductionGitEnvironment(
    options.environment ?? process.env,
    path.join(options.temporaryRoot, "home"),
  );
  const runGit = (arguments_: string[]) => {
    try {
      run({
        arguments: arguments_,
        command: "git",
        cwd: options.repositoryRoot,
        environment,
      });
    } catch {
      // Signal cleanup is best effort; process termination must still complete.
    }
  };
  runGit(["worktree", "remove", "--force", options.worktreeRoot]);
  try {
    (options.removeDirectory ?? ((directory) => {
      rmSync(directory, { force: true, recursive: true });
    }))(options.temporaryRoot);
  } catch {
    // Signal cleanup is best effort; process termination must still complete.
  }
  runGit(["worktree", "prune"]);
}

export function createVercelStagingSignalHandler(
  signal: VercelStagingSignal,
  cleanup: () => void,
  terminate: (exitCode: number) => void = (exitCode) => process.exit(exitCode),
): () => void {
  const exitCodes: Record<VercelStagingSignal, number> = {
    SIGHUP: 129,
    SIGINT: 130,
    SIGTERM: 143,
  };
  let handled = false;
  return () => {
    if (handled) return;
    handled = true;
    try {
      cleanup();
    } finally {
      terminate(exitCodes[signal]);
    }
  };
}

export async function main(arguments_ = process.argv.slice(2)) {
  const approvedSha = process.env.SOURCERA_RELEASE_APPROVED_SHA;
  if (!approvedSha) {
    throw new Error("SOURCERA_RELEASE_APPROVED_SHA is required");
  }
  const receiptOutputPath = readReceiptOutputPath(arguments_, repositoryRoot);
  const temporaryRoot = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "sourcera-vercel-stage-")),
  );
  const worktreeRoot = path.join(temporaryRoot, "checkout");
  mkdirSync(path.join(temporaryRoot, "home"), { mode: 0o700 });
  const cleanup = () =>
    cleanupVercelStagingWorktree({
      environment: process.env,
      repositoryRoot,
      temporaryRoot,
      worktreeRoot,
    });
  const signals: VercelStagingSignal[] = ["SIGHUP", "SIGINT", "SIGTERM"];
  const signalHandlers = new Map(
    signals.map((signal) => [
      signal,
      createVercelStagingSignalHandler(signal, cleanup),
    ]),
  );
  for (const [signal, handler] of signalHandlers) {
    process.once(signal, handler);
  }
  let stagingCompleted = false;
  try {
    const receipt = stageVercelProductionRelease({
      approvedSha,
      config: productionTargets,
      environment: process.env,
      releaseRunId: randomUUID(),
      repositoryRoot,
      run: execute,
      worktreeRoot,
    });
    stagingCompleted = true;
    await writeVercelProductionStageReceipt(receiptOutputPath, receipt);
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } finally {
    for (const [signal, handler] of signalHandlers) {
      process.off(signal, handler);
    }
    if (stagingCompleted) {
      rmSync(temporaryRoot, { force: true, recursive: true });
    } else {
      cleanup();
    }
  }
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
