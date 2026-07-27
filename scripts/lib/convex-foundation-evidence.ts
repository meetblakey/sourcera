const GIT_SHA = /^[a-f0-9]{40}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const PREVIEW_NAME = /^[a-z0-9](?:[a-z0-9-]{0,62})$/;
const PROJECT = /^[a-z0-9](?:[a-z0-9-]{0,62})\/[a-z0-9](?:[a-z0-9-]{0,62})$/;
const PREVIEW_ENVIRONMENTS = new Set(["ci", "preview", "staging", "test"]);

interface ProbeAssertion {
  assertion: string;
  checkedAt: string;
  commitSha: string;
  deployment: string;
  environment: string;
  event: string;
  observationLatencyMs: number;
  result: string;
}

interface ProbeReceipt {
  assertions: readonly ProbeAssertion[];
  attemptedSampleCount: number;
  cleanup: { clearedSampleCount: number; result: string };
  outcome: string;
  runtimeIdentity: {
    buildCommitSha: string;
    buildEnvironment: string;
    buildPreviewName: string;
    deploymentName: string;
  };
  sampleCount: number;
  zeroCustomerData: boolean;
}

export interface ConvexFoundationEvidenceInput {
  buildResult: string;
  ci: {
    runAttempt: string;
    runId: string;
    workflowRef: string;
  };
  commitSha: string;
  digests: {
    generatedClientSha256: string;
    generatedModelSha256: string;
    schemaRegistrySha256: string;
  };
  environment: string;
  previewName: string;
  probe: ProbeReceipt;
  probeResult: string;
  project: string;
  sourceChecksum: string;
  verificationResult: string;
}

function assertDigest(value: string, label: string) {
  if (!SHA256.test(value)) throw new Error(`${label} must be a SHA-256 digest`);
}

