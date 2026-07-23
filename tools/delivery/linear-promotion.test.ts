import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  assertFreshLinearCapture,
  assertLinearArtifactDigest,
  assertLinearPromotionHead,
  canonicalLinearRunSource,
} from "./lib/linear-promotion.js";
import { atomicReplace } from "./promote-linear-candidate.js";

const SOURCE = {
  repository: "meetblakey/sourcera",
  commit: "a".repeat(40),
  ref: "refs/heads/main",
  runId: "123",
  runAttempt: "2",
};

test("promotion accepts only the exact canonical main run and checkout", () => {
  assert.deepEqual(
    canonicalLinearRunSource({
      GITHUB_REPOSITORY: SOURCE.repository,
      GITHUB_SHA: SOURCE.commit,
      GITHUB_REF: SOURCE.ref,
      GITHUB_RUN_ID: SOURCE.runId,
      GITHUB_RUN_ATTEMPT: SOURCE.runAttempt,
    }),
    SOURCE,
  );
  assert.doesNotThrow(() => assertLinearPromotionHead(SOURCE, SOURCE.commit));
  assert.throws(
    () =>
      canonicalLinearRunSource({
        GITHUB_REPOSITORY: SOURCE.repository,
        GITHUB_SHA: SOURCE.commit,
        GITHUB_REF: "refs/heads/feature",
        GITHUB_RUN_ID: SOURCE.runId,
        GITHUB_RUN_ATTEMPT: SOURCE.runAttempt,
      }),
    /canonical main CI/,
  );
  assert.throws(
    () => assertLinearPromotionHead(SOURCE, "b".repeat(40)),
    /checkout HEAD/,
  );
});

test("promotion rejects stale, future-dated, and unauthenticated handoffs", () => {
  const now = Date.parse("2026-07-23T01:00:00.000Z");
  assert.doesNotThrow(() =>
    assertFreshLinearCapture("2026-07-23T00:31:00.000Z", now),
  );
  assert.throws(
    () => assertFreshLinearCapture("2026-07-23T00:29:59.000Z", now),
    /stale/,
  );
  assert.throws(
    () => assertFreshLinearCapture("2026-07-23T01:01:01.000Z", now),
    /future-dated/,
  );
  assert.equal(assertLinearArtifactDigest("c".repeat(64)), "c".repeat(64));
  assert.throws(() => assertLinearArtifactDigest("not-a-digest"), /digest/);
});

test("promotion atomically replaces only the requested snapshot", () => {
  const root = mkdtempSync(join(tmpdir(), "linear-promotion-"));
  const snapshot = join(root, "linear-snapshot.json");
  try {
    writeFileSync(snapshot, "baseline\n", { mode: 0o640 });
    atomicReplace(snapshot, "candidate\n");
    assert.equal(readFileSync(snapshot, "utf8"), "candidate\n");
    assert.equal(statSync(snapshot).mode & 0o777, 0o640);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
