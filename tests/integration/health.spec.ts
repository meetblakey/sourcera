import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "../../app/api/health/route";
import {
  createHealthPayload,
  readRequiredDeploymentIdentity,
} from "../../lib/deployment-health";

test("health route returns a non-cacheable, safe receipt", async () => {
  const response = await GET();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(Object.keys(body).sort(), [
    "checkedAt",
    "commitSha",
    "domain",
    "environment",
    "service",
    "status",
  ]);
  assert.equal(body.domain, "marketplace");
  assert.equal(body.service, "sourcera");
  assert.equal(body.status, "ok");
  assert.match(body.checkedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("deployment identity fails closed when required metadata is absent", () => {
  assert.throws(
    () => readRequiredDeploymentIdentity({}),
    /SOURCERA_ENV, SOURCERA_COMMIT_SHA, SOURCERA_DOMAIN/,
  );
});

test("deployment identity accepts explicit staging metadata", () => {
  assert.deepEqual(
    readRequiredDeploymentIdentity({
      SOURCERA_COMMIT_SHA: "0123456789abcdef0123456789abcdef01234567",
      SOURCERA_DOMAIN: "marketplace",
      SOURCERA_ENV: "staging",
    }, "marketplace"),
    {
      commitSha: "0123456789abcdef0123456789abcdef01234567",
      domain: "marketplace",
      environment: "staging",
    },
  );
});

test("deployment identity rejects a mismatched application domain", () => {
  assert.throws(
    () =>
      readRequiredDeploymentIdentity(
        {
          SOURCERA_COMMIT_SHA: "0123456789abcdef0123456789abcdef01234567",
          SOURCERA_DOMAIN: "seller",
          SOURCERA_ENV: "staging",
        },
        "buyer",
      ),
    /expected buyer, received seller/,
  );
});

test("health payload never copies unrelated environment values", () => {
  const payload = createHealthPayload(
    {
      SOURCERA_COMMIT_SHA: "0123456789abcdef0123456789abcdef01234567",
      SOURCERA_DOMAIN: "marketplace",
      SOURCERA_ENV: "staging",
      WORKOS_API_KEY: "must-not-leak",
    },
    new Date("2026-07-14T12:00:00.000Z"),
    "marketplace",
  );

  assert.equal(JSON.stringify(payload).includes("must-not-leak"), false);
});
