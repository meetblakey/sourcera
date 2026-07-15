import { strict as assert } from "node:assert";
import test from "node:test";
import type { LinearFingerprint } from "./lib/linear-live.js";
import {
  linearSyncPreservationFindings,
} from "./lib/linear-sync.js";
import type { LinearSyncAllowances } from "./lib/linear-sync.js";
import type { Finding, ReleaseId } from "./lib/model.js";

type Issue = LinearFingerprint["issues"][number];

function issue(identifier: string, release: ReleaseId): Issue {
  return {
    identifier,
    title: `${identifier} title`,
    descriptionFingerprint: `${identifier}-description-hash`,
    updatedAt: "2026-07-15T10:00:00.000Z",
    estimate: identifier === "PLA-1" ? 5 : null,
    state: "Backlog",
    stateType: "backlog",
    labels: identifier === "PLA-1"
      ? ["codex-ready", "feature"]
      : ["feature", "seller"],
    assignee: identifier === "PLA-1" ? "Owner" : null,
    team: "PLA",
    projectId: "project-1",
    project: "Sourcera",
    milestoneId: "milestone-1",
    milestone: "Existing milestone",
    parent: "PLA-0",
    releases: [release],
    relations: [`blocks:${identifier}:PLA-9`, `related:${identifier}:PLA-8`],
  };
}

function fingerprint(): LinearFingerprint {
  return {
    issues: [issue("PLA-1", "R2"), issue("PLA-2", "R1")],
    releasePipelines: [
      {
        id: "pipeline-1",
        name: "Sourcera Product Delivery",
        updatedAt: "2026-07-15T10:00:00.000Z",
        type: "scheduled",
        isProduction: true,
        teams: ["OPS", "PLA"],
        stages: [
          { id: "stage-1", name: "Planned", type: "planned" },
          { id: "stage-2", name: "Released", type: "released" },
        ],
      },
      {
        id: "pipeline-2",
        name: "Archive",
        updatedAt: "2026-07-15T10:00:00.000Z",
        type: "manual",
        isProduction: false,
        teams: ["PLA"],
        stages: [{ id: "stage-3", name: "Archived", type: "canceled" }],
      },
    ],
    releases: [
      {
        id: "release-0",
        name: "First Defensible Evaluation",
        version: "R0",
        updatedAt: "2026-07-15T10:00:00.000Z",
        pipeline: "pipeline-1",
        stage: "stage-1",
        stageType: "planned",
      },
      {
        id: "release-1",
        name: "Team Evaluation & Collaboration",
        version: "R1",
        updatedAt: "2026-07-15T10:00:00.000Z",
        pipeline: "pipeline-1",
        stage: "stage-1",
        stageType: "planned",
      },
    ],
    projects: [
      {
        id: "project-1",
        name: "Sourcera",
        updatedAt: "2026-07-15T10:00:00.000Z",
      },
    ],
    projectMilestones: [
      {
        id: "milestone-1",
        name: "Existing milestone",
        updatedAt: "2026-07-15T10:00:00.000Z",
        targetDate: null,
        projectId: "project-1",
        project: "Sourcera",
      },
    ],
  };
}

function clone(value: LinearFingerprint): LinearFingerprint {
  return structuredClone(value);
}

function codes(findings: Finding[]): string[] {
  return findings.map((finding) => finding.code);
}

function expected(
  values: ReadonlyArray<readonly [string, ReleaseId]> = [["PLA-1", "R0"]],
): ReadonlyMap<string, ReleaseId> {
  return new Map(values);
}

test("allows only an expected release, expected milestone, permitted codex-ready removal, and updatedAt changes", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues.reverse();
  after.releasePipelines.reverse();
  after.releases.reverse();

  const mapped = after.issues.find((candidate) => candidate.identifier === "PLA-1")!;
  mapped.releases = ["R0"];
  mapped.milestone = "Required R0 milestone";
  mapped.labels = ["feature"];
  mapped.relations.reverse();
  mapped.updatedAt = "2026-07-15T11:00:00.000Z";

  const unmapped = after.issues.find((candidate) => candidate.identifier === "PLA-2")!;
  unmapped.labels.reverse();
  unmapped.relations.reverse();
  unmapped.updatedAt = "2026-07-15T11:00:00.000Z";

  for (const pipeline of after.releasePipelines) {
    pipeline.updatedAt = "2026-07-15T11:00:00.000Z";
    pipeline.teams.reverse();
    pipeline.stages.reverse();
  }
  for (const release of after.releases) {
    release.updatedAt = "2026-07-15T11:00:00.000Z";
  }

  assert.deepEqual(
    linearSyncPreservationFindings(before, after, expected(), {
      expectedMilestoneByIssue: new Map([
        ["PLA-1", "Required R0 milestone"],
      ]),
      readinessFailedIssueIds: new Set(["PLA-1"]),
    }),
    [],
  );
});

