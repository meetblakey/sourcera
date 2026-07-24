import type { LinearRunSource } from "./linear-candidate-receipt.js";

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SHA256 = /^[a-f0-9]{64}$/;

export const LINEAR_CAPTURE_MAX_AGE_MS = 30 * 60 * 1000;
export const LINEAR_CAPTURE_FUTURE_TOLERANCE_MS = 60 * 1000;

export function canonicalLinearRunSource(
  environment: NodeJS.ProcessEnv = process.env,
): LinearRunSource {
  const required = (name: string): string => {
    const value = environment[name]?.trim();
    if (!value) throw new Error(`${name} is required`);
    return value;
  };
  const source = {
    repository: required("GITHUB_REPOSITORY"),
    commit: required("GITHUB_SHA"),
    ref: required("GITHUB_REF"),
    runId: required("GITHUB_RUN_ID"),
    runAttempt: required("GITHUB_RUN_ATTEMPT"),
  };
  if (
    source.repository !== "meetblakey/sourcera" ||
    !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(source.commit) ||
    source.ref !== "refs/heads/main" ||
    !/^[1-9]\d*$/.test(source.runId) ||
    !/^[1-9]\d*$/.test(source.runAttempt)
  ) {
    throw new Error("Linear promotion source is not canonical main CI");
  }
  return source;
}

export function assertLinearPromotionHead(
  source: LinearRunSource,
  head: string,
): void {
  if (source.commit !== head.trim()) {
    throw new Error("Linear promotion source commit does not match checkout HEAD");
  }
}

export function assertFreshLinearCapture(
  capturedAt: string,
  nowMs = Date.now(),
  maximumAgeMs = LINEAR_CAPTURE_MAX_AGE_MS,
): void {
  if (!ISO_UTC.test(capturedAt)) {
    throw new Error("Linear capture timestamp is invalid");
  }
  const capturedMs = Date.parse(capturedAt);
  if (
    !Number.isFinite(capturedMs) ||
    capturedMs > nowMs + LINEAR_CAPTURE_FUTURE_TOLERANCE_MS ||
    nowMs - capturedMs > maximumAgeMs
  ) {
    throw new Error("Linear capture is stale or future-dated");
  }
}

export function assertLinearArtifactDigest(value: string): string {
  const digest = value.trim().toLowerCase();
  if (!SHA256.test(digest)) {
    throw new Error("Linear handoff artifact digest is invalid");
  }
  return digest;
}
