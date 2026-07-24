import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ConvexProductionRollbackSignalGuard,
  createConvexProductionForcedRollbackReceipt,
  createConvexProductionRollbackOnlyPlan,
  executeConvexProductionRollbackOnly,
  readConvexProductionForcedRollbackArguments,
  readConvexProductionForcedRollbackInputBytes,
  readPassingConvexProductionForcedRollbackReceipt,
  writeConvexProductionReceipt,
} from "../../scripts/lib/convex-production-deployment";
import { createConvexProductionGenesisReceipt } from "../../scripts/lib/convex-production-bootstrap";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const candidateSha = "0123456789abcdef0123456789abcdef01234567";
const knownGoodSha = "f".repeat(40);
const priorKnownGoodSha = "e".repeat(40);
const target = {
  deploymentName: "careful-otter-123",
  deploymentUrl: "https://careful-otter-123.convex.cloud",
};
const environment = {
  CONVEX_DEPLOY_KEY:
    "prod:careful-otter-123|opaque-production-secret",
  SOURCERA_COMMIT_SHA: candidateSha,
  SOURCERA_CONVEX_CANARY_SECRET: "c".repeat(32),
  SOURCERA_ENV: "production",
  SOURCERA_KNOWN_GOOD_SHA: knownGoodSha,
  SOURCERA_RELEASE_APPROVED_SHA: candidateSha,
};
const githubRunId = 7001;

function canaryFor(commitSha: string) {
  return {
    assertions: [
      {
        assertion: "reactive-observation-p95" as const,
        commitSha,
        deployment: target.deploymentName,
        environment: "production",
        observationLatencyMs: 210,
        result: "passed" as const,
      },
      {
        assertion: "reactive-observation-p99" as const,
        commitSha,
        deployment: target.deploymentName,
        environment: "production",
        observationLatencyMs: 420,
        result: "passed" as const,
      },
    ],
    outcome: "passed" as const,
    runtimeIdentity: {
      buildCommitSha: commitSha,
      deploymentName: target.deploymentName,
    },
    sampleCount: 20,
    zeroCustomerData: true as const,
  };
}

function historicalReceipt() {
  return {
    approvedSha: knownGoodSha,
    canary: canaryFor(knownGoodSha),
    checkedAt: "2026-07-15T17:00:00.000Z",
    event: "convex_production_deployment_receipt",
    knownGoodReceiptSha256: "a".repeat(64),
    knownGoodSha: priorKnownGoodSha,
    result: "passed",
    rollbackAnchor: {
      canary: canaryFor(priorKnownGoodSha),
      knownGoodSha: priorKnownGoodSha,
      result: "passed",
    },
    schemaVersion: 1,
    target,
  };
}

function approvalReceipt() {
  return {
    approval: {
      reviewer: { id: 15627406, login: "meetblakey" },
      state: "approved",
    },
    approvedSha: candidateSha,
    checkedAt: "2026-07-15T18:00:00.000Z",
    environment: "sourcera-production-release",
    event: "github_production_release_approval_receipt",
    repository: "meetblakey/sourcera",
    result: "passed",
    run: { attempt: 1, headSha: candidateSha, id: githubRunId },
    schemaVersion: 1,
    sourceProofSha256: "d".repeat(64),
  };
}

async function genesisReceipt(approvalReceiptSha256: string) {
  let monotonic = 0;
  let nonce = 0;
  return await createConvexProductionGenesisReceipt(
    {
      approvedCandidateSha: candidateSha,
      canarySecret: environment.SOURCERA_CONVEX_CANARY_SECRET,
      checkout: {
        candidateSha,
        clean: true,
        knownGoodIsAncestor: true,
        knownGoodSha,
      },
      github: {
        approvalReceiptSha256,
        environment: "sourcera-production-release",
        headSha: candidateSha,
        runAttempt: 1,
        runId: githubRunId,
      },
      knownGoodSha,
      target,
    },
    {
      monotonicNow: () => {
        const value = monotonic;
        monotonic += 10;
        return value;
      },
      now: () => Date.parse("2026-07-15T18:00:00.000Z"),
      query: async () => null,
      randomId: () => `forced-rollback-genesis-${String(++nonce)}`,
    },
  );
}

