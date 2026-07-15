import { realpathSync } from "node:fs";
import path from "node:path";

const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const RELEASE_RUN_ID = /^[A-Za-z0-9_-]{8,128}$/;
const EXPECTED_APPLICATIONS = ["marketplace", "buyer", "seller"] as const;
const SAFE_PROCESS_ENVIRONMENT_KEYS = [
  "CI",
  "FORCE_COLOR",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "NODE_ENV",
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

export type VercelProductionApplication =
  (typeof EXPECTED_APPLICATIONS)[number];

export type ReleaseProcessEnvironment = Record<string, string | undefined>;

export interface CommandInvocation {
  arguments: string[];
  command: string;
  cwd: string;
  environment?: ReleaseProcessEnvironment;
}

export interface CommandResult {
  error?: Error;
  status: number | null;
  stderr: string;
  stdout: string;
}

export type CommandRunner = (invocation: CommandInvocation) => CommandResult;

export interface VercelProductionTarget {
  application: VercelProductionApplication;
  autoExposeSystemEnvs: true;
  cwd: string;
  productionBranch: "main";
  productionDomain: string | null;
  projectId: string;
  projectName: string;
  rootDirectory: string | null;
  sourceFilesOutsideRootDirectory: true;
}

export interface VercelProductionReleaseConfig {
  convexTarget: {
    deploymentName: string;
    deploymentUrl: string;
  };
  targets: VercelProductionTarget[];
  teamId: string;
}

export interface VercelProductionHealthProof {
  checkedAt: string;
  commitSha: string;
  domain: VercelProductionApplication;
  environment: "production";
  service: "sourcera";
  status: "ok";
}

export interface VercelProductionStagedApplication {
  application: VercelProductionApplication;
  createdAt: string;
  deploymentId: string;
  health: VercelProductionHealthProof;
  predecessorDeploymentId: string;
  predecessorUrl: string;
  productionDomain: string | null;
  projectId: string;
  projectName: string;
  providerGitSha: string;
  rootDirectory: string | null;
  state: "READY";
  substate: "STAGED";
  target: "production";
  url: string;
}

export interface VercelProductionStageReceipt {
  applications: VercelProductionStagedApplication[];
  approvedSha: string;
  completedAt: string;
  convexTarget: {
    deploymentName: string;
    deploymentUrl: string;
  };
  event: "vercel_production_stage_receipt";
  releaseRunId: string;
  schemaVersion: 1;
  startedAt: string;
  teamId: string;
}

export interface StageVercelProductionReleaseOptions {
  approvedSha: string;
  config: unknown;
  environment?: ReleaseProcessEnvironment;
  now?: () => Date;
  releaseRunId: string;
  repositoryRoot: string;
  run: CommandRunner;
  worktreeRoot: string;
}

interface DeploymentReadback {
  [key: string]: unknown;
}

interface PredecessorReceipt {
  deploymentId: string;
  url: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalizePotentialPath(value: string): string {
  let existingAncestor = path.resolve(value);
  const missingSegments: string[] = [];
  while (true) {
    try {
      return path.join(realpathSync(existingAncestor), ...missingSegments);
    } catch (error) {
      const code =
        error instanceof Error && "code" in error ? error.code : undefined;
      if (code !== "ENOENT") throw error;
      const parent = path.dirname(existingAncestor);
      if (parent === existingAncestor) throw error;
      missingSegments.unshift(path.basename(existingAncestor));
      existingAncestor = parent;
    }
  }
}

function privateProcessEnvironment(
  sourceEnvironment: ReleaseProcessEnvironment,
  privateHome: string,
): ReleaseProcessEnvironment {
  const environment: ReleaseProcessEnvironment = {};
  for (const key of SAFE_PROCESS_ENVIRONMENT_KEYS) {
    if (sourceEnvironment[key] !== undefined) {
      environment[key] = sourceEnvironment[key];
    }
  }
  environment.HOME = privateHome;
  environment.XDG_CACHE_HOME = path.join(privateHome, ".cache");
  environment.XDG_CONFIG_HOME = path.join(privateHome, ".config");
  environment.XDG_DATA_HOME = path.join(privateHome, ".local", "share");
  environment.XDG_STATE_HOME = path.join(privateHome, ".local", "state");
  return environment;
}

export function createVercelProductionGitEnvironment(
  sourceEnvironment: ReleaseProcessEnvironment,
  privateHome: string,
): ReleaseProcessEnvironment {
  return privateProcessEnvironment(
    sourceEnvironment,
    canonicalizePotentialPath(privateHome),
  );
}

function createVercelProductionCommandEnvironment(
  sourceEnvironment: ReleaseProcessEnvironment,
  privateHome: string,
): ReleaseProcessEnvironment {
  const token = sourceEnvironment.VERCEL_TOKEN;
  if (typeof token !== "string" || !token || token !== token.trim()) {
    throw new Error("VERCEL_TOKEN is required for production staging");
  }
  return {
    ...createVercelProductionGitEnvironment(sourceEnvironment, privateHome),
    VERCEL_TOKEN: token,
  };
}

function readRecord(
  source: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = source[key];
  return isRecord(value) ? value : undefined;
}

function readRequiredString(
  source: Record<string, unknown>,
  key: string,
  context: string,
): string {
  const value = source[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${context} requires ${key}`);
  }
  return value.trim();
}

function readConvexTarget(source: Record<string, unknown>) {
  const convex = readRecord(source, "convexProduction");
  if (!convex) {
    throw new Error("Convex production target is not repo-pinned");
  }
  const deploymentName = convex.deploymentName;
  const deploymentUrl = convex.deploymentUrl;
  if (
    typeof deploymentName !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(deploymentName) ||
    typeof deploymentUrl !== "string"
  ) {
    throw new Error("Convex production target is not repo-pinned");
  }
  let url: URL;
  try {
    url = new URL(deploymentUrl);
  } catch {
    throw new Error("Convex production target URL is invalid");
  }
  const hostnamePattern = new RegExp(
    `^${deploymentName.replaceAll("-", "\\-")}(?:\\.[a-z0-9-]+)?\\.convex\\.cloud$`,
  );
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    !hostnamePattern.test(url.hostname)
  ) {
    throw new Error("Convex production target URL does not match its name");
  }
  return { deploymentName, deploymentUrl: url.toString().replace(/\/$/, "") };
}

function readProductionDomain(value: unknown, context: string): string | null {
  if (value === null) return null;
  if (
    typeof value !== "string" ||
    value !== value.toLowerCase() ||
    !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(
      value,
    )
  ) {
    throw new Error(
      `${context} productionDomain must be null or a lowercase hostname`,
    );
  }
  return value;
}

function readProjectRootDirectory(
  value: unknown,
  context: string,
): string | null {
  if (value === null) return null;
  if (
    typeof value !== "string" ||
    !value ||
    value === "." ||
    value.includes("\\") ||
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value ||
    value.startsWith("../")
  ) {
    throw new Error(
      `${context} rootDirectory must be null or a normalized repository path`,
    );
  }
  return value;
}

function readRequiredTrue(
  source: Record<string, unknown>,
  key: string,
  context: string,
): true {
  if (source[key] !== true) {
    throw new Error(`${context} ${key} must be true`);
  }
  return true;
}

function readTarget(
  value: unknown,
  expectedApplication: VercelProductionApplication,
  repositoryRoot: string,
): VercelProductionTarget {
  if (!isRecord(value)) {
    throw new Error("Vercel production target must be an object");
  }
  const application = readRequiredString(
    value,
    "application",
    "Vercel production target",
  );
  if (application !== expectedApplication) {
    throw new Error(
      "Vercel production targets must remain in Marketplace, Buyer, Seller order",
    );
  }
  const relativeCwd = readRequiredString(
    value,
    "cwd",
    `${application} target`,
  );
  if (
    relativeCwd !== "." ||
    path.resolve(repositoryRoot, relativeCwd) !== path.resolve(repositoryRoot)
  ) {
    throw new Error(`${application} cwd must be the repository root (.)`);
  }
  const productionBranch = readRequiredString(
    value,
    "productionBranch",
    `${application} target`,
  );
  if (productionBranch !== "main") {
    throw new Error(`${application} productionBranch must be main`);
  }
  const projectId = readRequiredString(value, "projectId", `${application} target`);
  if (!/^prj_[A-Za-z0-9]+$/.test(projectId)) {
    throw new Error(`${application} target has an invalid projectId`);
  }
  const projectName = readRequiredString(
    value,
    "projectName",
    `${application} target`,
  );
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(projectName)) {
    throw new Error(`${application} target has an invalid projectName`);
  }
  return {
    application: expectedApplication,
    autoExposeSystemEnvs: readRequiredTrue(
      value,
      "autoExposeSystemEnvs",
      `${application} target`,
    ),
    cwd: relativeCwd,
    productionBranch,
    productionDomain: readProductionDomain(
      value.productionDomain,
      `${application} target`,
    ),
    projectId,
    projectName,
    rootDirectory: readProjectRootDirectory(
      value.rootDirectory,
      `${application} target`,
    ),
    sourceFilesOutsideRootDirectory: readRequiredTrue(
      value,
      "sourceFilesOutsideRootDirectory",
      `${application} target`,
    ),
  };
}

export function readVercelProductionReleaseConfig(
  value: unknown,
  repositoryRoot: string,
): VercelProductionReleaseConfig {
  if (!isRecord(value)) {
    throw new Error("Production targets config must be an object");
  }
  const convexTarget = readConvexTarget(value);
  const vercel = readRecord(value, "vercelProduction");
  if (!vercel) {
    throw new Error("Vercel production targets are not repo-pinned");
  }
  const teamId = readRequiredString(vercel, "teamId", "Vercel production config");
  if (!/^team_[A-Za-z0-9]+$/.test(teamId)) {
    throw new Error("Vercel production config has an invalid teamId");
  }
  const rawTargets = vercel.targets;
  if (!Array.isArray(rawTargets) || rawTargets.length !== 3) {
    throw new Error(
      "Vercel production targets must remain in Marketplace, Buyer, Seller order",
    );
  }
  const root = path.resolve(repositoryRoot);
  const targets = EXPECTED_APPLICATIONS.map((application, index) =>
    readTarget(rawTargets[index], application, root),
  );
  if (
    new Set(targets.map((target) => target.projectId)).size !== targets.length ||
    new Set(
      targets
        .map((target) => target.productionDomain)
        .filter((domain): domain is string => domain !== null),
    ).size !== targets.filter((target) => target.productionDomain !== null).length
  ) {
    throw new Error("Vercel production targets must be unique");
  }
  return { convexTarget, targets, teamId };
}

function runChecked(
  run: CommandRunner,
  invocation: CommandInvocation,
  failureMessage: string,
): string {
  const result = run(invocation);
  if (result.error || result.status !== 0) {
    throw new Error(failureMessage);
  }
  return result.stdout.trim();
}

function requirePrimaryCleanCheckout(
  run: CommandRunner,
  repositoryRoot: string,
  approvedSha: string,
  environment: ReleaseProcessEnvironment,
) {
  const git = (arguments_: string[], message: string) =>
    runChecked(
      run,
      {
        arguments: arguments_,
        command: "git",
        cwd: repositoryRoot,
        environment,
      },
      message,
    );
  const head = git(["rev-parse", "HEAD"], "Unable to read Git HEAD");
  if (head !== approvedSha) {
    throw new Error("Approved SHA must exactly match Git HEAD");
  }
  const topLevel = canonicalizePotentialPath(
    git(
      ["rev-parse", "--show-toplevel"],
      "Unable to identify the primary checkout",
    ),
  );
  const gitDirectory = canonicalizePotentialPath(
    git(
      ["rev-parse", "--absolute-git-dir"],
      "Unable to identify the primary checkout",
    ),
  );
  const commonDirectory = canonicalizePotentialPath(
    git(
      ["rev-parse", "--path-format=absolute", "--git-common-dir"],
      "Unable to identify the primary checkout",
    ),
  );
  const status = git(
    ["status", "--porcelain=v1", "--untracked-files=all"],
    "Unable to inspect the checkout",
  );
  if (
    topLevel !== repositoryRoot ||
    gitDirectory !== commonDirectory ||
    status.length > 0
  ) {
    throw new Error(
      "Vercel production staging requires a clean primary checkout",
    );
  }
}

function requireDisjointWorktreeRoot(
  repositoryRoot: string,
  worktreeRoot: string,
) {
  const relativeToRepository = path.relative(repositoryRoot, worktreeRoot);
  const relativeToWorktree = path.relative(worktreeRoot, repositoryRoot);
  const isInside = (relative: string) =>
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative));
  if (isInside(relativeToRepository) || isInside(relativeToWorktree)) {
    throw new Error(
      "Detached staging worktree must be outside and disjoint from the primary checkout",
    );
  }
}

function requireDetachedCleanCheckout(
  run: CommandRunner,
  worktreeRoot: string,
  approvedSha: string,
  environment: ReleaseProcessEnvironment,
) {
  const git = (arguments_: string[], message: string) =>
    runChecked(
      run,
      {
        arguments: arguments_,
        command: "git",
        cwd: worktreeRoot,
        environment,
      },
      message,
    );
  const head = git(
    ["rev-parse", "HEAD"],
    "Unable to read the detached staging worktree HEAD",
  );
  const topLevel = canonicalizePotentialPath(
    git(
      ["rev-parse", "--show-toplevel"],
      "Unable to identify the detached staging worktree",
    ),
  );
  const branch = run({
    arguments: ["symbolic-ref", "-q", "HEAD"],
    command: "git",
    cwd: worktreeRoot,
    environment,
  });
  const status = git(
    ["status", "--porcelain=v1", "--untracked-files=all"],
    "Unable to inspect the detached staging worktree",
  );
  if (head !== approvedSha) {
    throw new Error(
      "Detached staging worktree must remain at the approved SHA",
    );
  }
  if (
    topLevel !== worktreeRoot ||
    branch.error ||
    branch.status !== 1 ||
    branch.stdout.trim() ||
    status.length > 0
  ) {
    throw new Error(
      "Detached staging worktree must remain detached and clean",
    );
  }
}

function parseJson(output: string, context: string): unknown {
  const candidates = [output, ...output.split(/\r?\n/).reverse()];
  for (const candidate of candidates) {
    if (!candidate.trim()) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // The Vercel CLI may print informational lines before its JSON payload.
    }
  }
  throw new Error(`${context} did not return JSON`);
}

function readDeployment(output: string, context: string): DeploymentReadback {
  const parsed = parseJson(output, context);
  if (!isRecord(parsed)) {
    throw new Error(`${context} returned an invalid deployment`);
  }
  return parsed;
}

function readDeploymentId(output: string, application: string): string {
  const parsed = parseJson(output, `${application} Vercel deploy`);
  const deployment =
    isRecord(parsed) && isRecord(parsed.deployment) ? parsed.deployment : parsed;
  if (!isRecord(deployment)) {
    throw new Error(`${application} Vercel deploy did not return a deployment ID`);
  }
  const id = deployment.id;
  if (typeof id !== "string" || !/^dpl_[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`${application} Vercel deploy did not return a deployment ID`);
  }
  return id;
}

function readDeploymentUrl(
  deployment: DeploymentReadback,
  context: string,
): string {
  const value = deployment.url;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${context} has no deployment URL`);
  }
  const candidate = value.startsWith("https://") ? value : `https://${value}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`${context} has an invalid deployment URL`);
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    throw new Error(`${context} has an invalid deployment URL`);
  }
  return url.toString().replace(/\/$/, "");
}

function requireDeploymentOwnership(
  deployment: DeploymentReadback,
  target: VercelProductionTarget,
  teamId: string,
  context: string,
) {
  const project = readRecord(deployment, "project");
  const projectIds = [deployment.projectId, project?.id].filter(
    (value) => value !== undefined,
  );
  if (
    projectIds.length === 0 ||
    projectIds.some((value) => value !== target.projectId)
  ) {
    throw new Error(`${context} project does not match the repo pin`);
  }
  const projectNames = [deployment.name, project?.name].filter(
    (value) => value !== undefined,
  );
  if (
    projectNames.length === 0 ||
    projectNames.some((value) => value !== target.projectName)
  ) {
    throw new Error(`${context} project name does not match the repo pin`);
  }
  const team = readRecord(deployment, "team");
  const teamIds = [deployment.ownerId, deployment.teamId, team?.id].filter(
    (value) => value !== undefined,
  );
  if (teamIds.length === 0 || teamIds.some((value) => value !== teamId)) {
    throw new Error(`${context} team does not match the repo pin`);
  }
}

function requireProductionReady(
  deployment: DeploymentReadback,
  context: string,
) {
  if (deployment.target !== "production") {
    throw new Error(`${context} target must be production`);
  }
  if (deployment.readyState !== "READY") {
    throw new Error(`${context} must be READY`);
  }
}

function capturePredecessor(
  run: CommandRunner,
  target: VercelProductionTarget,
  teamId: string,
  environment: ReleaseProcessEnvironment,
  worktreeRoot: string,
): PredecessorReceipt {
  const output = runChecked(
    run,
    {
      arguments: [
        "api",
        `/v9/projects/${target.projectId}?teamId=${teamId}`,
        "--raw",
        "--scope",
        teamId,
      ],
      command: "vercel",
      cwd: worktreeRoot,
      environment,
    },
    `${target.application} production predecessor is missing`,
  );
  let deployment: DeploymentReadback;
  try {
    const project = readDeployment(
      output,
      `${target.application} Vercel project`,
    );
    if (
      project.id !== target.projectId ||
      project.name !== target.projectName ||
      project.accountId !== teamId
    ) {
      throw new Error(
        `${target.application} project or team does not match the repo pin`,
      );
    }
    const liveRootDirectory = project.rootDirectory ?? null;
    if (liveRootDirectory !== target.rootDirectory) {
      throw new Error(
        `${target.application} project rootDirectory does not match the repo pin`,
      );
    }
    if (project.autoExposeSystemEnvs !== target.autoExposeSystemEnvs) {
      throw new Error(
        `${target.application} project autoExposeSystemEnvs does not match the repo pin`,
      );
    }
    if (
      project.sourceFilesOutsideRootDirectory !==
      target.sourceFilesOutsideRootDirectory
    ) {
      throw new Error(
        `${target.application} project sourceFilesOutsideRootDirectory does not match the repo pin`,
      );
    }
    const link = readRecord(project, "link");
    if (link?.productionBranch !== target.productionBranch) {
      throw new Error(
        `${target.application} project productionBranch does not match the repo pin`,
      );
    }
    const targets = readRecord(project, "targets");
    const production = targets ? readRecord(targets, "production") : undefined;
    if (!production) {
      throw new Error(
        `${target.application} production predecessor is missing`,
      );
    }
    deployment = production;
    if (deployment.name !== target.projectName) {
      throw new Error(
        `${target.application} production predecessor project or team does not match`,
      );
    }
    requireProductionReady(
      deployment,
      `${target.application} production predecessor`,
    );
    const oidc = readRecord(deployment, "oidcTokenClaims");
    if (
      (oidc?.project_id !== undefined && oidc.project_id !== target.projectId) ||
      (oidc?.owner_id !== undefined && oidc.owner_id !== teamId) ||
      (oidc?.environment !== undefined && oidc.environment !== "production")
    ) {
      throw new Error(
        `${target.application} production predecessor identity does not match`,
      );
    }
    if (
      target.productionDomain &&
      !deploymentAliases(deployment).includes(target.productionDomain)
    ) {
      throw new Error(
        `${target.application} production predecessor does not own its pinned productionDomain`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid readback";
    throw new Error(
      `${target.application} production predecessor is invalid: ${message}`,
    );
  }
  const deploymentId = deployment.id;
  if (
    typeof deploymentId !== "string" ||
    !/^dpl_[A-Za-z0-9_-]+$/.test(deploymentId)
  ) {
    throw new Error(
      `${target.application} production predecessor has no deployment ID`,
    );
  }
  return {
    deploymentId,
    url: readDeploymentUrl(
      deployment,
      `${target.application} production predecessor`,
    ),
  };
}

function readProviderGitSha(
  deployment: DeploymentReadback,
  approvedSha: string,
  application: string,
): string {
  const meta = readRecord(deployment, "meta");
  if (meta?.githubCommitSha !== approvedSha) {
    throw new Error(`${application} provider SHA does not match the approved SHA`);
  }
  return approvedSha;
}

function readMetadata(
  deployment: DeploymentReadback,
  approvedSha: string,
  releaseRunId: string,
  application: string,
) {
  const meta = readRecord(deployment, "meta");
  if (meta?.sourceraReleaseRunId !== releaseRunId) {
    throw new Error(`${application} readback nonce does not match this release run`);
  }
  if (meta.sourceraReleaseApprovedSha !== approvedSha) {
    throw new Error(`${application} approved SHA metadata does not match`);
  }
}

function visibleBuildEnvironment(
  deployment: DeploymentReadback,
): Record<string, string> {
  const result: Record<string, string> = {};
  const sources = [
    deployment.buildEnv,
    readRecord(deployment, "build")?.env,
  ];
  for (const source of sources) {
    if (isRecord(source)) {
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === "string") result[key] = value;
      }
      continue;
    }
    if (!Array.isArray(source)) continue;
    for (const entry of source) {
      if (typeof entry === "string" && entry.includes("=")) {
        const separator = entry.indexOf("=");
        result[entry.slice(0, separator)] = entry.slice(separator + 1);
      } else if (isRecord(entry)) {
        const key = entry.key ?? entry.name;
        const value = entry.value;
        if (typeof key === "string" && typeof value === "string") {
          result[key] = value;
        }
      }
    }
  }
  return result;
}

function requireVisibleBuildMarkers(
  deployment: DeploymentReadback,
  target: VercelProductionTarget,
  approvedSha: string,
) {
  const visible = visibleBuildEnvironment(deployment);
  const expected = {
    SOURCERA_COMMIT_SHA: approvedSha,
    SOURCERA_DOMAIN: target.application,
    SOURCERA_ENV: "production",
    SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (key in visible && visible[key] !== value) {
      throw new Error(`${target.application} build marker ${key} does not match`);
    }
  }
  if (
    deployment.checksState !== undefined &&
    !["completed", "COMPLETED"].includes(String(deployment.checksState))
  ) {
    throw new Error(`${target.application} deployment checks are not complete`);
  }
  if (
    deployment.checksConclusion !== undefined &&
    !["succeeded", "success", "passed"].includes(
      String(deployment.checksConclusion).toLowerCase(),
    )
  ) {
    throw new Error(`${target.application} deployment checks did not pass`);
  }
}

function deploymentAliases(deployment: DeploymentReadback): string[] {
  return [deployment.alias, deployment.automaticAliases, deployment.userAliases]
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .filter((value): value is string => typeof value === "string")
    .map((value) => {
      try {
        return new URL(
          value.startsWith("http://") || value.startsWith("https://")
            ? value
            : `https://${value}`,
        ).hostname;
      } catch {
        return value;
      }
    });
}

