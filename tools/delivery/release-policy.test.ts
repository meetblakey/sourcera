import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  applyFeatureDependencies,
  dependencyRepairFindings,
  type FeatureDependencyRepair,
} from "./lib/dependencies.js";
import {
  buildReleaseAssignments,
  releasePolicyFindings,
} from "./lib/release-policy.js";
import type {
  Finding,
  ReleaseAssignment,
  ReleaseDefinition,
  ReleaseId,
  ReleasePolicy,
  SourceRequirement,
} from "./lib/model.js";
import { parseFeatureInventory } from "./lib/sources.js";

const releases = ["R0", "R1", "R2", "R3", "R4", "R5"].map(
  (id, sequence) => ({
    id,
    name: id,
    sequence,
    customerHypothesis: "customer",
    operationalHypothesis: "operations",
    pilot: "pilot",
    metrics: ["completion"],
    customerGate: "customer proof",
    operationalGate: "operations proof",
  }),
) as ReleaseDefinition[];

const row = (id: string, dependencies: string[] = []): SourceRequirement => ({
  requirementId: id,
  outcome: id,
  sourceDoc: "Sourcera_Master_Spec.md",
  sourceVersion: "7.1.0a",
  section: "§1",
  dependencies,
  disposition: "executable",
});

const rows = [
  row("F-ROOT", ["F-DEPENDENCY"]),
  row("F-DEPENDENCY"),
  row("F-OWNER-R2"),
];

const runtime = [row("RG:root-proof"), row("RG:proof")];

const policy: ReleasePolicy = {
  schemaVersion: 1,
  r0Roots: ["F-ROOT"],
  baselineAssignments: [
    { requirementId: "F-ROOT", release: "R1", rationale: "root" },
    {
      requirementId: "F-DEPENDENCY",
      release: "R1",
      rationale: "dependency",
    },
    { requirementId: "F-OWNER-R2", release: "R2", rationale: "later owner" },
  ],
};

const owners = [
  { requirementId: "RG:root-proof", dependencies: ["F-ROOT"] },
  {
    requirementId: "RG:proof",
    dependencies: ["F-ROOT", "F-OWNER-R2"],
  },
];

function idsIn(assignments: ReleaseAssignment[], release: ReleaseId): string[] {
  return assignments
    .filter((candidate) => candidate.release === release)
    .map((candidate) => candidate.requirementId);
}

function codes(findings: Finding[]): Set<string> {
  return new Set(findings.map((finding) => finding.code));
}

const invalidRows = [
  row("F-DUP", ["F-CYCLE"]),
  row("F-CYCLE", ["F-DUP"]),
];

const invalidPolicy: ReleasePolicy = {
  schemaVersion: 1,
  r0Roots: ["F-MISSING"],
  baselineAssignments: [
    { requirementId: "F-DUP", release: "R0", rationale: "first" },
    { requirementId: "F-DUP", release: "R1", rationale: "duplicate" },
    { requirementId: "F-CYCLE", release: "R1", rationale: "cycle" },
  ],
};

const findings = releasePolicyFindings(invalidRows, invalidPolicy, releases);

function assignment(requirementId: string): ReleaseAssignment {
  const found = buildReleaseAssignments(
    rows,
    runtime,
    policy,
    owners,
    releases,
  ).find((candidate) => candidate.requirementId === requirementId);
  assert.ok(found);
  return found;
}

test("R0 is exactly the approved roots and dependency closure", () => {
  const result = buildReleaseAssignments(rows, runtime, policy, owners, releases);
  assert.deepEqual(idsIn(result, "R0"), ["F-ROOT", "F-DEPENDENCY", "RG:root-proof"]);
});

test("unknown work fails instead of defaulting to R0", () => {
  assert.equal(releasePolicyFindings([...rows, row("F-NEW")], policy, releases)[0].code, "release_policy_unclassified");
});

test("duplicates, missing roots, cycles, and unexpected R0 fail", () => {
  assert.deepEqual(codes(findings), new Set([
    "release_policy_duplicate",
    "release_policy_root_missing",
    "dependency_cycle",
    "release_policy_unexpected_r0",
  ]));
});

