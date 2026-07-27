import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readRequiredConvexPreviewKeyIdentity } from "@sourcera/domain/convex";
import {
  assertControlledConvexReleaseIdentityChange,
  assertConvexReleaseIdentityPlaceholder,
  assertVercelConvexPreviewStampSource,
  CONVEX_RELEASE_IDENTITY_PATH,
  renderConvexReleaseIdentity,
} from "./lib/convex-release-identity";
import {
  createConvexPreviewProbeExpiresAt,
  deriveConvexPreviewProbeTokenSha256,
  readConvexPreviewProbeExpiresAt,
} from "./lib/convex-preview-probe-capability";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const identityPath = path.join(repositoryRoot, CONVEX_RELEASE_IDENTITY_PATH);
const placeholder = readFileSync(identityPath, "utf8");
assertConvexReleaseIdentityPlaceholder(placeholder);

const identity = readRequiredConvexPreviewKeyIdentity(process.env);
if (!process.env.SOURCERA_CONVEX_PREVIEW_PROBE_SEED) {
  throw new Error("SOURCERA_CONVEX_PREVIEW_PROBE_SEED is required");
}
const probeTokenSha256 = deriveConvexPreviewProbeTokenSha256(
  process.env.SOURCERA_CONVEX_PREVIEW_PROBE_SEED,
  identity.commitSha,
  identity.previewName,
);
const probeExpiresAt = process.env.SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT
  ? readConvexPreviewProbeExpiresAt(
      process.env.SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT,
    )
  : createConvexPreviewProbeExpiresAt();
if (
  process.env.SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256 &&
  process.env.SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256 !== probeTokenSha256
) {
  throw new Error("Preview probe token digest does not match its release identity");
}
const rendered = renderConvexReleaseIdentity(
  identity.commitSha,
  identity.environment,
  identity.previewName,
  probeTokenSha256,
  probeExpiresAt,
);
const vercelProviderBuild = process.env.VERCEL === "1";
if (vercelProviderBuild) {
  assertVercelConvexPreviewStampSource(
    process.env,
    identity.commitSha,
    identity.previewName,
  );
}

if (!process.argv.includes("--dry-run")) {
  try {
    writeFileSync(identityPath, rendered, { encoding: "utf8", mode: 0o600 });
    if (!vercelProviderBuild) {
      const status = spawnSync(
        "git",
        ["status", "--short", "--untracked-files=all"],
        { cwd: repositoryRoot, encoding: "utf8" },
      );
      if (status.error) throw status.error;
      if (status.status !== 0) {
        throw new Error("Unable to verify the Convex Preview identity stamp");
      }
      assertControlledConvexReleaseIdentityChange(status.stdout);
    }
  } catch (error) {
    writeFileSync(identityPath, placeholder, { encoding: "utf8", mode: 0o600 });
    throw error;
  }
}

process.stdout.write(
  `${JSON.stringify({
    commitSha: identity.commitSha,
    environment: identity.environment,
    phase: "stamp-preview-build",
    previewName: identity.previewName,
    probeExpiresAt: new Date(probeExpiresAt).toISOString(),
    project: identity.project,
    result: "passed",
  })}\n`,
);
