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

const releaseNames = [
  "First Defensible Evaluation",
  "Team Evaluation & Collaboration",
  "Repeatability, Reporting & Operations",
  "Marketplace Supply, Discovery, Matching & Trust",
  "Intelligence, Scenarios, TCO & Agents",
  "Enterprise Integrations, Compliance, Globalization & Scale",
];

test("generates deterministic reports and fails on orphan work", () => {
  const dir = mkdtempSync(join(tmpdir(), "sourcera-delivery-"));
  try {
    writeFileSync(
      join(dir, "inventory.md"),
      "| feature_id | feature_name | feature_class | primary_section_anchor | secondary_section_anchors | originating_doc | introduced_in_version | one_line_summary | known_dependencies |\n|---|---|---|---|---|---|---|---|---|\n| F-001 | A | surface | §1 | — | master_spec | v7.1.0a | A | — |\n",
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
      JSON.stringify({ releases: [] }),
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
      JSON.stringify({
        customerProof: [],
        operationalProof: [],
        forecastProof: [],
        executionEvidence: {
          tests: [],
          deploy: [],
          rollback: [],
          runtime: [],
        },
      }),
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
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const drift = JSON.parse(
      readFileSync(join(reports, "drift-report.json"), "utf8"),
    );
    assert.deepEqual(drift.findings, []);
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
