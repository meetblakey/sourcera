import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "../../app/api/health/route";
import {
  createHealthFailurePayload,
  createHealthPayload,
  readRequiredDeploymentIdentity,
} from "../../lib/deployment-health";

test("health route returns a non-cacheable, safe receipt", async () => {
  const previous = {
    commitSha: process.env.SOURCERA_COMMIT_SHA,
    domain: process.env.SOURCERA_DOMAIN,
    environment: process.env.SOURCERA_ENV,
  };
  process.env.SOURCERA_COMMIT_SHA =
    "0123456789abcdef0123456789abcdef01234567";
  process.env.SOURCERA_DOMAIN = "marketplace";
  process.env.SOURCERA_ENV = "test";

  const response = await GET();
  const body = await response.json();

  restoreEnvironment("SOURCERA_COMMIT_SHA", previous.commitSha);
  restoreEnvironment("SOURCERA_DOMAIN", previous.domain);
  restoreEnvironment("SOURCERA_ENV", previous.environment);

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
  assert.equal(
    body.commitSha,
    "0123456789abcdef0123456789abcdef01234567",
  );
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

test("production health fails closed without deployment identity", () => {
  assert.throws(
    () =>
      createHealthPayload(
        { NODE_ENV: "production" },
        new Date("2026-07-14T12:00:00.000Z"),
        "marketplace",
      ),
    /Missing required deployment environment keys/,
  );
});

test("local health fallback is development-only", () => {
  assert.deepEqual(
    createHealthPayload(
      { NODE_ENV: "development" },
      new Date("2026-07-14T12:00:00.000Z"),
      "marketplace",
    ),
    {
      checkedAt: "2026-07-14T12:00:00.000Z",
      commitSha: "local",
      domain: "marketplace",
      environment: "local",
      service: "sourcera",
      status: "ok",
    },
  );
});

test("health failure telemetry is safe and explicit", () => {
  const failure = createHealthFailurePayload(
    {
      NODE_ENV: "production",
      SOURCERA_DOMAIN: "marketplace",
      WORKOS_API_KEY: "must-not-leak",
    },
    "marketplace",
    new Date("2026-07-14T12:00:00.000Z"),
  );

  assert.deepEqual(failure, {
    assertion: "domain-health",
    checkedAt: "2026-07-14T12:00:00.000Z",
    commitSha: "missing",
    domain: "marketplace",
    environment: "unknown",
    event: "domain_deployment_health_result",
    result: "failed",
  });
  assert.equal(JSON.stringify(failure).includes("must-not-leak"), false);
});

test("health failure telemetry replaces invalid metadata with sentinels", () => {
  const failure = createHealthFailurePayload(
    {
      SOURCERA_COMMIT_SHA: "secret-token-value",
      SOURCERA_ENV: "secret_environment_value",
    },
    "buyer",
    new Date("2026-07-14T12:00:00.000Z"),
  );

  assert.equal(failure.commitSha, "invalid");
  assert.equal(failure.environment, "invalid");
  assert.equal(JSON.stringify(failure).includes("secret"), false);
});

function restoreEnvironment(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}
