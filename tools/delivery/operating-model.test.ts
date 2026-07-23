import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { LinearFingerprint } from "./lib/linear-live.js";
import type { LinearIssueSnapshot } from "./lib/model.js";
import {
  operatingModelFindings,
  type OperatingModel,
} from "./lib/operating-model.js";

const model: OperatingModel = {
  schemaVersion: 1,
  activeRelease: "R0",
  lanes: [
    { id: "implementation", owner: "Blake Rowley", wipLimit: 1 },
  ],
  readyQueue: { minimum: 1, maximum: 10 },
  wipDecisionId: "DEC-WIP-001",
  reviewerPolicy: {
    interimDecisionId: "DEC-OWNER-001",
    interimReviewer: "Blake Rowley (interim under DEC-OWNER-001)",
  },
  independentReview: {
    checks: ["required-ci", "codex-independent-review"],
    humanApprover: "Blake Rowley",
    approvalGate:
      "Independent CI and Codex review, then named Blake Rowley release or checkpoint approval",
    capacityValidationTrigger:
      "A second active human joins; require a distinct human reviewer and recalibrate capacity",
  },
  priorityPolicy: {
    urgent: 1,
    decisionId: "DEC-PRIORITY-001",
  },
};

const issue = (
  overrides: Partial<LinearIssueSnapshot> = {},
): LinearIssueSnapshot => ({
  id: "PLA-282",
  parentId: null,
  sourceId: "F-005",
  title: "Typed Convex Preview foundation",
  kind: "executable",
  labels: ["codex-ready"],
  release: "R0",
  milestone: "Deployable foundation ready",
  dependencies: [],
  owner: "Blake Rowley",
  reviewer: "Blake Rowley (interim under DEC-OWNER-001)",
  estimate: 5,
  paths: ["convex/schema.ts"],
  tests: { success: "passes", failure: "fails", recovery: "restores" },
  rollout: "preview",
  rollback: "prior commit",
  telemetry: "foundation_result",
  proof: "reports/evidence/r0-convex-foundation.json",
  sourceVersion: "v7.1.0a",
  sourceSection: "§1.5",
  outcome: "Typed Convex Preview foundation",
  ...overrides,
});

const liveIssue = (
  candidate: LinearIssueSnapshot,
  overrides: Partial<LinearFingerprint["issues"][number]> = {},
): LinearFingerprint["issues"][number] => ({
  linearId: "00000000-0000-4000-8000-000000000282",
  identifier: candidate.id,
  title: candidate.title,
  descriptionFingerprint: "a".repeat(64),
  updatedAt: "2026-07-15T00:00:00.000Z",
  estimate: candidate.estimate,
  priority: 2,
  archivedAt: null,
  state: "In Progress",
  stateType: "started",
  labels: candidate.labels,
  assignee: candidate.owner,
  assigneeId: "person-blake",
  team: "PLA",
  teamId: "team-pla",
  projectId: "project-platform",
  project: "Platform",
  milestoneId: "milestone-foundation",
  milestone: candidate.milestone,
  parent: candidate.parentId,
  releases: candidate.release ? [candidate.release] : [],
  relations: [],
  ...overrides,
});

const fingerprint = (
  issues: LinearFingerprint["issues"],
): LinearFingerprint => ({
  issues,
  releasePipelines: [],
  releases: [],
  projects: [],
  projectMilestones: [],
});

const decisions = [
  { id: "DEC-WIP-001", status: "active" },
  { id: "DEC-OWNER-001", status: "active" },
  { id: "DEC-PRIORITY-001", status: "active" },
];

test("accepts one live ready issue in the WIP-1 lane", () => {
  const ready = issue();
  assert.deepEqual(
    operatingModelFindings(
      model,
      [ready],
      fingerprint([liveIssue(ready)]),
      decisions,
    ),
    [],
  );
});

test("rejects WIP overflow and started work outside the ready queue", () => {
  const ready = issue();
  const unready = issue({
    id: "PLA-283",
    sourceId: "F-006",
    labels: [],
  });
  const findings = operatingModelFindings(
    model,
    [ready, unready],
    fingerprint([liveIssue(ready), liveIssue(unready)]),
    decisions,
  );
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set(["wip_limit_exceeded", "started_issue_not_ready"]),
  );
});

test("rejects unresolved ready dependencies and live planning drift", () => {
  const dependency = issue({
    id: "PLA-217",
    sourceId: "F-001",
    labels: [],
  });
  const ready = issue({ dependencies: ["F-001"] });
  const findings = operatingModelFindings(
    model,
    [dependency, ready],
    fingerprint([
      liveIssue(dependency, { state: "Backlog", stateType: "backlog" }),
      liveIssue(ready, {
        assignee: "Different owner",
        estimate: 3,
        milestone: "Wrong milestone",
      }),
    ]),
    decisions,
  );
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set([
      "ready_dependency_incomplete",
      "ready_owner_drift",
      "ready_estimate_drift",
      "ready_milestone_drift",
    ]),
  );
});

test("requires active WIP and interim-review decisions", () => {
  const ready = issue();
  const findings = operatingModelFindings(
    model,
    [ready],
    fingerprint([liveIssue(ready)]),
    decisions.map((decision) => ({ ...decision, status: "superseded" })),
  );
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set([
      "wip_decision_inactive",
      "interim_review_decision_inactive",
      "priority_decision_inactive",
    ]),
  );
});

test("requires an independent reviewer after the interim decision ends", () => {
  const ready = issue({ reviewer: "Independent Reviewer" });
  const findings = operatingModelFindings(
    model,
    [ready],
    fingerprint([liveIssue(ready)]),
    [
      { id: "DEC-WIP-001", status: "active" },
      { id: "DEC-OWNER-001", status: "superseded" },
      { id: "DEC-PRIORITY-001", status: "active" },
    ],
  );
  assert.deepEqual(findings, []);
});

