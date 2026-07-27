import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  assertControlledConvexReleaseIdentityChange,
  CONVEX_RELEASE_IDENTITY_PATH,
  renderConvexReleaseIdentity,
} from "./convex-release-identity";
import {
  createConvexSchemaRegistryDigest,
  validateConvexSchemaContract,
} from "./convex-schema-contract";

export const CONVEX_GENERATED_CLIENT_FILES = Object.freeze([
  "convex/_generated/api.d.ts",
  "convex/_generated/api.js",
  "convex/_generated/server.d.ts",
  "convex/_generated/server.js",
] as const);

export const CONVEX_GENERATED_MODEL_FILES = Object.freeze([
  "convex/_generated/dataModel.d.ts",
] as const);

export const CONVEX_GENERATED_FILES = Object.freeze(
  [...CONVEX_GENERATED_CLIENT_FILES, ...CONVEX_GENERATED_MODEL_FILES].sort(
    stableCompare,
  ),
);

export interface ConvexIntegrityDigests {
  generatedClientSha256: string;
  generatedModelSha256: string;
  schemaRegistrySha256: string;
}

interface ConvexGeneratedIntegrityOptions {
  registeredFragmentFiles: readonly string[];
  repositoryRoot: string;
}

interface ConvexPostBuildIntegrityOptions
  extends ConvexGeneratedIntegrityOptions {
  commitSha: string;
  environment: string;
  expectedDigests: ConvexIntegrityDigests;
  previewName?: string;
  previewProbeExpiresAt?: number;
  previewProbeTokenSha256?: string;
}

function stableCompare(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function toPortablePath(value: string) {
  return value.split(path.sep).join("/");
}

function runGit(repositoryRoot: string, args: readonly string[]) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Git integrity check failed: git ${args.join(" ")}`);
  }
  return result.stdout;
}

function listGeneratedFiles(
  repositoryRoot: string,
  relativeDirectory = "convex/_generated",
): string[] {
  const absoluteDirectory = path.join(repositoryRoot, relativeDirectory);
  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .flatMap((entry) => {
      const relativePath = toPortablePath(
        path.join(relativeDirectory, entry.name),
      );
      if (entry.isDirectory()) {
        return listGeneratedFiles(repositoryRoot, relativePath);
      }
      if (!entry.isFile() || !lstatSync(path.join(repositoryRoot, relativePath)).isFile()) {
        throw new Error(`generated path is not a regular file: ${relativePath}`);
      }
      return [relativePath];
    })
    .sort(stableCompare);
}

function assertExactGeneratedFiles(
  actual: readonly string[],
  context: "tracked" | "working-tree",
) {
  const actualNames = new Set(actual);
  const expectedNames = new Set<string>(CONVEX_GENERATED_FILES);
  for (const expected of CONVEX_GENERATED_FILES) {
    if (!actualNames.has(expected)) {
      throw new Error(`missing ${context} generated file: ${expected}`);
    }
  }
  for (const fileName of actual) {
    if (!expectedNames.has(fileName)) {
      throw new Error(`unexpected generated file: ${fileName}`);
    }
  }
}

function createStableFileDigest(
  repositoryRoot: string,
  relativePaths: readonly string[],
) {
  const hash = createHash("sha256");
  for (const relativePath of [...relativePaths].sort(stableCompare)) {
    hash.update(relativePath);
    hash.update("\0");
    hash.update(readFileSync(path.join(repositoryRoot, relativePath)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function createIntegrityDigests(options: ConvexGeneratedIntegrityOptions) {
  return {
    generatedClientSha256: createStableFileDigest(
      options.repositoryRoot,
      CONVEX_GENERATED_CLIENT_FILES,
    ),
    generatedModelSha256: createStableFileDigest(
      options.repositoryRoot,
      CONVEX_GENERATED_MODEL_FILES,
    ),
    schemaRegistrySha256: createConvexSchemaRegistryDigest(options),
  } satisfies ConvexIntegrityDigests;
}

export function verifyConvexGeneratedIntegrity(
  options: ConvexGeneratedIntegrityOptions,
) {
  validateConvexSchemaContract(options);
  const trackedFiles = runGit(options.repositoryRoot, [
    "ls-files",
    "-z",
    "--",
    "convex/_generated",
  ])
    .split("\0")
    .filter(Boolean)
    .sort(stableCompare);
  assertExactGeneratedFiles(trackedFiles, "tracked");

  const files = listGeneratedFiles(options.repositoryRoot);
  assertExactGeneratedFiles(files, "working-tree");
  const status = runGit(options.repositoryRoot, [
    "status",
    "--short",
    "--untracked-files=all",
    "--",
    "convex/_generated",
  ]);
  if (status !== "") {
    throw new Error("generated files differ from the checked-out commit");
  }

  return {
    digests: createIntegrityDigests(options),
    files,
  };
}

function assertDigestMatch(
  actual: string,
  expected: string,
  context: string,
) {
  if (actual !== expected) {
    throw new Error(`${context} digest changed after verification`);
  }
}

export function verifyConvexPostBuildIntegrity(
  options: ConvexPostBuildIntegrityOptions,
) {
  const headBefore = runGit(options.repositoryRoot, ["rev-parse", "HEAD"]).trim();
  if (headBefore !== options.commitSha) {
    throw new Error("HEAD does not match the verified commit");
  }

  const generated = verifyConvexGeneratedIntegrity(options);
  assertDigestMatch(
    generated.digests.schemaRegistrySha256,
    options.expectedDigests.schemaRegistrySha256,
    "schema registry",
  );
  assertDigestMatch(
    generated.digests.generatedClientSha256,
    options.expectedDigests.generatedClientSha256,
    "generated client",
  );
  assertDigestMatch(
    generated.digests.generatedModelSha256,
    options.expectedDigests.generatedModelSha256,
    "generated model",
  );

  const expectedIdentity = renderConvexReleaseIdentity(
    options.commitSha,
    options.environment,
    options.previewName,
    options.previewProbeTokenSha256,
    options.previewProbeExpiresAt,
  );
  const actualIdentity = readFileSync(
    path.join(options.repositoryRoot, CONVEX_RELEASE_IDENTITY_PATH),
    "utf8",
  );
  if (actualIdentity !== expectedIdentity) {
    throw new Error("Convex release identity does not match the verified build");
  }

  assertControlledConvexReleaseIdentityChange(
    runGit(options.repositoryRoot, [
      "status",
      "--short",
      "--untracked-files=all",
    ]),
  );
  const headAfter = runGit(options.repositoryRoot, ["rev-parse", "HEAD"]).trim();
  if (headAfter !== options.commitSha || headAfter !== headBefore) {
    throw new Error("HEAD changed during post-build verification");
  }

  return {
    commitSha: headAfter,
    digests: generated.digests,
    files: generated.files,
  };
}