test("rollback-only planning binds the current candidate to exact known-good steps", () => {
  const plan = createConvexProductionRollbackOnlyPlan(
    environment,
    target,
    candidateSha,
  );

  assert.equal(plan.candidateSha, candidateSha);
  assert.equal(plan.knownGoodSha, knownGoodSha);
  assert.deepEqual(
    plan.steps.map((step) => [step.name, step.credential]),
    [
      ["install", "none"],
      ["deploy", "deploy"],
      ["canary", "canary"],
    ],
  );
  assert.deepEqual(plan.steps[1].arguments.slice(-2), [
    "--message",
    knownGoodSha,
  ]);
  assert.equal(JSON.stringify(plan).includes("opaque-production-secret"), false);
  assert.equal(JSON.stringify(plan).includes("c".repeat(32)), false);
});

test("rollback-only input validates the exact external receipt bytes and release binding", () => {
  const receiptBytes = Buffer.from(
    `${JSON.stringify(historicalReceipt(), null, 2)}\n`,
  );
  const receiptSha256 = createHash("sha256")
    .update(receiptBytes)
    .digest("hex");

  const validated = readConvexProductionForcedRollbackInputBytes(
    receiptBytes,
    undefined,
    {
      candidateSha,
      knownGoodReceiptSha256: receiptSha256,
      knownGoodSha,
      target,
    },
  );

  assert.equal(validated.knownGoodReceiptSha256, receiptSha256);
  assert.deepEqual(validated.receipt, historicalReceipt());

  const tamperedBytes = Buffer.from(receiptBytes);
  tamperedBytes[tamperedBytes.length - 2] = 0x20;
  assert.throws(
    () =>
      readConvexProductionForcedRollbackInputBytes(
        tamperedBytes,
        undefined,
        {
          candidateSha,
          knownGoodReceiptSha256: receiptSha256,
          knownGoodSha,
          target,
        },
      ),
    /exact known-good receipt bytes do not match/i,
  );
  assert.throws(() =>
    readConvexProductionForcedRollbackInputBytes(receiptBytes, undefined, {
      candidateSha: knownGoodSha,
      knownGoodReceiptSha256: receiptSha256,
      knownGoodSha,
      target,
    }),
  );
  assert.throws(() =>
    readConvexProductionForcedRollbackInputBytes(receiptBytes, undefined, {
      candidateSha,
      knownGoodReceiptSha256: receiptSha256,
      knownGoodSha,
      target: {
        deploymentName: "wrong-deployment-456",
        deploymentUrl: "https://wrong-deployment-456.convex.cloud",
      },
    }),
  );
});

test("rollback-only input accepts genesis only with exact current approval bytes", async () => {
  const approvalBytes = Buffer.from(
    `${JSON.stringify(approvalReceipt(), null, 2)}\n`,
  );
  const approvalReceiptSha256 = createHash("sha256")
    .update(approvalBytes)
    .digest("hex");
  const genesis = await genesisReceipt(approvalReceiptSha256);
  const genesisBytes = Buffer.from(`${JSON.stringify(genesis, null, 2)}\n`);
  const knownGoodReceiptSha256 = createHash("sha256")
    .update(genesisBytes)
    .digest("hex");
  const expected = {
    candidateSha,
    githubRepository: "meetblakey/sourcera" as const,
    githubRunAttempt: 1,
    githubRunId,
    knownGoodReceiptSha256,
    knownGoodSha,
    target,
  };

  const validated = readConvexProductionForcedRollbackInputBytes(
    genesisBytes,
    approvalBytes,
    expected,
  );
  assert.deepEqual(validated.receipt, genesis);
  assert.equal(validated.kind, "genesis");
  assert.equal(validated.approvalReceiptSha256, approvalReceiptSha256);
  assert.throws(() =>
    readConvexProductionForcedRollbackInputBytes(
      genesisBytes,
      undefined,
      expected,
    ),
  );
  assert.throws(() =>
    readConvexProductionForcedRollbackInputBytes(
      genesisBytes,
      Buffer.concat([approvalBytes, Buffer.from("\n")]),
      expected,
    ),
  );
  for (const drift of [
    { candidateSha: "a".repeat(40) },
    { githubRepository: "someone/else" },
    { githubRunAttempt: 2 },
    { githubRunId: githubRunId + 1 },
  ]) {
    assert.throws(() =>
      readConvexProductionForcedRollbackInputBytes(
        genesisBytes,
        approvalBytes,
        { ...expected, ...drift },
      ),
    );
  }
});

