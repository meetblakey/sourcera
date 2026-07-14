export type DeploymentEnvironment = Record<string, string | undefined>;

export interface DeploymentIdentity {
  commitSha: string;
  environment: string;
}

export interface HealthPayload extends DeploymentIdentity {
  checkedAt: string;
  service: "sourcera";
  status: "ok";
}

function deploymentIdentityFrom(
  environment: DeploymentEnvironment,
): Partial<DeploymentIdentity> {
  return {
    commitSha:
      environment.SOURCERA_COMMIT_SHA ??
      environment.VERCEL_GIT_COMMIT_SHA,
    environment:
      environment.SOURCERA_ENV ??
      environment.VERCEL_TARGET_ENV ??
      environment.VERCEL_ENV,
  };
}

export function readRequiredDeploymentIdentity(
  environment: DeploymentEnvironment,
): DeploymentIdentity {
  const identity = deploymentIdentityFrom(environment);
  const missing = [
    !identity.environment && "SOURCERA_ENV",
    !identity.commitSha && "SOURCERA_COMMIT_SHA",
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

  return identity as DeploymentIdentity;
}

export function createHealthPayload(
  environment: DeploymentEnvironment,
  checkedAt = new Date(),
): HealthPayload {
  const identity = deploymentIdentityFrom(environment);

  return {
    checkedAt: checkedAt.toISOString(),
    commitSha: identity.commitSha ?? "local",
    environment: identity.environment ?? "local",
    service: "sourcera",
    status: "ok",
  };
}
