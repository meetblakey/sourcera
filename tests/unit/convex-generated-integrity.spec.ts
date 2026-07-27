import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  CONVEX_GENERATED_FILES,
  verifyConvexGeneratedIntegrity,
  verifyConvexPostBuildIntegrity,
} from "../../scripts/lib/convex-build-integrity";
import { renderConvexReleaseIdentity } from "../../scripts/lib/convex-release-identity";

const registeredFragmentFiles = ["foundationProbes.ts"] as const;
const previewProbeTokenSha256 = "9".repeat(64);
const previewProbeExpiresAt = 1_800_000_900_000;

function git(repositoryRoot: string, args: readonly string[]) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim();
}

function createFixture() {
  const repositoryRoot = mkdtempSync(
    path.join(tmpdir(), "sourcera-convex-integrity-"),
  );
  mkdirSync(path.join(repositoryRoot, "convex/_generated"), {
    recursive: true,
  });
  mkdirSync(path.join(repositoryRoot, "convex/schema"), { recursive: true });
  for (const [index, relativePath] of CONVEX_GENERATED_FILES.entries()) {
    writeFileSync(
      path.join(repositoryRoot, relativePath),
      `generated:${relativePath}:${index}\n`,
    );
  }
  writeFileSync(
    path.join(repositoryRoot, "convex/schema.ts"),
    'export { schemaTables as default } from "./schema/registry";\n',
  );
  writeFileSync(
    path.join(repositoryRoot, "convex/schema/registry.ts"),
    'export { default as foundationProbes } from "./foundationProbes";\n',
  );
  writeFileSync(
    path.join(repositoryRoot, "convex/schema/foundationProbes.ts"),
    "export default {};\n",
  );
  writeFileSync(
    path.join(repositoryRoot, "convex/releaseIdentity.ts"),
    'export const SOURCERA_CONVEX_BUILD_COMMIT_SHA: string =\n  "__UNSTAMPED_CONVEX_BUILD__";\nexport const SOURCERA_CONVEX_BUILD_ENVIRONMENT: string =\n  "__UNSTAMPED_CONVEX_ENVIRONMENT__";\nexport const SOURCERA_CONVEX_BUILD_PREVIEW_NAME: string =\n  "__UNSTAMPED_CONVEX_PREVIEW_NAME__";\n',
  );
  writeFileSync(
    path.join(repositoryRoot, "tsconfig.json"),
    '{"compilerOptions":{"moduleResolution":"Bundler"}}\n',
  );
  git(repositoryRoot, ["init", "--initial-branch=main"]);
  git(repositoryRoot, ["config", "user.email", "test@sourcera.local"]);
  git(repositoryRoot, ["config", "user.name", "Sourcera Test"]);
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-m", "fixture"]);
  return repositoryRoot;
}