test("rollback-only normal input forbids a current approval receipt", () => {
  const receiptBytes = Buffer.from(
    `${JSON.stringify(historicalReceipt(), null, 2)}\n`,
  );
  const knownGoodReceiptSha256 = createHash("sha256")
    .update(receiptBytes)
    .digest("hex");
  assert.throws(() =>
    readConvexProductionForcedRollbackInputBytes(
      receiptBytes,
      Buffer.from(`${JSON.stringify(approvalReceipt())}\n`),
      {
        candidateSha,
        knownGoodReceiptSha256,
        knownGoodSha,
        target,
      },
    ),
  );
});

test("rollback-only execution uses one detached known-good checkout and proves it live", async () => {
  const plan = createConvexProductionRollbackOnlyPlan(
    environment,
    target,
    candidateSha,
  );
  const events: string[] = [];

  const result = await executeConvexProductionRollbackOnly(plan, {
    cleanupCheckout() {
      events.push("cleanup");
    },
    async executeStep(release, step) {
      events.push(
        `${release.knownGoodSha}:${step.name}:${step.credential}`,
      );
      return step.name === "canary" ? canaryFor(knownGoodSha) : undefined;
    },
    prepareCheckout(commitSha) {
      events.push(`detached-clean-checkout:${commitSha}`);
    },
  });

  assert.deepEqual(result, {
    canary: canaryFor(knownGoodSha),
    checkout: {
      cleanBeforeInstall: true,
      commitSha: knownGoodSha,
      detached: true,
    },
    result: "known_good_restored",
  });
  assert.deepEqual(events, [
    `detached-clean-checkout:${knownGoodSha}`,
    `${knownGoodSha}:install:none`,
    `${knownGoodSha}:deploy:deploy`,
    `${knownGoodSha}:canary:canary`,
    "cleanup",
  ]);
});

test("rollback-only execution fails closed and cleans up when proof fails", async () => {
  const plan = createConvexProductionRollbackOnlyPlan(
    environment,
    target,
    candidateSha,
  );
  const events: string[] = [];

  await assert.rejects(
    executeConvexProductionRollbackOnly(plan, {
      cleanupCheckout() {
        events.push("cleanup");
      },
      async executeStep(_release, step) {
        events.push(step.name);
        if (step.name === "canary") return canaryFor(candidateSha);
        return undefined;
      },
      prepareCheckout() {
        events.push("checkout");
      },
    }),
    /canary receipt does not match/,
  );
  assert.deepEqual(events, [
    "checkout",
    "install",
    "deploy",
    "canary",
    "cleanup",
  ]);
});

test("rollback signal guard cancels only before provider mutation", () => {
  const beforeMutation = new ConvexProductionRollbackSignalGuard();
  assert.equal(beforeMutation.record("SIGTERM"), true);
  assert.equal(beforeMutation.signal, "SIGTERM");
  assert.equal(beforeMutation.mutationStarted, false);

  const afterMutation = new ConvexProductionRollbackSignalGuard();
  afterMutation.beginProviderMutation();
  assert.equal(afterMutation.record("SIGINT"), false);
  assert.equal(afterMutation.record("SIGTERM"), false);
  assert.equal(afterMutation.signal, "SIGINT");
  assert.equal(afterMutation.mutationStarted, true);
});

