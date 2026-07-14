import { readRequiredDeploymentIdentity } from "../lib/deployment-health";

try {
  const identity = readRequiredDeploymentIdentity(process.env);

  process.stdout.write(
    `${JSON.stringify({
      commitSha: identity.commitSha,
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
