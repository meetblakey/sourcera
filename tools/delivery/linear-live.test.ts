import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  canonicalLinearRelationKey,
  fetchLinearFingerprint,
  fingerprintDiff,
} from "./lib/linear-live.js";

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
    return fetcher(input, init);
  };

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
                      type: "blocks",
                      issue: { identifier: "PLA-1" },
                      relatedIssue: { identifier: "PLA-2" },
                    },
                    {
                      type: "related",
                      issue: { identifier: "PLA-1" },
                      relatedIssue: { identifier: "PLA-3" },
                    },
                  ],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
                inverseRelations: completeConnection([
                  {
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
                type: "scheduled",
                isProduction: true,
                teams: completeConnection([{ key: "PLA" }]),
                stages: completeConnection([
                  { id: "stage-1", name: "Planned", type: "planned" },
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
              version: "R0",
              updatedAt: "2026-07-14T01:00:00.000Z",
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
      archivedAt: fingerprint.issues[0].archivedAt,
      assigneeId: fingerprint.issues[0].assigneeId,
      teamId: fingerprint.issues[0].teamId,
    },
    {
      priority: 2,
      archivedAt: null,
      assigneeId: "person-blake",
      teamId: "team-pla",
    },
  );
  const issueQuery = requested.find((query) => query.includes("DeliveryIssues"))!;
  for (const field of ["priority", "archivedAt", "assignee { id name }", "team { id key }"]) {
    assert.match(issueQuery, new RegExp(field.replace(/[{}]/g, "\\$&")));
  }
  assert.equal(requested.every((query) => query.includes("first: 50")), true);
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
      projectCursors.push(body.variables.after);
      return response({
        data: {
          projects: body.variables.after
            ? completeConnection([
                { id: "project-1", name: "First", updatedAt: "2026-07-15T01:00:00Z" },
              ])
            : {
                nodes: [
                  { id: "project-2", name: "Second", updatedAt: "2026-07-15T02:00:00Z" },
                ],
                pageInfo: { hasNextPage: true, endCursor: "projects-next" },
              },
        },
      });
    }
    if (body.query.includes("DeliveryProjectMilestones")) {
      assert.doesNotMatch(body.query, /\bupdatedAt\b/);
      assert.doesNotMatch(body.query, /\btargetDate\b/);
      milestoneCursors.push(body.variables.after);
      return response({
        data: {
          projectMilestones: body.variables.after
            ? completeConnection([
                {
                  id: "milestone-1",
                  name: "Production evidence closed",
                  project: { id: "project-1", name: "First" },
                },
              ])
            : {
                nodes: [
                  {
                    id: "milestone-2",
                    name: "Production evidence closed",
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
    return response({ data: { releases: empty } });
  };

  const fingerprint = await fetchLinearFingerprint(fetcher, "secret");
  assert.deepEqual(projectCursors, [null, "projects-next"]);
  assert.deepEqual(milestoneCursors, [null, "milestones-next"]);
  assert.deepEqual(fingerprint.projects.map((project) => project.id), [
    "project-1",
    "project-2",
  ]);
  assert.deepEqual(fingerprint.projectMilestones, [
    {
      id: "milestone-1",
      name: "Production evidence closed",
      projectId: "project-1",
      project: "First",
    },
    {
      id: "milestone-2",
      name: "Production evidence closed",
      projectId: "project-2",
      project: "Second",
    },
  ]);
  assert.match(
    fingerprintDiff(fingerprint, { ...fingerprint, projectMilestones: [] })[0],
    /projectMilestones/,
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
    /id, name, project ID, and project name/,
  );
  assert.match(decision?.assumption ?? "", /connector.*updatedAt.*targetDate/i);
  assert.match(decision?.validationTrigger ?? "", /LINEAR_API_KEY/);
});

test("fingerprint comparison ignores unavailable legacy milestone metadata", () => {
  const fingerprint = {
    issues: [],
    releasePipelines: [],
    releases: [],
    projects: [],
    projectMilestones: [
      {
        id: "milestone-1",
        name: "Production evidence closed",
        projectId: "project-1",
        project: "First",
      },
    ],
  };
  const legacy = {
    ...fingerprint,
    projectMilestones: fingerprint.projectMilestones.map((milestone) => ({
      ...milestone,
      updatedAt: "2026-07-15T03:00:00Z",
      targetDate: "2026-08-01",
    })),
  };

  assert.deepEqual(fingerprintDiff(fingerprint, legacy), []);
});

test("scopes project inventories by canonical IDs while preserving every issue", async () => {
  let projectRows = [
    {
      id: "project-tracked",
      name: "Sourcera Production",
      updatedAt: "2026-07-15T01:00:00Z",
    },
    {
      id: "project-legacy",
      name: "P01 legacy",
      updatedAt: "2026-07-15T01:00:00Z",
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
    return response({ data: { releases: empty } });
  };
  await assert.rejects(
    () => fetchLinearFingerprint(fetcher, "secret"),
    /projectMilestones pagination cursor missing/,
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
          assert.match(body.query, new RegExp(`${nestedField}\\(first: 250\\)`));
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
          assert.match(body.query, /teams\(first: 250\)/);
          assert.match(body.query, /stages\(first: 250\)/);
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
    projectMilestones: [
      {
        id: "milestone-1",
        name: "Production evidence closed",
        projectId: "project-1",
        project: "Sourcera Production",
      },
    ],
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
  };
  try {
    const fixture = join(dir, "fixture.json");
    const scope = join(dir, "linear-project-scope.json");
    const out = join(dir, "fingerprint.json");
    const receipt = join(dir, "receipt.json");
    writeFileSync(
      fixture,
      JSON.stringify({
        ...fingerprint,
        projectMilestones: fingerprint.projectMilestones.map((milestone) => ({
          ...milestone,
          updatedAt: "2026-07-15T03:00:00Z",
          targetDate: "2026-08-01",
        })),
      }),
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
