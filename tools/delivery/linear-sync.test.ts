import { strict as assert } from "node:assert";
import test from "node:test";
import type { LinearFingerprint } from "./lib/linear-live.js";
import {
  linearSyncPreservationFindings,
} from "./lib/linear-sync.js";
import type {
  LinearMilestoneIdentity,
  LinearSyncAllowances,
} from "./lib/linear-sync.js";
import type { Finding, ReleaseId } from "./lib/model.js";

type Issue = LinearFingerprint["issues"][number];

function stableIssueId(identifier: string): string {
  const suffix = [...identifier]
    .map((character) => character.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .padStart(12, "0")
    .slice(-12);
  return `00000000-0000-4000-8000-${suffix}`;
}

function issue(identifier: string, release: ReleaseId): Issue {
  return {
    linearId: stableIssueId(identifier),
    identifier,
    title: `${identifier} title`,
    descriptionFingerprint: `${identifier}-description-hash`,
    updatedAt: "2026-07-15T10:00:00.000Z",
    estimate: identifier === "PLA-1" ? 5 : null,
    priority: 2,
    state: "Backlog",
    stateType: "backlog",
    archivedAt: null,
    labels: identifier === "PLA-1"
      ? ["codex-ready", "feature"]
      : ["feature", "seller"],
    assignee: identifier === "PLA-1" ? "Owner" : null,
    assigneeId: identifier === "PLA-1" ? "person-owner" : null,
    team: "PLA",
    teamId: "team-pla",
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
        archivedAt: null,
        type: "scheduled",
        isProduction: true,
        teams: [
          { id: "team-ops", key: "OPS" },
          { id: "team-pla", key: "PLA" },
        ],
        stages: [
          {
            id: "stage-1",
            name: "Planned",
            type: "planned",
            archivedAt: null,
            position: 0,
            frozen: false,
          },
          {
            id: "stage-2",
            name: "Released",
            type: "completed",
            archivedAt: null,
            position: 1,
            frozen: false,
          },
        ],
      },
      {
        id: "pipeline-2",
        name: "Archive",
        updatedAt: "2026-07-15T10:00:00.000Z",
        archivedAt: null,
        type: "scheduled",
        isProduction: false,
        teams: [{ id: "team-pla", key: "PLA" }],
        stages: [{
          id: "stage-3",
          name: "Archived",
          type: "canceled",
          archivedAt: null,
          position: 0,
          frozen: false,
        }],
      },
    ],
    releases: [
      {
        id: "release-0",
        name: "First Defensible Evaluation",
        version: "R0",
        updatedAt: "2026-07-15T10:00:00.000Z",
        archivedAt: null,
        pipeline: "pipeline-1",
        stage: "stage-1",
        stageType: "planned",
      },
      {
        id: "release-1",
        name: "Team Evaluation & Collaboration",
        version: "R1",
        updatedAt: "2026-07-15T10:00:00.000Z",
        archivedAt: null,
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
        archivedAt: null,
      },
    ],
    projectMilestones: [
      {
        id: "milestone-1",
        name: "Existing milestone",
        projectId: "project-1",
        project: "Sourcera",
        archivedAt: null,
      },
      {
        id: "milestone-required",
        name: "Required R0 milestone",
        projectId: "project-1",
        project: "Sourcera",
        archivedAt: null,
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

test("allows only an expected release, expected milestone, permitted codex-ready removal, and available updatedAt changes", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues.reverse();
  after.releasePipelines.reverse();
  after.releases.reverse();
  after.projects.reverse();
  after.projectMilestones.reverse();

  const mapped = after.issues.find((candidate) => candidate.identifier === "PLA-1")!;
  mapped.releases = ["R0"];
  mapped.milestoneId = "milestone-required";
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
  for (const project of after.projects) {
    project.updatedAt = "2026-07-15T11:00:00.000Z";
  }
  assert.deepEqual(
    linearSyncPreservationFindings(before, after, expected(), {
      expectedMilestoneByIssue: new Map([
        [
          "PLA-1",
          { id: "milestone-required", name: "Required R0 milestone" },
        ],
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
  changed.linearId = stableIssueId("PLA-99");
  changed.descriptionFingerprint = "changed-description-hash";
  changed.estimate = null;
  changed.priority = 4;
  changed.assignee = "Different owner";
  changed.assigneeId = "person-different";
  changed.team = "OTHER";
  changed.teamId = "team-other";
  changed.project = "Different project";
  changed.parent = null;
  changed.relations = [];
  changed.state = "In Progress";
  changed.stateType = "started";
  changed.archivedAt = "2026-07-15T10:30:00.000Z";
  changed.labels = ["codex-ready", "feature", "new-label"];
  changed.releases = ["R0"];
  changed.milestone = "Arbitrary milestone";

  assert.deepEqual(
    new Set(codes(linearSyncPreservationFindings(before, after, expected()))),
    new Set([
      "linear_sync_title_changed",
      "linear_sync_issue_identity_changed",
      "linear_sync_description_changed",
      "linear_sync_estimate_changed",
      "linear_sync_priority_changed",
      "linear_sync_owner_changed",
      "linear_sync_owner_identity_changed",
      "linear_sync_team_changed",
      "linear_sync_team_identity_changed",
      "linear_sync_project_changed",
      "linear_sync_parent_changed",
      "linear_sync_relations_changed",
      "linear_sync_state_changed",
      "linear_sync_state_type_changed",
      "linear_sync_archived_changed",
      "linear_sync_labels_changed",
      "linear_sync_milestone_changed",
    ]),
  );
});

test("fails closed when stable issue identity or archive capability is unavailable", () => {
  const cases: Array<[
    string,
    (before: LinearFingerprint, after: LinearFingerprint) => void,
    string,
  ]> = [
    ["issue identity", (before, after) => {
      before.issues[0].linearId = null;
      after.issues[0].linearId = null;
    }, "linear_sync_issue_identity_unavailable"],
    ["issue archive", (before, after) => {
      before.issues[0].archivedAt = "unavailable";
      after.issues[0].archivedAt = "unavailable";
    }, "linear_sync_issue_archive_capability_unavailable"],
    ["pipeline archive", (before, after) => {
      before.releasePipelines[0].archivedAt = "unavailable";
      after.releasePipelines[0].archivedAt = "unavailable";
    }, "linear_sync_release_pipeline_archive_capability_unavailable"],
    ["stage archive", (before, after) => {
      before.releasePipelines[0].stages[0].archivedAt = "unavailable";
      after.releasePipelines[0].stages[0].archivedAt = "unavailable";
    }, "linear_sync_release_stage_archive_capability_unavailable"],
    ["release archive", (before, after) => {
      before.releases[0].archivedAt = "unavailable";
      after.releases[0].archivedAt = "unavailable";
    }, "linear_sync_release_archive_capability_unavailable"],
    ["project archive", (before, after) => {
      before.projects[0].archivedAt = "unavailable";
      after.projects[0].archivedAt = "unavailable";
    }, "linear_sync_project_archive_capability_unavailable"],
    ["milestone archive", (before, after) => {
      before.projectMilestones[0].archivedAt = "unavailable";
      after.projectMilestones[0].archivedAt = "unavailable";
    }, "linear_sync_project_milestone_archive_capability_unavailable"],
  ];
  for (const [name, mutate, expectedCode] of cases) {
    const before = fingerprint();
    const after = clone(before);
    after.issues[0].releases = ["R0"];
    mutate(before, after);
    assert.ok(
      codes(linearSyncPreservationFindings(before, after, expected())).includes(
        expectedCode,
      ),
      name,
    );
  }
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

test("without an expected milestone, preserves both milestone ID and name", () => {
  for (const mutate of [
    (candidate: Issue) => {
      candidate.milestoneId = "different-id";
    },
    (candidate: Issue) => {
      candidate.milestone = "Different name";
    },
  ]) {
    const before = fingerprint();
    const after = clone(before);
    after.issues[0].releases = ["R0"];
    mutate(after.issues[0]);
    assert.deepEqual(
      codes(linearSyncPreservationFindings(before, after, expected())),
      ["linear_sync_milestone_changed"],
    );
  }
});

test("rejects a planned milestone name paired with the stale ID", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[0].milestone = "Required R0 milestone";

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), {
      expectedMilestoneByIssue: new Map([
        [
          "PLA-1",
          { id: "milestone-required", name: "Required R0 milestone" },
        ],
      ]),
    })),
    ["linear_sync_milestone_changed"],
  );
});

test("validates planned milestone identity against active after-state inventory and project", () => {
  const cases: Array<[
    string,
    (before: LinearFingerprint, after: LinearFingerprint) => LinearMilestoneIdentity,
    string,
  ]> = [
    ["unknown", (_before, after) => {
      after.issues[0].milestoneId = "milestone-unknown";
      after.issues[0].milestone = "Unknown";
      return { id: "milestone-unknown", name: "Unknown" };
    }, "linear_sync_expected_milestone_missing"],
    ["name mismatch", (_before, after) => {
      after.issues[0].milestoneId = "milestone-required";
      after.issues[0].milestone = "Wrong name";
      return { id: "milestone-required", name: "Wrong name" };
    }, "linear_sync_expected_milestone_name_mismatch"],
    ["cross project", (before, after) => {
      const secondProject = {
        id: "project-2",
        name: "Other",
        updatedAt: "2026-07-15T10:00:00.000Z",
        archivedAt: null,
      };
      const secondMilestone = {
        id: "milestone-other",
        name: "Other milestone",
        projectId: "project-2",
        project: "Other",
        archivedAt: null,
      };
      before.projects.push(secondProject);
      after.projects.push(structuredClone(secondProject));
      before.projectMilestones.push(secondMilestone);
      after.projectMilestones.push(structuredClone(secondMilestone));
      after.issues[0].milestoneId = secondMilestone.id;
      after.issues[0].milestone = secondMilestone.name;
      return { id: secondMilestone.id, name: secondMilestone.name };
    }, "linear_sync_expected_milestone_project_mismatch"],
    ["archived", (before, after) => {
      const archivedAt = "2026-07-15T11:00:00.000Z";
      before.projectMilestones.find((row) => row.id === "milestone-required")!
        .archivedAt = archivedAt;
      after.projectMilestones.find((row) => row.id === "milestone-required")!
        .archivedAt = archivedAt;
      after.issues[0].milestoneId = "milestone-required";
      after.issues[0].milestone = "Required R0 milestone";
      return { id: "milestone-required", name: "Required R0 milestone" };
    }, "linear_sync_expected_milestone_archived"],
  ];
  for (const [name, mutate, expectedCode] of cases) {
    const before = fingerprint();
    const after = clone(before);
    after.issues[0].releases = ["R0"];
    const milestone = mutate(before, after);
    assert.ok(
      codes(linearSyncPreservationFindings(before, after, expected(), {
        expectedMilestoneByIssue: new Map([["PLA-1", milestone]]),
      })).includes(expectedCode),
      name,
    );
  }
});

test("allows an expected null milestone only when both ID and name clear", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[0].milestoneId = null;
  after.issues[0].milestone = null;
  const allowances = {
    expectedMilestoneByIssue: new Map([["PLA-1", null]]),
  };
  assert.deepEqual(
    linearSyncPreservationFindings(before, after, expected(), allowances),
    [],
  );
  after.issues[0].milestoneId = "milestone-1";
  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), allowances)),
    ["linear_sync_milestone_changed"],
  );
});

