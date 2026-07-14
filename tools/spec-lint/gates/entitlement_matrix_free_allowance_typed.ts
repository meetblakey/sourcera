/**
 * Gate: `entitlement_matrix_free_allowance_typed`
 *
 * Assertion: every §34.8.5 free_allowance_ops cell is either an integer for
 * customer-billed AI rows or `not_applicable` for n_a_* rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { entitlementMatrixRows, m5RuntimeActiveFindings, push } from "./entitlement_matrix_gate_helpers.js";

function freeAllowanceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const row of entitlementMatrixRows(doc, findings)) {
    if (row.enforcementMode === "soft" || row.enforcementMode === "hard") {
      if (!/^\d+$/.test(row.freeAllowanceOps)) {
        push(
          findings,
          doc,
          row.line,
          row.freeAllowanceOps,
          `§34.8.5 free_allowance_ops for ${row.capabilityId} must be a non-negative integer when enforcement_mode=${row.enforcementMode}.`,
        );
      }
      continue;
    }
    if (row.enforcementMode.startsWith("n_a_") && row.freeAllowanceOps !== "not_applicable") {
      push(
        findings,
        doc,
        row.line,
        row.freeAllowanceOps,
        `§34.8.5 free_allowance_ops for ${row.capabilityId} must be not_applicable when enforcement_mode=${row.enforcementMode}.`,
      );
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "entitlement_matrix_free_allowance_typed",
  sourcePhase: "v7.2.0-REM Phase EM",
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...freeAllowanceFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "entitlement_matrix_free_allowance_typed")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
