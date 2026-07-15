export type ConvexEnvironment = Record<string, string | undefined>;

const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const PREVIEW_DEPLOY_KEY =
  /^preview:([a-z0-9](?:[a-z0-9-]{0,62})):([a-z0-9](?:[a-z0-9-]{0,62}))\|(.+)$/;
const PREVIEW_NAME = /^[a-z0-9](?:[a-z0-9-]{0,62})$/;
const PREVIEW_ENVIRONMENTS = new Set(["ci", "preview", "staging", "test"]);

export interface ConvexPreviewKeyIdentity {
  commitSha: string;
  environment: string;
  previewName: string;
  project: string;
}

export interface ConvexPreviewClientIdentity {
  commitSha: string;
  deploymentUrl: string;
  environment: string;
  previewName: string;
}

export interface ConvexPreviewIdentity
  extends ConvexPreviewKeyIdentity,
    ConvexPreviewClientIdentity {
}

export interface ConvexFoundationHealthResult {
  assertion: string;
  checkedAt: string;
  commitSha: string;
  deployment: string;
  environment: string;
  event: "convex_foundation_health_result";
  observationLatencyMs: number;
  result: "failed" | "passed";
}

function deploymentCommit(environment: ConvexEnvironment) {
  return environment.SOURCERA_COMMIT_SHA ?? environment.VERCEL_GIT_COMMIT_SHA;
}

function deploymentEnvironment(environment: ConvexEnvironment) {
  return (
    environment.SOURCERA_ENV ??
    environment.VERCEL_TARGET_ENV ??
    environment.VERCEL_ENV
  );
}

function validateCommitBoundPreviewName(
  previewName: string,
  commitSha: string,
) {
  if (!previewName.endsWith(`-${commitSha.toLowerCase()}`)) {
    throw new Error("CONVEX_PREVIEW_NAME must match SOURCERA_COMMIT_SHA");
  }
}

export function createConvexPreviewName(source: string): string {
  const name = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
  if (!PREVIEW_NAME.test(name)) {
    throw new Error("Unable to derive a valid Convex Preview name");
  }
  return name;
}

export function createCommitBoundConvexPreviewName(
  source: string,
  commitSha: string,
): string {
  if (!FULL_GIT_COMMIT_SHA.test(commitSha)) {
    throw new Error("SOURCERA_COMMIT_SHA must be a Git commit SHA");
  }
  const suffix = commitSha.toLowerCase();
  const sourceLength = 63 - suffix.length - 1;
  if (sourceLength < 1) {
    throw new Error("Git commit SHA is too long for a Convex Preview name");
  }
  const prefix = createConvexPreviewName(source)
    .slice(0, sourceLength)
    .replace(/-+$/g, "");
  return `${prefix}-${suffix}`;
}

export function readConvexDeploymentUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_CONVEX_URL must be a valid URL");
  }

  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".convex.cloud") ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL must be an HTTPS convex.cloud deployment root",
    );
  }

  return url.toString().replace(/\/$/, "");
}

