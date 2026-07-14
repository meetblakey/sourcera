/**
 * Gate: `kb_phase53_residual_contract_completeness`
 * Source defects: D-5.3-009 through D-5.3-011, D-5.3-013 through D-5.3-016,
 * D-5.3-018 through D-5.3-022, D-5.3-024, D-5.3-025, and D-KB18-009.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

const REQUIRED = [
  "**Phase 5.3 authored-extension reconciliation.**",
  "| `kb_value_meter_draft_time_saved_min_per_entry` | Integer |",
  "| `kb_value_meter_hourly_rate_cents` | Integer |",
  "**Estimated-value render guard.**",
  "`kb_value_meter_estimated_value_guarded`",
  "Cost per accepted draft within 110% of baseline (drift bands per §4.8.6 nightly recalculation authority).",
  "write idempotent §6.7 `ai_draft_emitted` after the draft commit",
  "| `doc_attach` | `ai_document_attached` |",
  "| `capability_declare_draft` | `ai_capability_declaration_drafted` |",
  "| `kb_entry_draft_create` | `ai_kb_entry_drafted` |",
  "| `request_seller_clarification` | `ai_seller_clarification_requested` |",
  "#### 21.4.3.A `kb_injection_scanner` Full Registry Row",
  "| `kb_injection_scanner` | sourcera_owned | Trust & Safety |",
  "| `first_resolved_page_category` | Enum |",
  "### Firecrawl Resolution Status-Line Variant (§22.6 / §22.20.6)",
  "99. **Firecrawl status-line variant selection.**",
  "**Seller Maya billing-scope plan guard.**",
  "`billing_detail_plan_forbidden`",
  "(Surface suppressed entirely on seller side; Vendor Opt-Out is engine-side per §27.4.4)",
  "`agent_definition_updated`, `skill_definition_updated`, `environment_definition_updated`",
  "`qualitative_match_score_label` (§4.5.12 / §27.4.6 / §48.2.11)",
  "`kb_phase53_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**",
  "`kb_value_meter_estimated_value_guard_runtime` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**",
  "`kb_injection_scanner_registry_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**",
  "`kb_state_persisting_audit_event_coverage` | audit_runtime_consistency | **`spec_binding_pending_pack_m11_3`**",
  "`firecrawl_status_line_variant_materialization` | render_runtime_consistency | **`spec_binding_pending_pack_m11_3`**",
  "`seller_maya_billing_detail_plan_guard` | billing_runtime_consistency | **`spec_binding_pending_pack_m24_3`**",
];

const FORBIDDEN = [
  "Cost per accepted draft within 110% of baseline (§4.8.6 drift band:",
  "(Already engine-only per Appendix M — no surface change)",
  "Phase 13 will extend the §22.6 entity field table.",
  "Solo / Free sellers retain API access per §32 generic plan-tier gates",
];

export const gate: SpecLintGate = {
  id: "kb_phase53_residual_contract_completeness",
  sourcePhase: "v7.1.1 Phase 5.3 KB lifecycle/value residual P2/P3 closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    for (const token of REQUIRED) {
      if (!doc.text.includes(token)) {
        findings.push({
          file: doc.path,
          line: 1,
          matched_text: token,
          message: "Required Phase 5.3 KB residual contract is missing.",
        });
      }
    }
    for (const token of FORBIDDEN) {
      if (doc.text.includes(token)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, token),
          matched_text: token,
          message: "Stale Phase 5.3 KB residual wording remains active.",
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