test("generated integrity binds the exact tracked file set to stable digests", () => {
  const repositoryRoot = createFixture();
  try {
    const first = verifyConvexGeneratedIntegrity({
      registeredFragmentFiles,
      repositoryRoot,
    });
    const second = verifyConvexGeneratedIntegrity({
      registeredFragmentFiles,
      repositoryRoot,
    });

    assert.deepEqual(first.files, [...CONVEX_GENERATED_FILES]);
    assert.deepEqual(first.digests, second.digests);
    assert.match(first.digests.schemaRegistrySha256, /^[a-f0-9]{64}$/);
    assert.match(first.digests.generatedClientSha256, /^[a-f0-9]{64}$/);
    assert.match(first.digests.generatedModelSha256, /^[a-f0-9]{64}$/);
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("generated integrity rejects an untracked generated file", () => {
  const repositoryRoot = createFixture();
  try {
    writeFileSync(
      path.join(repositoryRoot, "convex/_generated/unexpected.js"),
      "export {};\n",
    );
    assert.throws(
      () =>
        verifyConvexGeneratedIntegrity({
          registeredFragmentFiles,
          repositoryRoot,
        }),
      /unexpected generated file: convex\/_generated\/unexpected\.js/,
    );
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("generated integrity requires every canonical file to remain tracked", () => {
  const repositoryRoot = createFixture();
  try {
    git(repositoryRoot, [
      "rm",
      "--cached",
      "convex/_generated/dataModel.d.ts",
    ]);
    assert.throws(
      () =>
        verifyConvexGeneratedIntegrity({
          registeredFragmentFiles,
          repositoryRoot,
        }),
      /missing tracked generated file: convex\/_generated\/dataModel\.d\.ts/,
    );
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("generated integrity rejects a dirty tracked generated file", () => {
  const repositoryRoot = createFixture();
  try {
    const generatedPath = path.join(
      repositoryRoot,
      "convex/_generated/api.js",
    );
    writeFileSync(generatedPath, `${readFileSync(generatedPath, "utf8")}drift\n`);
    assert.throws(
      () =>
        verifyConvexGeneratedIntegrity({
          registeredFragmentFiles,
          repositoryRoot,
        }),
      /generated files differ from the checked-out commit/,
    );
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("post-build integrity permits only the exact stamped release identity", () => {
  const repositoryRoot = createFixture();
  try {
    const commitSha = git(repositoryRoot, ["rev-parse", "HEAD"]);
    const previewName = `sourcera-main-${commitSha}`;
    const generated = verifyConvexGeneratedIntegrity({
      registeredFragmentFiles,
      repositoryRoot,
    });
    writeFileSync(
      path.join(repositoryRoot, "convex/releaseIdentity.ts"),
      renderConvexReleaseIdentity(
        commitSha,
        "preview",
        previewName,
        previewProbeTokenSha256,
        previewProbeExpiresAt,
      ),
    );

    const result = verifyConvexPostBuildIntegrity({
      commitSha,
      environment: "preview",
      expectedDigests: generated.digests,
      previewName,
      previewProbeExpiresAt,
      previewProbeTokenSha256,
      registeredFragmentFiles,
      repositoryRoot,
    });
    assert.equal(result.commitSha, commitSha);
    assert.deepEqual(result.digests, generated.digests);
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("post-build integrity rejects any second working-tree change", () => {
  const repositoryRoot = createFixture();
  try {
    const commitSha = git(repositoryRoot, ["rev-parse", "HEAD"]);
    const previewName = `sourcera-main-${commitSha}`;
    const generated = verifyConvexGeneratedIntegrity({
      registeredFragmentFiles,
      repositoryRoot,
    });
    writeFileSync(
      path.join(repositoryRoot, "convex/releaseIdentity.ts"),
      renderConvexReleaseIdentity(
        commitSha,
        "preview",
        previewName,
        previewProbeTokenSha256,
        previewProbeExpiresAt,
      ),
    );
    writeFileSync(path.join(repositoryRoot, "untracked.txt"), "drift\n");

    assert.throws(
      () =>
        verifyConvexPostBuildIntegrity({
          commitSha,
          environment: "preview",
          expectedDigests: generated.digests,
          previewName,
          previewProbeExpiresAt,
          previewProbeTokenSha256,
          registeredFragmentFiles,
          repositoryRoot,
        }),
      /uncontrolled change/,
    );
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("post-build integrity rejects changed source or verification digests", () => {
  const repositoryRoot = createFixture();
  try {
    const commitSha = git(repositoryRoot, ["rev-parse", "HEAD"]);
    const previewName = `sourcera-main-${commitSha}`;
    const generated = verifyConvexGeneratedIntegrity({
      registeredFragmentFiles,
      repositoryRoot,
    });
    writeFileSync(
      path.join(repositoryRoot, "convex/releaseIdentity.ts"),
      renderConvexReleaseIdentity(
        commitSha,
        "preview",
        previewName,
        previewProbeTokenSha256,
        previewProbeExpiresAt,
      ),
    );

    assert.throws(
      () =>
        verifyConvexPostBuildIntegrity({
          commitSha: "f".repeat(40),
          environment: "preview",
          expectedDigests: generated.digests,
          previewName,
          previewProbeExpiresAt,
          previewProbeTokenSha256,
          registeredFragmentFiles,
          repositoryRoot,
        }),
      /HEAD does not match the verified commit/,
    );
    assert.throws(
      () =>
        verifyConvexPostBuildIntegrity({
          commitSha,
          environment: "preview",
          expectedDigests: {
            ...generated.digests,
            generatedClientSha256: "f".repeat(64),
          },
          previewName,
          previewProbeExpiresAt,
          previewProbeTokenSha256,
          registeredFragmentFiles,
          repositoryRoot,
        }),
      /generated client digest changed after verification/,
    );
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("generated integrity CLI publishes stable GitHub job outputs", () => {
  const outputDirectory = mkdtempSync(
    path.join(tmpdir(), "sourcera-convex-output-"),
  );
  const outputPath = path.join(outputDirectory, "github-output.txt");
  try {
    const execution = execFileSync(
      "npx",
      [
        "tsx",
        "scripts/verify-convex-generated.ts",
        "--write-github-output",
      ],
      {
        cwd: path.resolve(import.meta.dirname, "../.."),
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_ACTIONS: "true",
          GITHUB_OUTPUT: outputPath,
        },
      },
    );
    const result = JSON.parse(execution) as {
      digests: Record<string, string>;
      event: string;
      result: string;
    };
    assert.equal(result.event, "convex_generated_integrity");
    assert.equal(result.result, "passed");
    assert.deepEqual(Object.keys(result.digests).sort(), [
      "generatedClientSha256",
      "generatedModelSha256",
      "schemaRegistrySha256",
    ]);
    assert.equal(
      readFileSync(outputPath, "utf8"),
      `generated-client-sha256=${result.digests.generatedClientSha256}\n` +
        `generated-model-sha256=${result.digests.generatedModelSha256}\n` +
        `schema-registry-sha256=${result.digests.schemaRegistrySha256}\n`,
    );
  } finally {
    rmSync(outputDirectory, { force: true, recursive: true });
  }
});

test("post-build integrity CLI fails closed without verified inputs", () => {
  const execution = spawnSync(
    "npx",
    ["tsx", "scripts/verify-convex-build-integrity.ts"],
    {
      cwd: path.resolve(import.meta.dirname, "../.."),
      encoding: "utf8",
      env: { ...process.env, SOURCERA_COMMIT_SHA: "" },
    },
  );
  assert.notEqual(execution.status, 0);
  assert.match(execution.stderr, /SOURCERA_COMMIT_SHA is required/);
});

test("foundation evidence rechecks the verified post-build source and digests", () => {
  const repositoryRoot = path.resolve(import.meta.dirname, "../..");
  const source = readFileSync(
    path.join(repositoryRoot, "scripts/write-convex-foundation-evidence.ts"),
    "utf8",
  );
  assert.match(source, /verifyConvexPostBuildIntegrity/);
  assert.match(source, /SOURCERA_VERIFIED_GENERATED_CLIENT_SHA256/);
  assert.match(source, /SOURCERA_VERIFIED_GENERATED_MODEL_SHA256/);
  assert.match(source, /SOURCERA_VERIFIED_SCHEMA_REGISTRY_SHA256/);
  assert.doesNotMatch(source, /function hashFiles/);
});
