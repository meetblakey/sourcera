import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { type ConvexProductionTarget } from "@sourcera/domain/convex";

import productionReleaseConfig from "../config/production-release.json";
import productionTargets from "../config/production-targets.json";
import {
  createProductionReleaseSignalHandler,
  executeProductionRelease,
  readProductionReleaseConfig,
  validateProductionBootstrapRouteProof,
  validateProductionGithubApprovalEvidence,
  validateProductionVercelBaselineProvenance,
  validateProductionApplicationInspection,
  writeProductionReleaseReceipt,
  type ProductionApplicationInspection,
  type ProductionApprovalMode,
  type ProductionAnchorMode,
  type ProductionBootstrapAnchorIdentity,
  type ProductionBootstrapRoute,
  type ProductionReleaseDependencies,
  type ProductionReleaseEvidence,
  type ProductionReleaseReceipt,
} from "./lib/production-release-controller";
import { createConvexProductionBootstrapEnvironment } from "./lib/convex-production-bootstrap";
import { readPassingConvexProductionForcedRollbackReceipt } from "./lib/convex-production-deployment";
import { collectProductionRepositoryState } from "./lib/production-repository-evidence";
import {
  readVercelProductionReleaseConfig,
  validateProductionDomains,
  validateProductionEnvironmentMetadata,
  type ReleaseProcessEnvironment,
  type VercelProductionApplication,
  type VercelProductionStageReceipt,
  type VercelProductionTarget,
} from "./lib/vercel-production-release";
import {
  readProductionGithubHandoff,
  readProductionPreflightBundle,
  readProductionWorkflowIdentity,
} from "./lib/production-release-workflow";

const repositoryRoot = realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
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

type ProductionReleaseLane = "convex" | "gates" | "github" | "vercel";

export interface ProductionReleaseArguments {
  anchorMode: ProductionAnchorMode;
  githubHandoffPath?: string;
  githubProofPath?: string;
  knownGoodConvexReceiptPath: string;
  preflightDirectory?: string;
  receiptOutputPath: string;
  vercelBaselineDirectory?: string;
}

export interface ProductionBootstrapRouteInput {
  reason: string;
  route: ProductionBootstrapRoute;
  selectedAnchor?: ProductionBootstrapAnchorIdentity;
}

interface CommandOutput {
  error?: Error;
  status: number;
  stderr: string;
  stdout: string;
}

export interface SignalResponsiveCommandRunner {
  run(
    command: string,
    arguments_: string[],
    environment: ReleaseProcessEnvironment,
    cwd?: string,
    options?: {
      stopMode?: "force-after-grace" | "wait-for-reconciliation";
    },
  ): Promise<CommandOutput>;
  stop(): Promise<void>;
}

export async function persistProductionReleaseOutcome(options: {
  emit: (proof: string) => void;
  receipt: ProductionReleaseReceipt;
  reconcile: () => Promise<ProductionReleaseReceipt>;
  write: (receipt: ProductionReleaseReceipt) => Promise<void>;
}) {
  try {
    await options.write(options.receipt);
    return options.receipt;
  } catch (writeError) {
    let truthfulReceipt = options.receipt;
    if (
      (options.receipt.trafficMutated ||
        options.receipt.convexCandidateRemainsLive !== false) &&
      (options.receipt.result !== "rolled_back" ||
        options.receipt.convexCandidateRemainsLive !== false)
    ) {
      try {
        truthfulReceipt = await options.reconcile();
      } catch (reconciliationError) {
        const proofEvidence = {
          ...(options.receipt.proofEvidence ?? {}),
        };
        const proofSha256 = {
          ...(options.receipt.proofSha256 ?? {}),
        };
        if (
          options.receipt.convexCandidateRemainsLive !== false &&
          proofEvidence.convexRollback === undefined
        ) {
          recordReceiptError(
            proofEvidence,
            proofSha256,
            "convexRollback",
            reconciliationError,
          );
        }
        truthfulReceipt = {
          ...options.receipt,
          convexCandidateRemainsLive:
            options.receipt.convexCandidateRemainsLive === false
              ? false
              : "unknown",
          error: `receipt persistence failed and recovery was not proven: ${
            reconciliationError instanceof Error
              ? reconciliationError.message
              : "unknown reconciliation failure"
          }`,
          event: "production_release_recovery_required_receipt",
          failedStage: "receipt_persistence",
          promotionAllowed: false,
          proofEvidence,
          proofSha256,
          reconciliation: {
            controller: "recovery_failed",
            ...(options.receipt.convexCandidateRemainsLive !== false
              ? { convex: "rollback_not_proven" }
              : {}),
          },
          result: "recovery_required",
          rollbackOrder: [],
          trafficMutated: options.receipt.trafficMutated,
        };
      }
    }
    if (!truthfulReceipt.error) {
      truthfulReceipt = {
        ...truthfulReceipt,
        error:
          writeError instanceof Error
            ? writeError.message
            : "production release receipt persistence failed",
      };
    }
    try {
      await options.write(truthfulReceipt);
    } catch {
      options.emit(`${JSON.stringify(truthfulReceipt)}\n`);
    }
    return truthfulReceipt;
  }
}

function recordReceiptEvidence(
  evidence: Record<string, string>,
  hashes: Record<string, string>,
  key: string,
  raw: string,
) {
  if (!raw.trim()) throw new Error(`${key} evidence is empty`);
  if (evidence[key] !== undefined || hashes[key] !== undefined) {
    throw new Error(`${key} evidence is duplicated`);
  }
  evidence[key] = raw;
  hashes[key] = createHash("sha256").update(raw).digest("hex");
}

function recordReceiptError(
  evidence: Record<string, string>,
  hashes: Record<string, string>,
  key: string,
  error: unknown,
) {
  if (evidence[key] !== undefined || hashes[key] !== undefined) return;
  recordReceiptEvidence(
    evidence,
    hashes,
    key,
    JSON.stringify({
      error: error instanceof Error ? error.message : "unknown failure",
      outcome: "failed",
    }),
  );
}

function productionConfigurationReceiptEvidence(
  anchorMode: ProductionAnchorMode,
  approvedSha: string,
  knownGoodSha: string,
) {
  const raw = JSON.stringify({
    anchorMode,
    approvedSha,
    knownGoodSha,
    productionRelease: productionReleaseConfig,
    productionTargets,
  });
  return {
    proofEvidence: { configuration: raw },
    proofSha256: {
      configuration: createHash("sha256").update(raw).digest("hex"),
    },
    providerProofEvidence: {},
    providerProofSha256: {},
  };
}

function requireRecoveryEvidence(
  evidence: ProductionReleaseEvidence,
  context: string,
) {
  if (evidence.exitCode !== 0) throw new Error(`${context} failed`);
  try {
    JSON.parse(evidence.raw);
  } catch (cause) {
    throw new Error(`${context} did not emit JSON`, { cause });
  }
}

