import { createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

const DOWNLOAD_TTL_MS = 15 * 60 * 1_000;

export interface PresignedDownloadRequest {
  artifactId: string;
  objectKey: string;
  requesterIp: string;
  residency: string;
}

export interface PresignedDownloadPolicyV1 {
  version: 1;
  artifactId: string;
  objectKey: string;
  requesterIpDigest: string;
  residency: string;
  mintedAtMs: number;
  expiresAtMs: number;
}

export class PresignedDownloadDeniedError extends Error {
  constructor() {
    super("Presigned download denied");
    this.name = "PresignedDownloadDeniedError";
  }
}

function hasValidExactBinding(value: unknown): value is {
  artifactId: string;
  objectKey: string;
  residency: string;
} {
  if (typeof value !== "object" || value === null) return false;
  const binding = value as Record<string, unknown>;
  return [binding.artifactId, binding.objectKey, binding.residency].every(
    (claim) => typeof claim === "string" && claim.trim().length > 0,
  );
}

function assertMintInput(request: PresignedDownloadRequest, mintedAtMs: number) {
  if (
    !hasValidExactBinding(request) ||
    typeof request.requesterIp !== "string" ||
    request.requesterIp.length === 0 ||
    !Number.isSafeInteger(mintedAtMs) ||
    mintedAtMs < 0 ||
    !Number.isSafeInteger(mintedAtMs + DOWNLOAD_TTL_MS)
  ) {
    throw new Error("Complete presigned-download binding is required");
  }
}

function decodeDigest(value: string): Buffer {
  if (!/^[A-Za-z0-9_-]{43}$/.test(value)) {
    throw new Error("Invalid requester IP digest");
  }
  const digest = Buffer.from(value, "base64url");
  if (digest.byteLength !== 32 || digest.toString("base64url") !== value) {
    throw new Error("Invalid requester IP digest");
  }
  return digest;
}

export function digestRequesterIp(
  requesterIp: string,
  bindingSecret: Uint8Array,
): string {
  if (isIP(requesterIp) === 0 || bindingSecret.byteLength < 32) {
    throw new Error("Requester IP and a 32-byte binding secret are required");
  }
  return createHmac("sha256", Buffer.from(bindingSecret))
    .update(requesterIp, "utf8")
    .digest("base64url");
}

export function mintPresignedDownloadPolicy(
  request: PresignedDownloadRequest,
  bindingSecret: Uint8Array,
  mintedAtMs: number,
): PresignedDownloadPolicyV1 {
  assertMintInput(request, mintedAtMs);

  return {
    version: 1,
    artifactId: request.artifactId,
    objectKey: request.objectKey,
    requesterIpDigest: digestRequesterIp(request.requesterIp, bindingSecret),
    residency: request.residency,
    mintedAtMs,
    expiresAtMs: mintedAtMs + DOWNLOAD_TTL_MS,
  };
}

export function assertPresignedDownloadAllowed(
  policy: PresignedDownloadPolicyV1,
  request: PresignedDownloadRequest,
  bindingSecret: Uint8Array,
  nowMs: number,
): void {
  try {
    if (
      !hasValidExactBinding(policy) ||
      !hasValidExactBinding(request) ||
      policy.version !== 1 ||
      !Number.isSafeInteger(policy.mintedAtMs) ||
      !Number.isSafeInteger(policy.expiresAtMs) ||
      !Number.isSafeInteger(nowMs) ||
      policy.expiresAtMs !== policy.mintedAtMs + DOWNLOAD_TTL_MS ||
      nowMs < policy.mintedAtMs ||
      nowMs >= policy.expiresAtMs
    ) {
      throw new Error("Policy is inactive or invalid");
    }
    if (
      policy.artifactId !== request.artifactId ||
      policy.objectKey !== request.objectKey ||
      policy.residency !== request.residency
    ) {
      throw new Error("Artifact, object key, or residency mismatch");
    }
    const expectedDigest = decodeDigest(
      digestRequesterIp(request.requesterIp, bindingSecret),
    );
    const policyDigest = decodeDigest(policy.requesterIpDigest);
    if (
      expectedDigest.byteLength !== policyDigest.byteLength ||
      !timingSafeEqual(expectedDigest, policyDigest)
    ) {
      throw new Error("Requester IP mismatch");
    }
  } catch {
    throw new PresignedDownloadDeniedError();
  }
}
