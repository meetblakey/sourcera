import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, createHmac } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createConvexProductionProbePayload } from "../../packages/domain/src/convex";
import {
  readConvexProductionKnownGoodReceiptBytes,
  readPassingKnownGoodConvexReceipt,
} from "../../scripts/lib/convex-production-deployment";
import {
  createConvexProductionBootstrapEnvironment,
  createConvexProductionGenesisReceipt,
  readConvexProductionBootstrapArguments,
  readCleanConvexProductionBootstrapCheckout,
  readConvexProductionBootstrapEnvironment,
  readGithubProductionApprovalReceipt,
  readPassingConvexProductionGenesisReceipt,
  writeConvexProductionGenesisReceipt,
  type ConvexProductionBootstrapQueryArguments,
} from "../../scripts/lib/convex-production-bootstrap";

const knownGoodSha = "0123456789abcdef0123456789abcdef01234567";
const approvedCandidateSha = "fedcba9876543210fedcba9876543210fedcba98";
const canarySecret = "convex-bootstrap-canary-secret-1234567890";
const target = {
  deploymentName: "careful-otter-123",
  deploymentUrl: "https://careful-otter-123.convex.cloud",
};
const github = {
  approvalReceiptSha256: "a".repeat(64),
  environment: "sourcera-production-release" as const,
  headSha: approvedCandidateSha,
  runAttempt: 1 as const,
  runId: 7001,
};
const checkout = {
  candidateSha: approvedCandidateSha,
  clean: true as const,
  knownGoodIsAncestor: true as const,
  knownGoodSha,
};

async function createValidReceipt(
  approvalReceiptSha256 = github.approvalReceiptSha256,
) {
  let nonce = 0;
  let monotonic = 0;
  return await createConvexProductionGenesisReceipt(
    {
      approvedCandidateSha,
      canarySecret,
      checkout,
      github: { ...github, approvalReceiptSha256 },
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
      randomId: () => `valid-bootstrap-${String(++nonce).padStart(2, "0")}`,
    },
  );
}

test("genesis bootstrap proves the live known-good SHA with observe-only missing nonces", async () => {
  const calls: ConvexProductionBootstrapQueryArguments[] = [];
  let nonce = 0;
  let monotonic = 0;
  const receipt = await createConvexProductionGenesisReceipt(
    {
      approvedCandidateSha,
      canarySecret,
      checkout,
      github,
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
      query: async (arguments_) => {
        calls.push(arguments_);
        return null;
      },
      randomId: () => `bootstrap-nonce-${String(++nonce).padStart(2, "0")}`,
    },
  );

  assert.equal(calls.length, 20);
  assert.equal(new Set(calls.map((entry) => entry.nonceHash)).size, 20);
  for (const [index, arguments_] of calls.entries()) {
    assert.equal(arguments_.commitSha, knownGoodSha);
    assert.equal(arguments_.deploymentName, target.deploymentName);
    assert.equal(arguments_.environment, "production");
    assert.equal(arguments_.releaseApprovedSha, knownGoodSha);
    assert.equal(arguments_.sample, index + 1);
    assert.equal(
      arguments_.authorization,
      createHmac("sha256", canarySecret)
        .update(createConvexProductionProbePayload("observe", arguments_))
        .digest("hex"),
    );
  }
  assert.deepEqual(
    readPassingConvexProductionGenesisReceipt(receipt, {
      approvedCandidateSha,
      approvalReceiptSha256: github.approvalReceiptSha256,
      githubRunAttempt: github.runAttempt,
      githubRunId: github.runId,
      knownGoodSha,
      target,
    }),
    receipt,
  );
  assert.equal(receipt.anchorAllowed, true);
  assert.equal(receipt.promotionAllowed, false);
  assert.equal(receipt.providerMutationCount, 0);
  assert.equal(receipt.proof.function, "foundation:observeProductionProbe");
  assert.equal(receipt.proof.kind, "observe_only_missing_nonce");
  assert.equal(receipt.proof.nullResponses, 20);
  assert.equal(receipt.proof.sampleCount, 20);
  assert.deepEqual(receipt.runtimeIdentity, {
    buildCommitSha: knownGoodSha,
    deploymentName: target.deploymentName,
  });
});

