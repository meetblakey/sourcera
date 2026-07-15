import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
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
  fingerprintProjects?: Array<Record<string, unknown>>;
  fingerprintMilestones?: Array<Record<string, unknown>>;
  fingerprintPipelines?: Array<Record<string, unknown>>;
  fingerprintReleases?: Array<Record<string, unknown>>;
}

function liveIssue(
  identifier: string,
  releases: string[] = [],
  relations: string[] = [],
): Record<string, unknown> {
  const team = identifier.split("-")[0];
  return {
    identifier,
    title: identifier,
    descriptionFingerprint: "0".repeat(64),
    updatedAt: `2026-07-15T00:00:0${identifier.length % 10}.000Z`,
    estimate: 1,
    priority: 2,
    state: "Backlog",
    stateType: "backlog",
    archivedAt: null,
    labels: [],
    assignee: null,
    assigneeId: null,
    team,
    teamId: `team-${team.toLowerCase()}`,
    projectId: "project-1",
    project: "Production project",
    milestoneId: "milestone-1",
    milestone: "Production evidence closed",
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
  const linearProjectScope = join(dir, "linear-project-scope.json");
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
  writeFileSync(
    linearProjectScope,
    JSON.stringify({
      schemaVersion: 1,
      projects: [{ id: "project-1", name: "Production project" }],
    }),
  );

  const related = "related:PLA-1:PLA-4";
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
          liveIssue("PLA-4", [], [related]),
        ],
        releasePipelines: options.fingerprintPipelines ?? [
          {
            id: "pipeline",
            name: "Sourcera delivery",
            updatedAt: "2026-07-15T00:00:00.000Z",
            type: "scheduled",
            isProduction: true,
            teams: ["PLA"],
            stages: [{ id: "stage", name: "Planned", type: "planned" }],
          },
        ],
        releases: options.fingerprintReleases ?? [
          ...["R0", "R1", "R2", "R3", "R4", "R5"].map(
            (version) => ({
              id: `release-${version.toLowerCase()}`,
              name: version,
              version,
              updatedAt: "2026-07-15T00:00:00.000Z",
              pipeline: "pipeline",
              stage: "stage",
              stageType: "planned",
            }),
          ),
          ...(options.extraReleases ?? []),
        ],
        projects: options.fingerprintProjects ?? [
          {
            id: "project-1",
            name: "Production project",
            updatedAt: "2026-07-15T00:00:00.000Z",
          },
        ],
        projectMilestones: options.fingerprintMilestones ?? [
          {
            id: "milestone-1",
            name: "Production evidence closed",
            projectId: "project-1",
            project: "Production project",
          },
        ],
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
    linearProjectScope,
    out,
  };
}

function run(
  value: ReturnType<typeof fixture>,
  out = value.out,
  extraArgs: string[] = [],
) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/plan-linear-sync.ts",
      "--root",
      value.dir,
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
      "--linear-project-scope",
      value.linearProjectScope,
      "--snapshot",
      value.snapshot,
      "--out",
      out,
      ...extraArgs,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
}

function mutateSnapshot(
  value: ReturnType<typeof fixture>,
  mutate: (snapshot: Record<string, any>) => void,
): void {
  const snapshot = JSON.parse(readFileSync(value.snapshot, "utf8"));
  mutate(snapshot);
  writeFileSync(value.snapshot, JSON.stringify(snapshot));
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
          "related:PLA-1:PLA-4",
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
      { issueId: "PLA-1", relations: ["related:PLA-1:PLA-4"] },
      { issueId: "PLA-2", relations: [] },
      { issueId: "PLA-3", relations: [] },
    ]);
    assert.deepEqual(Object.keys(plan.inputSha256), [
      "dispositions",
      "featureDependencies",
      "inventory",
      "linearProjectScope",
      "releasePlan",
      "runtimeDependencies",
      "snapshot",
    ]);
    for (const digest of Object.values(plan.inputSha256)) {
      assert.match(String(digest), /^[a-f0-9]{64}$/);
    }
    assert.equal(JSON.stringify(plan).includes('"reviewer"'), false);

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

