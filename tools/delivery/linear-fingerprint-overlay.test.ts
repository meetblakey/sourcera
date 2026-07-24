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
import type { LinearProgramScope } from "./lib/linear-program-scope.js";

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
    dueDate: identifier === "PLA-1" ? "2026-08-01" : null,
    archivedAt: null,
    stateId: "12121212-1212-4121-8121-121212121212",
    state: "Backlog",
    stateType: "backlog",
    labels: ["Feature", "platform"],
    assignee: "Blake Rowley",
    assigneeId: "e7e65e19-33ee-445e-9be4-7e9e734a5463",
    team: "PLA",
    teamId: "11111111-1111-4111-8111-111111111111",
    cycleId: null,
    cycleNumber: null,
    cycle: null,
    projectId: "22222222-2222-4222-8222-222222222222",
    project: "Sourcera Production",
    milestoneId: "33333333-3333-4333-8333-333333333333",
    milestone: "Production evidence closed",
    parentLinearId: null,
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
        descriptionFingerprint: "d".repeat(64),
        version: "R0",
        commitSha: null,
        startDate: "2026-07-01",
        targetDate: "2026-07-31",
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
        statusId: "77777777-7777-4777-8777-777777777777",
        status: "Planned",
        statusType: "planned",
        priority: 2,
        lead: null,
        leadId: null,
        startDate: "2026-07-01",
        startDateResolution: null,
        targetDate: "2026-07-31",
        targetDateResolution: null,
      },
    ],
    projectMilestones: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Production evidence closed",
        descriptionFingerprint: "c".repeat(64),
        projectId: "22222222-2222-4222-8222-222222222222",
        project: "Sourcera Production",
        updatedAt: "2026-07-15T15:00:00.000Z",
        archivedAt: null,
        targetDate: "2026-07-30",
        status: "next",
      },
    ],
    cycles: [],
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
  programScope?: LinearProgramScope;
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
    initiatives: live.program
      ? [{
          id: "40404040-4040-4040-8040-404040404040",
          name: "Retired stale initiative",
          status: "Canceled",
          priority: 4,
          owner: "Stale owner",
          targetDate: "2025-01-01",
          updatedAt: "2025-01-01T00:00:00.000Z",
          staleOnly: true,
        }]
      : [{ id: "initiative-1", name: "Sourcera" }],
    issues: [plannedIssue("PLA-1", "F-001"), plannedIssue("PLA-2", "F-002")],
    releases: [
      {
        id: "66666666-6666-4666-8666-666666666666",
        version: "R0",
        name: "Prior release name",
        pipeline: "Prior pipeline",
        stage: "Prior stage",
        startDate: "2025-07-01",
        targetDate: "2025-07-31",
        staleOnly: true,
        updatedAt: "2026-07-14T00:00:00.000Z",
      },
    ],
    projects: options.programScope
      ? live.projects.map((project) => ({
        id: project.id,
        name: project.name,
        priority: 4,
        targetDate: "2025-07-31",
        state: "deprecated",
        updatedAt: "2026-07-14T00:00:00.000Z",
      }))
      : [
        {
          id: "22222222-2222-4222-8222-222222222222",
          name: "Sourcera Production",
          priority: 4,
          targetDate: "2025-07-31",
          state: "deprecated",
          updatedAt: "2026-07-14T00:00:00.000Z",
        },
      ],
    milestones: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Production evidence closed",
        projectId: "22222222-2222-4222-8222-222222222222",
        project: "Sourcera Production",
        targetDate: "2025-07-30",
        status: "stale",
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
        projects: options.programScope
          ? live.projects.map((project) => ({
            id: project.id,
            name: project.name,
          }))
          : [
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
  if (options.programScope) {
    writeFileSync(
      join(delivery, "linear-program-scope.json"),
      `${JSON.stringify(options.programScope, null, 2)}\n`,
    );
  }
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
      linearId: "00000000-0000-4000-8000-000000000001",
      parentLinearId: null,
      parentId: null,
      title: "PLA-1 live title",
      labels: ["Feature", "platform"],
      release: "R0",
      priority: 2,
      dueDate: "2026-08-01",
      stateId: "12121212-1212-4121-8121-121212121212",
      state: "Backlog",
      stateType: "backlog",
      teamId: "11111111-1111-4111-8111-111111111111",
      team: "PLA",
      cycleId: null,
      cycleNumber: null,
      cycle: null,
      projectId: "22222222-2222-4222-8222-222222222222",
      project: "Sourcera Production",
      milestoneId: "33333333-3333-4333-8333-333333333333",
      milestone: "Production evidence closed",
      dependencies: ["F-002"],
      owner: "Blake Rowley",
      ownerId: "e7e65e19-33ee-445e-9be4-7e9e734a5463",
      estimate: 5,
    });
    assert.deepEqual(candidate.projects, fingerprint().projects);
    assert.deepEqual(candidate.milestones, fingerprint().projectMilestones);
    assert.deepEqual(candidate.cycles, []);
    assert.deepEqual(candidate.releases[0], {
      id: "66666666-6666-4666-8666-666666666666",
      version: "R0",
      name: "First Defensible Evaluation",
      descriptionFingerprint: "d".repeat(64),
      commitSha: null,
      pipelineId: "44444444-4444-4444-8444-444444444444",
      pipeline: "Sourcera Product Delivery",
      stageId: "55555555-5555-4555-8555-555555555555",
      stage: "Planned",
      stageType: "planned",
      startDate: "2026-07-01",
      targetDate: "2026-07-31",
      updatedAt: "2026-07-15T15:00:00.000Z",
      archivedAt: null,
    });
    assert.equal(statSync(current.outPath).mode & 0o777, 0o600);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }
});

