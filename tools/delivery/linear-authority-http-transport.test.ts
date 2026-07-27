import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import test from "node:test";

import { LinearAuthorityHttpTransport } from "./lib/linear-authority-http-transport.js";
import type { LinearAuthorityAllocation, LinearAuthorityManifest } from "./lib/linear-authority-manifest.js";
import {
  LinearAuthorityRetryableTransportError,
  type LinearAuthorityNativeSelector,
} from "./lib/linear-authority-publisher.js";

const TEAM = "10000000-0000-4000-8000-000000000001";
const PROJECT = "10000000-0000-4000-8000-000000000002";
const STATE = "10000000-0000-4000-8000-000000000003";
const LABEL_ONE = "10000000-0000-4000-8000-000000000004";
const LABEL_TWO = "10000000-0000-4000-8000-000000000005";
const LABEL_PARENT = "10000000-0000-4000-8000-00000000000a";
const USER = "10000000-0000-4000-8000-000000000006";
const CYCLE = "10000000-0000-4000-8000-000000000007";
const MILESTONE = "10000000-0000-4000-8000-000000000008";
const RELEASE = "10000000-0000-4000-8000-000000000009";
const ISSUE = "20000000-0000-4000-8000-000000000001";
const PARENT = "20000000-0000-4000-8000-000000000002";
const OTHER = "20000000-0000-4000-8000-000000000003";
const DOCUMENT = "20000000-0000-4000-8000-000000000004";
const RELATION = "30000000-0000-4000-8000-000000000001";
const MISSING_RELATION = "30000000-0000-4000-8000-000000000002";

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonical(row[key])}`).join(",")}}`;
}

function fixture(): { manifest: LinearAuthorityManifest & { schemaVersion: 2 }; allocation: LinearAuthorityAllocation } {
  const manifest = {
    schemaVersion: 2,
    nativeCatalog: {
      teams: [{ planKey: "team:req", id: TEAM, key: "REQ", name: "Requirements" }],
      users: [{ planKey: "user:blake", id: USER, name: "Blake", active: true }],
      initiatives: [],
      projects: [{ planKey: "project:alpha", id: PROJECT }],
      releasePipelines: [],
      cycles: [{ planKey: "cycle:one", id: CYCLE }],
      milestones: [{ planKey: "milestone:one", id: MILESTONE }],
      releases: [{ planKey: "release:one", id: RELEASE }],
      states: [{ planKey: "state:approved", id: STATE }],
      labels: [
        { planKey: "label:requirement", id: LABEL_ONE },
        { planKey: "label:decision", id: LABEL_TWO },
      ],
    },
  } as unknown as LinearAuthorityManifest & { schemaVersion: 2 };
  const allocation: LinearAuthorityAllocation = {
    schemaVersion: 1,
    planRoot: "1".repeat(64),
    sourceSetRoot: "2".repeat(64),
    liveCaptureRoot: "3".repeat(64),
    allocations: [
      { planKey: "issue:F-001", kind: "issue", title: "Requirement", identifier: null, uuid: ISSUE, source: "allocated" },
      { planKey: "relation-target:parent", kind: "relation_target", title: "Parent", identifier: "PLA-1", uuid: PARENT, source: "adopted" },
      { planKey: "relation-target:other", kind: "relation_target", title: "Other", identifier: "PLA-2", uuid: OTHER, source: "adopted" },
      { planKey: "relation:blocks:F-001:other", kind: "relation", title: null, identifier: null, uuid: RELATION, source: "allocated" },
    ],
  };
  return { manifest, allocation };
}

const desiredPayload = {
  title: "Requirement",
  description: "Binding body",
  teamPlanKey: "team:req",
  projectPlanKey: "project:alpha",
  statePlanKey: "state:approved",
  priority: 2,
  estimate: 3,
  dueDate: "2026-08-01",
  cyclePlanKey: "cycle:one",
  milestonePlanKey: "milestone:one",
  releasePlanKeys: ["release:one"],
  labelPlanKeys: ["label:decision", "label:requirement"],
  parentPlanKey: "relation-target:parent",
  assigneePlanKey: "user:blake",
};

