import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  adoptStableMappings,
  AmbiguousMutationError,
  assertExactTwoPassReadback,
  assertPhase1WriteModeAllowed,
  assertWriteContext,
  assertWorkflowWriteFree,
  buildCompensationPlan,
  collectPaginatedRelations,
  diffManagedRelations,
  executeCompensationPlan,
  executeGuardedMutation,
  isUuidV4,
  projectGlobalRelationKeys,
  redactJournalRecord,
  resolveNativeCatalog,
  runSerial,
  stableOperationId,
  validateRecoveryCheckpoint,
  validateUuidV4AllocationManifest,
  type JournalRecord,
  type JournalSink,
  type RedactedJournalRecord,
} from "./lib/linear-authority-migration.js";

class MemoryJournal implements JournalSink {
  redacted: RedactedJournalRecord[] = [];
  backups: Array<JournalRecord & { before: unknown; after: unknown }> = [];
  checkpoints: Array<[string, string]> = [];
  async appendRedacted(record: RedactedJournalRecord) { this.redacted.push(record); }
  async appendBackup(record: JournalRecord & { before: unknown; after: unknown }) { this.backups.push(record); }
  async checkpoint(operationId: string, fingerprint: string) { this.checkpoints.push([operationId, fingerprint]); }
}

const V4_ONE = "00000000-0000-4000-8000-000000000001";
const V4_TWO = "00000000-0000-4000-8000-000000000002";
const V4_THREE = "00000000-0000-4000-8000-000000000003";

test("internal operation IDs are stable and distinct without posing as UUIDs", () => {
  assert.equal(stableOperationId("migration", "one"), stableOperationId("migration", "one"));
  assert.notEqual(stableOperationId("migration", "one"), stableOperationId("migration", "two"));
  assert.equal(isUuidV4(stableOperationId("migration", "one")), false);
});

test("external target allocation requires exact digest, plan, coverage, and UUIDv4", () => {
  const manifest = JSON.stringify({
    schemaVersion: 1,
    planDigest: "plan-sha",
    allocations: [
      { planKey: "issue:F-001", kind: "issue", uuid: V4_ONE },
      { planKey: "relation:blocks:F-001:F-002", kind: "relation", uuid: V4_TWO },
    ],
  });
  const digest = createHash("sha256").update(manifest).digest("hex");
  const expected = new Map([["issue:F-001", "issue" as const], ["relation:blocks:F-001:F-002", "relation" as const]]);
  assert.deepEqual(validateUuidV4AllocationManifest(manifest, digest, "plan-sha", expected, new Set()).allocations.length, 2);
  assert.throws(() => validateUuidV4AllocationManifest(`${manifest}\n`, digest, "plan-sha", expected, new Set()), /digest/);
});

test("external target allocation rejects UUIDv5, duplicate UUIDs, and incomplete coverage", () => {
  const expected = new Map([["issue:F-001", "issue" as const], ["relation:one", "relation" as const]]);
  const validate = (value: unknown) => {
    const raw = JSON.stringify(value);
    return validateUuidV4AllocationManifest(raw, createHash("sha256").update(raw).digest("hex"), "plan-sha", expected, new Set());
  };
  assert.throws(() => validate({ schemaVersion: 1, planDigest: "plan-sha", allocations: [
    { planKey: "issue:F-001", kind: "issue", uuid: "00000000-0000-5000-8000-000000000001" },
    { planKey: "relation:one", kind: "relation", uuid: V4_TWO },
  ] }), /non-v4/);
  assert.throws(() => validate({ schemaVersion: 1, planDigest: "plan-sha", allocations: [
    { planKey: "issue:F-001", kind: "issue", uuid: V4_ONE },
    { planKey: "relation:one", kind: "relation", uuid: V4_ONE },
  ] }), /duplicates UUID/);
  assert.throws(() => validate({ schemaVersion: 1, planDigest: "plan-sha", allocations: [
    { planKey: "issue:F-001", kind: "issue", uuid: V4_ONE },
  ] }), /coverage/);
  assert.throws(() => validate({ schemaVersion: 1, planDigest: "plan-sha", extra: true, allocations: [
    { planKey: "issue:F-001", kind: "issue", uuid: V4_ONE },
    { planKey: "relation:one", kind: "relation", uuid: V4_TWO },
  ] }), /contract/);
  assert.throws(() => validate({ schemaVersion: 1, planDigest: "plan-sha", allocations: [
    { planKey: "issue:F-001", kind: "issue", uuid: V4_ONE, extra: true },
    { planKey: "relation:one", kind: "relation", uuid: V4_TWO },
  ] }), /row is invalid/);
  const collision = JSON.stringify({ schemaVersion: 1, planDigest: "plan-sha", allocations: [
    { planKey: "issue:F-001", kind: "issue", uuid: V4_ONE },
    { planKey: "relation:one", kind: "relation", uuid: V4_TWO },
  ] });
  assert.throws(() => validateUuidV4AllocationManifest(
    collision,
    createHash("sha256").update(collision).digest("hex"),
    "plan-sha",
    expected,
    new Set([V4_TWO]),
  ), /collides with an adopted or live UUID/);
});