test("allows exact complete expected relation sets with release and milestone changes", () => {
  const before = fingerprint();
  const after = clone(before);
  const relation = "blocks:PLA-1:PLA-2";
  const first = after.issues[0];
  const second = after.issues[1];
  first.releases = ["R0"];
  first.milestoneId = "milestone-required";
  first.milestone = "Required R0 milestone";
  first.relations = [relation, ...first.relations].reverse();
  second.relations = [...second.relations, relation].reverse();

  assert.deepEqual(
    linearSyncPreservationFindings(before, after, expected(), {
      expectedMilestoneByIssue: new Map([
        [
          "PLA-1",
          { id: "milestone-required", name: "Required R0 milestone" },
        ],
      ]),
      expectedRelationsByIssue: new Map([
        ["PLA-1", [...before.issues[0].relations, relation].reverse()],
        ["PLA-2", [relation, ...before.issues[1].relations]],
      ]),
    }),
    [],
  );
});

test("rejects missing, extra, or wrongly oriented planned relations", () => {
  const existing = fingerprint().issues[0].relations;
  const secondExisting = fingerprint().issues[1].relations;
  const planned = "blocks:PLA-1:PLA-2";
  const cases: Array<{
    name: string;
    expectedRelations: string[];
    afterRelations: string[];
    expectedSecondRelations?: string[];
    afterSecondRelations?: string[];
  }> = [
    {
      name: "missing",
      expectedRelations: [...existing, planned],
      afterRelations: [...existing],
      expectedSecondRelations: [...secondExisting, planned],
      afterSecondRelations: [...secondExisting, planned],
    },
    {
      name: "extra",
      expectedRelations: [...existing],
      afterRelations: [...existing, planned],
    },
    {
      name: "wrong orientation",
      expectedRelations: [...existing, planned],
      afterRelations: [...existing, "blocks:PLA-2:PLA-1"],
      expectedSecondRelations: [...secondExisting, planned],
      afterSecondRelations: [...secondExisting, planned],
    },
  ];

  for (const candidate of cases) {
    const before = fingerprint();
    const after = clone(before);
    after.issues[0].releases = ["R0"];
    after.issues[0].relations = candidate.afterRelations;
    if (candidate.afterSecondRelations) {
      after.issues[1].relations = candidate.afterSecondRelations;
    }
    const expectedRelationsByIssue = new Map([
      ["PLA-1", candidate.expectedRelations],
    ]);
    if (candidate.expectedSecondRelations) {
      expectedRelationsByIssue.set(
        "PLA-2",
        candidate.expectedSecondRelations,
      );
    }
    assert.deepEqual(
      codes(linearSyncPreservationFindings(before, after, expected(), {
        expectedRelationsByIssue,
      })),
      ["linear_sync_relations_changed"],
      candidate.name,
    );
  }
});

