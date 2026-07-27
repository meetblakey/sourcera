import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionTargets from "../config/production-targets.json";
import {
  ConvexProductionBaselineError,
  ConvexProductionCandidateError,
  ConvexProductionRollbackError,
  type ConvexProductionRollbackAnchor,
  createConvexProductionBaseEnvironment,
  createConvexProductionDeploymentPlan,
  createConvexProductionFailureReceipt,
  createConvexProductionStepEnvironment,
  executeConvexProductionDeploymentAsync,
  readConvexProductionKnownGoodReceiptBytes,
  writeConvexProductionReceipt,
} from "./lib/convex-production-deployment";
import {
  assertControlledConvexReleaseIdentityChange,
  assertConvexReleaseIdentityPlaceholder,
  assertConvexRollbackReleaseIdentityPlaceholder,
  CONVEX_RELEASE_IDENTITY_PATH,
  renderConvexReleaseIdentity,
} from "./lib/convex-release-identity";
import { readPinnedConvexProductionTarget } from "./lib/convex-production-target";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const canonicalRepositoryRoot = realpathSync(repositoryRoot);

function commandOutput(
  command: string,
  arguments_: string[],
  cwd: string,
  environment: NodeJS.ProcessEnv,
) {
  const result = spawnSync(command, arguments_, {
    cwd,
    encoding: "utf8",
    env: environment,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${arguments_.join(" ")} failed`);
  }
  return result.stdout.trimEnd();
}

function runInherited(
  command: string,
  arguments_: string[],
  cwd: string,
  environment: NodeJS.ProcessEnv,
) {
  const result = spawnSync(command, arguments_, {
    cwd,
    encoding: "utf8",
    env: environment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${arguments_.join(" ")} failed`);
  }
}

function readGitStatus(cwd: string, environment: NodeJS.ProcessEnv) {
  return commandOutput(
    "git",
    ["status", "--porcelain", "--untracked-files=all"],
    cwd,
    environment,
  );
}

function requireCleanCheckout(cwd: string, environment: NodeJS.ProcessEnv) {
  if (readGitStatus(cwd, environment)) {
    throw new Error("Convex production release requires a clean checkout");
  }
}

function assertPathOutsideRepository(value: string, option: string) {
  let absolutePath = path.resolve(value);
  for (let depth = 0; depth < 32; depth += 1) {
    let existingAncestor = absolutePath;
    while (true) {
      try {
        const stats = lstatSync(existingAncestor);
        if (stats.isSymbolicLink()) {
          absolutePath = path.resolve(
            path.dirname(existingAncestor),
            readlinkSync(existingAncestor),
            path.relative(existingAncestor, absolutePath),
          );
          break;
        }
        absolutePath = path.resolve(
          realpathSync(existingAncestor),
          path.relative(existingAncestor, absolutePath),
        );
        existingAncestor = "";
        break;
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !("code" in error) ||
          error.code !== "ENOENT"
        ) {
          throw error;
        }
        const parent = path.dirname(existingAncestor);
        if (parent === existingAncestor) throw error;
        existingAncestor = parent;
      }
    }
    if (!existingAncestor) break;
    if (depth === 31) {
      throw new Error(`${option} has too many symbolic links`);
    }
  }
  if (
    absolutePath === canonicalRepositoryRoot ||
    absolutePath.startsWith(`${canonicalRepositoryRoot}${path.sep}`)
  ) {
    throw new Error(`${option} must be outside the repository checkout`);
  }
  return absolutePath;
}

function readArguments(arguments_: string[]) {
  const values: {
    approvalReceiptPath?: string;
    knownGoodReceiptPath?: string;
    receiptPath?: string;
  } = {};
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];
    if (!value?.trim() || value.startsWith("--")) {
      throw new Error(
        "Usage: deploy-convex-production --known-good-receipt <path> [--approval-receipt <path>] --receipt-out <path>",
      );
    }
    if (option === "--approval-receipt") {
      if (values.approvalReceiptPath) {
        throw new Error("--approval-receipt may be provided only once");
      }
      values.approvalReceiptPath = value;
    } else if (option === "--known-good-receipt") {
      if (values.knownGoodReceiptPath) {
        throw new Error("--known-good-receipt may be provided only once");
      }
      values.knownGoodReceiptPath = value;
    } else if (option === "--receipt-out") {
      if (values.receiptPath) {
        throw new Error("--receipt-out may be provided only once");
      }
      values.receiptPath = value;
    } else {
      throw new Error(`Unknown production deploy option: ${option ?? ""}`);
    }
  }
  return values;
}

