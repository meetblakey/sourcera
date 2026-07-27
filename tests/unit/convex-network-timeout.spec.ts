import assert from "node:assert/strict";
import test from "node:test";

import { withConvexNetworkTimeout } from "../../scripts/lib/convex-network-timeout";

test("Convex network calls reject within their explicit deadline", async () => {
  const startedAt = Date.now();
  await assert.rejects(
    withConvexNetworkTimeout(
      new Promise<never>(() => undefined),
      20,
      "record probe",
    ),
    /record probe timed out/,
  );
  assert.ok(Date.now() - startedAt < 500);
});

test("Convex network call deadlines do not replace provider failures", async () => {
  await assert.rejects(
    withConvexNetworkTimeout(
      Promise.reject(new Error("provider rejected the request")),
      1_000,
      "clear probe",
    ),
    /provider rejected the request/,
  );
});