test("rejects an expected relation that does not contain its mapped issue", () => {
  const before = fingerprint();
  before.issues.push(issue("PLA-3", "R2"));
  const after = clone(before);
  const unrelated = "blocks:PLA-2:PLA-3";
  after.issues[0].releases = ["R0"];
  after.issues[0].relations.push(unrelated);

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), {
      expectedRelationsByIssue: new Map([
        ["PLA-1", [...before.issues[0].relations, unrelated]],
      ]),
    })),
    ["linear_sync_expected_relation_issue_mismatch"],
  );
});

test("requires both endpoint plans for every new blocks relation", () => {
  const planned = "blocks:PLA-1:PLA-2";
  for (const includeSecondPlan of [false, true]) {
    const before = fingerprint();
    const after = clone(before);
    after.issues[0].releases = ["R0"];
    after.issues[0].relations.push(planned);
    const expectedRelationsByIssue = new Map([
      ["PLA-1", [...before.issues[0].relations, planned]],
    ]);
    if (includeSecondPlan) {
      expectedRelationsByIssue.set("PLA-2", before.issues[1].relations);
    }

    assert.deepEqual(
      codes(linearSyncPreservationFindings(before, after, expected(), {
        expectedRelationsByIssue,
      })),
      ["linear_sync_expected_relation_endpoint_incomplete"],
      includeSecondPlan ? "second endpoint omits relation" : "second endpoint unmapped",
    );
  }
});

