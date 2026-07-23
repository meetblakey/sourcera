import { strict as assert } from "node:assert";
import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { LinearFingerprint } from "./lib/linear-live.js";

const SOURCE = {
  repository: "meetblakey/sourcera",
  commit: "a".repeat(40),
  ref: "refs/heads/main",
  runId: "12345",
  runAttempt: "2",
};

function issue(
  identifier: string,
  overrides: Partial<LinearFingerprint["issues"][number]> = {},
): LinearFingerprint["issues"][number] {
  const suffix = identifier === "PLA-1" ? "000000000001" : "000000000002";
  return {
    linearId: `00000000-0000-4000-8000-${suffix}`,
    identifier,
    title: `${identifier} live title`,
    descriptionFingerprint: createHash("sha256")
      .update(`${identifier} description`)
      .digest("hex"),
    updatedAt: "2026-07-15T15:00:00.000Z",
    estimate: identifier === "PLA-1" ? 5 : 2,
    priority: 2,
    archivedAt: null,
    state: "Backlog",
    stateType: "backlog",
    labels: ["Feature", "platform"],
    assignee: "Blake Rowley",
    assigneeId: "e7e65e19-33ee-445e-9be4-7e9e734a5463",
    team: "PLA",
    teamId: "11111111-1111-4111-8111-111111111111",
    projectId: "22222222-2222-4222-8222-222222222222",
    project: "Sourcera Production",
    milestoneId: "33333333-3333-4333-8333-333333333333",
    milestone: "Production evidence closed",
    parent: null,
    releases: ["R0"],
    relations: ["blocks:PLA-2:PLA-1"],
    ...overrides,
  };
}

function fingerprint(
  overrides: Partial<LinearFingerprint> = {},
): LinearFingerprint {
  return {
    issues: [issue("PLA-1"), issue("PLA-2")],
    releasePipelines: [
      {
        id: "44444444-4444-4444-8444-444444444444",
        name: "Sourcera Product Delivery",
        updatedAt: "2026-07-15T15:00:00.000Z",
        archivedAt: null,
        type: "scheduled",
        isProduction: true,
        teams: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            key: "PLA",
          },
        ],
        stages: [
          {
            id: "55555555-5555-4555-8555-555555555555",
            name: "Planned",
            type: "planned",
            archivedAt: null,
            position: 0,
            frozen: false,
          },
        ],
      },
    ],
    releases: [
      {
        id: "66666666-6666-4666-8666-666666666666",
        name: "First Defensible Evaluation",
        version: "R0",
        updatedAt: "2026-07-15T15:00:00.000Z",
        archivedAt: null,
        pipeline: "44444444-4444-4444-8444-444444444444",
        stage: "55555555-5555-4555-8555-555555555555",
        stageType: "planned",
      },
    ],
    projects: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Sourcera Production",
        descriptionFingerprint: "b".repeat(64),
        updatedAt: "2026-07-15T15:00:00.000Z",
        archivedAt: null,
      },
    ],
    projectMilestones: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Production evidence closed",
        descriptionFingerprint: "c".repeat(64),
        projectId: "22222222-2222-4222-8222-222222222222",
        project: "Sourcera Production",
        archivedAt: null,
      },
    ],
    ...overrides,
  };
}

function cloneFingerprint(
  value: LinearFingerprint = fingerprint(),
): LinearFingerprint {
  return structuredClone(value);
}

function plannedIssue(id: string, sourceId: string): Record<string, unknown> {
  return {
    id,
    parentId: "PLA-OLD",
    sourceId,
    title: `${id} prior title`,
    kind: "executable",
    labels: ["prior"],
    release: "R4",
    milestone: "Prior milestone",
    dependencies: ["F-OLD"],
    owner: "Prior owner",
    reviewer: "Required reviewer",
    estimate: 1,
    paths: ["planned/path.ts"],
    tests: {
      success: "planned success",
      failure: "planned failure",
      recovery: "planned recovery",
    },
    rollout: "planned rollout",
    rollback: "planned rollback",
    telemetry: "planned telemetry",
    proof: "planned-proof.json",
    sourceVersion: "v7.1.0a",
    sourceSection: "§1",
    outcome: "Planned outcome",
  };
}

