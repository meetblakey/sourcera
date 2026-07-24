import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  createCommitBoundConvexPreviewName,
  createConvexFoundationHealthResult,
  createConvexPreviewName,
  createConvexProductionProbePayload,
  readRequiredConvexDeploymentIdentity,
  readRequiredConvexProductionIdentity,
  readRequiredConvexPreviewClientIdentity,
  readRequiredConvexPreviewIdentity,
} from "../../packages/domain/src/convex";
import {
  createConvexProductionStepEnvironment,
  createConvexProductionDeploymentPlan,
  createConvexProductionFailureReceipt,
  executeConvexProductionDeployment,
  executeConvexProductionDeploymentAsync,
  readPassingConvexProductionCanaryReceipt,
  readPassingKnownGoodConvexReceipt,
  writeConvexProductionReceipt,
} from "../../scripts/lib/convex-production-deployment";
import {
  assertControlledConvexReleaseIdentityChange,
  assertConvexReleaseIdentityPlaceholder,
  renderConvexReleaseIdentity,
} from "../../scripts/lib/convex-release-identity";
import { readPinnedConvexProductionTarget } from "../../scripts/lib/convex-production-target";
import { createConvexVercelDeploymentPlan } from "../../scripts/lib/convex-vercel-deployment";

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
const productionEnvironment = {
  CONVEX_DEPLOY_KEY:
    "prod:careful-otter-123|opaque-production-secret",
  NEXT_PUBLIC_CONVEX_URL: "https://careful-otter-123.convex.cloud",
  SOURCERA_COMMIT_SHA: commitSha,
  SOURCERA_CONVEX_CANARY_SECRET: "c".repeat(32),
  SOURCERA_ENV: "production",
  SOURCERA_KNOWN_GOOD_SHA: "f".repeat(40),
  SOURCERA_RELEASE_APPROVED_SHA: commitSha,
};
const productionTarget = {
  deploymentName: "careful-otter-123",
  deploymentUrl: "https://careful-otter-123.convex.cloud",
};

function productionCanaryFor(releaseSha: string) {
  return {
    assertions: [
      {
        assertion: "reactive-observation-p95" as const,
        commitSha: releaseSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 210,
        result: "passed" as const,
      },
      {
        assertion: "reactive-observation-p99" as const,
        commitSha: releaseSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 420,
        result: "passed" as const,
      },
    ],
    outcome: "passed" as const,
    runtimeIdentity: {
      buildCommitSha: releaseSha,
      deploymentName: productionTarget.deploymentName,
    },
    sampleCount: 20,
    zeroCustomerData: true as const,
  };
}

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

test("a Convex production identity is commit-bound and excludes the deploy key", () => {
  const identity = readRequiredConvexProductionIdentity(
    productionEnvironment,
    productionTarget,
  );

  assert.deepEqual(identity, {
    commitSha,
    deploymentName: "careful-otter-123",
    deploymentUrl: "https://careful-otter-123.convex.cloud",
    environment: "production",
  });
  assert.equal("deployKey" in identity, false);
  assert.deepEqual(
    readRequiredConvexDeploymentIdentity(productionEnvironment, productionTarget),
    identity,
  );
});

test("Convex production validation fails closed on target ambiguity", () => {
  const invalidEnvironments = [
    { ...productionEnvironment, CONVEX_DEPLOY_KEY: undefined },
    {
      ...productionEnvironment,
      CONVEX_DEPLOY_KEY:
        "preview:sourcera-production:sourcera|opaque-preview-secret",
    },
    {
      ...productionEnvironment,
      CONVEX_DEPLOY_KEY:
        "prod:wrong-deployment-456|opaque-production-secret",
    },
    { ...productionEnvironment, CONVEX_PREVIEW_NAME: "stale-preview" },
    { ...productionEnvironment, CONVEX_DEPLOYMENT: "prod:careful-otter-123" },
    { ...productionEnvironment, SOURCERA_ENV: "staging" },
    { ...productionEnvironment, SOURCERA_RELEASE_APPROVED_SHA: undefined },
    {
      ...productionEnvironment,
      SOURCERA_RELEASE_APPROVED_SHA: "a".repeat(40),
    },
    {
      ...productionEnvironment,
      NEXT_PUBLIC_CONVEX_URL: "https://wrong-deployment-456.convex.cloud",
    },
  ];

  for (const environment of invalidEnvironments) {
    assert.throws(
      () => readRequiredConvexProductionIdentity(environment, productionTarget),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.doesNotMatch(error.message, /opaque-production-secret/);
        return true;
      },
    );
  }
});

