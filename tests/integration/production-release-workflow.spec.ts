import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  collectProductionRepositoryEvidence,
  collectProductionRepositoryState,
} from "../../scripts/lib/production-repository-evidence";
import { createProductionJsonProof } from "../../scripts/production-release-preflight";
import {
  createProductionPreflightReceipt,
  readProductionPreflightBundle,
} from "../../scripts/lib/production-release-workflow";

const approvedSha = "0123456789abcdef0123456789abcdef01234567";
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
const failedStampEvidence = {
  ...evidence,
  stamp: JSON.stringify({ outcome: "fail", blocker_count: 1 }),
};

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

test("Git and remote failures become bounded immutable repository evidence", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "sourcera-repository-failure-"));
  try {
    git(root, ["init", "--initial-branch=main"]);
    await writeFile(path.join(root, "proof.txt"), "local only\n");
    git(root, ["add", "proof.txt"]);
    git(root, [
      "-c",
      "user.name=Sourcera Test",
      "-c",
      "user.email=sourcera@example.invalid",
      "commit",
      "-m",
      "local only",
    ]);
    const sha = git(root, ["rev-parse", "HEAD"]);
    const proof = collectProductionRepositoryEvidence({
      approvedSha: sha,
      dispatchRef: "refs/heads/main",
      environment: process.env,
      includeUntracked: false,
      repositoryRoot: root,
    });
    assert.equal(proof.clean, false);
    assert.equal(proof.outcome, "fail");
    assert.equal(proof.failure?.context, "read fetched origin/main");
    assert.ok(JSON.stringify(proof).length <= 20_000);
    const receipt = createProductionPreflightReceipt({
      evidence: { ...evidence, repository: JSON.stringify(proof) },
      identity,
    });
    assert.equal(receipt.result, "failed");
    assert.deepEqual(receipt.failedChecks, ["repository"]);
    assert.match(receipt.proofSha256.repository, /^[a-f0-9]{64}$/);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

test("valid stamp and exact JSON cannot pass after a nonzero subprocess exit", () => {
  const failedStamp = createProductionJsonProof(
    {
      error: undefined,
      exitCode: 1,
      stderr: "stamp exited nonzero",
      stdout: JSON.stringify({ outcome: "pass" }),
    },
    "stamp gate",
  );
  const failedExact = createProductionJsonProof(
    {
      error: undefined,
      exitCode: 1,
      stderr: "exact exited nonzero",
      stdout: JSON.stringify({ open_rows: 0 }),
    },
    "exact status scan",
  );
  assert.deepEqual(JSON.parse(failedStamp), {
    context: "stamp gate",
    error: null,
    exitCode: 1,
    outcome: "fail",
    stderr: "stamp exited nonzero",
  });
  assert.deepEqual(JSON.parse(failedExact), {
    context: "exact status scan",
    error: null,
    exitCode: 1,
    outcome: "fail",
    stderr: "exact exited nonzero",
  });
  const receipt = createProductionPreflightReceipt({
    evidence: {
      ...evidence,
      exact: failedExact,
      stamp: failedStamp,
    },
    identity,
  });
  assert.equal(receipt.result, "failed");
  assert.deepEqual(receipt.failedChecks, ["exact", "stamp"]);
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

test("a failed stamp gate still produces an immutable preflight receipt", async () => {
  const receipt = createProductionPreflightReceipt({
    evidence: failedStampEvidence,
    identity,
  });

  assert.equal(receipt.result, "failed");
  assert.deepEqual(receipt.failedChecks, ["stamp"]);

  const directory = await mkdtemp(path.join(os.tmpdir(), "sourcera-preflight-failed-"));
  try {
    for (const [name, raw] of Object.entries(failedStampEvidence)) {
      await writeFile(path.join(directory, `${name}.json`), raw);
    }
    await writeFile(
      path.join(directory, "production-preflight.json"),
      `${JSON.stringify(receipt)}\n`,
    );
    const readback = await readProductionPreflightBundle(directory, identity);
    assert.equal(readback.receipt.result, "failed");
    assert.deepEqual(readback.receipt.failedChecks, ["stamp"]);
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
      evidence: failedStampEvidence,
      identity,
    });
    for (const [name, raw] of Object.entries(failedStampEvidence)) {
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
      SOURCERA_PREFLIGHT_ARTIFACT_DIGEST: preflightArtifactDigest,
      SOURCERA_RELEASE_APPROVED_SHA: approvedSha,
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
        nativeDecision: unknown;
        providerMutationAuthorized: boolean;
        status: string;
      };
      event: string;
      preflight: { failedChecks: string[]; result: string };
      promotionAllowed: boolean;
      providerCredentialCount: number;
      result: string;
      sourceProvenance: { decisionId: string };
    };
    assert.deepEqual(
      {
        historicalDownloadAttempted:
          receipt.authority.historicalDownloadAttempted,
        decisionId: receipt.sourceProvenance.decisionId,
        failedChecks: receipt.preflight.failedChecks,
        nativeDecision: receipt.authority.nativeDecision,
        preflightResult: receipt.preflight.result,
        promotionAllowed: receipt.promotionAllowed,
        providerMutationAuthorized:
          receipt.authority.providerMutationAuthorized,
        providerCredentialCount: receipt.providerCredentialCount,
        result: receipt.result,
        status: receipt.authority.status,
      },
      {
        historicalDownloadAttempted: false,
        decisionId: "DEC-PROD-001",
        failedChecks: ["stamp"],
        nativeDecision: null,
        preflightResult: "failed",
        promotionAllowed: false,
        providerMutationAuthorized: false,
        providerCredentialCount: 0,
        result: "blocked",
        status: "pending_guarded_handoff",
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