export async function reconcileProductionTrafficEvidence(options: {
  baseReceipt: ProductionReleaseReceipt;
  convexTarget: ConvexProductionTarget;
  dependencies: ProductionReleaseDependencies;
  failedStage: string;
  now?: () => Date;
  productionTargets: VercelProductionTarget[];
  reason: string;
  stagedReceipt?: VercelProductionStageReceipt;
  teamId: string;
}): Promise<ProductionReleaseReceipt> {
  const reconciliation: Record<string, string> = {};
  const rollbackOrder: VercelProductionApplication[] = [];
  const proofEvidence = {
    ...options.baseReceipt.proofEvidence,
  };
  const proofSha256 = {
    ...options.baseReceipt.proofSha256,
  };
  const providerProofEvidence = {
    ...options.baseReceipt.providerProofEvidence,
  };
  const providerProofSha256 = {
    ...options.baseReceipt.providerProofSha256,
  };
  let recoveryRequired = false;
  if (options.baseReceipt.trafficMutated && options.stagedReceipt) {
    for (const staged of [...options.stagedReceipt.applications].reverse()) {
      const target = options.productionTargets.find(
        (candidate) => candidate.application === staged.application,
      );
      if (!target) {
        throw new Error(`${staged.application} production target is missing`);
      }
      const reconciliationKey = `emergency-reconcile-${staged.application}`;
      try {
        let inspection = await options.dependencies.inspectApplication(
          staged.application,
          staged,
        );
        recordReceiptEvidence(
          providerProofEvidence,
          providerProofSha256,
          reconciliationKey,
          inspection.raw,
        );
        let inspected = validateProductionApplicationInspection(
          inspection,
          staged.application,
          staged,
          options.teamId,
          target,
        );
        if (inspected.current.deploymentId === staged.deploymentId) {
          rollbackOrder.push(staged.application);
          const rollbackKey = `emergency-rollback-${staged.application}`;
          try {
            const rollback = await options.dependencies.rollbackApplication(
              staged.application,
              staged.predecessorDeploymentId,
            );
            recordReceiptEvidence(
              providerProofEvidence,
              providerProofSha256,
              rollbackKey,
              rollback.raw,
            );
            requireRecoveryEvidence(
              rollback,
              `${staged.application} emergency rollback`,
            );
          } catch (error) {
            recordReceiptError(
              providerProofEvidence,
              providerProofSha256,
              rollbackKey,
              error,
            );
            recoveryRequired = true;
            reconciliation[staged.application] = `rollback_command_failed:${
              error instanceof Error ? error.message : "unknown failure"
            }`;
          }
          const readbackKey =
            `emergency-rollback-readback-${staged.application}`;
          try {
            inspection = await options.dependencies.inspectApplication(
              staged.application,
              staged,
            );
            recordReceiptEvidence(
              providerProofEvidence,
              providerProofSha256,
              readbackKey,
              inspection.raw,
            );
            inspected = validateProductionApplicationInspection(
              inspection,
              staged.application,
              staged,
              options.teamId,
              target,
            );
          } catch (error) {
            recordReceiptError(
              providerProofEvidence,
              providerProofSha256,
              readbackKey,
              error,
            );
            throw error;
          }
        }
        if (
          inspected.current.deploymentId !== staged.predecessorDeploymentId ||
          inspected.current.healthy !== true
        ) {
          recoveryRequired = true;
          reconciliation[staged.application] = "predecessor_not_proven";
        } else {
          reconciliation[staged.application] = "predecessor_healthy";
        }
      } catch (error) {
        recordReceiptError(
          providerProofEvidence,
          providerProofSha256,
          reconciliationKey,
          error,
        );
        recoveryRequired = true;
        reconciliation[staged.application] = `recovery_failed:${
          error instanceof Error ? error.message : "unknown failure"
        }`;
      }
    }
    for (const staged of options.stagedReceipt.applications) {
      const target = options.productionTargets.find(
        (candidate) => candidate.application === staged.application,
      );
      if (!target) {
        throw new Error(`${staged.application} production target is missing`);
      }
      const finalReadbackKey =
        `emergency-rollback-final-${staged.application}`;
      try {
        const inspection = await options.dependencies.inspectApplication(
          staged.application,
          staged,
        );
        recordReceiptEvidence(
          providerProofEvidence,
          providerProofSha256,
          finalReadbackKey,
          inspection.raw,
        );
        const inspected = validateProductionApplicationInspection(
          inspection,
          staged.application,
          staged,
          options.teamId,
          target,
        );
        if (
          inspected.current.deploymentId !== staged.predecessorDeploymentId ||
          inspected.current.healthy !== true
        ) {
          recoveryRequired = true;
          reconciliation[staged.application] = "final_predecessor_not_proven";
        } else {
          reconciliation[staged.application] = "predecessor_healthy_final";
        }
      } catch (error) {
        recordReceiptError(
          providerProofEvidence,
          providerProofSha256,
          finalReadbackKey,
          error,
        );
        recoveryRequired = true;
        reconciliation[staged.application] = `final_readback_failed:${
          error instanceof Error ? error.message : "unknown failure"
        }`;
      }
    }
  } else if (options.baseReceipt.trafficMutated) {
    recoveryRequired = true;
    reconciliation.controller = "staged_receipt_missing";
  }
  let convexCandidateRemainsLive =
    options.baseReceipt.convexCandidateRemainsLive;
  if (convexCandidateRemainsLive !== false) {
    const rollbackKey = "convexRollback";
    try {
      const rollback = await options.dependencies.rollbackConvex();
      if (proofEvidence[rollbackKey] === undefined) {
        recordReceiptEvidence(
          proofEvidence,
          proofSha256,
          rollbackKey,
          rollback.raw,
        );
      } else if (proofEvidence[rollbackKey] !== rollback.raw) {
        throw new Error("Convex rollback evidence changed across recovery");
      }
      readPassingConvexProductionForcedRollbackReceipt(
        JSON.parse(rollback.raw) as unknown,
        {
          ...(options.baseReceipt.anchorMode === "genesis"
            ? {
                approvalReceiptSha256:
                  options.baseReceipt.proofSha256.githubApprovalReceipt,
              }
            : {}),
          candidateSha: options.baseReceipt.approvedSha,
          knownGoodReceiptSha256: createHash("sha256")
            .update(options.baseReceipt.proofEvidence.knownGoodConvex)
            .digest("hex"),
          knownGoodSha: options.baseReceipt.knownGoodSha,
          target: options.convexTarget,
        },
      );
      convexCandidateRemainsLive = false;
      reconciliation.convex = "known_good_proven";
    } catch (error) {
      recordReceiptError(proofEvidence, proofSha256, rollbackKey, error);
      recoveryRequired = true;
      reconciliation.convex = `rollback_not_proven:${
        error instanceof Error ? error.message : "unknown failure"
      }`;
    }
  }
  return {
    ...options.baseReceipt,
    checkedAt: (options.now ?? (() => new Date()))().toISOString(),
    convexCandidateRemainsLive,
    error: options.reason,
    event: recoveryRequired
      ? "production_release_recovery_required_receipt"
      : "production_release_rollback_receipt",
    failedStage: options.failedStage,
    promotionAllowed: false,
    proofEvidence,
    proofSha256,
    providerProofEvidence,
    providerProofSha256,
    reconciliation,
    result: recoveryRequired ? "recovery_required" : "rolled_back",
    rollbackOrder,
    trafficMutated: options.baseReceipt.trafficMutated,
  };
}

export function createSignalResponsiveCommandRunner(
  options: { terminationGraceMs?: number } = {},
): SignalResponsiveCommandRunner {
  const terminationGraceMs = options.terminationGraceMs ?? 3_000;
  let stopping = false;
  let active:
    | {
        child: ChildProcess;
        settled: Promise<CommandOutput>;
        stopMode: "force-after-grace" | "wait-for-reconciliation";
      }
    | undefined;

  const terminate = (
    child: ChildProcess,
    signal: NodeJS.Signals,
    scope: "child" | "group" = "group",
  ) => {
    if (!child.pid) return;
    try {
      if (process.platform !== "win32" && scope === "group") {
        process.kill(-child.pid, signal);
      } else {
        child.kill(signal);
      }
    } catch {
      child.kill(signal);
    }
  };

  return {
    async run(
      command,
      arguments_,
      environment,
      cwd = repositoryRoot,
      options = {},
    ) {
      if (stopping) {
        return {
          error: new Error("provider command runner is stopping"),
          status: 1,
          stderr: "",
          stdout: "",
        };
      }
      if (active) throw new Error("a provider command is already active");
      let child: ChildProcess;
      try {
        child = spawn(command, arguments_, {
          cwd,
          detached: process.platform !== "win32",
          env: environment as NodeJS.ProcessEnv,
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        return {
          error: error instanceof Error ? error : new Error("command failed"),
          status: 1,
          stderr: "",
          stdout: "",
        };
      }
      let commandError: Error | undefined;
      let stderr = "";
      let stdout = "";
      let outputBytes = 0;
      const capture = (stream: "stderr" | "stdout", chunk: Buffer) => {
        outputBytes += chunk.byteLength;
        if (outputBytes > 64 * 1024 * 1024) {
          commandError ??= new Error("provider command output exceeded 64 MiB");
          if (options.stopMode === "wait-for-reconciliation") {
            terminate(child, "SIGTERM", "child");
          } else {
            terminate(child, "SIGKILL");
          }
          return;
        }
        if (stream === "stderr") stderr += chunk.toString("utf8");
        else stdout += chunk.toString("utf8");
      };
      child.stderr?.on("data", (chunk: Buffer) => capture("stderr", chunk));
      child.stdout?.on("data", (chunk: Buffer) => capture("stdout", chunk));
      child.once("error", (error) => {
        commandError = error;
      });
      const settled = new Promise<CommandOutput>((resolve) => {
        child.once("close", (code) => {
          resolve({
            error: commandError,
            status: code ?? 1,
            stderr,
            stdout,
          });
        });
      });
      active = {
        child,
        settled,
        stopMode: options.stopMode ?? "force-after-grace",
      };
      try {
        return await settled;
      } finally {
        if (active?.child === child) active = undefined;
      }
    },
    async stop() {
      stopping = true;
      const current = active;
      if (!current) return;
      if (current.stopMode === "wait-for-reconciliation") {
        // The Convex child owns rollback. Signal only that coordinator and
        // wait for its durable reconciliation receipt; never kill its group.
        terminate(current.child, "SIGTERM", "child");
        await current.settled;
        return;
      }
      terminate(current.child, "SIGTERM");
      let timeout: NodeJS.Timeout | undefined;
      const stopped = await Promise.race([
        current.settled.then(() => true),
        new Promise<false>((resolve) => {
          timeout = setTimeout(() => resolve(false), terminationGraceMs);
        }),
      ]);
      if (timeout) clearTimeout(timeout);
      if (!stopped) {
        terminate(current.child, "SIGKILL");
        await current.settled;
      }
    },
  };
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

function requireOutsideRepository(value: string, root: string, option: string) {
  const candidate = canonicalizePotentialPath(value);
  const canonicalRoot = realpathSync(root);
  const relative = path.relative(canonicalRoot, candidate);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error(`${option} must remain outside the repository`);
  }
  return candidate;
}

export function readProductionReleaseArguments(
  arguments_: string[],
  root: string,
  options: { allowExistingReceipt?: boolean } = {},
): ProductionReleaseArguments {
  const values = new Map<string, string>();
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index];
    const value = arguments_[index + 1];
    if (
      ![
        "--anchor-mode",
        "--github-handoff",
        "--github-proof",
        "--known-good-convex-receipt",
        "--preflight-dir",
        "--receipt-out",
        "--vercel-baseline-dir",
      ].includes(option ?? "") ||
      !value?.trim() ||
      value.startsWith("--") ||
      values.has(option)
    ) {
      throw new Error(
        "Usage: release-production --anchor-mode <normal|genesis> [--preflight-dir <path> --github-proof <path> --github-handoff <path>] [--vercel-baseline-dir <path>] --known-good-convex-receipt <path> --receipt-out <path>",
      );
    }
    values.set(option, value);
  }
  const hasArtifactInputs = [
    "--preflight-dir",
    "--github-proof",
    "--github-handoff",
  ].filter((option) => values.has(option));
  if (![0, 3].includes(hasArtifactInputs.length)) {
    throw new Error("production workflow artifact inputs must be supplied together");
  }
  const anchorMode = values.get("--anchor-mode");
  if (anchorMode !== "normal" && anchorMode !== "genesis") {
    throw new Error("--anchor-mode must be exactly normal or genesis");
  }
  const hasVercelBaseline = values.has("--vercel-baseline-dir");
  if ((anchorMode === "genesis") !== hasVercelBaseline) {
    throw new Error(
      "genesis requires one Vercel baseline directory; normal forbids it",
    );
  }
  const expectedSize =
    3 + hasArtifactInputs.length + (hasVercelBaseline ? 1 : 0);
  if (values.size !== expectedSize) {
    throw new Error(
      "Usage: release-production --anchor-mode <normal|genesis> [--preflight-dir <path> --github-proof <path> --github-handoff <path>] [--vercel-baseline-dir <path>] --known-good-convex-receipt <path> --receipt-out <path>",
    );
  }
  const knownGoodConvexReceiptPath = requireOutsideRepository(
    values.get("--known-good-convex-receipt")!,
    root,
    "--known-good-convex-receipt",
  );
  const receiptOutputPath = requireOutsideRepository(
    values.get("--receipt-out")!,
    root,
    "--receipt-out",
  );
  if (knownGoodConvexReceiptPath === receiptOutputPath) {
    throw new Error("production receipt paths must be distinct");
  }
  if (existsSync(receiptOutputPath) && !options.allowExistingReceipt) {
    throw new Error("--receipt-out must not already exist");
  }
  const githubHandoffPath = values.has("--github-handoff")
    ? requireOutsideRepository(
        values.get("--github-handoff")!,
        root,
        "--github-handoff",
      )
    : undefined;
  const githubProofPath = values.has("--github-proof")
    ? requireOutsideRepository(
        values.get("--github-proof")!,
        root,
        "--github-proof",
      )
    : undefined;
  const preflightDirectory = values.has("--preflight-dir")
    ? requireOutsideRepository(
        values.get("--preflight-dir")!,
        root,
        "--preflight-dir",
      )
    : undefined;
  const vercelBaselineDirectory = values.has("--vercel-baseline-dir")
    ? requireOutsideRepository(
        values.get("--vercel-baseline-dir")!,
        root,
        "--vercel-baseline-dir",
      )
    : undefined;
  const paths = [
    knownGoodConvexReceiptPath,
    receiptOutputPath,
    githubHandoffPath,
    githubProofPath,
    preflightDirectory,
    vercelBaselineDirectory,
  ].filter((value): value is string => value !== undefined);
  if (new Set(paths).size !== paths.length) {
    throw new Error("production receipt and handoff paths must be distinct");
  }
  return {
    anchorMode,
    githubHandoffPath,
    githubProofPath,
    knownGoodConvexReceiptPath,
    preflightDirectory,
    receiptOutputPath,
    vercelBaselineDirectory,
  };
}

