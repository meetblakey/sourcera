# Parent-Child Traceability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a source-backed Linear outcome parent traceable through valid mergeable children and fail closed on invalid issue families.

**Architecture:** Add one focused issue-family module that understands direct source issues, source-backed outcome parents, mergeable children, and source-less organizational parents. The generator will use that module for validation and child evidence while the Linear refresh persists the live parent relation.

**Tech Stack:** TypeScript, Node test runner, TSX, JSON delivery artifacts, Linear GraphQL snapshot data.

## Global Constraints

- A source-backed outcome parent keeps the only canonical `sourceId`.
- A mergeable child has `sourceId: null` and points to the source-backed parent with `parentId`.
- A direct source issue may sit under a source-less organizational parent.
- Parents never earn `codex-ready`.
- Existing orphan, duplicate, cycle, release, dependency, readiness, and drift checks remain fail closed.
- Tests must fail for the missing behavior before implementation changes are made.

---

### Task 1: Model and validate issue families

**Files:**
- Modify: `tools/delivery/lib/model.ts`
- Create: `tools/delivery/lib/issue-family.ts`
- Create: `tools/delivery/issue-family.test.ts`
- Modify: `tools/delivery/readiness.test.ts`

**Interfaces:**
- Consumes: `LinearIssueSnapshot`, `Finding`.
- Produces: `issueFamilyFindings(issues)`, `issueFamilyForSource(issues, sourceId)`, and required `parentId` snapshot data.

- [ ] **Step 1: Write failing family tests**

```ts
import { strict as assert } from "node:assert";
import test from "node:test";
import {
  issueFamilyFindings,
  issueFamilyForSource,
} from "./lib/issue-family.js";
import type { LinearIssueSnapshot } from "./lib/model.js";

const issue = (
  overrides: Partial<LinearIssueSnapshot>,
): LinearIssueSnapshot => ({
  id: "PLA-1",
  parentId: null,
  sourceId: null,
  title: "Issue",
  kind: "executable",
  labels: [],
  release: "R0",
  milestone: "Permissioned journeys ready",
  dependencies: [],
  owner: "Blake Rowley",
  reviewer: "Blake Rowley",
  estimate: 3,
  paths: ["convex/auth.ts"],
  tests: { success: "passes", failure: "denies", recovery: "restores" },
  rollout: "preview",
  rollback: "prior commit",
  telemetry: "auth_result",
  proof: "reports/evidence/auth.json",
  sourceVersion: "v7.1.0a",
  sourceSection: "§6.1",
  outcome: "One auth outcome",
  ...overrides,
});
const group = issue({ id: "PLA-203", kind: "parent", sourceId: null });
const parent = issue({
  id: "PLA-283",
  parentId: group.id,
  kind: "parent",
  sourceId: "F-006",
});
const child = issue({ id: "PLA-942", parentId: parent.id, sourceId: null });
const direct = issue({
  id: "PLA-217",
  parentId: group.id,
  sourceId: "F-001",
});
const emptyParent = issue({ id: "PLA-300", kind: "parent", sourceId: "F-010" });
const missingParentChild = issue({ id: "PLA-301", parentId: "PLA-999" });
const topLevelChild = issue({ id: "PLA-302", parentId: null, sourceId: null });

test("accepts a source parent with mergeable executable children", () => {
  assert.deepEqual(issueFamilyFindings([group, parent, child]), []);
  assert.deepEqual(
    issueFamilyForSource([group, parent, child], "F-006")?.executableIssues.map((issue) => issue.id),
    ["PLA-942"],
  );
});

test("rejects empty parents, missing parents, and source-less top-level work", () => {
  const findings = issueFamilyFindings([emptyParent, missingParentChild, topLevelChild]);
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set([
      "parent_without_executable_child",
      "orphan_child",
      "source_less_top_level_executable",
    ]),
  );
});

test("rejects an invalid decomposition family", () => {
  const findings = issueFamilyFindings([
    group,
    direct,
    { ...parent, labels: ["codex-ready"] },
    { ...child, sourceId: "F-006.A", release: "R1" },
    { ...child, id: "PLA-944", parentId: "PLA-999" },
    { ...child, id: "PLA-945", parentId: direct.id },
  ]);
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set([
      "parent_marked_ready",
      "child_source_conflict",
      "child_release_drift",
      "orphan_child",
      "child_parent_invalid",
    ]),
  );
});
```

- [ ] **Step 2: Run the family test and verify red**

Run: `tools/spec-lint/node_modules/.bin/tsx --test tools/delivery/issue-family.test.ts`

Expected: FAIL because `./lib/issue-family.js` does not exist.

- [ ] **Step 3: Add the required parent field and family module**