test("genesis receipt parsing rejects schema drift and release-binding drift", async () => {
  const receipt = await createValidReceipt();
  const expected = {
    approvedCandidateSha,
    approvalReceiptSha256: github.approvalReceiptSha256,
    githubRunAttempt: github.runAttempt,
    githubRunId: github.runId,
    knownGoodSha,
    target,
  };
  const invalid: unknown[] = [
    { ...receipt, extra: true },
    { ...receipt, checkedAt: "not-an-iso-timestamp" },
    { ...receipt, credentialClass: "deploy" },
    { ...receipt, checkout: { ...receipt.checkout, clean: false } },
    {
      ...receipt,
      checkout: { ...receipt.checkout, knownGoodIsAncestor: false },
    },
    {
      ...receipt,
      github: { ...receipt.github, headSha: knownGoodSha },
    },
    {
      ...receipt,
      github: { ...receipt.github, environment: "Production" },
    },
    {
      ...receipt,
      proof: { ...receipt.proof, extra: true },
    },
    {
      ...receipt,
      proof: { ...receipt.proof, nullResponses: 19 },
    },
    {
      ...receipt,
      proof: { ...receipt.proof, latencyP95Ms: 501 },
    },
    {
      ...receipt,
      runtimeIdentity: {
        ...receipt.runtimeIdentity,
        buildCommitSha: approvedCandidateSha,
      },
    },
  ];
  for (const value of invalid) {
    assert.throws(() =>
      readPassingConvexProductionGenesisReceipt(value, expected),
    );
  }
  assert.throws(() =>
    readPassingConvexProductionGenesisReceipt(receipt, {
      ...expected,
      approvedCandidateSha: "b".repeat(40),
    }),
  );
  assert.throws(() =>
    readPassingConvexProductionGenesisReceipt(receipt, {
      ...expected,
      githubRunId: 7002,
    }),
  );
});

test("genesis bootstrap rejects invalid release bindings before provider access", async () => {
  const invalidInputs = [
    {
      approvedCandidateSha,
      canarySecret,
      checkout: { ...checkout, candidateSha: "b".repeat(40) },
      github,
      knownGoodSha,
      target,
    },
    {
      approvedCandidateSha,
      canarySecret,
      checkout,
      github: { ...github, headSha: "b".repeat(40) },
      knownGoodSha,
      target,
    },
    {
      approvedCandidateSha,
      canarySecret,
      checkout,
      github,
      knownGoodSha,
      target: { ...target, deploymentUrl: "https://wrong.convex.cloud" },
    },
  ];
  for (const input of invalidInputs) {
    let providerReads = 0;
    await assert.rejects(() =>
      createConvexProductionGenesisReceipt(input, {
        query: async () => {
          providerReads += 1;
          return null;
        },
      }),
    );
    assert.equal(providerReads, 0);
  }
});

test("genesis bootstrap emits no receipt for non-null or failed provider reads", async () => {
  let providerReads = 0;
  await assert.rejects(() =>
    createConvexProductionGenesisReceipt(
      {
        approvedCandidateSha,
        canarySecret,
        checkout,
        github,
        knownGoodSha,
        target,
      },
      {
        query: async () => {
          providerReads += 1;
          return providerReads === 4 ? { existing: true } : null;
        },
      },
    ),
  );
  assert.equal(providerReads, 4);

  providerReads = 0;
  await assert.rejects(() =>
    createConvexProductionGenesisReceipt(
      {
        approvedCandidateSha,
        canarySecret,
        checkout,
        github,
        knownGoodSha,
        target,
      },
      {
        query: async () => {
          providerReads += 1;
          throw new Error("live SHA mismatch");
        },
      },
    ),
  );
  assert.equal(providerReads, 1);
});