const { approvalReceiptPath, knownGoodReceiptPath, receiptPath } = readArguments(
  process.argv.slice(2),
);
const canonicalApprovalReceiptPath = approvalReceiptPath
  ? assertPathOutsideRepository(approvalReceiptPath, "--approval-receipt")
  : undefined;
const canonicalReceiptPath = receiptPath
  ? assertPathOutsideRepository(receiptPath, "--receipt-out")
  : undefined;
const canonicalKnownGoodReceiptPath = knownGoodReceiptPath
  ? assertPathOutsideRepository(
      knownGoodReceiptPath,
      "--known-good-receipt",
    )
  : undefined;
if (
  canonicalReceiptPath &&
  canonicalReceiptPath === canonicalKnownGoodReceiptPath
) {
  throw new Error("receipt paths must be distinct");
}
if (
  canonicalApprovalReceiptPath &&
  (canonicalApprovalReceiptPath === canonicalKnownGoodReceiptPath ||
    canonicalApprovalReceiptPath === canonicalReceiptPath)
) {
  throw new Error("receipt paths must be distinct");
}
if (canonicalReceiptPath && existsSync(canonicalReceiptPath)) {
  throw new Error("--receipt-out must not already exist");
}
if (!canonicalReceiptPath) {
  throw new Error("--receipt-out is required for durable production proof");
}
if (!canonicalKnownGoodReceiptPath) {
  throw new Error("--known-good-receipt requires a historical receipt path");
}
const knownGoodReceiptInputPath = canonicalKnownGoodReceiptPath;
const receiptOutputPath = canonicalReceiptPath;
let knownGoodReceiptBytes: Buffer | undefined;
let approvalReceiptBytes: Buffer | undefined;
if (existsSync(knownGoodReceiptInputPath)) {
  knownGoodReceiptBytes = readFileSync(knownGoodReceiptInputPath);
  let knownGoodReceiptHeader: unknown;
  try {
    knownGoodReceiptHeader = JSON.parse(knownGoodReceiptBytes.toString("utf8"));
  } catch (cause) {
    throw new Error("Known-good Convex receipt is not valid JSON", { cause });
  }
  const isGenesisReceipt =
    typeof knownGoodReceiptHeader === "object" &&
    knownGoodReceiptHeader !== null &&
    !Array.isArray(knownGoodReceiptHeader) &&
    "event" in knownGoodReceiptHeader &&
    knownGoodReceiptHeader.event === "convex_production_genesis_receipt";
  if (isGenesisReceipt && !canonicalApprovalReceiptPath) {
    throw new Error("Genesis Convex receipt requires --approval-receipt");
  }
  if (!isGenesisReceipt && canonicalApprovalReceiptPath) {
    throw new Error("Normal Convex receipt forbids --approval-receipt");
  }
  approvalReceiptBytes = canonicalApprovalReceiptPath
    ? readFileSync(canonicalApprovalReceiptPath)
    : undefined;
}

const environmentWithoutProductionCredentials =
  createConvexProductionBaseEnvironment(process.env);
