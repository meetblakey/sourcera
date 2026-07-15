# Lossless R0 Release Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace heuristic release placement with an explicit, lossless policy where R0 is exactly the approved journey roots plus their dependency closure, later features stay assigned once, and Linear readback cannot mask drift.

**Architecture:** delivery/release-policy.json is the reviewed baseline policy for every canonical feature and the approved R0 roots. tools/delivery/lib/release-policy.ts validates full coverage, computes the R0 closure, derives runtime-gate releases from explicit behavior owners, and emits the only valid final plan. Repository generation, CI, and Linear readback consume that model and fail closed on missing, duplicate, unexpected, truncated, or changed work.

**Tech Stack:** TypeScript, Node test runner, JSON policy artifacts, Linear GraphQL readback, existing Sourcera delivery generators and scanners.

## Global Constraints

- Preserve every feature, runtime gate, source link, dependency, acceptance test, telemetry field, rollout, rollback, and named proof.
- R0 roots are exactly those approved in docs/superpowers/specs/2026-07-15-r0-release-policy-design.md.
- Every canonical feature has one explicit baseline assignment; runtime gates derive from explicit behavior dependencies.
- A final R0 feature must be in the approved root closure. Nothing defaults to R0.
- Runtime readiness comes only from the live stamp and exact-status scanners.
- Never copy volatile counts into policy, plans, guidance, or evidence.
- Use TDD for every code change and commit each independently reviewable task.

---

## File map

- Create delivery/release-policy.json: reviewed roots and one baseline assignment per feature.
- Create tools/delivery/lib/release-policy.ts: validation, closure, and final assignment derivation.
- Create tools/delivery/release-policy.test.ts: lossless coverage and closure tests.
- Modify tools/delivery/build-release-plan.ts: delete text classification and consume explicit policy.
- Modify tools/delivery/generate.ts and verify.ts: reject hand-edited or incomplete plans.
- Modify .github/workflows/delivery-integrity.yml: enforce the policy in CI.
- Modify tools/delivery/lib/linear-live.ts: read all states and hash complete descriptions.
- Modify tools/delivery/refresh-linear-snapshot.ts: preserve live release truth without fallback.
- Create tools/delivery/lib/linear-sync.ts: verify before/after field preservation.
- Create reports/evidence/r0-release-policy-linear-sync.json: commit-bound sync receipt.
- Regenerate delivery/release-plan.json, delivery/linear-snapshot.json, and reports/delivery.

### Task 1: Add the explicit release-policy kernel

**Files:**
- Create: tools/delivery/lib/release-policy.ts
- Create: tools/delivery/release-policy.test.ts
- Modify: tools/delivery/lib/model.ts

**Interfaces:**
- Consumes: SourceRequirement[], ReleaseDefinition[], runtime behavior owners, and ReleasePolicy.
- Produces: releasePolicyFindings, r0DependencyClosure, and buildReleaseAssignments.

- [ ] **Step 1: Write failing tests**

Add these exact cases:

~~~ts
test("R0 is exactly the approved roots and dependency closure", () => {
  const result = buildReleaseAssignments(rows, runtime, policy, owners, releases);
  assert.deepEqual(idsIn(result, "R0"), ["F-ROOT", "F-DEPENDENCY", "RG:root-proof"]);
});

test("unknown work fails instead of defaulting to R0", () => {
  assert.equal(releasePolicyFindings([...rows, row("F-NEW")], policy, releases)[0].code, "release_policy_unclassified");
});

test("duplicates, missing roots, cycles, and unexpected R0 fail", () => {
  assert.deepEqual(codes(findings), new Set([
    "release_policy_duplicate",
    "release_policy_root_missing",
    "dependency_cycle",
    "release_policy_unexpected_r0",
  ]));
});

test("runtime gates follow all explicit behavior owners", () => {
  assert.equal(assignment("RG:proof").release, "R2");
});
~~~

- [ ] **Step 2: Run RED**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/release-policy.test.ts
~~~

Expected: module missing.

- [ ] **Step 3: Add types and implementation**

Add to tools/delivery/lib/model.ts:

~~~ts
export interface ReleaseAssignment {
  requirementId: string;
  release: ReleaseId;
  rationale: string;
}

export interface ReleasePolicy {
  schemaVersion: 1;
  r0Roots: string[];
  baselineAssignments: ReleaseAssignment[];
}
~~~

Export these exact functions:

~~~ts
export function r0DependencyClosure(
  rows: SourceRequirement[],
  roots: string[],
): Set<string>;

export function releasePolicyFindings(
  rows: SourceRequirement[],
  policy: ReleasePolicy,
  releases: ReleaseDefinition[],
): Finding[];

