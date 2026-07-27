import assert from "node:assert/strict";
import test from "node:test";

import {
  assertPresignedDownloadAllowed,
  mintPresignedDownloadPolicy,
  PresignedDownloadDeniedError,
  type PresignedDownloadPolicyV1,
  type PresignedDownloadRequest,
} from "../../packages/server-security/src/presigned-download-policy";

const bindingSecret = Uint8Array.from(
  { length: 32 },
  (_, index) => 200 - index,
);
const mintedAtMs = 1_800_000_000_000;
const request: PresignedDownloadRequest = {
  artifactId: "artifact_exact_01",
  objectKey: "exports/org_01/artifact_exact_01.zip",
  requesterIp: "203.0.113.7",
  residency: "eu",
};

test("minting produces a 15-minute policy with only a requester IP digest", () => {
  const policy = mintPresignedDownloadPolicy(
    request,
    bindingSecret,
    mintedAtMs,
  );

  assert.deepEqual(
    {
      version: policy.version,
      artifactId: policy.artifactId,
      objectKey: policy.objectKey,
      residency: policy.residency,
      mintedAtMs: policy.mintedAtMs,
      expiresAtMs: policy.expiresAtMs,
    },
    {
      version: 1,
      artifactId: "artifact_exact_01",
      objectKey: "exports/org_01/artifact_exact_01.zip",
      residency: "eu",
      mintedAtMs,
      expiresAtMs: mintedAtMs + 15 * 60 * 1_000,
    },
  );
  assert.match(policy.requesterIpDigest, /^[A-Za-z0-9_-]{43}$/);
  assert.doesNotMatch(JSON.stringify(policy), /203\.0\.113\.7/);
  assert.doesNotThrow(() =>
    assertPresignedDownloadAllowed(
      policy,
      request,
      bindingSecret,
      mintedAtMs,
    ),
  );
});

test("a different requester IP is denied", () => {
  const policy = mintPresignedDownloadPolicy(
    request,
    bindingSecret,
    mintedAtMs,
  );

  assert.throws(
    () =>
      assertPresignedDownloadAllowed(
        { ...policy },
        { ...request, requesterIp: "198.51.100.9" },
        bindingSecret,
        mintedAtMs,
      ),
    PresignedDownloadDeniedError,
  );
});

test("authorization is exact to one artifact, object key, and residency partition", () => {
  const policy = mintPresignedDownloadPolicy(
    request,
    bindingSecret,
    mintedAtMs,
  );
  const unauthorizedRequests: PresignedDownloadRequest[] = [
    { ...request, artifactId: "artifact_exact_02" },
    { ...request, artifactId: "artifact_exact_01/sibling" },
    { ...request, artifactId: "artifact_exact" },
    { ...request, objectKey: "exports/org_01/artifact_exact_02.zip" },
    {
      ...request,
      objectKey: "exports/org_01/artifact_exact_01.zip/manifest.json",
    },
    { ...request, objectKey: "exports/org_01" },
    { ...request, residency: "us" },
  ];

  for (const unauthorizedRequest of unauthorizedRequests) {
    assert.throws(
      () =>
        assertPresignedDownloadAllowed(
          policy,
          unauthorizedRequest,
          bindingSecret,
          mintedAtMs,
        ),
      PresignedDownloadDeniedError,
    );
  }
});

test("authorization expires at the 15-minute boundary", () => {
  const policy = mintPresignedDownloadPolicy(
    request,
    bindingSecret,
    mintedAtMs,
  );

  assert.doesNotThrow(() =>
    assertPresignedDownloadAllowed(
      policy,
      request,
      bindingSecret,
      mintedAtMs + 15 * 60 * 1_000 - 1,
    ),
  );
  for (const nowMs of [
    mintedAtMs + 15 * 60 * 1_000,
    mintedAtMs + 15 * 60 * 1_000 + 1,
  ]) {
    assert.throws(
      () =>
        assertPresignedDownloadAllowed(
          policy,
          request,
          bindingSecret,
          nowMs,
        ),
      PresignedDownloadDeniedError,
    );
  }
});

test("modified or not-yet-active policy claims fail closed", () => {
  const policy = mintPresignedDownloadPolicy(
    request,
    bindingSecret,
    mintedAtMs,
  );
  const invalidPolicies: PresignedDownloadPolicyV1[] = [
    { ...policy, expiresAtMs: policy.expiresAtMs + 1 },
    { ...policy, mintedAtMs: policy.mintedAtMs + 1 },
    { ...policy, version: 2 } as unknown as PresignedDownloadPolicyV1,
    { ...policy, requesterIpDigest: `${policy.requesterIpDigest.slice(0, -1)}!` },
  ];

  for (const invalidPolicy of invalidPolicies) {
    assert.throws(
      () =>
        assertPresignedDownloadAllowed(
          invalidPolicy,
          request,
          bindingSecret,
          mintedAtMs,
        ),
      PresignedDownloadDeniedError,
    );
  }
});

test("minting rejects a value that is not an IP address", () => {
  assert.throws(() =>
    mintPresignedDownloadPolicy(
      { ...request, requesterIp: "forwarded-for-header" },
      bindingSecret,
      mintedAtMs,
    ),
  );
});

test("minting rejects timestamps that cannot carry a valid lease", () => {
  for (const invalidMintedAtMs of [-1, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() =>
      mintPresignedDownloadPolicy(
        request,
        bindingSecret,
        invalidMintedAtMs,
      ),
    );
  }
});

test("minting rejects blank or non-string artifact, object, and residency bindings", () => {
  const invalidRequests: PresignedDownloadRequest[] = [
    { ...request, artifactId: "" },
    { ...request, objectKey: "" },
    { ...request, residency: "" },
    { ...request, artifactId: " " },
    { ...request, objectKey: "\t" },
    { ...request, residency: "\n" },
    { ...request, artifactId: 7 } as unknown as PresignedDownloadRequest,
    { ...request, objectKey: {} } as unknown as PresignedDownloadRequest,
    { ...request, residency: false } as unknown as PresignedDownloadRequest,
  ];

  for (const invalidRequest of invalidRequests) {
    assert.throws(() =>
      mintPresignedDownloadPolicy(
        invalidRequest,
        bindingSecret,
        mintedAtMs,
      ),
    );
  }
});

test("authorization independently denies malformed policy and request bindings", () => {
  const policy = mintPresignedDownloadPolicy(
    request,
    bindingSecret,
    mintedAtMs,
  );
  const malformedBindings: Array<{
    field: "artifactId" | "objectKey" | "residency";
    value: unknown;
  }> = [
    { field: "artifactId", value: "" },
    { field: "objectKey", value: " " },
    { field: "residency", value: 17 },
    { field: "artifactId", value: undefined },
    { field: "objectKey", value: null },
    { field: "residency", value: [] },
  ];

  for (const { field, value } of malformedBindings) {
    const malformedPolicy = {
      ...policy,
      [field]: value,
    } as unknown as PresignedDownloadPolicyV1;
    const malformedRequest = {
      ...request,
      [field]: value,
    } as unknown as PresignedDownloadRequest;

    assert.throws(
      () =>
        assertPresignedDownloadAllowed(
          malformedPolicy,
          malformedRequest,
          bindingSecret,
          mintedAtMs,
        ),
      PresignedDownloadDeniedError,
    );
  }
});