function assertNonEmpty(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label} is required`);
}

function assertCoreEvidenceInput(input: ConvexFoundationEvidenceInput) {
  if (input.verificationResult !== "passed") {
    throw new Error("foundation verification must pass");
  }
  if (input.buildResult !== "passed") {
    throw new Error("all three Convex Preview builds must pass");
  }
  if (!GIT_SHA.test(input.commitSha)) {
    throw new Error("foundation evidence requires a full lowercase Git SHA");
  }
  if (
    !PREVIEW_ENVIRONMENTS.has(input.environment) ||
    !PREVIEW_NAME.test(input.previewName) ||
    !input.previewName.endsWith(`-${input.commitSha}`)
  ) {
    throw new Error("foundation evidence requires one commit-bound Preview identity");
  }
  if (!PROJECT.test(input.project)) {
    throw new Error("foundation evidence project must be team/project");
  }
  assertDigest(input.sourceChecksum, "source checksum");
  assertDigest(input.digests.schemaRegistrySha256, "schema registry digest");
  assertDigest(input.digests.generatedModelSha256, "generated model digest");
  assertDigest(input.digests.generatedClientSha256, "generated client digest");
  assertNonEmpty(input.ci.runId, "CI run ID");
  assertNonEmpty(input.ci.runAttempt, "CI run attempt");
  assertNonEmpty(input.ci.workflowRef, "CI workflow ref");
}

export function createConvexFoundationEvidence(
  input: ConvexFoundationEvidenceInput,
) {
  assertCoreEvidenceInput(input);
  if (input.probeResult !== "passed") {
    throw new Error("foundation probe process must pass");
  }

  const probe = input.probe;
  if (
    probe.outcome !== "passed" ||
    probe.attemptedSampleCount !== 20 ||
    probe.sampleCount !== 20 ||
    probe.zeroCustomerData !== true
  ) {
    throw new Error("foundation probe must pass 20 zero-customer-data samples");
  }
  if (
    probe.cleanup.result !== "passed" ||
    probe.cleanup.clearedSampleCount !== 20
  ) {
    throw new Error("foundation probe cleanup must pass for all 20 samples");
  }
  if (probe.assertions.length !== 2) {
    throw new Error("foundation probe requires p95 and p99 assertions");
  }
  if (
    probe.runtimeIdentity.buildCommitSha !== input.commitSha ||
    probe.runtimeIdentity.buildEnvironment !== input.environment ||
    probe.runtimeIdentity.buildPreviewName !== input.previewName ||
    !PREVIEW_NAME.test(probe.runtimeIdentity.deploymentName)
  ) {
    throw new Error("foundation probe runtime identity mismatch");
  }
  const expectedAssertions = new Map([
    ["reactive-observation-p95", 500],
    ["reactive-observation-p99", 1_000],
  ]);
  const sanitizedAssertions = probe.assertions.map((assertion) => {
    const threshold = expectedAssertions.get(assertion.assertion);
    if (threshold === undefined) {
      throw new Error("foundation probe contains an unknown assertion");
    }
    expectedAssertions.delete(assertion.assertion);
    if (
      assertion.event !== "convex_foundation_health_result" ||
      assertion.commitSha !== input.commitSha ||
      assertion.deployment !== input.previewName ||
      assertion.environment !== input.environment
    ) {
      throw new Error("foundation probe identity mismatch");
    }
    if (
      assertion.result !== "passed" ||
      !Number.isFinite(assertion.observationLatencyMs) ||
      assertion.observationLatencyMs < 0 ||
      assertion.observationLatencyMs > threshold ||
      !Number.isFinite(Date.parse(assertion.checkedAt))
    ) {
      throw new Error(`${assertion.assertion} did not pass its threshold`);
    }
    return {
      assertion: assertion.assertion,
      checkedAt: assertion.checkedAt,
      commitSha: assertion.commitSha,
      deployment: assertion.deployment,
      environment: assertion.environment,
      event: assertion.event,
      observationLatencyMs: assertion.observationLatencyMs,
      result: "passed" as const,
    };
  });
  if (expectedAssertions.size > 0) {
    throw new Error("foundation probe requires p95 and p99 assertions");
  }

  return {
    schemaVersion: 1,
    event: "r0_convex_foundation_evidence" as const,
    source: {
      requirement: "F-005" as const,
      checksum: input.sourceChecksum,
    },
    identity: {
      commitSha: input.commitSha,
      environment: input.environment,
      previewName: input.previewName,
      project: input.project,
    },
    digests: { ...input.digests },
    fixtures: {
      duplicateIndex: "passed" as const,
      duplicateTable: "passed" as const,
      missingFragment: "passed" as const,
      ownership: "passed" as const,
      polling: "passed" as const,
      redaction: "passed" as const,
      unregisteredFragment: "passed" as const,
    },
    builds: (["marketplace", "buyer", "seller"] as const).map(
      (application) => ({ application, result: "passed" as const }),
    ),
    probe: {
      assertions: sanitizedAssertions,
      attemptedSampleCount: probe.attemptedSampleCount,
      cleanup: {
        clearedSampleCount: probe.cleanup.clearedSampleCount,
        result: "passed" as const,
      },
      outcome: "passed" as const,
      runtimeIdentity: { ...probe.runtimeIdentity },
      sampleCount: probe.sampleCount,
      zeroCustomerData: true as const,
    },
    ci: {
      runAttempt: input.ci.runAttempt,
      runId: input.ci.runId,
      workflowRef: input.ci.workflowRef,
      result: "passed" as const,
    },
    checkedAt: sanitizedAssertions[0].checkedAt,
    outcome: "passed" as const,
  };
}

export interface ConvexFoundationFailureEvidenceInput {
  buildResult?: unknown;
  ci?: unknown;
  commitSha?: unknown;
  digests?: unknown;
  environment?: unknown;
  previewName?: unknown;
  probe?: unknown;
  probeResult?: unknown;
  project?: unknown;
  sourceChecksum?: unknown;
  verificationResult?: unknown;
}

const MISSING_GIT_SHA = "0".repeat(40);
const MISSING_SHA256 = "0".repeat(64);
const SAFE_CI_NUMBER = /^\d{1,20}$/;
const SAFE_WORKFLOW_REF = /^[A-Za-z0-9._/@-]{1,256}$/;

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function safeString(
  value: unknown,
  pattern: RegExp,
  fallback: string,
): string {
  return typeof value === "string" && pattern.test(value) ? value : fallback;
}

function boundedProbeCount(value: unknown, maximum: number) {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= maximum
    ? Number(value)
    : 0;
}

export function createConvexFoundationFailureEvidence(
  input: ConvexFoundationFailureEvidenceInput = {},
) {
  const hasValidCommitSha =
    typeof input.commitSha === "string" && GIT_SHA.test(input.commitSha);
  const commitSha = hasValidCommitSha ? input.commitSha : MISSING_GIT_SHA;
  const environment =
    typeof input.environment === "string" &&
    PREVIEW_ENVIRONMENTS.has(input.environment)
      ? input.environment
      : "ci";
  const previewNameCandidate = safeString(input.previewName, PREVIEW_NAME, "");
  const previewName =
    hasValidCommitSha && previewNameCandidate.endsWith(`-${commitSha}`)
    ? previewNameCandidate
    : `unavailable-${commitSha}`;
  const project = safeString(input.project, PROJECT, "unknown/unknown");
  const sourceChecksum = safeString(
    input.sourceChecksum,
    SHA256,
    MISSING_SHA256,
  );
  const rawDigests = recordValue(input.digests);
  const digests = {
    generatedClientSha256: safeString(
      rawDigests?.generatedClientSha256,
      SHA256,
      MISSING_SHA256,
    ),
    generatedModelSha256: safeString(
      rawDigests?.generatedModelSha256,
      SHA256,
      MISSING_SHA256,
    ),
    schemaRegistrySha256: safeString(
      rawDigests?.schemaRegistrySha256,
      SHA256,
      MISSING_SHA256,
    ),
  };
  const rawCi = recordValue(input.ci);
  const ci = {
    runAttempt: safeString(rawCi?.runAttempt, SAFE_CI_NUMBER, "unknown"),
    runId: safeString(rawCi?.runId, SAFE_CI_NUMBER, "unknown"),
    workflowRef: safeString(
      rawCi?.workflowRef,
      SAFE_WORKFLOW_REF,
      "unknown",
    ),
  };
  const rawProbe = recordValue(input.probe);
  const attemptedSampleCount = boundedProbeCount(
    rawProbe?.attemptedSampleCount,
    20,
  );
  const sampleCount = Math.min(
    boundedProbeCount(rawProbe?.sampleCount, 20),
    attemptedSampleCount,
  );
  const rawCleanup =
    rawProbe?.cleanup && typeof rawProbe.cleanup === "object"
      ? (rawProbe.cleanup as Record<string, unknown>)
      : undefined;
  const clearedSampleCount = Math.min(
    boundedProbeCount(rawCleanup?.clearedSampleCount, 20),
    attemptedSampleCount,
  );
  const cleanupPassed =
    attemptedSampleCount > 0 &&
    rawCleanup?.result === "passed" &&
    clearedSampleCount === attemptedSampleCount;
  const fixtureResult =
    input.verificationResult === "passed"
      ? ("passed" as const)
      : ("failed" as const);
  const buildResult =
    input.buildResult === "passed" ? ("passed" as const) : ("failed" as const);
  const checkedAt = new Date().toISOString();
  const assertions = [
    ["reactive-observation-p95", 500],
    ["reactive-observation-p99", 1_000],
  ].map(([assertion, observationLatencyMs]) => ({
    assertion,
    checkedAt,
    commitSha,
    deployment: previewName,
    environment,
    event: "convex_foundation_health_result" as const,
    observationLatencyMs,
    result: "failed" as const,
  }));

  return {
    schemaVersion: 1,
    event: "r0_convex_foundation_evidence" as const,
    source: {
      requirement: "F-005" as const,
      checksum: sourceChecksum,
    },
    identity: {
      commitSha,
      environment,
      previewName,
      project,
    },
    digests,
    fixtures: {
      duplicateIndex: fixtureResult,
      duplicateTable: fixtureResult,
      missingFragment: fixtureResult,
      ownership: fixtureResult,
      polling: fixtureResult,
      redaction: fixtureResult,
      unregisteredFragment: fixtureResult,
    },
    builds: (["marketplace", "buyer", "seller"] as const).map(
      (application) => ({ application, result: buildResult }),
    ),
    probe: {
      assertions,
      attemptedSampleCount,
      cleanup: {
        clearedSampleCount,
        result: cleanupPassed ? ("passed" as const) : ("failed" as const),
      },
      outcome: "failed" as const,
      runtimeIdentity: null,
      sampleCount,
      zeroCustomerData: true as const,
    },
    ci: {
      ...ci,
      result: "failed" as const,
    },
    checkedAt,
    outcome: "failed" as const,
  };
}