test("ambiguous create is attempted once and stops", async () => {
  const journal = new MemoryJournal();
  let mutations = 0;
  await assert.rejects(() => executeGuardedMutation({
    operationId: stableOperationId("op", "create"), action: "issue_create", targetUuid: V4_ONE,
    expectedFingerprint: "expected", before: null, compensation: { action: "archive" },
    mutateOnce: async () => { mutations += 1; throw new Error("timeout"); },
    readAfter: async () => null,
    fingerprintAfter: () => "absent",
  }, journal, 1), AmbiguousMutationError);
  assert.equal(mutations, 1);
  assert.deepEqual(journal.redacted.map((row) => row.phase), ["before", "ambiguous"]);
  assert.equal(journal.checkpoints.length, 0);
});

test("ambiguous response reconciles by durable UUID without retry", async () => {
  const journal = new MemoryJournal();
  let mutations = 0;
  const after = await executeGuardedMutation({
    operationId: stableOperationId("op", "reconcile"), action: "issue_create", targetUuid: V4_TWO,
    expectedFingerprint: "persisted", before: null, compensation: { action: "archive" },
    mutateOnce: async () => { mutations += 1; throw new Error("connection closed"); },
    readAfter: async () => ({ id: V4_TWO }),
    fingerprintAfter: () => "persisted",
  }, journal, 1);
  assert.equal(after.id, V4_TWO);
  assert.equal(mutations, 1);
  assert.deepEqual(journal.checkpoints, [[stableOperationId("op", "reconcile"), "persisted"]]);
});

test("partial recovery adopts existing identities and leaves missing targets plan-keyed", () => {
  const mappings = adoptStableMappings([
    { legacyId: "old-one", targetPlanKey: "issue:old-one", title: "First", primaryExecutionUuid: "exec-one", desiredRelationKeys: [] },
    { legacyId: "old-two", targetPlanKey: "issue:old-two", title: "Second", primaryExecutionUuid: "exec-two", desiredRelationKeys: [] },
  ], [{ id: V4_ONE, identifier: "REQ-1", title: "First", teamId: "team", relationKeys: ["related:REQ-1:exec-one"] }], "team");
  assert.equal(mappings[0].issueIdentifier, "REQ-1");
  assert.equal(mappings[1].issueUuid, null);
  assert.equal(mappings[1].issueIdentifier, null);
  assert.equal(mappings[1].targetPlanKey, "issue:old-two");
  assert.equal(mappings[1].source, "unallocated");
});

test("stable mapping rejects primary-relation collisions", () => {
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionUuid: "shared", desiredRelationKeys: [] },
    { legacyId: "two", targetPlanKey: "issue:two", title: "Two", primaryExecutionUuid: "shared", desiredRelationKeys: [] },
  ], [{ id: "live", identifier: "REQ-1", title: "One", teamId: "team", relationKeys: ["related:live:shared"] }], "team"), /2 stable mapping candidates/);
});

test("stable mapping requires an exact related endpoint", () => {
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionUuid: "PLA-1", desiredRelationKeys: [] },
  ], [{ id: "live", identifier: "REQ-1", title: "One", teamId: "team", relationKeys: ["related:REQ-1:PLA-10"] }], "team"), /0 stable mapping candidates/);
});

test("stable receipt mismatch fails closed", () => {
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionUuid: "exec", desiredRelationKeys: [] },
  ], [{ id: V4_ONE, identifier: "REQ-1", title: "Changed", teamId: "team", relationKeys: [] }], "team", [
    { legacyId: "one", targetPlanKey: "issue:one", issueUuid: V4_ONE, issueIdentifier: "REQ-1", source: "receipt" },
  ]), /Stable mapping mismatch/);
});

