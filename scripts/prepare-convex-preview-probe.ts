import {
  appendFileSync,
  closeSync,
  fsyncSync,
  openSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readRequiredConvexPreviewKeyIdentity } from "@sourcera/domain/convex";
import {
  createConvexPreviewProbeExpiresAt,
  deriveConvexPreviewProbeToken,
  deriveConvexPreviewProbeTokenSha256,
} from "./lib/convex-preview-probe-capability";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const writeGitHubEnvironment = args.includes("--write-github-env");
if (
  outIndex < 0 ||
  !args[outIndex + 1] ||
  args.some(
    (argument, index) =>
      index !== outIndex &&
      index !== outIndex + 1 &&
      argument !== "--write-github-env",
  )
) {
  throw new Error(
    "Usage: prepare-convex-preview-probe --out <external-path> [--write-github-env]",
  );
}

const outputPath = path.resolve(args[outIndex + 1]);
const outputRelative = path.relative(repositoryRoot, outputPath);
if (!outputRelative.startsWith("..") || path.isAbsolute(outputRelative)) {
  throw new Error("Preview probe token output must be outside the checkout");
}

const identity = readRequiredConvexPreviewKeyIdentity(process.env);
const probeSeed = process.env.SOURCERA_CONVEX_PREVIEW_PROBE_SEED;
if (!probeSeed) {
  throw new Error("SOURCERA_CONVEX_PREVIEW_PROBE_SEED is required");
}
const token = deriveConvexPreviewProbeToken(
  probeSeed,
  identity.commitSha,
  identity.previewName,
);
const tokenSha256 = deriveConvexPreviewProbeTokenSha256(
  probeSeed,
  identity.commitSha,
  identity.previewName,
);
const expiresAt = createConvexPreviewProbeExpiresAt();

let descriptor: number | undefined;
try {
  descriptor = openSync(outputPath, "wx", 0o600);
  writeFileSync(descriptor, token, "utf8");
  fsyncSync(descriptor);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code === "EEXIST") {
    throw new Error("Preview probe token output already exists");
  }
  throw error;
} finally {
  if (descriptor !== undefined) closeSync(descriptor);
}

if (writeGitHubEnvironment) {
  const githubEnvironment = process.env.GITHUB_ENV;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    !githubEnvironment ||
    !path.isAbsolute(githubEnvironment)
  ) {
    throw new Error(
      "--write-github-env requires GitHub Actions and an absolute GITHUB_ENV",
    );
  }
  appendFileSync(
    githubEnvironment,
    `SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_FILE=${outputPath}\n` +
      `SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256=${tokenSha256}\n` +
      `SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT=${expiresAt}\n`,
    { encoding: "utf8", mode: 0o600 },
  );
}

process.stdout.write(
  `${JSON.stringify({
    commitSha: identity.commitSha,
    event: "convex_preview_probe_capability_prepared",
    expiresAt: new Date(expiresAt).toISOString(),
    previewName: identity.previewName,
    result: "passed",
    tokenSha256,
  })}\n`,
);
