import {
  readRequiredDeploymentIdentity,
  SOURCERA_DOMAINS,
  type SourceraDomain,
} from "../lib/deployment-health";

function expectedDomainFrom(arguments_: string[]): SourceraDomain {
  const domainIndex = arguments_.indexOf("--domain");
  const value = domainIndex >= 0 ? arguments_[domainIndex + 1] : undefined;

  if (!SOURCERA_DOMAINS.includes(value as SourceraDomain)) {
    throw new Error(
      `--domain must be one of: ${SOURCERA_DOMAINS.join(", ")}`,
    );
  }

  return value as SourceraDomain;
}

try {
  const expectedDomain = expectedDomainFrom(process.argv.slice(2));
  const identity = readRequiredDeploymentIdentity(process.env, expectedDomain);

  process.stdout.write(
    `${JSON.stringify({
      commitSha: identity.commitSha,
      domain: identity.domain,
      environment: identity.environment,
      requiredKeysPresent: true,
      status: "ok",
    })}\n`,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Deployment check failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
