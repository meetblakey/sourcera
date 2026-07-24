import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  existsSync,
  linkSync,
  mkdtempSync,
  mkdirSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  type VercelProductionBaselineCandidate,
  type VercelProductionBaselineCurrentDeployment,
  type VercelProductionBaselineDependencies,
  type VercelProductionBaselineProjectInspection,
  type VercelProductionBaselineStageReceipt,
} from "./vercel-production-baseline";
import {
  readDeploymentAliases,
  readVercelProductionReleaseConfig,
  validateProductionDomains,
  validateProductionEnvironmentMetadata,
  type ReleaseProcessEnvironment,
  type VercelProductionApplication,
  type VercelProductionReleaseConfig,
  type VercelProductionTarget,
} from "./vercel-production-release";

const FULL_GIT_COMMIT_SHA = /^[a-f0-9]{40}$/i;
const DEPLOYMENT_ID = /^dpl_[A-Za-z0-9_-]+$/;
const RELEASE_RUN_ID = /^[A-Za-z0-9_-]{8,128}$/;
const TERMINAL_FAILURE_STATES = new Set(["CANCELED", "ERROR"]);
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

export interface VercelProductionBaselineProviderCommand {
  arguments: string[];
  command: string;
  cwd: string;
  environment: ReleaseProcessEnvironment;
  signal?: AbortSignal;
}

export interface VercelProductionBaselineProviderCommandResult {
  error?: Error;
  exitCode: number;
  stderr: string;
  stdout: string;
}

export type VercelProductionBaselineProviderCommandRunner = (
  command: VercelProductionBaselineProviderCommand,
) =>
  | VercelProductionBaselineProviderCommandResult
  | Promise<VercelProductionBaselineProviderCommandResult>;

export interface CreateVercelProductionBaselineProviderOptions {
  approvedSha: string;
  config: unknown;
  environment?: ReleaseProcessEnvironment;
  now?: () => Date;
  receiptPath?: string;
  releaseRunId: string;
  remoteMainPolicy?: "descendant-recovery" | "exact";
  repositoryRoot: string;
  run?: VercelProductionBaselineProviderCommandRunner;
  vercelExecutable?: string;
}

export interface VercelProductionBaselineProvider {
  cleanup(): Promise<void>;
  dependencies: VercelProductionBaselineDependencies;
  requestStop(): void;
  temporaryRoot: string;
  waitForIdle(): Promise<void>;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(raw: string, context: string): JsonRecord {
  try {
    const value = JSON.parse(raw) as unknown;
    if (!isRecord(value)) throw new Error(`${context} must be an object`);
    return value;
  } catch (cause) {
    throw new Error(`${context} is not valid JSON`, { cause });
  }
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

export function requireOutsideRepository(
  value: string,
  repositoryRoot: string,
  context: string,
) {
  const candidate = canonicalizePotentialPath(value);
  const root = realpathSync(repositoryRoot);
  const relative = path.relative(root, candidate);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error(`${context} must remain outside the repository`);
  }
  return candidate;
}

export function writePrivateJsonReceipt(
  outputPath: string,
  value: unknown,
  repositoryRoot: string,
) {
  const canonicalOutput = requireOutsideRepository(
    outputPath,
    repositoryRoot,
    "receipt output",
  );
  if (existsSync(canonicalOutput)) {
    throw new Error(`receipt output already exists: ${canonicalOutput}`);
  }
  const directory = path.dirname(canonicalOutput);
  mkdirSync(directory, { mode: 0o700, recursive: true });
  const temporaryPath = path.join(
    directory,
    `.${path.basename(canonicalOutput)}.${process.pid}.${randomUUID()}.tmp`,
  );
  writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  try {
    linkSync(temporaryPath, canonicalOutput);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "EEXIST"
    ) {
      throw new Error(`receipt output already exists: ${canonicalOutput}`);
    }
    throw error;
  } finally {
    unlinkSync(temporaryPath);
  }
}

