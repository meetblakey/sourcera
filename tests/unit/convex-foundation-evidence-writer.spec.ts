import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const commitSha = "0123456789abcdef0123456789abcdef01234567";
const previewName = `codex-pla-282-${commitSha}`;

test("the CI evidence writer fails closed outside the stamped provider checkout", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "convex-evidence-"));
  try {
    const probePath = path.join(directory, "probe.json");
    const evidencePath = path.join(directory, "r0-convex-foundation.json");
    const assertion = (name: string, latency: number) => ({
      assertion: name,
      checkedAt: "2026-07-27T07:00:00.000Z",
      commitSha,
      deployment: previewName,
      environment: "preview",
      event: "convex_foundation_health_result",
      observationLatencyMs: latency,
      result: "passed",
    });
    writeFileSync(
      probePath,
      JSON.stringify({
        assertions: [
          assertion("reactive-observation-p95", 240),
          assertion("reactive-observation-p99", 410),
        ],
        attemptedSampleCount: 20,
        cleanup: { clearedSampleCount: 20, result: "passed" },
        outcome: "passed",
        runtimeIdentity: {
          buildCommitSha: commitSha,
          buildEnvironment: "preview",
          buildPreviewName: previewName,
          deploymentName: "careful-otter-123",
        },
        sampleCount: 20,
        zeroCustomerData: true,
      }),
    );
    const environment = {
      ...process.env,
      CONVEX_EXPECTED_PROJECT: "sourcera/sourcera",
      CONVEX_PREVIEW_NAME: previewName,
      GITHUB_ACTIONS: "true",
      GITHUB_RUN_ATTEMPT: "1",
      GITHUB_RUN_ID: "123456",
      GITHUB_WORKFLOW_REF:
        "owner/repo/.github/workflows/app-ci.yml@refs/pull/1/merge",
      SOURCERA_BUILD_RESULT: "passed",
      SOURCERA_COMMIT_SHA: commitSha,
      SOURCERA_ENV: "preview",
      SOURCERA_PROBE_RESULT: "passed",
      SOURCERA_VERIFY_RESULT: "passed",
    };
    const run = () =>
      spawnSync(
        process.execPath,
        [
          "--import",
          "tsx",
          "scripts/write-convex-foundation-evidence.ts",
          "--probe",
          probePath,
          "--out",
          evidencePath,
        ],
        { cwd: repositoryRoot, encoding: "utf8", env: environment },
      );

    const first = run();
    assert.equal(first.status, 0, first.stderr);
    const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
    assert.equal(evidence.outcome, "failed");
    assert.equal(evidence.source.requirement, "F-005");
    assert.match(evidence.source.checksum, /^[a-f0-9]{64}$/);
    assert.equal(evidence.digests.schemaRegistrySha256, "0".repeat(64));

    const second = run();
    assert.notEqual(second.status, 0);
    assert.match(second.stderr, /already exists/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("the CI evidence writer turns an empty probe output into sanitized failure evidence", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "convex-evidence-failed-"));
  try {
    const probePath = path.join(directory, "probe.json");
    const evidencePath = path.join(directory, "r0-convex-foundation.json");
    writeFileSync(probePath, "");
    const execution = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "scripts/write-convex-foundation-evidence.ts",
        "--probe",
        probePath,
        "--out",
        evidencePath,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          CONVEX_EXPECTED_PROJECT: "sourcera/sourcera",
          CONVEX_PREVIEW_NAME: previewName,
          GITHUB_ACTIONS: "true",
          GITHUB_RUN_ATTEMPT: "1",
          GITHUB_RUN_ID: "123456",
          GITHUB_WORKFLOW_REF:
            "owner/repo/.github/workflows/app-ci.yml@refs/pull/1/merge",
          SOURCERA_BUILD_RESULT: "passed",
          SOURCERA_COMMIT_SHA: commitSha,
          SOURCERA_ENV: "preview",
          SOURCERA_PROBE_RESULT: "failed",
          SOURCERA_VERIFY_RESULT: "passed",
        },
      },
    );
    assert.equal(execution.status, 0, execution.stderr);
    const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
    assert.equal(evidence.outcome, "failed");
    assert.deepEqual(evidence.probe.cleanup, {
      clearedSampleCount: 0,
      result: "failed",
    });
    assert.equal(evidence.probe.sampleCount, 0);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("the CI evidence writer always emits failure evidence when evidence inputs are missing", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "convex-evidence-missing-"));
  try {
    const probePath = path.join(directory, "probe.json");
    const evidencePath = path.join(directory, "r0-convex-foundation.json");
    writeFileSync(probePath, '{"authorization":"credential-value"}');
    const environment = { ...process.env };
    for (const name of [
      "CONVEX_EXPECTED_PROJECT",
      "CONVEX_PREVIEW_NAME",
      "GITHUB_RUN_ATTEMPT",
      "GITHUB_RUN_ID",
      "GITHUB_WORKFLOW_REF",
      "SOURCERA_BUILD_RESULT",
      "SOURCERA_COMMIT_SHA",
      "SOURCERA_ENV",
      "SOURCERA_PROBE_RESULT",
      "SOURCERA_VERIFY_RESULT",
    ]) {
      delete environment[name];
    }
    environment.GITHUB_ACTIONS = "true";

    const execution = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "scripts/write-convex-foundation-evidence.ts",
        "--probe",
        probePath,
        "--out",
        evidencePath,
      ],
      { cwd: repositoryRoot, encoding: "utf8", env: environment },
    );

    assert.equal(execution.status, 0, execution.stderr);
    const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
    assert.equal(evidence.outcome, "failed");
    assert.match(evidence.identity.commitSha, /^[a-f0-9]{40}$/);
    assert.match(evidence.source.checksum, /^[a-f0-9]{64}$/);
    assert.deepEqual(evidence.ci, {
      runAttempt: "unknown",
      runId: "unknown",
      workflowRef: "unknown",
      result: "failed",
    });
    assert.doesNotMatch(JSON.stringify(evidence), /credential-value/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
