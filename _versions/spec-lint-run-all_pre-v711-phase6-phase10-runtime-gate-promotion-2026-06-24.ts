/**
 * Sourcera Spec-Lint — batch runner for the M02.3 runtime-active gate set.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.4 (CI gate cluster), §M.5.4
 * (catalog). Runs every harness gate promoted to `runtime_active` in the
 * v7.2.0-REM M02.3 Runtime-Wiring pass, aggregates results, prints a summary,
 * and exits non-zero (fail-closed) if any gate fails or hits a parse_error.
 *
 * Usage:
 *   npx tsx run-all.ts --spec ../../Sourcera_Master_Spec.md \
 *                      --ux ../../UX_Design_of_Sourcera.md [--no-emit]
 */

import { loadDoc } from "./lib/spec_loader.js";
import { parseOverrides } from "./lib/overrides.js";
import { isEntrypoint, runGate } from "./lib/gate.js";
import { emit } from "./lib/emit.js";
import { EXIT_CODE } from "./lib/types.js";
import type { GateContext, SpecDoc, SpecLintGate } from "./lib/types.js";
import { existsSync } from "node:fs";

import { gate as anchorNoColon } from "./gates/appendix_anchor_slug_no_colon.js";
import { gate as principle9 } from "./gates/principle_9_anchor_canonicality.js";
import { gate as internalNoHttp } from "./gates/appendix_i_internal_event_no_http_status.js";
import { gate as soloNumeric } from "./gates/solo_tier_numeric_single_source.js";
import { gate as retention } from "./gates/retention_singleton_section_40_2_canonical.js";
import { gate as defenseView } from "./gates/defense_view_appendix_i_pairing.js";
import { gate as m5RuntimeCoverage } from "./gates/appendix_m5_runtime_status_coverage.js";
import { gate as m5HeaderParity } from "./gates/appendix_m5_header_count_parity.js";
import { gate as evalStarterPairing } from "./gates/eval_starter_appendix_i_pairing.js";
import { gate as m5CrossRefResolution } from "./gates/appendix_m5_cross_reference_resolution_completeness.js";
import { gate as sectionAnchorNoColon } from "./gates/section_anchor_slug_no_colon.js";
import { gate as aeTargetVersion } from "./gates/ae_ledger_target_version_completeness.js";
import { gate as aeAcceptanceTest } from "./gates/ae_ledger_acceptance_test_completeness.js";
import { gate as kAnonFloorSingleSource } from "./gates/k_anon_floor_single_source.js";
import { gate as entityConsoleScope } from "./gates/entity_console_scope_paragraph_required.js";
import { gate as ghostBidImportSize } from "./gates/ghost_bid_import_size_single_source.js";
import { gate as sellerMayaAuditActionNamespace } from "./gates/seller_maya_audit_action_namespace.js";
import { gate as auditEventSchemaSingleSource } from "./gates/audit_event_schema_single_source_of_truth.js";
import { gate as auditLogScopeSingleSource } from "./gates/audit_log_scope_single_source.js";

/**
 * Gates promoted to `runtime_active`: verified to PASS on the latest
 * main-branch Master Spec and to pass/fail their CI fixtures. These are the
 * merge-blocking required checks.
 */
export const GATES_RUNTIME_ACTIVE: SpecLintGate[] = [
  anchorNoColon,
  principle9,
  internalNoHttp,
  defenseView,
  m5RuntimeCoverage,
  m5HeaderParity,
  evalStarterPairing,
  m5CrossRefResolution,
  soloNumeric,
  retention,
  sectionAnchorNoColon,
  kAnonFloorSingleSource,
  entityConsoleScope,
  ghostBidImportSize,
  sellerMayaAuditActionNamespace,
  auditEventSchemaSingleSource,
  auditLogScopeSingleSource,
];

/**
 * Advisory gates whose detector artifacts exist but whose release-orchestration
 * ratification remains separate from the M02.3 spec-tree-lint runtime set.
 */
export const GATES_ADVISORY: SpecLintGate[] = [
  aeTargetVersion,
  aeAcceptanceTest,
];

/** Full set (used by the dispatcher). */
export const GATES: SpecLintGate[] = [...GATES_RUNTIME_ACTIVE, ...GATES_ADVISORY];

function arg(name: string, def?: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

async function main() {
  const specPath = arg("--spec", "../../Sourcera_Master_Spec.md")!;
  const uxPath = arg("--ux", "../../UX_Design_of_Sourcera.md");
  const reconPath = arg("--reconciliation");
  const aeLedgerPath = arg("--ae-ledger", "../../_integration/AUTHORED_EXTENSIONS_LEDGER.md");
  const prBodyPath = arg("--pr-body");
  const noEmit = process.argv.includes("--no-emit");

  const masterSpec: SpecDoc = loadDoc(specPath);
  const uxSpec = uxPath && existsSync(uxPath) ? loadDoc(uxPath) : undefined;
  const reconciliation =
    reconPath && existsSync(reconPath) ? loadDoc(reconPath) : undefined;
  const prBody = prBodyPath && existsSync(prBodyPath) ? loadDoc(prBodyPath).text : "";

  let blockingWorst = 0;
  const summary: Array<Record<string, string | number>> = [];

  const runOne = async (g: SpecLintGate, blocking: boolean) => {
    const overrides = parseOverrides(prBody, { knownGateIds: new Set([g.id]) });
    const ctx: GateContext = {
      masterSpec,
      uxSpec: g.inputs.uxSpec ? uxSpec : undefined,
      reconciliation: g.inputs.reconciliation ? reconciliation : undefined,
      overrides,
      extraDocs: g.inputs.aeLedger && aeLedgerPath && existsSync(aeLedgerPath)
        ? new Map([["aeLedger", loadDoc(aeLedgerPath)]])
        : new Map(),
    };
    const result = runGate(g, ctx);
    if (!noEmit) {
      try {
        await emit(result, {
          prId: process.env.PR_ID,
          commitSha: process.env.COMMIT_SHA,
          mergeBaseSha: process.env.MERGE_BASE_SHA,
        });
      } catch {
        /* audit emit never masks the verdict */
      }
    }
    if (blocking) blockingWorst = Math.max(blockingWorst, EXIT_CODE[result.outcome]);
    const live = result.findings.filter((f) => !f.suppressed_by_override).length;
    summary.push({ mode: blocking ? "blocking" : "advisory", gate: g.id, outcome: result.outcome, findings: live });
    if (result.outcome !== "pass" && result.outcome !== "override_applied") {
      for (const f of result.findings.filter((x) => !x.suppressed_by_override).slice(0, 8)) {
        process.stderr.write(`  [${blocking ? "BLOCK" : "advis"}] [${g.id}] ${f.file}:${f.line} ${f.message}\n`);
      }
    }
  };

  for (const g of GATES_RUNTIME_ACTIVE) await runOne(g, true);
  for (const g of GATES_ADVISORY) await runOne(g, false);

  process.stdout.write("\n=== spec-lint batch summary ===\n");
  for (const s of summary) {
    process.stdout.write(
      `${String(s.mode).padEnd(9)} ${String(s.outcome).padEnd(16)} ${String(s.findings).padStart(4)}  ${s.gate}\n`,
    );
  }
  process.stdout.write(
    `\nblocking gates worst exit code: ${blockingWorst} (advisory findings are non-blocking)\n`,
  );
  process.exitCode = blockingWorst;
}

if (isEntrypoint(import.meta.url)) {
  main().catch((e) => {
    process.stderr.write(`run-all error: ${(e as Error).stack ?? e}\n`);
    process.exitCode = 2;
  });
}