test("Vercel previews deploy Convex while production only builds pinned clients", () => {
  const previewPlan = createConvexVercelDeploymentPlan(
    {
      ...previewEnvironment,
      CONVEX_PREVIEW_NAME: undefined,
      NEXT_PUBLIC_CONVEX_URL: undefined,
      VERCEL_GIT_COMMIT_SHA: commitSha,
      VERCEL_GIT_PULL_REQUEST_ID: "1",
      VERCEL: "1",
      VERCEL_ENV: "preview",
    },
    "@sourcera/buyer",
    commitSha,
    productionTarget,
  );
  assert.equal(previewPlan.mode, "preview");
  assert.equal(previewPlan.target, `sourcera-pr-1-${commitSha}`);
  assert.deepEqual(
    previewPlan.steps[0].arguments.slice(0, 4),
    ["convex", "deploy", "--preview-name", `sourcera-pr-1-${commitSha}`],
  );

  const productionPlan = createConvexVercelDeploymentPlan(
    {
      ...productionEnvironment,
      CONVEX_DEPLOY_KEY: undefined,
      SOURCERA_CONVEX_CANARY_SECRET: undefined,
      NEXT_PUBLIC_CONVEX_URL: undefined,
      VERCEL_GIT_COMMIT_SHA: commitSha,
      VERCEL_GIT_COMMIT_REF: undefined,
      VERCEL: "1",
      VERCEL_ENV: "production",
    },
    "@sourcera/seller",
    commitSha,
    productionTarget,
  );
  assert.equal(productionPlan.mode, "production-client");
  assert.equal(productionPlan.target, "careful-otter-123");
  assert.deepEqual(
    productionPlan.steps.map((step) => [step.command, ...step.arguments]),
    [
      ["npx", "tsx", "scripts/validate-convex-env.ts", "--phase", "client"],
      ["npm", "run", "build", "--workspace", "@sourcera/seller"],
    ],
  );
  assert.equal(
    JSON.stringify(productionPlan).includes("convex\",\"deploy"),
    false,
  );
  assert.equal(
    productionPlan.environmentOverrides.NEXT_PUBLIC_CONVEX_URL,
    productionTarget.deploymentUrl,
  );
});

test("Vercel production rejects backend keys, environment disagreement, and stale source", () => {
  const base = {
    ...productionEnvironment,
    CONVEX_DEPLOY_KEY: undefined,
    SOURCERA_CONVEX_CANARY_SECRET: undefined,
    NEXT_PUBLIC_CONVEX_URL: undefined,
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_GIT_COMMIT_SHA: commitSha,
  };
  const invalid = [
    { ...base, CONVEX_DEPLOY_KEY: productionEnvironment.CONVEX_DEPLOY_KEY },
    {
      ...base,
      SOURCERA_CONVEX_CANARY_SECRET:
        productionEnvironment.SOURCERA_CONVEX_CANARY_SECRET,
    },
    { ...base, VERCEL: undefined },
    { ...base, VERCEL_ENV: "preview" },
  ];
  for (const environment of invalid) {
    assert.throws(
      () =>
        createConvexVercelDeploymentPlan(
          environment,
          null,
          commitSha,
          productionTarget,
        ),
    );
  }
  assert.throws(
    () =>
      createConvexVercelDeploymentPlan(
        base,
        null,
        "a".repeat(40),
        productionTarget,
      ),
    /VERCEL_GIT_COMMIT_SHA must match the checked-out Git commit/,
  );
});

test("central production deploy mutates Convex once, then runs a protected canary", () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );

  assert.deepEqual(plan.steps[0], {
    arguments: ["ci", "--ignore-scripts"],
    command: "npm",
    credential: "none",
    name: "install",
  });
  assert.deepEqual(plan.steps[1], {
    arguments: [
      "convex",
      "deploy",
      "--codegen",
      "disable",
      "--typecheck",
      "enable",
      "--message",
      commitSha,
    ],
    command: "npx",
    credential: "deploy",
    name: "deploy",
  });
  assert.equal(plan.steps[2].name, "canary");
  assert.equal(plan.steps[2].credential, "canary");
  assert.deepEqual(plan.steps[2].arguments, [
    "run",
    "--silent",
    "convex:probe",
  ]);
  assert.equal(
    plan.steps[2].environmentOverrides?.NEXT_PUBLIC_CONVEX_URL,
    productionTarget.deploymentUrl,
  );
  assert.equal(JSON.stringify(plan).includes("opaque-production-secret"), false);
  assert.equal(JSON.stringify(plan).includes("c".repeat(32)), false);
});

test("a failed candidate canary redeploys and proves the validated known-good release", () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );
  const events: string[] = [];
  const knownGoodCanary = {
    assertions: [
      {
        assertion: "reactive-observation-p95" as const,
        commitSha: plan.knownGoodSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 210,
        result: "passed" as const,
      },
      {
        assertion: "reactive-observation-p99" as const,
        commitSha: plan.knownGoodSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 420,
        result: "passed" as const,
      },
    ],
    outcome: "passed" as const,
    runtimeIdentity: {
      buildCommitSha: plan.knownGoodSha,
      deploymentName: productionTarget.deploymentName,
    },
    sampleCount: 20,
    zeroCustomerData: true as const,
  };

  const result = executeConvexProductionDeployment(plan, {
    cleanupCheckout() {
      events.push("cleanup");
    },
    executeStep(release, step) {
      events.push(
        `${release.approvedSha}:${step.name}:${step.credential}:${step.arguments.join(" ")}`,
      );
      if (step.name === "canary" && release.approvedSha === commitSha) {
        throw new Error("candidate canary failed");
      }
      return step.name === "canary" ? knownGoodCanary : undefined;
    },
    prepareCheckout(sha) {
      events.push(`checkout:${sha}`);
    },
  });

  assert.equal(result.result, "candidate_failed_rolled_back");
  assert.equal(result.promotionAllowed, false);
  assert.deepEqual(result.candidate, {
    approvedSha: commitSha,
    failedStep: "canary",
    result: "failed",
  });
  assert.deepEqual(result.rollbackAnchor, {
    canary: knownGoodCanary,
    knownGoodSha: plan.knownGoodSha,
    result: "passed",
  });
  assert.deepEqual(result.rollback, {
    canary: knownGoodCanary,
    knownGoodSha: plan.knownGoodSha,
    result: "passed",
  });
  assert.deepEqual(events, [
    `checkout:${plan.knownGoodSha}`,
    `${plan.knownGoodSha}:install:none:ci --ignore-scripts`,
    `${plan.knownGoodSha}:canary:canary:run --silent convex:probe`,
    "cleanup",
    `checkout:${commitSha}`,
    `${commitSha}:install:none:ci --ignore-scripts`,
    `${commitSha}:deploy:deploy:convex deploy --codegen disable --typecheck enable --message ${commitSha}`,
    `${commitSha}:canary:canary:run --silent convex:probe`,
    "cleanup",
    `checkout:${plan.knownGoodSha}`,
    `${plan.knownGoodSha}:install:none:ci --ignore-scripts`,
    `${plan.knownGoodSha}:deploy:deploy:convex deploy --codegen disable --typecheck enable --message ${plan.knownGoodSha}`,
    `${plan.knownGoodSha}:canary:canary:run --silent convex:probe`,
    "cleanup",
  ]);
});

