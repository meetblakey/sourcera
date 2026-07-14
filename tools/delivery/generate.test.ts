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
        forecastProof: [],
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
