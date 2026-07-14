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
                  state: { name: "Backlog", type: "backlog" },
                  labels: { nodes: [{ name: "platform" }] },
                  assignee: null,
                  team: { key: "PLA" },
                  project: { name: "Project" },
                  projectMilestone: null,
                  parent: null,
                  releases: { nodes: [] },
                  relations: { nodes: [] },
                  inverseRelations: { nodes: [] },
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
                state: { name: "Backlog", type: "backlog" },
                labels: { nodes: [] },
                assignee: { name: "Blake Rowley" },
                team: { key: "PLA" },
                project: { name: "Project" },
                projectMilestone: { name: "Milestone" },
                parent: { identifier: "PLA-0" },
                releases: { nodes: [{ id: "release-0", version: "R0" }] },
                relations: {
                  nodes: [
                    {
                      type: "blocks",
                      issue: { identifier: "PLA-1" },
                      relatedIssue: { identifier: "PLA-2" },
                    },
                  ],
                },
                inverseRelations: { nodes: [] },
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
                teams: { nodes: [{ key: "PLA" }] },
                stages: {
                  nodes: [{ id: "stage-1", name: "Planned", type: "planned" }],
                },
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
    ["PLA-1", "PLA-2"],
  );
  assert.equal(fingerprint.issues[0].relations[0], "blocks:PLA-1:PLA-2");
  assert.equal(fingerprint.issues[0].descriptionHash.length, 64);
  assert.equal(requested.every((query) => query.includes("first: 50")), true);
  assert.deepEqual(fingerprintDiff(fingerprint, fingerprint), []);
  assert.match(
    fingerprintDiff(fingerprint, { ...fingerprint, releases: [] })[0],
    /releases/,
  );
});

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
