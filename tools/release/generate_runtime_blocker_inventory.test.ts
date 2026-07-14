import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
    assert.match(report, /All current blockers are product\/runtime evidence; release-ratification blockers are zero\./);
    assert.match(report, /Human sign-off blockers: 0\./);
    assert.doesNotMatch(report, /latest documentation closure adds active spec-tree proof/i);
    assert.doesNotMatch(report, /evidence paths remain absent for all/i);
    assert.match(report, /Named path presence: \*\*196 all missing \/ 1 mixed \/ 13 all present \/ 2 not named\*\*\./);
    assert.match(report, /A present local path does not promote a pending runtime row\./);
    assert.match(report, /\| Evidence posture \| Count \|/);
    assert.match(report, /\| `local_guard_present_external_evidence_pending` \| 13 \|/);
    assert.match(report, /\| `partial_local_chain_external_evidence_pending` \| 1 \|/);
    assert.match(report, /\| `required_product_runtime_evidence_missing` \| 198 \|/);
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
    const dsarResidencyRow = report.split(/\r?\n/).find((line) => line.startsWith("| `dsar_cascade_residency_partition_isolation`"));
    assert.match(dsarResidencyRow ?? "", /required_product_runtime_evidence_missing/);
    assert.match(dsarResidencyRow ?? "", /DSAR cascade-walker code paths \(static analysis\)/);
    assert.match(dsarResidencyRow ?? "", /no named local artifact path/);
    assert.doesNotMatch(dsarResidencyRow ?? "", /tools\/spec-lint\/gates\/dsar_cascade_residency_partition_isolation\.ts/);
    const opsCapsRow = report.split(/\r?\n/).find((line) => line.startsWith("| `ops_session_numerical_caps_single_source`"));
    assert.match(opsCapsRow ?? "", /convex\/deploy_validators\/ops_session_request_history_caps\.ts/);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
});
