/**
 * Gate: `entitlement_matrix_enforcement_mode_enum_bound`
 *
 * Assertion: every §34.8.5 Entitlement Matrix enforcement_mode cell resolves
 * to Appendix J `capability_enforcement_mode`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { appendixJEnumValues, entitlementMatrixRows, m5RuntimeActiveFindings, push } from "./entitlement_matrix_gate_helpers.js";

function enforcementModeFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const allowed = appendixJEnumValues(doc, /^capability_enforcement_mode/, findings, "capability_enforcement_mode");
  for (const row of entitlementMatrixRows(doc, findings)) {
    if (!allowed.has(row.enforcementMode)) {
      push(
        findings,
        doc,
        row.line,
        row.enforcementMode,
        `§34.8.5 enforcement_mode for ${row.capabilityId} must be one of Appendix J capability_enforcement_mode.`,
      );
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "entitlement_matrix_enforcement_mode_enum_bound",
  sourcePhase: "v7.2.0-REM Phase EM",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...enforcementModeFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "entitlement_matrix_enforcement_mode_enum_bound")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