```ts
export interface LinearIssueSnapshot {
  id: string;
  parentId: string | null;
  sourceId: string | null;
  // existing fields remain unchanged
}

export interface IssueFamily {
  sourceIssue: LinearIssueSnapshot;
  executableIssues: LinearIssueSnapshot[];
}

export function issueFamilyForSource(
  issues: LinearIssueSnapshot[],
  sourceId: string,
): IssueFamily | null {
  const sourceIssue = issues.find((issue) => issue.sourceId === sourceId);
  if (!sourceIssue) return null;
  return {
    sourceIssue,
    executableIssues: sourceIssue.kind === "parent"
      ? issues.filter(
          (issue) => issue.kind === "executable" && issue.parentId === sourceIssue.id,
        )
      : [sourceIssue],
  };
}
```

Implement `issueFamilyFindings` with these exact failure codes:

```ts
"parent_without_executable_child"
"parent_marked_ready"
"orphan_child"
"child_parent_invalid"
"child_source_conflict"
"child_release_drift"
"source_less_top_level_executable"
```

A source-backed direct issue under a source-less organizational parent is valid. A source-less executable under a source-backed parent is a mergeable child.

- [ ] **Step 4: Update the readiness fixture and run green**

Add `parentId: null` to the typed fixture in `tools/delivery/readiness.test.ts`.

Run: `tools/spec-lint/node_modules/.bin/tsx --test tools/delivery/issue-family.test.ts tools/delivery/readiness.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the family contract**

```bash
git add tools/delivery/lib/model.ts tools/delivery/lib/issue-family.ts tools/delivery/issue-family.test.ts tools/delivery/readiness.test.ts
git commit -m "feat: validate Linear issue families"
```

### Task 2: Generate child-level traceability

**Files:**
- Modify: `tools/delivery/generate.ts`
- Modify: `tools/delivery/generate.test.ts`
- Modify: `tools/delivery/verify.test.ts`

**Interfaces:**
- Consumes: `issueFamilyFindings` and `issueFamilyForSource` from Task 1.
- Produces: fail-closed family findings plus `executableIssueIds` and `executableIssues` in every traceability row.

- [ ] **Step 1: Add a failing generator test**

Create a temporary snapshot containing:

```json
{
  "issues": [
    {
      "id": "PLA-283",
      "parentId": "PLA-203",
      "sourceId": "F-001",
      "kind": "parent",
      "release": "R0",
      "labels": [],
      "paths": [],
      "tests": { "success": null, "failure": null, "recovery": null }
    },
    {
      "id": "PLA-942",
      "parentId": "PLA-283",
      "sourceId": null,
      "kind": "executable",
      "release": "R0",
      "labels": [],
      "paths": ["convex/auth.ts"],
      "tests": { "success": "sign in", "failure": "deny", "recovery": "restore" },
      "rollout": "preview",
      "rollback": "prior commit",
      "telemetry": "auth_result",
      "proof": "reports/evidence/auth.json"
    }
  ]
}
```

Assert generation exits zero, the drift report has no `orphan_requirement`, and the traceability row contains `executableIssueIds: ["PLA-942"]` plus the child paths, tests, rollout, rollback, telemetry, and proof under `executableIssues`.

- [ ] **Step 2: Run the generator test and verify red**

Run: `tools/spec-lint/node_modules/.bin/tsx --test tools/delivery/generate.test.ts`

Expected: FAIL because the current generator drops parent issues and emits no child evidence.

- [ ] **Step 3: Integrate family validation and evidence**

Import the family helpers and add findings before score calculation:

```ts
const familyFindings = issueFamilyFindings(issues);
const tracedIssues = issues.filter(
  (issue) => Boolean(issue.sourceId) || issue.kind === "executable",
);
const drift = driftFindings(manifest, tracedIssues);
```

Add `familyFindings` to `allFindings`, the planning score, and `drift-report.json`.

Build child evidence for every traceability row:

```ts
const family = issueFamilyForSource(issues, row.requirementId);
const executableIssues = family?.executableIssues ?? [];
return {
  // existing source-level fields remain
  executableIssueIds: executableIssues.map((issue) => issue.id),
  executableIssues: executableIssues.map((issue) => ({
    issueId: issue.id,
    milestone: issue.milestone,
    dependencies: issue.dependencies,
    paths: issue.paths,
    tests: issue.tests,
    rollout: issue.rollout,
    rollback: issue.rollback,
    telemetry: issue.telemetry,
    proof: issue.proof,
  })),
};
```

- [ ] **Step 4: Update the verifier fixture and run green**

Add `parentId: null` to the issue fixture in `tools/delivery/verify.test.ts`.

Run: `tools/spec-lint/node_modules/.bin/tsx --test tools/delivery/generate.test.ts tools/delivery/verify.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit generator support**