test("runtime gates follow all explicit behavior owners", () => {
  assert.equal(assignment("RG:proof").release, "R2");
});

test("final release assignments reject dependency inversions", () => {
  const inversionRows = [
    row("F-R1", ["F-R5"]),
    row("F-R5"),
  ];
  const inversionPolicy: ReleasePolicy = {
    schemaVersion: 1,
    r0Roots: [],
    baselineAssignments: [
      { requirementId: "F-R1", release: "R1", rationale: "early" },
      { requirementId: "F-R5", release: "R5", rationale: "late" },
    ],
  };

  assert.throws(
    () =>
      buildReleaseAssignments(
        inversionRows,
        [],
        inversionPolicy,
        [],
        releases,
      ),
    /cross_release_inversion: F-R1 R1 depends on F-R5 R5/,
  );
});

test("missing dependencies fail", () => {
  const missingRows = [row("F-MISSING", ["F-UNKNOWN"])];
  const missingPolicy: ReleasePolicy = {
    schemaVersion: 1,
    r0Roots: [],
    baselineAssignments: [
      { requirementId: "F-MISSING", release: "R1", rationale: "feature" },
    ],
  };

  assert.deepEqual(
    codes(releasePolicyFindings(missingRows, missingPolicy, releases)),
    new Set(["missing_dependency"]),
  );
});

test("rejects unsupported release policy schema versions", () => {
  const unsupported = {
    ...policy,
    schemaVersion: 2,
  } as unknown as ReleasePolicy;

  assert.deepEqual(releasePolicyFindings(rows, unsupported, releases)[0], {
    code: "release_policy_schema_version",
    message: "Release policy schemaVersion must be 1; received 2",
  });
});

test("rejects empty or whitespace release assignment rationales", () => {
  const missingRationale: ReleasePolicy = {
    ...policy,
    baselineAssignments: policy.baselineAssignments.map((candidate) =>
      candidate.requirementId === "F-ROOT"
        ? { ...candidate, rationale: "  " }
        : candidate,
    ),
  };

  assert.deepEqual(
    releasePolicyFindings(rows, missingRationale, releases)[0],
    {
      code: "release_policy_rationale_missing",
      requirementId: "F-ROOT",
      message: "F-ROOT has no baseline release rationale",
    },
  );
});

interface CliFixture {
  dir: string;
  inventory: string;
  featureDependencies: string;
  policy: string;
  stamp: string;
  dispositions: string;
  runtimeDependencies: string;
  releases: string;
  out: string;
}

function cliFixture(policyOverrides: Record<string, unknown> = {}): CliFixture {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-release-policy-"));
  const paths = {
    dir,
    inventory: join(dir, "inventory.md"),
    featureDependencies: join(dir, "feature-dependencies.json"),
    policy: join(dir, "release-policy.json"),
    stamp: join(dir, "stamp.json"),
    dispositions: join(dir, "dispositions.json"),
    runtimeDependencies: join(dir, "runtime-dependencies.json"),
    releases: join(dir, "releases.json"),
    out: join(dir, "release-plan.json"),
  };
  writeFileSync(
    paths.inventory,
    [
      "| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |",
      "|---|---|---|---|---|---|---|---|---|",
      "| F-001 | Root | journey | §1 | — | master_spec | v7.1.0a | Root | F-002 |",
      "| F-002 | Dependency | control | §1 | — | master_spec | v7.1.0a | Dependency | — |",
      "| F-003 | Later intelligence | intelligence | §14 | — | master_spec | v7.1.0a | Later intelligence | — |",
      "",
    ].join("\n"),
  );
  writeFileSync(
    paths.featureDependencies,
    JSON.stringify({ schemaVersion: 1, repairs: [] }),
  );
  writeFileSync(
    paths.policy,
    JSON.stringify({
      schemaVersion: 1,
      r0Roots: ["F-001"],
      baselineAssignments: [
        { requirementId: "F-001", release: "R1", rationale: "journey root" },
        { requirementId: "F-002", release: "R1", rationale: "journey control" },
        { requirementId: "F-003", release: "R4", rationale: "intelligence capability" },
      ],
      ...policyOverrides,
    }),
  );
  writeFileSync(
    paths.stamp,
    JSON.stringify({
      findings: [
        { id: "root-proof", file: "Sourcera_Master_Spec.md", line: 1, severity: "blocker" },
      ],
    }),
  );
  writeFileSync(paths.dispositions, JSON.stringify({ overrides: [] }));
  writeFileSync(
    paths.runtimeDependencies,
    JSON.stringify({
      dependencies: [
        { requirementId: "RG:root-proof", dependencies: ["F-001"] },
      ],
    }),
  );
  writeFileSync(paths.releases, JSON.stringify({ releases }));
  return paths;
}

