import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createCommitBoundConvexPreviewName,
  readRequiredConvexPreviewKeyIdentity,
} from "@sourcera/domain/convex";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const workspaceIndex = process.argv.indexOf("--workspace");
const workspace = workspaceIndex >= 0 ? process.argv[workspaceIndex + 1] : null;
if (
  workspace !== null &&
  workspace !== "@sourcera/buyer" &&
  workspace !== "@sourcera/seller"
) {
  throw new Error("--workspace must be @sourcera/buyer or @sourcera/seller");
}

const pullRequestId = process.env.VERCEL_GIT_PULL_REQUEST_ID;
if (pullRequestId && !/^\d+$/.test(pullRequestId)) {
  throw new Error("VERCEL_GIT_PULL_REQUEST_ID must be numeric");
}
const previewSource = pullRequestId
  ? `sourcera-pr-${pullRequestId}`
  : process.env.VERCEL_GIT_COMMIT_REF;
if (!previewSource) {
  throw new Error("A Vercel pull request or Git branch is required");
}
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
if (!commitSha) {
  throw new Error("VERCEL_GIT_COMMIT_SHA is required");
}
if (
  process.env.SOURCERA_COMMIT_SHA &&
  process.env.SOURCERA_COMMIT_SHA !== commitSha
) {
  throw new Error("SOURCERA_COMMIT_SHA must match VERCEL_GIT_COMMIT_SHA");
}
const previewName = createCommitBoundConvexPreviewName(
  previewSource,
  commitSha,
);
const environment: NodeJS.ProcessEnv = {
  ...process.env,
  CONVEX_PREVIEW_NAME: previewName,
  SOURCERA_COMMIT_SHA: commitSha,
};
readRequiredConvexPreviewKeyIdentity(environment);

const buildCommand = workspace
  ? `tsx scripts/validate-convex-env.ts --phase full && npm run build --workspace ${workspace}`
  : "tsx scripts/validate-convex-env.ts --phase full && npm run build";
const deployment = spawnSync(
  "npx",
  [
    "convex",
    "deploy",
    "--preview-name",
    previewName,
    "--cmd",
    buildCommand,
    "--cmd-url-env-var-name",
    "NEXT_PUBLIC_CONVEX_URL",
    "--message",
    environment.SOURCERA_COMMIT_SHA ?? environment.VERCEL_GIT_COMMIT_SHA ?? "unknown",
  ],
  {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: environment,
    stdio: "inherit",
  },
);

if (deployment.error) throw deployment.error;
if (deployment.status !== 0) process.exitCode = deployment.status ?? 1;