function validateStagedDeployment(
  deployment: DeploymentReadback,
  expectedDeploymentId: string,
  target: VercelProductionTarget,
  teamId: string,
  approvedSha: string,
  releaseRunId: string,
  runStartedAt: number,
  readbackAt: number,
) {
  const context = target.application;
  if (deployment.id !== expectedDeploymentId) {
    throw new Error(`${context} authenticated readback returned another deployment`);
  }
  requireDeploymentOwnership(deployment, target, teamId, context);
  requireProductionReady(deployment, context);
  if (
    deployment.readySubstate !== "STAGED" ||
    deployment.autoAssignCustomDomains === true ||
    (target.productionDomain !== null &&
      deploymentAliases(deployment).includes(target.productionDomain))
  ) {
    throw new Error(`${context} deployment is not STAGED`);
  }
  if (deployment.source !== "cli") {
    throw new Error(`${context} deployment does not have the expected CLI source`);
  }
  if (
    typeof deployment.createdAt !== "number" ||
    !Number.isFinite(deployment.createdAt) ||
    deployment.createdAt < runStartedAt ||
    deployment.createdAt > readbackAt
  ) {
    throw new Error(`${context} deployment was not created in this release run`);
  }
  readMetadata(deployment, approvedSha, releaseRunId, context);
  const providerGitSha = readProviderGitSha(deployment, approvedSha, context);
  requireVisibleBuildMarkers(deployment, target, approvedSha);
  return {
    createdAt: new Date(deployment.createdAt).toISOString(),
    providerGitSha,
    url: readDeploymentUrl(deployment, `${context} deployment`),
  };
}