function requiredCredential(
  environment: ReleaseProcessEnvironment,
  key: string,
) {
  const value = environment[key];
  if (typeof value !== "string" || !value || value !== value.trim()) {
    throw new Error(`${key} is required for production release`);
  }
  return value;
}

export function assertProductionMutationCredentialBoundary(
  source: ReleaseProcessEnvironment,
) {
  for (const forbidden of [
    "GH_TOKEN",
    "GITHUB_TOKEN",
    "SOURCERA_RELEASE_GITHUB_TOKEN",
  ]) {
    if (source[forbidden] !== undefined) {
      throw new Error(`protected mutation forbids ${forbidden}`);
    }
  }
  if (
    source.VERCEL_TOKEN !== undefined &&
    source.CONVEX_DEPLOY_KEY !== undefined
  ) {
    throw new Error(
      "DEC-PROD-002 forbids Vercel and Convex write credentials in one process",
    );
  }
}

export function createProductionReleaseLaneEnvironment(
  source: ReleaseProcessEnvironment,
  lane: ProductionReleaseLane,
  privateHome: string,
): ReleaseProcessEnvironment {
  const environment: ReleaseProcessEnvironment = {};
  for (const key of SAFE_ENVIRONMENT_KEYS) {
    if (source[key] !== undefined) environment[key] = source[key];
  }
  if (lane === "github") {
    environment.GH_TOKEN = requiredCredential(
      source,
      "SOURCERA_RELEASE_GITHUB_TOKEN",
    );
  } else if (lane === "vercel") {
    environment.VERCEL_TOKEN = requiredCredential(source, "VERCEL_TOKEN");
  } else if (lane === "convex") {
    environment.CONVEX_DEPLOY_KEY = requiredCredential(
      source,
      "CONVEX_DEPLOY_KEY",
    );
    environment.SOURCERA_CONVEX_CANARY_SECRET = requiredCredential(
      source,
      "SOURCERA_CONVEX_CANARY_SECRET",
    );
  }
  const home = path.resolve(privateHome);
  environment.HOME = home;
  environment.XDG_CACHE_HOME = path.join(home, ".cache");
  environment.XDG_CONFIG_HOME = path.join(home, ".config");
  environment.XDG_DATA_HOME = path.join(home, ".local", "share");
  environment.XDG_STATE_HOME = path.join(home, ".local", "state");
  environment.npm_config_userconfig = path.join(home, ".npmrc");
  return environment;
}

function runCommand(
  command: string,
  arguments_: string[],
  environment: ReleaseProcessEnvironment,
  cwd = repositoryRoot,
): CommandOutput {
  const result = spawnSync(command, arguments_, {
    cwd,
    encoding: "utf8",
    env: environment as NodeJS.ProcessEnv,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    error: result.error,
    status: result.status ?? 1,
    stderr: result.stderr ?? "",
    stdout: result.stdout ?? "",
  };
}

function requireCommand(
  command: string,
  arguments_: string[],
  environment: ReleaseProcessEnvironment,
  context: string,
  cwd = repositoryRoot,
) {
  const result = runCommand(command, arguments_, environment, cwd);
  if (result.error || result.status !== 0) {
    throw new Error(`${context} failed`);
  }
  return result.stdout.trim();
}

async function requireProviderCommand(
  runner: SignalResponsiveCommandRunner,
  command: string,
  arguments_: string[],
  environment: ReleaseProcessEnvironment,
  context: string,
  cwd = repositoryRoot,
) {
  const result = await runner.run(command, arguments_, environment, cwd);
  if (result.error || result.status !== 0) {
    throw new Error(`${context} failed`);
  }
  return result.stdout.trim();
}

function jsonCommandEvidence(result: CommandOutput): ProductionReleaseEvidence {
  return {
    exitCode: result.status,
    raw: JSON.stringify({
      outcome: result.status === 0 && !result.error ? "pass" : "fail",
      stderr: result.stderr,
      stdout: result.stdout,
    }),
  };
}

function readJson(output: string, context: string): unknown {
  const candidates = [output, ...output.split(/\r?\n/).reverse()];
  for (const candidate of candidates) {
    if (!candidate.trim()) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // Provider CLIs may emit informational lines before JSON.
    }
  }
  throw new Error(`${context} did not return JSON`);
}