test("projects native cycle fields and rejects orphaned cycle assignments", () => {
  const live = cloneFingerprint();
  const cycleId = "abababab-abab-4bab-8bab-abababababab";
  live.cycles = [{
    id: cycleId,
    number: 12,
    name: "Foundation",
    descriptionFingerprint: "e".repeat(64),
    updatedAt: "2026-07-15T15:00:00.000Z",
    archivedAt: null,
    startsAt: "2026-07-14T00:00:00.000Z",
    endsAt: "2026-07-28T00:00:00.000Z",
    completedAt: null,
    team: "PLA",
    teamId: "11111111-1111-4111-8111-111111111111",
    inheritedFromId: null,
  }];
  Object.assign(live.issues[0], {
    cycleId,
    cycleNumber: 12,
    cycle: "Foundation",
  });
  const current = fixture({ fingerprint: live });
  try {
    const result = run(current);
    assert.equal(result.status, 0, result.stderr);
    const candidate = JSON.parse(readFileSync(current.outPath, "utf8"));
    assert.equal(candidate.issues[0].cycleId, cycleId);
    assert.equal(candidate.issues[0].cycleNumber, 12);
    assert.equal(candidate.issues[0].dueDate, "2026-08-01");
    assert.deepEqual(candidate.cycles, live.cycles);
  } finally {
    rmSync(current.root, { recursive: true, force: true });
  }

  const orphaned = cloneFingerprint(live);
  orphaned.issues[0].cycleId = "cdcdcdcd-cdcd-4dcd-8dcd-cdcdcdcdcdcd";
  const invalid = fixture({ fingerprint: orphaned });
  try {
    const result = run(invalid);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /cycle.*unknown|cycle.*orphan/i);
  } finally {
    rmSync(invalid.root, { recursive: true, force: true });
  }
});