function readHealthProof(
  output: string,
  target: VercelProductionTarget,
  approvedSha: string,
  runStartedAt: number,
  readbackAt: number,
): VercelProductionHealthProof {
  const parsed = parseJson(output, `${target.application} health proof`);
  const checkedAt =
    isRecord(parsed) && typeof parsed.checkedAt === "string"
      ? Date.parse(parsed.checkedAt)
      : Number.NaN;
  if (
    !isRecord(parsed) ||
    parsed.status !== "ok" ||
    parsed.service !== "sourcera" ||
    parsed.commitSha !== approvedSha ||
    parsed.domain !== target.application ||
    parsed.environment !== "production" ||
    typeof parsed.checkedAt !== "string" ||
    Number.isNaN(checkedAt) ||
    checkedAt < runStartedAt ||
    checkedAt > readbackAt
  ) {
    throw new Error(`${target.application} health proof does not match the release`);
  }
  return {
    checkedAt: parsed.checkedAt,
    commitSha: approvedSha,
    domain: target.application,
    environment: "production",
    service: "sourcera",
    status: "ok",
  };
}

function productionDeployArguments(
  target: VercelProductionTarget,
  teamId: string,
  approvedSha: string,
  releaseRunId: string,
): string[] {
  const buildAndRuntimeIdentity = [
    `SOURCERA_COMMIT_SHA=${approvedSha}`,
    `SOURCERA_DOMAIN=${target.application}`,
    "SOURCERA_ENV=production",
    `SOURCERA_RELEASE_APPROVED_SHA=${approvedSha}`,
  ];
  return [
    "deploy",
    "--prod",
    "--skip-domain",
    "--project",
    target.projectId,
    "--yes",
    "--scope",
    teamId,
    "--format",
    "json",
    "--meta",
    `sourceraReleaseRunId=${releaseRunId}`,
    "--meta",
    `sourceraReleaseApprovedSha=${approvedSha}`,
    "--build-env",
    `SOURCERA_RELEASE_RUN_ID=${releaseRunId}`,
    ...buildAndRuntimeIdentity.flatMap((value) => ["--build-env", value]),
    ...buildAndRuntimeIdentity.flatMap((value) => ["--env", value]),
  ];
}

