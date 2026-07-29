import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  assertLinearNativeIdentityMatchesFingerprint,
  canonicalLinearRelationKey,
  committedLinearDriftDiff,
  confirmLinearCaptureConsistency,
  fetchLinearCapture,
  fetchLinearFingerprint,
  fingerprintDiff,
  linearSourceProvenance,
} from "./lib/linear-live.js";
import type {
  LinearCapture,
  LinearFingerprint,
  LinearNativeIdentityCapture,
} from "./lib/linear-live.js";
import type { LinearProgramScope } from "./lib/linear-program-scope.js";

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const completeConnection = <T>(nodes: T[]) => ({
  nodes,
  pageInfo: { hasNextPage: false, endCursor: null },
});

const withEmptyProjectInventories = (fetcher: typeof fetch): typeof fetch =>
  async (input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    if (query.includes("DeliveryProjects")) {
      return response({ data: { projects: completeConnection([]) } });
    }
    if (query.includes("DeliveryProjectMilestones")) {
      return response({ data: { projectMilestones: completeConnection([]) } });
    }
    if (query.includes("DeliveryCycles")) {
      return response({ data: { cycles: completeConnection([]) } });
    }
    return fetcher(input, init);
  };

function consistencyCapture(marker: string): LinearCapture {
  const fingerprint: LinearFingerprint = {
    issues: [],
    releasePipelines: [],
    releases: [],
    projects: [],
    projectMilestones: [],
    cycles: [],
  };
  return {
    fingerprint,
    issueDescriptions: [
      {
        id: marker,
        title: marker,
        description: marker,
        updatedAt: "2026-07-23T00:00:00.000Z",
        labels: [],
      },
    ],
  };
}

function trackedIssue(
  updatedAt = "2026-07-23T00:00:00.000Z",
): LinearFingerprint["issues"][number] {
  return {
    linearId: "issue-1",
    identifier: "PLA-1",
    title: "Tracked issue",
    descriptionFingerprint: "a".repeat(64),
    updatedAt,
    estimate: 3,
    priority: 2,
    dueDate: null,
    archivedAt: null,
    stateId: "state-1",
    state: "Backlog",
    stateType: "backlog",
    labels: ["platform"],
    assignee: "Blake",
    assigneeId: "user-1",
    team: "PLA",
    teamId: "team-1",
    cycleId: null,
    cycleNumber: null,
    cycle: null,
    projectId: "project-1",
    project: "Sourcera Production",
    milestoneId: "milestone-1",
    milestone: "Production evidence closed",
    parentLinearId: null,
    parent: null,
    releases: ["R0"],
    relations: [],
  };
}

test("committed drift ignores issue timestamp-only touches", () => {
  const baseline = consistencyCapture("baseline").fingerprint;
  baseline.issues = [trackedIssue()];
  const timestampOnly = structuredClone(baseline);
  timestampOnly.issues[0].updatedAt = "2026-07-27T06:40:40.698Z";

  assert.deepEqual(fingerprintDiff(baseline, timestampOnly), [
    "issues differ from the committed Linear snapshot",
  ]);
  assert.deepEqual(committedLinearDriftDiff(baseline, timestampOnly), []);

  const semantic = structuredClone(timestampOnly);
  semantic.issues[0].relations = ["blocks:PLA-1:PLA-2"];
  assert.deepEqual(committedLinearDriftDiff(baseline, semantic), [
    "issues differ from the committed Linear snapshot",
  ]);

  for (const invalid of [undefined, null, "not-a-timestamp"] as const) {
    const malformed = structuredClone(timestampOnly);
    (malformed.issues[0] as { updatedAt: unknown }).updatedAt = invalid;
    assert.throws(
      () => committedLinearDriftDiff(baseline, malformed),
      /PLA-1 updatedAt is invalid/,
    );
  }
});

test("bounded consistency capture returns only the matching second read", async () => {
  const first = consistencyCapture("first");
  const second = consistencyCapture("second");
  let calls = 0;
  const accepted = await confirmLinearCaptureConsistency(async () =>
    calls++ === 0 ? first : second
  );
  assert.equal(calls, 2);
  assert.strictEqual(accepted, second);
});

test("bounds each Linear request and response body", async () => {
  let sawAbortSignal = false;
  const fetcher: typeof fetch = async (_input, init) => {
    sawAbortSignal ||= init?.signal instanceof AbortSignal;
    return new Response("{}", {
      status: 200,
      headers: { "content-length": String(32 * 1024 * 1024 + 1) },
    });
  };

  await assert.rejects(
    () => fetchLinearFingerprint(fetcher, "secret"),
    /bounded byte limit/,
  );
  assert.equal(sawAbortSignal, true);
});

test("bounded consistency capture rejects fingerprint drift explicitly", async () => {
  const first = consistencyCapture("first");
  const second = consistencyCapture("second");
  second.fingerprint.projects = [
    {
      id: "project-1",
      name: "Changed",
      descriptionFingerprint: "a".repeat(64),
      updatedAt: "2026-07-23T00:00:00.000Z",
      archivedAt: null,
      statusId: "status-planned",
      status: "Planned",
      statusType: "planned",
      priority: 2,
      lead: null,
      leadId: null,
      startDate: null,
      startDateResolution: null,
      targetDate: null,
      targetDateResolution: null,
    },
  ];
  let calls = 0;
  await assert.rejects(
    () =>
      confirmLinearCaptureConsistency(async () =>
        calls++ === 0 ? first : second
      ),
    /Linear changed during bounded two-pass capture[\s\S]*projects changed between bounded consistency reads/,
  );
  assert.equal(calls, 2);
});

test("bounded consistency capture rejects native identity drift", async () => {
  const first = consistencyCapture("first");
  const second = consistencyCapture("second");
  (first as unknown as { nativeIdentity: unknown }).nativeIdentity = {
    schemaVersion: 1,
    issues: [],
    labels: [],
    relations: [{ id: "relation-1", canonicalKey: "related:PLA-1:PLA-2" }],
    teams: [],
    workflowStates: [],
    users: [],
    initiatives: [],
    documents: [],
    coverage: {},
  };
  (second as unknown as { nativeIdentity: unknown }).nativeIdentity = {
    ...structuredClone(
      (first as unknown as { nativeIdentity: object }).nativeIdentity,
    ),
    relations: [{ id: "relation-2", canonicalKey: "related:PLA-1:PLA-2" }],
  };
  (first as unknown as { documents: unknown }).documents = {
    schemaVersion: 1,
    documents: [],
  };
  (second as unknown as { documents: unknown }).documents = structuredClone(
    (first as unknown as { documents: object }).documents,
  );

  let calls = 0;
  await assert.rejects(
    () =>
      confirmLinearCaptureConsistency(async () =>
        calls++ === 0 ? first : second
      ),
    /native identity changed between bounded consistency reads/,
  );
  assert.equal(calls, 2);
});

test("bounded consistency capture rejects raw document drift", async () => {
  const first = consistencyCapture("first");
  const second = consistencyCapture("second");
  (first as unknown as { documents: unknown }).documents = {
    schemaVersion: 1,
    documents: [{ id: "document-1", content: "first" }],
  };
  (second as unknown as { documents: unknown }).documents = {
    schemaVersion: 1,
    documents: [{ id: "document-1", content: "second" }],
  };

  let calls = 0;
  await assert.rejects(
    () =>
      confirmLinearCaptureConsistency(async () =>
        calls++ === 0 ? first : second
      ),
    /raw documents changed between bounded consistency reads/,
  );
  assert.equal(calls, 2);
});

test("bounded consistency capture names the failed read", async () => {
  await assert.rejects(
    () =>
      confirmLinearCaptureConsistency(async () => {
        throw new Error("first unavailable");
      }),
    /first read failed: first unavailable/,
  );
  let calls = 0;
  await assert.rejects(
    () =>
      confirmLinearCaptureConsistency(async () => {
        calls += 1;
        if (calls === 2) throw new Error("second unavailable");
        return consistencyCapture("first");
      }),
    /second read failed: second unavailable/,
  );
  assert.equal(calls, 2);
});