test("genesis bootstrap times out a stalled read without retrying", async () => {
  let providerReads = 0;
  await assert.rejects(
    () =>
      createConvexProductionGenesisReceipt(
        {
          approvedCandidateSha,
          canarySecret,
          checkout,
          github,
          knownGoodSha,
          target,
        },
        {
          query: async () => {
            providerReads += 1;
            return await new Promise<never>(() => {});
          },
          sampleTimeoutMs: 5,
        },
      ),
    /timed out/,
  );
  assert.equal(providerReads, 1);
});

test("genesis receipt output is external, atomic, private, and non-overwriting", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "convex-genesis-"));
  const repositoryRoot = path.join(temporaryRoot, "repository");
  const evidenceRoot = path.join(temporaryRoot, "evidence");
  await mkdir(repositoryRoot);
  await mkdir(evidenceRoot);
  const receipt = await createValidReceipt();
  const expected = {
    approvedCandidateSha,
    approvalReceiptSha256: github.approvalReceiptSha256,
    githubRunAttempt: github.runAttempt,
    githubRunId: github.runId,
    knownGoodSha,
    target,
  };
  const outputPath = path.join(evidenceRoot, "convex-genesis.json");
  try {
    assert.equal(
      writeConvexProductionGenesisReceipt(
        outputPath,
        receipt,
        repositoryRoot,
        expected,
      ),
      path.join(await realpath(evidenceRoot), "convex-genesis.json"),
    );
    assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), receipt);
    assert.equal((await lstat(outputPath)).mode & 0o777, 0o600);
    assert.throws(() =>
      writeConvexProductionGenesisReceipt(
        outputPath,
        receipt,
        repositoryRoot,
        expected,
      ),
    );
    assert.throws(() =>
      writeConvexProductionGenesisReceipt(
        path.join(repositoryRoot, "receipt.json"),
        receipt,
        repositoryRoot,
        expected,
      ),
    );
    const linkedIntoRepository = path.join(temporaryRoot, "linked-repository");
    await symlink(repositoryRoot, linkedIntoRepository);
    assert.throws(() =>
      writeConvexProductionGenesisReceipt(
        path.join(linkedIntoRepository, "receipt.json"),
        receipt,
        repositoryRoot,
        expected,
      ),
    );
    assert.throws(() =>
      writeConvexProductionGenesisReceipt(
        path.join(evidenceRoot, "invalid.json"),
        { ...receipt, extra: true },
        repositoryRoot,
        expected,
      ),
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});

test("genesis bootstrap receives only the canary credential", () => {
  const source = {
    CI: "true",
    CONVEX_ADMIN_KEY: "admin-secret",
    CONVEX_DEPLOY_KEY: "prod:project|deploy-secret",
    GH_TOKEN: "github-secret",
    GITHUB_REPOSITORY: "meetblakey/sourcera",
    GITHUB_RUN_ATTEMPT: "1",
    GITHUB_RUN_ID: String(github.runId),
    LANG: "en_US.UTF-8",
    PATH: "/safe/bin",
    SOURCERA_CONVEX_CANARY_SECRET: canarySecret,
    SOURCERA_ENV: "production",
    SOURCERA_KNOWN_GOOD_SHA: knownGoodSha,
    SOURCERA_RELEASE_APPROVED_SHA: approvedCandidateSha,
    SOURCERA_RELEASE_GITHUB_TOKEN: "release-github-secret",
    UNRELATED_API_KEY: "unrelated-secret",
    VERCEL_TOKEN: "vercel-secret",
  };
  const isolated = createConvexProductionBootstrapEnvironment(source);
  assert.deepEqual(isolated, {
    CI: "true",
    GITHUB_REPOSITORY: "meetblakey/sourcera",
    GITHUB_RUN_ATTEMPT: "1",
    GITHUB_RUN_ID: String(github.runId),
    LANG: "en_US.UTF-8",
    PATH: "/safe/bin",
    SOURCERA_CONVEX_CANARY_SECRET: canarySecret,
    SOURCERA_ENV: "production",
    SOURCERA_KNOWN_GOOD_SHA: knownGoodSha,
    SOURCERA_RELEASE_APPROVED_SHA: approvedCandidateSha,
  });
  assert.deepEqual(readConvexProductionBootstrapEnvironment(isolated), {
    approvedCandidateSha,
    canarySecret,
    githubRepository: "meetblakey/sourcera",
    githubRunAttempt: 1,
    githubRunId: github.runId,
    knownGoodSha,
  });

  const forbidden = [
    "CONVEX_ADMIN_KEY",
    "CONVEX_DEPLOY_KEY",
    "CONVEX_DEPLOYMENT",
    "CONVEX_SELF_HOSTED_ADMIN_KEY",
    "CONVEX_SELF_HOSTED_URL",
    "CONVEX_URL",
    "GH_TOKEN",
    "GITHUB_TOKEN",
    "NEXT_PUBLIC_CONVEX_URL",
    "SOURCERA_RELEASE_GITHUB_TOKEN",
    "VERCEL_TOKEN",
  ];
  for (const key of forbidden) {
    assert.throws(() =>
      readConvexProductionBootstrapEnvironment({
        ...isolated,
        [key]: "forbidden-secret",
      }),
    );
  }
  assert.throws(() =>
    readConvexProductionBootstrapEnvironment({
      ...isolated,
      SOURCERA_CONVEX_CANARY_SECRET: "short",
    }),
  );
});

