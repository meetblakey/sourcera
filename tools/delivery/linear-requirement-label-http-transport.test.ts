import { strict as assert } from "node:assert";
import test from "node:test";

import {
  LinearRequirementLabelHttpTransport,
  type LinearRequirementLabelCreateInput,
} from "./lib/linear-requirement-label-http-transport.js";

const OLD_LABEL = "5b058b32-9655-442e-bcdb-a5ca0479c311";
const NEW_LABEL = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TEAM = "ee9dd198-4816-4836-9226-42765878d793";
const ISSUE = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const STATE = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const PROJECT = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const CYCLE = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const MILESTONE = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const ASSIGNEE = "11111111-1111-4111-8111-111111111111";
const PARENT = "22222222-2222-4222-8222-222222222222";
const RELEASE = "33333333-3333-4333-8333-333333333333";
const RELATION = "44444444-4444-4444-8444-444444444444";
const SECOND_RELATION = "55555555-5555-4555-8555-555555555555";
const SECOND_ISSUE = "66666666-6666-4666-8666-666666666666";
const RETIRED_NAME = "Requirement (retired workspace scope)";
const DESCRIPTION = "Canonical binding product or engineering requirement.";
const ISSUE_DESCRIPTION = "Protected requirement body";
const ISSUE_DESCRIPTION_SHA256 = "85a18d4455bfe864eba8820a6bff610e50482b6282aa6600ad0ae1b01a34c115";
const CREDENTIAL = "secret-linear-key";

const createInput: LinearRequirementLabelCreateInput = {
  id: NEW_LABEL,
  name: "Requirement",
  color: "#5E6AD2",
  description: DESCRIPTION,
  teamId: TEAM,
  isGroup: false,
  parentId: null,
};

function labelNode(overrides: Record<string, unknown> = {}) {
  return {
    id: OLD_LABEL,
    name: "Requirement",
    color: "#5E6AD2",
    description: DESCRIPTION,
    archivedAt: null,
    retiredAt: null,
    inheritedFrom: null,
    isGroup: false,
    parent: null,
    team: null,
    ...overrides,
  };
}

function issueNode(overrides: Record<string, unknown> = {}) {
  return {
    id: ISSUE,
    identifier: "REQ-1",
    title: "Pinned requirement title",
    description: ISSUE_DESCRIPTION,
    archivedAt: null,
    trashed: false,
    updatedAt: "2026-07-29T00:00:00.000Z",
    team: { id: TEAM, key: "REQ" },
    state: { id: STATE },
    project: { id: PROJECT },
    estimate: 3,
    priority: 2,
    dueDate: "2026-08-01",
    cycle: { id: CYCLE },
    projectMilestone: { id: MILESTONE },
    releases: connection([{ id: RELEASE }]),
    parent: { id: PARENT },
    assignee: { id: ASSIGNEE },
    labelIds: [OLD_LABEL],
    labels: connection([{ id: OLD_LABEL }]),
    relations: connection([{ id: RELATION }]),
    inverseRelations: connection([]),
    ...overrides,
  };
}

function connection(nodes: Array<Record<string, unknown>>, hasNextPage = false, endCursor: string | null = null) {
  return { nodes, pageInfo: { hasNextPage, endCursor } };
}

function labelConnection(nodes: Array<Record<string, unknown>>, hasNextPage = false, endCursor: string | null = null) {
  return { issueLabels: connection(nodes, hasNextPage, endCursor) };
}

