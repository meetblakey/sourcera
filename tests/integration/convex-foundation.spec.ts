import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  createCommitBoundConvexPreviewName,
  createConvexFoundationHealthResult,
  createConvexPreviewName,
  readRequiredConvexPreviewClientIdentity,
  readRequiredConvexPreviewIdentity,
} from "../../packages/domain/src/convex";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const commitSha = "0123456789abcdef0123456789abcdef01234567";
const previewEnvironment = {
  CONVEX_DEPLOY_KEY:
    "preview:sourcera-production:sourcera|opaque-preview-secret",
  CONVEX_EXPECTED_PROJECT: "sourcera-production/sourcera",
  CONVEX_PREVIEW_NAME: `sourcera-pr-1-${commitSha}`,
  NEXT_PUBLIC_CONVEX_URL: "https://careful-otter-123.convex.cloud",
  SOURCERA_COMMIT_SHA: commitSha,
  SOURCERA_ENV: "staging",
};

test("a Convex Preview identity is commit-bound and excludes the deploy key", () => {
  const identity = readRequiredConvexPreviewIdentity(previewEnvironment);

  assert.deepEqual(identity, {
    commitSha,
    deploymentUrl: "https://careful-otter-123.convex.cloud",
    environment: "staging",
    previewName: `sourcera-pr-1-${commitSha}`,
    project: "sourcera-production/sourcera",
  });
  assert.equal("deployKey" in identity, false);
});

test("Vercel branch and commit metadata produce one safe Preview identity", () => {
  assert.equal(
    createConvexPreviewName("codex/sourcera-delivery-control-plane"),
    "codex-sourcera-delivery-control-plane",
  );
  const identity = readRequiredConvexPreviewIdentity({
    ...previewEnvironment,
    SOURCERA_COMMIT_SHA: undefined,
    VERCEL_GIT_COMMIT_SHA: commitSha,
  });
  assert.equal(identity.commitSha, commitSha);
  assert.equal(
    createCommitBoundConvexPreviewName("sourcera-pr-1", commitSha),
    `sourcera-pr-1-${commitSha}`,
  );
});

test("Convex deployment validation fails closed without leaking secrets", () => {
  const invalidEnvironments = [
    { ...previewEnvironment, CONVEX_DEPLOY_KEY: undefined },
    { ...previewEnvironment, CONVEX_DEPLOY_KEY: "prod:secret" },
    {
      ...previewEnvironment,
      CONVEX_EXPECTED_PROJECT: "wrong-team/wrong-project",
    },
    { ...previewEnvironment, CONVEX_DEPLOYMENT: "prod" },
    { ...previewEnvironment, NEXT_PUBLIC_CONVEX_URL: "http://localhost:3210" },
    { ...previewEnvironment, SOURCERA_COMMIT_SHA: "main" },
    {
      ...previewEnvironment,
      CONVEX_PREVIEW_NAME: `sourcera-pr-1-${"a".repeat(40)}`,
    },
    { ...previewEnvironment, SOURCERA_ENV: "production" },
  ];

  for (const environment of invalidEnvironments) {
    assert.throws(
      () => readRequiredConvexPreviewIdentity(environment),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.doesNotMatch(error.message, /opaque-preview-secret/);
        return true;
      },
    );
  }
});

test("Convex client validation rejects a Preview name for another commit", () => {
  assert.throws(
    () =>
      readRequiredConvexPreviewClientIdentity({
        ...previewEnvironment,
        CONVEX_PREVIEW_NAME: `sourcera-pr-1-${"a".repeat(40)}`,
      }),
    /CONVEX_PREVIEW_NAME must match SOURCERA_COMMIT_SHA/,
  );
});

test("Convex health telemetry contains safe proof metadata only", () => {
  const result = createConvexFoundationHealthResult(
    previewEnvironment,
    {
      assertion: "reactive-observation",
      observationLatencyMs: 214,
      result: "passed",
    },
    new Date("2026-07-15T00:00:00.000Z"),
  );

  assert.deepEqual(result, {
    assertion: "reactive-observation",
    checkedAt: "2026-07-15T00:00:00.000Z",
    commitSha,
    deployment: `sourcera-pr-1-${commitSha}`,
    environment: "staging",
    event: "convex_foundation_health_result",
    observationLatencyMs: 214,
    result: "passed",
  });
  assert.doesNotMatch(JSON.stringify(result), /secret|careful-otter/i);
});