function defaultRunner(
  invocation: VercelProductionBaselineProviderCommand,
): Promise<VercelProductionBaselineProviderCommandResult> {
  return new Promise((resolve) => {
    const detached = process.platform !== "win32";
    const child = spawn(invocation.command, invocation.arguments, {
      cwd: invocation.cwd,
      detached,
      env: invocation.environment as NodeJS.ProcessEnv,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let canceled = false;
    let settled = false;
    let timedOut = false;
    let forceKill: ReturnType<typeof setTimeout> | undefined;
    let pendingTerminationResult:
      | VercelProductionBaselineProviderCommandResult
      | undefined;
    const killProcessTree = (signal: NodeJS.Signals) => {
      if (detached && child.pid !== undefined) {
        try {
          process.kill(-child.pid, signal);
          return;
        } catch (error) {
          if (
            !(
              error instanceof Error &&
              "code" in error &&
              error.code === "ESRCH"
            )
          ) {
            child.kill(signal);
          }
          return;
        }
      }
      child.kill(signal);
    };
    const terminate = () => {
      killProcessTree("SIGTERM");
      forceKill ??= setTimeout(() => {
        const pending = pendingTerminationResult;
        pendingTerminationResult = undefined;
        forceKill = undefined;
        killProcessTree("SIGKILL");
        if (pending) finish(pending);
      }, 1_000);
    };
    const abort = () => {
      canceled = true;
      terminate();
    };
    const finish = (result: VercelProductionBaselineProviderCommandResult) => {
      if (settled) return;
      if ((canceled || timedOut) && forceKill) {
        pendingTerminationResult = result;
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (forceKill) clearTimeout(forceKill);
      invocation.signal?.removeEventListener("abort", abort);
      resolve(result);
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      terminate();
    }, 200_000);
    if (invocation.signal?.aborted) abort();
    else invocation.signal?.addEventListener("abort", abort, { once: true });
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.once("error", (error) => {
      finish({ error, exitCode: 1, stderr, stdout });
    });
    child.once("close", (code) => {
      finish({
        ...(canceled
          ? { error: new Error("provider command canceled") }
          : timedOut
            ? { error: new Error("provider command timed out") }
            : {}),
        exitCode: code ?? 1,
        stderr,
        stdout,
      });
    });
  });
}

function safeEnvironment(
  source: ReleaseProcessEnvironment,
  privateHome: string,
  includeVercelToken: boolean,
) {
  const environment: ReleaseProcessEnvironment = {};
  for (const key of SAFE_ENVIRONMENT_KEYS) {
    if (source[key] !== undefined) environment[key] = source[key];
  }
  environment.HOME = privateHome;
  environment.XDG_CACHE_HOME = path.join(privateHome, ".cache");
  environment.XDG_CONFIG_HOME = path.join(privateHome, ".config");
  environment.XDG_DATA_HOME = path.join(privateHome, ".local", "share");
  environment.XDG_STATE_HOME = path.join(privateHome, ".local", "state");
  environment.npm_config_userconfig = path.join(privateHome, ".npmrc");
  if (includeVercelToken) {
    const token = source.VERCEL_TOKEN;
    if (typeof token !== "string" || !token || token !== token.trim()) {
      throw new Error("VERCEL_TOKEN is required for the production baseline");
    }
    environment.VERCEL_TOKEN = token;
  }
  return environment;
}

function waitBounded<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: () => string,
) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message())), timeoutMs);
    timeout.unref();
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function exactTarget(
  configuration: VercelProductionReleaseConfig,
  application: VercelProductionApplication,
  supplied: VercelProductionTarget,
) {
  const target = configuration.targets.find(
    (candidate) => candidate.application === application,
  );
  if (!target || JSON.stringify(target) !== JSON.stringify(supplied)) {
    throw new Error(`${application} target does not match the repo pin`);
  }
  return target;
}