test("genesis bootstrap accepts only the exact current protected-run approval", () => {
  const approval = {
    approval: {
      reviewer: { id: 15627406, login: "meetblakey" },
      state: "approved",
    },
    approvedSha: approvedCandidateSha,
    checkedAt: "2026-07-15T18:00:00.000Z",
    environment: "sourcera-production-release",
    event: "github_production_release_approval_receipt",
    repository: "meetblakey/sourcera",
    result: "passed",
    run: { attempt: 1, headSha: approvedCandidateSha, id: github.runId },
    schemaVersion: 1,
    sourceProofSha256: "b".repeat(64),
  };
  const expected = {
    approvedCandidateSha,
    githubRepository: "meetblakey/sourcera" as const,
    githubRunAttempt: 1 as const,
    githubRunId: github.runId,
  };
  assert.deepEqual(
    readGithubProductionApprovalReceipt(approval, expected),
    approval,
  );
  const invalid = [
    { ...approval, extra: true },
    { ...approval, approvedSha: knownGoodSha },
    { ...approval, environment: "Production" },
    { ...approval, sourceProofSha256: "short" },
    { ...approval, run: { ...approval.run, id: github.runId + 1 } },
    { ...approval, run: { ...approval.run, attempt: 2 } },
    {
      ...approval,
      approval: { ...approval.approval, state: "pending" },
    },
    {
      ...approval,
      approval: {
        ...approval.approval,
        reviewer: { id: 1, login: "someone-else" },
      },
    },
  ];
  for (const value of invalid) {
    assert.throws(() => readGithubProductionApprovalReceipt(value, expected));
  }
});

test("genesis bootstrap CLI requires distinct external approval and receipt paths", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "convex-genesis-cli-"));
  const repositoryRoot = path.join(temporaryRoot, "repository");
  const evidenceRoot = path.join(temporaryRoot, "evidence");
  await mkdir(repositoryRoot);
  await mkdir(evidenceRoot);
  const approvalPath = path.join(evidenceRoot, "approval.json");
  const receiptPath = path.join(evidenceRoot, "genesis.json");
  await writeFile(approvalPath, "{}\n", { mode: 0o600 });
  try {
    const parsed = readConvexProductionBootstrapArguments(
      [
        "--approval-receipt",
        approvalPath,
        "--receipt-out",
        receiptPath,
      ],
      repositoryRoot,
    );
    const canonicalEvidenceRoot = await realpath(evidenceRoot);
    assert.deepEqual(parsed, {
      approvalReceiptPath: path.join(canonicalEvidenceRoot, "approval.json"),
      receiptOutputPath: path.join(canonicalEvidenceRoot, "genesis.json"),
    });

    const invalid = [
      [],
      ["--approval-receipt", approvalPath],
      ["--unknown", approvalPath, "--receipt-out", receiptPath],
      [
        "--approval-receipt",
        approvalPath,
        "--approval-receipt",
        approvalPath,
      ],
      [
        "--approval-receipt",
        approvalPath,
        "--receipt-out",
        approvalPath,
      ],
      [
        "--approval-receipt",
        path.join(repositoryRoot, "approval.json"),
        "--receipt-out",
        receiptPath,
      ],
      [
        "--approval-receipt",
        approvalPath,
        "--receipt-out",
        path.join(repositoryRoot, "receipt.json"),
      ],
      [
        "--approval-receipt",
        path.join(evidenceRoot, "missing.json"),
        "--receipt-out",
        receiptPath,
      ],
    ];
    for (const arguments_ of invalid) {
      assert.throws(() =>
        readConvexProductionBootstrapArguments(arguments_, repositoryRoot),
      );
    }
    await writeFile(receiptPath, "existing\n", { mode: 0o600 });
    assert.throws(() =>
      readConvexProductionBootstrapArguments(
        [
          "--approval-receipt",
          approvalPath,
          "--receipt-out",
          receiptPath,
        ],
        repositoryRoot,
      ),
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});

