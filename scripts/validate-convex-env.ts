import { appendFileSync } from "node:fs";

import {
  readRequiredConvexPreviewClientIdentity,
  readRequiredConvexPreviewIdentity,
  readRequiredConvexPreviewKeyIdentity,
} from "@sourcera/domain/convex";

const phaseIndex = process.argv.indexOf("--phase");
const phase = phaseIndex >= 0 ? process.argv[phaseIndex + 1] : "full";
if (!phase || !["client", "full", "predeploy"].includes(phase)) {
  throw new Error("--phase must be client, full, or predeploy");
}

const identity =
  phase === "predeploy"
    ? readRequiredConvexPreviewKeyIdentity(process.env)
    : phase === "client"
      ? readRequiredConvexPreviewClientIdentity(process.env)
      : readRequiredConvexPreviewIdentity(process.env);

if (process.argv.includes("--write-github-env")) {
  if (phase === "predeploy" || !("deploymentUrl" in identity)) {
    throw new Error("--write-github-env requires client or full validation");
  }
  if (!process.env.GITHUB_ENV) {
    throw new Error("GITHUB_ENV is required when writing the deployment URL");
  }
  appendFileSync(
    process.env.GITHUB_ENV,
    `NEXT_PUBLIC_CONVEX_URL=${identity.deploymentUrl}\n`,
    { encoding: "utf8" },
  );
}

process.stdout.write(
  `${JSON.stringify({
    commitSha: identity.commitSha,
    environment: identity.environment,
    phase,
    previewName: identity.previewName,
    result: "passed",
  })}\n`,
);