test("rollback failure remains non-promotable and cleans the detached checkout", () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );
  const events: string[] = [];
  let knownGoodCanaryRuns = 0;
  const knownGoodCanary = {
    assertions: [
      {
        assertion: "reactive-observation-p95" as const,
        commitSha: plan.knownGoodSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 210,
        result: "passed" as const,
      },
      {
        assertion: "reactive-observation-p99" as const,
        commitSha: plan.knownGoodSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 420,
        result: "passed" as const,
      },
    ],
    outcome: "passed" as const,
    runtimeIdentity: {
      buildCommitSha: plan.knownGoodSha,
      deploymentName: productionTarget.deploymentName,
    },
    sampleCount: 20,
    zeroCustomerData: true as const,
  };

  assert.throws(
    () =>
      executeConvexProductionDeployment(plan, {
        cleanupCheckout() {
          events.push("cleanup");
        },
        executeStep(release, step) {
          events.push(`${release.approvedSha}:${step.name}`);
          if (step.name !== "canary") return undefined;
          if (release.approvedSha === commitSha) {
            throw new Error("canary failed");
          }
          knownGoodCanaryRuns += 1;
          if (knownGoodCanaryRuns > 1) {
            throw new Error("rollback canary failed");
          }
          return knownGoodCanary;
        },
        prepareCheckout(sha) {
          events.push(`checkout:${sha}`);
        },
      }),
    /known-good Convex rollback failed/,
  );
  assert.deepEqual(events.slice(-2), [
    `${plan.knownGoodSha}:canary`,
    "cleanup",
  ]);
});

test("a mutation-ambiguous candidate deploy error automatically proves rollback", () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );
  const events: string[] = [];
  const knownGoodCanary = productionCanaryFor(plan.knownGoodSha);

  const result = executeConvexProductionDeployment(plan, {
    cleanupCheckout() {
      events.push("cleanup");
    },
    executeStep(release, step) {
      events.push(`${release.approvedSha}:${step.name}`);
      if (release.approvedSha === commitSha && step.name === "deploy") {
        throw new Error("deploy command failed after provider contact");
      }
      return step.name === "canary" ? knownGoodCanary : undefined;
    },
    prepareCheckout(sha) {
      events.push(`checkout:${sha}`);
    },
  });

  assert.equal(result.result, "candidate_failed_rolled_back");
  assert.deepEqual(result.candidate, {
    approvedSha: commitSha,
    failedStep: "deploy",
    result: "failed",
  });
  assert.equal(events.includes(`${commitSha}:canary`), false);
  assert.equal(
    events.filter(
      (event) => event === `${plan.knownGoodSha}:deploy`,
    ).length,
    1,
  );
  assert.equal(
    events.filter(
      (event) => event === `${plan.knownGoodSha}:canary`,
    ).length,
    2,
  );
});

test("an interrupted async candidate deploy waits for a proved known-good rollback", async () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );
  const events: string[] = [];
  let interrupted = false;

  const result = await executeConvexProductionDeploymentAsync(plan, {
    cleanupCheckout() {
      events.push("cleanup");
    },
    async executeStep(release, step) {
      events.push(`${release.approvedSha}:${step.name}`);
      await Promise.resolve();
      if (release.approvedSha === commitSha && step.name === "deploy") {
        interrupted = true;
        throw new Error("candidate deploy interrupted after provider contact");
      }
      if (
        interrupted &&
        release.approvedSha === plan.knownGoodSha &&
        step.name === "deploy"
      ) {
        events.push("rollback-not-cancelled");
      }
      return step.name === "canary"
        ? productionCanaryFor(release.approvedSha)
        : undefined;
    },
    prepareCheckout(sha) {
      events.push(`checkout:${sha}`);
    },
  });

  assert.equal(result.result, "candidate_failed_rolled_back");
  assert.equal(result.promotionAllowed, false);
  assert.equal(events.includes("rollback-not-cancelled"), true);
  assert.equal(
    events.filter(
      (event) => event === `${plan.knownGoodSha}:canary`,
    ).length,
    2,
  );
});

test("a deploy-error rollback failure stays non-promotable", () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );
  let knownGoodDeploys = 0;

  assert.throws(
    () =>
      executeConvexProductionDeployment(plan, {
        cleanupCheckout() {},
        executeStep(release, step) {
          if (step.name === "canary") {
            return productionCanaryFor(release.approvedSha);
          }
          if (step.name === "deploy") {
            if (release.approvedSha === commitSha) {
              throw new Error("candidate deploy failed");
            }
            knownGoodDeploys += 1;
            throw new Error("rollback deploy failed");
          }
          return undefined;
        },
        prepareCheckout() {},
      }),
    /known-good Convex rollback failed/,
  );
  assert.equal(knownGoodDeploys, 1);
});

