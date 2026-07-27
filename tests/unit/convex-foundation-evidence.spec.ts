import assert from "node:assert/strict";
import test from "node:test";

import {
  createConvexFoundationEvidence,
  createConvexFoundationFailureEvidence,
} from "../../scripts/lib/convex-foundation-evidence";

const commitSha = "0123456789abcdef0123456789abcdef01234567";
const previewName = `codex-pla-282-${commitSha}`;
const checkedAt = "2026-07-27T07:00:00.000Z";
const digest = (character: string) => character.repeat(64);

const probe = {
  assertions: [
    {
      assertion: "reactive-observation-p95",
      checkedAt,
      commitSha,
      deployment: previewName,
      environment: "preview",
      event: "convex_foundation_health_result",
      observationLatencyMs: 240,
      result: "passed",
    },
    {
      assertion: "reactive-observation-p99",
      checkedAt,
      commitSha,
      deployment: previewName,
      environment: "preview",
      event: "convex_foundation_health_result",
      observationLatencyMs: 410,
      result: "passed",
    },
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
};

const input = {
  buildResult: "passed",
  ci: {
    runAttempt: "1",
    runId: "123456",
    workflowRef: "owner/repo/.github/workflows/app-ci.yml@refs/pull/1/merge",
  },
  commitSha,
  digests: {
    generatedClientSha256: digest("a"),
    generatedModelSha256: digest("b"),
    schemaRegistrySha256: digest("c"),
  },
  environment: "preview",
  previewName,
  probe,
  probeResult: "passed",
  project: "sourcera/sourcera",
  sourceChecksum: digest("d"),
  verificationResult: "passed",
} as const;

test("foundation evidence binds source, schema, builds, probe, and CI", () => {
  const evidence = createConvexFoundationEvidence(input);
  assert.equal(evidence.event, "r0_convex_foundation_evidence");
  assert.equal(evidence.outcome, "passed");
  assert.deepEqual(evidence.identity, {
    commitSha,
    environment: "preview",
    previewName,
    project: "sourcera/sourcera",
  });
  assert.deepEqual(
    evidence.builds.map((build) => [build.application, build.result]),
    [
      ["marketplace", "passed"],
      ["buyer", "passed"],
      ["seller", "passed"],
    ],
  );
  assert.deepEqual(evidence.fixtures, {
    duplicateIndex: "passed",
    duplicateTable: "passed",
    missingFragment: "passed",
    ownership: "passed",
    polling: "passed",
    redaction: "passed",
    unregisteredFragment: "passed",
  });
  assert.deepEqual(evidence.probe, probe);
  assert.doesNotMatch(JSON.stringify(evidence), /CONVEX_DEPLOY_KEY|nonceHash/);
});

test("foundation failure evidence preserves only bounded progress counts", () => {
  const evidence = createConvexFoundationFailureEvidence({
    ...input,
    probe: {
      attemptedSampleCount: 7,
      cleanup: { clearedSampleCount: 6, result: "failed" },
      sampleCount: 6,
    },
    probeResult: "failed",
  });
  assert.equal(evidence.outcome, "failed");
  assert.equal(evidence.probe.attemptedSampleCount, 7);
  assert.equal(evidence.probe.sampleCount, 6);
  assert.equal(evidence.probe.cleanup.clearedSampleCount, 6);
  assert.equal(evidence.probe.cleanup.result, "failed");
  assert.equal(evidence.probe.assertions.length, 2);
  assert.doesNotMatch(JSON.stringify(evidence), /nonceHash|authorization|secret/i);
});

test("foundation failure evidence stays schema-valid when every input is missing or unsafe", () => {
  const evidence = createConvexFoundationFailureEvidence({
    buildResult: undefined,
    ci: undefined,
    commitSha: "credential-value",
    digests: undefined,
    environment: "credential-value",
    previewName: `credential-value-${"0".repeat(40)}`,
    probe: {
      attemptedSampleCount: 999,
      authorization: "credential-value",
      cleanup: { clearedSampleCount: -1, result: "passed" },
      sampleCount: 999,
    },
    probeResult: undefined,
    project: "credential-value",
    sourceChecksum: "credential-value",
    verificationResult: undefined,
  } as never);

  const missingCommitSha = "0".repeat(40);
  const missingDigest = "0".repeat(64);
  assert.equal(evidence.outcome, "failed");
  assert.deepEqual(evidence.identity, {
    commitSha: missingCommitSha,
    environment: "ci",
    previewName: `unavailable-${missingCommitSha}`,
    project: "unknown/unknown",
  });
  assert.deepEqual(evidence.digests, {
    generatedClientSha256: missingDigest,
    generatedModelSha256: missingDigest,
    schemaRegistrySha256: missingDigest,
  });
  assert.equal(evidence.source.checksum, missingDigest);
  assert.deepEqual(evidence.ci, {
    runAttempt: "unknown",
    runId: "unknown",
    workflowRef: "unknown",
    result: "failed",
  });
  assert.ok(evidence.builds.every((build) => build.result === "failed"));
  assert.ok(
    Object.values(evidence.fixtures).every((result) => result === "failed"),
  );
  assert.equal(evidence.probe.attemptedSampleCount, 0);
  assert.equal(evidence.probe.cleanup.result, "failed");
  assert.doesNotMatch(JSON.stringify(evidence), /credential-value/);
});

test("foundation evidence fails closed on unproved or mismatched inputs", () => {
  assert.throws(
    () =>
      createConvexFoundationEvidence({
        ...input,
        verificationResult: "failed",
      }),
    /verification must pass/,
  );
  assert.throws(
    () =>
      createConvexFoundationEvidence({
        ...input,
        probe: {
          ...probe,
          assertions: [
            { ...probe.assertions[0], commitSha: "f".repeat(40) },
            probe.assertions[1],
          ],
        },
      }),
    /probe identity mismatch/,
  );
  assert.throws(
    () =>
      createConvexFoundationEvidence({
        ...input,
        probe: { ...probe, cleanup: { ...probe.cleanup, result: "failed" } },
      }),
    /probe cleanup must pass/,
  );
});