function requiredRecord(value: unknown, context: string) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${context} did not return an object`);
  }
  return value as Record<string, unknown>;
}

function githubApi(
  endpoint: string,
  environment: ReleaseProcessEnvironment,
) {
  const output = requireCommand(
    "gh",
    [
      "api",
      "--method",
      "GET",
      "-H",
      "Accept: application/vnd.github+json",
      "-H",
      "X-GitHub-Api-Version: 2026-03-10",
      endpoint,
    ],
    environment,
    `GitHub API ${endpoint}`,
  );
  return readJson(output, `GitHub API ${endpoint}`);
}

function githubApiPages(
  endpoint: string,
  environment: ReleaseProcessEnvironment,
) {
  const output = requireCommand(
    "gh",
    [
      "api",
      "--method",
      "GET",
      "--paginate",
      "--slurp",
      "-H",
      "Accept: application/vnd.github+json",
      "-H",
      "X-GitHub-Api-Version: 2026-03-10",
      endpoint,
    ],
    environment,
    `GitHub API ${endpoint}`,
  );
  const pages = readJson(output, `GitHub API ${endpoint}`);
  if (!Array.isArray(pages)) throw new Error("GitHub pagination proof is invalid");
  return pages;
}

function collectGithubWorkflowSource(
  prefix: string,
  run: Record<string, unknown>,
  environment: ReleaseProcessEnvironment,
) {
  if (
    typeof run.path !== "string" ||
    !/^\.github\/workflows\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:yml|yaml)$/.test(
      run.path,
    ) ||
    typeof run.head_sha !== "string" ||
    !/^[a-f0-9]{40}$/i.test(run.head_sha)
  ) {
    throw new Error("retained authority workflow source identity is invalid");
  }
  const encodedPath = run.path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const source = requiredRecord(
    githubApi(
      `${prefix}/contents/${encodedPath}?ref=${encodeURIComponent(run.head_sha)}`,
      environment,
    ),
    "retained authority workflow source",
  );
  if (
    source.type !== "file" ||
    source.encoding !== "base64" ||
    source.path !== run.path ||
    typeof source.content !== "string"
  ) {
    throw new Error("retained authority workflow source is incomplete");
  }
  const encoded = source.content.replace(/\s+/g, "");
  const contentBytes = Buffer.from(encoded, "base64");
  if (
    encoded.length === 0 ||
    contentBytes.toString("base64") !== encoded
  ) {
    throw new Error("retained authority workflow source encoding is invalid");
  }
  const content = contentBytes.toString("utf8");
  return {
    content,
    path: run.path,
    ref: run.head_sha,
    sha256: createHash("sha256").update(content).digest("hex"),
  };
}

export function createGithubRunAttemptEndpoint(
  runId: number,
  runAttempt: number,
) {
  if (
    !Number.isSafeInteger(runId) ||
    runId < 1 ||
    !Number.isSafeInteger(runAttempt) ||
    runAttempt < 1
  ) {
    throw new Error("GitHub run ID and attempt must be positive integers");
  }
  return `/actions/runs/${String(runId)}/attempts/${String(runAttempt)}`;
}

export function selectExactVercelBaselineArtifacts(
  artifacts: Array<Record<string, unknown>>,
  input: {
    activationArtifactName: string;
    runId: number;
    sha: string;
  },
) {
  if (
    !FULL_GIT_COMMIT_SHA.test(input.sha) ||
    !Number.isSafeInteger(input.runId) ||
    input.runId < 1 ||
    input.activationArtifactName !== input.activationArtifactName.trim() ||
    !input.activationArtifactName
  ) {
    throw new Error("Vercel baseline artifact selection identity is invalid");
  }
  const stageArtifactName =
    `vercel-production-baseline-stage-${input.sha}-${String(input.runId)}`;
  const exactArtifact = (name: string, context: string) => {
    const matches = artifacts
      .map((artifact) => requiredRecord(artifact, context))
      .filter((artifact) => artifact.name === name);
    if (matches.length === 0) {
      throw new Error(`Vercel baseline ${context} is missing`);
    }
    if (matches.length > 1) {
      throw new Error(`Vercel baseline ${context} is duplicated`);
    }
    return matches[0];
  };
  return {
    activationArtifact: exactArtifact(
      input.activationArtifactName,
      "activation artifact",
    ),
    stageArtifact: exactArtifact(stageArtifactName, "stage artifact"),
    stageArtifactName,
  };
}

function collectProductionBootstrapRouteProof(
  config: ReturnType<typeof readProductionReleaseConfig>,
  prefix: string,
  environment: ReleaseProcessEnvironment,
  input: ProductionBootstrapRouteInput,
) {
  if (
    !input.reason.trim() ||
    input.reason !== input.reason.trim() ||
    input.reason.length > 500
  ) {
    throw new Error("Bootstrap reason is invalid");
  }
  const workflowPaths = [
    config.github.workflow,
    config.github.bootstrapWorkflow,
  ] as const;
  const workflowRunPages = workflowPaths.map((workflowPath) => ({
    pages: githubApiPages(
      `${prefix}/actions/workflows/${path.basename(workflowPath)}/runs?branch=main&event=workflow_dispatch&per_page=100`,
      environment,
    ),
    workflowPath,
  }));
  const logicalRuns = workflowRunPages.flatMap(({ pages, workflowPath }) =>
    pages.flatMap((page) => {
      const record = requiredRecord(
        page,
        `${workflowPath} production workflow page`,
      );
      if (!Array.isArray(record.workflow_runs)) {
        throw new Error(`${workflowPath} production workflow page is incomplete`);
      }
      return record.workflow_runs.map((run) =>
        requiredRecord(run, `${workflowPath} workflow run`),
      );
    }),
  );
  const workflowRunAttempts = logicalRuns.map((run) => {
    if (
      !Number.isSafeInteger(run.id) ||
      Number(run.id) < 1 ||
      !Number.isSafeInteger(run.run_attempt) ||
      Number(run.run_attempt) < 1 ||
      typeof run.path !== "string"
    ) {
      throw new Error("Production workflow run cannot enumerate exact attempts");
    }
    return {
      attempts: Array.from(
        { length: Number(run.run_attempt) },
        (_, index) =>
          githubApi(
            `${prefix}${createGithubRunAttemptEndpoint(
              Number(run.id),
              index + 1,
            )}`,
            environment,
          ),
      ),
      runId: run.id,
      workflowPath: run.path,
    };
  });
  const workflowRunAttemptJobPages = workflowRunAttempts.flatMap((entry) =>
    entry.attempts.map((attempt) => {
      const attemptRecord = requiredRecord(
        attempt,
        "production workflow attempt",
      );
      return {
        pages: githubApiPages(
          `${prefix}${createGithubRunAttemptEndpoint(
            Number(entry.runId),
            Number(attemptRecord.run_attempt),
          )}/jobs?per_page=100`,
          environment,
        ),
        runAttempt: attemptRecord.run_attempt,
        runId: entry.runId,
        workflowPath: entry.workflowPath,
      };
    }),
  );
  const artifactPages = logicalRuns.map((run) => ({
    pages: githubApiPages(
      `${prefix}/actions/runs/${String(run.id)}/artifacts?per_page=100`,
      environment,
    ),
    runId: run.id,
    workflowPath: run.path,
  }));
  const repositoryArtifactPages = githubApiPages(
    `${prefix}/actions/artifacts?per_page=100`,
    environment,
  );
  const retainedArtifacts = repositoryArtifactPages.flatMap((page) => {
    const record = requiredRecord(page, "repository artifact page");
    if (!Array.isArray(record.artifacts)) {
      throw new Error("repository artifact page is incomplete");
    }
    return record.artifacts.map((artifact) =>
      requiredRecord(artifact, "repository artifact"),
    );
  });
  const authorityArtifactHistories = retainedArtifacts
    .filter(
      (artifact) =>
        typeof artifact.name === "string" &&
        (/^production-release-[a-f0-9]{40}-\d+-\d+$/i.test(artifact.name) ||
          /^production-anchor-authority-[a-f0-9]{40}-\d+-\d+$/i.test(
            artifact.name,
          )),
    )
    .map((artifact) => {
      const name = String(artifact.name);
      const match = name.match(/-(\d+)-(\d+)$/);
      if (!match) throw new Error("production authority artifact name is invalid");
      const runId = Number(match[1]);
      const runAttempt = Number(match[2]);
      const endpoint = createGithubRunAttemptEndpoint(runId, runAttempt);
      const run = requiredRecord(
        githubApi(`${prefix}${endpoint}`, environment),
        "retained authority workflow attempt",
      );
      return {
        artifactId: artifact.id,
        jobPages: githubApiPages(
          `${prefix}${endpoint}/jobs?per_page=100`,
          environment,
        ),
        run,
        runAttempt,
        runId,
        workflowSource: collectGithubWorkflowSource(prefix, run, environment),
      };
    });
  const inventory = {
    artifactPages,
    authorityArtifactHistories,
    repositoryArtifactPages,
    workflowRunAttemptJobPages,
    workflowRunAttempts,
    workflowRunPages,
  };
  const proof = {
    authorityPromotionAllowed: false,
    decision: "DEC-PROD-002",
    event: "production_bootstrap_route_proof",
    historyDecision: "DEC-PROD-005",
    historyScope: "github_retained_artifacts",
    inventory,
    inventorySha256: createHash("sha256")
      .update(JSON.stringify(inventory))
      .digest("hex"),
    reasonSha256: createHash("sha256").update(input.reason).digest("hex"),
    route: input.route,
    schemaVersion: 1,
    selectedAnchor:
      input.route === "expired_anchor" ? input.selectedAnchor : null,
  };
  validateProductionBootstrapRouteProof(proof, {
    authorityWorkflowLineage: config.github.authorityWorkflowLineage,
    route: input.route,
    ...(input.selectedAnchor ? { selectedAnchor: input.selectedAnchor } : {}),
    workflowPaths,
  });
  return proof;
}

export function collectGithubApprovalEvidence(
  approvedSha: string,
  knownGoodSha: string | undefined,
  knownGoodReleaseReceipt: unknown | undefined,
  approvalMode: ProductionApprovalMode,
  environment: ReleaseProcessEnvironment,
  vercelBaselineInput?: {
    activationReceiptRaw: string;
    artifactDigest: string;
    artifactName: string;
    runAttempt: number;
    runId: number;
    sha: string;
    stageReceiptRaw: string;
    stageReceiptRawSha256: string;
  },
  bootstrapRouteInput?: ProductionBootstrapRouteInput,
) {
  if (
    approvalMode === "baseline" &&
    (knownGoodSha !== undefined || knownGoodReleaseReceipt !== undefined)
  ) {
    throw new Error("Baseline release cannot use known-good provenance");
  }
  if (approvalMode === "genesis" && !vercelBaselineInput) {
    throw new Error("Genesis release requires Vercel baseline provenance");
  }
  if (approvalMode === "genesis" && !bootstrapRouteInput) {
    throw new Error("Genesis release requires machine-proved bootstrap routing");
  }
  if (approvalMode !== "genesis" && vercelBaselineInput !== undefined) {
    throw new Error(`${approvalMode} release forbids Vercel baseline provenance`);
  }
  if (approvalMode !== "genesis" && bootstrapRouteInput !== undefined) {
    throw new Error(`${approvalMode} release forbids bootstrap route authority`);
  }
  const config = readProductionReleaseConfig(productionReleaseConfig);
  const repository = `${config.repository.owner}/${config.repository.name}`;
  const prefix = `/repos/${repository}`;
  const ref = githubApi(`${prefix}/git/ref/heads/main`, environment);
  const branchProtection = githubApi(
    `${prefix}/branches/main/protection`,
    environment,
  );

  const rulesetPages = githubApiPages(
    `${prefix}/rulesets?includes_parents=true&per_page=100`,
    environment,
  );
  const rulesets = rulesetPages.flatMap((page) => {
    if (!Array.isArray(page)) throw new Error("GitHub ruleset page is invalid");
    return page;
  });

  const checkPages = githubApiPages(
    `${prefix}/commits/${approvedSha}/check-runs?filter=latest&per_page=100`,
    environment,
  );
  const checkRuns = checkPages.flatMap((page) => {
    const record = requiredRecord(page, "GitHub check-run page");
    if (!Array.isArray(record.check_runs)) {
      throw new Error("GitHub check-run page is incomplete");
    }
    return record.check_runs;
  });
  const workflowRuns = config.github.requiredChecks.map(({ name }) => {
    const matches = checkRuns.filter(
      (candidate) => requiredRecord(candidate, "GitHub check run").name === name,
    );
    if (matches.length !== 1) {
      throw new Error(`GitHub check ${name} is missing or duplicated`);
    }
    const check = requiredRecord(matches[0], "GitHub check run");
    if (typeof check.details_url !== "string") {
      throw new Error(`GitHub check ${name} has no workflow run URL`);
    }
    const match = check.details_url.match(/\/actions\/runs\/(\d+)(?:\/|$)/);
    if (!match) throw new Error(`GitHub check ${name} has an invalid run URL`);
    const run = requiredRecord(
      githubApi(`${prefix}/actions/runs/${match[1]}`, environment),
      "GitHub workflow run",
    );
    return { ...run, job: name };
  });

  const environmentProof = githubApi(
    `${prefix}/environments/${config.github.environment}`,
    environment,
  );
  const runId = requiredCredential(process.env, "GITHUB_RUN_ID");
  const run = githubApi(`${prefix}/actions/runs/${runId}`, environment);
  const reviewHistory = githubApi(
    `${prefix}/actions/runs/${runId}/approvals`,
    environment,
  );
  const collaboratorPages = githubApiPages(
    `${prefix}/collaborators?affiliation=direct&per_page=100`,
    environment,
  );
  const collaborators = collaboratorPages.flatMap((page) => {
    if (!Array.isArray(page)) throw new Error("GitHub collaborator page is invalid");
    return page;
  });

  let vercelBaseline: Record<string, unknown> | undefined;
  if (vercelBaselineInput) {
    const baselineRun = requiredRecord(
      githubApi(
        `${prefix}${createGithubRunAttemptEndpoint(
          vercelBaselineInput.runId,
          vercelBaselineInput.runAttempt,
        )}`,
        environment,
      ),
      "Vercel baseline workflow run",
    );
    const artifactPages = githubApiPages(
      `${prefix}/actions/runs/${String(vercelBaselineInput.runId)}/artifacts?per_page=100`,
      environment,
    );
    const artifacts = artifactPages.flatMap((page) => {
      const record = requiredRecord(page, "Vercel baseline artifact page");
      if (!Array.isArray(record.artifacts)) {
        throw new Error("Vercel baseline artifact page is incomplete");
      }
      return record.artifacts;
    });
    const selectedArtifacts = selectExactVercelBaselineArtifacts(
      artifacts.map((artifact) =>
        requiredRecord(artifact, "Vercel baseline artifact"),
      ),
      {
        activationArtifactName: vercelBaselineInput.artifactName,
        runId: vercelBaselineInput.runId,
        sha: vercelBaselineInput.sha,
      },
    );
    const stageArtifactDigest = selectedArtifacts.stageArtifact.digest;
    vercelBaseline = {
      activationReceiptRaw: vercelBaselineInput.activationReceiptRaw,
      activationReceiptSha256: createHash("sha256")
        .update(vercelBaselineInput.activationReceiptRaw)
        .digest("hex"),
      artifact: selectedArtifacts.activationArtifact,
      artifactDigest: vercelBaselineInput.artifactDigest,
      artifactName: vercelBaselineInput.artifactName,
      run: baselineRun,
      runAttempt: vercelBaselineInput.runAttempt,
      runId: vercelBaselineInput.runId,
      sha: vercelBaselineInput.sha,
      stageArtifact: selectedArtifacts.stageArtifact,
      stageArtifactDigest,
      stageArtifactName: selectedArtifacts.stageArtifactName,
      stageReceiptRaw: vercelBaselineInput.stageReceiptRaw,
      stageReceiptRawSha256: vercelBaselineInput.stageReceiptRawSha256,
      workflowSource: collectGithubWorkflowSource(
        prefix,
        baselineRun,
        environment,
      ),
    };
    validateProductionVercelBaselineProvenance(vercelBaseline, {
      ...vercelBaselineInput,
      authorityWorkflowLineage: config.github.authorityWorkflowLineage,
      workflowPath: config.github.baselineWorkflow,
    });
  }

  const bootstrapRoute = bootstrapRouteInput
    ? collectProductionBootstrapRouteProof(
        config,
        prefix,
        environment,
        bootstrapRouteInput,
      )
    : undefined;

  let knownGood: Record<string, unknown> | undefined;
  if (approvalMode === "normal") {
    if (!knownGoodSha) {
      throw new Error("Normal release requires a known-good SHA");
    }
    if (knownGoodReleaseReceipt === undefined) {
      throw new Error("Normal release requires a known-good release receipt");
    }
    const knownGoodRunId = requiredCredential(
      process.env,
      "SOURCERA_KNOWN_GOOD_RUN_ID",
    );
    const knownGoodRunAttempt = requiredCredential(
      process.env,
      "SOURCERA_KNOWN_GOOD_RUN_ATTEMPT",
    );
    const knownGoodArtifactName = requiredCredential(
      process.env,
      "SOURCERA_KNOWN_GOOD_ARTIFACT_NAME",
    );
    const knownGoodArtifactDigest = requiredCredential(
      process.env,
      "SOURCERA_KNOWN_GOOD_ARTIFACT_DIGEST",
    );
    const knownGoodRun = githubApi(
      `${prefix}${createGithubRunAttemptEndpoint(
        Number(knownGoodRunId),
        Number(knownGoodRunAttempt),
      )}`,
      environment,
    );
    const artifactPages = githubApiPages(
      `${prefix}/actions/runs/${knownGoodRunId}/artifacts?per_page=100`,
      environment,
    );
    const artifacts = artifactPages.flatMap((page) => {
      const record = requiredRecord(page, "GitHub artifact page");
      if (!Array.isArray(record.artifacts)) {
        throw new Error("GitHub artifact page is incomplete");
      }
      return record.artifacts;
    });
    const matchingArtifacts = artifacts.filter(
      (artifact) =>
        requiredRecord(artifact, "GitHub artifact").name ===
        knownGoodArtifactName,
    );
    if (matchingArtifacts.length !== 1) {
      throw new Error("Known-good GitHub artifact is missing or duplicated");
    }
    knownGood = {
      artifact: matchingArtifacts[0],
      artifactDigest: knownGoodArtifactDigest,
      artifactName: knownGoodArtifactName,
      releaseReceipt: knownGoodReleaseReceipt,
      run: knownGoodRun,
      runAttempt: Number(knownGoodRunAttempt),
      runId: Number(knownGoodRunId),
      sha: knownGoodSha,
      workflowSource: collectGithubWorkflowSource(
        prefix,
        requiredRecord(knownGoodRun, "GitHub known-good workflow run"),
        environment,
      ),
    };
  } else if (
    process.env.SOURCERA_KNOWN_GOOD_RUN_ID?.trim() ||
    process.env.SOURCERA_KNOWN_GOOD_RUN_ATTEMPT?.trim() ||
    process.env.SOURCERA_KNOWN_GOOD_ARTIFACT_NAME?.trim() ||
    process.env.SOURCERA_KNOWN_GOOD_ARTIFACT_DIGEST?.trim()
  ) {
    throw new Error(
      `${approvalMode} release forbids historical artifact provenance`,
    );
  }

  const value = {
    approvedSha,
    branchProtection,
    checkRuns: { check_runs: checkRuns, total_count: checkRuns.length },
    collaborators,
    environment: environmentProof,
    ...(knownGood ? { knownGood } : {}),
    ...(bootstrapRoute ? { bootstrapRoute } : {}),
    ...(vercelBaseline ? { vercelBaseline } : {}),
    ref,
    repository,
    reviewHistory,
    rulesets,
    run,
    workflowRuns,
  };
  validateProductionGithubApprovalEvidence(
    value,
    config,
    approvedSha,
    knownGoodSha,
    approvalMode,
  );
  const raw = JSON.stringify(value);
  if (approvalMode === "normal") {
    return { exitCode: 0, raw, value };
  }
  const runProof = requiredRecord(run, "GitHub current workflow run");
  const approvalReceiptRaw = JSON.stringify({
    approval: {
      reviewer: config.github.approver,
      state: "approved",
    },
    approvedSha,
    checkedAt: new Date().toISOString(),
    environment: config.github.environment,
    event: "github_production_release_approval_receipt",
    repository,
    result: "passed",
    run: {
      attempt: 1,
      headSha: approvedSha,
      id: runProof.id,
    },
    schemaVersion: 1,
    sourceProofSha256: createHash("sha256").update(raw).digest("hex"),
  });
  return { approvalReceiptRaw, exitCode: 0, raw, value };
}

function repositoryEvidence(
  approvedSha: string,
  dispatchRef: string,
  environment: ReleaseProcessEnvironment,
): ProductionReleaseEvidence {
  const value = collectProductionRepositoryState({
    approvedSha,
    dispatchRef,
    environment: environment as NodeJS.ProcessEnv,
    includeUntracked: true,
    repositoryRoot,
  });
  return { exitCode: 0, raw: JSON.stringify(value), value };
}

async function vercelCommandEvidence(
  runner: SignalResponsiveCommandRunner,
  arguments_: string[],
  environment: ReleaseProcessEnvironment,
): Promise<ProductionReleaseEvidence> {
  return jsonCommandEvidence(
    await runner.run(
      path.join(repositoryRoot, "node_modules", ".bin", "vercel"),
      arguments_,
      environment,
    ),
  );
}

function healthIsValid(
  value: unknown,
  application: VercelProductionApplication,
  expectedCommitSha: string,
) {
  const health = requiredRecord(value, `${application} health proof`);
  return (
    health.status === "ok" &&
    health.service === "sourcera" &&
    health.domain === application &&
    health.environment === "production" &&
    health.commitSha === expectedCommitSha
  );
}

export function resolveSpecLintTsx(root: string) {
  return path.join(root, "tools", "spec-lint", "node_modules", ".bin", "tsx");
}

export function createProductionHealthProbeArguments(domain: string) {
  return [
    "--input-type=module",
    "--eval",
    "const response=await fetch(process.argv[1],{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)}); if(!response.ok) process.exit(1); process.stdout.write(await response.text());",
    `https://${domain}/api/health`,
  ];
}