interface FixtureOptions {
  fingerprint?: LinearFingerprint;
  mutateReceipt?: (receipt: Record<string, unknown>) => void;
  snapshot?: Record<string, unknown>;
}

function fixture(options: FixtureOptions = {}) {
  const root = mkdtempSync(join(tmpdir(), "sourcera-linear-overlay-"));
  const delivery = join(root, "delivery");
  mkdirSync(delivery);
  const snapshotPath = join(delivery, "linear-snapshot.json");
  const fingerprintPath = join(root, "linear-fingerprint.json");
  const receiptPath = join(root, "linear-capture-receipt.json");
  const scopePath = join(delivery, "linear-project-scope.json");
  const outPath = join(root, "linear-snapshot-candidate.json");
  const live = options.fingerprint ?? fingerprint();
  const snapshot = options.snapshot ?? {
    authority: { linear: "read-back after synchronized writes" },
    generatedAt: "2026-07-14T00:00:00.000Z",
    labels: [{ id: "label-1", name: "Feature", color: "#000000" }],
    users: [{ id: "user-1", name: "Blake" }],
    initiatives: [{ id: "initiative-1", name: "Sourcera" }],
    issues: [plannedIssue("PLA-1", "F-001"), plannedIssue("PLA-2", "F-002")],
    releases: [
      {
        id: "66666666-6666-4666-8666-666666666666",
        version: "R0",
        name: "Prior release name",
        pipeline: "Prior pipeline",
        stage: "Prior stage",
        startDate: "2026-07-01",
        targetDate: "2026-07-31",
        updatedAt: "2026-07-14T00:00:00.000Z",
      },
    ],
    projects: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Sourcera Production",
        priority: 2,
        targetDate: "2026-07-31",
        updatedAt: "2026-07-14T00:00:00.000Z",
      },
    ],
    milestones: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Production evidence closed",
        projectId: "22222222-2222-4222-8222-222222222222",
        project: "Sourcera Production",
        targetDate: "2026-07-30",
        updatedAt: null,
      },
    ],
    linearFingerprint: live,
  };
  const snapshotJson = `${JSON.stringify(snapshot, null, 2)}\n`;
  const fingerprintJson = `${JSON.stringify(live, null, 2)}\n`;
  const receipt: Record<string, unknown> = {
    schemaVersion: 1,
    capturedAt: "2026-07-15T15:01:00.000Z",
    fingerprintSha256: createHash("sha256")
      .update(fingerprintJson)
      .digest("hex"),
    source: { ...SOURCE },
  };
  options.mutateReceipt?.(receipt);
  writeFileSync(snapshotPath, snapshotJson);
  writeFileSync(fingerprintPath, fingerprintJson);
  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  writeFileSync(
    scopePath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        projects: [
          {
            id: "22222222-2222-4222-8222-222222222222",
            name: "Sourcera Production",
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  return {
    root,
    snapshotPath,
    snapshotJson,
    fingerprintPath,
    receiptPath,
    scopePath,
    outPath,
  };
}

function run(
  current: ReturnType<typeof fixture>,
  extraArgs: string[] = [],
  env: Partial<NodeJS.ProcessEnv> = {},
) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/linear-fingerprint-overlay.ts",
      "--snapshot",
      current.snapshotPath,
      "--fingerprint",
      current.fingerprintPath,
      "--receipt",
      current.receiptPath,
      "--linear-project-scope",
      current.scopePath,
      "--out",
      current.outPath,
      ...extraArgs,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        GITHUB_REPOSITORY: SOURCE.repository,
        GITHUB_SHA: SOURCE.commit,
        GITHUB_REF: SOURCE.ref,
        GITHUB_RUN_ID: SOURCE.runId,
        GITHUB_RUN_ATTEMPT: SOURCE.runAttempt,
        ...env,
      },
    },
  );
}