test("stable receipt identifier substitution fails closed", () => {
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionUuid: "exec", desiredRelationKeys: [] },
  ], [{ id: V4_ONE, identifier: "REQ-2", title: "One", teamId: "team", relationKeys: [] }], "team", [
    { legacyId: "one", targetPlanKey: "issue:one", issueUuid: V4_ONE, issueIdentifier: "REQ-1", source: "receipt" },
  ]), /Stable mapping mismatch/);
});

test("same title on a different UUID is rejected", () => {
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "Same", primaryExecutionUuid: "PLA-1", desiredRelationKeys: [] },
  ], [
    { id: V4_ONE, identifier: "REQ-1", title: "Same", teamId: "team", relationKeys: [] },
    { id: V4_TWO, identifier: "REQ-2", title: "Same", teamId: "team", relationKeys: [] },
  ], "team", [{ legacyId: "one", targetPlanKey: "issue:one", issueUuid: V4_ONE, issueIdentifier: "REQ-1", source: "receipt" }]), /0 stable mapping candidates/);
});

test("unexpected requirement rows are rejected before mutation", () => {
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionUuid: "PLA-1", desiredRelationKeys: [] },
  ], [{ id: V4_THREE, identifier: "REQ-99", title: "Unexpected", teamId: "team", relationKeys: [] }], "team"), /0 stable mapping candidates/);
});

test("archived requirement rows block recovery", () => {
  assert.throws(() => adoptStableMappings([
    { legacyId: "one", targetPlanKey: "issue:one", title: "One", primaryExecutionUuid: "PLA-1", desiredRelationKeys: [] },
  ], [{ id: V4_ONE, identifier: "REQ-1", title: "One", teamId: "team", relationKeys: [], archivedAt: "2026-07-27T00:00:00Z" }], "team"), /archived/);
});

test("recovery checkpoint is digest-pinned and yields UUID mappings", () => {
  const raw = JSON.stringify({ schemaVersion: 1, mappings: [{ legacyId: "F-001", issueUuid: V4_ONE, issueIdentifier: "REQ-1" }] });
  const digest = createHash("sha256").update(raw).digest("hex");
  assert.deepEqual(validateRecoveryCheckpoint(raw, digest, new Set(["F-001"])), [{ legacyId: "F-001", targetPlanKey: "issue:F-001", issueUuid: V4_ONE, issueIdentifier: "REQ-1", source: "receipt" }]);
  assert.throws(() => validateRecoveryCheckpoint(`${raw}\n`, digest, new Set(["F-001"])), /digest/);
  const uuidV5 = JSON.stringify({ schemaVersion: 1, mappings: [{ legacyId: "F-001", issueUuid: "00000000-0000-5000-8000-000000000001", issueIdentifier: "REQ-1" }] });
  assert.throws(() => validateRecoveryCheckpoint(uuidV5, createHash("sha256").update(uuidV5).digest("hex"), new Set(["F-001"])), /non-v4/);
});

test("normal relation reconciliation is additive-only and blocks every unexpected edge", () => {
  const current = [{ id: "keep", key: "related:req:exec", endpointIds: ["req", "exec"] as [string, string] }];
  assert.deepEqual(diffManagedRelations(["related:req:exec", "blocks:req:next"], current, new Set(["req", "exec", "next"])), {
    add: ["blocks:req:next"], remove: [], preserve: [], desired: ["blocks:req:next", "related:req:exec"],
  });
  assert.throws(() => diffManagedRelations(["related:req:exec"], [
    { id: "keep", key: "related:req:exec", endpointIds: ["req", "exec"] },
    { id: "remove", key: "related:req:old", endpointIds: ["req", "old"] },
  ], new Set(["req", "exec", "old"])), /additive-only/);
  assert.throws(() => diffManagedRelations(["related:req:exec"], [
    { id: "keep", key: "related:req:exec", endpointIds: ["req", "exec"] },
    { id: "preserve", key: "related:req:external", endpointIds: ["req", "external"] },
  ], new Set(["req", "exec"])), /additive-only/);
  assert.throws(() => diffManagedRelations(["related:req:exec", "related:req:exec"], [], new Set(["req", "exec"])), /duplicate desired relation/);
  assert.throws(() => diffManagedRelations(["related:outside:external"], [], new Set(["req"])), /no managed endpoint/);
});

const validCatalog = {
  teams: [{ id: "team", name: "Requirements", key: "REQ" }],
  projects: [{ id: "project", name: "Platform" }],
  states: [{ id: "state", name: "Approved", teamId: "team" }],
  labels: [{ id: "label", name: "Requirement" }],
};
const validContract = {
  team: { id: "team", name: "Requirements", key: "REQ" },
  projects: [{ id: "project", name: "Platform" }],
  states: [{ id: "state", name: "Approved", teamId: "team" }],
  labels: [{ id: "label", name: "Requirement" }],
};

