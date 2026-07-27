const PREVIEW_GIT_COMMIT_SHA = /^[a-f0-9]{40}$/;
const PREVIEW_NAME = /^[a-z0-9](?:[a-z0-9-]{0,62})$/;
const SHA256 = /^[a-f0-9]{64}$/;
const PREVIEW_ENVIRONMENTS = new Set(["ci", "preview", "staging", "test"]);

export const PREVIEW_PROBE_MAX_SKEW_MS = 5 * 60 * 1_000;
export const PREVIEW_PROBE_CAPABILITY_TTL_MS = 15 * 60 * 1_000;
export const MAX_ACTIVE_PREVIEW_PROBES = 100;

export interface FoundationProbePayload {
  commitSha: string;
  environment: string;
  issuedAt: number;
  nonceHash: string;
  sample: number;
}

export interface ConvexPreviewRuntimeIdentity {
  commitSha: string;
  environment: string;
  previewName: string;
}

export function assertConvexPreviewProbeCapabilityActive(
  expiresAt: number,
  now = Date.now(),
): void {
  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt - now > PREVIEW_PROBE_CAPABILITY_TTL_MS
  ) {
    throw new Error("Preview probe capability is expired or invalid");
  }
}

export function assertConvexPreviewProbeRuntime(
  payload: FoundationProbePayload,
  runtimeIdentity: ConvexPreviewRuntimeIdentity,
  now = Date.now(),
): void {
  assertConvexPreviewProbeCleanupRuntime(payload, runtimeIdentity);
  if (isFoundationProbeExpired(payload, now)) {
    throw new Error("Preview probe timestamp is invalid");
  }
}

export function assertConvexPreviewProbeCleanupRuntime(
  payload: FoundationProbePayload,
  runtimeIdentity: ConvexPreviewRuntimeIdentity,
): void {
  if (!PREVIEW_GIT_COMMIT_SHA.test(payload.commitSha)) {
    throw new Error(
      "commitSha must be an exact lowercase 40-character Git SHA",
    );
  }
  if (!PREVIEW_ENVIRONMENTS.has(payload.environment)) {
    throw new Error("environment must be non-production");
  }
  if (!SHA256.test(payload.nonceHash)) {
    throw new Error("nonceHash must be a lowercase SHA-256 digest");
  }
  if (
    !Number.isInteger(payload.sample) ||
    payload.sample < 1 ||
    payload.sample > MAX_ACTIVE_PREVIEW_PROBES
  ) {
    throw new Error("sample must be an integer from 1 to 100");
  }
  if (!Number.isSafeInteger(payload.issuedAt) || payload.issuedAt <= 0) {
    throw new Error("issuedAt must be a positive safe-integer epoch timestamp");
  }
  if (
    !PREVIEW_GIT_COMMIT_SHA.test(runtimeIdentity.commitSha) ||
    !PREVIEW_ENVIRONMENTS.has(runtimeIdentity.environment) ||
    !PREVIEW_NAME.test(runtimeIdentity.previewName) ||
    !runtimeIdentity.previewName.endsWith(`-${runtimeIdentity.commitSha}`) ||
    payload.commitSha !== runtimeIdentity.commitSha ||
    payload.environment !== runtimeIdentity.environment
  ) {
    throw new Error("Preview probe does not match the deployed Preview build");
  }
}

export function isFoundationProbeExpired(
  payload: Pick<FoundationProbePayload, "issuedAt">,
  now = Date.now(),
): boolean {
  return (
    !Number.isSafeInteger(payload.issuedAt) ||
    payload.issuedAt <= 0 ||
    Math.abs(now - payload.issuedAt) > PREVIEW_PROBE_MAX_SKEW_MS
  );
}

export function foundationProbePayloadMatches(
  left: FoundationProbePayload,
  right: FoundationProbePayload,
): boolean {
  return (
    left.commitSha === right.commitSha &&
    left.environment === right.environment &&
    left.issuedAt === right.issuedAt &&
    left.nonceHash === right.nonceHash &&
    left.sample === right.sample
  );
}