export function buildReleaseAssignments(
  features: SourceRequirement[],
  runtimeGates: SourceRequirement[],
  policy: ReleasePolicy,
  runtimeOwners: Array<{ requirementId: string; dependencies: string[] }>,
  releases: ReleaseDefinition[],
): ReleaseAssignment[];
~~~

Implementation rules:

1. Every feature ID occurs once in baselineAssignments.
2. Unknown policy IDs and missing roots fail.
3. validateGraph rejects missing dependencies and cycles.
4. Closure recursively follows dependencies from r0Roots.
5. Closure members become R0; all other features keep baseline release.
6. Baseline R0 outside closure fails.
7. A runtime gate takes the latest release among all explicit owners.
8. Output is numeric-aware and deterministic.

- [ ] **Step 4: Run GREEN**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/release-policy.test.ts
tools/spec-lint/node_modules/.bin/tsc --project tools/delivery/tsconfig.json
~~~

- [ ] **Step 5: Commit**

~~~bash
git add tools/delivery/lib/model.ts tools/delivery/lib/release-policy.ts tools/delivery/release-policy.test.ts
git commit -m "feat: add lossless release policy kernel"
~~~

### Task 2: Replace heuristic classification with reviewed policy data

**Files:**
- Create: delivery/release-policy.json
- Modify: tools/delivery/build-release-plan.ts
- Test: tools/delivery/release-policy.test.ts

**Interfaces:**
- Consumes: feature inventory, live stamp JSON, runtime owners, releases, dispositions, and policy.
- Produces: deterministic delivery/release-plan.json.

- [ ] **Step 1: Add failing CLI tests**

Prove a valid fixture emits R0 closure and later R4 work, while missing or duplicate policy rows fail:

~~~ts
assert.equal(run(validFixture).status, 0);
assert.equal(releaseOf(output, "F-ROOT"), "R0");
assert.equal(releaseOf(output, "F-LATER"), "R4");
assert.notEqual(run(missingAssignmentFixture).status, 0);
assert.match(run(missingAssignmentFixture).stderr, /release_policy_unclassified/);
assert.notEqual(run(duplicateAssignmentFixture).status, 0);
~~~

- [ ] **Step 2: Run RED**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/release-policy.test.ts
~~~

Expected: the old builder accepts missing policy rows.

- [ ] **Step 3: Create the explicit policy**

Use this exact envelope and roots:

~~~json
{
  "schemaVersion": 1,
  "r0Roots": [
    "F-083", "F-085", "F-086", "F-087", "F-088", "F-101",
    "F-105", "F-106", "F-209", "F-214", "F-215", "F-220",
    "F-225", "F-226", "F-228", "F-229", "F-387", "F-389",
    "F-559", "F-560", "F-687", "F-688", "F-689", "F-690",
    "F-691", "F-692", "F-693", "F-694"
  ],
  "baselineAssignments": []
}
~~~

Populate baselineAssignments with every executable feature once. Use the current plan only as migration input, then review each row against its pinned inventory source and the R0-R5 definitions. No item outside closure may retain R0. Each rationale names the owning release capability, never a text match.

Required assertions:

~~~ts
for (const id of ["F-559", "F-560", "F-687", "F-688", "F-689", "F-690", "F-691", "F-692", "F-693", "F-694"]) {
  assert.equal(finalRelease(id), "R0");
}
assert.equal(baselineRelease("F-689"), "R4");
assert.equal(finalRelease("F-265"), "R4");
assert.equal(finalRelease("F-273"), "R4");
~~~

- [ ] **Step 4: Replace the builder**

Delete sectionNumber, classify, releaseReason, and dependency pull-forward from build-release-plan.ts. Add --policy with default delivery/release-policy.json and call buildReleaseAssignments. Write only when findings are empty.

- [ ] **Step 5: Prove lossless classification**

~~~bash
set +e
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > /tmp/sourcera-stamp.json
stamp_status=$?
set -e
test "$stamp_status" -le 1
tools/spec-lint/node_modules/.bin/tsx tools/delivery/build-release-plan.ts --stamp /tmp/sourcera-stamp.json --out /tmp/release-plan.json
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/release-policy.test.ts
~~~

Expected: every feature and live runtime gate appears once; R0 equals closure; unrelated intelligence remains later.

- [ ] **Step 6: Commit**

~~~bash
git add delivery/release-policy.json tools/delivery/build-release-plan.ts tools/delivery/release-policy.test.ts
git commit -m "feat: make release placement explicit"
~~~

### Task 3: Make generation and CI reject policy drift

**Files:**
- Modify: tools/delivery/generate.ts
- Modify: tools/delivery/verify.ts
- Modify: tools/delivery/verify.test.ts
- Modify: tools/delivery/generate.test.ts
- Modify: tools/delivery/ci-contract.test.ts
- Modify: .github/workflows/delivery-integrity.yml

- [ ] **Step 1: Write failing tests**

