import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionTargets from "../config/production-targets.json";
import { readPinnedConvexProductionTarget } from "./lib/convex-production-target";
import {
  createConvexVercelDeploymentPlan,
  isRetryableConvexPreviewDeploymentFailure,
} from "./lib/convex-vercel-deployment";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const workspaceIndex = process.argv.indexOf("--workspace");
const workspace = workspaceIndex >= 0 ? process.argv[workspaceIndex + 1] : null;
const repositoryCommitSha =
  process.env.SOURCERA_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA;
if (!repositoryCommitSha) {
  throw new Error("Vercel did not provide a release commit identity");
}
const productionTarget =
  process.env.VERCEL_ENV === "production"
    ? readPinnedConvexProductionTarget(productionTargets)
    : undefined;
const plan = createConvexVercelDeploymentPlan(
  process.env,
  workspace,
  repositoryCommitSha,
  productionTarget,
);
const environment: NodeJS.ProcessEnv = {
  ...process.env,
  ...plan.environmentOverrides,
};

const MAX_PREVIEW_DEPLOY_ATTEMPTS = 3;

async function main() {
  for (const step of plan.steps) {
    const capturesTransientPreviewFailure =
      plan.mode === "preview" && step.name === "deploy";
    for (
      let attempt = 1;
      attempt <= MAX_PREVIEW_DEPLOY_ATTEMPTS;
      attempt += 1
    ) {
      const execution = spawnSync(step.command, step.arguments, {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: environment,
        maxBuffer: 32 * 1024 * 1024,
        stdio: capturesTransientPreviewFailure
          ? ["inherit", "pipe", "pipe"]
          : "inherit",
      });
      const stdout =
        typeof execution.stdout === "string" ? execution.stdout : "";
      const stderr =
        typeof execution.stderr === "string" ? execution.stderr : "";
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (execution.error) throw execution.error;
      if (execution.status === 0) break;

      const retryable =
        capturesTransientPreviewFailure &&
        isRetryableConvexPreviewDeploymentFailure(`${stdout}\n${stderr}`) &&
        attempt < MAX_PREVIEW_DEPLOY_ATTEMPTS;
      if (retryable) {
        process.stderr.write(
          `Convex Preview returned a transient provider error; retrying (${attempt + 1}/${MAX_PREVIEW_DEPLOY_ATTEMPTS}).\n`,
        );
        await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
        continue;
      }

      process.exitCode = execution.status ?? 1;
      return;
    }
  }
}

void main();