test("all three shells use the shared reactive Convex provider", async () => {
  for (const applicationRoot of [".", "apps/buyer", "apps/seller"]) {
    const providers = await readFile(
      path.join(repositoryRoot, applicationRoot, "app/providers.tsx"),
      "utf8",
    );
    const layout = await readFile(
      path.join(repositoryRoot, applicationRoot, "app/layout.tsx"),
      "utf8",
    );

    assert.match(providers, /ConvexReactClient/);
    assert.match(providers, /ConvexProvider/);
    assert.doesNotMatch(providers, /setInterval|setTimeout/);
    assert.match(layout, /SourceraConvexProvider/);
  }
});

test("CI owns code generation, Preview deployment, and the reactive probe", async () => {
  const [
    packageJson,
    workflow,
    environmentExample,
    probe,
    vercelBuild,
  ] = await Promise.all([
    readFile(path.join(repositoryRoot, "package.json"), "utf8"),
    readFile(
      path.join(repositoryRoot, ".github/workflows/app-ci.yml"),
      "utf8",
    ),
    readFile(path.join(repositoryRoot, ".env.example"), "utf8"),
    readFile(
      path.join(repositoryRoot, "scripts/run-convex-foundation-probe.ts"),
      "utf8",
    ),
    readFile(
      path.join(repositoryRoot, "scripts/run-convex-vercel-build.ts"),
      "utf8",
    ),
  ]);

  assert.match(packageJson, /"convex:codegen"/);
  assert.match(packageJson, /"convex:probe"/);
  assert.match(packageJson, /run-convex-vercel-build\.ts/);
  assert.match(workflow, /CONVEX_DEPLOY_KEY/);
  assert.match(workflow, /convex deploy/);
  assert.match(workflow, /--preview-name/);
  assert.match(workflow, /github\.sha/);
  assert.match(workflow, /npm run convex:probe/);
  assert.match(environmentExample, /^CONVEX_DEPLOY_KEY=$/m);
  assert.match(environmentExample, /^CONVEX_EXPECTED_PROJECT=$/m);
  assert.match(environmentExample, /^CONVEX_PREVIEW_NAME=$/m);
  assert.match(environmentExample, /^NEXT_PUBLIC_CONVEX_URL=$/m);
  assert.doesNotMatch(workflow, /CONVEX_DEPLOYMENT/);
  assert.ok(
    workflow.indexOf("reject drift before cloud deploy") <
      workflow.indexOf("Deploy Convex Preview"),
  );
  assert.match(workflow, /CONVEX_AGENT_MODE: anonymous/);
  assert.match(workflow, /set -o pipefail/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(probe, /onUpdate/);
  assert.doesNotMatch(probe, /setInterval/);
  assert.match(vercelBuild, /convex[\s\S]*deploy/);
  assert.match(vercelBuild, /VERCEL_GIT_PULL_REQUEST_ID/);
  assert.match(vercelBuild, /sourcera-pr-/);
  assert.match(vercelBuild, /createCommitBoundConvexPreviewName/);
  assert.match(vercelBuild, /NEXT_PUBLIC_CONVEX_URL/);
});

test("Vercel rejects mismatched commit metadata before Convex deploy", () => {
  const execution = spawnSync(
    "npx",
    ["tsx", "scripts/run-convex-vercel-build.ts"],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        SOURCERA_COMMIT_SHA: "a".repeat(40),
        VERCEL_GIT_COMMIT_SHA: "b".repeat(40),
        VERCEL_GIT_PULL_REQUEST_ID: "1",
      },
    },
  );

  assert.notEqual(execution.status, 0);
  assert.match(
    execution.stderr,
    /SOURCERA_COMMIT_SHA must match VERCEL_GIT_COMMIT_SHA/,
  );
});

test("predeploy rejects timer-based Convex query polling", async () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_polling_violation_test__.ts",
  );
  try {
    await writeFile(
      fixturePath,
      `import { ConvexHttpClient } from "convex/browser";\nsetInterval(() => client.query(api.foundation.observeProbe, {}), 1000);\n`,
      "utf8",
    );
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/validate-convex-env.ts", "--phase", "predeploy"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, ...previewEnvironment },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /convex_polling_watcher_violation/);
  } finally {
    await rm(fixturePath, { force: true });
  }
});