const repositoryCommitSha = commandOutput(
  "git",
  ["rev-parse", "HEAD"],
  repositoryRoot,
  environmentWithoutProductionCredentials,
);
const target = readPinnedConvexProductionTarget(productionTargets);
const plan = createConvexProductionDeploymentPlan(
  process.env,
  target,
  repositoryCommitSha,
);
const deployKey = process.env.CONVEX_DEPLOY_KEY!;
const canarySecret = process.env.SOURCERA_CONVEX_CANARY_SECRET!;
let knownGoodReceiptSha256: string | null = null;
async function runDeployment() {
  try {
    knownGoodReceiptBytes ??= readFileSync(knownGoodReceiptInputPath);
    approvalReceiptBytes ??= canonicalApprovalReceiptPath
      ? readFileSync(canonicalApprovalReceiptPath)
      : undefined;
    knownGoodReceiptSha256 = createHash("sha256")
      .update(knownGoodReceiptBytes)
      .digest("hex");
    const knownGood = readConvexProductionKnownGoodReceiptBytes(
      knownGoodReceiptBytes,
      approvalReceiptBytes,
      {
        approvedCandidateSha: plan.approvedSha,
        githubRepository: process.env
          .GITHUB_REPOSITORY as "meetblakey/sourcera",
        githubRunAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
        githubRunId: Number(process.env.GITHUB_RUN_ID),
        knownGoodSha: plan.knownGoodSha,
        target: plan.target,
      },
    );
    if (knownGood.knownGoodReceiptSha256 !== knownGoodReceiptSha256) {
      throw new Error("Known-good Convex receipt hash changed during preflight");
    }
    requireCleanCheckout(
      repositoryRoot,
      environmentWithoutProductionCredentials,
    );
    commandOutput(
      "git",
      ["cat-file", "-e", `${plan.knownGoodSha}^{commit}`],
      repositoryRoot,
      environmentWithoutProductionCredentials,
    );
    commandOutput(
      "git",
      ["merge-base", "--is-ancestor", plan.knownGoodSha, plan.approvedSha],
      repositoryRoot,
      environmentWithoutProductionCredentials,
    );
  } catch (error) {
    const preflightReceipt = createConvexProductionFailureReceipt({
      approvedSha: plan.approvedSha,
      checkedAt: new Date().toISOString(),
      failureStage: "preflight",
      knownGoodReceiptSha256,
      knownGoodSha: plan.knownGoodSha,
      result: "baseline_failed",
      target: plan.target,
    });
    try {
      writeConvexProductionReceipt(
        receiptOutputPath,
        preflightReceipt,
        repositoryRoot,
      );
    } catch {
      // Stderr retains the negative receipt if durable output fails.
    }
    process.stderr.write(`${JSON.stringify(preflightReceipt)}\n`);
    throw error;
  }

let temporaryRoot: string;
try {
  temporaryRoot = mkdtempSync(
    path.join(tmpdir(), "sourcera-convex-production-"),
  );
} catch (error) {
  const setupReceipt = createConvexProductionFailureReceipt({
    approvedSha: plan.approvedSha,
    checkedAt: new Date().toISOString(),
    failureStage: "temporary_setup",
    knownGoodReceiptSha256,
    knownGoodSha: plan.knownGoodSha,
    result: "baseline_failed",
    target: plan.target,
  });
  try {
    writeConvexProductionReceipt(
      receiptOutputPath,
      setupReceipt,
      repositoryRoot,
    );
  } catch {
    // Stderr retains the negative receipt if durable output fails.
  }
  process.stderr.write(`${JSON.stringify(setupReceipt)}\n`);
  throw error;
}
const releaseHome = path.join(temporaryRoot, "home");
const releaseConfigHome = path.join(releaseHome, ".config");
const releaseNpmUserConfig = path.join(releaseHome, ".npmrc");
mkdirSync(releaseConfigHome, { mode: 0o700, recursive: true });
const releaseProcessEnvironment: NodeJS.ProcessEnv = {
  ...environmentWithoutProductionCredentials,
  HOME: releaseHome,
  XDG_CONFIG_HOME: releaseConfigHome,
  npm_config_userconfig: releaseNpmUserConfig,
};
const releaseWorktree = path.join(temporaryRoot, "checkout");
let worktreeAdded = false;
let deploymentStarted = false;
let identityStamped = false;
let interruption:
  | { exitCode: number; signal: "SIGHUP" | "SIGINT" | "SIGTERM" }
  | undefined;
let activeProviderCommand:
  | { child: ChildProcess; interruptible: boolean }
  | undefined;

function terminateProviderCommand(child: ChildProcess) {
  if (!child.pid) return;
  try {
    if (process.platform !== "win32") process.kill(-child.pid, "SIGTERM");
    else child.kill("SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

async function runProviderCommand(
  command: string,
  arguments_: string[],
  cwd: string,
  environment: NodeJS.ProcessEnv,
  options: { capture: boolean; interruptible: boolean },
) {
  if (interruption && options.interruptible) {
    throw new Error("Convex production command interrupted before execution");
  }
  if (activeProviderCommand) {
    throw new Error("A Convex production provider command is already active");
  }
  const child = spawn(command, arguments_, {
    cwd,
    detached: process.platform !== "win32",
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
  });
  activeProviderCommand = { child, interruptible: options.interruptible };
  let stderr = "";
  let stdout = "";
  let outputBytes = 0;
  let commandError: Error | undefined;
  const capture = (stream: "stderr" | "stdout", chunk: Buffer) => {
    outputBytes += chunk.byteLength;
    if (outputBytes > 64 * 1024 * 1024) {
      commandError ??= new Error("Convex provider output exceeded 64 MiB");
      terminateProviderCommand(child);
      return;
    }
    const text = chunk.toString("utf8");
    if (stream === "stderr") {
      stderr += text;
      if (!options.capture) process.stderr.write(text);
    } else {
      stdout += text;
      if (!options.capture) process.stdout.write(text);
    }
  };
  child.stderr?.on("data", (chunk: Buffer) => capture("stderr", chunk));
  child.stdout?.on("data", (chunk: Buffer) => capture("stdout", chunk));
  child.once("error", (error) => {
    commandError = error;
  });
  const status = await new Promise<number>((resolve) => {
    child.once("close", (code) => resolve(code ?? 1));
  });
  if (activeProviderCommand?.child === child) activeProviderCommand = undefined;
  if (commandError) throw commandError;
  if (interruption && options.interruptible) {
    throw new Error(
      `Convex production command interrupted by ${interruption.signal}`,
    );
  }
  if (status !== 0) {
    throw new Error(
      `${command} ${arguments_.join(" ")} failed${
        stderr.trim() ? `: ${stderr.trim()}` : ""
      }`,
    );
  }
  return stdout.trimEnd();
}

function cleanupCheckout() {
  if (worktreeAdded) {
    const removal = spawnSync(
      "git",
      ["worktree", "remove", "--force", releaseWorktree],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: releaseProcessEnvironment,
      },
    );
    const removalFailed = Boolean(removal.error) || removal.status !== 0;
    worktreeAdded = false;
    identityStamped = false;
    if (removalFailed) {
      rmSync(releaseWorktree, { force: true, recursive: true });
      spawnSync("git", ["worktree", "prune"], {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: releaseProcessEnvironment,
      });
      throw new Error("Convex release worktree cleanup failed");
    }
  }
}

function cleanup() {
  let cleanupError: unknown;
  try {
    cleanupCheckout();
  } catch (error) {
    cleanupError = error;
  }
  rmSync(temporaryRoot, { force: true, recursive: true });
  if (cleanupError) throw cleanupError;
}

let liveRollbackAnchor: ConvexProductionRollbackAnchor | undefined;
for (const [signal, exitCode] of [
  ["SIGHUP", 129],
  ["SIGINT", 130],
  ["SIGTERM", 143],
] as const) {
  process.once(signal, () => {
    interruption ??= { exitCode, signal };
    if (activeProviderCommand?.interruptible) {
      terminateProviderCommand(activeProviderCommand.child);
    }
  });
}

try {
  const execution = await executeConvexProductionDeploymentAsync(plan, {
    cleanupCheckout,
    async executeStep(release, step) {
      if (!worktreeAdded) {
        throw new Error("Convex production step has no detached checkout");
      }
      if (step.name === "deploy") {
        const identityPath = path.join(
          releaseWorktree,
          CONVEX_RELEASE_IDENTITY_PATH,
        );
        const identitySource = readFileSync(identityPath, "utf8");
        if (release.approvedSha === plan.knownGoodSha) {
          assertConvexRollbackReleaseIdentityPlaceholder(identitySource);
        } else {
          assertConvexReleaseIdentityPlaceholder(identitySource);
        }
        writeFileSync(
          identityPath,
          renderConvexReleaseIdentity(release.approvedSha, "production"),
          "utf8",
        );
        assertControlledConvexReleaseIdentityChange(
          readGitStatus(
            releaseWorktree,
            releaseProcessEnvironment,
          ),
        );
        identityStamped = true;
        deploymentStarted = true;
      }

      const environment = createConvexProductionStepEnvironment(
        releaseProcessEnvironment,
        step,
        { canarySecret, deployKey },
        release.approvedSha,
      );
      environment.HOME = releaseHome;
      environment.XDG_CONFIG_HOME = releaseConfigHome;
      environment.npm_config_userconfig = releaseNpmUserConfig;
      const rollbackInProgress =
        deploymentStarted &&
        liveRollbackAnchor !== undefined &&
        release.approvedSha === plan.knownGoodSha;
      if (step.name !== "canary") {
        await runProviderCommand(
          step.command,
          step.arguments,
          releaseWorktree,
          environment,
          { capture: false, interruptible: !rollbackInProgress },
        );
        return undefined;
      }

      const canaryOutput = await runProviderCommand(
        step.command,
        step.arguments,
        releaseWorktree,
        environment,
        { capture: true, interruptible: !rollbackInProgress },
      );
      if (identityStamped) {
        assertControlledConvexReleaseIdentityChange(
          readGitStatus(releaseWorktree, releaseProcessEnvironment),
        );
      } else {
        requireCleanCheckout(releaseWorktree, releaseProcessEnvironment);
      }
      return JSON.parse(canaryOutput) as unknown;
    },
    prepareCheckout(commitSha) {
      if (worktreeAdded) {
        throw new Error("Previous Convex release worktree was not removed");
      }
      try {
        runInherited(
          "git",
          ["worktree", "add", "--detach", releaseWorktree, commitSha],
          repositoryRoot,
          releaseProcessEnvironment,
        );
        worktreeAdded = true;
        identityStamped = false;
        if (
          commandOutput(
            "git",
            ["rev-parse", "HEAD"],
            releaseWorktree,
            releaseProcessEnvironment,
          ) !== commitSha
        ) {
          throw new Error("Detached Convex release worktree is on the wrong commit");
        }
        requireCleanCheckout(
          releaseWorktree,
          releaseProcessEnvironment,
        );
      } catch (error) {
        if (worktreeAdded) {
          try {
            cleanupCheckout();
          } catch {
            rmSync(releaseWorktree, { force: true, recursive: true });
            spawnSync("git", ["worktree", "prune"], {
              cwd: repositoryRoot,
              encoding: "utf8",
              env: releaseProcessEnvironment,
            });
          }
        } else {
          rmSync(releaseWorktree, { force: true, recursive: true });
          spawnSync("git", ["worktree", "prune"], {
            cwd: repositoryRoot,
            encoding: "utf8",
            env: releaseProcessEnvironment,
          });
        }
        throw error;
      }
    },
    recordRollbackAnchor(anchor) {
      liveRollbackAnchor = anchor;
    },
  });
  cleanup();
  requireCleanCheckout(repositoryRoot, releaseProcessEnvironment);

  const receipt =
    execution.result === "passed"
      ? {
          approvedSha: plan.approvedSha,
          canary: execution.canary,
          checkedAt: new Date().toISOString(),
          event: "convex_production_deployment_receipt",
          knownGoodSha: plan.knownGoodSha,
          knownGoodReceiptSha256,
          result: "passed",
          rollbackAnchor: execution.rollbackAnchor,
          schemaVersion: 1,
          target: plan.target,
        }
      : {
          candidate: execution.candidate,
          checkedAt: new Date().toISOString(),
          event: "convex_production_rollback_receipt",
          promotionAllowed: false,
          result: execution.result,
          rollback: {
            ...execution.rollback,
            knownGoodReceiptSha256,
          },
          rollbackAnchor: execution.rollbackAnchor,
          schemaVersion: 1,
          target: plan.target,
        };
  const serializedReceipt = `${JSON.stringify(receipt, null, 2)}\n`;
  writeConvexProductionReceipt(receiptOutputPath, receipt, repositoryRoot);
  process.stdout.write(serializedReceipt);
  if (execution.result !== "passed") {
    process.exitCode = interruption?.exitCode ?? 1;
  }
} catch (error) {
  try {
    cleanup();
  } catch {
    // The failure receipt below remains non-promotable.
  }
  const rollbackAnchor =
    error instanceof ConvexProductionRollbackError ||
    error instanceof ConvexProductionCandidateError
      ? error.rollbackAnchor
      : liveRollbackAnchor;
  const result = interruption
    ? error instanceof ConvexProductionRollbackError
      ? "rollback_failed"
      : deploymentStarted
        ? "rollback_required"
        : "interrupted_before_mutation"
    : error instanceof ConvexProductionBaselineError ||
        (!rollbackAnchor && !deploymentStarted)
      ? "baseline_failed"
      : error instanceof ConvexProductionRollbackError
        ? "rollback_failed"
        : deploymentStarted
          ? "rollback_required"
          : "failed";
  const failureStage =
    interruption
      ? "signal"
      : error instanceof ConvexProductionBaselineError
      ? "baseline"
      : error instanceof ConvexProductionRollbackError
        ? "rollback"
        : deploymentStarted
          ? "candidate_or_cleanup"
          : rollbackAnchor
            ? "candidate_install"
            : "preflight";
  const failureReceipt = createConvexProductionFailureReceipt({
    approvedSha: plan.approvedSha,
    checkedAt: new Date().toISOString(),
    failureStage,
    knownGoodReceiptSha256,
    knownGoodSha: plan.knownGoodSha,
    result,
    rollbackAnchor,
    target: plan.target,
  });
  try {
    writeConvexProductionReceipt(
      receiptOutputPath,
      failureReceipt,
      repositoryRoot,
    );
  } catch {
    // Stderr retains the complete negative receipt if durable output fails.
  }
  process.stderr.write(`${JSON.stringify(failureReceipt)}\n`);
  process.exitCode = interruption?.exitCode ?? 1;
}
}

void runDeployment().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Convex production deployment failed"}\n`,
  );
  process.exitCode = 1;
});
