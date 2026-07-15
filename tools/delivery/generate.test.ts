import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const releaseNames = [
  "First Defensible Evaluation",
  "Team Evaluation & Collaboration",
  "Repeatability, Reporting & Operations",
  "Marketplace Supply, Discovery, Matching & Trust",
  "Intelligence, Scenarios, TCO & Agents",
  "Enterprise Integrations, Compliance, Globalization & Scale",
];

const completeValidationPlan = () => ({
  schemaVersion: 1,
  releaseValidation: releaseNames.map((_, sequence) => ({
    release: `R${sequence}`,
    activation: "Activation is measured.",
    completion: "Completion is measured.",
    timeToValue: "Time to value is measured.",
    abandonment: "Abandonment is measured.",
    trust: "Trust is measured.",
    reliability: "Reliability is measured.",
    support: "Support is measured.",
  })),
  customerProof: [],
  operationalProof: [],
  forecastProof: [],
  executionEvidence: {
    tests: [],
    deploy: [],
    rollback: [],
    runtime: [],
  },
});

function canonicalGenerationArgs(
  dir: string,
  extras: string[] = [],
): { args: string[]; reports: string } {
  const stamp = join(dir, "stamp.json");
  const exact = join(dir, "exact.json");
  const reports = join(dir, "reports");
  const runtimeDependencies = JSON.parse(
    readFileSync("delivery/runtime-gate-dependencies.json", "utf8"),
  ).dependencies as Array<{ requirementId: string }>;
  writeFileSync(
    stamp,
    JSON.stringify({
      summary: {},
      findings: runtimeDependencies.map(({ requirementId }, index) => ({
        id: requirementId.replace(/^RG:/, ""),
        file: "Sourcera_Master_Spec.md",
        line: index + 1,
        severity: "blocker",
      })),
    }),
  );
  writeFileSync(exact, JSON.stringify({ open_rows: 0 }));
  return {
    args: [
      "--root",
      process.cwd(),
      "--stamp",
      stamp,
      "--exact",
      exact,
      ...extras,
      "--out",
      reports,
    ],
    reports,
  };
}

function runGeneration(args: string[]) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/generate.ts",
      ...args,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
}

