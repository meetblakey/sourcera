export type DeploymentEnvironment = Record<string, string | undefined>;
export const SOURCERA_DOMAINS = ["buyer", "seller", "marketplace"] as const;
export type SourceraDomain = (typeof SOURCERA_DOMAINS)[number];
const SAFE_TELEMETRY_ENVIRONMENTS = new Set([
  "ci",
  "development",
  "local",
  "preview",
  "production",
  "staging",
  "test",
]);
const FULL_GIT_COMMIT_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;

export interface DeploymentIdentity {
  commitSha: string;
  domain: SourceraDomain;
  environment: string;
}

export interface HealthPayload extends DeploymentIdentity {
  checkedAt: string;
  service: "sourcera";
  status: "ok";
}

export interface HealthFailurePayload {
  assertion: "domain-health";
  checkedAt: string;
  commitSha: string;
  domain: SourceraDomain;
  environment: string;
  event: "domain_deployment_health_result";
  result: "failed";
}

function deploymentIdentityFrom(
  environment: DeploymentEnvironment,
): Partial<Omit<DeploymentIdentity, "domain">> & { domain?: string } {
  return {
    commitSha:
      environment.SOURCERA_COMMIT_SHA ??
      environment.VERCEL_GIT_COMMIT_SHA,
    domain: environment.SOURCERA_DOMAIN,
    environment:
      environment.SOURCERA_ENV ??
      environment.VERCEL_TARGET_ENV ??
      environment.VERCEL_ENV,
  };
}

function parseDomain(value: string): SourceraDomain {
  if (!SOURCERA_DOMAINS.includes(value as SourceraDomain)) {
    throw new Error(
      `SOURCERA_DOMAIN must be one of: ${SOURCERA_DOMAINS.join(", ")}`,
    );
  }
  return value as SourceraDomain;
}

export function readRequiredDeploymentIdentity(
  environment: DeploymentEnvironment,
  expectedDomain?: SourceraDomain,
): DeploymentIdentity {
  const identity = deploymentIdentityFrom(environment);
  const missing = [
    !identity.environment && "SOURCERA_ENV",
    !identity.commitSha && "SOURCERA_COMMIT_SHA",
    !identity.domain && "SOURCERA_DOMAIN",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Missing required deployment environment keys: ${missing.join(", ")}`,
    );
  }

  if (!/^[a-z][a-z0-9-]{1,31}$/.test(identity.environment!)) {
    throw new Error("SOURCERA_ENV must be a lowercase environment name");
  }

  if (!FULL_GIT_COMMIT_SHA.test(identity.commitSha!)) {
    throw new Error("SOURCERA_COMMIT_SHA must be a Git commit SHA");
  }

  const domain = parseDomain(identity.domain!);
  if (expectedDomain && domain !== expectedDomain) {
    throw new Error(
      `SOURCERA_DOMAIN expected ${expectedDomain}, received ${domain}`,
    );
  }

  return {
    commitSha: identity.commitSha!,
    domain,
    environment: identity.environment!,
  };
}

export function createHealthPayload(
  environment: DeploymentEnvironment,
  checkedAt = new Date(),
  expectedDomain: SourceraDomain = "marketplace",
): HealthPayload {
  const candidate = deploymentIdentityFrom(environment);
  const isEmptyDevelopmentIdentity =
    environment.NODE_ENV === "development" &&
    !candidate.commitSha &&
    !candidate.domain &&
    !candidate.environment;

  if (isEmptyDevelopmentIdentity) {
    return {
      checkedAt: checkedAt.toISOString(),
      commitSha: "local",
      domain: expectedDomain,
      environment: "local",
      service: "sourcera",
      status: "ok",
    };
  }

  const identity = readRequiredDeploymentIdentity(environment, expectedDomain);

  return {
    checkedAt: checkedAt.toISOString(),
    ...identity,
    service: "sourcera",
    status: "ok",
  };
}

export function createHealthFailurePayload(
  environment: DeploymentEnvironment,
  expectedDomain: SourceraDomain,
  checkedAt = new Date(),
): HealthFailurePayload {
  const identity = deploymentIdentityFrom(environment);
  const commitSha = identity.commitSha
    ? FULL_GIT_COMMIT_SHA.test(identity.commitSha)
      ? identity.commitSha
      : "invalid"
    : "missing";
  const deploymentEnvironment = identity.environment
    ? SAFE_TELEMETRY_ENVIRONMENTS.has(identity.environment)
      ? identity.environment
      : "invalid"
    : "unknown";

  return {
    assertion: "domain-health",
    checkedAt: checkedAt.toISOString(),
    commitSha,
    domain: expectedDomain,
    environment: deploymentEnvironment,
    event: "domain_deployment_health_result",
    result: "failed",
  };
}
