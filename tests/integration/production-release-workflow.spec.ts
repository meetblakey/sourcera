import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { readProductionReleaseArguments } from "../../scripts/release-production";
import { collectProductionRepositoryState } from "../../scripts/lib/production-repository-evidence";
import {
  createProductionGithubHandoff,
  createProductionPreflightReceipt,
  readProductionGithubHandoff,
  readProductionPreflightBundle,
} from "../../scripts/lib/production-release-workflow";

const approvedSha = "0123456789abcdef0123456789abcdef01234567";
const knownGoodSha = "fedcba9876543210fedcba9876543210fedcba98";
const preflightArtifactDigest = "c".repeat(64);
const identity = {
  approvedSha,
  repository: "meetblakey/sourcera" as const,
  runAttempt: 1,
  runId: 12345,
};

const evidence = {
  appVerification: JSON.stringify({ exitCode: 0, outcome: "pass" }),
  delivery: JSON.stringify({ exitCode: 0, outcome: "pass" }),
  exact: JSON.stringify({ open_rows: 0 }),
  repository: JSON.stringify({
    clean: true,
    fetchedMainSha: approvedSha,
    headSha: approvedSha,
    mainSha: approvedSha,
    ref: "refs/heads/main",
  }),
  stamp: JSON.stringify({ outcome: "pass" }),
};
const preflightReceiptRaw = JSON.stringify(
  createProductionPreflightReceipt({ evidence, identity }),
);