function issueNode(id = ISSUE) {
  return {
    id,
    identifier: "REQ-1",
    title: desiredPayload.title,
    description: desiredPayload.description,
    archivedAt: null,
    trashed: false,
    estimate: desiredPayload.estimate,
    priority: desiredPayload.priority,
    dueDate: desiredPayload.dueDate,
    team: { id: TEAM },
    state: { id: STATE },
    project: { id: PROJECT },
    cycle: { id: CYCLE },
    projectMilestone: { id: MILESTONE },
    parent: { id: PARENT },
    assignee: { id: USER },
    labelIds: [LABEL_ONE, LABEL_TWO],
    releases: { nodes: [{ id: RELEASE }], pageInfo: { hasNextPage: false, endCursor: "release-cursor" } },
    relations: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
    inverseRelations: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
  };
}

test("native selector read captures exact label parent and team scope in one request", async () => {
  const { manifest, allocation } = fixture();
  let captured: { query: string; variables: Record<string, unknown> } | undefined;
  const selectors: LinearAuthorityNativeSelector[] = [
    {
      kind: "team",
      planKey: "team:req",
      id: TEAM,
      identity: { key: "REQ", name: "Requirements", archivedAt: null },
    },
    {
      kind: "label",
      planKey: "label:requirement",
      id: LABEL_ONE,
      identity: {
        name: "Requirement",
        color: "#00aa00",
        description: null,
        archivedAt: null,
        inheritedFromId: null,
        isGroup: false,
        parentId: LABEL_PARENT,
        parentName: "Type",
        teamId: TEAM,
        teamKey: "REQ",
      },
    },
    {
      kind: "label_parent",
      planKey: `label-parent:${LABEL_PARENT}`,
      id: LABEL_PARENT,
      identity: {
        name: "Type",
        color: "#888888",
        description: "Canonical label type group.",
        archivedAt: null,
        inheritedFromId: null,
        isGroup: true,
        parentId: null,
        parentName: null,
        teamId: TEAM,
        teamKey: "REQ",
      },
    },
  ];
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    captured = JSON.parse(String(init?.body)) as typeof captured;
    const label = {
      id: LABEL_ONE,
      name: "Requirement",
      color: "#00aa00",
      description: null,
      archivedAt: null,
      inheritedFrom: null,
      isGroup: false,
      parent: { id: LABEL_PARENT, name: "Type" },
      team: { id: TEAM, key: "REQ" },
    };
    return new Response(JSON.stringify({ data: {
      selector0: { id: TEAM, key: "REQ", name: "Requirements", archivedAt: null },
      selector1: label,
      selector2: {
        ...label,
        id: LABEL_PARENT,
        name: "Type",
        color: "#888888",
        description: "Canonical label type group.",
        isGroup: true,
        parent: null,
      },
    } }), { status: 200 });
  }) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  const rows = await transport.readNativeSelectors({ selectors, credential: "secret-linear-key" });
  assert.deepEqual(rows, selectors);
  assert.match(captured!.query, /selector0: team/);
  assert.match(captured!.query, /selector1: issueLabel/);
  assert.deepEqual(captured!.variables, {
    selectorId0: TEAM,
    selectorId1: LABEL_ONE,
    selectorId2: LABEL_PARENT,
  });
});