test("replaces stale initiatives with the exact native program fingerprint", () => {
  const live = cloneFingerprint();
  const outcomes = Array.from({ length: 6 }, (_, index) => ({
    id: `20202020-2020-4020-8020-20202020202${index}`,
    name: `Outcome ${index + 1}`,
  }));
  const primaryInitiativeId = outcomes[0].id;
  const projectIds = outcomes.map((_, index) =>
    index === 0
      ? live.projects[0].id
      : `40404040-4040-4040-8040-40404040404${index}`
  );
  const baseProject = live.projects[0];
  live.projects = projectIds.map((id, index) => ({
    ...structuredClone(baseProject),
    id,
    name: index === 0 ? baseProject.name : `Project ${index + 1}`,
  }));
  const masterSpecSha256 = createHash("sha256")
    .update(readFileSync("Sourcera_Master_Spec.md"))
    .digest("hex");
  const uxDesignSha256 = createHash("sha256")
    .update(readFileSync("UX_Design_of_Sourcera.md"))
    .digest("hex");
  const initiative = (
    id: string,
    name: string,
  ): NonNullable<LinearFingerprint["program"]>["initiatives"][number] => ({
    id,
    name,
    updatedAt: "2026-07-15T15:00:00.000Z",
    archivedAt: null,
    owner: id === primaryInitiativeId ? "Blake Rowley" : null,
    ownerId: id === primaryInitiativeId
      ? "e7e65e19-33ee-445e-9be4-7e9e734a5463"
      : null,
    status: "Planned",
    priority: 2,
    health: id === primaryInitiativeId ? "onTrack" : null,
    healthUpdatedAt: id === primaryInitiativeId
      ? "2026-07-15T14:00:00.000Z"
      : null,
    targetDate: id === primaryInitiativeId ? "2026-12-31" : null,
    targetDateResolution: id === primaryInitiativeId ? "quarter" : null,
    parentInitiativeId: null,
    parentInitiative: null,
  });
  const documentId = "30303030-3030-4030-8030-303030303030";
  const teamId = "477029a4-9e0a-44ca-9816-5a169b6baafa";
  const documentFingerprint = "f".repeat(64);
  live.program = {
    initiatives: outcomes.map((outcome) =>
      initiative(outcome.id, outcome.name)
    ),
    documents: [{
      id: documentId,
      title: "Planning authority",
      updatedAt: "2026-07-15T15:00:00.000Z",
      archivedAt: null,
      initiativeId: null,
      projectId: null,
      teamId,
      issueId: null,
      contentFingerprint: documentFingerprint,
      sectionHeadings: ["Binding authority"],
      sourceFingerprints: { masterSpecSha256, uxDesignSha256 },
    }],
    projectInitiatives: projectIds.map((projectId, index) => ({
      projectId,
      initiativeIds: [outcomes[index].id],
    })),
  };
  const programScope: LinearProgramScope = {
    schemaVersion: 2,
    outcomeInitiatives: outcomes,
    planningDocument: {
      id: documentId,
      title: "Planning authority",
      contentFingerprint: documentFingerprint,
      initiativeId: null,
      projectId: null,
      teamId,
      issueId: null,
      requiredSections: ["Binding authority"],
    },
    projectDescriptionFingerprints: projectIds.map((projectId, index) => ({
      projectId,
      descriptionFingerprint: live.projects[index].descriptionFingerprint,
      milestones: index === 0
        ? [{
          milestoneId: live.projectMilestones[0].id,
          descriptionFingerprint:
            live.projectMilestones[0].descriptionFingerprint,
        }]
        : [],
    })),
    projectInitiatives: projectIds.map((projectId, index) => ({
      projectId,
      initiativeIds: [outcomes[index].id],
    })),
  };
  const current = fixture({ fingerprint: live, programScope });
  try {
    const result = run(current);
    assert.equal(result.status, 0, result.stderr);
    const candidate = JSON.parse(readFileSync(current.outPath, "utf8"));
    assert.deepEqual(candidate.initiatives, live.program.initiatives);
    assert.equal(candidate.initiatives[0].owner, "Blake Rowley");
    assert.equal(candidate.initiatives[0].health, "onTrack");
    assert.equal(candidate.initiatives[0].targetDate, "2026-12-31");
    assert.equal(
      Object.hasOwn(candidate.initiatives[0], "staleOnly"),
      false,
    );
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
      statusId: "abababab-abab-4bab-8bab-abababababab",
      status: "Planned",
      statusType: "planned",
      priority: 2,
      lead: null,
      leadId: null,
      startDate: null,
      startDateResolution: null,
      targetDate: "2026-08-31",
      targetDateResolution: null,
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
      updatedAt: "2026-07-15T15:00:00.000Z",
      archivedAt: null,
      targetDate: "2026-08-30",
      status: "unstarted",
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
      descriptionFingerprint: "f".repeat(64),
      version: "R1",
      commitSha: null,
      startDate: "2026-08-01",
      targetDate: "2026-08-31",
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
        candidate.issues[0].parentLinearId =
          "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
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
      stateId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
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