function body(init?: RequestInit): { query: string; variables: Record<string, unknown> } {
  return JSON.parse(String(init?.body)) as { query: string; variables: Record<string, unknown> };
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

test("reads the filtered exact label and complete protected issue projection", async () => {
  const requests: Array<{ authorization: string | null; query: string; variables: Record<string, unknown> }> = [];
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    const request = body(init);
    requests.push({
      authorization: new Headers(init?.headers).get("authorization"),
      ...request,
    });
    if (request.query.includes("LinearRequirementLabelRead")) {
      return new Response(JSON.stringify({ data: labelConnection([labelNode()]) }), { status: 200 });
    }
    if (request.query.includes("LinearRequirementIssueRead")) {
      return new Response(JSON.stringify({ data: { issue: issueNode() } }), { status: 200 });
    }
    throw new Error("unexpected request");
  }) as typeof fetch;
  const transport = new LinearRequirementLabelHttpTransport({ credential: CREDENTIAL, fetcher });

  assert.deepEqual(await transport.readLabel(OLD_LABEL), {
    id: OLD_LABEL,
    name: "Requirement",
    color: "#5E6AD2",
    description: DESCRIPTION,
    archivedAt: null,
    retiredAt: null,
    inheritedFromId: null,
    isGroup: false,
    parentId: null,
    parentName: null,
    teamId: null,
    teamKey: null,
  });
  assert.deepEqual(await transport.readIssue(ISSUE), {
    id: ISSUE,
    identifier: "REQ-1",
    title: "Pinned requirement title",
    descriptionSha256: ISSUE_DESCRIPTION_SHA256,
    archivedAt: null,
    trashed: false,
    updatedAt: "2026-07-29T00:00:00.000Z",
    teamId: TEAM,
    teamKey: "REQ",
    stateId: STATE,
    projectId: PROJECT,
    estimate: 3,
    priority: 2,
    dueDate: "2026-08-01",
    cycleId: CYCLE,
    milestoneId: MILESTONE,
    releaseIds: [RELEASE],
    parentIssueUuid: PARENT,
    assigneeId: ASSIGNEE,
    labelIds: [OLD_LABEL],
    relationIds: [RELATION],
  });
  assert.equal(requests.length, 2);
  assert.deepEqual(requests.map((request) => request.authorization), [CREDENTIAL, CREDENTIAL]);
  assert.deepEqual(requests.map((request) => request.variables), [{ id: OLD_LABEL }, { id: ISSUE }]);
  assert.match(requests[0]!.query, /\$id:\s*ID!/);
  assert.match(requests[0]!.query, /issueLabels\s*\(\s*first:\s*2[\s\S]*includeArchived:\s*true[\s\S]*filter:\s*\{\s*id:\s*\{\s*eq:\s*\$id/);
  assert.match(requests[1]!.query, /title[\s\S]*description[\s\S]*state[\s\S]*project[\s\S]*labels[\s\S]*relations/);
  assert.equal(JSON.stringify(requests.map(({ authorization: _authorization, ...request }) => request)).includes(CREDENTIAL), false);
});

test("returns null only when an exact label UUID is absent", async () => {
  const transport = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    fetcher: (async () => new Response(JSON.stringify({ data: labelConnection([]) }), { status: 200 })) as typeof fetch,
  });
  assert.equal(await transport.readLabel(NEW_LABEL), null);
});

test("rejects duplicate rows from an exact label UUID filter", async () => {
  const transport = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    fetcher: (async () => new Response(JSON.stringify({
      data: labelConnection([labelNode(), labelNode()]),
    }), { status: 200 })) as typeof fetch,
  });
  await assert.rejects(() => transport.readLabel(OLD_LABEL), /label connection is invalid/i);
});

test("lists exact unique issue UUIDs through complete bounded label pagination", async () => {
  const requests: Array<{ query: string; variables: Record<string, unknown> }> = [];
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    const request = body(init);
    requests.push(request);
    const after = request.variables.after;
    const issues = after === null
      ? connection([{ id: ISSUE }], true, "page-1")
      : connection([{ id: SECOND_ISSUE }]);
    return new Response(JSON.stringify({ data: { issues } }), { status: 200 });
  }) as typeof fetch;
  const transport = new LinearRequirementLabelHttpTransport({ credential: CREDENTIAL, fetcher });

  assert.deepEqual(await transport.listIssueIdsByLabel(OLD_LABEL), [ISSUE, SECOND_ISSUE].sort());
  assert.deepEqual(requests.map((request) => request.variables), [
    { labelId: OLD_LABEL, after: null },
    { labelId: OLD_LABEL, after: "page-1" },
  ]);
  assert.match(requests[0]!.query, /\$labelId:\s*ID!/);
  assert.match(requests[0]!.query, /issues\s*\([\s\S]*filter:\s*\{\s*labels:\s*\{\s*some:\s*\{\s*id:\s*\{\s*eq:\s*\$labelId/);
  assert.match(requests[0]!.query, /includeArchived:\s*true/);
});

test("rejects duplicate issue UUIDs across label-use pages", async () => {
  let page = 0;
  const transport = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    fetcher: (async () => {
      page += 1;
      return new Response(JSON.stringify({ data: {
        issues: page === 1
          ? connection([{ id: ISSUE }], true, "next")
          : connection([{ id: ISSUE }]),
      } }), { status: 200 });
    }) as typeof fetch,
  });
  await assert.rejects(() => transport.listIssueIdsByLabel(OLD_LABEL), /issue label use connection is invalid/i);
});

test("paginates protected issue labels and relations before returning readback", async () => {
  const requests: string[] = [];
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    const request = body(init);
    requests.push(request.query);
    if (request.query.includes("LinearRequirementIssueRead")) {
      return new Response(JSON.stringify({ data: { issue: issueNode({
        labelIds: [OLD_LABEL, NEW_LABEL],
        labels: connection([{ id: OLD_LABEL }], true, "labels-next"),
        relations: connection([{ id: RELATION }], true, "relations-next"),
      }) } }), { status: 200 });
    }
    if (request.query.includes("LinearRequirementIssueLabelsPage")) {
      return new Response(JSON.stringify({ data: {
        issue: { id: ISSUE, labels: connection([{ id: NEW_LABEL }]) },
      } }), { status: 200 });
    }
    if (request.query.includes("LinearRequirementIssueRelationsPage")) {
      return new Response(JSON.stringify({ data: {
        issue: { id: ISSUE, relations: connection([{ id: SECOND_RELATION }]) },
      } }), { status: 200 });
    }
    throw new Error("unexpected request");
  }) as typeof fetch;
  const transport = new LinearRequirementLabelHttpTransport({ credential: CREDENTIAL, fetcher });

  const issue = await transport.readIssue(ISSUE);
  assert.deepEqual(issue.labelIds, [NEW_LABEL, OLD_LABEL].sort());
  assert.deepEqual(issue.relationIds, [RELATION, SECOND_RELATION].sort());
  assert.equal(requests.length, 3);
});