test("rejects duplicate relation entries in before and after captures", () => {
  const before = fingerprint();
  before.issues[0].relations.push(before.issues[0].relations[0]);
  const after = clone(before);
  after.issues[0].releases = ["R0"];

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected())),
    [
      "linear_sync_relations_duplicate_after",
      "linear_sync_relations_duplicate_before",
    ],
  );
});

test("rejects duplicate and noncanonical expected relation sets", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  const canonical = before.issues[0].relations;

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), {
      expectedRelationsByIssue: new Map([
        ["PLA-1", [...canonical, canonical[0]]],
      ]),
    })),
    ["linear_sync_expected_relations_duplicate"],
  );
  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), {
      expectedRelationsByIssue: new Map([
        ["PLA-1", [canonical[0], "related:PLA-8:PLA-1"]],
      ]),
    })),
    ["linear_sync_expected_relations_noncanonical"],
  );
});

test("does not allow a planned relation set to remove an existing relation", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[0].relations = [before.issues[0].relations[0]];

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), {
      expectedRelationsByIssue: new Map([
        ["PLA-1", [...after.issues[0].relations]],
      ]),
    })),
    ["linear_sync_expected_relations_remove_existing"],
  );
});

test("allows only new canonical blocks relations", () => {
  const before = fingerprint();
  const after = clone(before);
  const unexpected = "related:PLA-1:PLA-2";
  after.issues[0].releases = ["R0"];
  after.issues[0].relations.push(unexpected);

  assert.deepEqual(
    codes(linearSyncPreservationFindings(before, after, expected(), {
      expectedRelationsByIssue: new Map([
        ["PLA-1", [...before.issues[0].relations, unexpected]],
      ]),
    })),
    ["linear_sync_expected_relation_type_invalid"],
  );
});