test("rejects an existing active mapped block that inverts planned releases", () => {
  const inverted = "blocks:PLA-1:PLA-2";
  const value = fixture({
    assignments: [
      { requirementId: "F-001", release: "R1", rationale: "journey" },
      { requirementId: "F-002", release: "R0", rationale: "foundation" },
      {
        requirementId: "RG:journey-proof",
        release: "R1",
        rationale: "runtime",
      },
    ],
    fingerprintIssues: [
      liveIssue("PLA-1", ["R1"], [inverted]),
      liveIssue("PLA-2", ["R0"], [inverted]),
      liveIssue("PLA-3", ["R1"]),
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /Active mapped block blocks:PLA-1:PLA-2 inverts releases: F-001 R1 blocks F-002 R0/,
    );
    assert.throws(() => readFileSync(value.out, "utf8"));
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("preserves an acyclic same-release active block outside the source graph", () => {
  const extra = "blocks:PLA-2:PLA-3";
  const value = fixture({
    fingerprintIssues: [
      liveIssue("PLA-1", ["R1"]),
      liveIssue("PLA-2", ["R0"], [extra]),
      liveIssue("PLA-3", ["R0"], [extra]),
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(readFileSync(value.out, "utf8"));
    assert.deepEqual(
      plan.expectedRelationsByIssue.find(
        (row: { issueId: string }) => row.issueId === "PLA-2",
      ).relations,
      ["blocks:PLA-2:PLA-1", "blocks:PLA-2:PLA-3"],
    );
    assert.equal(
      plan.blockAdditions.some(
        (change: { relation: string }) => change.relation === extra,
      ),
      false,
    );
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("ignores canceled historical cycles outside the mapped graph and canonical projects", () => {
  const first = "blocks:LEG-1:LEG-2";
  const second = "blocks:LEG-2:LEG-1";
  const legacyIssue = (identifier: string) => ({
    ...liveIssue(identifier, [], [first, second]),
    state: "Canceled",
    stateType: "canceled",
    projectId: "legacy-project",
    project: "Legacy project",
    milestoneId: "legacy-milestone",
    milestone: "Legacy milestone",
  });
  const value = fixture({
    fingerprintIssues: [
      liveIssue("PLA-1", ["R1"]),
      liveIssue("PLA-2", ["R0"]),
      liveIssue("PLA-3", ["R0"]),
      legacyIssue("LEG-1"),
      legacyIssue("LEG-2"),
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
  const relation = "related:PLA-1:PLA-4";
  const value = fixture({
    fingerprintIssues: [
      liveIssue("PLA-1", ["R1"], [relation]),
      liveIssue("PLA-2", ["R0"]),
      liveIssue("PLA-3", ["R0"]),
      liveIssue("PLA-4"),
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Relation related:PLA-1:PLA-4 is not present on both endpoints/);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("requires non-empty project and milestone inventories", () => {
  const cases: Array<[FixtureOptions, RegExp]> = [
    [
      { fingerprintProjects: [] },
      /Complete Linear fingerprint requires non-empty projects/,
    ],
    [
      { fingerprintMilestones: [] },
      /Complete Linear fingerprint requires non-empty projectMilestones/,
    ],
  ];
  for (const [options, expected] of cases) {
    const value = fixture(options);
    try {
      const result = run(value);
      assert.equal(result.status, 1);
      assert.match(result.stderr, expected);
      assert.throws(() => readFileSync(value.out, "utf8"));
    } finally {
      rmSync(value.dir, { recursive: true, force: true });
    }
  }
});

test("requires fingerprint projects to exactly match independent scope", () => {
  const value = fixture({
    fingerprintProjects: [
      {
        id: "project-other",
        name: "Other project",
        updatedAt: "2026-07-15T00:00:00.000Z",
      },
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /Linear snapshot project scope project-1 is missing/,
    );
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
        stageType: "planned",
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

test("rejects unknown, duplicate, missing, and malformed CLI flags", () => {
  const value = fixture();
  try {
    const cases: Array<[string[], RegExp]> = [
      [["--unknown", "true"], /Unknown argument --unknown/],
      [["--out", join(value.dir, "other.json")], /Duplicate argument --out/],
      [["--allow-outside-root", "false"], /--allow-outside-root requires true/],
      [["--allow-outside-root", "TRUE"], /--allow-outside-root requires true/],
      [["--allow-outside-root", "--snapshot"], /Missing value for --allow-outside-root/],
    ];
    for (const [args, expected] of cases) {
      const result = run(value, value.out, args);
      assert.equal(result.status, 1, args.join(" "));
      assert.match(result.stderr, expected, args.join(" "));
    }
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("keeps planner output inside root unless the exact override is present", () => {
  const value = fixture();
  const outside = mkdtempSync(join(tmpdir(), "sourcera-plan-outside-"));
  const outsidePath = join(outside, "plan.json");
  try {
    const denied = run(value, outsidePath);
    assert.equal(denied.status, 1);
    assert.match(denied.stderr, /Output path must remain inside root/);
    assert.throws(() => readFileSync(outsidePath, "utf8"));

    const allowed = run(value, outsidePath, ["--allow-outside-root", "true"]);
    assert.equal(allowed.status, 0, allowed.stderr);
    assert.equal(JSON.parse(readFileSync(outsidePath, "utf8")).schemaVersion, 1);

    const escapedParent = join(value.dir, "escaped-parent");
    symlinkSync(outside, escapedParent, "dir");
    const escaped = run(value, join(escapedParent, "escaped.json"));
    assert.equal(escaped.status, 1);
    assert.match(escaped.stderr, /Output path must remain inside root/);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("never overwrites an input or follows an output symlink", () => {
  const value = fixture();
  try {
    const inventoryBefore = readFileSync(value.inventory, "utf8");
    const sameInput = run(value, value.inventory);
    assert.equal(sameInput.status, 1);
    assert.match(sameInput.stderr, /Output path equals input inventory/);
    assert.equal(readFileSync(value.inventory, "utf8"), inventoryBefore);

    const target = join(value.dir, "target.json");
    const symlink = join(value.dir, "symlink-plan.json");
    writeFileSync(target, "sentinel\n");
    symlinkSync(target, symlink);
    const linked = run(value, symlink);
    assert.equal(linked.status, 1);
    assert.match(linked.stderr, /Output path cannot be a symlink/);
    assert.equal(readFileSync(target, "utf8"), "sentinel\n");
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("atomically replaces output and leaves no temporary file", () => {
  const value = fixture();
  try {
    writeFileSync(value.out, "sentinel\n");
    const result = run(value);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(readFileSync(value.out, "utf8")).schemaVersion, 1);
    assert.deepEqual(
      readdirSync(value.dir).filter((name) => name.startsWith(".plan.json.tmp-")),
      [],
    );
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("strictly validates every captured issue identity and preservation field", () => {
  const cases: Array<[
    string,
    (issue: Record<string, any>) => void,
    RegExp,
  ]> = [
    ["title", (issue) => { issue.title = ""; }, /invalid title/],
    ["description", (issue) => { issue.descriptionFingerprint = "short"; }, /invalid description fingerprint/],
    ["updatedAt", (issue) => { issue.updatedAt = "not-a-date"; }, /invalid updatedAt/],
    ["estimate", (issue) => { issue.estimate = "five"; }, /invalid estimate/],
    ["priority", (issue) => { issue.priority = 9; }, /invalid priority/],
    ["state", (issue) => { issue.state = ""; }, /invalid state/],
    ["state type", (issue) => { issue.stateType = ""; }, /invalid state type/],
    ["archivedAt", (issue) => { issue.archivedAt = "not-a-date"; }, /invalid archivedAt/],
    ["labels", (issue) => { issue.labels = ["feature", "feature"]; }, /invalid labels/],
    ["assignee", (issue) => { issue.assigneeId = "person-1"; }, /partial assignee identity/],
    ["assignee ID", (issue) => { issue.assignee = "Owner"; issue.assigneeId = null; }, /partial assignee identity/],
    ["team", (issue) => { issue.teamId = ""; }, /invalid team identity/],
    ["project", (issue) => { issue.projectId = null; }, /partial project identity/],
    ["milestone", (issue) => { issue.milestoneId = null; }, /partial milestone identity/],
    ["parent", (issue) => { issue.parent = "PLA-404"; }, /uncaptured parent PLA-404/],
    ["self parent", (issue) => { issue.parent = issue.identifier; }, /cannot parent itself/],
    ["releases", (issue) => { issue.releases = "R0"; }, /invalid releases/],
    ["relations", (issue) => { issue.relations = "none"; }, /invalid relations/],
  ];
  for (const [name, mutate, expected] of cases) {
    const value = fixture();
    try {
      mutateSnapshot(value, (snapshot) => mutate(snapshot.linearFingerprint.issues[0]));
      const result = run(value);
      assert.equal(result.status, 1, name);
      assert.match(result.stderr, expected, name);
      assert.throws(() => readFileSync(value.out, "utf8"));
    } finally {
      rmSync(value.dir, { recursive: true, force: true });
    }
  }
});

test("strictly validates non-empty release topology and canonical memberships", () => {
  const cases: Array<[
    string,
    (fingerprint: Record<string, any>) => void,
    RegExp,
  ]> = [
    ["issues", (value) => { value.issues = []; }, /requires non-empty issues/],
    ["pipelines", (value) => { value.releasePipelines = []; }, /requires non-empty releasePipelines/],
    ["releases", (value) => { value.releases = []; }, /requires non-empty releases/],
    ["pipeline stages", (value) => { value.releasePipelines[0].stages = []; }, /invalid stages/],
    ["pipeline teams", (value) => { value.releasePipelines[0].teams = ["PLA", "PLA"]; }, /invalid teams/],
    ["pipeline name", (value) => { value.releasePipelines[0].name = ""; }, /invalid or duplicated/],
    ["pipeline updatedAt", (value) => { value.releasePipelines[0].updatedAt = "invalid"; }, /invalid or duplicated/],
    ["pipeline production", (value) => { value.releasePipelines[0].isProduction = "yes"; }, /invalid or duplicated/],
    ["pipeline enum", (value) => { value.releasePipelines[0].type = "manual"; }, /invalid or duplicated/],
    ["global stage IDs", (value) => { value.releasePipelines.push({ ...value.releasePipelines[0], id: "pipeline-2", stages: [{ id: "stage", name: "Planned", type: "planned" }] }); }, /invalid stages/],
    ["release pipeline", (value) => { value.releases[0].pipeline = "missing"; }, /unknown pipeline/],
    ["release stage", (value) => { value.releases[0].stage = "missing"; }, /unknown stage/],
    ["release stage type", (value) => { value.releases[0].stageType = "released"; }, /stage type differs/],
    ["canonical releases", (value) => { value.releases.pop(); }, /missing canonical release R5/],
  ];
  for (const [name, mutate, expected] of cases) {
    const value = fixture();
    try {
      mutateSnapshot(value, (snapshot) => mutate(snapshot.linearFingerprint));
      const result = run(value);
      assert.equal(result.status, 1, name);
      assert.match(result.stderr, expected, name);
    } finally {
      rmSync(value.dir, { recursive: true, force: true });
    }
  }
});

test("accepts the live continuous release pipeline enum", () => {
  const value = fixture();
  try {
    mutateSnapshot(value, (snapshot) => {
      snapshot.linearFingerprint.releasePipelines[0].type = "continuous";
    });
    const result = run(value);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});

test("rejects conflicting stable issue identities without requiring unique display names", () => {
  const cases: Array<[
    string,
    (fingerprint: Record<string, any>) => void,
    RegExp,
  ]> = [
    ["team", (value) => { value.issues[1].teamId = "team-other"; }, /inconsistent team identity/],
    ["assignee", (value) => {
      value.issues[0].assignee = "Owner A";
      value.issues[0].assigneeId = "person-1";
      value.issues[1].assignee = "Owner B";
      value.issues[1].assigneeId = "person-1";
    }, /inconsistent assignee identity/],
    ["project", (value) => { value.issues[0].project = "Renamed only here"; }, /inconsistent project identity/],
    ["milestone", (value) => { value.issues[0].milestone = "Renamed only here"; }, /inconsistent milestone identity/],
  ];
  for (const [name, mutate, expected] of cases) {
    const value = fixture();
    try {
      mutateSnapshot(value, (snapshot) => mutate(snapshot.linearFingerprint));
      const result = run(value);
      assert.equal(result.status, 1, name);
      assert.match(result.stderr, expected, name);
    } finally {
      rmSync(value.dir, { recursive: true, force: true });
    }
  }

  const sameDisplay = fixture();
  try {
    mutateSnapshot(sameDisplay, (snapshot) => {
      snapshot.linearFingerprint.issues[0].assignee = "Shared name";
      snapshot.linearFingerprint.issues[0].assigneeId = "person-1";
      snapshot.linearFingerprint.issues[1].assignee = "Shared name";
      snapshot.linearFingerprint.issues[1].assigneeId = "person-2";
    });
    const result = run(sameDisplay);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(sameDisplay.dir, { recursive: true, force: true });
  }
});

test("requires mapped work to be active and in canonical project topology", () => {
  const cases: Array<[
    string,
    (issue: Record<string, any>) => void,
    RegExp,
  ]> = [
    ["canceled", (issue) => { issue.state = "Canceled"; issue.stateType = "canceled"; }, /maps to canceled issue PLA-1/],
    ["archived", (issue) => { issue.archivedAt = "2026-07-15T00:00:00.000Z"; }, /maps to archived issue PLA-1/],
    ["project", (issue) => { issue.projectId = "legacy-project"; issue.project = "Legacy"; issue.milestoneId = null; issue.milestone = null; }, /outside canonical project scope/],
    ["missing project", (issue) => { issue.projectId = null; issue.project = null; issue.milestoneId = null; issue.milestone = null; }, /outside canonical project scope/],
    ["milestone", (issue) => { issue.milestoneId = "legacy-milestone"; issue.milestone = "Legacy"; }, /outside canonical milestone inventory/],
    ["missing milestone", (issue) => { issue.milestoneId = null; issue.milestone = null; }, /outside canonical milestone inventory/],
  ];
  for (const [name, mutate, expected] of cases) {
    const value = fixture();
    try {
      mutateSnapshot(value, (snapshot) => mutate(snapshot.linearFingerprint.issues[0]));
      const result = run(value);
      assert.equal(result.status, 1, name);
      assert.match(result.stderr, expected, name);
    } finally {
      rmSync(value.dir, { recursive: true, force: true });
    }
  }
});

test("rejects duplicate mappings for the exact expected source", () => {
  const value = fixture({
    mappings: [
      { id: "PLA-1", sourceId: "F-001" },
      { id: "PLA-4", sourceId: "F-001" },
      { id: "PLA-2", sourceId: "F-002" },
      { id: "PLA-3", sourceId: "RG:journey-proof" },
    ],
  });
  try {
    const result = run(value);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Executable source F-001 has duplicate Linear mappings: PLA-1, PLA-4/);
  } finally {
    rmSync(value.dir, { recursive: true, force: true });
  }
});