test("forced rollback receipt proves exact known-good live and writes once outside the repo", () => {
  const fixtureRoot = mkdtempSync(
    path.join(tmpdir(), "sourcera-convex-forced-rollback-"),
  );
  const receiptPath = path.join(fixtureRoot, "receipt.json");
  const receipt = createConvexProductionForcedRollbackReceipt({
    candidateSha,
    canary: canaryFor(knownGoodSha),
    checkedAt: "2026-07-15T18:00:00.000Z",
    interruptedBy: "SIGTERM",
    knownGoodReceiptSha256: "b".repeat(64),
    knownGoodSha,
    target,
  });

  try {
    assert.equal(receipt.result, "known_good_restored");
    assert.equal(receipt.promotionAllowed, false);
    assert.equal(receipt.interruptedBy, "SIGTERM");
    writeConvexProductionReceipt(receiptPath, receipt, repositoryRoot);
    assert.deepEqual(JSON.parse(readFileSync(receiptPath, "utf8")), receipt);
    assert.equal(statSync(receiptPath).mode & 0o777, 0o600);
    assert.throws(
      () =>
        writeConvexProductionReceipt(receiptPath, receipt, repositoryRoot),
      /already exists/,
    );
    const schemaDriftPath = path.join(fixtureRoot, "schema-drift.json");
    assert.throws(() =>
      writeConvexProductionReceipt(
        schemaDriftPath,
        { ...receipt, extra: true },
        repositoryRoot,
      ),
    );
    assert.equal(existsSync(schemaDriftPath), false);
    assert.throws(() =>
      createConvexProductionForcedRollbackReceipt({
        ...receipt,
        canary: canaryFor(candidateSha),
      }),
    );
  } finally {
    rmSync(fixtureRoot, { force: true, recursive: true });
  }
});

test("forced rollback receipt includes the exact genesis approval hash", () => {
  const approvalReceiptSha256 = "c".repeat(64);
  const receipt = createConvexProductionForcedRollbackReceipt({
    approvalReceiptSha256,
    candidateSha,
    canary: canaryFor(knownGoodSha),
    checkedAt: "2026-07-15T18:01:00.000Z",
    interruptedBy: null,
    knownGoodReceiptKind: "genesis",
    knownGoodReceiptSha256: "b".repeat(64),
    knownGoodSha,
    target,
  });

  assert.equal(receipt.knownGoodReceiptKind, "genesis");
  assert.equal(receipt.approvalReceiptSha256, approvalReceiptSha256);
  assert.throws(() =>
    writeConvexProductionReceipt(
      path.join(tmpdir(), `invalid-genesis-${process.pid}.json`),
      { ...receipt, approvalReceiptSha256: undefined },
      repositoryRoot,
    ),
  );
  assert.throws(() =>
    writeConvexProductionReceipt(
      path.join(tmpdir(), `invalid-normal-${process.pid}.json`),
      {
        ...receipt,
        approvalReceiptSha256,
        knownGoodReceiptKind: undefined,
      },
      repositoryRoot,
    ),
  );
});

test("forced rollback receipt reader binds the exact release and genesis approval", () => {
  const approvalReceiptSha256 = "c".repeat(64);
  const receipt = createConvexProductionForcedRollbackReceipt({
    approvalReceiptSha256,
    candidateSha,
    canary: canaryFor(knownGoodSha),
    checkedAt: "2026-07-15T18:01:00.000Z",
    interruptedBy: null,
    knownGoodReceiptKind: "genesis",
    knownGoodReceiptSha256: "b".repeat(64),
    knownGoodSha,
    target,
  });
  const expected = {
    approvalReceiptSha256,
    candidateSha,
    knownGoodReceiptSha256: "b".repeat(64),
    knownGoodSha,
    target,
  };

  assert.equal(
    readPassingConvexProductionForcedRollbackReceipt(receipt, expected),
    receipt,
  );
  for (const invalid of [
    { ...expected, candidateSha: "d".repeat(40) },
    { ...expected, knownGoodSha: "d".repeat(40) },
    { ...expected, knownGoodReceiptSha256: "d".repeat(64) },
    { ...expected, approvalReceiptSha256: "d".repeat(64) },
    {
      ...expected,
      target: { ...target, deploymentName: "other-production" },
    },
  ]) {
    assert.throws(() =>
      readPassingConvexProductionForcedRollbackReceipt(receipt, invalid),
    );
  }
  assert.throws(() =>
    readPassingConvexProductionForcedRollbackReceipt(receipt, {
      candidateSha,
      knownGoodReceiptSha256: "b".repeat(64),
      knownGoodSha,
      target,
    }),
  );
});