test("a failed live known-good baseline blocks before candidate mutation", () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );
  const events: string[] = [];

  assert.throws(
    () =>
      executeConvexProductionDeployment(plan, {
        cleanupCheckout() {
          events.push("cleanup");
        },
        executeStep(release, step) {
          events.push(`${release.approvedSha}:${step.name}`);
          if (step.name === "canary") {
            throw new Error("baseline canary failed");
          }
          return undefined;
        },
        prepareCheckout(sha) {
          events.push(`checkout:${sha}`);
        },
      }),
    /live known-good Convex baseline failed/,
  );
  assert.deepEqual(events, [
    `checkout:${plan.knownGoodSha}`,
    `${plan.knownGoodSha}:install`,
    `${plan.knownGoodSha}:canary`,
    "cleanup",
  ]);
  assert.equal(events.some((event) => event.includes(":deploy")), false);
});

test("production step environments expose only the credential required by that step", () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );
  const source = {
    ...process.env,
    ...productionEnvironment,
    DATABASE_URL: "postgres://must-not-reach-child-processes",
    HOME: "/safe/home",
    LANG: "en_US.UTF-8",
    PATH: "/safe/bin",
    TMPDIR: "/safe/tmp",
    UNRELATED_API_KEY: "must-not-reach-child-processes",
    UNRELATED_SAFE_VALUE: "preserved",
  };
  const credentials = {
    canarySecret: productionEnvironment.SOURCERA_CONVEX_CANARY_SECRET,
    deployKey: productionEnvironment.CONVEX_DEPLOY_KEY,
  };

  const install = createConvexProductionStepEnvironment(
    source,
    plan.steps[0],
    credentials,
    plan.approvedSha,
  );
  const deploy = createConvexProductionStepEnvironment(
    source,
    plan.steps[1],
    credentials,
    plan.approvedSha,
  );
  const canary = createConvexProductionStepEnvironment(
    source,
    plan.steps[2],
    credentials,
    plan.approvedSha,
  );

  assert.equal(install.CONVEX_DEPLOY_KEY, undefined);
  assert.equal(install.SOURCERA_CONVEX_CANARY_SECRET, undefined);
  assert.equal(install.DATABASE_URL, undefined);
  assert.equal(install.UNRELATED_API_KEY, undefined);
  assert.equal(install.UNRELATED_SAFE_VALUE, undefined);
  assert.equal(deploy.CONVEX_DEPLOY_KEY, credentials.deployKey);
  assert.equal(deploy.SOURCERA_CONVEX_CANARY_SECRET, undefined);
  assert.equal(deploy.UNRELATED_API_KEY, undefined);
  assert.equal(canary.CONVEX_DEPLOY_KEY, undefined);
  assert.equal(canary.SOURCERA_CONVEX_CANARY_SECRET, credentials.canarySecret);
  assert.equal(canary.UNRELATED_API_KEY, undefined);
  assert.equal(canary.SOURCERA_COMMIT_SHA, commitSha);
  assert.equal(canary.SOURCERA_RELEASE_APPROVED_SHA, commitSha);
  assert.equal(canary.HOME, undefined);
  assert.equal(canary.LANG, "en_US.UTF-8");
  assert.equal(canary.PATH, "/safe/bin");
  assert.equal(canary.TMPDIR, "/safe/tmp");
});

test("production deploy stamps only the controlled Convex build identity", () => {
  const placeholder =
    'export const SOURCERA_CONVEX_BUILD_COMMIT_SHA =\n  "__UNSTAMPED_CONVEX_BUILD__";\n';
  assert.doesNotThrow(() => assertConvexReleaseIdentityPlaceholder(placeholder));
  assert.equal(
    renderConvexReleaseIdentity(commitSha),
    `export const SOURCERA_CONVEX_BUILD_COMMIT_SHA =\n  "${commitSha}";\n`,
  );
  assert.doesNotThrow(() =>
    assertControlledConvexReleaseIdentityChange(
      " M convex/releaseIdentity.ts\n",
    ),
  );
  assert.throws(() =>
    assertControlledConvexReleaseIdentityChange(
      " M convex/releaseIdentity.ts\n M convex/foundation.ts\n",
    ),
  );
  assert.throws(() =>
    assertConvexReleaseIdentityPlaceholder(renderConvexReleaseIdentity(commitSha)),
  );
});

