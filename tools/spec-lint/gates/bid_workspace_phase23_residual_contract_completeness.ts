/**
 * Gate: `bid_workspace_phase23_residual_contract_completeness`
 * Source defects: D-23-024 through D-23-027 and D-23-029 through D-23-031.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

const REQUIRED = [
  "## 23.6 Mobile, Accessibility, Surface States, and Observability {#23.6-mobile-accessibility-surface-states-and-observability}",
  "| Editor lock and force-release |",
  "`role=\"alert\" aria-live=\"polite\"`",
  "| Bid Workspace home | No projected requirements yet |",
  "`bid_response.lock.acquire`",
  "`bid_response.bulk_submit.apply`",
  "`bid_workspace.voluntary_withdraw.cascade`",
  "`bid_response.lock.contention_count`",
  "`bid_workspace.bulk_submit.partial_failure_count`",
  "**Dependency degradation.**",
  "The seller is the counterparty making an intentional terminal participation decision",
  "§15.2.6 seller-visible PricingRequirement projection",
  "{#23.5-bid-response-management-acceptance-criteria}",
  "| Bid Response — Editor Lock / Force Release | parity | supported | supported |",
  "| Bid Response — Bulk Submit | parity | supported | supported |",
  "| Bid Workspace — Voluntary Withdrawal | parity | supported | supported |",
  "`bid_workspace_phase23_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**",
  "`bid_response_editor_lock_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**",
  "`bid_response_bulk_submit_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**",
  "`bid_workspace_voluntary_withdrawal_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**",
  "`bid_workspace_surface_state_runtime_consistency` | render_runtime_consistency | **`spec_binding_pending_pack_m11_3`**",
  "`seller_bid_workspace_mobile_accessibility_runtime` | mobile_accessibility_runtime | **`spec_binding_pending_pack_m21_3`**",
];

const FORBIDDEN = [
  "{#23.5-acceptance-criteria}",
  "See Section 14.4",
  "24h vendor-side withdrawal-reversal window",
];

export const gate: SpecLintGate = {
  id: "bid_workspace_phase23_residual_contract_completeness",
  sourcePhase: "v7.1.1 Phase 23 Bid Workspace residual P2/P3 closure",
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
        findings.push({ file: doc.path, line: 1, matched_text: token, message: "Required Phase 23 residual contract is missing." });
      }
    }
    for (const token of FORBIDDEN) {
      if (doc.text.includes(token)) {
        findings.push({ file: doc.path, line: lineForToken(doc, token), matched_text: token, message: "Stale Phase 23 residual wording remains active." });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
