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

const group = issue({
  id: "PLA-203",
  kind: "parent",
  sourceId: null,
  outcome: "Identity delivery group",
});
const parent = issue({
  id: "PLA-283",
  parentId: group.id,
  kind: "parent",
  sourceId: "F-006",
  outcome: "WorkOS authentication",
});
const child = issue({
  id: "PLA-942",
  parentId: parent.id,
  sourceId: null,
  outcome: "Authenticated session",
});
const direct = issue({
  id: "PLA-217",
  parentId: group.id,
  sourceId: "F-001",
  outcome: "Three application shells",
});

const split = issue({
  id: "PLA-943",
  parentId: group.id,
  sourceId: null,
  sourceFamilyId: "F-001",
  outcome: "Signed identity events",
});

test("accepts source parents, mergeable children, and organizational groups", () => {
  assert.deepEqual(issueFamilyFindings([group, parent, child, direct]), []);
  assert.deepEqual(
    issueFamilyForSource(
      [group, parent, child, direct],
      "F-006",
    )?.executableIssues.map((candidate) => candidate.id),
    ["PLA-942"],
  );
  assert.deepEqual(
    issueFamilyForSource(
      [group, parent, child, direct],
      "F-001",
    )?.executableIssues.map((candidate) => candidate.id),
    ["PLA-217"],
  );
});

test("keeps every executable split in its explicit source family", () => {
  assert.deepEqual(issueFamilyFindings([group, direct, split]), []);
  assert.deepEqual(
    issueFamilyForSource([group, direct, split], "F-001")?.executableIssues.map(
      (candidate) => candidate.id,
    ),
    ["PLA-217", "PLA-943"],
  );
});

test("rejects empty parents, missing parents, and source-less top-level work", () => {
  const emptyParent = issue({
    id: "PLA-300",
    kind: "parent",
    sourceId: "F-010",
  });
  const missingParentChild = issue({
    id: "PLA-301",
    parentId: "PLA-999",
    sourceId: null,
  });
  const topLevelChild = issue({
    id: "PLA-302",
    parentId: null,
    sourceId: null,
  });
  const findings = issueFamilyFindings([
    emptyParent,
    missingParentChild,
    topLevelChild,
  ]);
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set([
      "parent_without_executable_child",
      "orphan_child",
      "source_less_top_level_executable",
    ]),
  );
});

test("rejects conflicting child identity, release, readiness, and parent type", () => {
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
      "parent_without_executable_child",
      "parent_marked_ready",
      "child_source_conflict",
      "child_release_drift",
      "orphan_child",
      "child_parent_invalid",
    ]),
  );
});