test("production deploy accepts only a canary read back from the compiled release", () => {
  const plan = createConvexProductionDeploymentPlan(
    productionEnvironment,
    productionTarget,
    commitSha,
  );
  const receipt = {
    assertions: [
      {
        assertion: "reactive-observation-p95",
        commitSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 220,
        result: "passed",
      },
      {
        assertion: "reactive-observation-p99",
        commitSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 480,
        result: "passed",
      },
    ],
    outcome: "passed",
    runtimeIdentity: {
      buildCommitSha: commitSha,
      deploymentName: productionTarget.deploymentName,
    },
    sampleCount: 20,
    zeroCustomerData: true,
  };
  assert.deepEqual(
    readPassingConvexProductionCanaryReceipt(receipt, plan),
    receipt,
  );
  assert.throws(() =>
    readPassingConvexProductionCanaryReceipt(
      {
        ...receipt,
        runtimeIdentity: {
          ...receipt.runtimeIdentity,
          buildCommitSha: "a".repeat(40),
        },
      },
      plan,
    ),
  );
  assert.throws(() =>
    readPassingConvexProductionCanaryReceipt(
      { ...receipt, sampleCount: 19 },
      plan,
    ),
  );
  assert.throws(() =>
    readPassingConvexProductionCanaryReceipt(
      {
        ...receipt,
        assertions: [receipt.assertions[0], receipt.assertions[0]],
      },
      plan,
    ),
  );
  assert.throws(() =>
    readPassingConvexProductionCanaryReceipt(
      {
        ...receipt,
        runtimeIdentity: {
          ...receipt.runtimeIdentity,
          deploymentName: "wrong-deployment-456",
        },
      },
      plan,
    ),
  );
  const knownGoodSha = "e".repeat(40);
  const rollbackCanary = {
    ...receipt,
    assertions: receipt.assertions.map((assertion) => ({
      ...assertion,
      commitSha: knownGoodSha,
    })),
    runtimeIdentity: {
      ...receipt.runtimeIdentity,
      buildCommitSha: knownGoodSha,
    },
  };
  const deploymentReceipt = {
    approvedSha: commitSha,
    canary: receipt,
    checkedAt: "2026-07-15T17:00:00.000Z",
    event: "convex_production_deployment_receipt",
    knownGoodReceiptSha256: "a".repeat(64),
    knownGoodSha,
    result: "passed",
    rollbackAnchor: {
      canary: rollbackCanary,
      knownGoodSha,
      result: "passed",
    },
    schemaVersion: 1,
    target: productionTarget,
  };
  assert.deepEqual(
    readPassingKnownGoodConvexReceipt(
      deploymentReceipt,
      commitSha,
      productionTarget,
    ),
    deploymentReceipt,
  );
  assert.throws(() =>
    readPassingKnownGoodConvexReceipt(
      { ...deploymentReceipt, rollbackAnchor: undefined },
      commitSha,
      productionTarget,
    ),
  );
  assert.throws(() =>
    readPassingKnownGoodConvexReceipt(
      deploymentReceipt,
      "a".repeat(40),
      productionTarget,
    ),
  );
});

test("central production deploy rejects stale, shared, or Vercel credentials", () => {
  const invalid = [
    {
      ...productionEnvironment,
      SOURCERA_CONVEX_CANARY_SECRET: "short",
    },
    { ...productionEnvironment, SOURCERA_COMMIT_SHA: "a".repeat(40) },
    { ...productionEnvironment, SOURCERA_KNOWN_GOOD_SHA: "main" },
    { ...productionEnvironment, SOURCERA_KNOWN_GOOD_SHA: commitSha },
    { ...productionEnvironment, VERCEL: "1" },
  ];
  for (const environment of invalid) {
    assert.throws(() =>
      createConvexProductionDeploymentPlan(
        environment,
        productionTarget,
        commitSha,
      ),
    );
  }
});

test("production target pins are complete, exact, and independent of credentials", () => {
  assert.deepEqual(
    readPinnedConvexProductionTarget({ convexProduction: productionTarget }),
    productionTarget,
  );
  for (const value of [
    {},
    { convexProduction: { deploymentName: null, deploymentUrl: null } },
    {
      convexProduction: {
        deploymentName: "careful-otter-123",
        deploymentUrl: "https://careful-otter-123.extra.convex.cloud",
      },
    },
  ]) {
    assert.throws(() => readPinnedConvexProductionTarget(value));
  }
});

test("canonical production deploy stays blocked until live target evidence is pinned", () => {
  const fixturePrefix = path.join(
    tmpdir(),
    `sourcera-convex-target-test-${process.pid}`,
  );
  const execution = spawnSync(
    "npx",
    [
      "tsx",
      "scripts/deploy-convex-production.ts",
      "--known-good-receipt",
      `${fixturePrefix}-known.json`,
      "--receipt-out",
      `${fixturePrefix}-out.json`,
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, SOURCERA_ENV: "production" },
    },
  );

  assert.notEqual(execution.status, 0);
  assert.match(execution.stderr, /Convex production target is not repo-pinned/);
});

test("production deploy requires durable proof output and rejects unknown or duplicate arguments", () => {
  const missingOutput = spawnSync(
    "npx",
    ["tsx", "scripts/deploy-convex-production.ts"],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, SOURCERA_ENV: "production" },
    },
  );
  assert.notEqual(missingOutput.status, 0);
  assert.match(missingOutput.stderr, /--receipt-out is required/);

  for (const arguments_ of [
    ["--unknown", "/tmp/value"],
    [
      "--receipt-out",
      "/tmp/first.json",
      "--receipt-out",
      "/tmp/second.json",
    ],
  ]) {
    const execution = spawnSync(
      "npx",
      ["tsx", "scripts/deploy-convex-production.ts", ...arguments_],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, SOURCERA_ENV: "production" },
      },
    );
    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /Unknown production deploy option|only once/);
  }
});

test("production deploy cannot write a passing receipt into its source checkout", () => {
  const execution = spawnSync(
    "npx",
    [
      "tsx",
      "scripts/deploy-convex-production.ts",
      "--receipt-out",
      "reports/evidence/unsafe-production-receipt.json",
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, SOURCERA_ENV: "production" },
    },
  );

  assert.notEqual(execution.status, 0);
  assert.match(execution.stderr, /must be outside the repository checkout/);
});

