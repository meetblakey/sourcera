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

interface FixtureOptions {
  dispositions?: Array<{ requirementId: string; disposition: string }>;
  featureRepairs?: Array<{
    requirementId: string;
    dependencies: string[];
    rationale: string;
    sourceDoc: string;
    sourceVersion: string;
    sourceSection: string;
  }>;
  inventoryRows?: string[];
  runtimeDependencies?: Array<{
    requirementId: string;
    dependencies: string[];
  }>;
  assignments?: Array<{
    requirementId: string;
    release: string;
    rationale: string;
  }>;
  mappings?: Array<{ id: string; sourceId: string | null }>;
  fingerprintIssues?: Array<Record<string, unknown>>;
  extraReleases?: Array<Record<string, unknown>>;
}

function liveIssue(
  identifier: string,
  releases: string[] = [],
  relations: string[] = [],
): Record<string, unknown> {
  return {
    identifier,
    title: identifier,
    descriptionFingerprint: "0".repeat(64),
    updatedAt: `2026-07-15T00:00:0${identifier.length % 10}.000Z`,
    estimate: 1,
    state: "Backlog",
    stateType: "backlog",
    labels: [],
    assignee: null,
    team: "PLA",
    projectId: null,
    project: null,
    milestoneId: null,
    milestone: null,
    parent: null,
    releases,
    relations,
  };
}

function fixture(options: FixtureOptions = {}) {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-linear-sync-plan-"));
  const inventory = join(dir, "inventory.md");
  const dispositions = join(dir, "dispositions.json");
  const featureDependencies = join(dir, "feature-dependencies.json");
  const runtimeDependencies = join(dir, "runtime-dependencies.json");
  const releasePlan = join(dir, "release-plan.json");
  const snapshot = join(dir, "linear-snapshot.json");
  const out = join(dir, "plan.json");

  writeFileSync(
    inventory,
    [
      "| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |",
      "|---|---|---|---|---|---|---|---|---|",
      ...(options.inventoryRows ?? [
        "| F-001 | Journey | journey | §1 | — | master_spec | v7.1.0a | Journey | F-002 |",
        "| F-002 | Foundation | control | §2 | — | master_spec | v7.1.0a | Foundation | — |",
      ]),
      "",
    ].join("\n"),
  );
  writeFileSync(
    dispositions,
    JSON.stringify({ overrides: options.dispositions ?? [] }),
  );
  writeFileSync(
    featureDependencies,
    JSON.stringify({ schemaVersion: 1, repairs: options.featureRepairs ?? [] }),
  );
  writeFileSync(
    runtimeDependencies,
    JSON.stringify({
      dependencies: options.runtimeDependencies ?? [
        { requirementId: "RG:journey-proof", dependencies: ["F-001"] },
      ],
    }),
  );
  writeFileSync(
    releasePlan,
    JSON.stringify({
      assignments: options.assignments ?? [
        { requirementId: "F-001", release: "R0", rationale: "journey" },
        { requirementId: "F-002", release: "R0", rationale: "foundation" },
        {
          requirementId: "RG:journey-proof",
          release: "R0",
          rationale: "runtime follows journey",
        },
      ],
    }),
  );

  const related = "related:PLA-1:PLA-X";
  writeFileSync(
    snapshot,
    JSON.stringify({
      issues: options.mappings ?? [
        { id: "PLA-1", sourceId: "F-001" },
        { id: "PLA-2", sourceId: "F-002" },
        { id: "PLA-3", sourceId: "RG:journey-proof" },
      ],
      linearFingerprint: {
        issues: options.fingerprintIssues ?? [
          liveIssue("PLA-1", ["R1"], [related]),
          liveIssue("PLA-2", ["R0"]),
          liveIssue("PLA-3", ["R0"]),
          liveIssue("PLA-X", [], [related]),
        ],
        releasePipelines: [],
        releases: [
          ...["R0", "R1", "R2", "R3", "R4", "R5"].map(
            (version) => ({
              id: `release-${version.toLowerCase()}`,
              name: version,
              version,
              updatedAt: "2026-07-15T00:00:00.000Z",
              pipeline: "pipeline",
              stage: "stage",
              stageType: "active",
            }),
          ),
          ...(options.extraReleases ?? []),
        ],
        projects: [],
        projectMilestones: [],
      },
    }),
  );

  return {
    dir,
    inventory,
    dispositions,
    featureDependencies,
    runtimeDependencies,
    releasePlan,
    snapshot,
    out,
  };
}

