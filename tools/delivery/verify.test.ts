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

test("verifies regenerated reports and rejects a hand edit", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-verify-"));
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
          operationalGate: "operations proof",
        })),
      }),
    );
    writeFileSync(
      join(dir, "release-policy.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          r0Roots: ["F-001"],
          baselineAssignments: [
            {
              requirementId: "F-001",
              release: "R0",
              rationale: "R0 foundation",
            },
          ],
        },
        null,
        2,
      )}\n`,
    );
    writeFileSync(
      join(dir, "release-plan.json"),
      `${JSON.stringify(
        {
          assignments: [
            {
              requirementId: "F-001",
              release: "R0",
              rationale: "R0 foundation",
            },
          ],
        },
        null,
        2,
      )}\n`,
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
      [
        "DEC-REPO-001",
        "DEC-WIP-001",
        "DEC-OWNER-001",
        "DEC-HEADER-001",
        "DEC-PRIORITY-001",
      ]
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
    writeFileSync(
      join(dir, "linear.json"),
      JSON.stringify({
        issues: [
          {
            id: "PLA-1",
            parentId: null,
            sourceId: "F-001",
            title: "A",
            kind: "executable",
            labels: [],
            release: "R0",
            milestone: null,
            dependencies: [],
            owner: null,
            reviewer: null,
            estimate: null,
            paths: [],
            tests: { success: null, failure: null, recovery: null },
            rollout: null,
            rollback: null,
            telemetry: null,
            proof: null,
            sourceVersion: "v7.1.0a",
            sourceSection: "§1",
            outcome: "A",
          },
        ],
      }),
    );
    writeFileSync(
      join(dir, "linear-project-scope.json"),
      JSON.stringify({
        schemaVersion: 1,
        projects: [{ id: "project-1", name: "Project" }],
      }),
    );

    const common = [
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
      "--linear-project-scope",
      join(dir, "linear-project-scope.json"),
    ];
    const node = [
      "--import",
      "./tools/spec-lint/node_modules/tsx/dist/loader.mjs",
    ];
    const reports = join(dir, "reports");
    const generated = spawnSync(
      process.execPath,
      [...node, "tools/delivery/generate.ts", ...common, "--out", reports],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(generated.status, 1, generated.stderr);
    const journeyReportPath = join(reports, "journey-readiness.json");
    assert.equal(existsSync(journeyReportPath), true, generated.stderr);

    const verify = () =>
      spawnSync(
        process.execPath,
        [
          ...node,
          "tools/delivery/verify.ts",
          ...common,
          "--reports",
          reports,
        ],
        { cwd: process.cwd(), encoding: "utf8" },
      );
    const clean = verify();
    assert.equal(clean.status, 1);
    assert.match(clean.stderr, /Delivery findings remain/);
    const releasePlan = JSON.parse(
      readFileSync(join(dir, "release-plan.json"), "utf8"),
    );
    releasePlan.assignments[0].release = "R5";
    writeFileSync(
      join(dir, "release-plan.json"),
      `${JSON.stringify(releasePlan, null, 2)}\n`,
    );
    const editedPlan = verify();
    assert.equal(editedPlan.status, 1);
    assert.match(editedPlan.stderr, /release plan differs/);
    releasePlan.assignments[0].release = "R0";
    writeFileSync(
      join(dir, "release-plan.json"),
      `${JSON.stringify(releasePlan, null, 2)}\n`,
    );
    const journeyReport = readFileSync(journeyReportPath, "utf8");
    writeFileSync(journeyReportPath, "{}\n");
    const editedJourney = verify();
    assert.equal(editedJourney.status, 1);
    assert.match(
      editedJourney.stderr,
      /Generated report differs: journey-readiness\.json/,
    );
    writeFileSync(journeyReportPath, journeyReport);
    writeFileSync(join(reports, "release-scorecard.json"), "{}\n");
    const edited = verify();
    assert.equal(edited.status, 1);
    assert.match(edited.stderr, /Generated report differs/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