test("genesis bootstrap binds a clean exact candidate checkout to its ancestor", async () => {
  const repositoryRoot = await mkdtemp(
    path.join(os.tmpdir(), "convex-genesis-checkout-"),
  );
  const git = (arguments_: string[]) => {
    const result = spawnSync("git", arguments_, {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  try {
    git(["init", "--quiet"]);
    git(["config", "user.email", "tests@sourcera.local"]);
    git(["config", "user.name", "Sourcera Tests"]);
    await writeFile(path.join(repositoryRoot, "proof.txt"), "known-good\n");
    git(["add", "proof.txt"]);
    git(["commit", "--quiet", "-m", "known good"]);
    const liveKnownGoodSha = git(["rev-parse", "HEAD"]);
    await writeFile(path.join(repositoryRoot, "proof.txt"), "candidate\n");
    git(["add", "proof.txt"]);
    git(["commit", "--quiet", "-m", "candidate"]);
    const liveCandidateSha = git(["rev-parse", "HEAD"]);

    assert.deepEqual(
      readCleanConvexProductionBootstrapCheckout(
        repositoryRoot,
        liveKnownGoodSha,
        liveCandidateSha,
      ),
      {
        candidateSha: liveCandidateSha,
        clean: true,
        knownGoodIsAncestor: true,
        knownGoodSha: liveKnownGoodSha,
      },
    );
    await writeFile(path.join(repositoryRoot, "untracked.txt"), "dirty\n");
    assert.throws(() =>
      readCleanConvexProductionBootstrapCheckout(
        repositoryRoot,
        liveKnownGoodSha,
        liveCandidateSha,
      ),
    );
    await rm(path.join(repositoryRoot, "untracked.txt"));
    assert.throws(() =>
      readCleanConvexProductionBootstrapCheckout(
        repositoryRoot,
        "a".repeat(40),
        liveCandidateSha,
      ),
    );
    assert.throws(() =>
      readCleanConvexProductionBootstrapCheckout(
        repositoryRoot,
        liveCandidateSha,
        liveCandidateSha,
      ),
    );
  } finally {
    await rm(repositoryRoot, { force: true, recursive: true });
  }
});

test("canonical genesis CLI exposes only the observe-only bootstrap command", async () => {
  const repositoryRoot = path.resolve(import.meta.dirname, "../..");
  const scriptPath = path.join(
    repositoryRoot,
    "scripts/bootstrap-convex-production.ts",
  );
  const packageJson = JSON.parse(
    await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  const source = await readFile(scriptPath, "utf8");
  assert.equal(
    packageJson.scripts["convex:bootstrap:production"],
    "tsx scripts/bootstrap-convex-production.ts",
  );
  assert.match(source, /ConvexHttpClient/);
  assert.match(source, /observeProductionProbe/);
  assert.match(source, /client\.query\(/);
  assert.doesNotMatch(source, /client\.mutation\(/);
  assert.doesNotMatch(source, /convex\s+deploy/);

  const execution = spawnSync(
    path.join(repositoryRoot, "node_modules/.bin/tsx"),
    [scriptPath],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { NODE_ENV: "test", PATH: process.env.PATH },
    },
  );
  assert.notEqual(execution.status, 0);
  assert.equal(execution.stdout, "");
  assert.equal(execution.stderr, "Convex production genesis bootstrap failed.\n");
});

test("known-good validation accepts genesis only for its exact candidate and current run", async () => {
  const receipt = await createValidReceipt();
  const binding = {
    approvedCandidateSha,
    approvalReceiptSha256: github.approvalReceiptSha256,
    githubRunAttempt: github.runAttempt,
    githubRunId: github.runId,
  };
  assert.deepEqual(
    readPassingKnownGoodConvexReceipt(
      receipt,
      knownGoodSha,
      target,
      binding,
    ),
    receipt,
  );
  assert.throws(() =>
    readPassingKnownGoodConvexReceipt(receipt, knownGoodSha, target),
  );
  assert.throws(() =>
    readPassingKnownGoodConvexReceipt(receipt, knownGoodSha, target, {
      ...binding,
      approvedCandidateSha: "b".repeat(40),
    }),
  );
  assert.throws(() =>
    readPassingKnownGoodConvexReceipt(receipt, knownGoodSha, target, {
      ...binding,
      githubRunId: github.runId + 1,
    }),
  );
});

test("deploy preflight binds genesis to the exact current approval bytes", async () => {
  const approval = {
    approval: {
      reviewer: { id: 15627406, login: "meetblakey" },
      state: "approved",
    },
    approvedSha: approvedCandidateSha,
    checkedAt: "2026-07-15T18:00:00.000Z",
    environment: "sourcera-production-release",
    event: "github_production_release_approval_receipt",
    repository: "meetblakey/sourcera",
    result: "passed",
    run: { attempt: 1, headSha: approvedCandidateSha, id: github.runId },
    schemaVersion: 1,
    sourceProofSha256: "b".repeat(64),
  };
  const approvalBytes = Buffer.from(`${JSON.stringify(approval, null, 2)}\n`);
  const approvalReceiptSha256 = createHash("sha256")
    .update(approvalBytes)
    .digest("hex");
  const genesis = await createValidReceipt(approvalReceiptSha256);
  const genesisBytes = Buffer.from(`${JSON.stringify(genesis, null, 2)}\n`);
  const expected = {
    approvedCandidateSha,
    githubRepository: "meetblakey/sourcera" as const,
    githubRunAttempt: 1 as const,
    githubRunId: github.runId,
    knownGoodSha,
    target,
  };
  const read = readConvexProductionKnownGoodReceiptBytes(
    genesisBytes,
    approvalBytes,
    expected,
  );
  assert.deepEqual(read.receipt, genesis);
  assert.equal(read.approvalReceiptSha256, approvalReceiptSha256);
  assert.equal(
    read.knownGoodReceiptSha256,
    createHash("sha256").update(genesisBytes).digest("hex"),
  );

  assert.throws(() =>
    readConvexProductionKnownGoodReceiptBytes(
      genesisBytes,
      undefined,
      expected,
    ),
  );
  assert.throws(() =>
    readConvexProductionKnownGoodReceiptBytes(
      genesisBytes,
      Buffer.concat([approvalBytes, Buffer.from("\n")]),
      expected,
    ),
  );
  for (const drift of [
    { approvedCandidateSha: "c".repeat(40) },
    { githubRunId: github.runId + 1 },
    { githubRunAttempt: 2 },
  ]) {
    assert.throws(() =>
      readConvexProductionKnownGoodReceiptBytes(
        genesisBytes,
        approvalBytes,
        { ...expected, ...drift },
      ),
    );
  }
});

test("deploy preflight forbids a current approval input for normal receipts", () => {
  const priorKnownGoodSha = "c".repeat(40);
  const normalReceipt = {
    approvedSha: knownGoodSha,
    canary: {
      assertions: [
        {
          assertion: "reactive-observation-p95",
          commitSha: knownGoodSha,
          deployment: target.deploymentName,
          environment: "production",
          observationLatencyMs: 200,
          result: "passed",
        },
        {
          assertion: "reactive-observation-p99",
          commitSha: knownGoodSha,
          deployment: target.deploymentName,
          environment: "production",
          observationLatencyMs: 400,
          result: "passed",
        },
      ],
      outcome: "passed",
      runtimeIdentity: {
        buildCommitSha: knownGoodSha,
        deploymentName: target.deploymentName,
      },
      sampleCount: 20,
      zeroCustomerData: true,
    },
    checkedAt: "2026-07-15T18:00:00.000Z",
    event: "convex_production_deployment_receipt",
    knownGoodReceiptSha256: "b".repeat(64),
    knownGoodSha: priorKnownGoodSha,
    result: "passed",
    rollbackAnchor: {
      canary: {
        assertions: [
          {
            assertion: "reactive-observation-p95",
            commitSha: priorKnownGoodSha,
            deployment: target.deploymentName,
            environment: "production",
            observationLatencyMs: 200,
            result: "passed",
          },
          {
            assertion: "reactive-observation-p99",
            commitSha: priorKnownGoodSha,
            deployment: target.deploymentName,
            environment: "production",
            observationLatencyMs: 400,
            result: "passed",
          },
        ],
        outcome: "passed",
        runtimeIdentity: {
          buildCommitSha: priorKnownGoodSha,
          deploymentName: target.deploymentName,
        },
        sampleCount: 20,
        zeroCustomerData: true,
      },
      knownGoodSha: priorKnownGoodSha,
      result: "passed",
    },
    schemaVersion: 1,
    target,
  };
  const normalBytes = Buffer.from(`${JSON.stringify(normalReceipt)}\n`);
  const expected = {
    approvedCandidateSha,
    githubRepository: "meetblakey/sourcera" as const,
    githubRunAttempt: 1 as const,
    githubRunId: github.runId,
    knownGoodSha,
    target,
  };
  assert.deepEqual(
    readConvexProductionKnownGoodReceiptBytes(
      normalBytes,
      undefined,
      expected,
    ).receipt,
    normalReceipt,
  );
  assert.throws(() =>
    readConvexProductionKnownGoodReceiptBytes(
      normalBytes,
      Buffer.from("{}\n"),
      expected,
    ),
  );
});

test("production deploy CLI enforces the genesis approval-input XOR", async () => {
  const repositoryRoot = path.resolve(import.meta.dirname, "../..");
  const fixtureRoot = await mkdtemp(
    path.join(os.tmpdir(), "convex-deploy-genesis-binding-"),
  );
  const genesisPath = path.join(fixtureRoot, "genesis.json");
  const normalPath = path.join(fixtureRoot, "normal.json");
  const approvalPath = path.join(fixtureRoot, "approval.json");
  await writeFile(
    genesisPath,
    `${JSON.stringify({ event: "convex_production_genesis_receipt" })}\n`,
  );
  await writeFile(
    normalPath,
    `${JSON.stringify({ event: "convex_production_deployment_receipt" })}\n`,
  );
  await writeFile(approvalPath, "{}\n");
  const execute = (arguments_: string[]) =>
    spawnSync(
      path.join(repositoryRoot, "node_modules/.bin/tsx"),
      ["scripts/deploy-convex-production.ts", ...arguments_],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: { ...process.env, SOURCERA_ENV: "production" },
      },
    );
  try {
    const missingApproval = execute([
      "--known-good-receipt",
      genesisPath,
      "--receipt-out",
      path.join(fixtureRoot, "genesis-output.json"),
    ]);
    assert.notEqual(missingApproval.status, 0);
    assert.match(
      missingApproval.stderr,
      /Genesis Convex receipt requires --approval-receipt/,
    );

    const normalWithApproval = execute([
      "--known-good-receipt",
      normalPath,
      "--approval-receipt",
      approvalPath,
      "--receipt-out",
      path.join(fixtureRoot, "normal-output.json"),
    ]);
    assert.notEqual(normalWithApproval.status, 0);
    assert.match(
      normalWithApproval.stderr,
      /Normal Convex receipt forbids --approval-receipt/,
    );
  } finally {
    await rm(fixtureRoot, { force: true, recursive: true });
  }
});