test("requires relation allowance issue IDs in both complete captures", () => {
  for (const missingFrom of ["before", "after"] as const) {
    const before = fingerprint();
    const after = clone(before);
    after.issues[0].releases = ["R0"];
    if (missingFrom === "before") {
      after.issues.push(issue("PLA-3", "R2"));
    } else {
      after.issues = after.issues.filter(
        (candidate) => candidate.identifier !== "PLA-2",
      );
    }
    const identifier = missingFrom === "before" ? "PLA-3" : "PLA-2";
    assert.ok(
      codes(linearSyncPreservationFindings(before, after, expected(), {
        expectedRelationsByIssue: new Map([[identifier, []]]),
      })).includes("linear_sync_expected_issue_missing"),
      missingFrom,
    );
  }
});

test("rejects relation changes for an unmapped issue", () => {
  const before = fingerprint();
  const after = clone(before);
  after.issues[0].releases = ["R0"];
  after.issues[1].relations.push("blocks:PLA-2:PLA-1");

  const findings = linearSyncPreservationFindings(before, after, expected());
  assert.deepEqual(codes(findings), ["linear_sync_relations_changed"]);
  assert.equal(findings[0].issueId, "PLA-2");
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
      expectedMilestoneByIssue: new Map([
        ["PLA-4", { id: "milestone-required", name: "Required milestone" }],
      ]),
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

test("rejects release-stage archive, position, and frozen drift", () => {
  for (const mutate of [
    (stage: LinearFingerprint["releasePipelines"][number]["stages"][number]) => {
      stage.archivedAt = "2026-07-15T11:00:00.000Z";
    },
    (stage: LinearFingerprint["releasePipelines"][number]["stages"][number]) => {
      stage.position = 99;
    },
    (stage: LinearFingerprint["releasePipelines"][number]["stages"][number]) => {
      stage.frozen = true;
    },
  ]) {
    const before = fingerprint();
    const after = clone(before);
    after.issues[0].releases = ["R0"];
    mutate(after.releasePipelines[0].stages[0]);
    assert.ok(
      codes(linearSyncPreservationFindings(before, after, expected())).includes(
        "linear_sync_release_pipeline_changed",
      ),
    );
  }
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

test("rejects project inventory identity and topology drift", () => {
  const before = fingerprint();
  before.projects.push(clone(before).projects[0]);
  before.projects.push({
    ...clone(before).projects[0],
    id: "project-missing",
    name: "Missing",
  });
  const after = clone(fingerprint());
  after.issues[0].releases = ["R0"];
  after.projects = [
    after.projects[0],
    after.projects[0],
    { ...after.projects[0], id: "project-unexpected", name: "Unexpected" },
  ];
  after.projects[0].name = "Changed";

  assert.deepEqual(
    new Set(codes(linearSyncPreservationFindings(before, after, expected()))),
    new Set([
      "linear_sync_project_duplicate_before",
      "linear_sync_project_duplicate_after",
      "linear_sync_project_missing",
      "linear_sync_project_unexpected",
      "linear_sync_project_changed",
    ]),
  );
});

test("rejects project milestone inventory identity and topology drift", () => {
  const before = fingerprint();
  before.projectMilestones.push(clone(before).projectMilestones[0]);
  before.projectMilestones.push({
    ...clone(before).projectMilestones[0],
    id: "milestone-missing",
    name: "Missing",
  });
  const after = clone(fingerprint());
  after.issues[0].releases = ["R0"];
  after.projectMilestones = [
    after.projectMilestones[0],
    after.projectMilestones[0],
    {
      ...after.projectMilestones[0],
      id: "milestone-unexpected",
      name: "Unexpected",
    },
  ];
  after.projectMilestones[0].project = "Changed";

  assert.deepEqual(
    new Set(codes(linearSyncPreservationFindings(before, after, expected()))),
    new Set([
      "linear_sync_project_milestone_duplicate_before",
      "linear_sync_project_milestone_duplicate_after",
      "linear_sync_project_milestone_missing",
      "linear_sync_project_milestone_unexpected",
      "linear_sync_project_milestone_changed",
    ]),
  );
});

test("ignores unavailable milestone scheduling metadata while preserving stable topology", () => {
  const before = fingerprint();
  const after = clone(fingerprint());
  after.issues[0].releases = ["R0"];
  (before.projectMilestones[0] as any).targetDate = null;
  (before.projectMilestones[0] as any).updatedAt =
    "2026-07-15T10:00:00.000Z";
  (after.projectMilestones[0] as any).targetDate = "2026-08-01";
  (after.projectMilestones[0] as any).updatedAt =
    "2026-07-15T11:00:00.000Z";

  assert.equal(
    codes(linearSyncPreservationFindings(before, after, expected())).includes(
      "linear_sync_project_milestone_changed",
    ),
    false,
  );
});