function requiredString(source: JsonRecord, key: string, context: string) {
  const value = source[key];
  if (typeof value !== "string" || !value) {
    throw new Error(`${context} requires ${key}`);
  }
  return value;
}

function readProviderGitSha(source: JsonRecord) {
  const metadata = isRecord(source.meta) ? source.meta : undefined;
  const value = metadata?.githubCommitSha;
  if (value === undefined) return null;
  if (typeof value !== "string" || !FULL_GIT_COMMIT_SHA.test(value)) {
    throw new Error("Vercel provider Git SHA is invalid");
  }
  return value;
}

function validateProject(
  project: JsonRecord,
  target: VercelProductionTarget,
  teamId: string,
) {
  if (
    project.id !== target.projectId ||
    project.name !== target.projectName ||
    project.accountId !== teamId ||
    (project.rootDirectory ?? null) !== target.rootDirectory ||
    project.autoExposeSystemEnvs !== target.autoExposeSystemEnvs ||
    project.sourceFilesOutsideRootDirectory !==
      target.sourceFilesOutsideRootDirectory ||
    !isRecord(project.link) ||
    project.link.productionBranch !== target.productionBranch
  ) {
    throw new Error(`${target.application} project readback does not match repo pins`);
  }
}

function readHealth(
  value: JsonRecord,
  application: VercelProductionApplication,
  expectedSha: string,
  windowStartedAt: number,
  readbackAt: number,
) {
  const checkedAt = value.checkedAt;
  const checkedTime = typeof checkedAt === "string"
    ? Date.parse(checkedAt)
    : Number.NaN;
  if (
    value.status !== "ok" ||
    value.service !== "sourcera" ||
    value.domain !== application ||
    value.environment !== "production" ||
    value.commitSha !== expectedSha ||
    typeof checkedAt !== "string" ||
    Number.isNaN(checkedTime) ||
    new Date(checkedAt).toISOString() !== checkedAt ||
    checkedTime < windowStartedAt ||
    checkedTime > readbackAt
  ) {
    throw new Error(`${application} health proof does not match the deployment`);
  }
  return {
    checkedAt,
    commitSha: expectedSha,
    domain: application,
    environment: "production" as const,
    service: "sourcera" as const,
    status: "ok" as const,
  };
}

function readVisibleEnvironment(deployment: JsonRecord) {
  const result: Record<string, string> = {};
  for (const source of [deployment.buildEnv, isRecord(deployment.build) ? deployment.build.env : undefined]) {
    if (isRecord(source)) {
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === "string") result[key] = value;
      }
    }
  }
  return result;
}