test("uses only official replacement mutations with exact variables and readback", async () => {
  const requests: Array<{ query: string; variables: Record<string, unknown> }> = [];
  const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => {
    const request = body(init);
    requests.push(request);
    if (request.query.includes("issueLabelUpdate")) {
      return new Response(JSON.stringify({ data: {
        issueLabelUpdate: { success: true, issueLabel: labelNode({ name: RETIRED_NAME }) },
      } }), { status: 200 });
    }
    if (request.query.includes("issueLabelCreate")) {
      return new Response(JSON.stringify({ data: {
        issueLabelCreate: { success: true, issueLabel: labelNode({ id: NEW_LABEL, team: { id: TEAM, key: "REQ" } }) },
      } }), { status: 200 });
    }
    if (request.query.includes("issueUpdate")) {
      return new Response(JSON.stringify({ data: {
        issueUpdate: {
          success: true,
          issue: issueNode({ labelIds: [NEW_LABEL], labels: connection([{ id: NEW_LABEL }]) }),
        },
      } }), { status: 200 });
    }
    if (request.query.includes("issueLabelRetire")) {
      return new Response(JSON.stringify({ data: {
        issueLabelRetire: {
          success: true,
          issueLabel: labelNode({ name: RETIRED_NAME, retiredAt: "2026-07-29T01:00:00.000Z" }),
        },
      } }), { status: 200 });
    }
    if (request.query.includes("issueLabelRestore")) {
      return new Response(JSON.stringify({ data: {
        issueLabelRestore: {
          success: true,
          issueLabel: labelNode({ name: RETIRED_NAME, retiredAt: null }),
        },
      } }), { status: 200 });
    }
    throw new Error("unexpected request");
  }) as typeof fetch;
  const transport = new LinearRequirementLabelHttpTransport({ credential: CREDENTIAL, fetcher });

  assert.equal((await transport.renameLabel(OLD_LABEL, RETIRED_NAME)).name, RETIRED_NAME);
  assert.equal((await transport.createLabel(createInput)).id, NEW_LABEL);
  assert.deepEqual((await transport.replaceIssueLabels(ISSUE, [NEW_LABEL])).labelIds, [NEW_LABEL]);
  assert.equal((await transport.retireLabel(OLD_LABEL)).retiredAt, "2026-07-29T01:00:00.000Z");
  assert.equal((await transport.restoreLabel(OLD_LABEL)).retiredAt, null);

  assert.equal(requests.length, 5);
  assert.deepEqual(requests[0]!.variables, { id: OLD_LABEL, input: { name: RETIRED_NAME } });
  assert.deepEqual(requests[1]!.variables, { input: createInput });
  assert.deepEqual(requests[2]!.variables, { id: ISSUE, input: { labelIds: [NEW_LABEL] } });
  assert.deepEqual(requests[3]!.variables, { id: OLD_LABEL });
  assert.deepEqual(requests[4]!.variables, { id: OLD_LABEL });
  assert.match(requests[0]!.query, /issueLabelUpdate/);
  assert.match(requests[1]!.query, /issueLabelCreate/);
  assert.match(requests[2]!.query, /issueUpdate/);
  assert.match(requests[3]!.query, /issueLabelRetire/);
  assert.match(requests[4]!.query, /issueLabelRestore/);
  assert.doesNotMatch(requests.map((request) => request.query).join("\n"), /issueLabelDelete/);
  assert.equal("deleteLabel" in transport, false);
});

