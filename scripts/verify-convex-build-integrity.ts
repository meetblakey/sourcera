import path from "node:path";
import { fileURLToPath } from "node:url";

import { registeredSchemaFragmentFiles } from "../convex/schema/registry";
import { verifyConvexPostBuildIntegrity } from "./lib/convex-build-integrity";
import { readConvexPreviewProbeExpiresAt } from "./lib/convex-preview-probe-capability";

const SHA256 = /^[a-f0-9]{64}$/;
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function requiredDigest(name: string) {
  const value = requiredEnvironment(name);
  if (!SHA256.test(value)) throw new Error(`${name} must be a SHA-256 digest`);
  return value;
}

const commitSha = requiredEnvironment("SOURCERA_COMMIT_SHA");
const environment = requiredEnvironment("SOURCERA_ENV");
const result = verifyConvexPostBuildIntegrity({
  commitSha,
  environment,
  expectedDigests: {
    generatedClientSha256: requiredDigest(
      "SOURCERA_VERIFIED_GENERATED_CLIENT_SHA256",
    ),
    generatedModelSha256: requiredDigest(
      "SOURCERA_VERIFIED_GENERATED_MODEL_SHA256",
    ),
    schemaRegistrySha256: requiredDigest(
      "SOURCERA_VERIFIED_SCHEMA_REGISTRY_SHA256",
    ),
  },
  previewName:
    environment === "production"
      ? undefined
      : requiredEnvironment("CONVEX_PREVIEW_NAME"),
  previewProbeExpiresAt:
    environment === "production"
      ? undefined
      : readConvexPreviewProbeExpiresAt(
          requiredEnvironment("SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT"),
        ),
  previewProbeTokenSha256:
    environment === "production"
      ? undefined
      : requiredDigest("SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256"),
  registeredFragmentFiles: registeredSchemaFragmentFiles,
  repositoryRoot,
});

process.stdout.write(
  `${JSON.stringify({
    commitSha: result.commitSha,
    digests: result.digests,
    event: "convex_post_build_integrity",
    files: result.files,
    result: "passed",
  })}\n`,
);
