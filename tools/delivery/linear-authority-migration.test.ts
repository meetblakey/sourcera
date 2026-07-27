import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  adoptStableMappings,
  validateRecoveryCheckpoint,
} from "./lib/linear-authority-migration.js";

const V4_ONE = "00000000-0000-4000-8000-000000000001";
const V4_TWO = "00000000-0000-4000-8000-000000000002";

test("partial recovery adopts existing identities and leaves missing targets plan-keyed", () => {
  const mappings = adoptStableMappings([
    { legacyId: "old-one", targetPlanKey: "issue:old-one", title: "First", primaryExecutionIdentifier: "exec-one" },
    { legacyId: "old-two", targetPlanKey: "issue:old-two", title: "Second", primaryExecutionIdentifier: "exec-two" },
  ], [{ id: V4_ONE, identifier: "REQ-1", title: "First", teamId: "team", relationKeys: ["related:REQ-1:exec-one"] }], "team");
  assert.equal(mappings[0].issueIdentifier, "REQ-1");
  assert.deepEqual(mappings[1], {
    legacyId: "old-two", targetPlanKey: "issue:old-two", issueUuid: null, issueIdentifier: null, source: "unallocated",
  });
});

test("stable mapping requires one exact related endpoint", () => {
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionIdentifier: "shared" },
    { legacyId: "two", targetPlanKey: "issue:two", title: "Two", primaryExecutionIdentifier: "shared" },
  ], [{ id: V4_ONE, identifier: "REQ-1", title: "One", teamId: "team", relationKeys: ["related:REQ-1:shared"] }], "team"), /2 stable mapping candidates/);
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionIdentifier: "PLA-1" },
  ], [{ id: V4_ONE, identifier: "REQ-1", title: "One", teamId: "team", relationKeys: ["related:REQ-1:PLA-10"] }], "team"), /0 stable mapping candidates/);
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionIdentifier: "PLA-1" },
  ], [{ id: V4_ONE, identifier: "REQ-1", title: "One", teamId: "team", relationKeys: ["blocks:REQ-1:PLA-1"] }], "team"), /0 stable mapping candidates/);
});

test("stable receipt requires exact UUID, identifier, and title", () => {
  const plan = [{ legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionIdentifier: "exec" }];
  const receipt = [{ legacyId: "one", targetPlanKey: "issue:one", issueUuid: V4_ONE, issueIdentifier: "REQ-1", source: "receipt" as const }];
  assert.throws(() => adoptStableMappings(plan, [{ id: V4_ONE, identifier: "REQ-2", title: "One", teamId: "team", relationKeys: [] }], "team", receipt), /Stable mapping mismatch/);
  assert.throws(() => adoptStableMappings(plan, [{ id: V4_ONE, identifier: "REQ-1", title: "Changed", teamId: "team", relationKeys: [] }], "team", receipt), /Stable mapping mismatch/);
  assert.throws(() => adoptStableMappings(plan, [{ id: V4_TWO, identifier: "REQ-1", title: "One", teamId: "team", relationKeys: [] }], "team", receipt), /Stable mapping mismatch/);
});

test("same-title, unexpected, and archived live rows fail closed", () => {
  const plan = [{ legacyId: "one", targetPlanKey: "issue:one", title: "Same", primaryExecutionIdentifier: "PLA-1" }];
  const receipt = [{ legacyId: "one", targetPlanKey: "issue:one", issueUuid: V4_ONE, issueIdentifier: "REQ-1", source: "receipt" as const }];
  assert.throws(() => adoptStableMappings(plan, [
    { id: V4_ONE, identifier: "REQ-1", title: "Same", teamId: "team", relationKeys: [] },
    { id: V4_TWO, identifier: "REQ-2", title: "Same", teamId: "team", relationKeys: [] },
  ], "team", receipt), /0 stable mapping candidates/);
  assert.throws(() => adoptStableMappings(plan, [{ id: V4_TWO, identifier: "REQ-99", title: "Unexpected", teamId: "team", relationKeys: [] }], "team"), /0 stable mapping candidates/);
  assert.throws(() => adoptStableMappings(plan, [{ id: V4_ONE, identifier: "REQ-1", title: "Same", teamId: "team", relationKeys: [], archivedAt: "2026-07-27T00:00:00Z" }], "team"), /archived/);
});

test("recovery checkpoint is digest-pinned, unique, planned, and UUIDv4", () => {
  const raw = JSON.stringify({ schemaVersion: 1, mappings: [{ legacyId: "F-001", issueUuid: V4_ONE, issueIdentifier: "REQ-1" }] });
  const digest = createHash("sha256").update(raw).digest("hex");
  assert.deepEqual(validateRecoveryCheckpoint(raw, digest, new Set(["F-001"])), [{
    legacyId: "F-001", targetPlanKey: "issue:F-001", issueUuid: V4_ONE, issueIdentifier: "REQ-1", source: "receipt",
  }]);
  assert.throws(() => validateRecoveryCheckpoint(`${raw}\n`, digest, new Set(["F-001"])), /digest/);
  const uuidV5 = JSON.stringify({ schemaVersion: 1, mappings: [{ legacyId: "F-001", issueUuid: "00000000-0000-5000-8000-000000000001", issueIdentifier: "REQ-1" }] });
  assert.throws(() => validateRecoveryCheckpoint(uuidV5, createHash("sha256").update(uuidV5).digest("hex"), new Set(["F-001"])), /non-v4/);
  assert.throws(() => validateRecoveryCheckpoint(raw, digest, new Set(["F-002"])), /unexpected mapping/);
});

test("runner exposes only offline plan and recovery modes", () => {
  const planRun = spawnSync("tools/spec-lint/node_modules/.bin/tsx", ["tools/delivery/migrate-linear-authority.ts", "--mode", "plan"], { encoding: "utf8" });
  assert.equal(planRun.status, 0, planRun.stderr);
  const plan = JSON.parse(planRun.stdout) as { auditedPlanManifestRequired: boolean; auditedPlanValidated: boolean; applyEnabled: boolean; preflightEnabled: boolean };
  assert.equal(plan.auditedPlanManifestRequired, true);
  assert.equal(plan.auditedPlanValidated, false);
  assert.equal(plan.applyEnabled, false);
  assert.equal(plan.preflightEnabled, false);
  const disabledRun = spawnSync("tools/spec-lint/node_modules/.bin/tsx", ["tools/delivery/migrate-linear-authority.ts", "--mode", "apply"], { encoding: "utf8" });
  assert.notEqual(disabledRun.status, 0);
  assert.match(disabledRun.stderr, /Mode must be plan or recovery-check/);
});

test("delivery workflow is write-free and keeps read-only CI ref-scoped", () => {
  const workflow = readFileSync(".github/workflows/delivery-integrity.yml", "utf8");
  assert.match(workflow, /group: delivery-integrity-\$\{\{ github\.workflow \}\}-\$\{\{ github\.ref \}\}/);
  assert.doesNotMatch(workflow, /migrate-linear-authority\.ts|linear_authority_migration|linear-authority-migration:/);
});
