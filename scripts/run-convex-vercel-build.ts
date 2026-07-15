import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productionTargets from "../config/production-targets.json";
import { readPinnedConvexProductionTarget } from "./lib/convex-production-target";
import { createConvexVercelDeploymentPlan } from "./lib/convex-vercel-deployment";

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
for (const step of plan.steps) {
  const execution = spawnSync(step.command, step.arguments, {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
    stdio: "inherit",
  });
  if (execution.error) throw execution.error;
  if (execution.status !== 0) {
    process.exitCode = execution.status ?? 1;
    break;
  }
}