export function createVercelPromotionArguments(
  deploymentId: string,
  teamId: string,
) {
  return [
    "promote",
    deploymentId,
    "--yes",
    "--scope",
    teamId,
    "--timeout",
    "180s",
  ];
}

async function readProductionDomainHealth(
  runner: SignalResponsiveCommandRunner,
  domain: string,
  environment: ReleaseProcessEnvironment,
  application: VercelProductionApplication,
) {
  const output = await requireProviderCommand(
    runner,
    process.execPath,
    createProductionHealthProbeArguments(domain),
    environment,
    `${application} production-domain health`,
  );
  return readJson(output, `${application} production-domain health`);
}

export async function main(arguments_ = process.argv.slice(2)) {
  const parsedArguments = readProductionReleaseArguments(
    arguments_,
    repositoryRoot,
  );
  const anchorMode = parsedArguments.anchorMode;
  const approvedSha = requiredCredential(
    process.env,
    "SOURCERA_RELEASE_APPROVED_SHA",
  );
  const knownGoodSha = requiredCredential(process.env, "SOURCERA_KNOWN_GOOD_SHA");
  const dispatchRef = requiredCredential(process.env, "GITHUB_REF");
  if (
    !FULL_GIT_COMMIT_SHA.test(approvedSha) ||
    !FULL_GIT_COMMIT_SHA.test(knownGoodSha) ||
    approvedSha === knownGoodSha
  ) {
    throw new Error("candidate and known-good SHAs must be distinct full Git SHAs");
  }
  if (
    !parsedArguments.preflightDirectory ||
    !parsedArguments.githubProofPath ||
    !parsedArguments.githubHandoffPath
  ) {
    throw new Error(
      "protected mutation requires preflight and GitHub handoff artifacts",
    );
  }
  assertProductionMutationCredentialBoundary(process.env);
  const workflowIdentity = readProductionWorkflowIdentity({
    approvedSha,
    repository: requiredCredential(process.env, "GITHUB_REPOSITORY"),
    runAttempt: Number(requiredCredential(process.env, "GITHUB_RUN_ATTEMPT")),
    runId: Number(requiredCredential(process.env, "GITHUB_RUN_ID")),
  });
  const preflight = await readProductionPreflightBundle(
    parsedArguments.preflightDirectory,
    workflowIdentity,
  );
  const githubProofRaw = readFileSync(parsedArguments.githubProofPath, "utf8");
  const githubProof = requiredRecord(
    JSON.parse(githubProofRaw) as unknown,
    "GitHub approval proof",
  );
  if (anchorMode === "genesis") {
    const activationReceiptRaw = readFileSync(
      path.join(
        parsedArguments.vercelBaselineDirectory!,
        "vercel-production-baseline-activation.json",
      ),
      "utf8",
    );
    const stageReceiptRaw = readFileSync(
      path.join(
        parsedArguments.vercelBaselineDirectory!,
        "vercel-baseline-stage",
        "vercel-production-baseline-stage.json",
      ),
      "utf8",
    );
    validateProductionVercelBaselineProvenance(githubProof.vercelBaseline, {
      activationReceiptRaw,
      artifactDigest: requiredCredential(
        process.env,
        "SOURCERA_VERCEL_BASELINE_ARTIFACT_DIGEST",
      ),
      artifactName: requiredCredential(
        process.env,
        "SOURCERA_VERCEL_BASELINE_ARTIFACT_NAME",
      ),
      runAttempt: Number(
        requiredCredential(
          process.env,
          "SOURCERA_VERCEL_BASELINE_RUN_ATTEMPT",
        ),
      ),
      runId: Number(
        requiredCredential(process.env, "SOURCERA_VERCEL_BASELINE_RUN_ID"),
      ),
      sha: requiredCredential(process.env, "SOURCERA_VERCEL_BASELINE_SHA"),
      stageReceiptRaw,
      stageReceiptRawSha256: requiredCredential(
        process.env,
        "SOURCERA_VERCEL_BASELINE_STAGE_RECEIPT_SHA256",
      ),
      authorityWorkflowLineage: readProductionReleaseConfig(
        productionReleaseConfig,
      ).github.authorityWorkflowLineage,
      workflowPath: ".github/workflows/vercel-production-baseline.yml",
    });
  }
  const bootstrapRouteProofRaw =
    anchorMode === "genesis"
      ? JSON.stringify(
          requiredRecord(
            githubProof.bootstrapRoute,
            "production bootstrap route proof",
          ),
        )
      : undefined;
  const bootstrapRoute =
    anchorMode === "genesis"
      ? requiredCredential(process.env, "SOURCERA_BOOTSTRAP_ROUTE")
      : undefined;
  if (
    bootstrapRoute !== undefined &&
    bootstrapRoute !== "initial_genesis" &&
    bootstrapRoute !== "expired_anchor"
  ) {
    throw new Error("SOURCERA_BOOTSTRAP_ROUTE is invalid");
  }
  readProductionGithubHandoff(
    JSON.parse(readFileSync(parsedArguments.githubHandoffPath, "utf8")) as unknown,
    {
      authorizationContext:
        anchorMode === "normal"
          ? "normal"
          : bootstrapRoute!,
      ...(bootstrapRouteProofRaw ? { bootstrapRouteProofRaw } : {}),
      githubProofRaw,
      identity: workflowIdentity,
      knownGoodSha,
      preflightArtifactDigest: requiredCredential(
        process.env,
        "SOURCERA_PREFLIGHT_ARTIFACT_DIGEST",
      ),
      preflightReceiptRaw: preflight.receiptRaw,
    },
  );
  const githubApprovalReceiptInputPath = path.join(
    path.dirname(parsedArguments.githubProofPath),
    "github-production-approval.json",
  );
  const githubApprovalReceiptRaw =
    anchorMode === "genesis"
      ? readFileSync(githubApprovalReceiptInputPath, "utf8")
      : undefined;
  if (anchorMode === "normal") {
    if (!existsSync(parsedArguments.knownGoodConvexReceiptPath)) {
      throw new Error("--known-good-convex-receipt does not exist");
    }
    const knownGoodRunId = requiredCredential(
      process.env,
      "SOURCERA_KNOWN_GOOD_RUN_ID",
    );
    const knownGoodRunAttempt = requiredCredential(
      process.env,
      "SOURCERA_KNOWN_GOOD_RUN_ATTEMPT",
    );
    const knownGoodArtifactName = requiredCredential(
      process.env,
      "SOURCERA_KNOWN_GOOD_ARTIFACT_NAME",
    );
    const knownGoodArtifactDigest = requiredCredential(
      process.env,
      "SOURCERA_KNOWN_GOOD_ARTIFACT_DIGEST",
    );
    const knownGoodRunIdNumber = Number(knownGoodRunId);
    const knownGoodRunAttemptNumber = Number(knownGoodRunAttempt);
    const expectedArtifactName =
      `production-release-${knownGoodSha}-${knownGoodRunId}-${knownGoodRunAttempt}`;
    const knownGoodProof = requiredRecord(
      githubProof.knownGood,
      "GitHub known-good provenance proof",
    );
    if (
      !Number.isSafeInteger(knownGoodRunIdNumber) ||
      knownGoodRunIdNumber < 1 ||
      !Number.isSafeInteger(knownGoodRunAttemptNumber) ||
      knownGoodRunAttemptNumber < 1 ||
      knownGoodArtifactName !== expectedArtifactName ||
      !/^sha256:[a-f0-9]{64}$/.test(knownGoodArtifactDigest) ||
      knownGoodProof.runId !== knownGoodRunIdNumber ||
      knownGoodProof.runAttempt !== knownGoodRunAttemptNumber ||
      knownGoodProof.artifactName !== knownGoodArtifactName ||
      knownGoodProof.artifactDigest !== knownGoodArtifactDigest
    ) {
      throw new Error("known-good artifact handoff is not exact");
    }
    const knownGoodReleaseReceiptPath = path.join(
      path.dirname(parsedArguments.knownGoodConvexReceiptPath),
      `production-release-${knownGoodRunId}-${knownGoodRunAttempt}.json`,
    );
    if (!existsSync(knownGoodReleaseReceiptPath)) {
      throw new Error("known-good production release receipt is missing");
    }
    JSON.parse(readFileSync(knownGoodReleaseReceiptPath, "utf8"));
  } else if (
    existsSync(parsedArguments.knownGoodConvexReceiptPath) ||
    process.env.SOURCERA_KNOWN_GOOD_RUN_ID?.trim() ||
    process.env.SOURCERA_KNOWN_GOOD_RUN_ATTEMPT?.trim() ||
    process.env.SOURCERA_KNOWN_GOOD_ARTIFACT_NAME?.trim() ||
    process.env.SOURCERA_KNOWN_GOOD_ARTIFACT_DIGEST?.trim()
  ) {
    throw new Error(
      "Genesis release requires a fresh receipt path and no historical run",
    );
  }
  const targets = readVercelProductionReleaseConfig(
    productionTargets,
    repositoryRoot,
  );
  const temporaryRoot = mkdtempSync(
    path.join(os.tmpdir(), "sourcera-production-release-"),
  );
  const laneHomes = Object.fromEntries(
    (["convex", "gates", "github", "vercel"] as const).map((lane) => {
      const home = path.join(temporaryRoot, "home", lane);
      mkdirSync(path.join(home, ".config"), {
        mode: 0o700,
        recursive: true,
      });
      return [lane, home];
    }),
  ) as Record<ProductionReleaseLane, string>;
  const stageReceiptPath = path.join(temporaryRoot, "vercel-stage.json");
  const convexReceiptPath = path.join(
    path.dirname(parsedArguments.receiptOutputPath),
    "convex-production.json",
  );
  const convexRollbackReceiptPath = path.join(
    path.dirname(parsedArguments.receiptOutputPath),
    "convex-production-forced-rollback.json",
  );
  const approvalReceiptPath = path.join(
    path.dirname(parsedArguments.receiptOutputPath),
    "github-production-approval.json",
  );
  if (existsSync(convexReceiptPath)) {
    throw new Error("Convex production receipt output already exists");
  }
  if (existsSync(convexRollbackReceiptPath)) {
    throw new Error("Convex rollback receipt output already exists");
  }
  if (anchorMode === "genesis" && existsSync(approvalReceiptPath)) {
    throw new Error("GitHub production approval receipt already exists");
  }
  const gateEnvironment = createProductionReleaseLaneEnvironment(
    process.env,
    "gates",
    laneHomes.gates,
  );
  const vercelEnvironment = {
    ...createProductionReleaseLaneEnvironment(
      process.env,
      "vercel",
      laneHomes.vercel,
    ),
    SOURCERA_ENV: "production",
    SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
  };
  const convexEnvironment = {
    ...createProductionReleaseLaneEnvironment(
      process.env,
      "convex",
      laneHomes.convex,
    ),
    ...(anchorMode === "genesis"
      ? {
          GITHUB_REPOSITORY: "meetblakey/sourcera",
          GITHUB_RUN_ATTEMPT: requiredCredential(
            process.env,
            "GITHUB_RUN_ATTEMPT",
          ),
          GITHUB_RUN_ID: requiredCredential(process.env, "GITHUB_RUN_ID"),
        }
      : {}),
    SOURCERA_COMMIT_SHA: approvedSha,
    SOURCERA_ENV: "production",
    SOURCERA_KNOWN_GOOD_SHA: knownGoodSha,
    SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
  };
  const bootstrapEnvironment =
    anchorMode === "genesis"
      ? createConvexProductionBootstrapEnvironment({
          ...process.env,
          GITHUB_REPOSITORY: "meetblakey/sourcera",
          SOURCERA_ENV: "production",
          SOURCERA_KNOWN_GOOD_SHA: knownGoodSha,
          SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
        })
      : undefined;
  let providerCommands = createSignalResponsiveCommandRunner();
  let convexAttempted = false;
  let convexProven = false;
  let convexRollbackPromise: Promise<ProductionReleaseEvidence> | undefined;
  let stagedReceipt: VercelProductionStageReceipt | undefined;

  const rollbackConvex = () => {
    convexRollbackPromise ??= (async () => {
      const knownGoodReceiptRaw = readFileSync(
        parsedArguments.knownGoodConvexReceiptPath,
        "utf8",
      );
      const result = await providerCommands.run(
        path.join(repositoryRoot, "node_modules", ".bin", "tsx"),
        [
          "scripts/rollback-convex-production.ts",
          "--known-good-receipt",
          parsedArguments.knownGoodConvexReceiptPath,
          "--known-good-receipt-sha256",
          createHash("sha256").update(knownGoodReceiptRaw).digest("hex"),
          ...(anchorMode === "genesis"
            ? ["--approval-receipt", approvalReceiptPath]
            : []),
          "--receipt-out",
          convexRollbackReceiptPath,
        ],
        convexEnvironment,
        repositoryRoot,
        { stopMode: "wait-for-reconciliation" },
      );
      return {
        exitCode: result.status,
        raw: existsSync(convexRollbackReceiptPath)
          ? readFileSync(convexRollbackReceiptPath, "utf8")
          : JSON.stringify({ stderr: result.stderr }),
      };
    })();
    return convexRollbackPromise;
  };

  const dependencies: ProductionReleaseDependencies = {
    async deployConvex() {
      convexAttempted = true;
      const deploymentArguments = [
        "scripts/deploy-convex-production.ts",
        "--known-good-receipt",
        parsedArguments.knownGoodConvexReceiptPath,
        ...(anchorMode === "genesis"
          ? ["--approval-receipt", approvalReceiptPath]
          : []),
        "--receipt-out",
        convexReceiptPath,
      ];
      const result = await providerCommands.run(
        path.join(repositoryRoot, "node_modules", ".bin", "tsx"),
        deploymentArguments,
        convexEnvironment,
        repositoryRoot,
        { stopMode: "wait-for-reconciliation" },
      );
      const raw = existsSync(convexReceiptPath)
        ? readFileSync(convexReceiptPath, "utf8")
        : JSON.stringify({ stderr: result.stderr });
      if (result.status === 0) convexProven = true;
      return { exitCode: result.status, raw };
    },
    async inspectApplication(application, staged) {
      const target = targets.targets.find(
        (candidate) => candidate.application === application,
      );
      if (!target) throw new Error(`${application} target is missing`);
      const productionEnvironmentMetadata = readJson(
        await requireProviderCommand(
          providerCommands,
          path.join(repositoryRoot, "node_modules", ".bin", "vercel"),
          [
            "api",
            `/v10/projects/${target.projectId}/env?decrypt=false&teamId=${targets.teamId}`,
            "--raw",
            "--scope",
            targets.teamId,
          ],
          vercelEnvironment,
          `${application} production environment metadata readback`,
        ),
        `${application} production environment metadata readback`,
      );
      validateProductionEnvironmentMetadata(
        productionEnvironmentMetadata,
        target,
      );
      const productionDomains = readJson(
        await requireProviderCommand(
          providerCommands,
          path.join(repositoryRoot, "node_modules", ".bin", "vercel"),
          [
            "api",
            `/v9/projects/${target.projectId}/domains?production=true&limit=100&teamId=${targets.teamId}`,
            "--raw",
            "--scope",
            targets.teamId,
          ],
          vercelEnvironment,
          `${application} production domains readback`,
        ),
        `${application} production domains readback`,
      );
      validateProductionDomains(productionDomains, target);
      const candidateDeployment = requiredRecord(
        readJson(
          await requireProviderCommand(
            providerCommands,
            path.join(repositoryRoot, "node_modules", ".bin", "vercel"),
            [
              "api",
              `/v13/deployments/${staged.deploymentId}`,
              "--raw",
              "--scope",
              targets.teamId,
            ],
            vercelEnvironment,
            `${application} candidate readback`,
          ),
          `${application} candidate readback`,
        ),
        `${application} candidate readback`,
      );
      const project = requiredRecord(
        readJson(
          await requireProviderCommand(
            providerCommands,
            path.join(repositoryRoot, "node_modules", ".bin", "vercel"),
            [
              "api",
              `/v9/projects/${target.projectId}?teamId=${targets.teamId}`,
              "--raw",
              "--scope",
              targets.teamId,
            ],
            vercelEnvironment,
            `${application} project readback`,
          ),
          `${application} project readback`,
        ),
        `${application} project readback`,
      );
      const current = requiredRecord(
        requiredRecord(project.targets, `${application} project targets`).production,
        `${application} current production deployment`,
      );
      const currentDeploymentId = current.id;
      if (typeof currentDeploymentId !== "string") {
        throw new Error(`${application} current deployment has no ID`);
      }
      const candidateHealth = readJson(
        await requireProviderCommand(
          providerCommands,
          path.join(repositoryRoot, "node_modules", ".bin", "vercel"),
          [
            "curl",
            "/api/health",
            "--deployment",
            staged.deploymentId,
            "--scope",
            targets.teamId,
            "--yes",
          ],
          vercelEnvironment,
          `${application} candidate health`,
        ),
        `${application} candidate health`,
      );
      if (!target.productionDomain) {
        throw new Error(`${application} production domain is not pinned`);
      }
      const currentHealth = await readProductionDomainHealth(
        providerCommands,
        target.productionDomain,
        gateEnvironment,
        application,
      );
      const value = {
        application,
        candidate: {
          commitSha:
            requiredRecord(candidateDeployment.meta, `${application} metadata`)
              .githubCommitSha as string,
          deploymentId: candidateDeployment.id as string,
          healthy: healthIsValid(candidateHealth, application, approvedSha),
          state:
            currentDeploymentId === staged.deploymentId
              ? ("PROMOTED" as const)
              : ("STAGED" as const),
        },
        current: {
          deploymentId: currentDeploymentId,
          healthy:
            currentDeploymentId === staged.deploymentId
              ? healthIsValid(currentHealth, application, approvedSha)
              : currentDeploymentId === staged.predecessorDeploymentId
                ? healthIsValid(
                    currentHealth,
                    application,
                    staged.predecessorProviderGitSha,
                  )
                : false,
        },
        provider: {
          candidateDeployment,
          candidateHealth,
          current,
          currentHealth,
          productionDomains,
          productionEnvironmentMetadata,
          project: {
            accountId: project.accountId,
            id: project.id,
            name: project.name,
          },
        },
      };
      return {
        ...value,
        raw: JSON.stringify(value),
      } as ProductionApplicationInspection;
    },
    prepareIsolatedProofEnvironment() {
      throw new Error(
        "DEC-PROD-002 isolated candidate coordinator is not implemented",
      );
    },
    promoteApplication(application, deploymentId) {
      return vercelCommandEvidence(
        providerCommands,
        createVercelPromotionArguments(deploymentId, targets.teamId),
        vercelEnvironment,
      );
    },
    rollbackApplication(application, predecessorDeploymentId) {
      return vercelCommandEvidence(
        providerCommands,
        [
          "rollback",
          predecessorDeploymentId,
          "--yes",
          "--scope",
          targets.teamId,
          "--timeout",
          "180s",
        ],
        vercelEnvironment,
      );
    },
    rollbackConvex,
    runDeliveryVerification() {
      return { exitCode: 0, raw: preflight.evidence.delivery };
    },
    runExactStatusScan() {
      return { exitCode: 0, raw: preflight.evidence.exact };
    },
    runStampGate() {
      return { exitCode: 0, raw: preflight.evidence.stamp };
    },
    async stageVercel() {
      const result = await providerCommands.run(
        path.join(repositoryRoot, "node_modules", ".bin", "tsx"),
        ["scripts/stage-vercel-production.ts", "--receipt-out", stageReceiptPath],
        vercelEnvironment,
      );
      const raw = existsSync(stageReceiptPath)
        ? readFileSync(stageReceiptPath, "utf8")
        : JSON.stringify({ stderr: result.stderr });
      if (result.status === 0) {
        stagedReceipt = JSON.parse(raw) as VercelProductionStageReceipt;
      }
      return { exitCode: result.status, raw };
    },
    verifyGitHubApproval() {
      return {
        ...(githubApprovalReceiptRaw
          ? { approvalReceiptRaw: githubApprovalReceiptRaw }
          : {}),
        exitCode: 0,
        raw: githubProofRaw,
      };
    },
    verifyDurableProofCollection() {
      throw new Error(
        "DEC-PROD-002 durable proof finalizer is not implemented",
      );
    },
    async verifyKnownGoodConvexReceipt(genesisBinding) {
      if (anchorMode === "normal") {
        if (genesisBinding) {
          throw new Error("Normal release cannot use a genesis binding");
        }
        return {
          exitCode: 0,
          raw: readFileSync(parsedArguments.knownGoodConvexReceiptPath, "utf8"),
        };
      }
      if (!genesisBinding || !bootstrapEnvironment) {
        throw new Error("Genesis release requires current-run approval binding");
      }
      mkdirSync(path.dirname(approvalReceiptPath), {
        mode: 0o700,
        recursive: true,
      });
      writeFileSync(approvalReceiptPath, genesisBinding.approvalReceiptRaw, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
      const result = await providerCommands.run(
        path.join(repositoryRoot, "node_modules", ".bin", "tsx"),
        [
          "scripts/bootstrap-convex-production.ts",
          "--approval-receipt",
          approvalReceiptPath,
          "--receipt-out",
          parsedArguments.knownGoodConvexReceiptPath,
        ],
        bootstrapEnvironment,
      );
      return {
        exitCode: result.status,
        raw: existsSync(parsedArguments.knownGoodConvexReceiptPath)
          ? readFileSync(parsedArguments.knownGoodConvexReceiptPath, "utf8")
          : JSON.stringify({ stderr: result.stderr }),
      };
    },
    verifyR0CustomerJourney() {
      throw new Error(
        "DEC-PROD-002 invited-human proof collector is not implemented",
      );
    },
    verifyR0Operational() {
      throw new Error(
        "DEC-PROD-002 operational proof collector is not implemented",
      );
    },
    verifyRepository() {
      return repositoryEvidence(approvedSha, dispatchRef, gateEnvironment);
    },
  };

  let finalReceipt: ProductionReleaseReceipt | undefined;
  let executionPromise: Promise<ProductionReleaseReceipt> | undefined;
  let interrupted = false;
  let persistencePromise: Promise<ProductionReleaseReceipt> | undefined;
  let signalRecoveryPromise: Promise<void> | undefined;

  const reconcileProductionTraffic = async (
    reason: string,
    failedStage: string,
    baseReceipt: ProductionReleaseReceipt,
  ): Promise<ProductionReleaseReceipt> =>
    reconcileProductionTrafficEvidence({
      baseReceipt,
      convexTarget: targets.convexTarget,
      dependencies,
      failedStage,
      productionTargets: targets.targets,
      reason,
      stagedReceipt,
      teamId: targets.teamId,
    });

  const writeReceipt = (receipt: ProductionReleaseReceipt) =>
    writeProductionReleaseReceipt(
      parsedArguments.receiptOutputPath,
      receipt,
      repositoryRoot,
    ).then(() => undefined);

  const recoverFromSignal = () => {
    interrupted = true;
    signalRecoveryPromise ??= (async () => {
      const interruptedRunner = providerCommands;
      await interruptedRunner.stop();
      let interruptedReceipt = executionPromise
        ? await executionPromise
        : undefined;
      if (persistencePromise) {
        interruptedReceipt = await persistencePromise;
        if (existsSync(parsedArguments.receiptOutputPath)) return;
      }
      providerCommands = createSignalResponsiveCommandRunner();
      let currentReceipt: ProductionReleaseReceipt = interruptedReceipt ?? {
        ...productionConfigurationReceiptEvidence(
          anchorMode,
          approvedSha,
          knownGoodSha,
        ),
        anchorMode,
        approvedSha,
        checkedAt: new Date().toISOString(),
        convexCandidateRemainsLive: convexProven
          ? true
          : convexAttempted
            ? "unknown"
            : false,
        error: "production release interrupted by signal",
        event: "production_release_failure_receipt",
        failedStage: "signal",
        knownGoodSha,
        productionApplications: ["marketplace", "buyer", "seller"],
        promotionAllowed: false,
        result: "failed",
        schemaVersion: 1,
        trafficMutated: false,
      };
      if (
        (currentReceipt.trafficMutated ||
          currentReceipt.convexCandidateRemainsLive !== false) &&
        (currentReceipt.result !== "rolled_back" ||
          currentReceipt.convexCandidateRemainsLive !== false)
      ) {
        currentReceipt = await reconcileProductionTraffic(
          "production release interrupted by signal",
          "signal",
          currentReceipt,
        );
      }
      finalReceipt = await persistProductionReleaseOutcome({
        emit: (proof) => process.stderr.write(proof),
        receipt: currentReceipt,
        reconcile: () =>
          reconcileProductionTraffic(
            "production release interrupted by signal",
            "signal",
            currentReceipt,
          ),
        write: writeReceipt,
      });
    })();
    return signalRecoveryPromise;
  };
  const signalHandlers = new Map(
    (["SIGHUP", "SIGINT", "SIGTERM"] as const).map((signal) => [
      signal,
      createProductionReleaseSignalHandler(signal, recoverFromSignal),
    ]),
  );
  for (const [signal, handler] of signalHandlers) process.once(signal, handler);
  try {
    executionPromise = executeProductionRelease({
      anchorMode,
      approvedSha,
      config: productionReleaseConfig,
      dependencies,
      knownGoodSha,
      productionTargets,
      repositoryRoot,
    });
    finalReceipt = await executionPromise;
    if (interrupted) {
      if (signalRecoveryPromise) await signalRecoveryPromise;
      return;
    }
    persistencePromise = persistProductionReleaseOutcome({
      emit: (proof) => process.stderr.write(proof),
      receipt: finalReceipt,
      reconcile: () =>
        reconcileProductionTraffic(
          "receipt persistence failed after provider mutation",
          "receipt_persistence",
          finalReceipt!,
        ),
      write: writeReceipt,
    });
    finalReceipt = await persistencePromise;
    process.stdout.write(`${JSON.stringify(finalReceipt)}\n`);
    if (finalReceipt.result !== "passed") process.exitCode = 1;
  } finally {
    for (const [signal, handler] of signalHandlers) process.off(signal, handler);
    rmSync(temporaryRoot, { force: true, recursive: true });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : "release failed";
    const candidate = process.env.SOURCERA_RELEASE_APPROVED_SHA;
    const knownGood = process.env.SOURCERA_KNOWN_GOOD_SHA;
    let outputPath: string | undefined;
    let anchorMode: ProductionAnchorMode = "normal";
    try {
      const parsed = readProductionReleaseArguments(
        process.argv.slice(2),
        repositoryRoot,
        { allowExistingReceipt: true },
      );
      outputPath = parsed.receiptOutputPath;
      anchorMode = parsed.anchorMode;
    } catch {
      // Without a valid external output path, stderr is the only safe proof.
    }
    if (outputPath && existsSync(outputPath)) {
      const existingProof = readFileSync(outputPath, "utf8");
      process.stderr.write(
        existingProof.endsWith("\n") ? existingProof : `${existingProof}\n`,
      );
      process.exitCode = 1;
      return;
    }
    const approvedSha =
      candidate && FULL_GIT_COMMIT_SHA.test(candidate)
        ? candidate
        : "0".repeat(40);
    const knownGoodSha =
      knownGood &&
      FULL_GIT_COMMIT_SHA.test(knownGood) &&
      knownGood !== approvedSha
        ? knownGood
        : "f".repeat(40);
    const receipt: ProductionReleaseReceipt = {
      ...productionConfigurationReceiptEvidence(
        anchorMode,
        approvedSha,
        knownGoodSha,
      ),
      anchorMode,
      approvedSha,
      checkedAt: new Date().toISOString(),
      convexCandidateRemainsLive: false,
      error: message,
      event: "production_release_failure_receipt",
      failedStage: "bootstrap_or_preflight",
      knownGoodSha,
      productionApplications: ["marketplace", "buyer", "seller"],
      promotionAllowed: false,
      result: "failed",
      schemaVersion: 1,
      trafficMutated: false,
    };
    if (outputPath && !existsSync(outputPath)) {
      try {
        await writeProductionReleaseReceipt(
          outputPath,
          receipt,
          repositoryRoot,
        );
      } catch {
        // Stderr below retains the negative receipt if durable output fails.
      }
    }
    process.stderr.write(`${JSON.stringify(receipt)}\n`);
    process.exitCode = 1;
  });
}
