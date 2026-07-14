/**
 * Gate: `entitlement_matrix_upgrade_surface_typed`
 *
 * Assertion: every §34.8.5 upgrade_surface cell resolves to Appendix J
 * `entitlement_upgrade_surface`, and each concrete CTA resolves to the CTA Copy
 * Registry.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { appendixJEnumValues, ctaRegistrySurfaces, entitlementMatrixRows, m5RuntimeActiveFindings, push } from "./entitlement_matrix_gate_helpers.js";

function upgradeSurfaceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const allowed = appendixJEnumValues(doc, /^entitlement_upgrade_surface/, findings, "entitlement_upgrade_surface");
  const ctaRegistry = ctaRegistrySurfaces(doc, findings);
  for (const row of entitlementMatrixRows(doc, findings)) {
    if (!allowed.has(row.upgradeSurface)) {
      push(
        findings,
        doc,
        row.line,
        row.upgradeSurface,
        `§34.8.5 upgrade_surface for ${row.capabilityId} must be one of Appendix J entitlement_upgrade_surface.`,
      );
      continue;
    }
    if (row.upgradeSurface !== "not_applicable" && !ctaRegistry.has(row.upgradeSurface)) {
      push(
        findings,
        doc,
        row.line,
        row.upgradeSurface,
        `§34.8.5 upgrade_surface for ${row.capabilityId} must resolve to a CTA Copy Registry row.`,
      );
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "entitlement_matrix_upgrade_surface_typed",
  sourcePhase: "v7.2.0-REM Phase EM",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...upgradeSurfaceFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "entitlement_matrix_upgrade_surface_typed")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