test("production deploy rejects a known-good receipt controlled by the candidate checkout", () => {
  const execution = spawnSync(
    "npx",
    [
      "tsx",
      "scripts/deploy-convex-production.ts",
      "--known-good-receipt",
      "reports/evidence/untrusted-known-good-receipt.json",
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, SOURCERA_ENV: "production" },
    },
  );

  assert.notEqual(execution.status, 0);
  assert.match(
    execution.stderr,
    /--known-good-receipt must be outside the repository checkout/,
  );
});

test("production deploy rejects an external receipt symlink into the candidate checkout", () => {
  const fixtureRoot = mkdtempSync(
    path.join(tmpdir(), "sourcera-known-good-receipt-"),
  );
  const receiptLink = path.join(fixtureRoot, "known-good.json");
  try {
    symlinkSync(path.join(repositoryRoot, "package.json"), receiptLink);
    const execution = spawnSync(
      "npx",
      [
        "tsx",
        "scripts/deploy-convex-production.ts",
        "--known-good-receipt",
        receiptLink,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, SOURCERA_ENV: "production" },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(
      execution.stderr,
      /--known-good-receipt must be outside the repository checkout/,
    );
  } finally {
    rmSync(fixtureRoot, { force: true, recursive: true });
  }
});

test("production deploy preserves the independent known-good receipt", () => {
  const receiptPath = path.join(
    tmpdir(),
    "sourcera-shared-convex-receipt.json",
  );
  const execution = spawnSync(
    "npx",
    [
      "tsx",
      "scripts/deploy-convex-production.ts",
      "--known-good-receipt",
      receiptPath,
      "--receipt-out",
      receiptPath,
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, SOURCERA_ENV: "production" },
    },
  );

  assert.notEqual(execution.status, 0);
  assert.match(execution.stderr, /receipt paths must be distinct/);
});

test("production deploy never overwrites an existing evidence receipt", () => {
  const fixtureRoot = mkdtempSync(
    path.join(tmpdir(), "sourcera-convex-receipt-output-"),
  );
  const receiptPath = path.join(fixtureRoot, "existing.json");
  try {
    writeFileSync(receiptPath, "independent evidence\n", "utf8");
    const execution = spawnSync(
      "npx",
      [
        "tsx",
        "scripts/deploy-convex-production.ts",
        "--receipt-out",
        receiptPath,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, SOURCERA_ENV: "production" },
      },
    );

    assert.notEqual(execution.status, 0);
    assert.match(execution.stderr, /--receipt-out must not already exist/);
    assert.equal(
      readFileSync(receiptPath, "utf8"),
      "independent evidence\n",
    );
  } finally {
    rmSync(fixtureRoot, { force: true, recursive: true });
  }
});

test("the Convex receipt writer is atomic, private, complete-only, and non-overwriting", () => {
  const fixtureRoot = mkdtempSync(
    path.join(tmpdir(), "sourcera-convex-receipt-writer-"),
  );
  const receiptPath = path.join(fixtureRoot, "receipt.json");
  const knownGoodSha = productionEnvironment.SOURCERA_KNOWN_GOOD_SHA;
  const rollbackCanary = {
    assertions: [
      {
        assertion: "reactive-observation-p95",
        commitSha: knownGoodSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 210,
        result: "passed",
      },
      {
        assertion: "reactive-observation-p99",
        commitSha: knownGoodSha,
        deployment: productionTarget.deploymentName,
        environment: "production",
        observationLatencyMs: 420,
        result: "passed",
      },
    ],
    outcome: "passed",
    runtimeIdentity: {
      buildCommitSha: knownGoodSha,
      deploymentName: productionTarget.deploymentName,
    },
    sampleCount: 20,
    zeroCustomerData: true,
  };
  const receipt = {
    candidate: {
      approvedSha: commitSha,
      failedStep: "canary",
      result: "failed",
    },
    checkedAt: "2026-07-15T12:00:00.000Z",
    event: "convex_production_rollback_receipt",
    promotionAllowed: false,
    result: "candidate_failed_rolled_back",
    rollback: {
      canary: rollbackCanary,
      knownGoodReceiptSha256: "a".repeat(64),
      knownGoodSha,
      result: "passed",
    },
    rollbackAnchor: {
      canary: rollbackCanary,
      knownGoodSha,
      result: "passed",
    },
    schemaVersion: 1,
    target: productionTarget,
  };

  try {
    writeConvexProductionReceipt(receiptPath, receipt, repositoryRoot);
    assert.deepEqual(JSON.parse(readFileSync(receiptPath, "utf8")), receipt);
    assert.equal(statSync(receiptPath).mode & 0o777, 0o600);
    assert.deepEqual(readdirSync(fixtureRoot), ["receipt.json"]);
    assert.throws(
      () => writeConvexProductionReceipt(receiptPath, receipt, repositoryRoot),
      /already exists/,
    );
    assert.deepEqual(readdirSync(fixtureRoot), ["receipt.json"]);

    const partialPath = path.join(fixtureRoot, "partial.json");
    assert.throws(
      () =>
        writeConvexProductionReceipt(
          partialPath,
          {
            ...receipt,
            rollback: { ...receipt.rollback, canary: undefined },
          },
          repositoryRoot,
        ),
      /complete Convex production receipt/,
    );
    assert.equal(existsSync(partialPath), false);

    const failurePath = path.join(fixtureRoot, "failure.json");
    const failureReceipt = {
      approvedSha: commitSha,
      checkedAt: "2026-07-15T12:01:00.000Z",
      event: "convex_production_failure_receipt",
      failureStage: "rollback",
      knownGoodReceiptSha256: "a".repeat(64),
      knownGoodSha,
      promotionAllowed: false,
      result: "rollback_failed",
      rollbackAnchor: {
        canary: rollbackCanary,
        knownGoodSha,
        result: "passed",
      },
      schemaVersion: 1,
      target: productionTarget,
    };
    writeConvexProductionReceipt(
      failurePath,
      failureReceipt,
      repositoryRoot,
    );
    assert.deepEqual(
      JSON.parse(readFileSync(failurePath, "utf8")),
      failureReceipt,
    );
    assert.equal(statSync(failurePath).mode & 0o777, 0o600);

    const baselineFailurePath = path.join(
      fixtureRoot,
      "baseline-failure.json",
    );
    const baselineFailureReceipt = {
      approvedSha: commitSha,
      checkedAt: "2026-07-15T12:02:00.000Z",
      event: "convex_production_failure_receipt",
      failureStage: "baseline",
      knownGoodReceiptSha256: "a".repeat(64),
      knownGoodSha,
      promotionAllowed: false,
      result: "baseline_failed",
      schemaVersion: 1,
      target: productionTarget,
    };
    writeConvexProductionReceipt(
      baselineFailurePath,
      baselineFailureReceipt,
      repositoryRoot,
    );
    assert.deepEqual(
      JSON.parse(readFileSync(baselineFailurePath, "utf8")),
      baselineFailureReceipt,
    );
  } finally {
    rmSync(fixtureRoot, { force: true, recursive: true });
  }
});

