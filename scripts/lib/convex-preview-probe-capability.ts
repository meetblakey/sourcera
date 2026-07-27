import { createHash, createHmac } from "node:crypto";

import {
  assertConvexPreviewProbeCapabilityActive,
  PREVIEW_PROBE_CAPABILITY_TTL_MS,
} from "../../convex/lib/foundationProbe";

const FULL_GIT_COMMIT_SHA = /^[a-f0-9]{40}$/;
const PREVIEW_NAME = /^[a-z0-9](?:[a-z0-9-]{0,62})$/;
const PROBE_SEED = /^[a-f0-9]{64}$/;
const EPOCH_MILLISECONDS = /^\d{13}$/;

export function createConvexPreviewProbeExpiresAt(now = Date.now()) {
  if (!Number.isSafeInteger(now) || now <= 0) {
    throw new Error("Preview probe capability requires a valid clock");
  }
  return now + PREVIEW_PROBE_CAPABILITY_TTL_MS;
}

export function readConvexPreviewProbeExpiresAt(
  value: string,
  now = Date.now(),
) {
  if (!EPOCH_MILLISECONDS.test(value)) {
    throw new Error("Preview probe capability expiry must be epoch milliseconds");
  }
  const expiresAt = Number(value);
  assertConvexPreviewProbeCapabilityActive(expiresAt, now);
  return expiresAt;
}

export function deriveConvexPreviewProbeToken(
  probeSeed: string,
  commitSha: string,
  previewName: string,
) {
  if (!PROBE_SEED.test(probeSeed)) {
    throw new Error("Preview probe capability requires its protected seed");
  }
  if (!FULL_GIT_COMMIT_SHA.test(commitSha)) {
    throw new Error("Preview probe capability requires an exact Git SHA");
  }
  if (
    !PREVIEW_NAME.test(previewName) ||
    !previewName.endsWith(`-${commitSha}`)
  ) {
    throw new Error("Preview probe capability requires a commit-bound Preview");
  }

  return createHmac("sha256", probeSeed)
    .update("sourcera-convex-preview-probe-v1\n")
    .update(commitSha)
    .update("\n")
    .update(previewName)
    .digest("hex");
}

export function deriveConvexPreviewProbeTokenSha256(
  probeSeed: string,
  commitSha: string,
  previewName: string,
) {
  return createHash("sha256")
    .update(deriveConvexPreviewProbeToken(probeSeed, commitSha, previewName))
    .digest("hex");
}
