/**
 * Gate: `seller_teams_residual_contract_completeness`
 * Source defects: D-5.1-029, D-5.1-030, D-5.1-033, D-5.1-035,
 * D-5.1-036, D-5.1-041, and D-5.1-042.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { lineForToken } from "./catalog_gate_helpers.js";

const REQUIRED = [
  "| `seller_ai_response_generation_enabled` | Boolean | Default `false` |",
  "| `public_capability_tag_ids` | Array\\[UUID\\] |",
  "**Auto-Mapping Requirement Projection (§9.2).**",
  "`title` is the seller-facing alias of Requirement.`statement`",
  "`description` is the seller-facing alias of Requirement.`acceptance_criteria`",
  "Bid Workspace life + 7 years",
  "### 9.4.4 Organization Toggle State Machine",
  "### 9.5 Accessibility, State, and Mobile Behavior",
  "`role=status`",
  "`aria-live=polite`",
  "| Seller Triage Queue (§9.2) | parity | simplified | simplified |",
  "| Vendor Response Drafting Composer (§9.3) | parity | simplified | simplified |",
  "| AI Suggestion Approval (§9.4) | parity | supported | supported |",
  "| Capability Declaration Picker (§9.3.2) | parity | simplified | simplified |",
  "**Triage Queue.**",
  "**Vendor Response.**",
  "**Auto-Mapping.**",
  "**Decline-to-Bid.**",
  "**AI Response Generation.**",
  "**[AI-SUGGESTED] Badge.**",
  "**Default Inbox.**",
  "**Manual Remap.**",
  "`capability_declaration_reuse_count_consistency` | materialized_view_consistency | **`spec_binding_pending_pack_m11_3`**",
  "`ai_response_generation_billing_consistency` | billing_runtime_consistency | **`spec_binding_pending_pack_m11_3`**",
];

const FORBIDDEN = [
  "§7.2-permitted Requirement projection",
  "soft-delete is permitted with a 30-day recovery window",
  "seller_org.ai_response_generation_enabled",
];

export const gate: SpecLintGate = {
  id: "seller_teams_residual_contract_completeness",
  sourcePhase: "v7.1.1 Phase 5.1 Seller Teams residual P2/P3 closure",
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
          message: "Required Phase 5.1 Seller Teams residual contract is missing.",
        });
      }
    }
    for (const token of FORBIDDEN) {
      if (doc.text.includes(token)) {
        findings.push({
          file: doc.path,
          line: lineForToken(doc, token),
          matched_text: token,
          message: "Stale Seller Teams retention, toggle, or firewall wording remains active.",
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