```bash
git add tools/delivery/generate.ts tools/delivery/generate.test.ts tools/delivery/verify.test.ts
git commit -m "feat: generate child-level traceability"
```

### Task 3: Persist live Linear parent relations

**Files:**
- Modify: `tools/delivery/refresh-linear-snapshot.ts`
- Create: `tools/delivery/refresh-linear-snapshot.test.ts`
- Modify: `delivery/linear-snapshot.json`

**Interfaces:**
- Consumes: live issue `parentId` and the committed fingerprint `parent` field.
- Produces: `parentId` on every delivery issue row.

- [ ] **Step 1: Write the failing refresh test**

Run the refresh CLI against a temporary snapshot where `PLA-942` has `parentId: null` and the live fixture has `parentId: "PLA-283"`. Assert the written snapshot contains:

```ts
assert.equal(updated.issues[0].parentId, "PLA-283");
assert.equal(updated.linearFingerprint.issues[0].parent, "PLA-283");
```

- [ ] **Step 2: Run the refresh test and verify red**

Run: `tools/spec-lint/node_modules/.bin/tsx --test tools/delivery/refresh-linear-snapshot.test.ts`

Expected: FAIL because the issue row is not updated from live `parentId`.

- [ ] **Step 3: Copy the live parent into issue rows**

Add this field to the snapshot mapping in `refresh-linear-snapshot.ts`:

```ts
parentId: current.parentId ?? null,
```

- [ ] **Step 4: Backfill the committed snapshot mechanically**

Use each issue's matching `linearFingerprint.issues[].parent` value. Every issue row must have `parentId`, including explicit `null`.

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync } from "node:fs";
const file = "delivery/linear-snapshot.json";
const snapshot = JSON.parse(readFileSync(file, "utf8"));
const parentById = new Map(
  snapshot.linearFingerprint.issues.map((issue) => [issue.identifier, issue.parent ?? null]),
);
snapshot.issues = snapshot.issues.map((issue) => ({
  ...issue,
  parentId: parentById.get(issue.id) ?? null,
}));
writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`);
NODE
```

Run: `tools/spec-lint/node_modules/.bin/tsx --test tools/delivery/refresh-linear-snapshot.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit refresh support**

```bash
git add tools/delivery/refresh-linear-snapshot.ts tools/delivery/refresh-linear-snapshot.test.ts delivery/linear-snapshot.json
git commit -m "feat: persist Linear parent relations"
```

### Task 4: Regenerate and verify the control plane

**Files:**
- Modify: `reports/delivery/delivery-manifest.json`
- Modify: `reports/delivery/dependency-graph.json`
- Modify: `reports/delivery/drift-report.json`
- Modify: `reports/delivery/readiness-report.json`
- Modify: `reports/delivery/release-scorecard.json`
- Modify: `reports/delivery/traceability-map.json`

**Interfaces:**
- Consumes: the current source inventory, live gate JSON, release plan, risks, decisions, and Linear snapshot.
- Produces: deterministic green planning artifacts with `F-006` traced through `PLA-942` and `PLA-943`.

- [ ] **Step 1: Run all delivery tests**

Run: `tools/spec-lint/node_modules/.bin/tsx --test tools/delivery/*.test.ts`

Expected: PASS.

- [ ] **Step 2: Refresh live gate inputs and regenerate reports**

```bash
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > /tmp/sourcera-stamp.json
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --json > /tmp/sourcera-exact.json
tools/spec-lint/node_modules/.bin/tsx tools/delivery/generate.ts
```

Expected: generator exits zero for parent-child traceability. Any unrelated current finding remains visible and is repaired before commit.

- [ ] **Step 3: Run required repository checks**

```bash
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all
tools/spec-lint/node_modules/.bin/tsx tools/repo-hygiene/no_legacy_drift.ts
tools/spec-lint/node_modules/.bin/tsx tools/release/appendix_j_lineage.ts
```

Expected: PASS.

- [ ] **Step 4: Verify the F-006 trace**

Run:

```bash
jq '.[] | select(.requirementId == "F-006") | {issueId, executableIssueIds, executableIssues}' reports/delivery/traceability-map.json
```

Expected: parent `PLA-283` with executable children `PLA-942` and `PLA-943`, including their evidence fields.

- [ ] **Step 5: Commit generated proof**

```bash
git add reports/delivery tools/delivery delivery/linear-snapshot.json _audit/FEATURE_INVENTORY.md delivery/decisions.jsonl
git commit -m "fix: close parent-child delivery drift"
```