Hand-edit one generated release and expect:

~~~ts
releasePlan.assignments[0].release = "R5";
assert.equal(runVerify().status, 1);
assert.match(runVerify().stderr, /release plan differs/);
~~~

Also prove a missing policy assignment and an extra R0 assignment fail generation.

- [ ] **Step 2: Run RED**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/verify.test.ts tools/delivery/generate.test.ts tools/delivery/ci-contract.test.ts
~~~

- [ ] **Step 3: Implement fail-closed verification**

verify.ts regenerates the release plan into its temporary directory using the same stamp, inventory, dispositions, runtime dependencies, releases, and policy. Compare byte-for-byte with delivery/release-plan.json before report comparison.

generate.ts calls releasePolicyFindings and compares its loaded plan with buildReleaseAssignments. Emit these codes:

~~~ts
"release_policy_unclassified"
"release_policy_duplicate"
"release_policy_root_missing"
"release_policy_unexpected_r0"
"release_plan_policy_drift"
~~~

- [ ] **Step 4: Update CI and run GREEN**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/*.test.ts
tools/spec-lint/node_modules/.bin/tsc --project tools/delivery/tsconfig.json
~~~

Keep stamp and exact-status outputs temporary. Commit no live counts.

- [ ] **Step 5: Commit**

~~~bash
git add tools/delivery/generate.ts tools/delivery/verify.ts tools/delivery/verify.test.ts tools/delivery/generate.test.ts tools/delivery/ci-contract.test.ts .github/workflows/delivery-integrity.yml
git commit -m "fix: fail CI on release policy drift"
~~~

### Task 4: Make Linear readback complete and non-masking

**Files:**
- Modify: tools/delivery/lib/linear-live.ts
- Modify: tools/delivery/linear-live.test.ts
- Modify: tools/delivery/refresh-linear-snapshot.ts
- Modify: tools/delivery/refresh-linear-snapshot.test.ts

- [ ] **Step 1: Add failing tests**

~~~ts
test("includes in-progress and completed delivery issues", async () => {
  assert.deepEqual(result.issues.map((issue) => issue.identifier), ["PLA-1", "PLA-2", "PLA-3"]);
});

test("description changes after character 400 change the fingerprint", async () => {
  assert.notEqual(hash("a".repeat(400) + "x"), hash("a".repeat(400) + "y"));
});

test("refresh does not replace a missing live release with repository release", () => {
  assert.equal(updated.issues[0].release, null);
  assert.deepEqual(updated.linearFingerprint.issues[0].releases, []);
});
~~~

- [ ] **Step 2: Run RED**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/linear-live.test.ts tools/delivery/refresh-linear-snapshot.test.ts
~~~

- [ ] **Step 3: Remove masking**

In linear-live.ts:

- remove the backlog-only state filter;
- hash the complete description;
- keep pagination and deterministic sorting.

In refresh-linear-snapshot.ts:

- derive issue.release only from current.releases;
- set null when Linear has no R0-R5 release;
- reject multiple R0-R5 releases;
- remove repository and prior-snapshot release fallbacks;
- hash the complete live description.

- [ ] **Step 4: Run GREEN and commit**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/linear-live.test.ts tools/delivery/refresh-linear-snapshot.test.ts
tools/spec-lint/node_modules/.bin/tsc --project tools/delivery/tsconfig.json
git add tools/delivery/lib/linear-live.ts tools/delivery/linear-live.test.ts tools/delivery/refresh-linear-snapshot.ts tools/delivery/refresh-linear-snapshot.test.ts
git commit -m "fix: preserve live Linear release truth"
~~~

### Task 5: Add lossless Linear synchronization proof

**Files:**
- Create: tools/delivery/lib/linear-sync.ts
- Create: tools/delivery/linear-sync.test.ts
- Create after sync: reports/evidence/r0-release-policy-linear-sync.json

- [ ] **Step 1: Write failing tests**

~~~ts
test("allows only planned release, milestone, readiness-label, and updatedAt changes", () => {
  assert.deepEqual(linearSyncPreservationFindings(before, allowedAfter, expected), []);
});

test("rejects lost descriptions, owners, estimates, parents, and relations", () => {
  assert.deepEqual(new Set(codes(findings)), new Set([
    "linear_sync_description_changed",
    "linear_sync_owner_changed",
    "linear_sync_estimate_changed",
    "linear_sync_parent_changed",
    "linear_sync_relations_changed",
  ]));
});
~~~

- [ ] **Step 2: Run RED**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/linear-sync.test.ts
~~~

- [ ] **Step 3: Implement**

Export:

~~~ts
export function linearSyncPreservationFindings(
  before: LinearFingerprint,
  after: LinearFingerprint,
  expectedReleaseByIssue: ReadonlyMap<string, ReleaseId>,
): Finding[];
~~~

Permit only updatedAt, expected release, expected milestone, and removal of codex-ready when readiness fails. Title, complete description hash, estimate, owner, team, project, parent, and relations remain identical.

- [ ] **Step 4: Run GREEN and commit**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/linear-sync.test.ts
tools/spec-lint/node_modules/.bin/tsc --project tools/delivery/tsconfig.json
git add tools/delivery/lib/linear-sync.ts tools/delivery/linear-sync.test.ts
git commit -m "feat: verify lossless Linear release sync"
~~~

### Task 6: Regenerate, synchronize Linear, and prove readback

**Files:**
- Modify: delivery/release-plan.json
- Modify: delivery/linear-snapshot.json
- Modify: reports/delivery/*.json
- Create: reports/evidence/r0-release-policy-linear-sync.json

- [ ] **Step 1: Capture live truth and regenerate**

~~~bash
set +e
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > /tmp/sourcera-stamp.json
stamp_status=$?
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --json > /tmp/sourcera-exact.json
exact_status=$?
set -e
test "$stamp_status" -le 1
test "$exact_status" -eq 0
tools/spec-lint/node_modules/.bin/tsx tools/delivery/build-release-plan.ts --stamp /tmp/sourcera-stamp.json
tools/spec-lint/node_modules/.bin/tsx tools/delivery/generate.ts --stamp /tmp/sourcera-stamp.json --exact /tmp/sourcera-exact.json
~~~

- [ ] **Step 2: Capture complete Linear before-state**

Read every source-backed issue through the complete paginated query. Store the full before fingerprint in /tmp, never the repository.

- [ ] **Step 3: Apply only planned changes**

Update only R0-R5 release and required milestone. Remove codex-ready only when regenerated readiness fails. Do not change titles, descriptions, parents, blockers, owners, reviewers, estimates, tests, paths, rollout, rollback, telemetry, or proof.

- [ ] **Step 4: Read back and verify**

Fetch the complete graph again, run linearSyncPreservationFindings, refresh the snapshot from live after-state, then run:

~~~bash
tools/spec-lint/node_modules/.bin/tsx tools/delivery/linear-live.ts --snapshot delivery/linear-snapshot.json
tools/spec-lint/node_modules/.bin/tsx tools/delivery/generate.ts --stamp /tmp/sourcera-stamp.json --exact /tmp/sourcera-exact.json
tools/spec-lint/node_modules/.bin/tsx tools/delivery/verify.ts --stamp /tmp/sourcera-stamp.json --exact /tmp/sourcera-exact.json
~~~

- [ ] **Step 5: Write the sync receipt**

Use apply_patch to create reports/evidence/r0-release-policy-linear-sync.json. Set schemaVersion to 1, proof to r0_release_policy_linear_sync, policyPath to delivery/release-policy.json, preservationFindings and repositoryDriftFindings to empty arrays, commitSha to the exact output of git rev-parse HEAD, beforeFingerprint and afterFingerprint to the SHA-256 values of the temporary before/after fingerprint files, and rollback.commitSha to the pre-sync commit with rollback.receipt equal to beforeFingerprint. Never include live counts.

- [ ] **Step 6: Commit**

~~~bash
git add delivery/release-plan.json delivery/linear-snapshot.json reports/delivery reports/evidence/r0-release-policy-linear-sync.json
git commit -m "chore: align Linear to the lossless R0 policy"
~~~

### Task 7: Run every final gate

- [ ] **Step 1: Repository gates**

~~~bash
node --import ./tools/spec-lint/node_modules/tsx/dist/loader.mjs --test tools/delivery/*.test.ts
tools/spec-lint/node_modules/.bin/tsc --project tools/delivery/tsconfig.json
npm run verify
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all
tools/spec-lint/node_modules/.bin/tsx tools/repo-hygiene/no_legacy_drift.ts
tools/spec-lint/node_modules/.bin/tsx tools/release/appendix_j_lineage.ts
npm run clean:generated
git diff --check
~~~

- [ ] **Step 2: Live delivery gates**

~~~bash
tools/spec-lint/node_modules/.bin/tsx tools/delivery/verify.ts --stamp /tmp/sourcera-stamp.json --exact /tmp/sourcera-exact.json
tools/spec-lint/node_modules/.bin/tsx tools/delivery/linear-live.ts --snapshot delivery/linear-snapshot.json
~~~

Expected: policy, reports, and Linear agree. The runtime stamp may still block only for genuinely missing live proof.

- [ ] **Step 3: Commit deterministic regeneration if needed**

~~~bash
git add delivery reports/delivery
git diff --cached --quiet || git commit -m "chore: refresh delivery evidence"
~~~

- [ ] **Step 4: Report**

Report only changes, evidence, current score, blockers, and next three dependency-ordered actions. Never declare R0 complete while the live stamp remains blocked.