test("predeploy rejects recursive Convex query polling", async () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_recursive_polling_test__.ts",
  );
  try {
    await writeFile(
      fixturePath,
      `import { ConvexHttpClient } from "convex/browser";\nasync function poll() {\n  await client.query(api.foundation.observeProbe, {});\n  setTimeout(poll, 1000);\n}\nvoid poll();\n`,
      "utf8",
    );
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/validate-convex-env.ts", "--phase", "predeploy"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, ...previewEnvironment },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /convex_polling_watcher_violation/);
  } finally {
    await rm(fixturePath, { force: true });
  }
});

test("predeploy rejects recursive arrow-function polling", async () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_arrow_polling_test__.ts",
  );
  try {
    await writeFile(
      fixturePath,
      `import { ConvexHttpClient } from "convex/browser";\nconst poll = async () => {\n  await client.query(api.foundation.observeProbe, {});\n  setTimeout(poll, 1000);\n};\nvoid poll();\n`,
      "utf8",
    );
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/validate-convex-env.ts", "--phase", "predeploy"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, ...previewEnvironment },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /convex_polling_watcher_violation/);
  } finally {
    await rm(fixturePath, { force: true });
  }
});

test("predeploy rejects window interval Convex polling", async () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_window_polling_test__.ts",
  );
  try {
    await writeFile(
      fixturePath,
      `import { ConvexHttpClient } from "convex/browser";\nwindow.setInterval(() => client.query(api.foundation.observeProbe, {}), 1000);\n`,
      "utf8",
    );
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/validate-convex-env.ts", "--phase", "predeploy"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, ...previewEnvironment },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /convex_polling_watcher_violation/);
  } finally {
    await rm(fixturePath, { force: true });
  }
});

test("predeploy allows an unrelated query timer", async () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__non_convex_query_timer_test__.ts",
  );
  try {
    await writeFile(
      fixturePath,
      `const database = { query: () => null };\nsetInterval(() => database.query(), 1000);\n`,
      "utf8",
    );
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/validate-convex-env.ts", "--phase", "predeploy"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, ...previewEnvironment },
      },
    );

    assert.equal(execution.status, 0, execution.stderr);
  } finally {
    await rm(fixturePath, { force: true });
  }
});

test("predeploy rejects a named Convex query interval callback", async () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_named_interval_test__.ts",
  );
  try {
    await writeFile(
      fixturePath,
      `import { ConvexHttpClient } from "convex/browser";\nasync function refresh() {\n  await client.query(api.foundation.observeProbe, {});\n}\nsetInterval(refresh, 1000);\n`,
      "utf8",
    );
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/validate-convex-env.ts", "--phase", "predeploy"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, ...previewEnvironment },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /convex_polling_watcher_violation/);
  } finally {
    await rm(fixturePath, { force: true });
  }
});

test("predeploy rejects a named arrow Convex query interval callback", async () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_named_arrow_interval_test__.ts",
  );
  try {
    await writeFile(
      fixturePath,
      `import { ConvexHttpClient } from "convex/browser";\nconst refresh = async () => {\n  await client.query(api.foundation.observeProbe, {});\n};\nsetInterval(refresh, 1000);\n`,
      "utf8",
    );
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/validate-convex-env.ts", "--phase", "predeploy"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, ...previewEnvironment },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /convex_polling_watcher_violation/);
  } finally {
    await rm(fixturePath, { force: true });
  }
});

test("predeploy rejects a function-expression Convex query interval callback", async () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_function_expression_interval_test__.ts",
  );
  try {
    await writeFile(
      fixturePath,
      `import { ConvexHttpClient } from "convex/browser";\nconst refresh = async function () {\n  await client.query(api.foundation.observeProbe, {});\n};\nsetInterval(refresh, 1000);\n`,
      "utf8",
    );
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/validate-convex-env.ts", "--phase", "predeploy"],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, ...previewEnvironment },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /convex_polling_watcher_violation/);
  } finally {
    await rm(fixturePath, { force: true });
  }
});