test("HTTP adapter resolves plan keys to native UUIDs and performs one request per batched method", async () => {
  const { manifest, allocation } = fixture();
  const requests: Array<{ url: string; authorization: string | null; body: { query: string; variables: Record<string, unknown> } }> = [];
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as { query: string; variables: Record<string, unknown> };
    requests.push({
      url: String(url),
      authorization: new Headers(init?.headers).get("authorization"),
      body,
    });
    if (body.query.includes("LinearAuthorityEntityRead")) {
      return new Response(JSON.stringify({ data: {
        issues: { nodes: [issueNode()], pageInfo: { hasNextPage: false, endCursor: null } },
      } }), { status: 200 });
    }
    if (body.query.includes("LinearAuthorityIssueBatchCreate")) {
      return new Response(JSON.stringify({ data: {
        issueBatchCreate: { success: true, issues: [issueNode()] },
      } }), { status: 200 });
    }
    throw new Error("unexpected query");
  }) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  const read = await transport.readEntities({
    requests: [{ entityKind: "issue", id: ISSUE, planKey: "issue:F-001", payload: desiredPayload }],
    credential: "secret-linear-key",
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.linear.app/graphql");
  assert.equal(requests[0].authorization, "secret-linear-key");
  assert.deepEqual(requests[0].body.variables, { issueIds: [ISSUE] });
  assert.match(requests[0].body.query, /filter: \{ id: \{ in: \$issueIds \} \}/);
  assert.doesNotMatch(requests[0].body.query, /inverseRelations|relations\s*\(/);
  assert.equal(JSON.stringify(requests[0].body).includes("secret-linear-key"), false);
  assert.equal(read[0].state.authorityPayloadSha256, sha256(canonical(desiredPayload)));

  await transport.issueBatchCreate({
    issues: [{ id: ISSUE, planKey: "issue:F-001", payload: desiredPayload, idempotencyKey: "a".repeat(64) }],
    credential: "secret-linear-key",
  });
  assert.equal(requests.length, 2);
  const input = (requests[1].body.variables.input as { issues: Array<Record<string, unknown>> }).issues[0];
  assert.deepEqual(input, {
    title: desiredPayload.title,
    description: desiredPayload.description,
    teamId: TEAM,
    projectId: PROJECT,
    stateId: STATE,
    priority: 2,
    estimate: 3,
    dueDate: "2026-08-01",
    cycleId: CYCLE,
    projectMilestoneId: MILESTONE,
    releaseIds: [RELEASE],
    labelIds: [LABEL_TWO, LABEL_ONE],
    parentId: PARENT,
    assigneeId: USER,
    id: ISSUE,
  });
});

test("issue updates use the update schema and omit unchanged releases", async () => {
  const { manifest, allocation } = fixture();
  let captured: { query: string; variables: Record<string, unknown> } | undefined;
  const updatePayload = { ...desiredPayload, releasePlanKeys: [] };
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    captured = JSON.parse(String(init?.body)) as typeof captured;
    return new Response(JSON.stringify({ data: {
      op0: {
        success: true,
        issue: {
          ...issueNode(),
          releases: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
        },
      },
    } }), { status: 200 });
  }) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  await transport.mutateEntitiesAliased({
    mutations: [{
      action: "update_issue",
      entityKind: "issue",
      id: ISSUE,
      planKey: "issue:F-001",
      expectedCurrentState: {
        projection: "managed_issue",
        titleSha256: "1".repeat(64),
        bodySha256: "2".repeat(64),
        nativeSha256: "3".repeat(64),
      },
      payload: updatePayload,
      idempotencyKey: "e".repeat(64),
    }],
    credential: "secret-linear-key",
  });
  assert.match(captured!.query, /IssueUpdateInput!/);
  assert.deepEqual(captured!.variables, {
    id0: ISSUE,
    input0: {
      title: desiredPayload.title,
      description: desiredPayload.description,
      teamId: TEAM,
      projectId: PROJECT,
      stateId: STATE,
      priority: 2,
      estimate: 3,
      dueDate: "2026-08-01",
      cycleId: CYCLE,
      projectMilestoneId: MILESTONE,
      labelIds: [LABEL_TWO, LABEL_ONE],
      parentId: PARENT,
      assigneeId: USER,
    },
  });
});

test("issue updates fail before HTTP when a release change is requested", async () => {
  const { manifest, allocation } = fixture();
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    throw new Error("should not fetch");
  }) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  await assert.rejects(transport.mutateEntitiesAliased({
    mutations: [{
      action: "update_issue",
      entityKind: "issue",
      id: ISSUE,
      planKey: "issue:F-001",
      expectedCurrentState: {
        projection: "managed_issue",
        titleSha256: "1".repeat(64),
        bodySha256: "2".repeat(64),
        nativeSha256: "3".repeat(64),
      },
      payload: desiredPayload,
      idempotencyKey: "f".repeat(64),
    }],
    credential: "secret-linear-key",
  }), /issue release updates are unsupported/);
  assert.equal(calls, 0);
});