test("rejects concurrent calls before a second HTTP attempt", async () => {
  let resolveFirst!: (response: Response) => void;
  const firstResponse = new Promise<Response>((resolve) => { resolveFirst = resolve; });
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    return firstResponse;
  }) as typeof fetch;
  const transport = new LinearRequirementLabelHttpTransport({ credential: CREDENTIAL, fetcher });

  const first = transport.readLabel(OLD_LABEL);
  await assert.rejects(() => transport.readIssue(ISSUE), /concurrent calls are forbidden/i);
  assert.equal(calls, 1);
  resolveFirst(new Response(JSON.stringify({ data: labelConnection([labelNode()]) }), { status: 200 }));
  await first;
});

test("enforces timeout, total HTTP-attempt, and response-byte bounds", async () => {
  const timeoutTransport = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    timeoutMs: 5,
    fetcher: (async () => new Promise<Response>(() => undefined)) as typeof fetch,
  });
  await assert.rejects(() => timeoutTransport.readLabel(OLD_LABEL), /timed out/i);

  let attempts = 0;
  const boundedTransport = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    maxHttpAttempts: 1,
    fetcher: (async () => {
      attempts += 1;
      return new Response(JSON.stringify({ data: labelConnection([labelNode()]) }), { status: 200 });
    }) as typeof fetch,
  });
  await boundedTransport.readLabel(OLD_LABEL);
  await assert.rejects(() => boundedTransport.readLabel(OLD_LABEL), /HTTP attempt limit/i);
  assert.equal(attempts, 1);

  const byteTransport = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    maxResponseBytes: 8,
    fetcher: (async () => new Response("0123456789", { status: 200 })) as typeof fetch,
  });
  await assert.rejects(() => byteTransport.readLabel(OLD_LABEL), /response exceeds its byte limit/i);
});

test("redacts credentials, descriptions, GraphQL messages, and malformed readback values", async () => {
  const graphqlLeak = "private-graphql-detail";
  const fetcher = (async () => new Response(JSON.stringify({
    errors: [{ message: `${graphqlLeak} ${CREDENTIAL} ${DESCRIPTION}` }],
  }), { status: 200 })) as typeof fetch;
  const transport = new LinearRequirementLabelHttpTransport({ credential: CREDENTIAL, fetcher });
  let rejected = "";
  try {
    await transport.createLabel(createInput);
  } catch (error) {
    rejected = errorText(error);
  }
  assert.match(rejected, /request was rejected/i);
  assert.doesNotMatch(rejected, new RegExp([graphqlLeak, CREDENTIAL, DESCRIPTION].join("|")));

  const streamLeak = "private-stream-detail";
  const streamFailure = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    fetcher: (async () => new Response(new ReadableStream({
      pull(controller) {
        controller.error(new Error(`${streamLeak} ${CREDENTIAL} ${DESCRIPTION}`));
      },
    }), { status: 200 })) as typeof fetch,
  });
  let streamRejected = "";
  try {
    await streamFailure.readLabel(OLD_LABEL);
  } catch (error) {
    streamRejected = errorText(error);
  }
  assert.match(streamRejected, /response read failed/i);
  assert.doesNotMatch(streamRejected, new RegExp([streamLeak, CREDENTIAL, DESCRIPTION].join("|")));

  const wrongId = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    fetcher: (async () => new Response(JSON.stringify({
      data: labelConnection([labelNode({ id: NEW_LABEL })]),
    }), { status: 200 })) as typeof fetch,
  });
  await assert.rejects(() => wrongId.readLabel(OLD_LABEL), /readback ID is invalid/i);
});

test("requires canonical UUIDv4 identities, exact active label input, and unique issue labels", async () => {
  const transport = new LinearRequirementLabelHttpTransport({
    credential: CREDENTIAL,
    fetcher: (async () => { throw new Error("must not fetch"); }) as typeof fetch,
  });
  await assert.rejects(() => transport.readLabel("not-a-uuid"), /UUID is invalid/i);
  await assert.rejects(() => transport.createLabel({ ...createInput, id: OLD_LABEL.toUpperCase() }), /create input is invalid/i);
  await assert.rejects(() => transport.createLabel({ ...createInput, teamId: "not-a-team" }), /create input is invalid/i);
  await assert.rejects(() => transport.createLabel({ ...createInput, isGroup: true as false }), /create input is invalid/i);
  await assert.rejects(() => transport.replaceIssueLabels(ISSUE, [NEW_LABEL, NEW_LABEL]), /label IDs are invalid/i);
});