test("forced rollback arguments require external immutable input and output", () => {
  const fixtureRoot = mkdtempSync(
    path.join(tmpdir(), "sourcera-convex-forced-rollback-arguments-"),
  );
  const inputPath = path.join(fixtureRoot, "known-good.json");
  const approvalPath = path.join(fixtureRoot, "approval.json");
  const outputPath = path.join(fixtureRoot, "rollback.json");
  const receiptSha256 = "b".repeat(64);
  writeFileSync(inputPath, "{}\n", "utf8");
  writeFileSync(approvalPath, "{}\n", "utf8");

  try {
    assert.deepEqual(
      readConvexProductionForcedRollbackArguments(
        [
          "--known-good-receipt",
          inputPath,
          "--known-good-receipt-sha256",
          receiptSha256,
          "--receipt-out",
          outputPath,
        ],
        repositoryRoot,
      ),
      {
        knownGoodReceiptPath: realpathSync(inputPath),
        knownGoodReceiptSha256: receiptSha256,
        receiptOutputPath: path.join(realpathSync(fixtureRoot), "rollback.json"),
      },
    );
    assert.deepEqual(
      readConvexProductionForcedRollbackArguments(
        [
          "--known-good-receipt",
          inputPath,
          "--known-good-receipt-sha256",
          receiptSha256,
          "--approval-receipt",
          approvalPath,
          "--receipt-out",
          outputPath,
        ],
        repositoryRoot,
      ),
      {
        approvalReceiptPath: realpathSync(approvalPath),
        knownGoodReceiptPath: realpathSync(inputPath),
        knownGoodReceiptSha256: receiptSha256,
        receiptOutputPath: path.join(realpathSync(fixtureRoot), "rollback.json"),
      },
    );
    assert.throws(() =>
      readConvexProductionForcedRollbackArguments(
        [
          "--known-good-receipt",
          inputPath,
          "--known-good-receipt-sha256",
          receiptSha256,
          "--approval-receipt",
          path.join(repositoryRoot, "package.json"),
          "--receipt-out",
          outputPath,
        ],
        repositoryRoot,
      ),
    );
    assert.throws(() =>
      readConvexProductionForcedRollbackArguments(
        [
          "--known-good-receipt",
          inputPath,
          "--known-good-receipt-sha256",
          receiptSha256,
          "--approval-receipt",
          inputPath,
          "--receipt-out",
          outputPath,
        ],
        repositoryRoot,
      ),
    );
    assert.throws(() =>
      readConvexProductionForcedRollbackArguments(
        [
          "--known-good-receipt",
          path.join(repositoryRoot, "package.json"),
          "--known-good-receipt-sha256",
          receiptSha256,
          "--receipt-out",
          outputPath,
        ],
        repositoryRoot,
      ),
    );
    writeFileSync(outputPath, "existing\n", "utf8");
    assert.throws(() =>
      readConvexProductionForcedRollbackArguments(
        [
          "--known-good-receipt",
          inputPath,
          "--known-good-receipt-sha256",
          receiptSha256,
          "--receipt-out",
          outputPath,
        ],
        repositoryRoot,
      ),
    );
    assert.equal(existsSync(outputPath), true);
  } finally {
    rmSync(fixtureRoot, { force: true, recursive: true });
  }
});

test("rollback CLI owns a detached checkout, isolated steps, and signal-safe finalization", () => {
  const source = readFileSync(
    path.join(repositoryRoot, "scripts/rollback-convex-production.ts"),
    "utf8",
  );

  assert.match(source, /\["worktree", "add", "--detach"/);
  assert.match(source, /--untracked-files=all/);
  assert.match(source, /createConvexProductionStepEnvironment/);
  assert.match(source, /beginProviderMutation/);
  assert.match(source, /approvalReceiptBytes/);
  assert.match(source, /GITHUB_RUN_ATTEMPT/);
  assert.match(source, /writeConvexProductionReceipt/);
  assert.doesNotMatch(source, /spawnSync\([^)]*convex/s);
});