test("enforces the bounded rolling ready queue", () => {
  const empty = operatingModelFindings(
    model,
    [],
    fingerprint([]),
    decisions,
  );
  assert.equal(empty[0].code, "ready_queue_under_minimum");

  const crowdedIssues = Array.from({ length: 11 }, (_, index) =>
    issue({ id: `PLA-${300 + index}`, sourceId: `F-${300 + index}` })
  );
  const crowded = operatingModelFindings(
    model,
    crowdedIssues,
    fingerprint(
      crowdedIssues.map((candidate) =>
        liveIssue(candidate, { state: "Backlog", stateType: "backlog" })
      ),
    ),
    decisions,
  );
  assert.equal(
    crowded.some((finding) => finding.code === "ready_queue_over_maximum"),
    true,
  );
});

test("fails closed on an invalid operating model", () => {
  const invalid = {
    ...model,
    lanes: [
      { id: "implementation", owner: "", wipLimit: 0 },
      { id: "implementation", owner: "Blake Rowley", wipLimit: 1 },
    ],
    readyQueue: { minimum: 2, maximum: 1 },
  };
  assert.equal(
    operatingModelFindings(invalid, [], fingerprint([]), decisions)[0].code,
    "operating_model_invalid",
  );
  const noIndependentReview = {
    ...model,
    independentReview: { ...model.independentReview, checks: [] },
  };
  assert.equal(
    operatingModelFindings(
      noIndependentReview,
      [],
      fingerprint([]),
      decisions,
    )[0].code,
    "operating_model_invalid",
  );
});

test("rejects a stale ready label, release, or terminal state", () => {
  const ready = issue();
  const findings = operatingModelFindings(
    model,
    [ready],
    fingerprint([
      liveIssue(ready, {
        labels: [],
        releases: ["R1"],
        state: "Done",
        stateType: "completed",
      }),
    ]),
    decisions,
  );
  assert.deepEqual(
    new Set(findings.map((finding) => finding.code)),
    new Set([
      "ready_label_drift",
      "ready_release_drift",
      "ready_state_invalid",
    ]),
  );
});

test("reports a missing live fingerprint instead of crashing", () => {
  assert.equal(
    operatingModelFindings(
      model,
      [issue()],
      undefined as unknown as LinearFingerprint,
      decisions,
    )[0].code,
    "operating_model_linear_fingerprint_missing",
  );
});

test("canonical policy records independent review without inventing a second human", () => {
  const canonical = JSON.parse(
    readFileSync("delivery/operating-model.json", "utf8"),
  ) as OperatingModel;
  assert.deepEqual(canonical.independentReview.checks, [
    "required-ci",
    "codex-independent-review",
  ]);
  assert.deepEqual(canonical.readyQueue, { minimum: 5, maximum: 10 });
  assert.deepEqual(canonical.priorityPolicy, {
    urgent: 1,
    decisionId: "DEC-PRIORITY-001",
  });
  assert.equal(canonical.independentReview.humanApprover, "Blake Rowley");
  assert.match(canonical.independentReview.approvalGate, /CI.*Codex.*Blake/i);
  assert.match(
    canonical.independentReview.capacityValidationTrigger,
    /second active human/i,
  );

  const ownerDecision = readFileSync("delivery/decisions.jsonl", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .find((decision) => decision.id === "DEC-OWNER-001");
  assert.match(ownerDecision.decision, /required CI.*Codex reviewer/i);
  assert.match(ownerDecision.assumption, /Linear app.*only.*human/i);
  assert.match(ownerDecision.validationTrigger, /second active human/i);
  const priorityDecision = readFileSync("delivery/decisions.jsonl", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .find((decision) => decision.id === "DEC-PRIORITY-001");
  assert.match(priorityDecision.decision, /Urgent.*active.*queue/i);
});

test("rejects urgent priority outside the active execution queue", () => {
  const ready = issue();
  const later = issue({
    id: "PLA-900",
    sourceId: "F-900",
    labels: [],
    release: "R5",
  });
  const findings = operatingModelFindings(
    model,
    [ready, later],
    fingerprint([
      liveIssue(ready, { state: "Backlog", stateType: "backlog" }),
      liveIssue(later, {
        priority: 1,
        releases: ["R5"],
        state: "Backlog",
        stateType: "backlog",
      }),
    ]),
    decisions,
  );
  assert.equal(
    findings.some(
      (finding) =>
        finding.code === "urgent_priority_outside_active_queue" &&
        finding.issueId === "PLA-900",
    ),
    true,
  );
});

test("allows urgent priority for active work and its direct blocker", () => {
  const ready = issue();
  const blocker = issue({
    id: "PLA-217",
    sourceId: "F-001",
    labels: [],
  });
  const relation = "blocks:PLA-217:PLA-282";
  const findings = operatingModelFindings(
    model,
    [blocker, ready],
    fingerprint([
      liveIssue(blocker, {
        priority: 1,
        relations: [relation],
        state: "Backlog",
        stateType: "backlog",
      }),
      liveIssue(ready, {
        priority: 1,
        relations: [relation],
        state: "Backlog",
        stateType: "backlog",
      }),
    ]),
    decisions,
  );
  assert.equal(
    findings.some((finding) =>
      finding.code === "urgent_priority_outside_active_queue"
    ),
    false,
  );
});

test("fails closed when the live priority fingerprint is incomplete", () => {
  const ready = issue();
  const findings = operatingModelFindings(
    model,
    [ready],
    fingerprint([
      liveIssue(ready, {
        priority: undefined as unknown as number,
      }),
    ]),
    decisions,
  );
  assert.equal(findings[0].code, "operating_model_priority_missing");
});