function git(cwd: string, arguments_: string[]) {
  const result = spawnSync("git", arguments_, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: "1" },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test("repository proof accepts a detached checkout only at exact dispatched remote main", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "sourcera-detached-main-"));
  try {
    const remote = path.join(root, "remote.git");
    const source = path.join(root, "source");
    const checkout = path.join(root, "checkout");
    await mkdir(source);
    git(root, ["init", "--bare", remote]);
    git(source, ["init", "--initial-branch=main"]);
    await writeFile(path.join(source, "proof.txt"), "exact main\n");
    git(source, ["add", "proof.txt"]);
    git(source, [
      "-c",
      "user.name=Sourcera Test",
      "-c",
      "user.email=sourcera@example.invalid",
      "commit",
      "-m",
      "exact main",
    ]);
    git(source, ["remote", "add", "origin", remote]);
    git(source, ["push", "-u", "origin", "main"]);
    git(remote, ["symbolic-ref", "HEAD", "refs/heads/main"]);
    git(root, ["clone", remote, checkout]);
    const sha = git(checkout, ["rev-parse", "HEAD"]);
    git(checkout, ["checkout", "--detach", sha]);
    assert.equal(git(checkout, ["branch", "--show-current"]), "");

    const proof = collectProductionRepositoryState({
      approvedSha: sha,
      dispatchRef: "refs/heads/main",
      environment: process.env,
      includeUntracked: false,
      repositoryRoot: checkout,
    });
    assert.deepEqual(proof, {
      clean: true,
      fetchedMainSha: sha,
      headSha: sha,
      mainSha: sha,
      ref: "refs/heads/main",
    });
    assert.equal(
      collectProductionRepositoryState({
        approvedSha: sha,
        dispatchRef: "refs/tags/not-main",
        environment: process.env,
        includeUntracked: false,
        repositoryRoot: checkout,
      }).clean,
      false,
    );
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("preflight manifest binds every no-secret proof to run identity", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sourcera-preflight-"));
  try {
    const receipt = createProductionPreflightReceipt({ evidence, identity });
    for (const [name, raw] of Object.entries(evidence)) {
      await writeFile(path.join(directory, `${name}.json`), raw);
    }
    await writeFile(
      path.join(directory, "production-preflight.json"),
      `${JSON.stringify(receipt)}\n`,
    );

    const bundle = await readProductionPreflightBundle(directory, identity);
    assert.deepEqual(bundle.receipt.identity, identity);
    assert.equal(bundle.evidence.stamp, evidence.stamp);

    await writeFile(path.join(directory, "stamp.json"), "{}\n");
    await assert.rejects(
      readProductionPreflightBundle(directory, identity),
      /stamp proof hash does not match/,
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test("the normal blocked lane writes one immutable no-authority receipt", async () => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "sourcera-no-authority-"),
  );
  try {
    const preflightDirectory = path.join(directory, "preflight");
    const receiptPath = path.join(directory, "no-authority.json");
    await mkdir(preflightDirectory);
    const preflightReceipt = createProductionPreflightReceipt({
      evidence,
      identity,
    });
    for (const [name, raw] of Object.entries(evidence)) {
      await writeFile(path.join(preflightDirectory, `${name}.json`), raw);
    }
    await writeFile(
      path.join(preflightDirectory, "production-preflight.json"),
      `${JSON.stringify(preflightReceipt)}\n`,
    );
    const command = process.execPath;
    const arguments_ = [
      "--import",
      "./node_modules/tsx/dist/loader.mjs",
      "scripts/production-release-no-authority.ts",
      "--preflight-dir",
      preflightDirectory,
      "--receipt-out",
      receiptPath,
    ];
    const environment: NodeJS.ProcessEnv = {
      GITHUB_REPOSITORY: identity.repository,
      GITHUB_RUN_ATTEMPT: String(identity.runAttempt),
      GITHUB_RUN_ID: String(identity.runId),
      HOME: process.env.HOME,
      NODE_ENV: "test",
      PATH: process.env.PATH,
      SOURCERA_KNOWN_GOOD_SHA: knownGoodSha,
      SOURCERA_PREFLIGHT_ARTIFACT_DIGEST: preflightArtifactDigest,
      SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
      SOURCERA_REQUESTED_AUTHORITY_RUN_ID: "7000",
    };
    const first = spawnSync(command, arguments_, {
      cwd: process.cwd(),
      encoding: "utf8",
      env: environment,
    });
    assert.equal(first.status, 0, first.stderr);
    const receipt = JSON.parse(await readFile(receiptPath, "utf8")) as {
      authority: {
        historicalDownloadAttempted: boolean;
        requestedRunId: number;
        status: string;
      };
      event: string;
      promotionAllowed: boolean;
      providerCredentialCount: number;
      result: string;
    };
    assert.deepEqual(
      {
        historicalDownloadAttempted:
          receipt.authority.historicalDownloadAttempted,
        promotionAllowed: receipt.promotionAllowed,
        providerCredentialCount: receipt.providerCredentialCount,
        requestedRunId: receipt.authority.requestedRunId,
        result: receipt.result,
        status: receipt.authority.status,
      },
      {
        historicalDownloadAttempted: false,
        promotionAllowed: false,
        providerCredentialCount: 0,
        requestedRunId: 7000,
        result: "blocked",
        status: "missing_attempt_bound_normal_authority",
      },
    );
    assert.equal(receipt.event, "production_release_no_authority_receipt");
    assert.equal((await stat(receiptPath)).mode & 0o777, 0o600);
    const second = spawnSync(command, arguments_, {
      cwd: process.cwd(),
      encoding: "utf8",
      env: environment,
    });
    assert.notEqual(second.status, 0);
    assert.match(second.stderr, /must not already exist/);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});

test("GitHub handoff binds approval proof to the immutable preflight receipt", () => {
  const githubProofRaw = JSON.stringify({ approvedSha, result: "passed" });
  const handoff = createProductionGithubHandoff({
    authorizationContext: "normal",
    githubProofRaw,
    identity,
    knownGoodSha,
    preflightArtifactDigest,
    preflightReceiptRaw,
  });

  assert.deepEqual(
    readProductionGithubHandoff(handoff, {
      authorizationContext: "normal",
      githubProofRaw,
      identity,
      knownGoodSha,
      preflightArtifactDigest,
      preflightReceiptRaw,
    }),
    handoff,
  );
  assert.throws(
    () =>
      readProductionGithubHandoff(handoff, {
        authorizationContext: "normal",
        githubProofRaw: `${githubProofRaw}\n`,
        identity,
        knownGoodSha,
        preflightArtifactDigest,
        preflightReceiptRaw,
      }),
    /GitHub proof hash does not match/,
  );
});

test("bootstrap handoff binds the exact machine route proof and rejects reason-only authorization", () => {
  const githubProofRaw = JSON.stringify({ approvedSha, result: "passed" });
  const bootstrapRouteProofRaw = JSON.stringify({
    route: "initial_genesis",
    result: "passed",
  });
  const handoff = createProductionGithubHandoff({
    authorizationContext: "initial_genesis",
    bootstrapRouteProofRaw,
    githubProofRaw,
    identity,
    knownGoodSha,
    preflightArtifactDigest,
    preflightReceiptRaw,
  });
  assert.equal(handoff.bootstrapRoute, "initial_genesis");
  assert.deepEqual(
    readProductionGithubHandoff(handoff, {
      authorizationContext: "initial_genesis",
      bootstrapRouteProofRaw,
      githubProofRaw,
      identity,
      knownGoodSha,
      preflightArtifactDigest,
      preflightReceiptRaw,
    }),
    handoff,
  );
  assert.throws(
    () =>
      readProductionGithubHandoff(handoff, {
        authorizationContext: "initial_genesis",
        bootstrapRouteProofRaw: JSON.stringify({
          route: "initial_genesis",
          result: "tampered",
        }),
        githubProofRaw,
        identity,
        knownGoodSha,
        preflightArtifactDigest,
        preflightReceiptRaw,
      }),
    /bootstrap route proof does not match/,
  );
  assert.throws(
    () =>
      createProductionGithubHandoff({
        authorizationContext: "expired because somebody said so",
        githubProofRaw,
        identity,
        knownGoodSha,
        preflightArtifactDigest,
        preflightReceiptRaw,
      }),
    /bootstrap route authorization/,
  );
});

test("handoffs reject another run, attempt, candidate, or known-good SHA", () => {
  const githubProofRaw = JSON.stringify({ approvedSha, result: "passed" });
  const handoff = createProductionGithubHandoff({
    authorizationContext: "normal",
    githubProofRaw,
    identity,
    knownGoodSha,
    preflightArtifactDigest,
    preflightReceiptRaw,
  });

  for (const replacement of [
    { ...identity, approvedSha: "a".repeat(40) },
    { ...identity, runAttempt: 2 },
    { ...identity, runId: identity.runId + 1 },
  ]) {
    assert.throws(
      () =>
        readProductionGithubHandoff(handoff, {
          authorizationContext: "normal",
          githubProofRaw,
          identity: replacement,
          knownGoodSha,
          preflightArtifactDigest,
          preflightReceiptRaw,
        }),
      /(?:handoff identity does not match|workflow identity is invalid)/,
    );
  }
  assert.throws(
    () =>
      readProductionGithubHandoff(handoff, {
        authorizationContext: "normal",
        githubProofRaw,
        identity,
        knownGoodSha: "b".repeat(40),
        preflightArtifactDigest,
        preflightReceiptRaw,
      }),
    /known-good SHA does not match/,
  );
  assert.throws(
    () =>
      readProductionGithubHandoff(handoff, {
        authorizationContext: "normal",
        githubProofRaw,
        identity,
        knownGoodSha,
        preflightArtifactDigest: "d".repeat(64),
        preflightReceiptRaw,
      }),
    /preflight artifact digest does not match/,
  );
  assert.throws(
    () =>
      readProductionGithubHandoff(handoff, {
        authorizationContext: "expired anchor",
        githubProofRaw,
        identity,
        knownGoodSha,
        preflightArtifactDigest,
        preflightReceiptRaw,
      }),
    /authorization|bootstrap route/,
  );
});

test("mutation CLI requires the preflight and GitHub handoff inputs", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sourcera-mutation-"));
  try {
    const canonicalDirectory = await realpath(directory);
    const parsed = readProductionReleaseArguments(
      [
        "--anchor-mode",
        "normal",
        "--github-handoff",
        path.join(directory, "github-handoff.json"),
        "--github-proof",
        path.join(directory, "github-proof.json"),
        "--known-good-convex-receipt",
        path.join(directory, "known-good.json"),
        "--preflight-dir",
        path.join(directory, "preflight"),
        "--receipt-out",
        path.join(directory, "release.json"),
      ],
      process.cwd(),
    );
    assert.equal(
      parsed.preflightDirectory,
      path.join(canonicalDirectory, "preflight"),
    );
    assert.equal(
      parsed.githubHandoffPath,
      path.join(canonicalDirectory, "github-handoff.json"),
    );
    assert.equal(
      parsed.githubProofPath,
      path.join(canonicalDirectory, "github-proof.json"),
    );
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