test("interruption receipts require the live rollback anchor after provider mutation", () => {
  const knownGoodSha = productionEnvironment.SOURCERA_KNOWN_GOOD_SHA;
  const rollbackAnchor = {
    canary: productionCanaryFor(knownGoodSha),
    knownGoodSha,
    result: "passed" as const,
  };
  const beforeMutation = createConvexProductionFailureReceipt({
    approvedSha: commitSha,
    checkedAt: "2026-07-15T12:03:00.000Z",
    failureStage: "signal",
    knownGoodReceiptSha256: null,
    knownGoodSha,
    result: "interrupted_before_mutation",
    target: productionTarget,
  });
  assert.equal(beforeMutation.promotionAllowed, false);
  assert.equal("rollbackAnchor" in beforeMutation, false);

  assert.throws(() =>
    createConvexProductionFailureReceipt({
      approvedSha: commitSha,
      checkedAt: "2026-07-15T12:04:00.000Z",
      failureStage: "signal",
      knownGoodReceiptSha256: "a".repeat(64),
      knownGoodSha,
      result: "interrupted_after_mutation",
      target: productionTarget,
    }),
  );
  const afterMutation = createConvexProductionFailureReceipt({
    approvedSha: commitSha,
    checkedAt: "2026-07-15T12:05:00.000Z",
    failureStage: "signal",
    knownGoodReceiptSha256: "a".repeat(64),
    knownGoodSha,
    result: "interrupted_after_mutation",
    rollbackAnchor,
    target: productionTarget,
  });
  assert.deepEqual(afterMutation.rollbackAnchor, rollbackAnchor);
  assert.equal(afterMutation.promotionAllowed, false);
});

