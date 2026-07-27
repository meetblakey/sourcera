import { appendFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { registeredSchemaFragmentFiles } from "../convex/schema/registry";
import { verifyConvexGeneratedIntegrity } from "./lib/convex-build-integrity";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const writeGitHubOutput = process.argv.slice(2).includes("--write-github-output");
if (
  process.argv.slice(2).some((argument) => argument !== "--write-github-output")
) {
  throw new Error("Usage: verify-convex-generated [--write-github-output]");
}

const result = verifyConvexGeneratedIntegrity({
  registeredFragmentFiles: registeredSchemaFragmentFiles,
  repositoryRoot,
});

if (writeGitHubOutput) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (
    process.env.GITHUB_ACTIONS !== "true" ||
    !outputPath ||
    !path.isAbsolute(outputPath)
  ) {
    throw new Error(
      "--write-github-output requires GitHub Actions and an absolute GITHUB_OUTPUT",
    );
  }
  appendFileSync(
    outputPath,
    `generated-client-sha256=${result.digests.generatedClientSha256}\n` +
      `generated-model-sha256=${result.digests.generatedModelSha256}\n` +
      `schema-registry-sha256=${result.digests.schemaRegistrySha256}\n`,
    { encoding: "utf8", mode: 0o600 },
  );
}

process.stdout.write(
  `${JSON.stringify({
    digests: result.digests,
    event: "convex_generated_integrity",
    files: result.files,
    result: "passed",
  })}\n`,
);