test("rejects every protected issue-field mutation with stable codes", () => {
  const before = fingerprint();
  const after = clone(before);
  const changed = after.issues[0];
  changed.title = "Changed title";
  changed.descriptionFingerprint = "changed-description-hash";
  changed.estimate = null;
  changed.assignee = "Different owner";
  changed.team = "OTHER";
  changed.project = "Different project";
  changed.parent = null;
  changed.relations = [];
  changed.state = "In Progress";
  changed.stateType = "started";
  changed.labels = ["codex-ready", "feature", "new-label"];
  changed.releases = ["R0"];
  changed.milestone = "Arbitrary milestone";

  assert.deepEqual(
    new Set(codes(linearSyncPreservationFindings(before, after, expected()))),
    new Set([
      "linear_sync_title_changed",
      "linear_sync_description_changed",
      "linear_sync_estimate_changed",
      "linear_sync_owner_changed",
      "linear_sync_team_changed",
      "linear_sync_project_changed",
      "linear_sync_parent_changed",
      "linear_sync_relations_changed",
      "linear_sync_state_changed",
      "linear_sync_state_type_changed",
      "linear_sync_labels_changed",
      "linear_sync_milestone_changed",
    ]),
  );
});

test("preserves numeric and null estimates in both directions", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].estimate = null;
  after.issues[1].estimate = 3;
  after.issues[0].releases = ["R0"];

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected())),
    ["linear_sync_estimate_changed", "linear_sync_estimate_changed"],
  );
});

test("rejects missing, unexpected, duplicate, and unmapped expected issues", () => {
  const before = fingerprint();
  before.issues.push(clone(before).issues[0]);
  const after = clone(fingerprint());
  after.issues = [after.issues[0], after.issues[0], issue("PLA-3", "R3")];
  after.issues[0].releases = ["R0"];

  assert.deepEqual(
    new Set(codes(linearSyncPreservationFindings(
      before,
      after,
      expected([["PLA-1", "R0"], ["PLA-4", "R4"]]),
    ))),
    new Set([
      "linear_sync_issue_duplicate_before",
      "linear_sync_issue_duplicate_after",
      "linear_sync_issue_missing",
      "linear_sync_issue_unexpected",
      "linear_sync_expected_issue_missing",
    ]),
  );
});

test("requires mapped releases exactly and leaves unmapped releases unchanged", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0", "R2"];
  after.issues[1].releases = ["R2"];

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected())),
    ["linear_sync_issue_release_changed", "linear_sync_issue_release_changed"],
  );
});

test("does not permit adding labels or removing labels other than codex-ready", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[0].labels = ["codex-ready", "feature", "new-label"];
  after.issues[1].labels = ["seller"];

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected())),
    ["linear_sync_labels_changed", "linear_sync_labels_changed"],
  );
});

test("rejects codex-ready removal unless readiness failed for that issue", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[0].labels = ["feature"];

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected())),
    ["linear_sync_labels_changed"],
  );
});

test("keeps milestones unchanged because the release-only contract cannot derive one", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[0].milestone = null;

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected())),
    ["linear_sync_milestone_changed"],
  );
});

test("rejects a milestone that is not the exact planned milestone", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[0].milestone = "Arbitrary milestone";

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), {
      expectedMilestoneByIssue: new Map([
        ["PLA-1", "Required R0 milestone"],
      ]),
    })),
    ["linear_sync_milestone_changed"],
  );
});

test("does not honor arbitrary extra allowance fields", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[0].milestone = "Arbitrary milestone";
  after.issues[0].labels = ["feature"];
  const arbitrary = {
    allowMilestoneChanges: true,
    allowReadinessLabelChanges: true,
  } as unknown as LinearSyncAllowances;

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), arbitrary)),
    ["linear_sync_labels_changed", "linear_sync_milestone_changed"],
  );
});

test("rejects planned milestone or readiness changes for an uncaptured issue", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), {
      expectedMilestoneByIssue: new Map([["PLA-4", "Required milestone"]]),
      readinessFailedIssueIds: new Set(["PLA-4"]),
    })),
    ["linear_sync_expected_issue_missing"],
  );
});

test("rejects release-pipeline identity and topology drift", () => {
  const before = fingerprint();
  before.releasePipelines.push(clone(before).releasePipelines[0]);
  const after = clone(fingerprint());
  after.issues[0].releases = ["R0"];
  after.releasePipelines = [
    after.releasePipelines[0],
    after.releasePipelines[0],
    {
      ...after.releasePipelines[1],
      id: "pipeline-3",
      name: "Unexpected",
    },
  ];
  after.releasePipelines[0].name = "Changed name";

  assert.deepEqual(
    new Set(codes(linearSyncPreservationFindings(before, after, expected()))),
    new Set([
      "linear_sync_release_pipeline_duplicate_before",
      "linear_sync_release_pipeline_duplicate_after",
      "linear_sync_release_pipeline_missing",
      "linear_sync_release_pipeline_unexpected",
      "linear_sync_release_pipeline_changed",
    ]),
  );
});

test("rejects release identity and topology drift", () => {
  const before = fingerprint();
  before.releases.push(clone(before).releases[0]);
  const after = clone(fingerprint());
  after.issues[0].releases = ["R0"];
  after.releases = [
    after.releases[0],
    after.releases[0],
    {
      ...after.releases[1],
      id: "release-2",
      version: "R2",
    },
  ];
  after.releases[0].stage = "changed-stage";

  assert.deepEqual(
    new Set(codes(linearSyncPreservationFindings(before, after, expected()))),
    new Set([
      "linear_sync_release_duplicate_before",
      "linear_sync_release_duplicate_after",
      "linear_sync_release_missing",
      "linear_sync_release_unexpected",
      "linear_sync_release_changed",
    ]),
  );
});