test("production probe authorization binds operation, release, and nonce", () => {
  assert.equal(
    createConvexProductionProbePayload("record", {
      commitSha,
      deploymentName: productionTarget.deploymentName,
      environment: "production",
      issuedAt: 1_784_131_937_000,
      nonceHash: "a".repeat(64),
      releaseApprovedSha: commitSha,
      sample: 1,
    }),
    [
      "record",
      commitSha,
      productionTarget.deploymentName,
      "production",
      "1784131937000",
      "a".repeat(64),
      commitSha,
      "1",
    ].join("\n"),
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

test("Convex production health telemetry names the pinned deployment", () => {
  const result = createConvexFoundationHealthResult(
    productionEnvironment,
    {
      assertion: "reactive-observation-p95",
      observationLatencyMs: 214,
      result: "passed",
    },
    new Date("2026-07-15T00:00:00.000Z"),
    productionTarget,
  );

  assert.deepEqual(result, {
    assertion: "reactive-observation-p95",
    checkedAt: "2026-07-15T00:00:00.000Z",
    commitSha,
    deployment: "careful-otter-123",
    environment: "production",
    event: "convex_foundation_health_result",
    observationLatencyMs: 214,
    result: "passed",
  });
  assert.doesNotMatch(JSON.stringify(result), /opaque-production-secret/);
});

test("Preview predeploy validation preserves its pinned metadata shape", () => {
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
  assert.deepEqual(JSON.parse(execution.stdout), {
    commitSha,
    environment: "staging",
    phase: "predeploy",
    previewName: `sourcera-pr-1-${commitSha}`,
    result: "passed",
  });
  assert.doesNotMatch(execution.stdout + execution.stderr, /opaque-preview-secret/);
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
    vercelDeploymentPlanner,
    productionDeploy,
    productionFoundation,
    releaseIdentity,
    productionTargets,
    productionRunbook,
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
    readFile(
      path.join(repositoryRoot, "scripts/lib/convex-vercel-deployment.ts"),
      "utf8",
    ),
    readFile(
      path.join(repositoryRoot, "scripts/deploy-convex-production.ts"),
      "utf8",
    ),
    readFile(path.join(repositoryRoot, "convex/foundation.ts"), "utf8"),
    readFile(path.join(repositoryRoot, "convex/releaseIdentity.ts"), "utf8"),
    readFile(
      path.join(repositoryRoot, "config/production-targets.json"),
      "utf8",
    ),
    readFile(
      path.join(repositoryRoot, "docs/runbooks/convex-production.md"),
      "utf8",
    ),
  ]);

  assert.match(packageJson, /"convex:codegen"/);
  assert.match(packageJson, /"convex:deploy:production"/);
  assert.match(packageJson, /"convex:probe"/);
  assert.match(packageJson, /run-convex-vercel-build\.ts/);
  assert.match(workflow, /CONVEX_DEPLOY_KEY/);
  assert.match(workflow, /convex deploy/);
  assert.match(workflow, /--preview-name/);
  assert.match(workflow, /github\.sha/);
  assert.match(workflow, /npm run convex:probe/);
  assert.match(environmentExample, /^CONVEX_DEPLOY_KEY=$/m);
  assert.match(environmentExample, /^SOURCERA_CONVEX_CANARY_SECRET=$/m);
  assert.match(environmentExample, /^CONVEX_EXPECTED_PROJECT=$/m);
  assert.match(environmentExample, /^SOURCERA_RELEASE_APPROVED_SHA=$/m);
  assert.match(environmentExample, /^SOURCERA_KNOWN_GOOD_SHA=$/m);
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
  assert.match(probe, /api\.foundation\.recordProductionProbe/);
  assert.match(probe, /createHmac/);
  assert.doesNotMatch(probe, /setAdminAuth/);
  assert.doesNotMatch(probe, /setInterval/);
  assert.match(vercelBuild, /readPinnedConvexProductionTarget/);
  assert.doesNotMatch(vercelBuild, /spawnSync\("git"/);
  assert.match(vercelDeploymentPlanner, /VERCEL_GIT_PULL_REQUEST_ID/);
  assert.match(vercelDeploymentPlanner, /sourcera-pr-/);
  assert.match(
    vercelDeploymentPlanner,
    /createCommitBoundConvexPreviewName/,
  );
  assert.match(vercelDeploymentPlanner, /NEXT_PUBLIC_CONVEX_URL/);
  assert.match(vercelDeploymentPlanner, /CONVEX_DEPLOY_KEY is forbidden/);
  assert.match(productionDeploy, /createConvexProductionDeploymentPlan/);
  assert.match(productionDeploy, /\["worktree", "add", "--detach"/);
  assert.match(productionDeploy, /assertControlledConvexReleaseIdentityChange/);
  assert.match(productionDeploy, /createConvexProductionBaseEnvironment/);
  assert.match(productionDeploy, /releaseConfigHome/);
  assert.match(productionDeploy, /releaseNpmUserConfig/);
  assert.match(productionDeploy, /recordRollbackAnchor/);
  assert.match(productionDeploy, /writeConvexProductionReceipt/);
  assert.match(productionDeploy, /executeConvexProductionDeploymentAsync/);
  assert.match(productionDeploy, /--untracked-files=all/);
  assert.match(productionDeploy, /rollback_required/);
  assert.match(productionFoundation, /SOURCERA_CONVEX_BUILD_COMMIT_SHA/);
  assert.match(productionFoundation, /getDeploymentMetadata/);
  assert.match(releaseIdentity, /__UNSTAMPED_CONVEX_BUILD__/);
  assert.match(productionTargets, /"deploymentName": null/);
  assert.match(productionRunbook, /npm run vercel:stage:production/);
  assert.match(productionRunbook, /--known-good-receipt/);
  assert.match(productionRunbook, /--receipt-out/);
  assert.match(productionRunbook, /vercel promote/);
  assert.match(productionRunbook, /vercel rollback/);
  assert.match(productionRunbook, /SOURCERA_RELEASE_APPROVED_SHA/);
});

test("Vercel rejects metadata that does not match the checked-out source", () => {
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
        VERCEL: "1",
        VERCEL_ENV: "preview",
      },
    },
  );

  assert.notEqual(execution.status, 0);
  assert.match(
    execution.stderr,
    /VERCEL_GIT_COMMIT_SHA must match the checked-out Git commit/,
  );
});

test("predeploy rejects timer-based Convex query polling", () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_polling_violation_test__.ts",
  );
  try {
    writeFileSync(
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
    rmSync(fixturePath, { force: true });
  }
});

test("predeploy rejects recursive Convex query polling", () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_recursive_polling_test__.ts",
  );
  try {
    writeFileSync(
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
    rmSync(fixturePath, { force: true });
  }
});

test("predeploy rejects recursive arrow-function polling", () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_arrow_polling_test__.ts",
  );
  try {
    writeFileSync(
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
    rmSync(fixturePath, { force: true });
  }
});

test("predeploy rejects window interval Convex polling", () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_window_polling_test__.ts",
  );
  try {
    writeFileSync(
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
    rmSync(fixturePath, { force: true });
  }
});

test("predeploy allows an unrelated query timer", () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__non_convex_query_timer_test__.ts",
  );
  try {
    writeFileSync(
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
    rmSync(fixturePath, { force: true });
  }
});

test("predeploy rejects a named Convex query interval callback", () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_named_interval_test__.ts",
  );
  try {
    writeFileSync(
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
    rmSync(fixturePath, { force: true });
  }
});

test("predeploy rejects a named arrow Convex query interval callback", () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_named_arrow_interval_test__.ts",
  );
  try {
    writeFileSync(
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
    rmSync(fixturePath, { force: true });
  }
});

test("predeploy rejects a function-expression Convex query interval callback", () => {
  const fixturePath = path.join(
    repositoryRoot,
    "app/__convex_function_expression_interval_test__.ts",
  );
  try {
    writeFileSync(
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
    rmSync(fixturePath, { force: true });
  }
});
