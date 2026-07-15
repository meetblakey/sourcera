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

function refreshFixture(
  liveIssues: Array<Record<string, unknown>>,
  options: {
    priorRelease?: string | null;
    repositoryRelease?: string;
    priorFingerprintReleases?: string[];
    priorRelations?: string[];
    missingTrackedIssueIds?: string[];
    sourceIds?: Array<string | null>;
    priorDependencies?: string[][];
    runtimeDependencies?: Array<{
      requirementId: string;
      dependencies: string[];
    }>;
    omitPriorFingerprintIds?: string[];
  } = {},
) {
  const root = mkdtempSync(join(tmpdir(), "sourcera-linear-refresh-"));
  const delivery = join(root, "delivery");
  mkdirSync(delivery);
  const snapshotPath = join(delivery, "linear-snapshot.json");
  const trackedIssueIds = [
    ...liveIssues.map((issue) => {
      const id = issue.id;
      if (typeof id !== "string") {
        throw new TypeError("issue id must be a string");
      }
      return id;
    }),
    ...(options.missingTrackedIssueIds ?? []),
  ];
  const snapshotIssues = trackedIssueIds.map((id, index) => ({
    id,
    parentId: null,
    sourceId: options.sourceIds && index in options.sourceIds
      ? options.sourceIds[index]
      : `F-${String(index + 1).padStart(3, "0")}`,
    title: `Prior ${id}`,
    kind: "executable",
    labels: ["prior"],
    release: options.priorRelease ?? "R2",
    milestone: "Prior milestone",
    dependencies: options.priorDependencies?.[index] ?? [],
    owner: "Prior owner",
    reviewer: "Reviewer",
    estimate: 1,
    paths: ["prior/path.ts"],
    tests: { success: "success", failure: "failure", recovery: "recovery" },
    rollout: "rollout",
    rollback: "rollback",
    telemetry: "telemetry",
    proof: "proof.json",
    sourceVersion: "v7.1.0a",
    sourceSection: "§1",
    outcome: "Outcome",
  }));
  const original = JSON.stringify({
    generatedAt: "2026-07-14T00:00:00.000Z",
    issues: snapshotIssues,
    releases: [],
    linearFingerprint: {
      issues: trackedIssueIds
        .filter((id) => !options.omitPriorFingerprintIds?.includes(id))
        .map((id) => ({
          identifier: id,
          title: `Prior ${id}`,
          descriptionFingerprint: "00000000",
          updatedAt: "2026-07-14T00:00:00.000Z",
          estimate: 1,
          state: "Backlog",
          stateType: "backlog",
          labels: ["prior"],
          assignee: "Prior owner",
          team: "PLA",
          project: "Prior project",
          milestone: "Prior milestone",
          parent: null,
          releases: options.priorFingerprintReleases ?? ["R3"],
          relations: options.priorRelations ?? [],
        })),
      releasePipelines: [],
      releases: [],
    },
  });
  writeFileSync(snapshotPath, original);
  writeFileSync(
    join(delivery, "release-plan.json"),
    JSON.stringify({
      assignments: snapshotIssues.map((issue) => ({
        requirementId: issue.sourceId,
        release: options.repositoryRelease ?? "R4",
      })),
    }),
  );
  writeFileSync(
    join(delivery, "runtime-gate-dependencies.json"),
    JSON.stringify({ dependencies: options.runtimeDependencies ?? [] }),
  );
  const livePath = join(root, "live.json");
  writeFileSync(
    livePath,
    JSON.stringify({
      issues: liveIssues.map((issue) => ({
        relations: {
          blocks: [],
          blockedBy: [],
          relatedTo: [],
          duplicateOf: null,
        },
        ...issue,
      })),
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
  const contents = readFileSync(snapshotPath, "utf8");
  const updated = result.status === 0
    ? JSON.parse(contents)
    : null;
  rmSync(root, { recursive: true, force: true });
  return { result, updated, original, contents };
}

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
            relations: {
              blocks: [],
              blockedBy: [],
              relatedTo: [],
              duplicateOf: null,
            },
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

test("refresh uses only current live release and relations", () => {
  const { result, updated } = refreshFixture(
    [
      {
        id: "PLA-1",
        title: "Current title",
        description: "Current full description",
        updatedAt: "2026-07-15T00:00:00.000Z",
        estimate: { value: 8 },
        status: "In Progress",
        statusType: "started",
        labels: ["seller", "feature"],
        assignee: "Current owner",
        team: "PLA",
        project: "Current project",
        projectMilestone: { name: "Current milestone" },
        parentId: "PLA-0",
        releases: [{ version: "preview" }],
        relations: {
          blocks: [{ id: "PLA-9" }],
          blockedBy: [],
          relatedTo: [],
          duplicateOf: null,
        },
      },
      {
        id: "PLA-9",
        title: "Captured endpoint",
        description: "Captured endpoint",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
      },
    ],
    {
      priorRelease: "R2",
      repositoryRelease: "R4",
      priorFingerprintReleases: ["R3"],
      priorRelations: ["blocks:PLA-0:PLA-1"],
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(updated.issues[0].release, null);
  assert.deepEqual(updated.linearFingerprint.issues[0].releases, []);
  assert.equal(updated.issues[0].owner, "Current owner");
  assert.equal(updated.issues[0].estimate, 8);
  assert.equal(updated.issues[0].parentId, "PLA-0");
  assert.deepEqual(updated.linearFingerprint.issues[0].relations, [
    "blocks:PLA-1:PLA-9",
  ]);
});

test("refresh canonicalizes and deduplicates symmetric live relations", () => {
  const { result, updated } = refreshFixture([
    {
      id: "PLA-217",
      title: "Shells",
      description: "Shell foundation",
      updatedAt: "2026-07-15T00:00:00.000Z",
      status: "Backlog",
      statusType: "backlog",
      relations: {
        blocks: [],
        blockedBy: [],
        relatedTo: [{ id: "PLA-282" }, { id: "PLA-282" }],
        duplicateOf: null,
      },
    },
    {
      id: "PLA-282",
      title: "Convex",
      description: "Convex foundation",
      updatedAt: "2026-07-15T00:00:00.000Z",
      status: "Backlog",
      statusType: "backlog",
      relations: {
        blocks: [],
        blockedBy: [],
        relatedTo: [{ id: "PLA-217" }],
        duplicateOf: null,
      },
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    updated.linearFingerprint.issues.map(
      (issue: { relations: string[] }) => issue.relations,
    ),
    [
      ["related:PLA-217:PLA-282"],
      ["related:PLA-217:PLA-282"],
    ],
  );
});

test("refresh derives source dependencies from live blocking relations", () => {
  const { result, updated } = refreshFixture([
    {
      id: "PLA-1",
      title: "Dependent",
      description: "Dependent outcome",
      updatedAt: "2026-07-15T00:00:00.000Z",
      status: "Backlog",
      statusType: "backlog",
      relations: {
        blocks: [],
        blockedBy: [{ id: "PLA-2" }],
        relatedTo: [],
        duplicateOf: null,
      },
    },
    {
      id: "PLA-2",
      title: "Prerequisite",
      description: "Prerequisite outcome",
      updatedAt: "2026-07-15T00:00:00.000Z",
      status: "Backlog",
      statusType: "backlog",
      relations: {
        blocks: [{ id: "PLA-1" }],
        blockedBy: [],
        relatedTo: [],
        duplicateOf: null,
      },
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(updated.issues[0].dependencies, ["F-002"]);
  assert.deepEqual(updated.issues[1].dependencies, []);
});

test("refresh does not let stored dependencies mask missing live blockers", () => {
  const { result, updated } = refreshFixture(
    [
      {
        id: "PLA-1",
        title: "Dependent",
        description: "Dependent outcome",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
      },
      {
        id: "PLA-2",
        title: "Prerequisite",
        description: "Prerequisite outcome",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
      },
    ],
    { priorDependencies: [["F-002"], []] },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(updated.issues[0].dependencies, []);
});

test("refresh preserves dependencies without a Linear issue", () => {
  const { result, updated } = refreshFixture(
    [
      {
        id: "PLA-1",
        title: "Dependent",
        description: "Dependent outcome",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
      },
    ],
    { priorDependencies: [["F-PROOF"]] },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(updated.issues[0].dependencies, ["F-PROOF"]);
});

test("refresh rejects a source issue blocker without a source mapping", () => {
  const { result, updated } = refreshFixture(
    [
      {
        id: "PLA-1",
        title: "Dependent",
        description: "Dependent outcome",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        relations: {
          blocks: [],
          blockedBy: [{ id: "PLA-2" }],
          relatedTo: [],
          duplicateOf: null,
        },
      },
      {
        id: "PLA-2",
        title: "Unmapped blocker",
        description: "Structural outcome",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        relations: {
          blocks: [{ id: "PLA-1" }],
          blockedBy: [],
          relatedTo: [],
          duplicateOf: null,
        },
      },
    ],
    { sourceIds: ["F-001", null] },
  );

  assert.equal(updated, null);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /blocker PLA-2 has no source mapping/);
});

test("refresh adds runtime dependencies after complete live relations", () => {
  const { result, updated } = refreshFixture(
    [
      {
        id: "PLA-1",
        title: "Runtime gate",
        description: "Gate",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        relations: {
          blocks: [],
          blockedBy: [],
          relatedTo: [{ id: "PLA-2" }],
          duplicateOf: null,
        },
      },
      {
        id: "PLA-2",
        title: "Prerequisite",
        description: "Prerequisite",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        relations: {
          blocks: [],
          blockedBy: [],
          relatedTo: [{ id: "PLA-1" }],
          duplicateOf: null,
        },
      },
    ],
    {
      sourceIds: ["RG:R0-001", "F-001"],
      runtimeDependencies: [
        { requirementId: "RG:R0-001", dependencies: ["F-001"] },
      ],
    },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    updated.linearFingerprint.issues.map(
      (issue: { relations: string[] }) => issue.relations,
    ),
    [
      ["blocks:PLA-2:PLA-1", "related:PLA-1:PLA-2"],
      ["blocks:PLA-2:PLA-1", "related:PLA-1:PLA-2"],
    ],
  );
});

test("refresh places duplicate edges on both captured endpoints", () => {
  const { result, updated } = refreshFixture([
    {
      id: "PLA-1",
      title: "Duplicate",
      description: "Duplicate issue",
      updatedAt: "2026-07-15T00:00:00.000Z",
      status: "Backlog",
      statusType: "backlog",
      relations: {
        blocks: [],
        blockedBy: [],
        relatedTo: [],
        duplicateOf: { id: "PLA-2" },
      },
    },
    {
      id: "PLA-2",
      title: "Canonical",
      description: "Canonical issue",
      updatedAt: "2026-07-15T00:00:00.000Z",
      status: "Backlog",
      statusType: "backlog",
    },
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    updated.linearFingerprint.issues.map(
      (issue: { relations: string[] }) => issue.relations,
    ),
    [
      ["duplicate:PLA-1:PLA-2"],
      ["duplicate:PLA-1:PLA-2"],
    ],
  );
});

test("refresh rejects a live relation to an uncaptured endpoint", () => {
  const { result, original, contents } = refreshFixture([
    {
      id: "PLA-1",
      title: "Captured",
      description: "Captured issue",
      updatedAt: "2026-07-15T00:00:00.000Z",
      status: "Backlog",
      statusType: "backlog",
      relations: {
        blocks: [{ id: "PLA-404" }],
        blockedBy: [],
        relatedTo: [],
        duplicateOf: null,
      },
    },
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /relation.*PLA-404.*not captured/i);
  assert.equal(contents, original);
});

test("refresh removes a prior relation absent from live truth", () => {
  const { result, updated } = refreshFixture(
    [
      {
        id: "PLA-1",
        title: "Current",
        description: "Current issue",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
      },
    ],
    { priorRelations: ["blocks:PLA-9:PLA-1"] },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(updated.linearFingerprint.issues[0].relations, []);
});

test("refresh derives an unseen issue team key from its identifier", () => {
  const { result, updated } = refreshFixture(
    [
      {
        id: "BUY-99",
        title: "New issue",
        description: "New issue",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        team: "Buyer Experience",
      },
    ],
    { omitPriorFingerprintIds: ["BUY-99"] },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(updated.linearFingerprint.issues[0].team, "BUY");
});

test("refresh requires an explicit team key when it cannot derive one", () => {
  const missing = refreshFixture(
    [
      {
        id: "external",
        title: "New issue",
        description: "New issue",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        team: "Platform",
      },
    ],
    { omitPriorFingerprintIds: ["external"] },
  );
  assert.equal(missing.result.status, 1);
  assert.match(missing.result.stderr, /external.*team key/i);
  assert.equal(missing.contents, missing.original);

  const explicit = refreshFixture(
    [
      {
        id: "external",
        title: "New issue",
        description: "New issue",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        team: "Platform",
        teamKey: "PLA",
      },
    ],
    { omitPriorFingerprintIds: ["external"] },
  );
  assert.equal(explicit.result.status, 0, explicit.result.stderr);
  assert.equal(explicit.updated.linearFingerprint.issues[0].team, "PLA");
});

test("refresh rejects a team key that conflicts with the issue identifier", () => {
  const { result, original, contents } = refreshFixture(
    [
      {
        id: "BUY-99",
        title: "New issue",
        description: "New issue",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        team: "Buyer Experience",
        teamKey: "PLA",
      },
    ],
    { omitPriorFingerprintIds: ["BUY-99"] },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /BUY-99.*team key.*BUY/i);
  assert.equal(contents, original);
});

for (const [name, relations] of [
  ["absent", undefined],
  [
    "unparseable",
    { blocks: "PLA-2", blockedBy: [], relatedTo: [], duplicateOf: null },
  ],
] as const) {
  test(`refresh rejects ${name} live relations before writing`, () => {
    const { result, original, contents } = refreshFixture([
      {
        id: "PLA-1",
        title: "Current title",
        description: "Description",
        updatedAt: "2026-07-15T00:00:00.000Z",
        status: "Backlog",
        statusType: "backlog",
        relations,
      },
    ]);

    assert.equal(result.status, 1);
    assert.match(result.stderr, /PLA-1.*relations.*invalid/i);
    assert.equal(contents, original);
  });
}

test("refresh rejects multiple current R0-R5 releases", () => {
  const { result } = refreshFixture([
    {
      id: "PLA-1",
      title: "Current title",
      description: "Description",
      updatedAt: "2026-07-15T00:00:00.000Z",
      estimate: 3,
      status: "Backlog",
      statusType: "backlog",
      labels: [],
      assignee: null,
      team: "PLA",
      project: null,
      projectMilestone: null,
      parentId: null,
      releases: [{ version: "R0" }, { version: "R1" }],
    },
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /multiple R0-R5 releases.*PLA-1/i);
});

test("refresh rejects a missing tracked issue before writing", () => {
  const { result, original, contents } = refreshFixture(
    [
      {
        id: "PLA-1",
        title: "Current title",
        description: "Description",
        updatedAt: "2026-07-15T00:00:00.000Z",
        estimate: 3,
        status: "Backlog",
        statusType: "backlog",
        labels: [],
        assignee: null,
        team: "PLA",
        project: null,
        projectMilestone: null,
        parentId: null,
        releases: [{ version: "R0" }],
      },
    ],
    { missingTrackedIssueIds: ["PLA-2"] },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /tracked.*PLA-2.*missing.*live/i);
  assert.equal(contents, original);
});

test("refresh fingerprints the complete description deterministically", () => {
  const run = (description: string) => refreshFixture([
    {
      id: "PLA-2",
      title: "Second",
      description,
      updatedAt: "2026-07-15T02:00:00.000Z",
      estimate: 2,
      status: "Done",
      statusType: "completed",
      labels: ["z", "a"],
      assignee: null,
      team: "PLA",
      project: null,
      projectMilestone: null,
      parentId: null,
      releases: [{ version: "R1" }],
    },
    {
      id: "PLA-1",
      title: "First",
      description: "same",
      updatedAt: "2026-07-15T01:00:00.000Z",
      estimate: 1,
      status: "Backlog",
      statusType: "backlog",
      labels: ["z", "a"],
      assignee: "Owner",
      team: "PLA",
      project: null,
      projectMilestone: null,
      parentId: null,
      releases: [{ version: "R0" }],
    },
  ]);
  const first = run(`${"a".repeat(400)}x`);
  const second = run(`${"a".repeat(400)}y`);
  const repeated = run(`${"a".repeat(400)}x`);
  const grinning = run("😀");
  const beaming = run("😁");

  assert.equal(first.result.status, 0, first.result.stderr);
  assert.equal(second.result.status, 0, second.result.stderr);
  assert.equal(repeated.result.status, 0, repeated.result.stderr);
  assert.equal(grinning.result.status, 0, grinning.result.stderr);
  assert.equal(beaming.result.status, 0, beaming.result.stderr);
  assert.deepEqual(
    first.updated.linearFingerprint.issues.map(
      (issue: Record<string, unknown>) => issue.identifier,
    ),
    ["PLA-1", "PLA-2"],
  );
  assert.deepEqual(first.updated.linearFingerprint.issues[0].labels, ["a", "z"]);
  assert.notEqual(
    first.updated.linearFingerprint.issues[1].descriptionFingerprint,
    second.updated.linearFingerprint.issues[1].descriptionFingerprint,
  );
  assert.equal(
    first.updated.linearFingerprint.issues[1].descriptionFingerprint,
    repeated.updated.linearFingerprint.issues[1].descriptionFingerprint,
  );
  assert.notEqual(
    grinning.updated.linearFingerprint.issues[1].descriptionFingerprint,
    beaming.updated.linearFingerprint.issues[1].descriptionFingerprint,
  );
});