function run(
  value: ReturnType<typeof fixture>,
  out = value.out,
) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/plan-linear-sync.ts",
      "--inventory",
      value.inventory,
      "--dispositions",
      value.dispositions,
      "--feature-dependencies",
      value.featureDependencies,
      "--runtime-dependencies",
      value.runtimeDependencies,
      "--release-plan",
      value.releasePlan,
      "--snapshot",
      value.snapshot,
      "--out",
      out,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
}

test("plans only release drift and missing canonical blocks with exact rollback", () => {
  const value = fixture();
  try {
    const first = run(value);
    assert.equal(first.status, 0, first.stderr);
    const plan = JSON.parse(readFileSync(value.out, "utf8"));

    assert.deepEqual(plan.releaseChanges, [
      {
        issueId: "PLA-1",
        sourceId: "F-001",
        before: ["R1"],
        after: ["R0"],
        beforeReleaseIds: ["release-r1"],
        afterReleaseIds: ["release-r0"],
      },
    ]);
    assert.deepEqual(plan.blockAdditions, [
      {
        relation: "blocks:PLA-1:PLA-3",
        prerequisiteIssueId: "PLA-1",
        prerequisiteSourceId: "F-001",
        dependentIssueId: "PLA-3",
        dependentSourceId: "RG:journey-proof",
      },
      {
        relation: "blocks:PLA-2:PLA-1",
        prerequisiteIssueId: "PLA-2",
        prerequisiteSourceId: "F-002",
        dependentIssueId: "PLA-1",
        dependentSourceId: "F-001",
      },
    ]);
    assert.deepEqual(plan.expectedRelationsByIssue, [
      {
        issueId: "PLA-1",
        relations: [
          "blocks:PLA-1:PLA-3",
          "blocks:PLA-2:PLA-1",
          "related:PLA-1:PLA-X",
        ],
      },
      { issueId: "PLA-2", relations: ["blocks:PLA-2:PLA-1"] },
      { issueId: "PLA-3", relations: ["blocks:PLA-1:PLA-3"] },
    ]);
    assert.deepEqual(plan.guards, {
      issues: [
        { issueId: "PLA-1", updatedAt: "2026-07-15T00:00:05.000Z" },
        { issueId: "PLA-2", updatedAt: "2026-07-15T00:00:05.000Z" },
        { issueId: "PLA-3", updatedAt: "2026-07-15T00:00:05.000Z" },
      ],
    });
    assert.deepEqual(plan.rollback.releaseChanges, [
      {
        issueId: "PLA-1",
        sourceId: "F-001",
        before: ["R0"],
        after: ["R1"],
        beforeReleaseIds: ["release-r0"],
        afterReleaseIds: ["release-r1"],
      },
    ]);
    assert.deepEqual(plan.rollback.blockRemovals, plan.blockAdditions);
    assert.deepEqual(plan.rollback.expectedRelationsByIssue, [
      { issueId: "PLA-1", relations: ["related:PLA-1:PLA-X"] },
      { issueId: "PLA-2", relations: [] },
      { issueId: "PLA-3", relations: [] },
    ]);
    assert.deepEqual(Object.keys(plan.inputSha256), [
      "dispositions",
      "featureDependencies",
      "inventory",
      "releasePlan",
      "runtimeDependencies",
      "snapshot",
    ]);
    for (const digest of Object.values(plan.inputSha256)) {
      assert.match(String(digest), /^[a-f0-9]{64}$/);
    }

    const secondOut = join(value.dir, "second.json");
    const second = run(value, secondOut);
    assert.equal(second.status, 0, second.stderr);
    assert.equal(readFileSync(secondOut, "utf8"), readFileSync(value.out, "utf8"));
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("emits no mutations when canonical releases and blocks already match", () => {
  const firstBlock = "blocks:PLA-1:PLA-3";
  const secondBlock = "blocks:PLA-2:PLA-1";
  const value = fixture({
    fingerprintIssues: [
      liveIssue("PLA-1", ["R0"], [firstBlock, secondBlock]),
      liveIssue("PLA-2", ["R0"], [secondBlock]),
      liveIssue("PLA-3", ["R0"], [firstBlock]),
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(readFileSync(value.out, "utf8"));
    assert.deepEqual(plan.releaseChanges, []);
    assert.deepEqual(plan.blockAdditions, []);
    assert.deepEqual(plan.expectedRelationsByIssue, []);
    assert.deepEqual(plan.guards, { issues: [] });
    assert.deepEqual(plan.rollback, {
      releaseChanges: [],
      blockRemovals: [],
      expectedRelationsByIssue: [],
    });
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("filters proof-only features and their dependencies like the release planner", () => {
  const value = fixture({
    inventoryRows: [
      "| F-001 | Journey | journey | §1 | — | master_spec | v7.1.0a | Journey | F-002 |",
      "| F-002 | Proof source | control | §2 | — | master_spec | v7.1.0a | Proof | — |",
    ],
    dispositions: [{ requirementId: "F-002", disposition: "proof_only" }],
    runtimeDependencies: [],
    assignments: [
      { requirementId: "F-001", release: "R0", rationale: "journey" },
    ],
    mappings: [{ id: "PLA-1", sourceId: "F-001" }],
    fingerprintIssues: [liveIssue("PLA-1", ["R0"])],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(readFileSync(value.out, "utf8"));
    assert.deepEqual(plan.blockAdditions, []);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("fails closed when an executable source has no Linear mapping", () => {
  const value = fixture({
    mappings: [
      { id: "PLA-1", sourceId: "F-001" },
      { id: "PLA-3", sourceId: "RG:journey-proof" },
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Executable source F-002 has no Linear mapping/);
    assert.throws(() => readFileSync(value.out, "utf8"));
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("fails closed when a runtime source has no Linear mapping", () => {
  const value = fixture({
    mappings: [
      { id: "PLA-1", sourceId: "F-001" },
      { id: "PLA-2", sourceId: "F-002" },
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /Runtime source RG:journey-proof has no Linear mapping/,
    );
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("rejects cross-release inversions before writing a plan", () => {
  const value = fixture({
    assignments: [
      { requirementId: "F-001", release: "R0", rationale: "journey" },
      { requirementId: "F-002", release: "R1", rationale: "foundation later" },
      {
        requirementId: "RG:journey-proof",
        release: "R0",
        rationale: "runtime",
      },
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Cross-release inversion: F-001 R0 depends on F-002 R1/);
    assert.throws(() => readFileSync(value.out, "utf8"));
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("rejects a cycle closed by a planned block among mapped source issues", () => {
  const reverse = "blocks:PLA-1:PLA-2";
  const value = fixture({
    fingerprintIssues: [
      liveIssue("PLA-1", ["R0"], [reverse]),
      liveIssue("PLA-2", ["R0"], [reverse]),
      liveIssue("PLA-3", ["R0"]),
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Planned Linear blocks create a cycle/);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("ignores historical cycles outside the mapped executable and runtime graph", () => {
  const first = "blocks:LEG-1:LEG-2";
  const second = "blocks:LEG-2:LEG-1";
  const value = fixture({
    fingerprintIssues: [
      liveIssue("PLA-1", ["R1"]),
      liveIssue("PLA-2", ["R0"]),
      liveIssue("PLA-3", ["R0"]),
      liveIssue("LEG-1", [], [first, second]),
      liveIssue("LEG-2", [], [first, second]),
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("rejects an asymmetric relation fingerprint as incomplete", () => {
  const relation = "related:PLA-1:PLA-X";
  const value = fixture({
    fingerprintIssues: [
      liveIssue("PLA-1", ["R1"], [relation]),
      liveIssue("PLA-2", ["R0"]),
      liveIssue("PLA-3", ["R0"]),
      liveIssue("PLA-X"),
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Relation related:PLA-1:PLA-X is not present on both endpoints/);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("fails closed rather than dropping an ungoverned release membership", () => {
  const value = fixture({
    extraReleases: [
      {
        id: "release-partner-beta",
        name: "Partner beta",
        version: "partner-beta",
        updatedAt: "2026-07-15T00:00:00.000Z",
        pipeline: "pipeline",
        stage: "stage",
        stageType: "active",
      },
    ],
    fingerprintIssues: [
      liveIssue("PLA-1", ["partner-beta", "R1"]),
      liveIssue("PLA-2", ["R0"]),
      liveIssue("PLA-3", ["R0"]),
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /Linear issue PLA-1 has ungoverned release partner-beta/,
    );
    assert.throws(() => readFileSync(value.out, "utf8"));
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});