function runCli(fixture: CliFixture) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/build-release-plan.ts",
      "--root",
      process.cwd(),
      "--inventory",
      fixture.inventory,
      "--feature-dependencies",
      fixture.featureDependencies,
      "--policy",
      fixture.policy,
      "--stamp",
      fixture.stamp,
      "--dispositions",
      fixture.dispositions,
      "--runtime-dependencies",
      fixture.runtimeDependencies,
      "--releases",
      fixture.releases,
      "--out",
      fixture.out,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
}

test("CLI emits exact R0 closure, later R4 work, and one runtime assignment", () => {
  const fixture = cliFixture();
  try {
    const result = runCli(fixture);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(readFileSync(fixture.out, "utf8")) as {
      assignments: ReleaseAssignment[];
    };
    const releaseOf = (requirementId: string) =>
      output.assignments.find((candidate) => candidate.requirementId === requirementId)?.release;
    assert.equal(releaseOf("F-001"), "R0");
    assert.equal(releaseOf("F-002"), "R0");
    assert.equal(releaseOf("F-003"), "R4");
    assert.equal(releaseOf("RG:root-proof"), "R0");
    assert.equal(
      output.assignments.filter((candidate) => candidate.requirementId === "RG:root-proof").length,
      1,
    );
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("CLI fails closed on a missing policy assignment before writing", () => {
  const fixture = cliFixture({
    baselineAssignments: [
      { requirementId: "F-001", release: "R1", rationale: "journey root" },
      { requirementId: "F-002", release: "R1", rationale: "journey control" },
    ],
  });
  try {
    const result = runCli(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /release_policy_unclassified/);
    assert.throws(() => readFileSync(fixture.out, "utf8"));
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("CLI fails closed on duplicate policy assignments", () => {
  const fixture = cliFixture({
    baselineAssignments: [
      { requirementId: "F-001", release: "R1", rationale: "journey root" },
      { requirementId: "F-001", release: "R2", rationale: "duplicate" },
      { requirementId: "F-002", release: "R1", rationale: "journey control" },
      { requirementId: "F-003", release: "R4", rationale: "intelligence capability" },
    ],
  });
  try {
    const result = runCli(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /release_policy_duplicate/);
    assert.throws(() => readFileSync(fixture.out, "utf8"));
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("CLI rejects unsupported policy schema before writing output", () => {
  const fixture = cliFixture({ schemaVersion: 2 });
  try {
    const result = runCli(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /release_policy_schema_version/);
    assert.throws(() => readFileSync(fixture.out, "utf8"));
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("CLI rejects missing assignment rationale before writing output", () => {
  const fixture = cliFixture({
    baselineAssignments: [
      { requirementId: "F-001", release: "R1", rationale: " " },
      { requirementId: "F-002", release: "R1", rationale: "journey control" },
      {
        requirementId: "F-003",
        release: "R4",
        rationale: "intelligence capability",
      },
    ],
  });
  try {
    const result = runCli(fixture);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /release_policy_rationale_missing/);
    assert.throws(() => readFileSync(fixture.out, "utf8"));
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("CLI preserves proof-only source nodes without requiring feature assignments", () => {
  const fixture = cliFixture({
    r0Roots: [],
    baselineAssignments: [
      { requirementId: "F-796", release: "R2", rationale: "CI override capability" },
    ],
  });
  try {
    const inventory = [
      "| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |",
      "|---|---|---|---|---|---|---|---|---|",
      "| F-795 | Appendix gate | platform_mechanic | Appendix M.4 | — | master_spec | v7.1.0 | Gate | — |",
      "| F-796 | Internal-only override | platform_mechanic | Appendix M.4.4 | — | master_spec | v7.1.0 | Override | F-795 |",
      "",
    ].join("\n");
    writeFileSync(fixture.inventory, inventory);
    writeFileSync(
      fixture.dispositions,
      JSON.stringify({
        overrides: [
          { requirementId: "F-795", disposition: "proof_only" },
        ],
      }),
    );
    writeFileSync(
      fixture.stamp,
      JSON.stringify({
        findings: [
          {
            id: "appendix_m_coverage_on_diff",
            file: "Sourcera_Master_Spec.md",
            line: 1,
            severity: "blocker",
          },
        ],
      }),
    );
    writeFileSync(
      fixture.runtimeDependencies,
      JSON.stringify({
        dependencies: [
          {
            requirementId: "RG:appendix_m_coverage_on_diff",
            dependencies: ["F-796"],
          },
        ],
      }),
    );
    const result = runCli(fixture);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(readFileSync(fixture.out, "utf8")) as {
      assignments: ReleaseAssignment[];
    };
    assert.equal(
      output.assignments.some((candidate) => candidate.requirementId === "F-795"),
      false,
    );
    assert.equal(
      output.assignments.find((candidate) => candidate.requirementId === "F-796")?.release,
      "R2",
    );
    assert.equal(
      output.assignments.find(
        (candidate) => candidate.requirementId === "RG:appendix_m_coverage_on_diff",
      )?.release,
      "R2",
    );
    assert.equal(readFileSync(fixture.inventory, "utf8"), inventory);
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

const approvedR0Roots = [
  "F-083", "F-085", "F-086", "F-087", "F-088", "F-101",
  "F-105", "F-106", "F-209", "F-214", "F-215", "F-220",
  "F-225", "F-226", "F-228", "F-229", "F-387", "F-389",
  "F-559", "F-560", "F-687", "F-688", "F-689", "F-690",
  "F-691", "F-692", "F-693", "F-694",
];

function canonicalReleaseFixture() {
  const root = process.cwd();
  const canonicalPolicy = JSON.parse(
    readFileSync(join(root, "delivery/release-policy.json"), "utf8"),
  ) as ReleasePolicy;
  const repairs = JSON.parse(
    readFileSync(join(root, "delivery/feature-dependencies.json"), "utf8"),
  ) as { repairs: FeatureDependencyRepair[] };
  const dispositions = JSON.parse(
    readFileSync(join(root, "delivery/dispositions.json"), "utf8"),
  ) as {
    overrides: Array<{
      requirementId: string;
      disposition: SourceRequirement["disposition"];
    }>;
  };
  const dispositionById = new Map(
    dispositions.overrides.map((candidate) => [
      candidate.requirementId,
      candidate.disposition,
    ]),
  );
  const sourceRows = parseFeatureInventory(
    readFileSync(join(root, "_audit/FEATURE_INVENTORY.md"), "utf8"),
  ).map((candidate) => ({
    ...candidate,
    disposition:
      dispositionById.get(candidate.requirementId) ?? candidate.disposition,
  }));
  const allFeatures = applyFeatureDependencies(sourceRows, repairs.repairs);
  const executableIds = new Set(
    allFeatures
      .filter((candidate) => candidate.disposition === "executable")
      .map((candidate) => candidate.requirementId),
  );
  const executablePolicyGraph = allFeatures
    .filter((candidate) => candidate.disposition === "executable")
    .map((candidate) => ({
      ...candidate,
      dependencies: candidate.dependencies.filter((dependencyId) =>
        executableIds.has(dependencyId),
      ),
    }));
  const canonicalReleases = (
    JSON.parse(
      readFileSync(join(root, "delivery/releases.json"), "utf8"),
    ) as { releases: ReleaseDefinition[] }
  ).releases;
  return {
    allFeatures,
    canonicalPolicy,
    canonicalReleases,
    executablePolicyGraph,
    repairs: repairs.repairs,
    sourceRows,
  };
}

test("canonical R0 closure contains the complete mandatory journey without new roots", () => {
  const {
    canonicalPolicy,
    canonicalReleases,
    executablePolicyGraph,
  } = canonicalReleaseFixture();
  assert.deepEqual(canonicalPolicy.r0Roots, approvedR0Roots);
  const finalById = new Map(
    buildReleaseAssignments(
      executablePolicyGraph,
      [],
      canonicalPolicy,
      [],
      canonicalReleases,
    ).map((candidate) => [candidate.requirementId, candidate.release]),
  );

  for (const requirementId of [
    "F-210", "F-211", "F-212", "F-213", "F-214", "F-215",
    "F-217", "F-218", "F-219", "F-220", "F-221", "F-223",
    "F-224", "F-225", "F-226", "F-228", "F-229", "F-235",
    "F-236", "F-237", "F-238",
  ]) {
    assert.equal(finalById.get(requirementId), "R0", requirementId);
  }
});

test("canonical semantic repairs introduce no cycle or release inversion", () => {
  const {
    canonicalPolicy,
    canonicalReleases,
    executablePolicyGraph,
    repairs,
    sourceRows,
  } = canonicalReleaseFixture();
  assert.deepEqual(dependencyRepairFindings(sourceRows, repairs), []);
  assert.doesNotThrow(() =>
    buildReleaseAssignments(
      executablePolicyGraph,
      [],
      canonicalPolicy,
      [],
      canonicalReleases,
    )
  );
});

test("optional journey paths keep their R1 assignments", () => {
  const {
    canonicalPolicy,
    canonicalReleases,
    executablePolicyGraph,
  } = canonicalReleaseFixture();
  const baselineById = new Map(
    canonicalPolicy.baselineAssignments.map((candidate) => [
      candidate.requirementId,
      candidate.release,
    ]),
  );
  const finalById = new Map(
    buildReleaseAssignments(
      executablePolicyGraph,
      [],
      canonicalPolicy,
      [],
      canonicalReleases,
    ).map((candidate) => [candidate.requirementId, candidate.release]),
  );
  for (const requirementId of ["F-216", "F-222", "F-227"]) {
    assert.equal(baselineById.get(requirementId), "R1", requirementId);
    assert.equal(finalById.get(requirementId), "R1", requirementId);
  }
});

test("canonical policy is lossless and preserves the approved release boundary", () => {
  const {
    canonicalPolicy,
    canonicalReleases,
    executablePolicyGraph,
  } = canonicalReleaseFixture();

  assert.deepEqual(canonicalPolicy.r0Roots, approvedR0Roots);
  assert.equal(
    canonicalPolicy.baselineAssignments.length,
    executablePolicyGraph.length,
  );
  assert.equal(
    new Set(
      canonicalPolicy.baselineAssignments.map(
        (candidate) => candidate.requirementId,
      ),
    ).size,
    executablePolicyGraph.length,
  );

  const finalAssignments = buildReleaseAssignments(
    executablePolicyGraph,
    [],
    canonicalPolicy,
    [],
    canonicalReleases,
  );
  const baselineById = new Map(
    canonicalPolicy.baselineAssignments.map((candidate) => [
      candidate.requirementId,
      candidate.release,
    ]),
  );
  const finalById = new Map(
    finalAssignments.map((candidate) => [
      candidate.requirementId,
      candidate.release,
    ]),
  );

  for (const requirementId of [
    "F-559", "F-560", "F-687", "F-688", "F-689",
    "F-690", "F-691", "F-692", "F-693", "F-694",
  ]) {
    assert.equal(finalById.get(requirementId), "R0", requirementId);
  }
  assert.equal(baselineById.get("F-689"), "R4");
  assert.equal(finalById.get("F-265"), "R4");
  assert.equal(finalById.get("F-273"), "R4");
});

test("canonical release decisions preserve every unresolved validation trigger", () => {
  const expectedIds = [
    "DEC-REL-ACCESS-CI-001",
    "DEC-REL-ACTOR-001",
    "DEC-REL-AE006-001",
    "DEC-REL-AE029-001",
    "DEC-REL-AGGREGATE-001",
    "DEC-REL-CONSOLE-001",
    "DEC-REL-EXPORT-001",
    "DEC-REL-F567-001",
    "DEC-REL-F634-001",
    "DEC-REL-F738-001",
    "DEC-REL-F785-001",
    "DEC-REL-F886-001",
    "DEC-REL-HERO-METRICS-001",
    "DEC-REL-IDENTITY-001",
    "DEC-REL-INVITE-001",
    "DEC-REL-LOCKOUT-001",
    "DEC-REL-OPS-IDENTITY-001",
    "DEC-REL-PHASE3-001",
    "DEC-REL-PIPELINE-001",
    "DEC-REL-SCORING-001",
    "DEC-REL-SELLER-MAYA-001",
    "DEC-REL-SETUP-RECOVERY-001",
    "DEC-REL-SOLO-001",
    "DEC-REL-SURFACE-001",
  ];
  const decisions = readFileSync("delivery/decisions.jsonl", "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map(
      (line) =>
        JSON.parse(line) as {
          id: string;
          status: string;
          decision: string;
          assumption: string;
          validationTrigger: string;
        },
    );
  const releaseDecisions = decisions
    .filter((candidate) => candidate.id.startsWith("DEC-REL-"))
    .sort((left, right) => left.id.localeCompare(right.id));

  assert.deepEqual(
    releaseDecisions.map((candidate) => candidate.id),
    expectedIds,
  );
  for (const decision of releaseDecisions) {
    assert.equal(decision.status, "active", decision.id);
    assert.ok(decision.decision.trim(), decision.id);
    assert.ok(decision.assumption.trim(), decision.id);
    assert.ok(decision.validationTrigger.trim(), decision.id);
  }

  const canonicalPlan = JSON.parse(
    readFileSync("delivery/release-plan.json", "utf8"),
  ) as {
    assignments: Array<{ requirementId: string; release: string }>;
  };
  const plannedReleaseByRequirement = new Map(
    canonicalPlan.assignments.map((assignment) => [
      assignment.requirementId,
      assignment.release,
    ]),
  );
  for (const decision of releaseDecisions) {
    const pinnedReleaseClaims = decision.decision.matchAll(
      /Keep (F-(?:AE-)?\d+) at (?:its audited )?(R[0-5])/g,
    );
    for (const claim of pinnedReleaseClaims) {
      assert.equal(
        plannedReleaseByRequirement.get(claim[1]),
        claim[2],
        `${decision.id} contradicts the canonical release plan for ${claim[1]}`,
      );
    }
  }
  const exportDecision = releaseDecisions.find(
    (candidate) => candidate.id === "DEC-REL-EXPORT-001",
  );
  assert.ok(exportDecision);
  assert.match(
    exportDecision.decision,
    /F-226 as the narrow R0 Selection Report owner/,
  );
  assert.match(
    exportDecision.validationTrigger,
    /§40\.1 owner only if F-226 does not fully supply/,
  );

  const risks = JSON.parse(readFileSync("delivery/risks.json", "utf8")) as {
    risks: Array<{
      id: string;
      statement: string;
      owner: string;
      trigger: string;
      response: string;
    }>;
  };
  const risk = risks.risks.filter(
    (candidate) => candidate.id === "RISK-009",
  );
  assert.equal(risk.length, 1);
  assert.match(risk[0].trigger, /DEC-REL-/);
  assert.match(risk[0].response, /Block readiness/);
});
