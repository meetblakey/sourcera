import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  assertConvexPreviewProbeCapabilityActive,
  assertConvexPreviewProbeCleanupRuntime,
  assertConvexPreviewProbeRuntime,
  foundationProbePayloadMatches,
  isFoundationProbeExpired,
} from "../../convex/lib/foundationProbe";

const commitSha = "0123456789abcdef0123456789abcdef01234567";
const previewName = `codex-pla-282-${commitSha}`;
const now = 1_800_000_000_000;
const payload = {
  commitSha,
  environment: "preview",
  issuedAt: now,
  nonceHash: "a".repeat(64),
  sample: 1,
};

test("Preview probes must exactly match the stamped runtime identity", () => {
  assert.doesNotThrow(() =>
    assertConvexPreviewProbeRuntime(
      payload,
      { commitSha, environment: "preview", previewName },
      now,
    ),
  );

  for (const runtimeIdentity of [
    {
      commitSha: "__UNSTAMPED_CONVEX_BUILD__",
      environment: "preview",
      previewName,
    },
    {
      commitSha,
      environment: "__UNSTAMPED_CONVEX_ENVIRONMENT__",
      previewName,
    },
    { commitSha, environment: "production", previewName },
    { commitSha: "f".repeat(40), environment: "preview", previewName },
    { commitSha, environment: "preview", previewName: "wrong-preview" },
  ]) {
    assert.throws(
      () => assertConvexPreviewProbeRuntime(payload, runtimeIdentity, now),
      /deployed Preview build/,
    );
  }

  assert.throws(
    () =>
      assertConvexPreviewProbeRuntime(
        { ...payload, commitSha: commitSha.toUpperCase() },
        { commitSha, environment: "preview", previewName },
        now,
      ),
    /commitSha must be an exact lowercase 40-character Git SHA/,
  );
  assert.throws(
    () =>
      assertConvexPreviewProbeRuntime(
        { ...payload, environment: "staging" },
        { commitSha, environment: "preview", previewName },
        now,
      ),
    /deployed Preview build/,
  );
});

test("Preview probes reject stale or malformed payloads", () => {
  const runtimeIdentity = { commitSha, environment: "preview", previewName };
  assert.throws(
    () =>
      assertConvexPreviewProbeRuntime(
        { ...payload, issuedAt: now - 5 * 60 * 1_000 - 1 },
        runtimeIdentity,
        now,
      ),
    /timestamp is invalid/,
  );
  assert.throws(
    () =>
      assertConvexPreviewProbeRuntime(
        { ...payload, nonceHash: "A".repeat(64) },
        runtimeIdentity,
        now,
      ),
    /SHA-256 digest/,
  );
  assert.throws(
    () =>
      assertConvexPreviewProbeRuntime(
        { ...payload, sample: 101 },
        runtimeIdentity,
        now,
      ),
    /sample must be an integer from 1 to 100/,
  );
});

test("Preview probe capabilities expire and cannot grant an extended lease", () => {
  assert.doesNotThrow(() =>
    assertConvexPreviewProbeCapabilityActive(now + 15 * 60 * 1_000, now),
  );
  assert.throws(
    () => assertConvexPreviewProbeCapabilityActive(now, now),
    /expired or invalid/,
  );
  assert.throws(
    () =>
      assertConvexPreviewProbeCapabilityActive(
        now + 15 * 60 * 1_000 + 1,
        now,
      ),
    /expired or invalid/,
  );
});

test("idempotency and cleanup require an exact five-field payload match", () => {
  assert.equal(foundationProbePayloadMatches(payload, payload), true);
  for (const changed of [
    { ...payload, commitSha: "f".repeat(40) },
    { ...payload, environment: "test" },
    { ...payload, issuedAt: now + 1 },
    { ...payload, nonceHash: "b".repeat(64) },
    { ...payload, sample: 2 },
  ]) {
    assert.equal(foundationProbePayloadMatches(payload, changed), false);
  }
});

test("exact cleanup remains possible after the observation window expires", () => {
  const runtimeIdentity = { commitSha, environment: "preview", previewName };
  const stale = { ...payload, issuedAt: now - 5 * 60 * 1_000 - 1 };
  assert.equal(isFoundationProbeExpired(stale, now), true);
  assert.doesNotThrow(() =>
    assertConvexPreviewProbeCleanupRuntime(stale, runtimeIdentity),
  );
  assert.throws(
    () => assertConvexPreviewProbeRuntime(stale, runtimeIdentity, now),
    /timestamp is invalid/,
  );
});

test("every Preview operation enforces a commit-bound capability, stamped identity, and bounded state", async () => {
  const source = await readFile(
    path.resolve(import.meta.dirname, "../../convex/foundation.ts"),
    "utf8",
  );
  assert.equal(
    source.match(/assertConvexPreviewProbeRuntime\(args,/g)?.length,
    2,
  );
  assert.match(source, /SOURCERA_CONVEX_BUILD_COMMIT_SHA/);
  assert.match(source, /SOURCERA_CONVEX_BUILD_ENVIRONMENT/);
  assert.match(source, /SOURCERA_CONVEX_BUILD_PREVIEW_NAME/);
  assert.match(source, /SOURCERA_CONVEX_PREVIEW_PROBE_TOKEN_SHA256/);
  assert.match(source, /SOURCERA_CONVEX_PREVIEW_PROBE_EXPIRES_AT/);
  assert.match(source, /assertConvexPreviewProbeCapabilityActive/);
  assert.match(source, /export const recordProbe = mutation/);
  assert.match(source, /export const clearProbe = mutation/);
  assert.match(source, /validatePreviewProbe\("record"/);
  assert.match(source, /validatePreviewProbe\("clear"/);
  assert.match(source, /crypto\.subtle\.digest/);
  assert.doesNotMatch(source, /SOURCERA_CONVEX_PREVIEW_PROBE_SECRET/);
  assert.match(source, /isFoundationProbeExpired/);
  assert.match(source, /ctx\.db\.delete\(staleProbe\._id\)/);
  assert.match(source, /take\(MAX_ACTIVE_PREVIEW_PROBES \+ 1\)/);
  assert.match(source, /Probe nonce replay does not match/);
  assert.match(source, /returns: v\.id\("foundationProbes"\)/);
  assert.match(source, /returns: v\.union\(v\.null\(\), probeResult\)/);
  assert.match(source, /buildPreviewName: SOURCERA_CONVEX_BUILD_PREVIEW_NAME/);
  assert.match(source, /deploymentName: deployment\.name/);
  assert.match(source, /returns: v\.boolean\(\)/);
  assert.match(source, /catch \{\s+return null;\s+\}/);
  assert.match(source, /assertConvexPreviewProbeCleanupRuntime/);
  assert.match(
    source,
    /SOURCERA_CONVEX_BUILD_ENVIRONMENT !== "production"/,
  );
});