test("generates semantic journey readiness and fails empty evidence milestones and relation drift", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-journey-"));
  try {
    const linear = JSON.parse(
      readFileSync("delivery/linear-snapshot.json", "utf8"),
    );
    linear.milestones = [
      {
        id: "empty-production-evidence",
        name: "Production evidence closed",
        projectId: "empty-project",
        project: "Empty production evidence project",
        targetDate: null,
        updatedAt: null,
      },
    ];
    linear.issues[0].milestone = "Production evidence closed";
    const phaseOne = linear.issues.find(
      (issue: { sourceId: string | null }) => issue.sourceId === "F-211",
    );
    assert.ok(phaseOne);
    phaseOne.dependencies = phaseOne.dependencies.filter(
      (dependency: string) => dependency !== "F-210",
    );
    const linearPath = join(dir, "linear.json");
    writeFileSync(linearPath, JSON.stringify(linear));
    const fixture = canonicalGenerationArgs(dir, ["--linear", linearPath]);

    const result = runGeneration(fixture.args);
    assert.equal(result.status, 1);
    const reportPath = join(fixture.reports, "journey-readiness.json");
    assert.equal(existsSync(reportPath), true, result.stderr);
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    assert.equal(report.release, "R0");
    assert.equal(report.expectedCommit, null);
    assert.equal(report.mandatoryPhases.length, 13);
    assert.equal(report.checkpoints.length, 8);
    assert.ok(
      report.findings.some(
        (finding: { code: string; message: string }) =>
          finding.code === "production_evidence_milestone_empty" &&
          finding.message.includes("Empty production evidence project"),
      ),
    );
    const drift = JSON.parse(
      readFileSync(join(fixture.reports, "drift-report.json"), "utf8"),
    );
    assert.ok(
      drift.findings.some(
        (finding: { code: string; issueId?: string }) =>
          finding.code === "dependency_drift" &&
          finding.issueId === phaseOne.id,
      ),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("derives the exact HEAD only when a checkpoint claims completion", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-checkpoint-"));
  try {
    const roadmap = JSON.parse(
      readFileSync("delivery/roadmap-contract.json", "utf8"),
    );
    roadmap.checkpoints[0].status = "complete";
    const roadmapPath = join(dir, "roadmap.json");
    writeFileSync(roadmapPath, JSON.stringify(roadmap));
    const fixture = canonicalGenerationArgs(dir, ["--roadmap", roadmapPath]);

    const result = runGeneration(fixture.args);
    assert.equal(result.status, 1);
    const reportPath = join(fixture.reports, "journey-readiness.json");
    assert.equal(existsSync(reportPath), true, result.stderr);
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    assert.match(report.expectedCommit, /^[a-f0-9]{40}$/);
    assert.ok(
      report.findings.some(
        (finding: { code: string; checkpointId?: string }) =>
          finding.code === "checkpoint_evidence_missing" &&
          finding.checkpointId === "R0-C1",
      ),
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("requires explicit feature dependencies for a custom inventory", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-input-pair-"));
  try {
    const inventory = join(dir, "inventory.md");
    writeFileSync(inventory, "custom inventory\n");
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/generate.ts",
        "--root",
        process.cwd(),
        "--inventory",
        inventory,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /--feature-dependencies is required when --inventory is supplied/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("requires an explicit release policy for a custom inventory", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-policy-pair-"));
  try {
    const inventory = join(dir, "inventory.md");
    const featureDependencies = join(dir, "feature-dependencies.json");
    writeFileSync(inventory, "custom inventory\n");
    writeFileSync(
      featureDependencies,
      JSON.stringify({ schemaVersion: 1, repairs: [] }),
    );
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/generate.ts",
        "--root",
        process.cwd(),
        "--inventory",
        inventory,
        "--feature-dependencies",
        featureDependencies,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /--policy is required when --inventory is supplied/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("generates deterministic reports and fails on orphan work", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-"));
  try {
    writeFileSync(
      join(dir, "inventory.md"),
      "| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |\n|---|---|---|---|---|---|---|---|---|\n| F-001 | A | surface | §1 | — | master_spec | v7.1.0a | A | — |\n",
    );
    writeFileSync(
      join(dir, "feature-dependencies.json"),
      JSON.stringify({ schemaVersion: 1, repairs: [] }),
    );
    writeFileSync(
      join(dir, "stamp.json"),
      JSON.stringify({ summary: {}, findings: [] }),
    );
    writeFileSync(
      join(dir, "exact.json"),
      JSON.stringify({
        ledger: join(dir, "_audit", "DEFECT_LEDGER.md"),
        open_rows: 0,
      }),
    );
    writeFileSync(
      join(dir, "releases.json"),
      JSON.stringify({
        releases: releaseNames.map((name, sequence) => ({
          id: `R${sequence}`,
          name,
          sequence,
          customerHypothesis: "customer",
          operationalHypothesis: "operations",
          pilot: "pilot",
          metrics: ["completion"],
          customerGate: "customer proof",
          operationalGate: "operational proof",
        })),
      }),
    );
    writeFileSync(
      join(dir, "release-policy.json"),
      JSON.stringify({
        schemaVersion: 1,
        r0Roots: ["F-001"],
        baselineAssignments: [
          {
            requirementId: "F-001",
            release: "R0",
            rationale: "R0 foundation dependency",
          },
        ],
      }),
    );
    writeFileSync(
      join(dir, "release-plan.json"),
      JSON.stringify({
        assignments: [
          {
            requirementId: "F-001",
            release: "R0",
            rationale: "R0 foundation dependency",
          },
        ],
      }),
    );
    writeFileSync(
      join(dir, "dispositions.json"),
      JSON.stringify({ overrides: [] }),
    );
    writeFileSync(
      join(dir, "runtime-dependencies.json"),
      JSON.stringify({ dependencies: [] }),
    );
    writeFileSync(join(dir, "decisions.jsonl"), "");
    writeFileSync(
      join(dir, "risks.json"),
      JSON.stringify({ risks: [] }),
    );
    writeFileSync(
      join(dir, "validation.json"),
      JSON.stringify({
        customerProof: [],
        operationalProof: [],
        forecastProof: [
          "reports/evidence/r0-foundation-review.json",
        ],
        executionEvidence: {
          tests: [],
          deploy: [],
          rollback: [],
          runtime: [],
        },
      }),
    );
    writeFileSync(join(dir, "linear.json"), JSON.stringify({ issues: [] }));
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/generate.ts",
        "--root",
        process.cwd(),
        "--inventory",
        join(dir, "inventory.md"),
        "--feature-dependencies",
        join(dir, "feature-dependencies.json"),
        "--stamp",
        join(dir, "stamp.json"),
        "--exact",
        join(dir, "exact.json"),
        "--releases",
        join(dir, "releases.json"),
        "--release-plan",
        join(dir, "release-plan.json"),
        "--policy",
        join(dir, "release-policy.json"),
        "--dispositions",
        join(dir, "dispositions.json"),
        "--runtime-dependencies",
        join(dir, "runtime-dependencies.json"),
        "--decisions",
        join(dir, "decisions.jsonl"),
        "--risks",
        join(dir, "risks.json"),
        "--validation",
        join(dir, "validation.json"),
        "--linear",
        join(dir, "linear.json"),
        "--out",
        join(dir, "reports"),
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 1, result.stderr);
    assert.match(
      readFileSync(join(dir, "reports", "drift-report.json"), "utf8"),
      /orphan_requirement/,
    );
    assert.match(
      readFileSync(join(dir, "reports", "drift-report.json"), "utf8"),
      /evidence_receipt_invalid/,
    );
    assert.match(
      readFileSync(join(dir, "reports", "drift-report.json"), "utf8"),
      /validation_plan_invalid/,
    );
    const manifest = JSON.parse(
      readFileSync(join(dir, "reports", "delivery-manifest.json"), "utf8"),
    );
    assert.equal(
      manifest.liveEvidence.exact.ledger,
      "_audit/DEFECT_LEDGER.md",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("traces a source parent through its executable children", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-family-"));
  try {
    writeFileSync(
      join(dir, "inventory.md"),
      "| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |\n|---|---|---|---|---|---|---|---|---|\n| F-001 | Authentication | integration_surface | §6.1 | — | master_spec | v7.1.0a | Authentication | — |\n",
    );
    writeFileSync(
      join(dir, "feature-dependencies.json"),
      JSON.stringify({ schemaVersion: 1, repairs: [] }),
    );
    writeFileSync(
      join(dir, "stamp.json"),
      JSON.stringify({ summary: {}, findings: [] }),
    );
    writeFileSync(
      join(dir, "exact.json"),
      JSON.stringify({ open_rows: 0 }),
    );
    writeFileSync(
      join(dir, "releases.json"),
      JSON.stringify({
        releases: releaseNames.map((name, sequence) => ({
          id: `R${sequence}`,
          name,
          sequence,
          customerHypothesis: "customer",
          operationalHypothesis: "operations",
          pilot: "pilot",
          metrics: ["completion"],
          customerGate: "customer proof",
          operationalGate: "operational proof",
        })),
      }),
    );
    writeFileSync(
      join(dir, "release-policy.json"),
      JSON.stringify({
        schemaVersion: 1,
        r0Roots: ["F-001"],
        baselineAssignments: [
          {
            requirementId: "F-001",
            release: "R0",
            rationale: "R0 authentication foundation",
          },
        ],
      }),
    );
    writeFileSync(
      join(dir, "release-plan.json"),
      JSON.stringify({
        assignments: [
          {
            requirementId: "F-001",
            release: "R0",
            rationale: "R0 authentication foundation",
          },
        ],
      }),
    );
    writeFileSync(
      join(dir, "dispositions.json"),
      JSON.stringify({ overrides: [] }),
    );
    writeFileSync(
      join(dir, "runtime-dependencies.json"),
      JSON.stringify({ dependencies: [] }),
    );
    writeFileSync(
      join(dir, "decisions.jsonl"),
      ["DEC-REPO-001", "DEC-WIP-001", "DEC-OWNER-001", "DEC-HEADER-001"]
        .map((id) =>
          JSON.stringify({
            id,
            status: "active",
            decision: id,
            assumption: "reversible",
            validationTrigger: "new evidence",
          }),
        )
        .join("\n"),
    );
    writeFileSync(
      join(dir, "risks.json"),
      JSON.stringify({
        risks: [
          {
            id: "RISK-001",
            statement: "Risk",
            owner: "Owner",
            trigger: "Trigger",
            response: "Response",
          },
        ],
      }),
    );
    writeFileSync(
      join(dir, "validation.json"),
      JSON.stringify(completeValidationPlan()),
    );
    const issue = (overrides: Record<string, unknown>) => ({
      id: "PLA-1",
      parentId: null,
      sourceId: null,
      title: "Issue",
      kind: "executable",
      labels: [],
      release: "R0",
      milestone: "Permissioned journeys ready",
      dependencies: [],
      owner: "Blake Rowley",
      reviewer: "Blake Rowley",
      estimate: 3,
      paths: ["convex/auth.ts"],
      tests: { success: "sign in", failure: "deny", recovery: "restore" },
      rollout: "preview",
      rollback: "prior commit",
      telemetry: "auth_result",
      proof: "reports/evidence/auth.json",
      sourceVersion: "v7.1.0a",
      sourceSection: "§6.1",
      outcome: "Issue outcome",
      ...overrides,
    });
    writeFileSync(
      join(dir, "linear.json"),
      JSON.stringify({
        issues: [
          issue({
            id: "PLA-203",
            kind: "parent",
            outcome: "Identity group",
          }),
          issue({
            id: "PLA-283",
            parentId: "PLA-203",
            sourceId: "F-001",
            kind: "parent",
            paths: [],
            tests: { success: null, failure: null, recovery: null },
            rollout: null,
            rollback: null,
            telemetry: null,
            proof: null,
            outcome: "Authentication parent",
          }),
          issue({
            id: "PLA-942",
            parentId: "PLA-283",
            paths: ["convex/auth.ts"],
            outcome: "Authenticated session",
          }),
        ],
      }),
    );
    const reports = join(dir, "reports");
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
        "tools/delivery/generate.ts",
        "--root",
        process.cwd(),
        "--inventory",
        join(dir, "inventory.md"),
        "--feature-dependencies",
        join(dir, "feature-dependencies.json"),
        "--stamp",
        join(dir, "stamp.json"),
        "--exact",
        join(dir, "exact.json"),
        "--releases",
        join(dir, "releases.json"),
        "--release-plan",
        join(dir, "release-plan.json"),
        "--policy",
        join(dir, "release-policy.json"),
        "--dispositions",
        join(dir, "dispositions.json"),
        "--runtime-dependencies",
        join(dir, "runtime-dependencies.json"),
        "--decisions",
        join(dir, "decisions.jsonl"),
        "--risks",
        join(dir, "risks.json"),
        "--validation",
        join(dir, "validation.json"),
        "--linear",
        join(dir, "linear.json"),
        "--out",
        reports,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 1, result.stderr);
    const drift = JSON.parse(
      readFileSync(join(reports, "drift-report.json"), "utf8"),
    );
    assert.deepEqual(drift.findings, []);
    const journeyReadiness = JSON.parse(
      readFileSync(join(reports, "journey-readiness.json"), "utf8"),
    );
    assert.ok(
      journeyReadiness.findings.some(
        (finding: { code: string }) =>
          finding.code === "journey_phase_unsupported",
      ),
    );
    const traceability = JSON.parse(
      readFileSync(join(reports, "traceability-map.json"), "utf8"),
    );
    assert.deepEqual(traceability[0].executableIssueIds, ["PLA-942"]);
    assert.deepEqual(traceability[0].executableIssues, [
      {
        issueId: "PLA-942",
        milestone: "Permissioned journeys ready",
        dependencies: [],
        paths: ["convex/auth.ts"],
        tests: { success: "sign in", failure: "deny", recovery: "restore" },
        rollout: "preview",
        rollback: "prior commit",
        telemetry: "auth_result",
        proof: "reports/evidence/auth.json",
      },
    ]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function policyFailureFixture(
  policy: Record<string, unknown>,
): { dir: string; args: string[]; reports: string } {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-policy-"));
  const inventory = [
    "| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |",
    "|---|---|---|---|---|---|---|---|---|",
    "| F-001 | Root | journey | §1 | — | master_spec | v7.1.0a | Root | — |",
    "| F-002 | Later | surface | §2 | — | master_spec | v7.1.0a | Later | — |",
    "",
  ].join("\n");
  writeFileSync(join(dir, "inventory.md"), inventory);
  writeFileSync(
    join(dir, "feature-dependencies.json"),
    JSON.stringify({ schemaVersion: 1, repairs: [] }),
  );
  writeFileSync(
    join(dir, "stamp.json"),
    JSON.stringify({ summary: {}, findings: [] }),
  );
  writeFileSync(join(dir, "exact.json"), JSON.stringify({ open_rows: 0 }));
  writeFileSync(
    join(dir, "releases.json"),
    JSON.stringify({
      releases: releaseNames.map((name, sequence) => ({
        id: `R${sequence}`,
        name,
        sequence,
        customerHypothesis: "customer",
        operationalHypothesis: "operations",
        pilot: "pilot",
        metrics: ["completion"],
        customerGate: "customer proof",
        operationalGate: "operational proof",
      })),
    }),
  );
  writeFileSync(join(dir, "release-policy.json"), JSON.stringify(policy));
  writeFileSync(
    join(dir, "release-plan.json"),
    JSON.stringify({ assignments: [] }),
  );
  writeFileSync(
    join(dir, "dispositions.json"),
    JSON.stringify({ overrides: [] }),
  );
  writeFileSync(
    join(dir, "runtime-dependencies.json"),
    JSON.stringify({ dependencies: [] }),
  );
  writeFileSync(join(dir, "decisions.jsonl"), "");
  writeFileSync(join(dir, "risks.json"), JSON.stringify({ risks: [] }));
  writeFileSync(
    join(dir, "validation.json"),
    JSON.stringify(completeValidationPlan()),
  );
  writeFileSync(join(dir, "linear.json"), JSON.stringify({ issues: [] }));
  const reports = join(dir, "reports");
  return {
    dir,
    reports,
    args: [
      "--root",
      process.cwd(),
      "--inventory",
      join(dir, "inventory.md"),
      "--feature-dependencies",
      join(dir, "feature-dependencies.json"),
      "--policy",
      join(dir, "release-policy.json"),
      "--stamp",
      join(dir, "stamp.json"),
      "--exact",
      join(dir, "exact.json"),
      "--releases",
      join(dir, "releases.json"),
      "--release-plan",
      join(dir, "release-plan.json"),
      "--dispositions",
      join(dir, "dispositions.json"),
      "--runtime-dependencies",
      join(dir, "runtime-dependencies.json"),
      "--decisions",
      join(dir, "decisions.jsonl"),
      "--risks",
      join(dir, "risks.json"),
      "--validation",
      join(dir, "validation.json"),
      "--linear",
      join(dir, "linear.json"),
      "--out",
      reports,
    ],
  };
}

function runPolicyFailureFixture(args: string[]) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
      "tools/delivery/generate.ts",
      ...args,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
}

test("generation rejects a missing policy assignment", () => {
  const fixture = policyFailureFixture({
    schemaVersion: 1,
    r0Roots: ["F-001"],
    baselineAssignments: [
      { requirementId: "F-001", release: "R0", rationale: "R0 root" },
    ],
  });
  try {
    const result = runPolicyFailureFixture(fixture.args);
    assert.equal(result.status, 1);
    assert.match(
      readFileSync(join(fixture.reports, "drift-report.json"), "utf8"),
      /release_policy_unclassified/,
    );
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("generation rejects an R0 assignment outside the approved closure", () => {
  const fixture = policyFailureFixture({
    schemaVersion: 1,
    r0Roots: ["F-001"],
    baselineAssignments: [
      { requirementId: "F-001", release: "R0", rationale: "R0 root" },
      { requirementId: "F-002", release: "R0", rationale: "Not approved" },
    ],
  });
  try {
    const result = runPolicyFailureFixture(fixture.args);
    assert.equal(result.status, 1);
    assert.match(
      readFileSync(join(fixture.reports, "drift-report.json"), "utf8"),
      /release_policy_unexpected_r0/,
    );
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});

test("generation rejects a release plan that differs from policy", () => {
  const fixture = policyFailureFixture({
    schemaVersion: 1,
    r0Roots: ["F-001"],
    baselineAssignments: [
      { requirementId: "F-001", release: "R0", rationale: "R0 root" },
      { requirementId: "F-002", release: "R1", rationale: "Later work" },
    ],
  });
  try {
    const result = runPolicyFailureFixture(fixture.args);
    assert.equal(result.status, 1);
    assert.match(
      readFileSync(join(fixture.reports, "drift-report.json"), "utf8"),
      /release_plan_policy_drift/,
    );
  } finally {
    rmSync(fixture.dir, { recursive: true, force: true });
  }
});