export function readRequiredConvexPreviewKeyIdentity(
  environment: ConvexEnvironment,
): ConvexPreviewKeyIdentity {
  if (environment.CONVEX_DEPLOYMENT) {
    throw new Error(
      "CONVEX_DEPLOYMENT is forbidden for Preview delivery; use a Preview deploy key",
    );
  }

  const commitSha = deploymentCommit(environment);
  const runtimeEnvironment = deploymentEnvironment(environment);
  const missing = [
    !environment.CONVEX_DEPLOY_KEY && "CONVEX_DEPLOY_KEY",
    !environment.CONVEX_EXPECTED_PROJECT && "CONVEX_EXPECTED_PROJECT",
    !environment.CONVEX_PREVIEW_NAME && "CONVEX_PREVIEW_NAME",
    !commitSha && "SOURCERA_COMMIT_SHA",
    !runtimeEnvironment && "SOURCERA_ENV",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Missing required Convex Preview keys: ${missing.join(", ")}`);
  }

  const keyMatch = PREVIEW_DEPLOY_KEY.exec(environment.CONVEX_DEPLOY_KEY!);
  if (!keyMatch || keyMatch[3].length < 8) {
    throw new Error("CONVEX_DEPLOY_KEY must be a Convex Preview deploy key");
  }
  const project = `${keyMatch[1]}/${keyMatch[2]}`;
  if (environment.CONVEX_EXPECTED_PROJECT !== project) {
    throw new Error("CONVEX_DEPLOY_KEY does not match CONVEX_EXPECTED_PROJECT");
  }

  if (!PREVIEW_NAME.test(environment.CONVEX_PREVIEW_NAME!)) {
    throw new Error(
      "CONVEX_PREVIEW_NAME must be a lowercase deployment name",
    );
  }

  if (!FULL_GIT_COMMIT_SHA.test(commitSha!)) {
    throw new Error("SOURCERA_COMMIT_SHA must be a Git commit SHA");
  }
  validateCommitBoundPreviewName(environment.CONVEX_PREVIEW_NAME!, commitSha!);

  if (!PREVIEW_ENVIRONMENTS.has(runtimeEnvironment!)) {
    throw new Error("SOURCERA_ENV must be a non-production Preview environment");
  }

  return {
    commitSha: commitSha!,
    environment: runtimeEnvironment!,
    previewName: environment.CONVEX_PREVIEW_NAME!,
    project,
  };
}

export function readRequiredConvexPreviewIdentity(
  environment: ConvexEnvironment,
): ConvexPreviewIdentity {
  const keyIdentity = readRequiredConvexPreviewKeyIdentity(environment);
  const clientIdentity = readRequiredConvexPreviewClientIdentity(environment);

  return {
    ...clientIdentity,
    ...keyIdentity,
  };
}

export function readRequiredConvexPreviewClientIdentity(
  environment: ConvexEnvironment,
): ConvexPreviewClientIdentity {
  if (environment.CONVEX_DEPLOYMENT) {
    throw new Error(
      "CONVEX_DEPLOYMENT is forbidden for Preview delivery; use the URL supplied by Convex deploy",
    );
  }
  if (!environment.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error(
      "Missing required Convex Preview keys: NEXT_PUBLIC_CONVEX_URL",
    );
  }
  const commitSha = deploymentCommit(environment);
  const runtimeEnvironment = deploymentEnvironment(environment);
  const missing = [
    !environment.CONVEX_PREVIEW_NAME && "CONVEX_PREVIEW_NAME",
    !commitSha && "SOURCERA_COMMIT_SHA",
    !runtimeEnvironment && "SOURCERA_ENV",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Missing required Convex Preview keys: ${missing.join(", ")}`);
  }
  if (!PREVIEW_NAME.test(environment.CONVEX_PREVIEW_NAME!)) {
    throw new Error(
      "CONVEX_PREVIEW_NAME must be a lowercase deployment name",
    );
  }
  if (!FULL_GIT_COMMIT_SHA.test(commitSha!)) {
    throw new Error("SOURCERA_COMMIT_SHA must be a Git commit SHA");
  }
  validateCommitBoundPreviewName(environment.CONVEX_PREVIEW_NAME!, commitSha!);
  if (!PREVIEW_ENVIRONMENTS.has(runtimeEnvironment!)) {
    throw new Error("SOURCERA_ENV must be a non-production Preview environment");
  }

  return {
    commitSha: commitSha!,
    deploymentUrl: readConvexDeploymentUrl(
      environment.NEXT_PUBLIC_CONVEX_URL,
    ),
    environment: runtimeEnvironment!,
    previewName: environment.CONVEX_PREVIEW_NAME!,
  };
}

export function createConvexFoundationHealthResult(
  environment: ConvexEnvironment,
  result: Pick<
    ConvexFoundationHealthResult,
    "assertion" | "observationLatencyMs" | "result"
  >,
  checkedAt = new Date(),
): ConvexFoundationHealthResult {
  if (!Number.isFinite(result.observationLatencyMs) || result.observationLatencyMs < 0) {
    throw new Error("observationLatencyMs must be a non-negative number");
  }
  const identity = readRequiredConvexPreviewIdentity(environment);

  return {
    assertion: result.assertion,
    checkedAt: checkedAt.toISOString(),
    commitSha: identity.commitSha,
    deployment: identity.previewName,
    environment: identity.environment,
    event: "convex_foundation_health_result",
    observationLatencyMs: result.observationLatencyMs,
    result: result.result,
  };
}
