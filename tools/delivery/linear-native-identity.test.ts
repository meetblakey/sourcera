import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  assertLinearNativeIdentityCapture,
  assertLinearRawDocumentsMatchNativeIdentity,
  type LinearNativeIdentityCapture,
} from "./lib/linear-live.js";

const coverage = (rows: number) => ({
  terminal: true as const,
  pages: 1,
  rows,
  finalCursor: null,
  attempts: 1,
});

function nativeIdentity(): LinearNativeIdentityCapture {
  const firstDocument = "First document";
  const secondDocument = "Second document";
  return {
    schemaVersion: 1,
    workspace: {
      id: "workspace-1",
      name: "Sourcera",
      urlKey: "sourcera",
      archivedAt: null,
    },
    issues: [
      {
        issueUuid: "issue-1",
        identifier: "PLA-1",
        title: "First",
        archivedAt: null,
        descriptionSha256: "a".repeat(64),
        teamId: "team-1",
        stateId: "state-1",
        projectId: "project-1",
        estimate: 1,
        priority: 1,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        releaseIds: [],
        parentIssueUuid: null,
        assigneeId: "user-1",
        labelIds: ["label-1"],
        relationIds: ["relation-1"],
      },
      {
        issueUuid: "issue-2",
        identifier: "PLA-2",
        title: "Second",
        archivedAt: null,
        descriptionSha256: "b".repeat(64),
        teamId: "team-1",
        stateId: "state-1",
        projectId: "project-1",
        estimate: null,
        priority: 2,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        releaseIds: [],
        parentIssueUuid: "issue-1",
        assigneeId: null,
        labelIds: [],
        relationIds: ["relation-1"],
      },
    ],
    labels: [
      {
        id: "label-1",
        name: "Requirement",
        color: "#123456",
        archivedAt: null,
        inheritedFromId: null,
        isGroup: false,
        parentId: null,
        parentName: null,
        teamId: "team-1",
        teamKey: "PLA",
      },
    ],
    relations: [
      {
        relationId: "relation-1",
        canonicalKey: "blocks:PLA-1:PLA-2",
        type: "blocks",
        archivedAt: null,
        issueId: "issue-1",
        issueIdentifier: "PLA-1",
        relatedIssueId: "issue-2",
        relatedIssueIdentifier: "PLA-2",
      },
    ],
    teams: [
      { id: "team-1", key: "PLA", name: "Platform", archivedAt: null },
    ],
    workflowStates: [
      {
        id: "state-1",
        name: "Backlog",
        type: "backlog",
        color: "#cccccc",
        position: 1,
        archivedAt: null,
        teamId: "team-1",
        teamKey: "PLA",
      },
    ],
    users: [
      {
        id: "user-1",
        name: "Blake",
        displayName: "Blake",
        active: true,
        app: false,
        guest: false,
        archivedAt: null,
      },
    ],
    initiatives: [
      {
        id: "initiative-1",
        name: "Platform outcome",
        contentSha256: createHash("sha256").update("").digest("hex"),
        descriptionSha256: createHash("sha256").update("").digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        ownerId: "user-1",
        status: "started",
        priority: 1,
        health: "onTrack",
        healthUpdatedAt: "2026-07-27T00:00:00.000Z",
        startedAt: "2026-07-01T00:00:00.000Z",
        targetDate: "2026-09-30",
        targetDateResolution: "quarter",
        parentInitiativeId: null,
      },
    ],
    projects: [
      {
        id: "project-1",
        name: "Platform",
        contentSha256: createHash("sha256").update("").digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        statusId: "project-status-1",
        status: "Planned",
        statusType: "planned",
        priority: 1,
        leadId: "user-1",
        startDate: "2026-07-01",
        startDateResolution: null,
        targetDate: "2026-09-30",
        targetDateResolution: "quarter",
        teamIds: ["team-1"],
        initiativeIds: ["initiative-1"],
      },
    ],
    releasePipelines: [],
    releases: [],
    projectMilestones: [],
    cycles: [],
    documents: [
      {
        id: "document-1",
        title: "First document",
        contentSha256: createHash("sha256").update(firstDocument).digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        initiativeId: null,
        projectId: "project-1",
        teamId: null,
        issueId: null,
        releaseId: null,
        cycleId: null,
      },
      {
        id: "document-2",
        title: "Second document",
        contentSha256: createHash("sha256").update(secondDocument).digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        initiativeId: null,
        projectId: null,
        teamId: "team-1",
        issueId: null,
        releaseId: null,
        cycleId: null,
      },
    ],
    rawDocumentIds: ["document-1", "document-2"],
    coverage: {
      complete: true,
      totals: {
        issues: 2,
        labels: 1,
        labelAssignments: 1,
        relations: 1,
        teams: 1,
        workflowStates: 1,
        users: 1,
        initiatives: 1,
        projects: 1,
        releasePipelines: 0,
        releases: 0,
        projectMilestones: 0,
        cycles: 0,
        documents: 2,
      },
      topLevel: {
        issues: coverage(2),
        labels: coverage(1),
        teams: coverage(1),
        workflowStates: coverage(1),
        users: coverage(1),
        initiatives: coverage(1),
        projects: coverage(1),
        releasePipelines: coverage(0),
        releases: coverage(0),
        projectMilestones: coverage(0),
        cycles: coverage(0),
        documents: coverage(2),
      },
      perIssue: [
        {
          issueUuid: "issue-1",
          identifier: "PLA-1",
          labels: coverage(1),
          relations: coverage(1),
          inverseRelations: coverage(0),
        },
        {
          issueUuid: "issue-2",
          identifier: "PLA-2",
          labels: coverage(0),
          relations: coverage(0),
          inverseRelations: coverage(1),
        },
      ],
      perProject: [
        {
          projectId: "project-1",
          teams: coverage(1),
          initiatives: coverage(1),
        },
      ],
    },
  };
}