test("live capture CLI uses the bounded consistency readback", () => {
  const source = readFileSync("tools/delivery/linear-live.ts", "utf8");
  assert.match(source, /await fetchConsistentLinearCapture\(/);
  assert.doesNotMatch(source, /await fetchLinearCapture\(/);
});

test("uses one canonical key for GraphQL and OAuth relation names", () => {
  assert.equal(
    canonicalLinearRelationKey("related", "PLA-282", "PLA-217"),
    canonicalLinearRelationKey("relatedTo", "PLA-217", "PLA-282"),
  );
  assert.equal(
    canonicalLinearRelationKey("blockedBy", "PLA-217", "PLA-220"),
    canonicalLinearRelationKey("blocks", "PLA-220", "PLA-217"),
  );
  assert.equal(
    canonicalLinearRelationKey("duplicateOf", "PLA-1", "PLA-2"),
    canonicalLinearRelationKey("duplicate", "PLA-1", "PLA-2"),
  );
  assert.equal(
    canonicalLinearRelationKey("similar", "PLA-2", "PLA-1"),
    "similar:PLA-1:PLA-2",
  );
});

test("enhanced capture paginates native catalogs and preserves UUID assignments", async () => {
  const labelCursors: Array<string | null> = [];
  const teamCursors: Array<string | null> = [];
  const stateCursors: Array<string | null> = [];
  const userCursors: Array<string | null> = [];
  const initiativeCursors: Array<string | null> = [];
  const projectCursors: Array<string | null> = [];
  const documentCursors: Array<string | null> = [];
  const relation = {
    id: "relation-1",
    type: "related",
    archivedAt: null,
    issue: { id: "issue-1", identifier: "PLA-1" },
    relatedIssue: { id: "issue-2", identifier: "PLA-2" },
  };
  const label = (id: string, name: string) => ({
    id,
    name,
    color: "#123456",
    description: `${name} label`,
    archivedAt: null,
    inheritedFrom: null,
    isGroup: false,
    parent: null,
    team: { id: "team-1", key: "PLA" },
  });
  const issue = (
    id: string,
    identifier: string,
    labels: {
      nodes: ReturnType<typeof label>[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    },
    relations: typeof relation[],
    inverseRelations: typeof relation[],
  ) => ({
    id,
    identifier,
    title: identifier,
    url: `https://linear.app/issue/${identifier}`,
    description: `${identifier} description`,
    updatedAt: "2026-07-27T00:00:00.000Z",
    estimate: 1,
    priority: 2,
    dueDate: null,
    archivedAt: null,
    state: { id: "state-1", name: "Backlog", type: "backlog" },
    labels,
    assignee: id === "issue-1"
      ? { id: "user-1", name: "Blake Rowley" }
      : null,
    team: { id: "team-1", key: "PLA" },
    cycle: null,
    project: null,
    projectMilestone: null,
    parent: null,
    releases: completeConnection([]),
    relations: completeConnection(relations),
    inverseRelations: completeConnection(inverseRelations),
  });
  const fetcher: typeof fetch = withEmptyProjectInventories(
    async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as {
        query: string;
        variables: { id?: string; after?: string | null };
      };
      if (body.query.includes("DeliveryOrganization")) {
        return response({
          data: {
            organization: {
              id: "workspace-1",
              name: "Sourcera",
              urlKey: "sourcera",
              archivedAt: null,
            },
          },
        });
      }
      if (body.query.includes("DeliveryIssueLabelAssignments")) {
        assert.equal(body.variables.id, "issue-1");
        assert.equal(body.variables.after, "issue-labels-next");
        return response({
          data: {
            issue: {
              labels: completeConnection([label("label-2", "human-only")]),
            },
          },
        });
      }
      if (body.query.includes("DeliveryIssues")) {
        return response({
          data: {
            issues: completeConnection([
              issue(
                "issue-1",
                "PLA-1",
                {
                  nodes: [label("label-1", "codex-ready")],
                  pageInfo: {
                    hasNextPage: true,
                    endCursor: "issue-labels-next",
                  },
                },
                [relation],
                [],
              ),
              issue(
                "issue-2",
                "PLA-2",
                completeConnection([label("label-2", "human-only")]),
                [],
                [relation],
              ),
            ]),
          },
        });
      }
      if (body.query.includes("DeliveryIssueLabels")) {
        assert.match(body.query, /\bdescription\b/);
        labelCursors.push(body.variables.after ?? null);
        return response({
          data: {
            issueLabels: body.variables.after
              ? completeConnection([label("label-2", "human-only")])
              : {
                  nodes: [label("label-1", "codex-ready")],
                  pageInfo: { hasNextPage: true, endCursor: "labels-next" },
                },
          },
        });
      }
      if (body.query.includes("DeliveryTeams")) {
        teamCursors.push(body.variables.after ?? null);
        return response({
          data: {
            teams: body.variables.after
              ? completeConnection([
                  {
                    id: "team-2",
                    key: "BUY",
                    name: "Buyer",
                    archivedAt: null,
                  },
                ])
              : {
                  nodes: [
                    {
                      id: "team-1",
                      key: "PLA",
                      name: "Platform",
                      archivedAt: null,
                    },
                  ],
                  pageInfo: { hasNextPage: true, endCursor: "teams-next" },
                },
          },
        });
      }
      if (body.query.includes("DeliveryWorkflowStates")) {
        stateCursors.push(body.variables.after ?? null);
        return response({
          data: {
            workflowStates: body.variables.after
              ? completeConnection([
                  {
                    id: "state-2",
                    name: "Done",
                    type: "completed",
                    color: "#00ff00",
                    position: 2,
                    archivedAt: null,
                    team: { id: "team-1", key: "PLA" },
                  },
                ])
              : {
                  nodes: [
                    {
                      id: "state-1",
                      name: "Backlog",
                      type: "backlog",
                      color: "#cccccc",
                      position: 1,
                      archivedAt: null,
                      team: { id: "team-1", key: "PLA" },
                    },
                  ],
                  pageInfo: { hasNextPage: true, endCursor: "states-next" },
                },
          },
        });
      }
      if (body.query.includes("DeliveryUsers")) {
        userCursors.push(body.variables.after ?? null);
        return response({
          data: {
            users: body.variables.after
              ? completeConnection([
                  {
                    id: "user-2",
                    name: "Linear",
                    displayName: "Linear",
                    active: true,
                    app: true,
                    guest: false,
                    archivedAt: null,
                  },
                ])
              : {
                  nodes: [
                    {
                      id: "user-1",
                      name: "Blake Rowley",
                      displayName: "Blake",
                      active: true,
                      app: false,
                      guest: false,
                      archivedAt: null,
                    },
                  ],
                  pageInfo: { hasNextPage: true, endCursor: "users-next" },
                },
          },
        });
      }
      if (body.query.includes("DeliveryInitiatives")) {
        initiativeCursors.push(body.variables.after ?? null);
        return response({
          data: {
            initiatives: body.variables.after
              ? completeConnection([
                  {
                    id: "initiative-2",
                    name: "Buyer outcome",
                    content: "Buyer initiative",
                    description: "Buyer outcome",
                    updatedAt: "2026-07-27T00:00:00.000Z",
                    archivedAt: null,
                    owner: null,
                    status: "planned",
                    priority: 2,
                    health: null,
                    healthUpdatedAt: null,
                    startedAt: null,
                    targetDate: null,
                    targetDateResolution: null,
                    parentInitiative: {
                      id: "initiative-1",
                      name: "Platform outcome",
                    },
                  },
                ])
              : {
                  nodes: [
                    {
                      id: "initiative-1",
                      name: "Platform outcome",
                      content: "Platform initiative",
                      description: "Platform outcome",
                      updatedAt: "2026-07-27T00:00:00.000Z",
                      archivedAt: null,
                      owner: { id: "user-1", name: "Blake Rowley" },
                      status: "started",
                      priority: 1,
                      health: "onTrack",
                      healthUpdatedAt: "2026-07-27T00:00:00.000Z",
                      startedAt: "2026-07-01T00:00:00.000Z",
                      targetDate: null,
                      targetDateResolution: null,
                      parentInitiative: null,
                    },
                  ],
                  pageInfo: {
                    hasNextPage: true,
                    endCursor: "initiatives-next",
                  },
                },
          },
        });
      }
      if (body.query.includes("DeliveryProjectCatalog")) {
        assert.match(body.query, /projects\(\s*first:\s*5(?!\d)/);
        assert.match(body.query, /teams\(first:\s*10(?!\d)/);
        assert.match(body.query, /initiatives\(first:\s*10(?!\d)/);
        projectCursors.push(body.variables.after ?? null);
        const project = (
          id: string,
          name: string,
          teamId: string,
          key: string,
          initiativeId: string,
          initiativeName: string,
        ) => ({
          id,
          name,
          content: `${name} project`,
          updatedAt: "2026-07-27T00:00:00.000Z",
          archivedAt: null,
          status: { id: `status-${id}`, name: "Planned", type: "planned" },
          priority: 2,
          lead: id === "project-1"
            ? { id: "user-1", name: "Blake Rowley" }
            : null,
          startDate: "2026-07-01",
          startDateResolution: null,
          targetDate: "2026-09-30",
          targetDateResolution: "quarter",
          teams: completeConnection([{ id: teamId, key }]),
          initiatives: completeConnection([
            { id: initiativeId, name: initiativeName },
          ]),
        });
        return response({
          data: {
            projects: body.variables.after
              ? completeConnection([
                  project(
                    "project-2",
                    "Buyer",
                    "team-2",
                    "BUY",
                    "initiative-2",
                    "Buyer outcome",
                  ),
                ])
              : {
                  nodes: [
                    project(
                      "project-1",
                      "Platform",
                      "team-1",
                      "PLA",
                      "initiative-1",
                      "Platform outcome",
                    ),
                  ],
                  pageInfo: {
                    hasNextPage: true,
                    endCursor: "project-catalog-next",
                  },
                },
          },
        });
      }
      if (body.query.includes("DeliveryDocuments")) {
        documentCursors.push(body.variables.after ?? null);
        const document = (id: string, title: string, content: string) => ({
          id,
          title,
          content,
          updatedAt: "2026-07-27T00:00:00.000Z",
          archivedAt: null,
          initiative: null,
          project: null,
          team: { id: "team-1", key: "PLA" },
          issue: null,
          release: null,
          cycle: null,
        });
        return response({
          data: {
            documents: body.variables.after
              ? completeConnection([
                  document("document-2", "Second", "Second body"),
                ])
              : {
                  nodes: [document("document-1", "First", "First body")],
                  pageInfo: {
                    hasNextPage: true,
                    endCursor: "documents-next",
                  },
                },
          },
        });
      }
      if (body.query.includes("DeliveryPipelines")) {
        return response({
          data: { releasePipelines: completeConnection([]) },
        });
      }
      return response({ data: { releases: completeConnection([]) } });
    },
  );

  const capture = await fetchLinearCapture(
    fetcher,
    "secret",
    undefined,
    undefined,
    { nativeIdentity: true },
  );

  assert.deepEqual(labelCursors, [null, "labels-next"]);
  assert.deepEqual(teamCursors, [null, "teams-next"]);
  assert.deepEqual(stateCursors, [null, "states-next"]);
  assert.deepEqual(userCursors, [null, "users-next"]);
  assert.deepEqual(initiativeCursors, [null, "initiatives-next"]);
  assert.deepEqual(projectCursors, [null, "project-catalog-next"]);
  assert.deepEqual(documentCursors, [null, "documents-next"]);
  assert.deepEqual(capture.nativeIdentity, {
    schemaVersion: 1,
    workspace: {
      id: "workspace-1",
      name: "Sourcera",
      urlKey: "sourcera",
      archivedAt: null,
    },
    rawDocumentIds: ["document-1", "document-2"],
    issues: [
      {
        issueUuid: "issue-1",
        identifier: "PLA-1",
        title: "PLA-1",
        archivedAt: null,
        descriptionSha256: createHash("sha256")
          .update("PLA-1 description")
          .digest("hex"),
        teamId: "team-1",
        stateId: "state-1",
        projectId: null,
        estimate: 1,
        priority: 2,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        parentIssueUuid: null,
        assigneeId: "user-1",
        labelIds: ["label-1", "label-2"],
        releaseIds: [],
        relationIds: ["relation-1"],
      },
      {
        issueUuid: "issue-2",
        identifier: "PLA-2",
        title: "PLA-2",
        archivedAt: null,
        descriptionSha256: createHash("sha256")
          .update("PLA-2 description")
          .digest("hex"),
        teamId: "team-1",
        stateId: "state-1",
        projectId: null,
        estimate: 1,
        priority: 2,
        dueDate: null,
        cycleId: null,
        milestoneId: null,
        parentIssueUuid: null,
        assigneeId: null,
        labelIds: ["label-2"],
        releaseIds: [],
        relationIds: ["relation-1"],
      },
    ],
    labels: [
      {
        id: "label-1",
        name: "codex-ready",
        color: "#123456",
        description: "codex-ready label",
        archivedAt: null,
        inheritedFromId: null,
        isGroup: false,
        parentId: null,
        parentName: null,
        teamId: "team-1",
        teamKey: "PLA",
      },
      {
        id: "label-2",
        name: "human-only",
        color: "#123456",
        description: "human-only label",
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
        canonicalKey: "related:PLA-1:PLA-2",
        type: "related",
        archivedAt: null,
        issueId: "issue-1",
        issueIdentifier: "PLA-1",
        relatedIssueId: "issue-2",
        relatedIssueIdentifier: "PLA-2",
      },
    ],
    projects: [
      {
        id: "project-1",
        name: "Platform",
        contentSha256: createHash("sha256")
          .update("Platform project")
          .digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        statusId: "status-project-1",
        status: "Planned",
        statusType: "planned",
        priority: 2,
        leadId: "user-1",
        startDate: "2026-07-01",
        startDateResolution: null,
        targetDate: "2026-09-30",
        targetDateResolution: "quarter",
        teamIds: ["team-1"],
        initiativeIds: ["initiative-1"],
      },
      {
        id: "project-2",
        name: "Buyer",
        contentSha256: createHash("sha256")
          .update("Buyer project")
          .digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        statusId: "status-project-2",
        status: "Planned",
        statusType: "planned",
        priority: 2,
        leadId: null,
        startDate: "2026-07-01",
        startDateResolution: null,
        targetDate: "2026-09-30",
        targetDateResolution: "quarter",
        teamIds: ["team-2"],
        initiativeIds: ["initiative-2"],
      },
    ],
    teams: [
      {
        id: "team-1",
        key: "PLA",
        name: "Platform",
        archivedAt: null,
      },
      {
        id: "team-2",
        key: "BUY",
        name: "Buyer",
        archivedAt: null,
      },
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
      {
        id: "state-2",
        name: "Done",
        type: "completed",
        color: "#00ff00",
        position: 2,
        archivedAt: null,
        teamId: "team-1",
        teamKey: "PLA",
      },
    ],
    users: [
      {
        id: "user-1",
        name: "Blake Rowley",
        displayName: "Blake",
        active: true,
        app: false,
        guest: false,
        archivedAt: null,
      },
      {
        id: "user-2",
        name: "Linear",
        displayName: "Linear",
        active: true,
        app: true,
        guest: false,
        archivedAt: null,
      },
    ],
    initiatives: [
      {
        id: "initiative-1",
        name: "Platform outcome",
        contentSha256: createHash("sha256")
          .update("Platform initiative")
          .digest("hex"),
        descriptionSha256: createHash("sha256")
          .update("Platform outcome")
          .digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        ownerId: "user-1",
        status: "started",
        priority: 1,
        health: "onTrack",
        healthUpdatedAt: "2026-07-27T00:00:00.000Z",
        startedAt: "2026-07-01T00:00:00.000Z",
        targetDate: null,
        targetDateResolution: null,
        parentInitiativeId: null,
      },
      {
        id: "initiative-2",
        name: "Buyer outcome",
        contentSha256: createHash("sha256")
          .update("Buyer initiative")
          .digest("hex"),
        descriptionSha256: createHash("sha256")
          .update("Buyer outcome")
          .digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        ownerId: null,
        status: "planned",
        priority: 2,
        health: null,
        healthUpdatedAt: null,
        startedAt: null,
        targetDate: null,
        targetDateResolution: null,
        parentInitiativeId: "initiative-1",
      },
    ],
    releasePipelines: [],
    releases: [],
    projectMilestones: [],
    cycles: [],
    documents: [
      {
        id: "document-1",
        title: "First",
        contentSha256: createHash("sha256")
          .update("First body")
          .digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        initiativeId: null,
        projectId: null,
        teamId: "team-1",
        issueId: null,
        releaseId: null,
        cycleId: null,
      },
      {
        id: "document-2",
        title: "Second",
        contentSha256: createHash("sha256")
          .update("Second body")
          .digest("hex"),
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
    coverage: {
      complete: true,
      totals: {
        issues: 2,
        labels: 2,
        labelAssignments: 3,
        relations: 1,
        teams: 2,
        workflowStates: 2,
        users: 2,
        initiatives: 2,
        projects: 2,
        releasePipelines: 0,
        releases: 0,
        projectMilestones: 0,
        cycles: 0,
        documents: 2,
      },
      topLevel: {
        issues: {
          terminal: true,
          pages: 1,
          rows: 2,
          finalCursor: null,
          attempts: 1,
        },
        labels: {
          terminal: true,
          pages: 2,
          rows: 2,
          finalCursor: null,
          attempts: 2,
        },
        teams: {
          terminal: true,
          pages: 2,
          rows: 2,
          finalCursor: null,
          attempts: 2,
        },
        workflowStates: {
          terminal: true,
          pages: 2,
          rows: 2,
          finalCursor: null,
          attempts: 2,
        },
        users: {
          terminal: true,
          pages: 2,
          rows: 2,
          finalCursor: null,
          attempts: 2,
        },
        initiatives: {
          terminal: true,
          pages: 2,
          rows: 2,
          finalCursor: null,
          attempts: 2,
        },
        projects: {
          terminal: true,
          pages: 2,
          rows: 2,
          finalCursor: null,
          attempts: 2,
        },
        releasePipelines: {
          terminal: true,
          pages: 1,
          rows: 0,
          finalCursor: null,
          attempts: 1,
        },
        releases: {
          terminal: true,
          pages: 1,
          rows: 0,
          finalCursor: null,
          attempts: 1,
        },
        projectMilestones: {
          terminal: true,
          pages: 1,
          rows: 0,
          finalCursor: null,
          attempts: 1,
        },
        cycles: {
          terminal: true,
          pages: 1,
          rows: 0,
          finalCursor: null,
          attempts: 1,
        },
        documents: {
          terminal: true,
          pages: 2,
          rows: 2,
          finalCursor: null,
          attempts: 2,
        },
      },
      perIssue: [
        {
          issueUuid: "issue-1",
          identifier: "PLA-1",
          labels: {
            terminal: true,
            pages: 2,
            rows: 2,
            finalCursor: null,
            attempts: 2,
          },
          relations: {
            terminal: true,
            pages: 1,
            rows: 1,
            finalCursor: null,
            attempts: 1,
          },
          inverseRelations: {
            terminal: true,
            pages: 1,
            rows: 0,
            finalCursor: null,
            attempts: 1,
          },
        },
        {
          issueUuid: "issue-2",
          identifier: "PLA-2",
          labels: {
            terminal: true,
            pages: 1,
            rows: 1,
            finalCursor: null,
            attempts: 1,
          },
          relations: {
            terminal: true,
            pages: 1,
            rows: 0,
            finalCursor: null,
            attempts: 1,
          },
          inverseRelations: {
            terminal: true,
            pages: 1,
            rows: 1,
            finalCursor: null,
            attempts: 1,
          },
        },
      ],
      perProject: [
        {
          projectId: "project-1",
          teams: {
            terminal: true,
            pages: 1,
            rows: 1,
            finalCursor: null,
            attempts: 1,
          },
          initiatives: {
            terminal: true,
            pages: 1,
            rows: 1,
            finalCursor: null,
            attempts: 1,
          },
        },
        {
          projectId: "project-2",
          teams: {
            terminal: true,
            pages: 1,
            rows: 1,
            finalCursor: null,
            attempts: 1,
          },
          initiatives: {
            terminal: true,
            pages: 1,
            rows: 1,
            finalCursor: null,
            attempts: 1,
          },
        },
      ],
    },
  });
  const withoutWorkspace = structuredClone(capture.nativeIdentity!);
  delete (
    withoutWorkspace as unknown as {
      workspace?: unknown;
    }
  ).workspace;
  assert.throws(
    () =>
      assertLinearNativeIdentityMatchesFingerprint(
        capture.fingerprint,
        withoutWorkspace,
      ),
    /workspace identity/,
  );
  const invalidLabelDescription = structuredClone(capture.nativeIdentity!);
  (invalidLabelDescription.labels[0] as unknown as { description: unknown }).description = 42;
  assert.throws(
    () =>
      assertLinearNativeIdentityMatchesFingerprint(
        capture.fingerprint,
        invalidLabelDescription,
      ),
    /native label .* invalid references/,
  );
  const invalidLabelColor = structuredClone(capture.nativeIdentity!);
  invalidLabelColor.labels[0]!.color = "green";
  assert.throws(
    () =>
      assertLinearNativeIdentityMatchesFingerprint(
        capture.fingerprint,
        invalidLabelColor,
      ),
    /native label .* invalid references/,
  );
  const nonGroupParent: LinearNativeIdentityCapture = structuredClone(
    capture.nativeIdentity!,
  );
  nonGroupParent.labels[0]!.parentId = "label-2";
  nonGroupParent.labels[0]!.parentName = "human-only";
  assert.throws(
    () =>
      assertLinearNativeIdentityMatchesFingerprint(
        capture.fingerprint,
        nonGroupParent,
      ),
    /native label .* invalid references/,
  );
  const assignedGroup = structuredClone(capture.nativeIdentity!);
  assignedGroup.labels[1]!.isGroup = true;
  assert.throws(
    () =>
      assertLinearNativeIdentityMatchesFingerprint(
        capture.fingerprint,
        assignedGroup,
      ),
    /assigns a label group/,
  );
  assert.deepEqual(capture.documents, {
    schemaVersion: 1,
    documents: [
      {
        id: "document-1",
        title: "First",
        content: "First body",
        contentSha256: createHash("sha256")
          .update("First body")
          .digest("hex"),
        updatedAt: "2026-07-27T00:00:00.000Z",
        archivedAt: null,
        initiativeId: null,
        projectId: null,
        teamId: "team-1",
        issueId: null,
        releaseId: null,
        cycleId: null,
      },
      {
        id: "document-2",
        title: "Second",
        content: "Second body",
        contentSha256: createHash("sha256")
          .update("Second body")
          .digest("hex"),
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
  });
});

test("enhanced capture preserves governed planning metadata and native document parents", async () => {
  const requested: string[] = [];
  const project = {
    id: "project-1",
    name: "Platform",
    content: "Project contract",
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    status: { id: "project-status-1", name: "In Progress", type: "started" },
    priority: 1,
    lead: { id: "user-1", name: "Blake" },
    startDate: "2026-07-01",
    startDateResolution: "month",
    targetDate: "2026-09-30",
    targetDateResolution: "quarter",
  };
  const initiative = {
    id: "initiative-1",
    name: "Platform outcome",
    content: "Initiative contract",
    description: "Strategic outcome",
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    owner: { id: "user-1", name: "Blake" },
    status: "started",
    priority: 1,
    health: "onTrack",
    healthUpdatedAt: "2026-07-26T00:00:00.000Z",
    startedAt: "2026-07-01T00:00:00.000Z",
    targetDate: "2026-09-30",
    targetDateResolution: "quarter",
    parentInitiative: null,
  };
  const pipeline = {
    id: "pipeline-1",
    name: "Production",
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    type: "scheduled",
    isProduction: true,
    teams: completeConnection([{ id: "team-1", key: "PLA" }]),
    stages: completeConnection([{
      id: "stage-1",
      name: "Planned",
      type: "planned",
      archivedAt: null,
      position: 0,
      frozen: false,
    }]),
  };
  const release = {
    id: "release-1",
    name: "R0",
    description: "Release contract",
    version: "R0",
    commitSha: "0123456789abcdef0123456789abcdef01234567",
    startDate: "2026-07-01",
    startedAt: "2026-07-01T00:00:00.000Z",
    targetDate: "2026-07-31",
    completedAt: null,
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    pipeline: { id: "pipeline-1" },
    stage: { id: "stage-1", name: "Planned", type: "planned" },
  };
  const milestone = {
    id: "milestone-1",
    name: "Evidence",
    description: "Evidence contract",
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    targetDate: "2026-07-31",
    status: "unstarted",
    project: { id: "project-1", name: "Platform" },
  };
  const cycle = {
    id: "cycle-1",
    number: 1,
    name: "Cycle 1",
    description: "Cycle contract",
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    startsAt: "2026-07-01T00:00:00.000Z",
    endsAt: "2026-07-14T00:00:00.000Z",
    completedAt: null,
    team: { id: "team-1", key: "PLA" },
    inheritedFrom: null,
  };
  const fetcher: typeof fetch = async (_input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    requested.push(query);
    if (query.includes("DeliveryOrganization")) {
      return response({
        data: {
          organization: {
            id: "workspace-1",
            name: "Sourcera",
            urlKey: "sourcera",
            archivedAt: null,
          },
        },
      });
    }
    if (query.includes("DeliveryIssues")) {
      return response({ data: { issues: completeConnection([]) } });
    }
    if (query.includes("DeliveryIssueLabels")) {
      return response({ data: { issueLabels: completeConnection([]) } });
    }
    if (query.includes("DeliveryTeams")) {
      return response({
        data: {
          teams: completeConnection([{
            id: "team-1",
            key: "PLA",
            name: "Platform",
            archivedAt: null,
          }]),
        },
      });
    }
    if (query.includes("DeliveryWorkflowStates")) {
      return response({ data: { workflowStates: completeConnection([]) } });
    }
    if (query.includes("DeliveryUsers")) {
      return response({
        data: {
          users: completeConnection([{
            id: "user-1",
            name: "Blake",
            displayName: "Blake",
            active: true,
            app: false,
            guest: false,
            archivedAt: null,
          }]),
        },
      });
    }
    if (query.includes("DeliveryInitiatives")) {
      return response({ data: { initiatives: completeConnection([initiative]) } });
    }
    if (query.includes("DeliveryProjectCatalog")) {
      return response({
        data: {
          projects: completeConnection([{
            ...project,
            teams: completeConnection([{ id: "team-1", key: "PLA" }]),
            initiatives: completeConnection([{
              id: "initiative-1",
              name: "Platform outcome",
            }]),
          }]),
        },
      });
    }
    if (query.includes("DeliveryProjects")) {
      return response({
        data: {
          projects: completeConnection([{
            ...project,
            initiatives: completeConnection([{
              id: "initiative-1",
              name: "Platform outcome",
            }]),
          }]),
        },
      });
    }
    if (query.includes("DeliveryProjectMilestones")) {
      return response({ data: { projectMilestones: completeConnection([milestone]) } });
    }
    if (query.includes("DeliveryCycles")) {
      return response({ data: { cycles: completeConnection([cycle]) } });
    }
    if (query.includes("DeliveryPipelines")) {
      return response({ data: { releasePipelines: completeConnection([pipeline]) } });
    }
    if (query.includes("DeliveryReleases")) {
      return response({ data: { releases: completeConnection([release]) } });
    }
    if (query.includes("DeliveryDocuments")) {
      return response({
        data: {
          documents: completeConnection([
            {
              id: "document-release",
              title: "",
              content: "Release document",
              updatedAt: "2026-07-27T00:00:00.000Z",
              archivedAt: null,
              initiative: null,
              project: null,
              team: null,
              issue: null,
              release: { id: "release-1", name: "R0", version: "R0" },
              cycle: null,
            },
            {
              id: "document-cycle",
              title: "",
              content: "Cycle document",
              updatedAt: "2026-07-27T00:00:00.000Z",
              archivedAt: null,
              initiative: null,
              project: null,
              team: null,
              issue: null,
              release: null,
              cycle: { id: "cycle-1", number: 1, name: "Cycle 1" },
            },
          ]),
        },
      });
    }
    throw new Error(`Unexpected query: ${query}`);
  };

  const capture = await fetchLinearCapture(
    fetcher,
    "secret",
    undefined,
    undefined,
    { nativeIdentity: true },
  );

  assert.deepEqual(capture.nativeIdentity?.projects[0], {
    id: "project-1",
    name: "Platform",
    contentSha256: createHash("sha256").update("Project contract").digest("hex"),
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    statusId: "project-status-1",
    status: "In Progress",
    statusType: "started",
    priority: 1,
    leadId: "user-1",
    startDate: "2026-07-01",
    startDateResolution: "month",
    targetDate: "2026-09-30",
    targetDateResolution: "quarter",
    teamIds: ["team-1"],
    initiativeIds: ["initiative-1"],
  });
  assert.deepEqual(
    capture.nativeIdentity?.documents.map((document) => ({
      title: document.title,
      releaseId: document.releaseId,
      cycleId: document.cycleId,
    })),
    [
      { title: "", releaseId: null, cycleId: "cycle-1" },
      { title: "", releaseId: "release-1", cycleId: null },
    ],
  );
  assert.equal(capture.nativeIdentity?.releases[0].startedAt, release.startedAt);
  assert.equal(capture.nativeIdentity?.cycles[0].teamId, "team-1");
  const projectDrift = structuredClone(capture.nativeIdentity!);
  projectDrift.projects[0].priority = 4;
  assert.throws(
    () =>
      assertLinearNativeIdentityMatchesFingerprint(
        capture.fingerprint,
        projectDrift,
      ),
    /project project-1 does not match the accepted fingerprint/,
  );
  for (const [queryName, fields] of [
    ["DeliveryProjectCatalog", ["status { id name type }", "startDateResolution", "targetDateResolution"]],
    ["DeliveryInitiatives", ["content", "description", "startedAt", "targetDateResolution"]],
    ["DeliveryReleases", ["startedAt", "completedAt", "stage { id name type }"]],
    ["DeliveryCycles", ["completedAt", "team { id key }", "inheritedFrom { id }"]],
  ] as const) {
    const query = requested.find((candidate) => candidate.includes(queryName));
    assert.ok(query);
    for (const field of fields) assert.ok(query.includes(field), `${queryName} lacks ${field}`);
  }
});

test("enhanced capture rejects duplicate or missing relation mirrors", async () => {
  const relation = {
    id: "relation-1",
    type: "related",
    archivedAt: null,
    issue: { id: "issue-1", identifier: "PLA-1" },
    relatedIssue: { id: "issue-2", identifier: "PLA-2" },
  };
  const issue = (
    id: string,
    identifier: string,
    relations: typeof relation[],
    inverseRelations: typeof relation[],
  ) => ({
    id,
    identifier,
    title: identifier,
    url: `https://linear.app/issue/${identifier}`,
    description: identifier,
    updatedAt: "2026-07-27T00:00:00.000Z",
    estimate: 1,
    priority: 2,
    dueDate: null,
    archivedAt: null,
    state: { id: "state-1", name: "Backlog", type: "backlog" },
    labels: completeConnection([]),
    assignee: null,
    team: { id: "team-1", key: "PLA" },
    cycle: null,
    project: null,
    projectMilestone: null,
    parent: null,
    releases: completeConnection([]),
    relations: completeConnection(relations),
    inverseRelations: completeConnection(inverseRelations),
  });
  const fetcher: typeof fetch = withEmptyProjectInventories(
    async (_input, init) => {
      const query = (JSON.parse(String(init?.body)) as { query: string }).query;
      if (query.includes("DeliveryIssues")) {
        return response({
          data: {
            issues: completeConnection([
              issue("issue-1", "PLA-1", [relation, relation], []),
              issue("issue-2", "PLA-2", [], [relation]),
            ]),
          },
        });
      }
      if (query.includes("DeliveryIssueLabels")) {
        return response({ data: { issueLabels: completeConnection([]) } });
      }
      if (query.includes("DeliveryTeams")) {
        return response({
          data: {
            teams: completeConnection([
              {
                id: "team-1",
                key: "PLA",
                name: "Platform",
                archivedAt: null,
              },
            ]),
          },
        });
      }
      if (query.includes("DeliveryWorkflowStates")) {
        return response({
          data: {
            workflowStates: completeConnection([
              {
                id: "state-1",
                name: "Backlog",
                type: "backlog",
                color: "#cccccc",
                position: 1,
                archivedAt: null,
                team: { id: "team-1", key: "PLA" },
              },
            ]),
          },
        });
      }
      if (query.includes("DeliveryUsers")) {
        return response({ data: { users: completeConnection([]) } });
      }
      if (query.includes("DeliveryInitiatives")) {
        return response({ data: { initiatives: completeConnection([]) } });
      }
      if (query.includes("DeliveryProjectCatalog")) {
        return response({ data: { projects: completeConnection([]) } });
      }
      if (query.includes("DeliveryDocuments")) {
        return response({ data: { documents: completeConnection([]) } });
      }
      if (query.includes("DeliveryPipelines")) {
        return response({
          data: { releasePipelines: completeConnection([]) },
        });
      }
      return response({ data: { releases: completeConnection([]) } });
    },
  );

  await assert.rejects(
    () =>
      fetchLinearCapture(
        fetcher,
        "secret",
        undefined,
        undefined,
        { nativeIdentity: true },
      ),
    /relation-1.*exactly one forward\/inverse mirror pair/,
  );
});

test("captures every exact source section from Linear provenance", () => {
  assert.deepEqual(
    linearSourceProvenance(`
## Source provenance
* Canonical requirement: \`F-005\`.
* Canonical authority: \`Sourcera_Master_Spec.md\` §1.5 Deployment, §7.5 Reactivity, §7.5.3 SLO, and §44.1 Targets.
* Canonical source checksum: \`sha256:${"a".repeat(64)}\`.
`),
    {
      sourceId: "F-005",
      sourceDocument: "Sourcera_Master_Spec.md",
      sourceDocuments: ["Sourcera_Master_Spec.md"],
      section: "§1.5, §7.5, §7.5.3, §44.1",
      sectionBundleCount: null,
      sourceBinding: null,
      sourceChecksum: "a".repeat(64),
    },
  );
});

test("captures registered multi-document source bundle provenance", () => {
  assert.deepEqual(
    linearSourceProvenance(`
## Source provenance
- Canonical requirement: \`F-139\`
- Source documents: \`Sourcera_Master_Spec.md\`, \`UX_Design_of_Sourcera.md\`
- Source section bundle: 30 registered slices
- Canonical source binding: sha256:${"b".repeat(64)}
- Canonical source checksum: sha256:${"c".repeat(64)}
`),
    {
      sourceId: "F-139",
      sourceDocument: null,
      sourceDocuments: [
        "Sourcera_Master_Spec.md",
        "UX_Design_of_Sourcera.md",
      ],
      section: null,
      sectionBundleCount: 30,
      sourceBinding: "b".repeat(64),
      sourceChecksum: "c".repeat(64),
    },
  );
});

test("captures a registered named source heading", () => {
  assert.deepEqual(
    linearSourceProvenance(`
## Source provenance
- Canonical requirement: \`F-865\`
- Source document: \`UX_Design_of_Sourcera.md\`
- Source section: ### Button Component
- Canonical source binding: sha256:${"b".repeat(64)}
- Canonical source checksum: sha256:${"c".repeat(64)}
`),
    {
      sourceId: "F-865",
      sourceDocument: "UX_Design_of_Sourcera.md",
      sourceDocuments: ["UX_Design_of_Sourcera.md"],
      section: "### Button Component",
      sectionBundleCount: null,
      sourceBinding: "b".repeat(64),
      sourceChecksum: "c".repeat(64),
    },
  );
});

test("parses source provenance without expanding a large issue body", () => {
  const description = `${"Implementation detail.\n".repeat(100_000)}
## Source provenance
- Canonical requirement: \`F-139\`
- Source documents: \`Sourcera_Master_Spec.md\`, \`UX_Design_of_Sourcera.md\`
- Source section bundle: 30 registered slices
- Canonical source binding: sha256:${"b".repeat(64)}
- Canonical source checksum: sha256:${"c".repeat(64)}

## Later section

${"Trailing detail.\n".repeat(100_000)}`;
  const result = linearSourceProvenance(description);
  assert.equal(result.sourceId, "F-139");
  assert.equal(result.sectionBundleCount, 30);
  assert.equal(result.sourceBinding, "b".repeat(64));
  assert.equal(result.sourceChecksum, "c".repeat(64));
});

test("fails closed on an unbounded source provenance section", () => {
  const result = linearSourceProvenance(`
## Source provenance
- Canonical requirement: \`F-139\`
${"Unbounded detail.\n".repeat(10_000)}`);
  assert.equal(result.sourceId, null);
  assert.equal(result.sourceChecksum, null);
});

test("captures full issue descriptions beside the canonical fingerprint", async () => {
  const fetcher: typeof fetch = async (_input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    if (query.includes("DeliveryIssues")) {
      return response({
        data: {
          issues: completeConnection([
            {
              id: "uuid-1",
              identifier: "PLA-1",
              title: "[F-005] Foundation",
              description: "## Source\n* Requirement map: F-005",
              updatedAt: "2026-07-15T00:00:00.000Z",
              estimate: 3,
              priority: 1,
              archivedAt: null,
              state: { name: "Backlog", type: "backlog" },
              labels: completeConnection([{ name: "codex-ready" }]),
              assignee: null,
              team: { id: "team-pla", key: "PLA" },
              project: null,
              projectMilestone: null,
              parent: null,
              releases: completeConnection([]),
              relations: completeConnection([]),
              inverseRelations: completeConnection([]),
            },
          ]),
        },
      });
    }
    if (query.includes("DeliveryPipelines")) {
      return response({ data: { releasePipelines: completeConnection([]) } });
    }
    if (query.includes("DeliveryCycles")) {
      return response({ data: { cycles: completeConnection([]) } });
    }
    return response({ data: { releases: completeConnection([]) } });
  };

  const capture = await fetchLinearCapture(
    withEmptyProjectInventories(fetcher),
    "secret",
  );

  assert.deepEqual(
    capture.fingerprint.issues.map((issue) => issue.identifier),
    ["PLA-1"],
  );
  assert.deepEqual(capture.issueDescriptions, [
    {
      id: "PLA-1",
      title: "[F-005] Foundation",
      description: "## Source\n* Requirement map: F-005",
      updatedAt: "2026-07-15T00:00:00.000Z",
      labels: ["codex-ready"],
    },
  ]);
});

test("paginates Linear issues and sorts a stable fingerprint", async () => {
  const cursors: Array<string | null> = [];
  const requested: string[] = [];
  const fetcher: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as {
      query: string;
      variables: { after: string | null };
    };
    requested.push(body.query);
    if (body.query.includes("DeliveryIssues")) {
      cursors.push(body.variables.after);
      if (!body.variables.after) {
        return response({
          data: {
            issues: {
              nodes: [
                {
                  id: "uuid-2",
                  identifier: "PLA-2",
                  title: "Second",
                  description: "B",
                  updatedAt: "2026-07-14T02:00:00.000Z",
                  estimate: 2,
                  priority: 3,
                  archivedAt: null,
                  state: { name: "In Progress", type: "started" },
                  labels: completeConnection([{ name: "platform" }]),
                  assignee: null,
                  team: { id: "team-pla", key: "PLA" },
                  project: { name: "Project" },
                  projectMilestone: null,
                  parent: null,
                  releases: completeConnection([]),
                  relations: completeConnection([]),
                  inverseRelations: completeConnection([]),
                },
              ],
              pageInfo: { hasNextPage: true, endCursor: "next" },
            },
          },
        });
      }
      return response({
        data: {
          issues: {
            nodes: [
              {
                id: "uuid-1",
                identifier: "PLA-1",
                title: "First",
                description: "A",
                updatedAt: "2026-07-14T01:00:00.000Z",
                estimate: 1,
                priority: 2,
                archivedAt: null,
                state: { name: "Done", type: "completed" },
                labels: completeConnection([]),
                assignee: { id: "person-blake", name: "Blake Rowley" },
                team: { id: "team-pla", key: "PLA" },
                project: { name: "Project" },
                projectMilestone: { name: "Milestone" },
                parent: { identifier: "PLA-0" },
                releases: completeConnection([
                  { id: "release-0", version: "R0" },
                ]),
                relations: {
                  nodes: [
                    {
                      id: "relation-blocks",
                      type: "blocks",
                      issue: { identifier: "PLA-1" },
                      relatedIssue: { identifier: "PLA-2" },
                    },
                    {
                      id: "relation-related",
                      type: "related",
                      issue: { identifier: "PLA-1" },
                      relatedIssue: { identifier: "PLA-3" },
                    },
                  ],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
                inverseRelations: completeConnection([
                  {
                    id: "relation-related",
                    type: "related",
                    issue: { identifier: "PLA-3" },
                    relatedIssue: { identifier: "PLA-1" },
                  },
                ]),
              },
              {
                id: "uuid-3",
                identifier: "PLA-3",
                title: "Third",
                description: "C",
                updatedAt: "2026-07-14T03:00:00.000Z",
                estimate: 3,
                priority: 1,
                archivedAt: "2026-07-15T00:00:00.000Z",
                state: { name: "Backlog", type: "backlog" },
                labels: completeConnection([
                  { name: "buyer" },
                  { name: "feature" },
                ]),
                assignee: { id: "person-reviewer", name: "Reviewer" },
                team: { id: "team-pla", key: "PLA" },
                project: { name: "Project" },
                projectMilestone: { name: "Milestone" },
                parent: { identifier: "PLA-0" },
                releases: completeConnection([
                  { id: "release-1", version: "R1" },
                ]),
                relations: completeConnection([]),
                inverseRelations: completeConnection([]),
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      });
    }
    if (body.query.includes("DeliveryPipelines")) {
      return response({
        data: {
          releasePipelines: {
            nodes: [
              {
                id: "pipeline-1",
                name: "Sourcera Product Delivery",
                updatedAt: "2026-07-14T01:00:00.000Z",
                archivedAt: null,
                type: "scheduled",
                isProduction: true,
                teams: completeConnection([{ id: "team-pla", key: "PLA" }]),
                stages: completeConnection([
                  {
                    id: "stage-1",
                    name: "Planned",
                    type: "planned",
                    archivedAt: null,
                    position: 0,
                    frozen: false,
                  },
                ]),
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      });
    }
    return response({
      data: {
        releases: {
          nodes: [
            {
              id: "release-0",
              name: "First Defensible Evaluation",
              description: "Release contract",
              version: "R0",
              commitSha: "0123456789abcdef0123456789abcdef01234567",
              startDate: "2026-07-01",
              targetDate: "2026-07-31",
              updatedAt: "2026-07-14T01:00:00.000Z",
              archivedAt: null,
              pipeline: { id: "pipeline-1" },
              stage: { id: "stage-1", type: "planned" },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
  };

  const fingerprint = await fetchLinearFingerprint(
    withEmptyProjectInventories(fetcher),
    "secret",
  );
  assert.deepEqual(cursors, [null, "next"]);
  assert.deepEqual(
    fingerprint.issues.map((issue) => issue.identifier),
    ["PLA-1", "PLA-2", "PLA-3"],
  );
  assert.deepEqual(fingerprint.issues[0].relations, [
    "blocks:PLA-1:PLA-2",
    "related:PLA-1:PLA-3",
  ]);
  assert.deepEqual(fingerprint.issues[1].relations, ["blocks:PLA-1:PLA-2"]);
  assert.deepEqual(fingerprint.issues[2].relations, [
    "related:PLA-1:PLA-3",
  ]);
  assert.equal(fingerprint.issues[0].descriptionFingerprint.length, 64);
  assert.deepEqual(
    {
      priority: fingerprint.issues[0].priority,
      linearId: fingerprint.issues[0].linearId,
      archivedAt: fingerprint.issues[0].archivedAt,
      assigneeId: fingerprint.issues[0].assigneeId,
      teamId: fingerprint.issues[0].teamId,
    },
    {
      priority: 2,
      linearId: "uuid-1",
      archivedAt: null,
      assigneeId: "person-blake",
      teamId: "team-pla",
    },
  );
  const issueQuery = requested.find((query) => query.includes("DeliveryIssues"))!;
  for (const field of ["priority", "archivedAt", "assignee { id name }", "team { id key }"]) {
    assert.match(issueQuery, new RegExp(field.replace(/[{}]/g, "\\$&")));
  }
  assert.deepEqual(fingerprint.releasePipelines[0], {
    id: "pipeline-1",
    name: "Sourcera Product Delivery",
    updatedAt: "2026-07-14T01:00:00.000Z",
    archivedAt: null,
    type: "scheduled",
    isProduction: true,
    teams: [{ id: "team-pla", key: "PLA" }],
    stages: [{
      id: "stage-1",
      name: "Planned",
      type: "planned",
      archivedAt: null,
      position: 0,
      frozen: false,
    }],
  });
  assert.equal(fingerprint.releases[0].archivedAt, null);
  assert.deepEqual(
    {
      descriptionFingerprint: fingerprint.releases[0].descriptionFingerprint,
      commitSha: fingerprint.releases[0].commitSha,
      startDate: fingerprint.releases[0].startDate,
      targetDate: fingerprint.releases[0].targetDate,
    },
    {
      descriptionFingerprint: createHash("sha256")
        .update("Release contract")
        .digest("hex"),
      commitSha: "0123456789abcdef0123456789abcdef01234567",
      startDate: "2026-07-01",
      targetDate: "2026-07-31",
    },
  );
  for (const queryName of [
    "DeliveryPipelines",
    "DeliveryReleases",
  ]) {
    const query = requested.find((candidate) => candidate.includes(queryName))!;
    assert.match(query, /archivedAt/);
  }
  const releaseQuery = requested.find((query) =>
    query.includes("DeliveryReleases")
  )!;
  for (const field of ["description", "commitSha", "startDate", "targetDate"]) {
    assert.match(releaseQuery, new RegExp(`\\b${field}\\b`));
  }
  assert.match(issueQuery, /issues\(first: 10/);
  assert.match(
    requested.find((query) => query.includes("DeliveryPipelines"))!,
    /releasePipelines\(first: 10/,
  );
  assert.match(
    requested.find((query) => query.includes("DeliveryReleases"))!,
    /releases\(first: 50/,
  );
  assert.deepEqual(fingerprintDiff(fingerprint, fingerprint), []);
  assert.match(
    fingerprintDiff(fingerprint, { ...fingerprint, releases: [] })[0],
    /releases/,
  );
});

test("paginates and fingerprints complete Linear project and milestone inventories", async () => {
  const projectCursors: Array<string | null> = [];
  const milestoneCursors: Array<string | null> = [];
  const fetcher: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as {
      query: string;
      variables: { after: string | null };
    };
    const empty = { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
    if (body.query.includes("DeliveryProjects")) {
      assert.match(body.query, /projects\(first: 5/);
      assert.match(body.query, /\barchivedAt\b/);
      assert.match(body.query, /\bcontent\b/);
      for (const field of ["status { id name type }", "priority", "lead { id name }", "startDate", "targetDate"]) {
        assert.match(body.query, new RegExp(field.replace(/[{}]/g, "\\$&")));
      }
      projectCursors.push(body.variables.after);
      return response({
        data: {
          projects: body.variables.after
            ? completeConnection([
                { id: "project-1", name: "First", content: "First project", updatedAt: "2026-07-15T01:00:00Z", archivedAt: null, status: { id: "status-1", name: "Planned", type: "planned" }, priority: 2, lead: null, startDate: "2026-07-01", startDateResolution: null, targetDate: "2026-08-01", targetDateResolution: null, initiatives: completeConnection([]) },
              ])
            : {
                nodes: [
                  { id: "project-2", name: "Second", content: "Second project", updatedAt: "2026-07-15T02:00:00Z", archivedAt: null, status: { id: "status-2", name: "In Progress", type: "started" }, priority: 1, lead: { id: "user-1", name: "Blake" }, startDate: "2026-07-02", startDateResolution: null, targetDate: "2026-08-02", targetDateResolution: null, initiatives: completeConnection([]) },
                ],
                pageInfo: { hasNextPage: true, endCursor: "projects-next" },
              },
        },
      });
    }
    if (body.query.includes("DeliveryProjectMilestones")) {
      assert.match(body.query, /projectMilestones\(first: 50/);
      assert.match(body.query, /\btargetDate\b/);
      assert.match(body.query, /\bstatus\b/);
      assert.match(body.query, /\bupdatedAt\b/);
      assert.match(body.query, /\barchivedAt\b/);
      assert.match(body.query, /\bdescription\b/);
      milestoneCursors.push(body.variables.after);
      return response({
        data: {
          projectMilestones: body.variables.after
            ? completeConnection([
                {
                  id: "milestone-1",
                  name: "Production evidence closed",
                  description: "First evidence",
                  updatedAt: "2026-07-15T03:00:00.000Z",
                  archivedAt: null,
                  targetDate: "2026-08-10",
                  status: "next",
                  project: { id: "project-1", name: "First" },
                },
              ])
            : {
                nodes: [
                  {
                    id: "milestone-2",
                    name: "Production evidence closed",
                    description: "Second evidence",
                    updatedAt: "2026-07-15T04:00:00.000Z",
                    archivedAt: null,
                    targetDate: null,
                    status: "unstarted",
                    project: { id: "project-2", name: "Second" },
                  },
                ],
                pageInfo: { hasNextPage: true, endCursor: "milestones-next" },
              },
        },
      });
    }
    if (body.query.includes("DeliveryIssues")) return response({ data: { issues: empty } });
    if (body.query.includes("DeliveryPipelines")) return response({ data: { releasePipelines: empty } });
    if (body.query.includes("DeliveryCycles")) return response({ data: { cycles: empty } });
    return response({ data: { releases: empty } });
  };

  const fingerprint = await fetchLinearFingerprint(fetcher, "secret");
  assert.deepEqual(projectCursors, [null, "projects-next"]);
  assert.deepEqual(milestoneCursors, [null, "milestones-next"]);
  assert.deepEqual(fingerprint.projects.map((project) => project.id), [
    "project-1",
    "project-2",
  ]);
  assert.deepEqual(
    fingerprint.projects.map((project) => project.descriptionFingerprint),
    [
      createHash("sha256").update("First project").digest("hex"),
      createHash("sha256").update("Second project").digest("hex"),
    ],
  );
  assert.deepEqual(fingerprint.projectMilestones, [
    {
      id: "milestone-1",
      name: "Production evidence closed",
      descriptionFingerprint: createHash("sha256")
        .update("First evidence")
        .digest("hex"),
      projectId: "project-1",
      project: "First",
      updatedAt: "2026-07-15T03:00:00.000Z",
      archivedAt: null,
      targetDate: "2026-08-10",
      status: "next",
    },
    {
      id: "milestone-2",
      name: "Production evidence closed",
      descriptionFingerprint: createHash("sha256")
        .update("Second evidence")
        .digest("hex"),
      projectId: "project-2",
      project: "Second",
      updatedAt: "2026-07-15T04:00:00.000Z",
      archivedAt: null,
      targetDate: null,
      status: "unstarted",
    },
  ]);
  assert.match(
    fingerprintDiff(fingerprint, { ...fingerprint, projectMilestones: [] })[0],
    /projectMilestones/,
  );
});

test("bounds project query fanout and paginates native initiative assignments", async () => {
  const initiativeCursors: Array<string | null> = [];
  const empty = completeConnection([]);
  const fetcher: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as {
      query: string;
      variables: { after: string | null; id?: string };
    };
    if (body.query.includes("DeliveryProjects")) {
      if (
        !/projects\(first: 5/.test(body.query) ||
        !/initiatives\(first: 10/.test(body.query)
      ) {
        return response({ errors: [{ message: "Query too complex" }] }, 400);
      }
      assert.match(body.query, /pageInfo \{ hasNextPage endCursor \}/);
      return response({
        data: {
          projects: completeConnection([{
            id: "project-1",
            name: "Bounded project",
            content: "Project body",
            updatedAt: "2026-07-29T00:00:00.000Z",
            archivedAt: null,
            status: { id: "status-1", name: "Planned", type: "planned" },
            priority: 2,
            lead: null,
            startDate: null,
            startDateResolution: null,
            targetDate: null,
            targetDateResolution: null,
            initiatives: {
              nodes: [{ id: "initiative-1", name: "First" }],
              pageInfo: { hasNextPage: true, endCursor: "initiative-next" },
            },
          }]),
        },
      });
    }
    if (body.query.includes("DeliveryProjectInitiativeAssignments")) {
      initiativeCursors.push(body.variables.after);
      assert.equal(body.variables.id, "project-1");
      return response({
        data: {
          project: {
            initiatives: completeConnection([{
              id: "initiative-2",
              name: "Second",
            }]),
          },
        },
      });
    }
    if (body.query.includes("DeliveryIssues")) {
      return response({ data: { issues: empty } });
    }
    if (body.query.includes("DeliveryPipelines")) {
      return response({ data: { releasePipelines: empty } });
    }
    if (body.query.includes("DeliveryProjectMilestones")) {
      return response({ data: { projectMilestones: empty } });
    }
    if (body.query.includes("DeliveryCycles")) {
      return response({ data: { cycles: empty } });
    }
    return response({ data: { releases: empty } });
  };

  await fetchLinearFingerprint(fetcher, "secret");
  assert.deepEqual(initiativeCursors, ["initiative-next"]);
});

test("paginates native cycles and binds issue due dates to stable cycle IDs", async () => {
  const cycleCursors: Array<string | null> = [];
  const cycleOne = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const cycleTwo = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const teamId = "11111111-1111-4111-8111-111111111111";
  const empty = completeConnection([]);
  const fetcher: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as {
      query: string;
      variables: { after: string | null };
    };
    if (body.query.includes("DeliveryIssues")) {
      for (const field of [
        "dueDate",
        "state { id name type }",
        "cycle { id number name }",
        "parent { id identifier }",
      ]) {
        assert.match(body.query, new RegExp(field.replace(/[{}]/g, "\\$&")));
      }
      return response({
        data: {
          issues: completeConnection([{
            id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            identifier: "PLA-1",
            title: "Cycle-bound issue",
            description: "Description",
            updatedAt: "2026-07-23T00:00:00.000Z",
            estimate: 3,
            priority: 2,
            dueDate: "2026-08-01",
            archivedAt: null,
            state: {
              id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
              name: "In Progress",
              type: "started",
            },
            labels: empty,
            assignee: null,
            team: { id: teamId, key: "PLA" },
            cycle: { id: cycleOne, number: 1, name: "Foundation" },
            project: null,
            projectMilestone: null,
            parent: null,
            releases: empty,
            relations: empty,
            inverseRelations: empty,
          }]),
        },
      });
    }
    if (body.query.includes("DeliveryCycles")) {
      assert.match(body.query, /cycles\(first: 50, after: \$after, includeArchived: true\)/);
      cycleCursors.push(body.variables.after);
      const base = {
        description: null,
        archivedAt: null,
        completedAt: null,
        team: { id: teamId, key: "PLA" },
      };
      return response({
        data: {
          cycles: body.variables.after
            ? completeConnection([{
                ...base,
                id: cycleOne,
                number: 1,
                name: "Foundation",
                description: "First cycle",
                updatedAt: "2026-07-23T00:00:00.000Z",
                startsAt: "2026-07-20T00:00:00.000Z",
                endsAt: "2026-08-03T00:00:00.000Z",
                inheritedFrom: null,
              }])
            : {
                nodes: [{
                  ...base,
                  id: cycleTwo,
                  number: 2,
                  name: null,
                  updatedAt: "2026-07-23T00:00:00.000Z",
                  startsAt: "2026-08-03T00:00:00.000Z",
                  endsAt: "2026-08-17T00:00:00.000Z",
                  inheritedFrom: { id: cycleOne },
                }],
                pageInfo: { hasNextPage: true, endCursor: "cycles-next" },
              },
        },
      });
    }
    if (body.query.includes("DeliveryPipelines")) {
      return response({ data: { releasePipelines: empty } });
    }
    if (body.query.includes("DeliveryProjects")) {
      return response({ data: { projects: empty } });
    }
    if (body.query.includes("DeliveryProjectMilestones")) {
      return response({ data: { projectMilestones: empty } });
    }
    return response({ data: { releases: empty } });
  };

  const fingerprint = await fetchLinearFingerprint(fetcher, "secret");
  assert.deepEqual(cycleCursors, [null, "cycles-next"]);
  assert.deepEqual(
    {
      dueDate: fingerprint.issues[0].dueDate,
      stateId: fingerprint.issues[0].stateId,
      cycleId: fingerprint.issues[0].cycleId,
      cycleNumber: fingerprint.issues[0].cycleNumber,
      cycle: fingerprint.issues[0].cycle,
    },
    {
      dueDate: "2026-08-01",
      stateId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      cycleId: cycleOne,
      cycleNumber: 1,
      cycle: "Foundation",
    },
  );
  assert.deepEqual(fingerprint.cycles.map((cycle) => cycle.id), [
    cycleOne,
    cycleTwo,
  ]);
  assert.equal(fingerprint.cycles[1].inheritedFromId, cycleOne);
  const changed = structuredClone(fingerprint);
  changed.cycles[0].endsAt = "2026-08-04T00:00:00.000Z";
  assert.deepEqual(fingerprintDiff(fingerprint, changed), [
    "cycles differ from the committed Linear snapshot",
  ]);
});

test("fingerprints the complete canonical planning document contract", async () => {
  const projectId = "22222222-2222-4222-8222-222222222222";
  const documentId = "3fd8304b-547e-48e2-bc76-5a9ebecaa389";
  const teamId = "477029a4-9e0a-44ca-9816-5a169b6baafa";
  const outcomes = Array.from({ length: 6 }, (_, index) => ({
    id: `00000000-0000-4000-8000-00000000000${index}`,
    name: `Outcome ${index}`,
  }));
  const projectIds = outcomes.map((_, index) =>
    index === 0
      ? projectId
      : `33333333-3333-4333-8333-33333333333${index}`
  );
  const content = `# Planning authority

## Binding authority
Authority.

## Canonical source fingerprints
* Sourcera_Master_Spec.md: sha256:${"a".repeat(64)}
* UX_Design_of_Sourcera.md: sha256:${"b".repeat(64)}

## Program completion
Completion.
`;
  const programScope: LinearProgramScope = {
    schemaVersion: 2,
    outcomeInitiatives: outcomes,
    planningDocument: {
      id: documentId,
      title: "Planning authority",
      contentFingerprint: createHash("sha256").update(content).digest("hex"),
      initiativeId: null,
      projectId: null,
      teamId,
      issueId: null,
      requiredSections: [
        "Binding authority",
        "Canonical source fingerprints",
        "Program completion",
      ],
    },
    projectDescriptionFingerprints: projectIds.map((currentProjectId) => ({
      projectId: currentProjectId,
      descriptionFingerprint: createHash("sha256")
        .update("Project body")
        .digest("hex"),
      milestones: [],
    })),
    projectInitiatives: projectIds.map((currentProjectId, index) => ({
      projectId: currentProjectId,
      initiativeIds: [outcomes[index].id],
    })),
  };
  const empty = completeConnection([]);
  let extraInitiative: Record<string, unknown> | null = null;
  const fetcher: typeof fetch = async (_input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    if (query.includes("DeliveryProjects")) {
      return response({
        data: {
          projects: completeConnection(projectIds.map((currentProjectId, index) => ({
            id: currentProjectId,
            name: `Project ${index + 1}`,
            content: "Project body",
            updatedAt: "2026-07-23T00:00:00.000Z",
            archivedAt: null,
            status: { id: "status-1", name: "Planned", type: "planned" },
            priority: 2,
            lead: null,
            startDate: null,
            startDateResolution: null,
            targetDate: null,
            targetDateResolution: null,
            initiatives: completeConnection([outcomes[index]]),
          }))),
        },
      });
    }
    if (query.includes("DeliveryProjectMilestones")) {
      return response({ data: { projectMilestones: empty } });
    }
    if (query.includes("DeliveryInitiatives")) {
      return response({
        data: {
          initiatives: completeConnection([
            ...outcomes,
            ...(extraInitiative ? [extraInitiative] : []),
          ].map((initiative) => ({
            ...initiative,
            updatedAt: "2026-07-23T00:00:00.000Z",
            archivedAt: "archivedAt" in initiative
              ? initiative.archivedAt
              : null,
            owner: null,
            status: "Planned",
            priority: 2,
            health: null,
            healthUpdatedAt: null,
            targetDate: null,
            targetDateResolution: null,
            parentInitiative: null,
          }))),
        },
      });
    }
    if (query.includes("DeliveryDocuments")) {
      for (const field of [
        "content",
        "initiative { id name }",
        "project { id name }",
        "team { id key }",
        "issue { id identifier }",
        "release { id name version }",
        "cycle { id number name }",
      ]) {
        assert.match(query, new RegExp(field.replace(/[{}]/g, "\\$&")));
      }
      return response({
        data: {
          documents: completeConnection([{
            id: documentId,
            title: "Planning authority",
            content,
            updatedAt: "2026-07-23T00:00:00.000Z",
            archivedAt: null,
            initiative: null,
            project: null,
            team: { id: teamId, key: "PLA" },
            issue: null,
            release: null,
            cycle: null,
          }]),
        },
      });
    }
    if (query.includes("DeliveryIssues")) {
      return response({ data: { issues: empty } });
    }
    if (query.includes("DeliveryPipelines")) {
      return response({ data: { releasePipelines: empty } });
    }
    if (query.includes("DeliveryCycles")) {
      return response({ data: { cycles: empty } });
    }
    return response({ data: { releases: empty } });
  };

  const fingerprint = await fetchLinearFingerprint(
    fetcher,
    "secret",
    {
      schemaVersion: 1,
      projects: projectIds.map((id, index) => ({
        id,
        name: `Project ${index + 1}`,
      })),
    },
    programScope,
  );

  assert.deepEqual(fingerprint.program?.documents, [{
    id: documentId,
    title: "Planning authority",
    updatedAt: "2026-07-23T00:00:00.000Z",
    archivedAt: null,
    initiativeId: null,
    projectId: null,
    teamId,
    issueId: null,
    contentFingerprint: createHash("sha256").update(content).digest("hex"),
    sectionHeadings: [
      "Binding authority",
      "Canonical source fingerprints",
      "Program completion",
    ],
    sourceFingerprints: {
      masterSpecSha256: "a".repeat(64),
      uxDesignSha256: "b".repeat(64),
    },
  }]);
  assert.equal(fingerprint.program?.initiatives.length, 6);
  assert.deepEqual(
    fingerprint.program?.initiatives.find((initiative) =>
      initiative.id === outcomes[0].id
    ),
    {
      id: outcomes[0].id,
      name: outcomes[0].name,
      updatedAt: "2026-07-23T00:00:00.000Z",
      archivedAt: null,
      owner: null,
      ownerId: null,
      status: "Planned",
      priority: 2,
      health: null,
      healthUpdatedAt: null,
      targetDate: null,
      targetDateResolution: null,
      parentInitiativeId: null,
      parentInitiative: null,
    },
  );
  extraInitiative = {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Completed duplicate wrapper",
    archivedAt: null,
  };
  await assert.rejects(
    fetchLinearFingerprint(
      fetcher,
      "secret",
      {
        schemaVersion: 1,
        projects: projectIds.map((id, index) => ({
          id,
          name: `Project ${index + 1}`,
        })),
      },
      programScope,
    ),
    /inventory differs/,
  );
  extraInitiative = {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Archived historical initiative",
    archivedAt: "2026-07-23T00:00:00.000Z",
  };
  await assert.doesNotReject(
    fetchLinearFingerprint(
      fetcher,
      "secret",
      {
        schemaVersion: 1,
        projects: projectIds.map((id, index) => ({
          id,
          name: `Project ${index + 1}`,
        })),
      },
      programScope,
    ),
  );
});

test("records the reversible connector milestone fingerprint boundary", () => {
  const decisions = readFileSync("delivery/decisions.jsonl", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const decision = decisions.find(
    (candidate) =>
      candidate.id === "DEC-LINEAR-MILESTONE-FINGERPRINT-001",
  );

  assert.equal(decision?.status, "active");
  assert.match(
    decision?.decision ?? "",
    /id, name, full description fingerprint, project ID, and project name/,
  );
  assert.match(decision?.assumption ?? "", /description.*updatedAt.*targetDate/i);
  assert.match(decision?.validationTrigger ?? "", /LINEAR_API_KEY/);
});

test("fingerprint comparison detects native milestone schedule drift", () => {
  const fingerprint = {
    issues: [],
    releasePipelines: [],
    releases: [],
    projects: [],
    projectMilestones: [
      {
        id: "milestone-1",
        name: "Production evidence closed",
        descriptionFingerprint: "a".repeat(64),
        projectId: "project-1",
        project: "First",
        updatedAt: "2026-07-15T03:00:00.000Z",
        archivedAt: null,
        targetDate: null,
        status: "unstarted",
      },
    ],
    cycles: [],
  };
  const legacy = {
    ...fingerprint,
    projectMilestones: fingerprint.projectMilestones.map((milestone) => ({
      ...milestone,
      updatedAt: "2026-07-15T03:00:00.000Z",
      targetDate: "2026-08-01",
    })),
  };

  assert.deepEqual(fingerprintDiff(fingerprint, legacy), [
    "projectMilestones differ from the committed Linear snapshot",
  ]);
});

test("scopes project inventories by canonical IDs while preserving every issue", async () => {
  let projectRows = [
    {
      id: "project-tracked",
      name: "Sourcera Production",
      updatedAt: "2026-07-15T01:00:00Z",
      status: { id: "status-tracked", name: "Planned", type: "planned" },
      priority: 2,
      lead: null,
      startDate: null,
      startDateResolution: null,
      targetDate: null,
      targetDateResolution: null,
      initiatives: completeConnection([]),
    },
    {
      id: "project-legacy",
      name: "P01 legacy",
      updatedAt: "2026-07-15T01:00:00Z",
      status: { id: "status-legacy", name: "Canceled", type: "canceled" },
      priority: 0,
      lead: null,
      startDate: null,
      startDateResolution: null,
      targetDate: null,
      targetDateResolution: null,
      initiatives: completeConnection([]),
    },
  ];
  const issue = (
    identifier: string,
    project: { id: string; name: string },
    milestone: { id: string; name: string },
  ) => ({
    id: `uuid-${identifier}`,
    identifier,
    title: identifier,
    description: identifier,
    updatedAt: "2026-07-15T01:00:00Z",
    estimate: null,
    state: { name: "Backlog", type: "backlog" },
    labels: completeConnection([]),
    assignee: null,
    team: { key: "PLA" },
    project,
    projectMilestone: milestone,
    parent: null,
    releases: completeConnection([]),
    relations: completeConnection([]),
    inverseRelations: completeConnection([]),
  });
  const fetcher: typeof fetch = async (_input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    if (query.includes("DeliveryProjects")) {
      return response({ data: { projects: completeConnection(projectRows) } });
    }
    if (query.includes("DeliveryProjectMilestones")) {
      return response({
        data: {
          projectMilestones: completeConnection([
            {
              id: "milestone-tracked",
              name: "Production evidence closed",
              project: {
                id: "project-tracked",
                name: "Sourcera Production",
              },
            },
            {
              id: "milestone-legacy",
              name: "Legacy milestone",
              project: { id: "project-legacy", name: "P01 legacy" },
            },
          ]),
        },
      });
    }
    if (query.includes("DeliveryIssues")) {
      return response({
        data: {
          issues: completeConnection([
            issue(
              "PLA-1",
              { id: "project-tracked", name: "Sourcera Production" },
              { id: "milestone-tracked", name: "Production evidence closed" },
            ),
            issue(
              "PLA-2",
              { id: "project-legacy", name: "P01 legacy" },
              { id: "milestone-legacy", name: "Legacy milestone" },
            ),
          ]),
        },
      });
    }
    if (query.includes("DeliveryPipelines")) {
      return response({ data: { releasePipelines: completeConnection([]) } });
    }
    if (query.includes("DeliveryCycles")) {
      return response({ data: { cycles: completeConnection([]) } });
    }
    return response({ data: { releases: completeConnection([]) } });
  };

  const fingerprint = await fetchLinearFingerprint(fetcher, "secret", {
    schemaVersion: 1,
    projects: [{ id: "project-tracked", name: "Sourcera Production" }],
  });
  assert.deepEqual(
    fingerprint.issues.map((candidate) => candidate.identifier),
    ["PLA-1", "PLA-2"],
  );
  assert.deepEqual(
    fingerprint.projects.map((project) => project.id),
    ["project-tracked"],
  );
  assert.deepEqual(
    fingerprint.projectMilestones.map((milestone) => milestone.id),
    ["milestone-tracked"],
  );
  await assert.rejects(
    () =>
      fetchLinearFingerprint(fetcher, "secret", {
        schemaVersion: 1,
        projects: [{ id: "project-missing", name: "Missing" }],
      }),
    /Tracked Linear project project-missing is missing/,
  );
  projectRows[0] = { ...projectRows[0], name: "Renamed" };
  await assert.rejects(
    () =>
      fetchLinearFingerprint(fetcher, "secret", {
        schemaVersion: 1,
        projects: [
          { id: "project-tracked", name: "Sourcera Production" },
        ],
      }),
    /name differs from canonical scope/,
  );
  projectRows[0] = { ...projectRows[0], name: "Sourcera Production" };
  projectRows = [projectRows[0], projectRows[0], projectRows[1]];
  await assert.rejects(
    () =>
      fetchLinearFingerprint(fetcher, "secret", {
        schemaVersion: 1,
        projects: [
          { id: "project-tracked", name: "Sourcera Production" },
        ],
      }),
    /Tracked Linear project project-tracked is duplicated/,
  );
});

test("rejects truncated project milestone pagination", async () => {
  const fetcher: typeof fetch = async (_input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    const empty = completeConnection([]);
    if (query.includes("DeliveryProjectMilestones")) {
      return response({
        data: {
          projectMilestones: {
            nodes: [],
            pageInfo: { hasNextPage: true, endCursor: null },
          },
        },
      });
    }
    if (query.includes("DeliveryProjects")) return response({ data: { projects: empty } });
    if (query.includes("DeliveryIssues")) return response({ data: { issues: empty } });
    if (query.includes("DeliveryPipelines")) return response({ data: { releasePipelines: empty } });
    if (query.includes("DeliveryCycles")) return response({ data: { cycles: empty } });
    return response({ data: { releases: empty } });
  };
  await assert.rejects(
    () => fetchLinearFingerprint(fetcher, "secret"),
    /projectMilestones pagination cursor missing/,
  );
});

test("rejects a repeated Linear pagination cursor", async () => {
  const fetcher: typeof fetch = async (_input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    const empty = completeConnection([]);
    if (query.includes("DeliveryProjectMilestones")) {
      return response({
        data: {
          projectMilestones: {
            nodes: [],
            pageInfo: { hasNextPage: true, endCursor: "repeated" },
          },
        },
      });
    }
    if (query.includes("DeliveryProjects")) return response({ data: { projects: empty } });
    if (query.includes("DeliveryIssues")) return response({ data: { issues: empty } });
    if (query.includes("DeliveryPipelines")) return response({ data: { releasePipelines: empty } });
    if (query.includes("DeliveryCycles")) return response({ data: { cycles: empty } });
    return response({ data: { releases: empty } });
  };
  await assert.rejects(
    () => fetchLinearFingerprint(fetcher, "secret"),
    /projectMilestones pagination cursor repeated/,
  );
});

test("description changes after character 400 change the fingerprint", async () => {
  const fingerprintFor = async (description: string) => {
    const fetcher: typeof fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as { query: string };
      if (body.query.includes("DeliveryIssues")) {
        return response({
          data: {
            issues: {
              nodes: [
                {
                  id: "uuid-1",
                  identifier: "PLA-1",
                  title: "First",
                  description,
                  updatedAt: "2026-07-14T01:00:00.000Z",
                  estimate: 1,
                  state: { name: "Backlog", type: "backlog" },
                  labels: completeConnection([]),
                  assignee: null,
                  team: { key: "PLA" },
                  project: null,
                  projectMilestone: null,
                  parent: null,
                  releases: completeConnection([]),
                  relations: completeConnection([]),
                  inverseRelations: completeConnection([]),
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      }
      if (body.query.includes("DeliveryPipelines")) {
        return response({
          data: {
            releasePipelines: {
              nodes: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      }
      return response({
        data: {
          releases: {
            nodes: [],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      });
    };
    return (await fetchLinearFingerprint(
      withEmptyProjectInventories(fetcher),
      "secret",
    )).issues[0]
      .descriptionFingerprint;
  };

  assert.notEqual(
    await fingerprintFor(`${"a".repeat(400)}x`),
    await fingerprintFor(`${"a".repeat(400)}y`),
  );
  assert.notEqual(
    await fingerprintFor("😀"),
    await fingerprintFor("😁"),
  );
});

test("paginates both nested issue relation directions", async () => {
  const relation = (type: string) => ({ id: `relation-${type}`, type, issue: { identifier: "PLA-1" }, relatedIssue: { identifier: "PLA-1" } });
  const fetcher: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { query: string; variables: { after?: string } };
    if (body.query.includes("DeliveryIssueInverseRelations")) {
      assert.equal(body.variables.after, "inverse-next");
      return response({ data: { issue: { inverseRelations: completeConnection([relation("duplicate")]) } } });
    }
    if (body.query.includes("DeliveryIssueRelations")) {
      assert.equal(body.variables.after, "forward-next");
      return response({ data: { issue: { relations: completeConnection([relation("blocks")]) } } });
    }
    if (body.query.includes("DeliveryIssues")) {
      return response({ data: { issues: completeConnection([{
        id: "uuid-1", identifier: "PLA-1", title: "First", description: "Description", updatedAt: "2026-07-14T01:00:00.000Z",
        estimate: 1, priority: 2, dueDate: null, archivedAt: null, state: { id: "state", name: "Backlog", type: "backlog" },
        labels: completeConnection([]), assignee: null, team: { id: "team", key: "PLA" }, cycle: null, project: null,
        projectMilestone: null, parent: null, releases: completeConnection([]),
        relations: { nodes: [relation("related")], pageInfo: { hasNextPage: true, endCursor: "forward-next" } },
        inverseRelations: { nodes: [relation("similar")], pageInfo: { hasNextPage: true, endCursor: "inverse-next" } },
      }]) } });
    }
    if (body.query.includes("DeliveryPipelines")) return response({ data: { releasePipelines: completeConnection([]) } });
    return response({ data: { releases: completeConnection([]) } });
  };
  const issue = (await fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret")).issues[0];
  assert.deepEqual(issue.relations, ["blocks:PLA-1:PLA-1", "duplicate:PLA-1:PLA-1", "related:PLA-1:PLA-1", "similar:PLA-1:PLA-1"]);
});

test("bounds pages for each nested relation connection", async () => {
  let relationPages = 0;
  const fetcher: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { query: string; variables: { after?: string } };
    if (body.query.includes("DeliveryIssueRelations")) {
      relationPages += 1;
      return response({ data: { issue: { relations: {
        nodes: [],
        pageInfo: { hasNextPage: relationPages < 21, endCursor: relationPages < 21 ? `page-${relationPages}` : null },
      } } } });
    }
    if (body.query.includes("DeliveryIssues")) {
      return response({ data: { issues: completeConnection([{
        id: "uuid-1", identifier: "PLA-1", title: "First", description: "Description", updatedAt: "2026-07-14T01:00:00.000Z",
        estimate: 1, priority: 2, dueDate: null, archivedAt: null, state: { id: "state", name: "Backlog", type: "backlog" },
        labels: completeConnection([]), assignee: null, team: { id: "team", key: "PLA" }, cycle: null, project: null,
        projectMilestone: null, parent: null, releases: completeConnection([]),
        relations: { nodes: [], pageInfo: { hasNextPage: true, endCursor: "page-0" } }, inverseRelations: completeConnection([]),
      }]) } });
    }
    if (body.query.includes("DeliveryPipelines")) return response({ data: { releasePipelines: completeConnection([]) } });
    return response({ data: { releases: completeConnection([]) } });
  };
  await assert.rejects(() => fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret"), /page limit/);
});

test("bounds total nested relation pagination requests", async () => {
  const issues = Array.from({ length: 1_001 }, (_, index) => ({
    id: `uuid-${index}`, identifier: `PLA-${index + 1}`, title: `Issue ${index + 1}`, description: "Description", updatedAt: "2026-07-14T01:00:00.000Z",
    estimate: 1, priority: 2, dueDate: null, archivedAt: null, state: { id: "state", name: "Backlog", type: "backlog" },
    labels: completeConnection([]), assignee: null, team: { id: "team", key: "PLA" }, cycle: null, project: null,
    projectMilestone: null, parent: null, releases: completeConnection([]),
    relations: { nodes: [], pageInfo: { hasNextPage: true, endCursor: "next" } }, inverseRelations: completeConnection([]),
  }));
  const fetcher: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { query: string };
    if (body.query.includes("DeliveryIssueRelations")) return response({ data: { issue: { relations: completeConnection([]) } } });
    if (body.query.includes("DeliveryIssues")) return response({ data: { issues: completeConnection(issues) } });
    if (body.query.includes("DeliveryPipelines")) return response({ data: { releasePipelines: completeConnection([]) } });
    return response({ data: { releases: completeConnection([]) } });
  };
  await assert.rejects(() => fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret"), /total request limit/);
});

test("deduplicates one relation UUID across directions and rejects distinct UUIDs for one canonical key", async () => {
  const capture = async (inverseId: string) => {
    const relation = (id: string) => ({ id, type: "related", issue: { identifier: "PLA-1" }, relatedIssue: { identifier: "PLA-1" } });
    const fetcher: typeof fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as { query: string };
      if (body.query.includes("DeliveryIssues")) {
        assert.match(body.query, /relations\(first: 100, includeArchived: true\)[\s\S]*nodes \{ id type/);
        assert.match(body.query, /inverseRelations\(first: 100, includeArchived: true\)[\s\S]*nodes \{ id type/);
        return response({ data: { issues: completeConnection([{
          id: "uuid-1", identifier: "PLA-1", title: "First", description: "Description", updatedAt: "2026-07-14T01:00:00.000Z",
          estimate: 1, priority: 2, dueDate: null, archivedAt: null, state: { id: "state", name: "Backlog", type: "backlog" },
          labels: completeConnection([]), assignee: null, team: { id: "team", key: "PLA" }, cycle: null, project: null,
          projectMilestone: null, parent: null, releases: completeConnection([]),
          relations: completeConnection([relation("relation-one")]), inverseRelations: completeConnection([relation(inverseId)]),
        }]) } });
      }
      if (body.query.includes("DeliveryPipelines")) return response({ data: { releasePipelines: completeConnection([]) } });
      return response({ data: { releases: completeConnection([]) } });
    };
    return fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret");
  };
  assert.deepEqual((await capture("relation-one")).issues[0].relations, ["related:PLA-1:PLA-1"]);
  await assert.rejects(() => capture("relation-two"), /distinct relation UUIDs map to canonical key/);
});

for (const field of [
  "labels",
  "releases",
  "relations",
  "inverseRelations",
] as const) {
  test(`rejects truncated nested issue ${field}`, async () => {
    const connection = (nodes: unknown[]) => ({
      nodes,
      pageInfo: { hasNextPage: false, endCursor: null },
    });
    const issue = {
      id: "uuid-1",
      identifier: "PLA-1",
      title: "First",
      description: "Description",
      updatedAt: "2026-07-14T01:00:00.000Z",
      estimate: 1,
      state: { name: "Backlog", type: "backlog" },
      labels: connection([]),
      assignee: null,
      team: { key: "PLA" },
      project: null,
      projectMilestone: null,
      parent: null,
      releases: connection([]),
      relations: connection([]),
      inverseRelations: connection([]),
    };
    issue[field].pageInfo.hasNextPage = true;
    const fetcher: typeof fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as { query: string };
      if (body.query.includes("DeliveryIssues")) {
        for (const nestedField of [
          "labels",
          "releases",
          "relations",
          "inverseRelations",
        ]) {
          assert.match(
            body.query,
            new RegExp(`${nestedField}\\(first: 100, includeArchived: true\\)`),
          );
        }
        return response({
          data: {
            issues: {
              nodes: [issue],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      }
      if (body.query.includes("DeliveryPipelines")) {
        return response({
          data: {
            releasePipelines: {
              nodes: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      }
      return response({
        data: {
          releases: {
            nodes: [],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      });
    };

    await assert.rejects(
      () => fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret"),
      new RegExp(`PLA-1.*${field}.*truncated`, "i"),
    );
  });
}

for (const field of ["teams", "stages"] as const) {
  for (const condition of ["truncated", "missing pageInfo"] as const) {
    test(`rejects ${condition} release pipeline ${field}`, async () => {
      const pipeline = {
        id: "pipeline-1",
        name: "Sourcera Product Delivery",
        updatedAt: "2026-07-14T01:00:00.000Z",
        type: "scheduled",
        isProduction: true,
        teams: completeConnection([{ key: "PLA" }]),
        stages: completeConnection([
          { id: "stage-1", name: "Planned", type: "planned" },
        ]),
      };
      const selected = pipeline[field] as {
        pageInfo?: { hasNextPage: boolean; endCursor: string | null };
      };
      if (condition === "truncated") {
        selected.pageInfo!.hasNextPage = true;
      } else {
        delete selected.pageInfo;
      }
      const fetcher: typeof fetch = async (_input, init) => {
        const body = JSON.parse(String(init?.body)) as { query: string };
        if (body.query.includes("DeliveryIssues")) {
          return response({
            data: {
              issues: {
                nodes: [],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          });
        }
        if (body.query.includes("DeliveryPipelines")) {
          assert.match(body.query, /teams\(first: 100, includeArchived: true\)/);
          assert.match(body.query, /stages\(first: 100, includeArchived: true\)/);
          return response({
            data: {
              releasePipelines: {
                nodes: [pipeline],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          });
        }
        return response({
          data: {
            releases: {
              nodes: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
      };

      await assert.rejects(
        () => fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret"),
        new RegExp(`pipeline-1.*${field}.*${condition}`, "i"),
      );
    });
  }
}

test("rejects GraphQL errors returned with HTTP 200", async () => {
  const fetcher: typeof fetch = async () =>
    response({ errors: [{ message: "not authorized" }] });
  await assert.rejects(
    () => fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret"),
    /not authorized/,
  );
});

test("reports the rejected Linear connection and HTTP GraphQL error", async () => {
  const empty = completeConnection([]);
  const fetcher: typeof fetch = async (_input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    if (query.includes("DeliveryIssues")) {
      return response({ errors: [{ message: "Query too complex" }] }, 400);
    }
    if (query.includes("DeliveryPipelines")) {
      return response({ data: { releasePipelines: empty } });
    }
    return response({ data: { releases: empty } });
  };
  await assert.rejects(
    () => fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret"),
    /Linear issues page failed: Linear HTTP 400: Query too complex/,
  );
});

test("retries transient invalid Linear JSON with a fixed bound", async () => {
  const empty = completeConnection([]);
  let issueAttempts = 0;
  const fetcher: typeof fetch = async (_input, init) => {
    const query = (JSON.parse(String(init?.body)) as { query: string }).query;
    if (query.includes("DeliveryIssues")) {
      issueAttempts += 1;
      if (issueAttempts < 3) {
        return new Response("upstream connection error", { status: 502 });
      }
      return response({ data: { issues: empty } });
    }
    if (query.includes("DeliveryPipelines")) {
      return response({ data: { releasePipelines: empty } });
    }
    return response({ data: { releases: empty } });
  };

  const fingerprint = await fetchLinearFingerprint(
    withEmptyProjectInventories(fetcher),
    "secret",
  );
  assert.equal(issueAttempts, 3);
  assert.deepEqual(fingerprint.issues, []);
});

test("rejects a GraphQL relation whose endpoint was not captured", async () => {
  const fetcher: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { query: string };
    if (body.query.includes("DeliveryIssues")) {
      return response({
        data: {
          issues: {
            nodes: [
              {
                id: "uuid-1",
                identifier: "PLA-1",
                title: "First",
                description: "First",
                updatedAt: "2026-07-15T00:00:00.000Z",
                estimate: 1,
                state: { name: "Backlog", type: "backlog" },
                labels: completeConnection([]),
                assignee: null,
                team: { key: "PLA" },
                project: null,
                projectMilestone: null,
                parent: null,
                releases: completeConnection([]),
                relations: completeConnection([
                  {
                    id: "relation-blocks",
                    type: "blocks",
                    issue: { identifier: "PLA-1" },
                    relatedIssue: { identifier: "PLA-2" },
                  },
                ]),
                inverseRelations: completeConnection([]),
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      });
    }
    if (body.query.includes("DeliveryPipelines")) {
      return response({
        data: {
          releasePipelines: {
            nodes: [],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      });
    }
    return response({
      data: {
        releases: {
          nodes: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
  };

  await assert.rejects(
    () => fetchLinearFingerprint(withEmptyProjectInventories(fetcher), "secret"),
    /relation.*PLA-2.*not captured/i,
  );
});

test("CLI compares a fixture with the committed snapshot", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-live-"));
  const empty = {
    issues: [trackedIssue()],
    releasePipelines: [],
    releases: [],
    projects: [
      {
        id: "project-1",
        name: "Sourcera Production",
        descriptionFingerprint: createHash("sha256").update("").digest("hex"),
        updatedAt: "2026-07-15T00:00:00.000Z",
        archivedAt: null,
        statusId: "project-status-1",
        status: "Planned",
        statusType: "planned",
        priority: 2,
        lead: null,
        leadId: null,
        startDate: null,
        startDateResolution: null,
        targetDate: null,
        targetDateResolution: null,
      },
    ],
    projectMilestones: [
      {
        id: "milestone-1",
        name: "Production evidence closed",
        projectId: "project-1",
        project: "Sourcera Production",
        updatedAt: "2026-07-15T03:00:00.000Z",
        archivedAt: null,
        targetDate: "2026-08-01",
        status: "unstarted",
      },
    ],
    cycles: [],
  };
  try {
    const snapshot = join(dir, "snapshot.json");
    const fixture = join(dir, "fixture.json");
    const scope = join(dir, "linear-project-scope.json");
    writeFileSync(
      snapshot,
      JSON.stringify({ projects: empty.projects, linearFingerprint: empty }),
    );
    writeFileSync(fixture, JSON.stringify(empty));
    writeFileSync(
      scope,
      JSON.stringify({
        schemaVersion: 1,
        projects: [{ id: "project-1", name: "Sourcera Production" }],
      }),
    );
    const run = () =>
      spawnSync(
        process.execPath,
        [
          "--import",
          "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
          "tools/delivery/linear-live.ts",
          "--snapshot",
          snapshot,
          "--fixture",
          fixture,
          "--linear-project-scope",
          scope,
        ],
        { cwd: process.cwd(), encoding: "utf8" },
      );
    assert.equal(run().status, 0);
    writeFileSync(
      fixture,
      JSON.stringify({
        ...empty,
        issues: [trackedIssue("2026-07-27T06:40:40.698Z")],
      }),
    );
    assert.equal(run().status, 0);
    writeFileSync(
      fixture,
      JSON.stringify({
        ...empty,
        issues: [{ ...trackedIssue(), title: "Semantic change" }],
      }),
    );
    const semantic = run();
    assert.equal(semantic.status, 1);
    assert.match(semantic.stderr, /issues differ/);
    writeFileSync(
      fixture,
      JSON.stringify({
        ...empty,
        projects: empty.projects.map((project) => ({
          ...project,
          updatedAt: "2026-07-27T06:40:40.698Z",
        })),
      }),
    );
    const projectTimestamp = run();
    assert.equal(projectTimestamp.status, 1);
    assert.match(projectTimestamp.stderr, /projects differ/);
    writeFileSync(
      fixture,
      JSON.stringify({ ...empty, releases: [{ id: "release-1" }] }),
    );
    const changed = run();
    assert.equal(changed.status, 1);
    assert.match(changed.stderr, /releases differ/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI capture writes the exact fingerprint and a provenance receipt", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-capture-"));
  const fingerprint = {
    issues: [],
    releasePipelines: [],
    releases: [],
    projects: [
      {
        id: "project-1",
        name: "Sourcera Production",
        updatedAt: "2026-07-15T00:00:00.000Z",
        archivedAt: null,
      },
    ],
    projectMilestones: [
      {
        id: "milestone-1",
        name: "Production evidence closed",
        projectId: "project-1",
        project: "Sourcera Production",
      },
    ],
    cycles: [],
  };
  try {
    const fixture = join(dir, "fixture.json");
    const scope = join(dir, "linear-project-scope.json");
    const out = join(dir, "fingerprint.json");
    const receipt = join(dir, "receipt.json");
    writeFileSync(
      fixture,
      JSON.stringify(fingerprint),
    );
    writeFileSync(
      scope,
      JSON.stringify({
        schemaVersion: 1,
        projects: [{ id: "project-1", name: "Sourcera Production" }],
      }),
    );
    const run = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/linear-live.ts",
        "--fixture",
        fixture,
        "--linear-project-scope",
        scope,
        "--out",
        out,
        "--receipt-out",
        receipt,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_REPOSITORY: "meetblakey/sourcera",
          GITHUB_SHA: "0123456789abcdef0123456789abcdef01234567",
          GITHUB_REF: "refs/heads/codex/test",
          GITHUB_RUN_ID: "123",
          GITHUB_RUN_ATTEMPT: "2",
        },
      },
    );
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(JSON.parse(readFileSync(out, "utf8")), fingerprint);
    const captured = JSON.parse(readFileSync(receipt, "utf8")) as {
      schemaVersion: number;
      capturedAt: string;
      fingerprintSha256: string;
      source: Record<string, string | null>;
    };
    assert.equal(captured.schemaVersion, 1);
    assert.ok(!Number.isNaN(Date.parse(captured.capturedAt)));
    assert.match(captured.fingerprintSha256, /^[a-f0-9]{64}$/);
    assert.deepEqual(captured.source, {
      repository: "meetblakey/sourcera",
      commit: "0123456789abcdef0123456789abcdef01234567",
      ref: "refs/heads/codex/test",
      runId: "123",
      runAttempt: "2",
    });
    assert.equal(run.stdout, "");
    assert.equal(run.stderr, "");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function prepareEnhancedCliFixture(dir: string) {
  const fingerprint = {
    issues: [],
    releasePipelines: [],
    releases: [],
    projects: [
      {
        id: "project-1",
        name: "Sourcera Production",
        descriptionFingerprint: createHash("sha256").update("").digest("hex"),
        updatedAt: "2026-07-15T00:00:00.000Z",
        archivedAt: null,
        statusId: "project-status-1",
        status: "Planned",
        statusType: "planned",
        priority: 2,
        lead: null,
        leadId: null,
        startDate: null,
        startDateResolution: null,
        targetDate: null,
        targetDateResolution: null,
      },
    ],
    projectMilestones: [],
    cycles: [],
  };
  const coverage = (rows: number) => ({
    terminal: true,
    pages: 1,
    rows,
    finalCursor: null,
    attempts: 1,
  });
  const nativeIdentity = {
    schemaVersion: 1,
    workspace: {
      id: "workspace-1",
      name: "Sourcera",
      urlKey: "sourcera",
      archivedAt: null,
    },
    rawDocumentIds: [],
    issues: [],
    labels: [],
    relations: [],
    teams: [],
    workflowStates: [],
    users: [],
    initiatives: [],
    projects: [
      {
        id: "project-1",
        name: "Sourcera Production",
        contentSha256: createHash("sha256").update("").digest("hex"),
        updatedAt: "2026-07-15T00:00:00.000Z",
        archivedAt: null,
        statusId: "project-status-1",
        status: "Planned",
        statusType: "planned",
        priority: 2,
        leadId: null,
        startDate: null,
        startDateResolution: null,
        targetDate: null,
        targetDateResolution: null,
        teamIds: [],
        initiativeIds: [],
      },
    ],
    releasePipelines: [],
    releases: [],
    projectMilestones: [],
    cycles: [],
    documents: [],
    coverage: {
      complete: true,
      totals: {
        issues: 0,
        labels: 0,
        labelAssignments: 0,
        relations: 0,
        teams: 0,
        workflowStates: 0,
        users: 0,
        initiatives: 0,
        projects: 1,
        releasePipelines: 0,
        releases: 0,
        projectMilestones: 0,
        cycles: 0,
        documents: 0,
      },
      topLevel: {
        issues: coverage(0),
        labels: coverage(0),
        teams: coverage(0),
        workflowStates: coverage(0),
        users: coverage(0),
        initiatives: coverage(0),
        projects: coverage(1),
        releasePipelines: coverage(0),
        releases: coverage(0),
        projectMilestones: coverage(0),
        cycles: coverage(0),
        documents: coverage(0),
      },
      perIssue: [],
      perProject: [
        {
          projectId: "project-1",
          teams: coverage(0),
          initiatives: coverage(0),
        },
      ],
    },
  };
  const documents = { schemaVersion: 1, documents: [] };
  const fixture = join(dir, "fixture.json");
  const scope = join(dir, "linear-project-scope.json");
  const accepted = join(dir, "accepted-fingerprint.json");
  const out = join(dir, "fingerprint.json");
  const descriptionsOut = join(dir, "descriptions.json");
  const nativeOut = join(dir, "native-identity.json");
  const documentsOut = join(dir, "documents.json");
  const receipt = join(dir, "receipt.json");
  const fingerprintJson = `${JSON.stringify(fingerprint, null, 2)}\n`;
  writeFileSync(
    fixture,
    JSON.stringify({
      fingerprint,
      issueDescriptions: [],
      nativeIdentity,
      documents,
    }),
  );
  writeFileSync(
    scope,
    JSON.stringify({
      schemaVersion: 1,
      projects: [{ id: "project-1", name: "Sourcera Production" }],
    }),
  );
  writeFileSync(accepted, fingerprintJson);
  return {
    accepted,
    descriptionsOut,
    documentsOut,
    fixture,
    nativeOut,
    out,
    receipt,
    scope,
  };
}

const enhancedCliEnvironment = {
  GITHUB_REPOSITORY: "meetblakey/sourcera",
  GITHUB_SHA: "0123456789abcdef0123456789abcdef01234567",
  GITHUB_REF: "refs/heads/main",
  GITHUB_RUN_ID: "123",
  GITHUB_RUN_ATTEMPT: "2",
};

function enhancedCliArguments(
  files: ReturnType<typeof prepareEnhancedCliFixture>,
): string[] {
  return [
    "--import",
    "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
    "tools/delivery/linear-live.ts",
    "--fixture",
    files.fixture,
    "--linear-project-scope",
    files.scope,
    "--accepted-fingerprint",
    files.accepted,
    "--out",
    files.out,
    "--descriptions-out",
    files.descriptionsOut,
    "--native-identity-out",
    files.nativeOut,
    "--documents-out",
    files.documentsOut,
    "--receipt-out",
    files.receipt,
  ];
}

test("CLI enhanced capture writes native artifacts and a SHA-bound v2 receipt", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-native-capture-"));
  const fingerprint = {
    issues: [],
    releasePipelines: [],
    releases: [],
    projects: [
      {
        id: "project-1",
        name: "Sourcera Production",
        descriptionFingerprint: createHash("sha256").update("").digest("hex"),
        updatedAt: "2026-07-15T00:00:00.000Z",
        archivedAt: null,
        statusId: "project-status-1",
        status: "Planned",
        statusType: "planned",
        priority: 2,
        lead: null,
        leadId: null,
        startDate: null,
        startDateResolution: null,
        targetDate: null,
        targetDateResolution: null,
      },
    ],
    projectMilestones: [],
    cycles: [],
  };
  const documentMetadata = {
    id: "document-1",
    title: "Master",
    contentSha256: createHash("sha256").update("Raw body").digest("hex"),
    updatedAt: "2026-07-27T00:00:00.000Z",
    archivedAt: null,
    initiativeId: null,
    projectId: "project-1",
    teamId: null,
    issueId: null,
    releaseId: null,
    cycleId: null,
  };
  const connectionCoverage = (rows: number) => ({
    terminal: true,
    pages: 1,
    rows,
    finalCursor: null,
    attempts: 1,
  });
  const nativeIdentity = {
    schemaVersion: 1,
    workspace: {
      id: "workspace-1",
      name: "Sourcera",
      urlKey: "sourcera",
      archivedAt: null,
    },
    rawDocumentIds: ["document-1"],
    issues: [],
    labels: [],
    relations: [],
    teams: [],
    workflowStates: [],
    users: [],
    initiatives: [],
    projects: [
      {
        id: "project-1",
        name: "Sourcera Production",
        contentSha256: createHash("sha256").update("").digest("hex"),
        updatedAt: "2026-07-15T00:00:00.000Z",
        archivedAt: null,
        statusId: "project-status-1",
        status: "Planned",
        statusType: "planned",
        priority: 2,
        leadId: null,
        startDate: null,
        startDateResolution: null,
        targetDate: null,
        targetDateResolution: null,
        teamIds: [],
        initiativeIds: [],
      },
    ],
    releasePipelines: [],
    releases: [],
    projectMilestones: [],
    cycles: [],
    documents: [documentMetadata],
    coverage: {
      complete: true,
      totals: {
        issues: 0,
        labels: 0,
        labelAssignments: 0,
        relations: 0,
        teams: 0,
        workflowStates: 0,
        users: 0,
        initiatives: 0,
        projects: 1,
        releasePipelines: 0,
        releases: 0,
        projectMilestones: 0,
        cycles: 0,
        documents: 1,
      },
      topLevel: {
        issues: connectionCoverage(0),
        labels: connectionCoverage(0),
        teams: connectionCoverage(0),
        workflowStates: connectionCoverage(0),
        users: connectionCoverage(0),
        initiatives: connectionCoverage(0),
        projects: connectionCoverage(1),
        releasePipelines: connectionCoverage(0),
        releases: connectionCoverage(0),
        projectMilestones: connectionCoverage(0),
        cycles: connectionCoverage(0),
        documents: connectionCoverage(1),
      },
      perIssue: [],
      perProject: [
        {
          projectId: "project-1",
          teams: {
            terminal: true,
            pages: 1,
            rows: 0,
            finalCursor: null,
            attempts: 1,
          },
          initiatives: {
            terminal: true,
            pages: 1,
            rows: 0,
            finalCursor: null,
            attempts: 1,
          },
        },
      ],
    },
  };
  const documents = {
    schemaVersion: 1,
    documents: [{ ...documentMetadata, content: "Raw body" }],
  };
  try {
    const fixture = join(dir, "fixture.json");
    const scope = join(dir, "linear-project-scope.json");
    const accepted = join(dir, "accepted-fingerprint.json");
    const out = join(dir, "fingerprint.json");
    const descriptionsOut = join(dir, "descriptions.json");
    const nativeOut = join(dir, "native-identity.json");
    const documentsOut = join(dir, "documents.json");
    const receipt = join(dir, "receipt.json");
    const fingerprintJson = `${JSON.stringify(fingerprint, null, 2)}\n`;
    writeFileSync(
      fixture,
      JSON.stringify({ fingerprint, issueDescriptions: [], nativeIdentity, documents }),
    );
    writeFileSync(
      scope,
      JSON.stringify({
        schemaVersion: 1,
        projects: [{ id: "project-1", name: "Sourcera Production" }],
      }),
    );
    writeFileSync(accepted, fingerprintJson);

    const run = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/linear-live.ts",
        "--fixture",
        fixture,
        "--linear-project-scope",
        scope,
        "--accepted-fingerprint",
        accepted,
        "--out",
        out,
        "--descriptions-out",
        descriptionsOut,
        "--native-identity-out",
        nativeOut,
        "--documents-out",
        documentsOut,
        "--receipt-out",
        receipt,
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_REPOSITORY: "meetblakey/sourcera",
          GITHUB_SHA: "0123456789abcdef0123456789abcdef01234567",
          GITHUB_REF: "refs/heads/main",
          GITHUB_RUN_ID: "123",
          GITHUB_RUN_ATTEMPT: "2",
        },
      },
    );

    assert.equal(run.status, 0, run.stderr);
    const nativeJson = `${JSON.stringify(nativeIdentity, null, 2)}\n`;
    const documentsJson = `${JSON.stringify(documents, null, 2)}\n`;
    const descriptionsJson = `${JSON.stringify(
      { schemaVersion: 1, issues: [] },
      null,
      2,
    )}\n`;
    assert.equal(readFileSync(out, "utf8"), fingerprintJson);
    assert.equal(readFileSync(descriptionsOut, "utf8"), descriptionsJson);
    assert.equal(readFileSync(nativeOut, "utf8"), nativeJson);
    assert.equal(readFileSync(documentsOut, "utf8"), documentsJson);
    assert.deepEqual(JSON.parse(readFileSync(receipt, "utf8")), {
      schemaVersion: 2,
      captureMode: "fixture",
      capturedAt: JSON.parse(readFileSync(receipt, "utf8")).capturedAt,
      fingerprintSha256: createHash("sha256")
        .update(fingerprintJson)
        .digest("hex"),
      acceptedFingerprintSha256: createHash("sha256")
        .update(fingerprintJson)
        .digest("hex"),
      artifactSha256s: {
        fingerprint: createHash("sha256")
          .update(fingerprintJson)
          .digest("hex"),
        nativeIdentity: createHash("sha256").update(nativeJson).digest("hex"),
        documents: createHash("sha256").update(documentsJson).digest("hex"),
        issueDescriptions: createHash("sha256")
          .update(descriptionsJson)
          .digest("hex"),
      },
      source: {
        repository: "meetblakey/sourcera",
        commit: "0123456789abcdef0123456789abcdef01234567",
        ref: "refs/heads/main",
        runId: "123",
        runAttempt: "2",
      },
    });
    for (const path of [
      out,
      descriptionsOut,
      nativeOut,
      documentsOut,
      receipt,
    ]) {
      assert.equal(statSync(path).mode & 0o777, 0o600);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI enhanced capture rejects a different accepted fingerprint", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-native-mismatch-"));
  try {
    const fixture = join(dir, "fixture.json");
    const scope = join(dir, "linear-project-scope.json");
    const accepted = join(dir, "accepted.json");
    const out = join(dir, "fingerprint.json");
    const fingerprint = {
      issues: [],
      releasePipelines: [],
      releases: [],
      projects: [
        {
          id: "project-1",
          name: "Sourcera Production",
          updatedAt: "2026-07-15T00:00:00.000Z",
        },
      ],
      projectMilestones: [],
      cycles: [],
    };
    writeFileSync(
      fixture,
      JSON.stringify({
        fingerprint,
        issueDescriptions: [],
        nativeIdentity: {
          schemaVersion: 1,
          workspace: {
            id: "workspace-1",
            name: "Sourcera",
            urlKey: "sourcera",
            archivedAt: null,
          },
          rawDocumentIds: [],
          issues: [],
          labels: [],
          relations: [],
          teams: [],
          workflowStates: [],
          projects: [],
          documents: [],
          coverage: {},
        },
        documents: { schemaVersion: 1, documents: [] },
      }),
    );
    writeFileSync(
      scope,
      JSON.stringify({
        schemaVersion: 1,
        projects: [{ id: "project-1", name: "Sourcera Production" }],
      }),
    );
    writeFileSync(accepted, "{}\n");
    const run = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/linear-live.ts",
        "--fixture",
        fixture,
        "--linear-project-scope",
        scope,
        "--accepted-fingerprint",
        accepted,
        "--out",
        out,
        "--descriptions-out",
        join(dir, "descriptions.json"),
        "--native-identity-out",
        join(dir, "native.json"),
        "--documents-out",
        join(dir, "documents.json"),
        "--receipt-out",
        join(dir, "receipt.json"),
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_REPOSITORY: "meetblakey/sourcera",
          GITHUB_SHA: "0123456789abcdef0123456789abcdef01234567",
          GITHUB_REF: "refs/heads/main",
          GITHUB_RUN_ID: "123",
          GITHUB_RUN_ATTEMPT: "2",
        },
      },
    );
    assert.equal(run.status, 1);
    assert.match(run.stderr, /accepted Linear fingerprint differs/);
    assert.equal(existsSync(out), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI enhanced capture requires the complete artifact set and provenance", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-native-required-"));
  try {
    const fixture = join(dir, "fixture.json");
    const scope = join(dir, "linear-project-scope.json");
    const accepted = join(dir, "accepted.json");
    const fingerprint = {
      issues: [],
      releasePipelines: [],
      releases: [],
      projects: [
        {
          id: "project-1",
          name: "Sourcera Production",
          updatedAt: "2026-07-15T00:00:00.000Z",
        },
      ],
      projectMilestones: [],
      cycles: [],
    };
    writeFileSync(
      fixture,
      JSON.stringify({
        fingerprint,
        issueDescriptions: [],
        nativeIdentity: {
          schemaVersion: 1,
          workspace: {
            id: "workspace-1",
            name: "Sourcera",
            urlKey: "sourcera",
            archivedAt: null,
          },
          rawDocumentIds: [],
          issues: [],
          labels: [],
          relations: [],
          teams: [],
          workflowStates: [],
          users: [],
          initiatives: [],
          projects: [],
          documents: [],
          coverage: {},
        },
        documents: { schemaVersion: 1, documents: [] },
      }),
    );
    writeFileSync(
      scope,
      JSON.stringify({
        schemaVersion: 1,
        projects: [{ id: "project-1", name: "Sourcera Production" }],
      }),
    );
    writeFileSync(accepted, `${JSON.stringify(fingerprint, null, 2)}\n`);

    const partial = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/linear-live.ts",
        "--fixture",
        fixture,
        "--linear-project-scope",
        scope,
        "--native-identity-out",
        join(dir, "partial-native.json"),
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(partial.status, 1);
    assert.match(partial.stderr, /complete enhanced capture set/);
    assert.equal(existsSync(join(dir, "partial-native.json")), false);

    const missingProvenance = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/linear-live.ts",
        "--fixture",
        fixture,
        "--linear-project-scope",
        scope,
        "--accepted-fingerprint",
        accepted,
        "--out",
        join(dir, "fingerprint.json"),
        "--descriptions-out",
        join(dir, "descriptions.json"),
        "--native-identity-out",
        join(dir, "native.json"),
        "--documents-out",
        join(dir, "documents.json"),
        "--receipt-out",
        join(dir, "receipt.json"),
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_REPOSITORY: "",
          GITHUB_SHA: "",
          GITHUB_REF: "",
          GITHUB_RUN_ID: "",
          GITHUB_RUN_ATTEMPT: "",
        },
      },
    );
    assert.equal(missingProvenance.status, 1);
    assert.match(missingProvenance.stderr, /GitHub provenance is incomplete/);
    assert.equal(existsSync(join(dir, "fingerprint.json")), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI enhanced capture requires exact issue description bytes", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-descriptions-required-"));
  try {
    const files = prepareEnhancedCliFixture(dir);
    const fixture = JSON.parse(readFileSync(files.fixture, "utf8")) as Record<
      string,
      unknown
    >;
    delete fixture.issueDescriptions;
    writeFileSync(files.fixture, JSON.stringify(fixture));
    const run = spawnSync(process.execPath, enhancedCliArguments(files), {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...enhancedCliEnvironment },
    });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /issue description capture is unavailable/);
    for (const path of [
      files.out,
      files.descriptionsOut,
      files.nativeOut,
      files.documentsOut,
      files.receipt,
    ]) {
      assert.equal(existsSync(path), false);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI rejects unknown and duplicate flags", () => {
  const base = [
    "--import",
    "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
    "tools/delivery/linear-live.ts",
  ];
  const unknown = spawnSync(
    process.execPath,
    [...base, "--not-a-linear-live-flag", "value"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /Unknown argument --not-a-linear-live-flag/);

  const duplicate = spawnSync(
    process.execPath,
    [...base, "--out", "/tmp/first.json", "--out", "/tmp/second.json"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /Duplicate argument --out/);
});

test("CLI live enhanced capture requires the independent program scope", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-program-required-"));
  try {
    const files = prepareEnhancedCliFixture(dir);
    const args = enhancedCliArguments(files);
    const fixtureIndex = args.indexOf("--fixture");
    args.splice(fixtureIndex, 2);
    const run = spawnSync(process.execPath, args, {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...enhancedCliEnvironment, LINEAR_API_KEY: "" },
    });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /Live enhanced capture requires .*program scope/i);
    for (const path of [
      files.out,
      files.descriptionsOut,
      files.nativeOut,
      files.documentsOut,
      files.receipt,
    ]) {
      assert.equal(existsSync(path), false);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI enhanced capture rejects canonical path aliases", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-path-alias-"));
  try {
    const files = prepareEnhancedCliFixture(dir);
    const alias = join(dir, "alias");
    symlinkSync(dir, alias, "dir");
    const args = enhancedCliArguments(files);
    args[args.indexOf("--receipt-out") + 1] = join(alias, "fingerprint.json");
    const run = spawnSync(process.execPath, args, {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...enhancedCliEnvironment },
    });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /Enhanced capture paths must be distinct/);
    assert.equal(existsSync(files.out), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI enhanced capture refuses to overwrite an output", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-no-overwrite-"));
  try {
    const files = prepareEnhancedCliFixture(dir);
    writeFileSync(files.out, "preserve me");
    const run = spawnSync(process.execPath, enhancedCliArguments(files), {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...enhancedCliEnvironment },
    });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /Enhanced capture output already exists/);
    assert.equal(readFileSync(files.out, "utf8"), "preserve me");
    assert.equal(existsSync(files.receipt), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI enhanced capture cleans staged artifacts when the final receipt fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-atomic-cleanup-"));
  const locked = join(dir, "locked");
  try {
    const files = prepareEnhancedCliFixture(dir);
    const receipt = join(locked, "receipt.json");
    const args = enhancedCliArguments(files);
    mkdirSync(locked);
    chmodSync(locked, 0o500);
    args[args.indexOf("--receipt-out") + 1] = receipt;
    const run = spawnSync(process.execPath, args, {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, ...enhancedCliEnvironment },
    });
    assert.equal(run.status, 1);
    for (const path of [
      files.out,
      files.descriptionsOut,
      files.nativeOut,
      files.documentsOut,
    ]) {
      assert.equal(existsSync(path), false);
    }
    assert.equal(
      readdirSync(dir).some((name) => name.includes(".linear-capture-")),
      false,
    );
  } finally {
    if (existsSync(locked)) chmodSync(locked, 0o700);
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI requires --out when writing a capture receipt", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/linear-live.ts",
      "--receipt-out",
      "/tmp/receipt.json",
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--receipt-out requires --out/);
});

test("CLI writes a separate full description capture without changing the fingerprint", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-descriptions-"));
  const fingerprint = {
    issues: [
      {
        identifier: "PLA-1",
        title: "[F-005] Foundation",
        descriptionFingerprint: "a".repeat(64),
        updatedAt: "2026-07-15T00:00:00.000Z",
        labels: ["codex-ready"],
      },
    ],
    releasePipelines: [],
    releases: [],
    projects: [
      {
        id: "project-1",
        name: "Sourcera Production",
        updatedAt: "2026-07-15T00:00:00.000Z",
      },
    ],
    projectMilestones: [],
    cycles: [],
  };
  const issueDescriptions = [
    {
      id: "PLA-1",
      title: "[F-005] Foundation",
      description: "## Source\n* Requirement map: F-005",
      updatedAt: "2026-07-15T00:00:00.000Z",
      labels: ["codex-ready"],
    },
  ];
  try {
    const fixture = join(dir, "fixture.json");
    const scope = join(dir, "linear-project-scope.json");
    const out = join(dir, "fingerprint.json");
    const descriptionsOut = join(dir, "descriptions.json");
    writeFileSync(
      fixture,
      JSON.stringify({ fingerprint, issueDescriptions }),
    );
    writeFileSync(
      scope,
      JSON.stringify({
        schemaVersion: 1,
        projects: [{ id: "project-1", name: "Sourcera Production" }],
      }),
    );

    const run = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/linear-live.ts",
        "--fixture",
        fixture,
        "--linear-project-scope",
        scope,
        "--out",
        out,
        "--descriptions-out",
        descriptionsOut,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(JSON.parse(readFileSync(out, "utf8")), fingerprint);
    assert.deepEqual(JSON.parse(readFileSync(descriptionsOut, "utf8")), {
      schemaVersion: 1,
      issues: issueDescriptions,
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI rejects a snapshot that shrinks the independent project scope", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-scope-"));
  try {
    const project = {
      id: "project-1",
      name: "First",
      updatedAt: "2026-07-15T00:00:00.000Z",
    };
    const fingerprint = {
      issues: [],
      releasePipelines: [],
      releases: [],
      projects: [project],
      projectMilestones: [],
      cycles: [],
    };
    const snapshot = join(dir, "snapshot.json");
    const fixture = join(dir, "fixture.json");
    const scope = join(dir, "linear-project-scope.json");
    writeFileSync(
      snapshot,
      JSON.stringify({ projects: [project], linearFingerprint: fingerprint }),
    );
    writeFileSync(fixture, JSON.stringify(fingerprint));
    writeFileSync(
      scope,
      JSON.stringify({
        schemaVersion: 1,
        projects: [
          { id: "project-1", name: "First" },
          { id: "project-2", name: "Second" },
        ],
      }),
    );
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/linear-live.ts",
        "--snapshot",
        snapshot,
        "--fixture",
        fixture,
        "--linear-project-scope",
        scope,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /project scope.*project-2.*missing/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
