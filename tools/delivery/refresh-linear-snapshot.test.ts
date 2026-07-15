import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("copies the live parent relation into issue rows and fingerprints", () => {
  const root = mkdtempSync(join(tmpdir(), "sourcera-linear-refresh-"));
  try {
    const delivery = join(root, "delivery");
    mkdirSync(delivery);
    const snapshotPath = join(delivery, "linear-snapshot.json");
    writeFileSync(
      snapshotPath,
      JSON.stringify({
        generatedAt: "2026-07-14T00:00:00.000Z",
        issues: [
          {
            id: "PLA-942",
            parentId: null,
            sourceId: null,
            title: "Auth child",
            kind: "executable",
            labels: [],
            release: "R0",
            milestone: "Permissioned journeys ready",
            dependencies: [],
            owner: "Blake Rowley",
            reviewer: "Blake Rowley",
            estimate: 5,
            paths: ["convex/auth.ts"],
            tests: {
              success: "sign in",
              failure: "deny",
              recovery: "restore",
            },
            rollout: "preview",
            rollback: "prior commit",
            telemetry: "auth_result",
            proof: "reports/evidence/auth.json",
            sourceVersion: "v7.1.0a",
            sourceSection: "§6.1",
            outcome: "Authenticated session",
          },
        ],
        releases: [],
        linearFingerprint: {
          issues: [
            {
              identifier: "PLA-942",
              title: "Auth child",
              descriptionFingerprint: "00000000",
              updatedAt: "2026-07-14T00:00:00.000Z",
              estimate: 5,
              state: "Backlog",
              stateType: "backlog",
              labels: [],
              assignee: "Blake Rowley",
              team: "PLA",
              project: "Identity",
              milestone: "Permissioned journeys ready",
              parent: null,
              releases: ["R0"],
              relations: [],
            },
          ],
          releasePipelines: [],
          releases: [],
        },
      }),
    );
    writeFileSync(
      join(delivery, "release-plan.json"),
      JSON.stringify({ assignments: [] }),
    );
    writeFileSync(
      join(delivery, "runtime-gate-dependencies.json"),
      JSON.stringify({ dependencies: [] }),
    );
    const livePath = join(root, "live.json");
    writeFileSync(
      livePath,
      JSON.stringify({
        issues: [
          {
            id: "PLA-942",
            title: "Auth child",
            description: "Authenticated session",
            updatedAt: "2026-07-15T00:00:00.000Z",
            estimate: 5,
            status: "Backlog",
            statusType: "backlog",
            labels: [],
            assignee: "Blake Rowley",
            team: "PLA",
            project: "Identity",
            projectMilestone: { name: "Permissioned journeys ready" },
            parentId: "PLA-283",
            releases: [{ version: "R0" }],
          },
        ],
        releasePipelines: [],
        releases: [],
      }),
    );
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/refresh-linear-snapshot.ts",
        root,
        livePath,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const updated = JSON.parse(readFileSync(snapshotPath, "utf8"));
    assert.equal(updated.issues[0].parentId, "PLA-283");
    assert.equal(
      updated.linearFingerprint.issues[0].parent,
      "PLA-283",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