test("writes a receipt-bound candidate without changing the source snapshot", () => {
  const current = fixture();
  try {
    const result = run(current);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      readFileSync(current.snapshotPath, "utf8"),
      current.snapshotJson,
    );
    const candidate = JSON.parse(readFileSync(current.outPath, "utf8"));
    assert.equal(candidate.generatedAt, "2026-07-15T15:01:00.000Z");
    assert.deepEqual(candidate.linearCapture, {
      schemaVersion: 1,
      capturedAt: "2026-07-15T15:01:00.000Z",
      fingerprintSha256: createHash("sha256")
        .update(readFileSync(current.fingerprintPath))
        .digest("hex"),
      source: SOURCE,
    });
    assert.deepEqual(candidate.labels, [
      { id: "label-1", name: "Feature", color: "#000000" },
    ]);
    assert.deepEqual(candidate.users, [{ id: "user-1", name: "Blake" }]);
    assert.deepEqual(candidate.initiatives, [
      { id: "initiative-1", name: "Sourcera" },
    ]);
    assert.deepEqual(candidate.linearFingerprint, fingerprint());
    assert.deepEqual(candidate.issues[0], {
      ...plannedIssue("PLA-1", "F-001"),
      parentId: null,
      title: "PLA-1 live title",
      labels: ["Feature", "platform"],
      release: "R0",
      milestone: "Production evidence closed",
      dependencies: ["F-002"],
      owner: "Blake Rowley",
      estimate: 5,
    });
    assert.equal(candidate.projects[0].targetDate, "2026-07-31");
    assert.equal(candidate.projects[0].updatedAt, "2026-07-15T15:00:00.000Z");
    assert.equal(candidate.milestones[0].targetDate, "2026-07-30");
    assert.equal(candidate.releases[0].startDate, "2026-07-01");
    assert.equal(candidate.releases[0].pipeline, "Sourcera Product Delivery");
    assert.equal(candidate.releases[0].stage, "Planned");
    assert.equal(statSync(current.outPath).mode & 0o777, 0o600);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("fails closed unless all five fingerprint inventories are complete", () => {
  for (const inventory of [
    "issues",
    "releasePipelines",
    "releases",
    "projects",
    "projectMilestones",
  ] as const) {
    const incomplete = cloneFingerprint();
    incomplete[inventory] = [] as never;
    const current = fixture({ fingerprint: incomplete });
    try {
      const result = run(current);
      assert.equal(result.status, 1, `${inventory}: ${result.stderr}`);
      assert.match(result.stderr, new RegExp(`${inventory}.*required`, "i"));
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
      assert.equal(
        readFileSync(current.snapshotPath, "utf8"),
        current.snapshotJson,
      );
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  }
});

const exactInventoryCases = [
  {
    label: "project",
    snapshotKey: "projects",
    liveKey: "projects",
    id: "77777777-7777-4777-8777-777777777777",
    snapshotRow: {
      id: "77777777-7777-4777-8777-777777777777",
      name: "Additional project",
      priority: 2,
      targetDate: "2026-08-31",
      updatedAt: "2026-07-14T00:00:00.000Z",
    },
    liveRow: {
      id: "77777777-7777-4777-8777-777777777777",
      name: "Additional project",
      descriptionFingerprint: "d".repeat(64),
      updatedAt: "2026-07-15T15:00:00.000Z",
      archivedAt: null,
    },
  },
  {
    label: "milestone",
    snapshotKey: "milestones",
    liveKey: "projectMilestones",
    id: "88888888-8888-4888-8888-888888888888",
    snapshotRow: {
      id: "88888888-8888-4888-8888-888888888888",
      name: "Additional milestone",
      projectId: "22222222-2222-4222-8222-222222222222",
      project: "Sourcera Production",
      targetDate: "2026-08-30",
      updatedAt: null,
    },
    liveRow: {
      id: "88888888-8888-4888-8888-888888888888",
      name: "Additional milestone",
      descriptionFingerprint: "e".repeat(64),
      projectId: "22222222-2222-4222-8222-222222222222",
      project: "Sourcera Production",
      archivedAt: null,
    },
  },
  {
    label: "release",
    snapshotKey: "releases",
    liveKey: "releases",
    id: "99999999-9999-4999-8999-999999999999",
    snapshotRow: {
      id: "99999999-9999-4999-8999-999999999999",
      version: "R1",
      name: "Additional release",
      pipeline: "Sourcera Product Delivery",
      stage: "Planned",
      startDate: "2026-08-01",
      targetDate: "2026-08-31",
      updatedAt: "2026-07-14T00:00:00.000Z",
    },
    liveRow: {
      id: "99999999-9999-4999-8999-999999999999",
      name: "Additional release",
      version: "R1",
      updatedAt: "2026-07-15T15:00:00.000Z",
      archivedAt: null,
      pipeline: "44444444-4444-4444-8444-444444444444",
      stage: "55555555-5555-4555-8555-555555555555",
      stageType: "planned",
    },
  },
] as const;

for (const inventory of exactInventoryCases) {
  test(`rejects a baseline ${inventory.label} missing from the live inventory`, () => {
    const current = fixture();
    try {
      const snapshot = JSON.parse(readFileSync(current.snapshotPath, "utf8"));
      snapshot[inventory.snapshotKey].push(inventory.snapshotRow);
      writeFileSync(
        current.snapshotPath,
        `${JSON.stringify(snapshot, null, 2)}\n`,
      );
      const result = run(current);
      assert.equal(result.status, 1, result.stderr);
      assert.match(
        result.stderr,
        new RegExp(`${inventory.label}.*ID set.*missing.*${inventory.id}`, "i"),
      );
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  });

  test(`rejects a live ${inventory.label} absent from the baseline inventory`, () => {
    const live = cloneFingerprint();
    live[inventory.liveKey].push(inventory.liveRow as never);
    const current = fixture({ fingerprint: live });
    try {
      const result = run(current);
      assert.equal(result.status, 1, result.stderr);
      assert.match(
        result.stderr,
        new RegExp(
          `${inventory.label}.*ID set.*unexpected.*${inventory.id}`,
          "i",
        ),
      );
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  });
}

test("rejects incomplete issue identity, archive, and assignment fields", () => {
  const cases: Array<{
    name: string;
    mutate: (candidate: LinearFingerprint["issues"][number]) => void;
    error: RegExp;
  }> = [
    {
      name: "stable Linear ID",
      mutate: (candidate) => {
        candidate.linearId = null;
      },
      error: /stable Linear ID/i,
    },
    {
      name: "priority",
      mutate: (candidate) => {
        candidate.priority = 9;
      },
      error: /priority/i,
    },
    {
      name: "archive state",
      mutate: (candidate) => {
        candidate.archivedAt = "unavailable";
      },
      error: /archivedAt/i,
    },
    {
      name: "assignee identity",
      mutate: (candidate) => {
        candidate.assigneeId = null;
      },
      error: /assignee identity/i,
    },
    {
      name: "team identity",
      mutate: (candidate) => {
        candidate.teamId = "team-pla";
      },
      error: /team identity/i,
    },
    {
      name: "project identity",
      mutate: (candidate) => {
        candidate.projectId = null;
      },
      error: /project identity/i,
    },
    {
      name: "milestone identity",
      mutate: (candidate) => {
        candidate.milestoneId = null;
      },
      error: /milestone identity/i,
    },
  ];
  for (const testCase of cases) {
    const live = cloneFingerprint();
    testCase.mutate(live.issues[0]);
    const current = fixture({ fingerprint: live });
    try {
      const result = run(current);
      assert.equal(result.status, 1, `${testCase.name}: ${result.stderr}`);
      assert.match(result.stderr, testCase.error, testCase.name);
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  }
});

test("rejects Linear state, pipeline, and release-stage enum drift", () => {
  const cases: Array<(candidate: LinearFingerprint) => void> = [
    (candidate) => {
      candidate.issues[0].stateType = "mystery";
    },
    (candidate) => {
      candidate.releasePipelines[0].type = "mystery";
    },
    (candidate) => {
      candidate.releasePipelines[0].stages[0].type = "mystery";
      candidate.releases[0].stageType = "mystery";
    },
  ];
  for (const mutate of cases) {
    const live = cloneFingerprint();
    mutate(live);
    const current = fixture({ fingerprint: live });
    try {
      const result = run(current);
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /state type|pipeline.*type|stage.*type/i);
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  }
});

test("rejects conflicting stable team and assignee identities", () => {
  const cases: Array<(candidate: LinearFingerprint) => void> = [
    (candidate) => {
      candidate.issues[1].teamId = "12121212-1212-4121-8121-121212121212";
    },
    (candidate) => {
      candidate.issues[1].assignee = "Different display name";
    },
  ];
  for (const mutate of cases) {
    const live = cloneFingerprint();
    mutate(live);
    const current = fixture({ fingerprint: live });
    try {
      const result = run(current);
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /inconsistent (team|assignee) identity/i);
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  }
});

test("rejects duplicate pipeline team keys and cross-pipeline stage IDs", () => {
  const cases: Array<(candidate: LinearFingerprint) => void> = [
    (candidate) => {
      candidate.releasePipelines[0].teams.push({
        id: "13131313-1313-4131-8131-131313131313",
        key: "PLA",
      });
    },
    (candidate) => {
      candidate.releasePipelines.push({
        ...structuredClone(candidate.releasePipelines[0]),
        id: "14141414-1414-4141-8141-141414141414",
        name: "Secondary delivery pipeline",
      });
    },
  ];
  for (const mutate of cases) {
    const live = cloneFingerprint();
    mutate(live);
    const current = fixture({ fingerprint: live });
    try {
      const result = run(current);
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /duplicate.*team|stage.*duplicate/i);
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  }
});

test("rejects duplicate, orphaned, asymmetric, or multiply released topology", () => {
  const cases: Array<{
    name: string;
    mutate: (candidate: LinearFingerprint) => void;
  }> = [
    {
      name: "duplicate issue identifier",
      mutate: (candidate) => candidate.issues.push({ ...candidate.issues[0] }),
    },
    {
      name: "duplicate stable issue ID",
      mutate: (candidate) => {
        candidate.issues[1].linearId = candidate.issues[0].linearId;
      },
    },
    {
      name: "duplicate release pipeline",
      mutate: (candidate) =>
        candidate.releasePipelines.push({ ...candidate.releasePipelines[0] }),
    },
    {
      name: "duplicate release version",
      mutate: (candidate) =>
        candidate.releases.push({
          ...candidate.releases[0],
          id: "77777777-7777-4777-8777-777777777777",
        }),
    },
    {
      name: "duplicate milestone project/name",
      mutate: (candidate) =>
        candidate.projectMilestones.push({
          ...candidate.projectMilestones[0],
          id: "88888888-8888-4888-8888-888888888888",
        }),
    },
    {
      name: "missing parent endpoint",
      mutate: (candidate) => {
        candidate.issues[0].parent = "PLA-404";
      },
    },
    {
      name: "missing relation endpoint",
      mutate: (candidate) => {
        candidate.issues[0].relations = ["blocks:PLA-404:PLA-1"];
      },
    },
    {
      name: "asymmetric relation inventory",
      mutate: (candidate) => {
        candidate.issues[1].relations = [];
      },
    },
    {
      name: "multiple issue releases",
      mutate: (candidate) => {
        candidate.issues[0].releases = ["R0", "R1"];
      },
    },
    {
      name: "orphan release pipeline",
      mutate: (candidate) => {
        candidate.releases[0].pipeline = "99999999-9999-4999-8999-999999999999";
      },
    },
    {
      name: "orphan issue milestone",
      mutate: (candidate) => {
        candidate.issues[0].milestoneId =
          "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
      },
    },
  ];
  for (const testCase of cases) {
    const live = cloneFingerprint();
    testCase.mutate(live);
    const current = fixture({ fingerprint: live });
    try {
      const result = run(current);
      assert.equal(result.status, 1, `${testCase.name}: ${result.stderr}`);
      assert.match(
        result.stderr,
        /duplicate|orphan|missing|multiple|asymmetric|unknown/i,
        testCase.name,
      );
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  }
});

test("rejects raw Linear descriptions instead of copying connector objects", () => {
  const live = cloneFingerprint();
  Object.assign(live.issues[0], {
    description: "SECRET RAW LINEAR DESCRIPTION",
  });
  const current = fixture({ fingerprint: live });
  try {
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /raw Linear description/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects a raw Linear description already embedded in the snapshot input", () => {
  const current = fixture();
  try {
    const snapshot = JSON.parse(readFileSync(current.snapshotPath, "utf8"));
    snapshot.issues[0].description = "SECRET RAW LINEAR DESCRIPTION";
    writeFileSync(
      current.snapshotPath,
      `${JSON.stringify(snapshot, null, 2)}\n`,
    );
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /raw Linear description.*snapshot/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects unexpected connector-shaped fields from the exact fingerprint", () => {
  const live = cloneFingerprint();
  Object.assign(live.issues[0], { status: "Backlog" });
  const current = fixture({ fingerprint: live });
  try {
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /unexpected.*status.*Linear issue/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects missing project or milestone description fingerprints", () => {
  for (const mutate of [
    (candidate: LinearFingerprint) => {
      delete (candidate.projects[0] as Partial<
        LinearFingerprint["projects"][number]
      >).descriptionFingerprint;
    },
    (candidate: LinearFingerprint) => {
      candidate.projectMilestones[0].descriptionFingerprint = "short";
    },
  ]) {
    const live = cloneFingerprint();
    mutate(live);
    const current = fixture({ fingerprint: live });
    try {
      const result = run(current);
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /description fingerprint|Missing descriptionFingerprint/i);
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  }
});

test("rejects self-consistent receipts from a noncanonical source or run", () => {
  const cases: Array<Partial<typeof SOURCE>> = [
    { repository: "attacker/fork" },
    { commit: "not-a-commit" },
    { ref: "refs/heads/codex/linear-overlay" },
    { runId: "not-a-run" },
    { runAttempt: "0" },
  ];
  for (const override of cases) {
    const source = { ...SOURCE, ...override };
    const current = fixture({
      mutateReceipt: (receipt) => {
        receipt.source = source;
      },
    });
    try {
      const result = run(current, [], {
        GITHUB_REPOSITORY: source.repository,
        GITHUB_SHA: source.commit,
        GITHUB_REF: source.ref,
        GITHUB_RUN_ID: source.runId,
        GITHUB_RUN_ATTEMPT: source.runAttempt,
      });
      assert.equal(result.status, 1, JSON.stringify(source));
      assert.match(result.stderr, /canonical.*source|source.*invalid/i);
      assert.throws(() => readFileSync(current.outPath), /ENOENT/);
    } finally {
      rmSync(current.root, { recursive: true, force: true });
    }
  }
});

test("does not let caller flags override the current GitHub run binding", () => {
  const current = fixture();
  try {
    const result = run(current, ["--ref", "refs/heads/main"], {
      GITHUB_REF: "refs/heads/codex/linear-overlay",
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /run source|GITHUB_REF/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects unsupported overlay arguments", () => {
  const current = fixture();
  try {
    const result = run(current, ["--unexpected", "value"]);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /unsupported argument --unexpected/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects receipt fields outside the exact non-description proof schema", () => {
  const current = fixture({
    mutateReceipt: (receipt) => {
      receipt.issueDescriptions = ["SECRET RAW DESCRIPTION"];
    },
  });
  try {
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /unexpected.*issueDescriptions.*receipt/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects a live issue in the scoped project that is absent from the plan", () => {
  const live = cloneFingerprint();
  live.issues.push(
    issue("PLA-3", {
      linearId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      title: "PLA-3 live title",
      descriptionFingerprint: createHash("sha256")
        .update("PLA-3 description")
        .digest("hex"),
      relations: [],
    }),
  );
  const current = fixture({ fingerprint: live });
  try {
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /scoped Linear issue PLA-3.*absent.*plan/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("allows an unplanned canceled legacy issue outside the scoped projects", () => {
  const live = cloneFingerprint();
  live.issues.push(
    issue("PLA-99", {
      linearId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      title: "Canceled legacy issue",
      descriptionFingerprint: createHash("sha256")
        .update("canceled legacy description")
        .digest("hex"),
      state: "Canceled",
      stateType: "canceled",
      projectId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      project: "Retired legacy project",
      milestoneId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      milestone: "Retired legacy milestone",
      releases: [],
      relations: [],
    }),
  );
  const current = fixture({ fingerprint: live });
  try {
    const result = run(current);
    assert.equal(result.status, 0, result.stderr);
    const candidate = JSON.parse(readFileSync(current.outPath, "utf8"));
    assert.deepEqual(
      candidate.issues.map((row: { id: string }) => row.id),
      ["PLA-1", "PLA-2"],
    );
    assert.equal(
      candidate.linearFingerprint.issues.at(-1).identifier,
      "PLA-99",
    );
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("requires the candidate output to stay outside the repository", () => {
  const current = fixture();
  const repositoryOut = join(
    process.cwd(),
    `.linear-snapshot-candidate-${randomUUID()}.json`,
  );
  current.outPath = repositoryOut;
  try {
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /outside the repository/i);
    assert.throws(() => readFileSync(repositoryOut), /ENOENT/);
    assert.equal(
      readFileSync(current.snapshotPath, "utf8"),
      current.snapshotJson,
    );
  } finally {
    rmSync(repositoryOut, { force: true });
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects an external path whose existing symlink ancestor enters the repository", () => {
  const current = fixture();
  const link = join(current.root, "repository-link");
  const targetName = `.linear-snapshot-candidate-${randomUUID()}.json`;
  const repositoryTarget = join(process.cwd(), targetName);
  symlinkSync(process.cwd(), link, "dir");
  current.outPath = join(link, targetName);
  try {
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /outside the repository/i);
    assert.throws(() => readFileSync(repositoryTarget), /ENOENT/);
  } finally {
    rmSync(repositoryTarget, { force: true });
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("never overwrites an existing candidate target", () => {
  const current = fixture();
  writeFileSync(current.outPath, "existing-candidate\n", { mode: 0o600 });
  try {
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /EEXIST|already exists/i);
    assert.equal(readFileSync(current.outPath, "utf8"), "existing-candidate\n");
    assert.equal(
      readFileSync(current.snapshotPath, "utf8"),
      current.snapshotJson,
    );
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects duplicate requirement mappings in the planned snapshot", () => {
  const current = fixture();
  try {
    const snapshot = JSON.parse(readFileSync(current.snapshotPath, "utf8"));
    snapshot.issues[1].sourceId = "F-001";
    writeFileSync(
      current.snapshotPath,
      `${JSON.stringify(snapshot, null, 2)}\n`,
    );
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /duplicate.*source|source.*duplicate/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("rejects a planned issue mapped to a release outside R0 through R5", () => {
  const live = cloneFingerprint();
  live.releases[0].version = "Legacy";
  live.issues[0].releases = ["Legacy"];
  live.issues[1].releases = ["Legacy"];
  const current = fixture({ fingerprint: live });
  try {
    const result = run(current);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /planned Linear issue PLA-1.*release/i);
    assert.throws(() => readFileSync(current.outPath), /ENOENT/);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});