test("empty team key fails closed", () => {
  assert.throws(() => resolveNativeCatalog({ ...validCatalog, teams: [{ id: "team", name: "Requirements", key: "" }] }, validContract), /differs|empty/);
});

test("duplicate native names fail closed even with one pinned ID", () => {
  assert.throws(() => resolveNativeCatalog({ ...validCatalog, projects: [{ id: "project", name: "Platform" }, { id: "other", name: "Platform" }] }, validContract), /not unique/);
});

test("checkpointed operations produce reverse fingerprint-guarded compensation", () => {
  const records = [{
    sequence: 1, operationId: "create", action: "issue_create" as const, targetUuid: "issue", phase: "verified" as const,
    expectedFingerprint: "after", actualFingerprint: "after", compensation: { archive: true }, error: null, before: null, after: { id: "issue" },
  }, {
    sequence: 2, operationId: "relation", action: "relation_create" as const, targetUuid: "relation", phase: "verified" as const,
    expectedFingerprint: "related", actualFingerprint: "related", compensation: { delete: true }, error: null, before: null, after: { id: "relation" },
  }];
  const compensation = buildCompensationPlan(records);
  assert.deepEqual(compensation.map((row) => row.action), ["delete_created_relation", "archive_created_issue"]);
  assert.deepEqual(compensation.map((row) => row.onlyIfFingerprint), ["related", "after"]);
});

test("redacted journal records exclude compensation and full content", () => {
  const record = {
    sequence: 1, operationId: "op", action: "issue_update" as const, targetUuid: "issue", phase: "before" as const,
    expectedFingerprint: "expected", actualFingerprint: null, compensation: { description: "full secret description" }, error: "full secret description",
  };
  const serialized = JSON.stringify(redactJournalRecord(record));
  assert.equal(serialized.includes("full secret description"), false);
  assert.equal(serialized.includes("compensation"), false);
});

test("mutation executor cannot pass compensation or full errors to the redacted sink", async () => {
  const journal = new MemoryJournal();
  await assert.rejects(() => executeGuardedMutation({
    operationId: "op", action: "issue_update", targetUuid: V4_ONE,
    expectedFingerprint: "expected", before: { description: "before" }, compensation: { description: "full secret description" },
    mutateOnce: async () => { throw new Error("full secret description"); },
    readAfter: async () => ({ description: "changed" }),
    fingerprintAfter: () => "changed",
  }, journal, 1), AmbiguousMutationError);
  const serialized = JSON.stringify(journal.redacted);
  assert.equal(serialized.includes("full secret description"), false);
  assert.equal(serialized.includes("compensation"), false);
  assert.equal(serialized.includes('"error"'), false);
  assert.equal(journal.redacted.every((row) => row.errorFingerprint === null || /^[a-f0-9]{64}$/.test(row.errorFingerprint)), true);
});

test("both relation directions paginate to exhaustion", async () => {
  const calls: string[] = [];
  const rows = await collectPaginatedRelations(async (direction, cursor) => {
    calls.push(`${direction}:${cursor ?? "start"}`);
    if (direction === "forward" && cursor === null) return { nodes: [{ id: "one" }], pageInfo: { hasNextPage: true, endCursor: "next" } };
    if (direction === "forward") return { nodes: [{ id: "two" }], pageInfo: { hasNextPage: false, endCursor: null } };
    return { nodes: [{ id: "three" }], pageInfo: { hasNextPage: false, endCursor: null } };
  });
  assert.deepEqual(calls, ["forward:start", "forward:next", "inverse:start"]);
  assert.deepEqual(rows.map((row) => row.id), ["one", "two", "three"]);
});

test("serial execution stops on the first failure", async () => {
  const seen: number[] = [];
  await assert.rejects(() => runSerial([1, 2, 3], async (value) => {
    seen.push(value);
    if (value === 2) throw new Error("stop");
  }), /stop/);
  assert.deepEqual(seen, [1, 2]);
});

test("two-pass readback must exactly match expected content", () => {
  const expected = [{ id: "one", relations: ["related:one:two"] }];
  assert.doesNotThrow(() => assertExactTwoPassReadback(expected, expected, expected));
  assert.throws(() => assertExactTwoPassReadback(expected, expected, [{ id: "one", relations: [] }]), /second readback/);
});