function nativeIdentityWithPlanningMetadata(): LinearNativeIdentityCapture {
  const identity = nativeIdentity();
  identity.releasePipelines = [{
    id: "pipeline-1",
    name: "Production",
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    type: "scheduled",
    isProduction: true,
    teamIds: ["team-1"],
    stages: [{
      id: "stage-1",
      name: "Planned",
      type: "planned",
      archivedAt: null,
      position: 0,
      frozen: false,
    }],
  }];
  identity.releases = [{
    id: "release-1",
    name: "R0",
    descriptionSha256: createHash("sha256").update("Release").digest("hex"),
    version: "R0",
    commitSha: "0123456789abcdef0123456789abcdef01234567",
    startDate: "2026-07-01",
    startedAt: "2026-07-01T00:00:00.000Z",
    targetDate: "2026-07-31",
    completedAt: null,
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    pipelineId: "pipeline-1",
    stageId: "stage-1",
    stageName: "Planned",
    stageType: "planned",
  }];
  identity.projectMilestones = [{
    id: "milestone-1",
    name: "Production evidence",
    descriptionSha256: createHash("sha256").update("Evidence").digest("hex"),
    projectId: "project-1",
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    targetDate: "2026-07-31",
    status: "unstarted",
  }];
  identity.cycles = [{
    id: "cycle-1",
    number: 1,
    name: "Cycle 1",
    descriptionSha256: createHash("sha256").update("Cycle").digest("hex"),
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    startsAt: "2026-07-01T00:00:00.000Z",
    endsAt: "2026-07-14T00:00:00.000Z",
    completedAt: null,
    teamId: "team-1",
    teamKey: "PLA",
    inheritedFromId: null,
  }];
  identity.documents.push(
    {
      id: "document-release",
      title: "",
      contentSha256: createHash("sha256").update("").digest("hex"),
      updatedAt: "2026-07-27T00:00:00.000Z",
      archivedAt: null,
      initiativeId: null,
      projectId: null,
      teamId: null,
      issueId: null,
      releaseId: "release-1",
      cycleId: null,
    },
    {
      id: "document-cycle",
      title: "",
      contentSha256: createHash("sha256").update("").digest("hex"),
      updatedAt: "2026-07-27T00:00:00.000Z",
      archivedAt: null,
      initiativeId: null,
      projectId: null,
      teamId: null,
      issueId: null,
      releaseId: null,
      cycleId: "cycle-1",
    },
  );
  identity.coverage.totals.releasePipelines = 1;
  identity.coverage.totals.releases = 1;
  identity.coverage.totals.projectMilestones = 1;
  identity.coverage.totals.cycles = 1;
  identity.coverage.totals.documents = 4;
  identity.coverage.topLevel.releasePipelines = coverage(1);
  identity.coverage.topLevel.releases = coverage(1);
  identity.coverage.topLevel.projectMilestones = coverage(1);
  identity.coverage.topLevel.cycles = coverage(1);
  identity.coverage.topLevel.documents = coverage(4);
  return identity;
}

