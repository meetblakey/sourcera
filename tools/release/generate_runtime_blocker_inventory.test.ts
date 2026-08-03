import { strict as assert } from "node:assert";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("inventory language states only the evidenced posture", () => {
  const outputDir = mkdtempSync(join(tmpdir(), "sourcera-runtime-inventory-"));
  const markdownPath = join(outputDir, "inventory.md");
  const csvPath = join(outputDir, "inventory.csv");
  const stampPath = join(outputDir, "stamp.json");

  try {
    const stamp = spawnSync(
      process.execPath,
      [
        "--import",
        join(process.cwd(), "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
        "tools/release/stamp_gate.ts",
        "--json",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(stamp.status, 1, stamp.stderr);
    writeFileSync(stampPath, stamp.stdout);

    const result = spawnSync(
      process.execPath,
      [
        "--import",
        join(process.cwd(), "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
        "tools/release/generate_runtime_blocker_inventory.ts",
        "--root",
        process.cwd(),
        "--stamp-json",
        stampPath,
        "--md",
        markdownPath,
        "--csv",
        csvPath,
        "--date",
        "2026-07-11",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    assert.equal(result.status, 0, result.stderr);
    const report = readFileSync(markdownPath, "utf8");
    const stampResult = JSON.parse(stamp.stdout) as { summary: { blocker_count: number } };
    assert.match(report, /All current blockers are product\/runtime evidence; release-ratification blockers are zero\./);
    assert.match(report, /Human sign-off blockers: 0\./);
    assert.doesNotMatch(report, /latest documentation closure adds active spec-tree proof/i);
    assert.doesNotMatch(report, /evidence paths remain absent for all/i);
    const presence = report.match(/Named path presence: \*\*(\d+) all missing \/ (\d+) mixed \/ (\d+) all present \/ (\d+) not named\*\*\./);
    assert.ok(presence, "named-path presence summary is missing");
    const [allMissing, mixed, allPresent, noneNamed] = presence.slice(1).map(Number);
    assert.deepEqual([allMissing, mixed, allPresent, noneNamed], [201, 1, 13, 2]);
    assert.equal(allMissing + mixed + allPresent + noneNamed, stampResult.summary.blocker_count);
    assert.match(report, /A present local path does not promote a pending runtime row\./);
    assert.match(report, /\| Evidence posture \| Count \|/);
    assert.match(report, new RegExp(`local_guard_present_external_evidence_pending[^|]*\\| ${allPresent} \\|`));
    assert.match(report, new RegExp(`partial_local_chain_external_evidence_pending[^|]*\\| ${mixed} \\|`));
    assert.match(report, new RegExp(`required_product_runtime_evidence_missing[^|]*\\| ${allMissing + noneNamed} \\|`));
    assert.match(report, /required_product_runtime_evidence_missing[^|]*\| 203 \|/);
    assert.match(report, /local_guard_present_external_evidence_pending[^|]*\| 13 \|/);
    assert.match(report, /partial_local_chain_external_evidence_pending[^|]*\| 1 \|/);
    const appendixMRow = report.split(/\r?\n/).find((line) => line.startsWith("| `appendix_m_coverage_on_diff`"));
    assert.match(appendixMRow ?? "", /tools\/spec-lint\/appendix_m_coverage_on_diff\.ts/);
    assert.match(appendixMRow ?? "", /tools\/release\/runtime_evidence\/appendix_m_coverage_on_diff\.json/);
    assert.match(appendixMRow ?? "", /appendix_m_coverage_on_diff\.ts:present/);
    assert.match(appendixMRow ?? "", /appendix_m_coverage_on_diff\.json:missing/);
    assert.match(appendixMRow ?? "", /partial_local_chain_external_evidence_pending/);
    assert.match(appendixMRow ?? "", /`Sourcera_Master_Spec\.md` post-edit Markdown parse tree/);
    const soloTrialRow = report.split(/\r?\n/).find((line) => line.startsWith("| `solo_trial_one_per_org_lifetime`"));
    assert.match(soloTrialRow ?? "", /local_guard_present_external_evidence_pending/);
    assert.match(soloTrialRow ?? "", /pr_lint \+ deploy_validator/);
    assert.equal(statSync("tests/integration").isDirectory(), true);
    const soloDeadlineRow = report.split(/\r?\n/)
      .find((line) => line.startsWith("| `solo_deadline_countdown_renders_in_user_timezone`"));
    assert.match(soloDeadlineRow ?? "", /required_product_runtime_evidence_missing/);
    assert.match(soloDeadlineRow ?? "", /tests\/integration:missing/);
    assert.doesNotMatch(soloDeadlineRow ?? "", /tests\/integration:present/);
    const dsarResidencyRow = report.split(/\r?\n/).find((line) => line.startsWith("| `dsar_cascade_residency_partition_isolation`"));
    assert.match(dsarResidencyRow ?? "", /required_product_runtime_evidence_missing/);
    assert.match(dsarResidencyRow ?? "", /Future deploy\/static chain/);
    assert.match(dsarResidencyRow ?? "", /tests\/security\/dsar_cascade_residency_partition_isolation\.spec\.ts/);
    assert.match(dsarResidencyRow ?? "", /no named local artifact path/);
    assert.doesNotMatch(dsarResidencyRow ?? "", /tools\/spec-lint\/gates\/dsar_cascade_residency_partition_isolation\.ts/);
    const opsCapsRow = report.split(/\r?\n/).find((line) => line.startsWith("| `ops_session_numerical_caps_single_source`"));
    assert.match(opsCapsRow ?? "", /convex\/deploy_validators\/ops_session_request_history_caps\.ts/);
    const buyerTrialAuditRow = report.split(/\r?\n/)
      .find((line) => line.startsWith("| `buyer_trial_audit_action_registration`"));
    assert.match(buyerTrialAuditRow ?? "", /convex\/deploy_validators\/buyer_trial_audit_action_registration\.ts:missing/);
    assert.match(buyerTrialAuditRow ?? "", /tests\/transaction\/buyer_trial_audit_action_registration\.spec\.ts:missing/);
    assert.match(buyerTrialAuditRow ?? "", /tests\/integration\/buyer_trial_audit_action_registration\.spec\.ts:missing/);
    assert.doesNotMatch(buyerTrialAuditRow ?? "", /\.github\/workflows\/deploy-validator\.yml/);
    const queryScopingRow = report.split(/\r?\n/)
      .find((line) => line.startsWith("| `query_scoping_console_required`"));
    assert.match(queryScopingRow ?? "", /convex\/deploy_validators\/query_scoping_console_required\.ts:missing/);
    assert.match(queryScopingRow ?? "", /tests\/integration\/query_scoping_console_required\.spec\.ts:missing/);
    assert.match(queryScopingRow ?? "", /tests\/security\/query_scoping_console_required_non_leak\.spec\.ts:missing/);
    assert.doesNotMatch(queryScopingRow ?? "", /tests\/integration:present/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});

function inventoryIds(csvText: string): string[] {
  return csvText.trim().split(/\r?\n/).slice(1).map((line) => {
    const match = line.match(/^"((?:[^"]|"")*)",/);
    assert.ok(match, `malformed inventory row: ${line}`);
    return match[1].replace(/""/g, '"');
  });
}

function matrixIds(csvText: string): string[] {
  return csvText.trim().split(/\r?\n/).slice(1).map((line) => {
    const match = line.match(/^"(?:[^"]|"")*","((?:[^"]|"")*)",/);
    assert.ok(match, `malformed matrix row: ${line}`);
    return match[1].replace(/""/g, '"');
  });
}

test("committed blocker inventory and matrix exactly match the live stamp", () => {
  const stamp = spawnSync(
    process.execPath,
    [
      "--import",
      join(process.cwd(), "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
      "tools/release/stamp_gate.ts",
      "--json",
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  assert.equal(stamp.status, 1, stamp.stderr);
  const stampResult = JSON.parse(stamp.stdout) as { findings: Array<{ id: string }> };
  const expected = stampResult.findings.map((finding) => finding.id).sort();
  const inventory = inventoryIds(
    readFileSync("_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv", "utf8"),
  ).sort();
  const matrix = matrixIds(
    readFileSync("_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv", "utf8"),
  ).sort();
  assert.deepEqual(inventory, expected, "committed blocker inventory drifted from the live stamp");
  assert.deepEqual(matrix, expected, "committed execution matrix drifted from the live stamp");
});

test("generator refreshes matrix rows and closure counts from the live stamp", () => {
  const outputDir = mkdtempSync(join(tmpdir(), "sourcera-runtime-matrix-"));
  const markdownPath = join(outputDir, "inventory.md");
  const csvPath = join(outputDir, "inventory.csv");
  const stampPath = join(outputDir, "stamp.json");
  const matrixPath = join(outputDir, "matrix.csv");
  const closurePlanPath = join(outputDir, "closure.md");

  try {
    const committedInventoryMarkdown = readFileSync(
      "_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md",
      "utf8",
    );
    const committedDate = committedInventoryMarkdown.match(/^\*\*Date:\*\* (\d{4}-\d{2}-\d{2})$/m)?.[1];
    assert.ok(committedDate, "committed inventory date is missing");
    copyFileSync("_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv", matrixPath);
    copyFileSync("_audit/V711_PRODUCTION_GRADE_RUNTIME_CLOSURE_PLAN_2026-07-13.md", closurePlanPath);
    const stamp = spawnSync(
      process.execPath,
      [
        "--import",
        join(process.cwd(), "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
        "tools/release/stamp_gate.ts",
        "--json",
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(stamp.status, 1, stamp.stderr);
    writeFileSync(stampPath, stamp.stdout);

    const result = spawnSync(
      process.execPath,
      [
        "--import",
        join(process.cwd(), "tools/spec-lint/node_modules/tsx/dist/loader.mjs"),
        "tools/release/generate_runtime_blocker_inventory.ts",
        "--root",
        process.cwd(),
        "--stamp-json",
        stampPath,
        "--md",
        markdownPath,
        "--csv",
        csvPath,
        "--matrix",
        matrixPath,
        "--closure-plan",
        closurePlanPath,
        "--date",
        committedDate,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);

    const stampResult = JSON.parse(stamp.stdout) as {
      summary: {
        blocker_count: number;
        runtime_rows: number;
        runtime_status_counts: Record<string, number>;
      };
      findings: Array<{ id: string }>;
    };
    const expected = stampResult.findings.map((finding) => finding.id).sort();
    assert.deepEqual(inventoryIds(readFileSync(csvPath, "utf8")).sort(), expected);
    assert.deepEqual(matrixIds(readFileSync(matrixPath, "utf8")).sort(), expected);
    const matrix = readFileSync(matrixPath, "utf8");
    assert.match(
      matrix,
      /"Billing, wallets, trials, subscriptions, and settlement","buyer_trial_audit_action_registration"/,
    );
    assert.match(
      matrix,
      /"Identity, permissions, entitlements, and console isolation","query_scoping_console_required"/,
    );
    const closure = readFileSync(closurePlanPath, "utf8");
    assert.match(closure, new RegExp(`- ${stampResult.summary.runtime_rows} runtime rows`));
    assert.match(closure, new RegExp(`- ${stampResult.summary.blocker_count} product/runtime blockers`));
    const statusCounts = stampResult.summary.runtime_status_counts;
    assert.match(
      closure,
      new RegExp(
        `\\| \\*\\*Total\\*\\* \\| \\*\\*${stampResult.summary.blocker_count}\\*\\* \\| `
        + `\\*\\*${statusCounts.spec_binding_pending_pack_m02_3}\\*\\* \\| `
        + `\\*\\*${statusCounts.spec_binding_pending_pack_m11_3}\\*\\* \\| `
        + `\\*\\*${statusCounts.spec_binding_pending_pack_m21_3}\\*\\* \\| `
        + `\\*\\*${statusCounts.spec_binding_pending_pack_m24_3}\\*\\* \\|`,
      ),
    );
    assert.equal(
      readFileSync(csvPath, "utf8"),
      readFileSync("_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv", "utf8"),
    );
    assert.equal(
      readFileSync(markdownPath, "utf8").split("\n## Verdict\n")[1],
      committedInventoryMarkdown.split("\n## Verdict\n")[1],
    );
    assert.equal(
      readFileSync(matrixPath, "utf8"),
      readFileSync("_audit/V711_PRODUCTION_GRADE_RUNTIME_EXECUTION_MATRIX_2026-07-13.csv", "utf8"),
    );
    assert.equal(
      closure,
      readFileSync("_audit/V711_PRODUCTION_GRADE_RUNTIME_CLOSURE_PLAN_2026-07-13.md", "utf8"),
    );
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});