export function createVercelProductionBaselineProvider(
  options: CreateVercelProductionBaselineProviderOptions,
): VercelProductionBaselineProvider {
  const repositoryRoot = realpathSync(options.repositoryRoot);
  if (!FULL_GIT_COMMIT_SHA.test(options.approvedSha)) {
    throw new Error("baseline provider approved SHA is invalid");
  }
  const configuration = readVercelProductionReleaseConfig(
    options.config,
    repositoryRoot,
  );
  if (!RELEASE_RUN_ID.test(options.releaseRunId)) {
    throw new Error("baseline release run ID is invalid");
  }
  const remoteMainPolicy = options.remoteMainPolicy ?? "exact";
  if (
    remoteMainPolicy !== "exact" &&
    remoteMainPolicy !== "descendant-recovery"
  ) {
    throw new Error("baseline remote-main policy is invalid");
  }
  const sourceEnvironment = { ...(options.environment ?? process.env) };
  if (sourceEnvironment.GITHUB_REF !== "refs/heads/main") {
    throw new Error(
      "GITHUB_REF must be exactly refs/heads/main for the production baseline",
    );
  }
  const vercelToken = sourceEnvironment.VERCEL_TOKEN;
  if (
    typeof vercelToken !== "string" ||
    !vercelToken ||
    vercelToken !== vercelToken.trim()
  ) {
    throw new Error("VERCEL_TOKEN is required for the production baseline");
  }
  const temporaryRoot = realpathSync(
    mkdtempSync(
      path.join(os.tmpdir(), "sourcera-vercel-production-baseline-"),
    ),
  );
  const privateHome = path.join(temporaryRoot, "home");
  const worktreeRoot = path.join(temporaryRoot, "checkout");
  let gitEnvironment: ReleaseProcessEnvironment;
  let vercelEnvironment: ReleaseProcessEnvironment;
  try {
    mkdirSync(privateHome, { mode: 0o700, recursive: true });
    gitEnvironment = safeEnvironment(sourceEnvironment, privateHome, false);
    vercelEnvironment = safeEnvironment(sourceEnvironment, privateHome, true);
  } catch (error) {
    rmSync(temporaryRoot, { force: true, recursive: true });
    throw error;
  }
  const run = options.run ?? defaultRunner;
  const vercelExecutable =
    options.vercelExecutable ??
    path.join(repositoryRoot, "node_modules", ".bin", "vercel");
  let stopped = false;
  const activeContexts = new Set<string>();
  const activeExecutions = new Set<Promise<unknown>>();
  let versionProof: Promise<void> | undefined;
  let worktreeProof: Promise<void> | undefined;
  let worktreeCreated = false;
  const now = options.now ?? (() => new Date());
  const stopController = new AbortController();

  const invoke = async (
    command: string,
    arguments_: string[],
    environment: ReleaseProcessEnvironment,
    context: string,
    mutation = false,
    cwd = repositoryRoot,
    allowAfterStop = false,
  ) => {
    if (stopped && !allowAfterStop) {
      throw new Error("baseline provider stop requested");
    }
    let execution: Promise<VercelProductionBaselineProviderCommandResult>;
    try {
      execution = Promise.resolve(
        run({
          arguments: arguments_,
          command,
          cwd,
          environment,
          ...(allowAfterStop ? {} : { signal: stopController.signal }),
        }),
      );
    } catch (error) {
      execution = Promise.reject(error);
    }
    activeContexts.add(context);
    activeExecutions.add(execution);
    try {
      const result = await execution;
      if (result.error || result.exitCode !== 0) {
        throw new Error(`${context} failed${result.stderr ? `: ${result.stderr.trim()}` : ""}`);
      }
      if (mutation && stopped) {
        throw new Error("baseline provider stop requested after mutation; reconciliation required");
      }
      return result.stdout.trim();
    } finally {
      activeContexts.delete(context);
      activeExecutions.delete(execution);
    }
  };

  const waitForActiveExecutions = async (context: string) => {
    while (activeExecutions.size > 0) {
      const active = [...activeExecutions];
      await waitBounded(
        Promise.allSettled(active),
        215_000,
        () =>
          `${context} timed out during ${[...activeContexts].join(", ") || "idle"}`,
      );
    }
  };

  const git = (
    arguments_: string[],
    context: string,
    cwd = repositoryRoot,
    allowAfterStop = false,
  ) => invoke(
    "git",
    arguments_,
    gitEnvironment,
    context,
    false,
    cwd,
    allowAfterStop,
  );

  const inspectRepository = async () => {
    const [sha, branch, status, topLevel, remote] = await Promise.all([
      git(["rev-parse", "HEAD"], "read repository HEAD"),
      git(["branch", "--show-current"], "read repository branch"),
      git(
        ["status", "--porcelain=v1", "--untracked-files=all"],
        "read repository status",
      ),
      git(["rev-parse", "--show-toplevel"], "read repository root"),
      git(
        ["ls-remote", "--exit-code", "origin", "refs/heads/main"],
        "read remote main",
      ),
    ]);
    const remoteFields = remote.split(/\s+/);
    const localIsExact =
      sha === options.approvedSha &&
      branch === "" &&
      status === "" &&
      realpathSync(topLevel) === repositoryRoot;
    const remoteMainSha = remoteFields[0];
    const remoteIsExact =
      remoteFields.length === 2 &&
      typeof remoteMainSha === "string" &&
      FULL_GIT_COMMIT_SHA.test(remoteMainSha) &&
      remoteFields[1] === "refs/heads/main";
    if (!localIsExact || !remoteIsExact) {
      return { clean: false, sha };
    }
    if (remoteMainSha === options.approvedSha) {
      return { clean: true, sha };
    }
    if (remoteMainPolicy !== "descendant-recovery") {
      return { clean: false, sha };
    }
    await git(
      ["fetch", "--no-tags", "--force", "origin", "refs/heads/main"],
      "fetch live remote main for baseline recovery",
    );
    const fetchedRemoteMainSha = await git(
      ["rev-parse", "FETCH_HEAD"],
      "read fetched remote main for baseline recovery",
    );
    if (fetchedRemoteMainSha !== remoteMainSha) {
      throw new Error(
        "fetched remote main does not match the live remote-main SHA",
      );
    }
    await git(
      ["merge-base", "--is-ancestor", options.approvedSha, remoteMainSha],
      "prove live remote main descends from the approved baseline SHA",
    );
    return {
      clean: true,
      sha,
    };
  };

  const requireRepositoryExact = async () => {
    const inspection = await inspectRepository();
    if (!inspection.clean || inspection.sha !== options.approvedSha) {
      throw new Error("repository is not the exact clean remote-main baseline SHA");
    }
  };

  const requireWorktreeExact = async () => {
    const [sha, branch, status, topLevel] = await Promise.all([
      git(["rev-parse", "HEAD"], "read baseline worktree HEAD", worktreeRoot),
      git(
        ["branch", "--show-current"],
        "read baseline worktree branch",
        worktreeRoot,
      ),
      git(
        ["status", "--porcelain=v1", "--untracked-files=all"],
        "read baseline worktree status",
        worktreeRoot,
      ),
      git(
        ["rev-parse", "--show-toplevel"],
        "read baseline worktree root",
        worktreeRoot,
      ),
    ]);
    if (
      sha !== options.approvedSha ||
      branch !== "" ||
      status !== "" ||
      realpathSync(topLevel) !== realpathSync(worktreeRoot)
    ) {
      throw new Error("detached baseline worktree is not exact and clean");
    }
  };

  const ensureWorktree = async () => {
    worktreeProof ??= (async () => {
      await requireRepositoryExact();
      worktreeCreated = true;
      await git(
        ["worktree", "add", "--detach", worktreeRoot, options.approvedSha],
        "create detached baseline worktree",
      );
      await requireWorktreeExact();
    })();
    await worktreeProof;
  };

  const requireVercelVersion = async () => {
    versionProof ??= (async () => {
      await ensureWorktree();
      const output = await invoke(
        vercelExecutable,
        ["--version"],
        vercelEnvironment,
        "Vercel CLI version check",
        false,
        worktreeRoot,
      );
      if (!/^(?:Vercel CLI )?56\.2\.0$/.test(output)) {
        throw new Error("Vercel CLI must be exactly 56.2.0");
      }
    })();
    await versionProof;
  };

  const vercel = async (
    arguments_: string[],
    context: string,
    mutation = false,
  ) => {
    await requireVercelVersion();
    return invoke(
      vercelExecutable,
      arguments_,
      vercelEnvironment,
      context,
      mutation,
      worktreeRoot,
    );
  };

  const exactVercelMutation = async (
    arguments_: string[],
    context: string,
  ) => {
    await requireRepositoryExact();
    await ensureWorktree();
    await requireWorktreeExact();
    let output: string | undefined;
    let mutationError: unknown;
    try {
      output = await vercel(arguments_, context, true);
    } catch (error) {
      mutationError = error;
    }
    let postconditionError: unknown;
    try {
      await requireWorktreeExact();
      await requireRepositoryExact();
    } catch (error) {
      postconditionError = error;
    }
    if (mutationError !== undefined && postconditionError !== undefined) {
      throw new AggregateError(
        [mutationError, postconditionError],
        `${context} failed and repository postconditions could not be proven`,
      );
    }
    if (mutationError !== undefined) throw mutationError;
    if (postconditionError !== undefined) throw postconditionError;
    return output!;
  };

  const api = async (endpoint: string, context: string) =>
    parseJson(
      await vercel(
        ["api", endpoint, "--raw", "--scope", configuration.teamId],
        context,
      ),
      context,
    );

  const readMetadata = async (target: VercelProductionTarget) => {
    const environment = await api(
      `/v10/projects/${target.projectId}/env?decrypt=false&teamId=${configuration.teamId}`,
      `${target.application} production environment readback`,
    );
    validateProductionEnvironmentMetadata(environment, target);
    const domains = await api(
      `/v9/projects/${target.projectId}/domains?production=true&limit=100&teamId=${configuration.teamId}`,
      `${target.application} production domain readback`,
    );
    validateProductionDomains(domains, target);
    const project = await api(
      `/v9/projects/${target.projectId}?teamId=${configuration.teamId}`,
      `${target.application} project readback`,
    );
    validateProject(project, target, configuration.teamId);
    return { project };
  };

  const currentFromProject = async (
    project: JsonRecord,
    target: VercelProductionTarget,
  ): Promise<VercelProductionBaselineCurrentDeployment | null> => {
    const targets = isRecord(project.targets) ? project.targets : undefined;
    const production = targets && isRecord(targets.production)
      ? targets.production
      : undefined;
    if (!production) return null;
    const deploymentId = requiredString(
      production,
      "id",
      `${target.application} current production deployment`,
    );
    if (!DEPLOYMENT_ID.test(deploymentId)) {
      throw new Error(`${target.application} current deployment ID is invalid`);
    }
    const readyState = requiredString(
      production,
      "readyState",
      `${target.application} current production deployment`,
    ).toUpperCase();
    const providerGitSha = readProviderGitSha(production);
    if (TERMINAL_FAILURE_STATES.has(readyState)) {
      return { deploymentId, healthy: false, providerGitSha, readyState };
    }
    if (readyState !== "READY") {
      throw new Error(
        `${target.application} current production state is not absent or terminally failed`,
      );
    }
    if (!providerGitSha) {
      throw new Error(`${target.application} READY production SHA is missing`);
    }
    const windowStartedAt = now().getTime();
    const healthOutput = await vercel(
      [
        "curl",
        "/api/health",
        "--deployment",
        deploymentId,
        "--scope",
        configuration.teamId,
        "--yes",
      ],
      `${target.application} current production health`,
    );
    const readbackAt = now().getTime();
    readHealth(
      parseJson(
        healthOutput,
        `${target.application} current production health`,
      ),
      target.application,
      providerGitSha,
      windowStartedAt,
      readbackAt,
    );
    return { deploymentId, healthy: true, providerGitSha, readyState };
  };

  const inspectProject = async (
    application: VercelProductionApplication,
    suppliedTarget: VercelProductionTarget,
  ): Promise<VercelProductionBaselineProjectInspection> => {
    const target = exactTarget(configuration, application, suppliedTarget);
    const { project } = await readMetadata(target);
    return {
      application,
      current: await currentFromProject(project, target),
      metadata: {
        allowedProductionEnvironmentKeys: [
          ...target.allowedProductionEnvironmentKeys,
        ],
        convexTarget: { ...configuration.convexTarget },
        productionDomain: target.productionDomain,
        productionDomains: [...target.productionDomains],
        projectId: target.projectId,
        projectName: target.projectName,
        rootDirectory: target.rootDirectory,
        teamId: configuration.teamId,
      },
    };
  };

  const inspectApplication = async (
    application: VercelProductionApplication,
    suppliedTarget: VercelProductionTarget,
    deploymentId: string,
  ) => {
    const target = exactTarget(configuration, application, suppliedTarget);
    if (!DEPLOYMENT_ID.test(deploymentId)) {
      throw new Error(`${application} candidate deployment ID is invalid`);
    }
    const projectInspection = await inspectProject(application, target);
    const deployment = await api(
      `/v13/deployments/${deploymentId}`,
      `${application} candidate deployment readback`,
    );
    const metadata = isRecord(deployment.meta) ? deployment.meta : {};
    const visible = readVisibleEnvironment(deployment);
    const expectedEnvironment = {
      NEXT_PUBLIC_CONVEX_URL: configuration.convexTarget.deploymentUrl,
      SOURCERA_COMMIT_SHA: metadata.githubCommitSha,
      SOURCERA_DOMAIN: application,
      SOURCERA_ENV: "production",
      SOURCERA_RELEASE_APPROVED_SHA: metadata.githubCommitSha,
    };
    for (const [key, expected] of Object.entries(expectedEnvironment)) {
      if (visible[key] !== expected) {
        throw new Error(`${application} deployment environment ${key} is not exact`);
      }
    }
    if (
      deployment.id !== deploymentId ||
      deployment.projectId !== target.projectId ||
      deployment.name !== target.projectName ||
      (deployment.ownerId ?? deployment.teamId) !== configuration.teamId ||
      (deployment.rootDirectory ?? null) !== target.rootDirectory ||
      deployment.source !== "cli" ||
      deployment.target !== "production" ||
      deployment.readyState !== "READY" ||
      !["PROMOTED", "STAGED"].includes(String(deployment.readySubstate)) ||
      deployment.autoAssignCustomDomains !== false ||
      metadata.githubCommitSha !== metadata.sourceraReleaseApprovedSha ||
      !FULL_GIT_COMMIT_SHA.test(String(metadata.githubCommitSha ?? "")) ||
      metadata.sourceraReleaseRunId !== options.releaseRunId ||
      metadata.sourceraConvexDeploymentName !==
        configuration.convexTarget.deploymentName ||
      metadata.sourceraConvexDeploymentUrl !==
        configuration.convexTarget.deploymentUrl
    ) {
      throw new Error(`${application} candidate deployment readback is invalid`);
    }
    const aliases = readDeploymentAliases(
      deployment,
      `${application} candidate deployment`,
    );
    if (
      deployment.readySubstate === "STAGED" &&
      (deployment.aliasAssigned !== false || aliases.length !== 0)
    ) {
      throw new Error(`${application} staged candidate already owns production traffic`);
    }
    if (
      deployment.readySubstate === "PROMOTED" &&
      (deployment.aliasAssigned !== true ||
        target.productionDomains.some((domain) => !aliases.includes(domain)))
    ) {
      throw new Error(
        `${application} promoted candidate does not own every pinned production domain`,
      );
    }
    const providerGitSha = String(metadata.githubCommitSha);
    const healthStartedAt = now().getTime();
    const healthOutput = await vercel(
      [
        "curl",
        "/api/health",
        "--deployment",
        deploymentId,
        "--scope",
        configuration.teamId,
        "--yes",
      ],
      `${application} candidate health`,
    );
    const healthReadbackAt = now().getTime();
    const health = readHealth(
      parseJson(healthOutput, `${application} candidate health`),
      application,
      providerGitSha,
      healthStartedAt,
      healthReadbackAt,
    );
    const deploymentUrl = requiredString(
      deployment,
      "url",
      `${application} candidate deployment readback`,
    );
    const candidate: VercelProductionBaselineCandidate = {
      deploymentId,
      health,
      healthy: true,
      providerGitSha,
      readyState: "READY",
      readySubstate: String(deployment.readySubstate),
      target: "production",
      url: new URL(
        deploymentUrl.startsWith("http")
          ? deploymentUrl
          : `https://${deploymentUrl}`,
      ).toString().replace(/\/$/, ""),
    };
    return { ...projectInspection, candidate };
  };

  const stageApplication = async (
    application: VercelProductionApplication,
    suppliedTarget: VercelProductionTarget,
    approvedSha: string,
  ) => {
    const target = exactTarget(configuration, application, suppliedTarget);
    if (!FULL_GIT_COMMIT_SHA.test(approvedSha)) {
      throw new Error("baseline approved SHA is invalid");
    }
    const markers = [
      `NEXT_PUBLIC_CONVEX_URL=${configuration.convexTarget.deploymentUrl}`,
      `SOURCERA_COMMIT_SHA=${approvedSha}`,
      `SOURCERA_DOMAIN=${application}`,
      "SOURCERA_ENV=production",
      `SOURCERA_RELEASE_APPROVED_SHA=${approvedSha}`,
    ];
    const output = parseJson(
      await exactVercelMutation(
        [
          "deploy",
          "--prod",
          "--skip-domain",
          "--project",
          target.projectId,
          "--yes",
          "--scope",
          configuration.teamId,
          "--format",
          "json",
          "--meta",
          `sourceraReleaseRunId=${options.releaseRunId}`,
          "--meta",
          `sourceraReleaseApprovedSha=${approvedSha}`,
          "--meta",
          `sourceraConvexDeploymentName=${configuration.convexTarget.deploymentName}`,
          "--meta",
          `sourceraConvexDeploymentUrl=${configuration.convexTarget.deploymentUrl}`,
          ...markers.flatMap((marker) => ["--build-env", marker]),
          ...markers.flatMap((marker) => ["--env", marker]),
        ],
        `${application} baseline staging`,
      ),
      `${application} baseline staging response`,
    );
    const deploymentId = requiredString(
      output,
      "id",
      `${application} baseline staging response`,
    );
    if (!DEPLOYMENT_ID.test(deploymentId)) {
      throw new Error(`${application} staged deployment ID is invalid`);
    }
    return { deploymentId };
  };

  const promoteApplication = async (
    application: VercelProductionApplication,
    suppliedTarget: VercelProductionTarget,
    deploymentId: string,
  ) => {
    exactTarget(configuration, application, suppliedTarget);
    if (!DEPLOYMENT_ID.test(deploymentId)) {
      throw new Error(`${application} promotion deployment ID is invalid`);
    }
    await exactVercelMutation(
      [
        "promote",
        deploymentId,
        "--yes",
        "--scope",
        configuration.teamId,
        "--timeout",
        "180s",
      ],
      `${application} baseline promotion`,
    );
  };

  const dependencies: VercelProductionBaselineDependencies = {
    inspectApplication,
    inspectProject,
    inspectRepository,
    persistStageReceipt: async (
      receipt: VercelProductionBaselineStageReceipt,
    ) => {
      if (!options.receiptPath) {
        throw new Error("baseline stage receipt output is not configured");
      }
      writePrivateJsonReceipt(options.receiptPath, receipt, repositoryRoot);
    },
    promoteApplication,
    stageApplication,
  };

  return {
    async cleanup() {
      let cleanupError: unknown;
      try {
        await waitForActiveExecutions("provider cleanup");
      } catch (error) {
        cleanupError = error;
      }
      if (worktreeCreated) {
        try {
          await git(
            ["worktree", "remove", "--force", worktreeRoot],
            "remove detached baseline worktree",
            repositoryRoot,
            true,
          );
          worktreeCreated = false;
        } catch (error) {
          cleanupError ??= error;
        }
        try {
          await git(
            ["worktree", "prune"],
            "prune detached baseline worktrees",
            repositoryRoot,
            true,
          );
        } catch (error) {
          cleanupError ??= error;
        }
      }
      rmSync(temporaryRoot, { force: true, recursive: true });
      if (cleanupError) throw cleanupError;
    },
    dependencies,
    requestStop() {
      stopped = true;
      stopController.abort();
    },
    async waitForIdle() {
      await waitForActiveExecutions("provider command");
    },
    temporaryRoot,
  };
}
