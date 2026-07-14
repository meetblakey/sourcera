/**
 * Gate: `entitlement_matrix_kb_suggestion_rate_card_cardinality`
 *
 * Assertion: §34.3.4 publishes `kb_suggestion_buyer` and
 * `kb_suggestion_seller` as separate rows and does not publish the legacy
 * `kb_suggestion` string as a customer-billed operational capability.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, rateCardCapabilityIds, sectionTextByTitle } from "./entitlement_matrix_gate_helpers.js";

function kbSuggestionRateCardFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const ids = rateCardCapabilityIds(doc, findings);
  for (const required of ["kb_suggestion_buyer", "kb_suggestion_seller"]) {
    if (!ids.has(required)) {
      push(findings, doc, 0, required, `§34.3.4 rate card must publish ${required} as its own customer-billed row.`);
    }
  }
  if (ids.has("kb_suggestion")) {
    const section = sectionTextByTitle(doc, /^34\.3\.4 Summary Per-Capability Rate Card/);
    push(
      findings,
      doc,
      section?.startLine ?? 0,
      "kb_suggestion",
      "§34.3.4 must not publish legacy kb_suggestion as a customer-billed operational capability; it is alias-only.",
    );
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "entitlement_matrix_kb_suggestion_rate_card_cardinality",
  sourcePhase: "v7.2.0-REM Phase EM",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...kbSuggestionRateCardFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "entitlement_matrix_kb_suggestion_rate_card_cardinality")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
