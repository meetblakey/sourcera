/**
 * Gate: `seller_console_phase24_residual_contract_completeness`
 * Source defects: D-24-001, D-24-003, D-24-004, D-24-007, D-24-009,
 * D-24-013, D-24-020, D-24-021, D-24-023 through D-24-027,
 * and D-24-029 through D-24-035.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

const REQUIRED = [
  "{#24-seller-console-qa-nda-inbox-pulse}",
  "{#24.1-seller-qa}",
  "{#24.2-nda-module-execution}",
  "the canonical per-vendor / Workspace question cap and additional-slot workflow in §18.2.3",
  "It is intentionally distinct from the buyer Workspace Inbox priority representation",
  "**Plan authority — NDA.**",
  "**Plan authority — Seller Inbox.**",
  "**Plan authority — Seller Pulse.**",
  "**Plan authority — Seller Analytics.**",
  "`nda.executed` | NDA Record enters `executed`",
  "`nda.expired` | Expiry worker commits `nda_status=expired`",
  "`nda.revoked` | NDA Record enters `revoked`",
  "`nda_executed` | Mirror of Appendix C `nda.executed`",
  "`nda_expired` | Mirror of Appendix C `nda.expired`",
  "`nda_revoked` | Mirror of Appendix C `nda.revoked`",
  "Accept and Request Changes are commands, not a persisted `nda_acceptance_action` field",
  "## 24.7 Shared Seller Console Contract {#24.7-shared-seller-console-contract}",
  "### 24.7.1 Surface States {#24.7.1-surface-states}",
  "| Seller Q&A | No seller-visible threads |",
  "| Seller Analytics | No submitted response rows",
  "### 24.7.2 Accessibility and Mobile {#24.7.2-accessibility-and-mobile}",
  "### 24.7.3 Firewall, Retention, Residency, and DSAR {#24.7.3-firewall-retention-residency-and-dsar}",
  "| Seller Inbox | NEVER CARRIED |",
  "Seller Analytics is a derived read model and MUST NOT create an independent buyer-readable or cross-console durable aggregate",
  "### 24.7.4 Downgrade and Dependency Failure {#24.7.4-downgrade-and-dependency-failure}",
  "`seller_console_phase24_residual_contract_completeness` | spec_tree_lint | **`runtime_active`**",
  "`nda_lifecycle_notification_runtime_consistency` | notification_runtime_consistency | **`spec_binding_pending_pack_m11_3`**",
  "`seller_console_phase24_firewall_state_runtime_consistency` | runtime_property_test | **`spec_binding_pending_pack_m11_3`**",
  "`seller_console_phase24_mobile_accessibility_runtime` | mobile_accessibility_runtime | **`spec_binding_pending_pack_m21_3`**",
  "`seller_console_phase24_plan_authority_runtime_consistency` | entitlement_runtime_consistency | **`spec_binding_pending_pack_m24_3`**",
];

const FORBIDDEN = [
  "{#24.-seller-console-—-q&a,-nda,-inbox-&-pulse}",
  "{#24.1-seller-q&a}",
  "{#24.2-nda-module-&-execution}",
  "e-signature integration `seller_growth+`",
  "custom_terms editing `seller_growth+`",
  "multi-version NDA negotiation `seller_scale+`",
  "stricter (`eu` > `us` > `apac` > `custom`) region",
];

export const gate: SpecLintGate = {
  id: "seller_console_phase24_residual_contract_completeness",
  sourcePhase: "v7.1.1 Phase 24 Seller Console residual P2/P3 closure",
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
        findings.push({ file: doc.path, line: 1, matched_text: token, message: "Required Phase 24 residual contract is missing." });
      }
    }
    for (const token of FORBIDDEN) {
      if (doc.text.includes(token)) {
        findings.push({ file: doc.path, line: lineForToken(doc, token), matched_text: token, message: "Stale or unauthorized Phase 24 wording remains active." });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