test("native identity validation accepts exact catalogs and coverage", () => {
  assert.doesNotThrow(() => assertLinearNativeIdentityCapture(nativeIdentity()));
});

test("native identity accepts empty document titles with release and cycle parents", () => {
  assert.doesNotThrow(() =>
    assertLinearNativeIdentityCapture(nativeIdentityWithPlanningMetadata())
  );
});

test("native identity rejects governed planning metadata drift", () => {
  const badStage = nativeIdentityWithPlanningMetadata();
  badStage.releases[0].stageName = "Completed";
  assert.throws(
    () => assertLinearNativeIdentityCapture(badStage),
    /release release-1 has invalid metadata or references/,
  );

  const badCycle = nativeIdentityWithPlanningMetadata();
  badCycle.cycles[0].inheritedFromId = "cycle-missing";
  assert.throws(
    () => assertLinearNativeIdentityCapture(badCycle),
    /cycle cycle-1 has invalid metadata or references/,
  );

  const badProject = nativeIdentityWithPlanningMetadata();
  badProject.projects[0].statusId = "";
  assert.throws(
    () => assertLinearNativeIdentityCapture(badProject),
    /project project-1 has invalid metadata/,
  );
});

test("native identity validation rejects duplicate identities and bad references", () => {
  const duplicate = nativeIdentity();
  duplicate.issues.push({ ...duplicate.issues[0] });
  assert.throws(
    () => assertLinearNativeIdentityCapture(duplicate),
    /duplicate row/,
  );

  const orphan = nativeIdentity();
  orphan.issues[0].projectId = "project-missing";
  assert.throws(
    () => assertLinearNativeIdentityCapture(orphan),
    /issue PLA-1 has invalid references/,
  );
});

test("native identity validation rejects relation and coverage drift", () => {
  const relationDrift = nativeIdentity();
  relationDrift.issues[1].relationIds = [];
  assert.throws(
    () => assertLinearNativeIdentityCapture(relationDrift),
    /issue PLA-2 relation assignments are invalid/,
  );

  const coverageDrift = nativeIdentity();
  coverageDrift.coverage.topLevel.documents.rows = 1;
  assert.throws(
    () => assertLinearNativeIdentityCapture(coverageDrift),
    /documents catalog coverage is invalid/,
  );
});

test("native identity validation rejects parent cycles", () => {
  const cyclic = nativeIdentity();
  cyclic.issues[0].parentIssueUuid = "issue-2";
  assert.throws(
    () => assertLinearNativeIdentityCapture(cyclic),
    /issue parent graph contains a cycle/,
  );
});

test("raw document validation requires the exact unique document ID set", () => {
  const identity = nativeIdentity();
  const first = {
    ...identity.documents[0],
    content: "First document",
  };
  assert.throws(
    () =>
      assertLinearRawDocumentsMatchNativeIdentity(identity, {
        schemaVersion: 1,
        documents: [first, { ...first }],
      }),
    /duplicates document-1/,
  );
});

test("raw document validation accepts only the explicit content allowlist", () => {
  const identity = nativeIdentity();
  identity.rawDocumentIds = ["document-1"];
  assert.doesNotThrow(() =>
    assertLinearRawDocumentsMatchNativeIdentity(identity, {
      schemaVersion: 1,
      documents: [{
        ...identity.documents[0],
        content: "First document",
      }],
    })
  );
  assert.throws(
    () =>
      assertLinearRawDocumentsMatchNativeIdentity(identity, {
        schemaVersion: 1,
        documents: [{
          ...identity.documents[1],
          content: "Second document",
        }],
      }),
    /does not match its native identity/,
  );
});
