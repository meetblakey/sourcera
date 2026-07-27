import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionTargets from "../config/production-targets.json";
import {
  ConvexProductionRollbackSignalGuard,
  createConvexProductionBaseEnvironment,
  createConvexProductionForcedRollbackReceipt,
  createConvexProductionRollbackOnlyPlan,
  createConvexProductionStepEnvironment,
  executeConvexProductionRollbackOnly,
  readConvexProductionForcedRollbackArguments,
  readConvexProductionForcedRollbackInputBytes,
  writeConvexProductionReceipt,
} from "./lib/convex-production-deployment";
import {
  assertControlledConvexReleaseIdentityChange,
  assertConvexRollbackReleaseIdentityPlaceholder,
  CONVEX_RELEASE_IDENTITY_PATH,
  renderConvexReleaseIdentity,
} from "./lib/convex-release-identity";
import { readPinnedConvexProductionTarget } from "./lib/convex-production-target";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);

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
  if (result.error || result.status !== 0) {
    throw new Error("Convex forced rollback command failed");
  }
  return result.stdout.trim();
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
    throw new Error("Convex forced rollback requires a clean checkout");
  }
}

function terminateProviderCommand(child: ChildProcess) {
  if (!child.pid) return;
  try {
    if (process.platform !== "win32") process.kill(-child.pid, "SIGTERM");
    else child.kill("SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

async function main() {
  const arguments_ = readConvexProductionForcedRollbackArguments(
    process.argv.slice(2),
    repositoryRoot,
  );
  const target = readPinnedConvexProductionTarget(productionTargets);
  const baseEnvironment = createConvexProductionBaseEnvironment(process.env);
  const candidateSha = commandOutput(
    "git",
    ["rev-parse", "HEAD"],
    repositoryRoot,
    baseEnvironment,
  );
  const plan = createConvexProductionRollbackOnlyPlan(
    process.env,
    target,
    candidateSha,
  );
  requireCleanCheckout(repositoryRoot, baseEnvironment);
  commandOutput(
    "git",
    ["cat-file", "-e", `${plan.knownGoodSha}^{commit}`],
    repositoryRoot,
    baseEnvironment,
  );
  commandOutput(
    "git",
    ["merge-base", "--is-ancestor", plan.knownGoodSha, plan.candidateSha],
    repositoryRoot,
    baseEnvironment,
  );
  const knownGoodReceiptBytes = readFileSync(arguments_.knownGoodReceiptPath);
  const approvalReceiptBytes = arguments_.approvalReceiptPath
    ? readFileSync(arguments_.approvalReceiptPath)
    : undefined;
  const knownGoodInput = readConvexProductionForcedRollbackInputBytes(
    knownGoodReceiptBytes,
    approvalReceiptBytes,
    {
      candidateSha: plan.candidateSha,
      githubRepository: process.env.GITHUB_REPOSITORY,
      githubRunAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
      githubRunId: Number(process.env.GITHUB_RUN_ID),
      knownGoodReceiptSha256: arguments_.knownGoodReceiptSha256,
      knownGoodSha: plan.knownGoodSha,
      target: plan.target,
    },
  );

  const deployKey = process.env.CONVEX_DEPLOY_KEY!;
  const canarySecret = process.env.SOURCERA_CONVEX_CANARY_SECRET!;
  const temporaryRoot = mkdtempSync(
    path.join(tmpdir(), "sourcera-convex-forced-rollback-"),
  );
  const releaseHome = path.join(temporaryRoot, "home");
  const releaseConfigHome = path.join(releaseHome, ".config");
  const releaseNpmUserConfig = path.join(releaseHome, ".npmrc");
  const releaseWorktree = path.join(temporaryRoot, "checkout");
  mkdirSync(releaseConfigHome, { mode: 0o700, recursive: true });
  writeFileSync(releaseNpmUserConfig, "", { mode: 0o600 });
  const releaseEnvironment: NodeJS.ProcessEnv = {
    ...baseEnvironment,
    HOME: releaseHome,
    XDG_CONFIG_HOME: releaseConfigHome,
    npm_config_userconfig: releaseNpmUserConfig,
  };
  const signalGuard = new ConvexProductionRollbackSignalGuard();
  let activeProviderCommand: ChildProcess | undefined;
  let worktreeAdded = false;
  let identityStamped = false;

  const signalHandlers = new Map<
    "SIGHUP" | "SIGINT" | "SIGTERM",
    () => void
  >();
  for (const signal of ["SIGHUP", "SIGINT", "SIGTERM"] as const) {
    const handler = () => {
      if (signalGuard.record(signal) && activeProviderCommand) {
        terminateProviderCommand(activeProviderCommand);
      }
    };
    signalHandlers.set(signal, handler);
    process.on(signal, handler);
  }

  const runProviderCommand = async (
    command: string,
    providerArguments: string[],
    environment: NodeJS.ProcessEnv,
    capture: boolean,
  ) => {
    if (activeProviderCommand) {
      throw new Error("A Convex forced rollback command is already active");
    }
    if (signalGuard.signal && !signalGuard.mutationStarted) {
      throw new Error("Convex forced rollback interrupted before mutation");
    }
    const child = spawn(command, providerArguments, {
      cwd: releaseWorktree,
      detached: process.platform !== "win32",
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    activeProviderCommand = child;
    let commandError: Error | undefined;
    let outputBytes = 0;
    let stdout = "";
    const collect = (chunk: Buffer, isStdout: boolean) => {
      outputBytes += chunk.byteLength;
      if (outputBytes > 64 * 1024 * 1024) {
        commandError ??= new Error("Convex forced rollback output is too large");
        terminateProviderCommand(child);
        return;
      }
      if (capture && isStdout) stdout += chunk.toString("utf8");
    };
    child.stdout?.on("data", (chunk: Buffer) => collect(chunk, true));
    child.stderr?.on("data", (chunk: Buffer) => collect(chunk, false));
    child.once("error", (error) => {
      commandError = error;
    });
    const status = await new Promise<number>((resolve) => {
      child.once("close", (code) => resolve(code ?? 1));
    });
    if (activeProviderCommand === child) activeProviderCommand = undefined;
    if (commandError) throw commandError;
    if (signalGuard.signal && !signalGuard.mutationStarted) {
      throw new Error("Convex forced rollback interrupted before mutation");
    }
    if (status !== 0) {
      throw new Error("Convex forced rollback provider command failed");
    }
    return stdout.trimEnd();
  };

  const cleanupCheckout = () => {
    if (!worktreeAdded) return;
    const result = spawnSync(
      "git",
      ["worktree", "remove", "--force", releaseWorktree],
      { cwd: repositoryRoot, encoding: "utf8", env: releaseEnvironment },
    );
    worktreeAdded = false;
    identityStamped = false;
    if (result.error || result.status !== 0) {
      rmSync(releaseWorktree, { force: true, recursive: true });
      spawnSync("git", ["worktree", "prune"], {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: releaseEnvironment,
      });
      throw new Error("Convex forced rollback checkout cleanup failed");
    }
  };

  const cleanup = () => {
    let cleanupError: unknown;
    try {
      cleanupCheckout();
    } catch (error) {
      cleanupError = error;
    }
    rmSync(temporaryRoot, { force: true, recursive: true });
    if (cleanupError) throw cleanupError;
  };

  try {
    const result = await executeConvexProductionRollbackOnly(plan, {
      cleanupCheckout,
      async executeStep(release, step) {
        if (!worktreeAdded) {
          throw new Error("Convex forced rollback has no detached checkout");
        }
        if (step.name === "deploy") {
          const identityPath = path.join(
            releaseWorktree,
            CONVEX_RELEASE_IDENTITY_PATH,
          );
          assertConvexRollbackReleaseIdentityPlaceholder(
            readFileSync(identityPath, "utf8"),
          );
          writeFileSync(
            identityPath,
            renderConvexReleaseIdentity(release.knownGoodSha, "production"),
            "utf8",
          );
          assertControlledConvexReleaseIdentityChange(
            readGitStatus(releaseWorktree, releaseEnvironment),
          );
          identityStamped = true;
          signalGuard.beginProviderMutation();
        }
        const environment = createConvexProductionStepEnvironment(
          releaseEnvironment,
          step,
          { canarySecret, deployKey },
          release.knownGoodSha,
        );
        environment.HOME = releaseHome;
        environment.XDG_CONFIG_HOME = releaseConfigHome;
        environment.npm_config_userconfig = releaseNpmUserConfig;
        const output = await runProviderCommand(
          step.command,
          step.arguments,
          environment,
          step.name === "canary",
        );
        if (step.name !== "canary") return undefined;
        if (!identityStamped) {
          throw new Error("Convex forced rollback identity was not stamped");
        }
        assertControlledConvexReleaseIdentityChange(
          readGitStatus(releaseWorktree, releaseEnvironment),
        );
        return JSON.parse(output) as unknown;
      },
      prepareCheckout(commitSha) {
        if (worktreeAdded) {
          throw new Error("Convex forced rollback checkout already exists");
        }
        commandOutput(
          "git",
          ["worktree", "add", "--detach", releaseWorktree, commitSha],
          repositoryRoot,
          releaseEnvironment,
        );
        worktreeAdded = true;
        if (
          commandOutput(
            "git",
            ["rev-parse", "HEAD"],
            releaseWorktree,
            releaseEnvironment,
          ) !== commitSha ||
          commandOutput(
            "git",
            ["rev-parse", "--abbrev-ref", "HEAD"],
            releaseWorktree,
            releaseEnvironment,
          ) !== "HEAD"
        ) {
          throw new Error("Convex forced rollback checkout is not detached");
        }
        requireCleanCheckout(releaseWorktree, releaseEnvironment);
      },
    });
    cleanup();
    requireCleanCheckout(repositoryRoot, releaseEnvironment);
    const receipt = createConvexProductionForcedRollbackReceipt({
      ...(knownGoodInput.kind === "genesis"
        ? {
            approvalReceiptSha256:
              knownGoodInput.approvalReceiptSha256,
            knownGoodReceiptKind: "genesis" as const,
          }
        : {}),
      candidateSha: plan.candidateSha,
      canary: result.canary,
      checkedAt: new Date().toISOString(),
      interruptedBy: signalGuard.signal ?? null,
      knownGoodReceiptSha256: arguments_.knownGoodReceiptSha256,
      knownGoodSha: plan.knownGoodSha,
      target: plan.target,
    });
    writeConvexProductionReceipt(
      arguments_.receiptOutputPath,
      receipt,
      repositoryRoot,
    );
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
    if (signalGuard.signal) {
      process.exitCode =
        signalGuard.signal === "SIGHUP"
          ? 129
          : signalGuard.signal === "SIGINT"
            ? 130
            : 143;
    }
  } catch (error) {
    try {
      cleanup();
    } catch {
      // Missing proof remains fail-closed.
    }
    throw error;
  } finally {
    for (const [signal, handler] of signalHandlers) {
      process.off(signal, handler);
    }
  }
}

void main().catch(() => {
  process.stderr.write("Convex forced production rollback failed.\n");
  process.exitCode = 1;
});