export function stageVercelProductionRelease(
  options: StageVercelProductionReleaseOptions,
): VercelProductionStageReceipt {
  const approvedSha = options.approvedSha.trim();
  if (!FULL_GIT_COMMIT_SHA.test(approvedSha)) {
    throw new Error("Approved SHA must be a full Git commit SHA");
  }
  if (!RELEASE_RUN_ID.test(options.releaseRunId)) {
    throw new Error("Release run ID is invalid");
  }
  const repositoryRoot = canonicalizePotentialPath(options.repositoryRoot);
  let worktreeRoot = canonicalizePotentialPath(options.worktreeRoot);
  requireDisjointWorktreeRoot(repositoryRoot, worktreeRoot);
  const configuration = readVercelProductionReleaseConfig(
    options.config,
    repositoryRoot,
  );
  const sourceEnvironment = { ...(options.environment ?? process.env) };
  const privateHome = canonicalizePotentialPath(
    path.join(path.dirname(worktreeRoot), "home"),
  );
  const gitEnvironment = createVercelProductionGitEnvironment(
    sourceEnvironment,
    privateHome,
  );
  const vercelEnvironment = createVercelProductionCommandEnvironment(
    sourceEnvironment,
    privateHome,
  );
  const now = options.now ?? (() => new Date());
  const runStartedAt = now();
  if (Number.isNaN(runStartedAt.getTime())) {
    throw new Error("Release start time is invalid");
  }
  requirePrimaryCleanCheckout(
    options.run,
    repositoryRoot,
    approvedSha,
    gitEnvironment,
  );
  const applications: VercelProductionStagedApplication[] = [];
  let operationFailure: unknown;
  let worktreeAttempted = false;
  try {
    worktreeAttempted = true;
    runChecked(
      options.run,
      {
        arguments: ["worktree", "add", "--detach", worktreeRoot, approvedSha],
        command: "git",
        cwd: repositoryRoot,
        environment: gitEnvironment,
      },
      "Unable to create the detached Vercel staging worktree",
    );
    worktreeRoot = canonicalizePotentialPath(worktreeRoot);
    requireDetachedCleanCheckout(
      options.run,
      worktreeRoot,
      approvedSha,
      gitEnvironment,
    );

    const predecessors = new Map<
      VercelProductionApplication,
      PredecessorReceipt
    >();
    const predecessorFailures: string[] = [];
    for (const target of configuration.targets) {
      try {
        predecessors.set(
          target.application,
          capturePredecessor(
            options.run,
            target,
            configuration.teamId,
            vercelEnvironment,
            worktreeRoot,
          ),
        );
      } catch (error) {
        predecessorFailures.push(
          error instanceof Error
            ? error.message
            : `${target.application} production predecessor is invalid`,
        );
      }
    }
    if (predecessorFailures.length > 0) {
      throw new Error(
        `Vercel production predecessors are not ready: ${predecessorFailures.join("; ")}`,
      );
    }
    requireDetachedCleanCheckout(
      options.run,
      worktreeRoot,
      approvedSha,
      gitEnvironment,
    );

    for (const target of configuration.targets) {
      requireDetachedCleanCheckout(
        options.run,
        worktreeRoot,
        approvedSha,
        gitEnvironment,
      );
      const deployOutput = runChecked(
        options.run,
        {
          arguments: productionDeployArguments(
            target,
            configuration.teamId,
            approvedSha,
            options.releaseRunId,
          ),
          command: "vercel",
          cwd: worktreeRoot,
          environment: vercelEnvironment,
        },
        `${target.application} Vercel staging failed`,
      );
      requireDetachedCleanCheckout(
        options.run,
        worktreeRoot,
        approvedSha,
        gitEnvironment,
      );
      const deploymentId = readDeploymentId(deployOutput, target.application);
      const readbackOutput = runChecked(
        options.run,
        {
          arguments: [
            "api",
            `/v13/deployments/${deploymentId}`,
            "--raw",
            "--scope",
            configuration.teamId,
          ],
          command: "vercel",
          cwd: worktreeRoot,
          environment: vercelEnvironment,
        },
        `${target.application} authenticated readback failed`,
      );
      const deployment = readDeployment(
        readbackOutput,
        `${target.application} authenticated readback`,
      );
      const readback = validateStagedDeployment(
        deployment,
        deploymentId,
        target,
        configuration.teamId,
        approvedSha,
        options.releaseRunId,
        runStartedAt.getTime(),
        now().getTime(),
      );
      const healthOutput = runChecked(
        options.run,
        {
          arguments: [
            "curl",
            "/api/health",
            "--deployment",
            deploymentId,
            "--scope",
            configuration.teamId,
            "--yes",
          ],
          command: "vercel",
          cwd: worktreeRoot,
          environment: vercelEnvironment,
        },
        `${target.application} health proof failed`,
      );
      const predecessor = predecessors.get(target.application);
      if (!predecessor) {
        throw new Error(
          `${target.application} production predecessor is missing`,
        );
      }
      applications.push({
        application: target.application,
        createdAt: readback.createdAt,
        deploymentId,
        health: readHealthProof(
          healthOutput,
          target,
          approvedSha,
          runStartedAt.getTime(),
          now().getTime(),
        ),
        predecessorDeploymentId: predecessor.deploymentId,
        predecessorUrl: predecessor.url,
        productionDomain: target.productionDomain,
        projectId: target.projectId,
        projectName: target.projectName,
        providerGitSha: readback.providerGitSha,
        rootDirectory: target.rootDirectory,
        state: "READY",
        substate: "STAGED",
        target: "production",
        url: readback.url,
      });
      requireDetachedCleanCheckout(
        options.run,
        worktreeRoot,
        approvedSha,
        gitEnvironment,
      );
    }
  } catch (error) {
    operationFailure = error;
  }

  const finalizationFailures: unknown[] = [];
  if (worktreeAttempted) {
    for (const [arguments_, message] of [
      [
        ["worktree", "remove", "--force", worktreeRoot],
        "Unable to remove the detached Vercel staging worktree",
      ],
      [["worktree", "prune"], "Unable to prune detached Git worktrees"],
    ] as const) {
      try {
        runChecked(
          options.run,
          {
            arguments: [...arguments_],
            command: "git",
            cwd: repositoryRoot,
            environment: gitEnvironment,
          },
          message,
        );
      } catch (error) {
        finalizationFailures.push(error);
      }
    }
  }
  try {
    requirePrimaryCleanCheckout(
      options.run,
      repositoryRoot,
      approvedSha,
      gitEnvironment,
    );
  } catch (error) {
    finalizationFailures.push(error);
  }
  if (operationFailure !== undefined) {
    if (finalizationFailures.length > 0) {
      throw new AggregateError(
        [operationFailure, ...finalizationFailures],
        "Vercel staging failed and cleanup could not be verified",
      );
    }
    throw operationFailure;
  }
  if (finalizationFailures.length === 1) {
    throw finalizationFailures[0];
  }
  if (finalizationFailures.length > 1) {
    throw new AggregateError(
      finalizationFailures,
      "Vercel staging cleanup could not be verified",
    );
  }

  const completedAt = now();
  if (
    Number.isNaN(completedAt.getTime()) ||
    completedAt.getTime() < runStartedAt.getTime()
  ) {
    throw new Error("Release completion time is invalid");
  }
  return {
    applications,
    approvedSha,
    completedAt: completedAt.toISOString(),
    convexTarget: configuration.convexTarget,
    event: "vercel_production_stage_receipt",
    releaseRunId: options.releaseRunId,
    schemaVersion: 1,
    startedAt: runStartedAt.toISOString(),
    teamId: configuration.teamId,
  };
}