test("document-create alias keeps UUID inside input and declares no unused ID variable", async () => {
  const { manifest, allocation } = fixture();
  let captured: { query: string; variables: Record<string, unknown> } | undefined;
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    captured = JSON.parse(String(init?.body)) as typeof captured;
    return new Response(JSON.stringify({ data: {
      op0: {
        success: true,
        document: {
          id: DOCUMENT,
          title: "Alpha PRD",
          content: "Binding document",
          archivedAt: null,
          trashed: false,
          initiative: null,
          project: { id: PROJECT },
          team: null,
          issue: null,
          release: null,
          cycle: null,
        },
      },
    } }), { status: 200 });
  }) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  const payload = {
    title: "Alpha PRD",
    content: "Binding document",
    attachmentKind: "project",
    attachmentPlanKey: "project:alpha",
  };
  await transport.mutateEntitiesAliased({
    mutations: [{
      action: "create_document",
      entityKind: "document",
      id: DOCUMENT,
      planKey: "document:alpha",
      expectedCurrentState: null,
      payload,
      idempotencyKey: "d".repeat(64),
    }],
    credential: "secret-linear-key",
  });
  assert.doesNotMatch(captured!.query, /\$id0/);
  assert.deepEqual(captured!.variables, {
    input0: {
      id: DOCUMENT,
      title: "Alpha PRD",
      content: "Binding document",
      initiativeId: null,
      projectId: PROJECT,
      teamId: null,
      issueId: null,
      releaseId: null,
      cycleId: null,
    },
  });
});

test("relation mutations use exact caller UUIDs and native endpoints in one aliased request", async () => {
  const { manifest, allocation } = fixture();
  let captured: { query: string; variables: Record<string, unknown> } | undefined;
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    captured = JSON.parse(String(init?.body)) as typeof captured;
    return new Response(JSON.stringify({ data: {
      op0: {
        success: true,
        issueRelation: {
          id: RELATION,
          type: "blocks",
          archivedAt: null,
          issue: { id: ISSUE, identifier: "REQ-1" },
          relatedIssue: { id: OTHER, identifier: "PLA-2" },
        },
      },
    } }), { status: 200 });
  }) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  const rows = await transport.createRelationsAliased({
    relations: [{
      id: RELATION,
      planKey: "relation:blocks:F-001:other",
      type: "blocks",
      sourceUuid: ISSUE,
      targetUuid: OTHER,
      canonicalKey: "blocks:REQ-1:PLA-2",
      idempotencyKey: "b".repeat(64),
    }],
    credential: "secret-linear-key",
  });
  assert.match(captured!.query, /op0: issueRelationCreate/);
  assert.deepEqual(captured!.variables, {
    input0: { id: RELATION, type: "blocks", issueId: ISSUE, relatedIssueId: OTHER },
  });
  assert.deepEqual(rows, [{ uuid: RELATION, canonicalKey: "blocks:REQ-1:PLA-2", archivedAt: null }]);
});

test("relation readback recovers exact UUIDs despite older source history and missing planned IDs", async () => {
  const { manifest, allocation } = fixture();
  let captured: { query: string; variables: Record<string, unknown> } | undefined;
  const relation = {
    id: RELATION,
    type: "blocks",
    archivedAt: null,
    issue: { id: ISSUE, identifier: "REQ-1" },
    relatedIssue: { id: OTHER, identifier: "PLA-2" },
  };
  const connection = (nodes: unknown[]) => ({
    nodes,
    pageInfo: { hasPreviousPage: true, startCursor: nodes.length > 0 ? "cursor" : null },
  });
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    captured = JSON.parse(String(init?.body)) as typeof captured;
    return new Response(JSON.stringify({ data: {
      issue0: { relations: connection([relation]) },
    } }), { status: 200 });
  }) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  const rows = await transport.readRelations({
    requests: [
      { id: RELATION, sourceUuid: ISSUE, targetUuid: OTHER },
      { id: MISSING_RELATION, sourceUuid: ISSUE, targetUuid: OTHER },
    ],
    credential: "secret-linear-key",
  });
  assert.doesNotMatch(captured!.query, /issueRelation\s*\(/);
  assert.match(captured!.query, /relations\(last: 2, orderBy: createdAt, includeArchived: true\)/);
  assert.doesNotMatch(captured!.query, /inverseRelations/);
  assert.deepEqual(captured!.variables, { id0: ISSUE });
  assert.deepEqual(rows, [{ uuid: RELATION, canonicalKey: "blocks:REQ-1:PLA-2", archivedAt: null }]);
});

