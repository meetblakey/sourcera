export type DeploymentEnvironment = Record<string, string | undefined>;
export const SOURCERA_DOMAINS = ["buyer", "seller", "marketplace"] as const;
export type SourceraDomain = (typeof SOURCERA_DOMAINS)[number];

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

  if (!/^[a-f0-9]{7,64}$/i.test(identity.commitSha!)) {
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
  const identity = deploymentIdentityFrom(environment);
  const domain = parseDomain(identity.domain ?? expectedDomain);

  if (domain !== expectedDomain) {
    throw new Error(
      `SOURCERA_DOMAIN expected ${expectedDomain}, received ${domain}`,
    );
  }

  return {
    checkedAt: checkedAt.toISOString(),
    commitSha: identity.commitSha ?? "local",
    domain,
    environment: identity.environment ?? "local",
    service: "sourcera",
    status: "ok",
  };
}
