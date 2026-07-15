import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
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
                  state: { name: "In Progress", type: "started" },
                  labels: completeConnection([{ name: "platform" }]),
                  assignee: null,
                  team: { key: "PLA" },
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
                state: { name: "Done", type: "completed" },
                labels: completeConnection([]),
                assignee: { name: "Blake Rowley" },
                team: { key: "PLA" },
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
                  ],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
                inverseRelations: completeConnection([]),
              },
              {
                id: "uuid-3",
                identifier: "PLA-3",
                title: "Third",
                description: "C",
                updatedAt: "2026-07-14T03:00:00.000Z",
                estimate: 3,
                state: { name: "Backlog", type: "backlog" },
                labels: completeConnection([
                  { name: "buyer" },
                  { name: "feature" },
                ]),
                assignee: { name: "Reviewer" },
                team: { key: "PLA" },
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

  const fingerprint = await fetchLinearFingerprint(fetcher, "secret");
  assert.deepEqual(cursors, [null, "next"]);
  assert.deepEqual(
    fingerprint.issues.map((issue) => issue.identifier),
    ["PLA-1", "PLA-2", "PLA-3"],
  );
  assert.equal(fingerprint.issues[0].relations[0], "blocks:PLA-1:PLA-2");
  assert.equal(fingerprint.issues[0].descriptionFingerprint.length, 64);
  assert.equal(requested.every((query) => query.includes("first: 50")), true);
  assert.deepEqual(fingerprintDiff(fingerprint, fingerprint), []);
  assert.match(
    fingerprintDiff(fingerprint, { ...fingerprint, releases: [] })[0],
    /releases/,
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
    return (await fetchLinearFingerprint(fetcher, "secret")).issues[0]
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
      () => fetchLinearFingerprint(fetcher, "secret"),
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
        () => fetchLinearFingerprint(fetcher, "secret"),
        new RegExp(`pipeline-1.*${field}.*${condition}`, "i"),
      );
    });
  }
}

test("rejects GraphQL errors returned with HTTP 200", async () => {
  const fetcher: typeof fetch = async () =>
    response({ errors: [{ message: "not authorized" }] });
  await assert.rejects(
    () => fetchLinearFingerprint(fetcher, "secret"),
    /not authorized/,
  );
});

test("CLI compares a fixture with the committed snapshot", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-live-"));
  const empty = { issues: [], releasePipelines: [], releases: [] };
  try {
    const snapshot = join(dir, "snapshot.json");
    const fixture = join(dir, "fixture.json");
    writeFileSync(snapshot, JSON.stringify({ linearFingerprint: empty }));
    writeFileSync(fixture, JSON.stringify(empty));
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