test("relation readback fails if Linear exceeds the planned tail cardinality", async () => {
  const { manifest, allocation } = fixture();
  const relation = {
    id: RELATION,
    type: "blocks",
    archivedAt: null,
    issue: { id: ISSUE, identifier: "REQ-1" },
    relatedIssue: { id: OTHER, identifier: "PLA-2" },
  };
  const fetcher = (async () => new Response(JSON.stringify({ data: {
    issue0: {
      relations: {
        nodes: [relation, relation, relation],
        pageInfo: { hasPreviousPage: true, startCursor: "cursor" },
      },
    },
  } }), { status: 200 })) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  await assert.rejects(transport.readRelations({
    requests: [
      { id: RELATION, sourceUuid: ISSUE, targetUuid: OTHER },
      { id: MISSING_RELATION, sourceUuid: ISSUE, targetUuid: OTHER },
    ],
    credential: "secret-linear-key",
  }), /exceeds its planned cardinality/);
});

test("rate-limit reset becomes a redacted retry hint without leaking response or credential", async () => {
  const { manifest, allocation } = fixture();
  const now = 1_800_000_000_000;
  const fetcher = (async () => new Response(JSON.stringify({
    errors: [{ message: "secret-linear-key and raw body", extensions: { code: "RATELIMITED" } }],
  }), {
    status: 429,
    headers: { "x-ratelimit-requests-reset": String((now + 12_000) / 1_000) },
  })) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher, now: () => now });
  await assert.rejects(
    transport.listRelationsPage({ after: null, first: 10, includeArchived: true, credential: "secret-linear-key" }),
    (error: unknown) => {
      assert.ok(error instanceof LinearAuthorityRetryableTransportError);
      assert.equal(error.retryAfterMs, 12_000);
      assert.equal(error.message.includes("secret-linear-key"), false);
      assert.equal(error.message.includes("raw body"), false);
      return true;
    },
  );
});

test("provider retry hints are clamped to sixty seconds", async () => {
  const { manifest, allocation } = fixture();
  const now = 1_800_000_000_000;
  const fetcher = (async () => new Response(JSON.stringify({ errors: [{ extensions: { code: "RATELIMITED" } }] }), {
    status: 429,
    headers: { "retry-after": "3600" },
  })) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher, now: () => now });
  await assert.rejects(
    transport.listRelationsPage({ after: null, first: 10, includeArchived: true, credential: "secret-linear-key" }),
    (error: unknown) => {
      assert.ok(error instanceof LinearAuthorityRetryableTransportError);
      assert.equal(error.retryAfterMs, 60_000);
      return true;
    },
  );
});

test("adapter rejects oversized mutation batches before any HTTP request", async () => {
  const { manifest, allocation } = fixture();
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    throw new Error("should not fetch");
  }) as typeof fetch;
  const transport = new LinearAuthorityHttpTransport({ manifest, allocation, fetcher });
  const relation = {
    id: RELATION,
    planKey: "relation:blocks:F-001:other",
    type: "blocks" as const,
    sourceUuid: ISSUE,
    targetUuid: OTHER,
    canonicalKey: "blocks:REQ-1:PLA-2",
    idempotencyKey: "c".repeat(64),
  };
  await assert.rejects(transport.createRelationsAliased({
    relations: Array.from({ length: 26 }, () => relation),
    credential: "secret-linear-key",
  }), /outside its safe bound/);
  assert.equal(calls, 0);
});