test("global relation projection adds later inverse edges to earlier issues", () => {
  const projected = projectGlobalRelationKeys(new Set(["REQ-1", "REQ-2"]), ["related:BUY-1:REQ-1", "blocks:REQ-1:REQ-2"]);
  assert.deepEqual(projected.get("REQ-1"), ["blocks:REQ-1:REQ-2", "related:BUY-1:REQ-1"]);
  assert.deepEqual(projected.get("REQ-2"), ["blocks:REQ-1:REQ-2"]);
  assert.throws(() => projectGlobalRelationKeys(new Set(["REQ-1"]), ["related:BUY-1:REQ-1", "related:BUY-1:REQ-1"]), /duplicate desired relation/);
  assert.throws(() => projectGlobalRelationKeys(new Set(["REQ-1"]), ["related:BUY-1:SELL-1"]), /no managed endpoint/);
});

test("write context pins repository, main ref, SHA, plan, environment, and confirmation", () => {
  const valid = { repository: "meetblakey/sourcera", ref: "refs/heads/main", actualSha: "abc", expectedSha: "abc", actualPlanSha: "plan", expectedPlanSha: "plan", environment: "linear-authority-migration", confirmation: "MIGRATE_LINEAR_AUTHORITY" };
  assert.doesNotThrow(() => assertWriteContext(valid));
  assert.throws(() => assertWriteContext({ ...valid, ref: "refs/heads/feature" }), /protected main/);
  assert.throws(() => assertWriteContext({ ...valid, expectedSha: "other" }), /SHA/);
  assert.throws(() => assertWriteContext({ ...valid, confirmation: "yes" }), /confirmation/);
});

test("phase-1 execution preflight, apply, and compensation stay unreachable", () => {
  assert.doesNotThrow(() => assertPhase1WriteModeAllowed("plan"));
  assert.throws(() => assertPhase1WriteModeAllowed("preflight"), /UUIDv4 allocation manifest/);
  assert.throws(() => assertPhase1WriteModeAllowed("apply"), /header-budgeted chunk\/resume/);
  assert.throws(() => assertPhase1WriteModeAllowed("compensate"), /header-budgeted chunk\/resume/);
  assert.throws(() => assertPhase1WriteModeAllowed("apply"), /audited semantic plan manifest/);
});

test("runner exposes only offline plan and recovery modes", () => {
  const planRun = spawnSync("tools/spec-lint/node_modules/.bin/tsx", ["tools/delivery/migrate-linear-authority.ts", "--mode", "plan"], { encoding: "utf8" });
  assert.equal(planRun.status, 0, planRun.stderr);
  const plan = JSON.parse(planRun.stdout) as { auditedPlanManifestRequired: boolean; auditedPlanValidated: boolean; applyEnabled: boolean };
  assert.deepEqual(plan, { ...plan, auditedPlanManifestRequired: true, auditedPlanValidated: false, applyEnabled: false });
  const compensationRun = spawnSync("tools/spec-lint/node_modules/.bin/tsx", ["tools/delivery/migrate-linear-authority.ts", "--mode", "compensation-plan"], { encoding: "utf8" });
  assert.notEqual(compensationRun.status, 0);
  assert.match(compensationRun.stderr, /Mode must be plan or recovery-check/);
});

test("delivery workflow is write-free and rejects the former feature-branch trigger", () => {
  const actual = readFileSync(".github/workflows/delivery-integrity.yml", "utf8");
  assert.doesNotThrow(() => assertWorkflowWriteFree(actual));
  assert.match(actual, /group: delivery-integrity-\$\{\{ github\.workflow \}\}-\$\{\{ github\.ref \}\}/);
  assert.doesNotMatch(actual, /group: sourcera-linear-control-plane-global/);
  assert.throws(() => assertWorkflowWriteFree("linear-authority-migration:\n  run: migrate-linear-authority.ts\n  LINEAR_API_KEY: secret"), /write trigger/);
});

test("compensation executes in order only when the live fingerprint matches", async () => {
  const steps = [{ operationId: "one", action: "restore_previous_state", targetUuid: "issue", onlyIfFingerprint: "after", restoredFingerprint: "before", restore: {} }];
  let mutations = 0;
  await executeCompensationPlan(steps, {
    readFingerprint: async () => mutations === 0 ? "after" : "before",
    mutateOnce: async () => { mutations += 1; },
  });
  assert.equal(mutations, 1);
  await assert.rejects(() => executeCompensationPlan(steps, {
    readFingerprint: async () => "changed",
    mutateOnce: async () => { throw new Error("must not run"); },
  }), /fingerprint changed/);
});
