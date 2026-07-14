/**
 * Gate: `entitlement_matrix_feature_access_mirror_consistency`
 *
 * Assertion: every §34.8.5 `n_a_non_ai` row has an explicit §5.11 row-family
 * mirror and an owning feature-section pointer.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { entitlementMatrixRows, m5RuntimeActiveFindings, push, sectionTextByTitle } from "./entitlement_matrix_gate_helpers.js";

const NON_AI_BINDINGS: Record<string, string[]> = {
  tco_modeling: ["TCO Modeling deterministic calculator", "§15", "`tco_modeling`; non-AIOperation branch"],
  marketplace_search_filter: ["Marketplace search and public filters", "§27.2", "§34.1.1 cell **Marketplace Buyer Access**"],
  marketplace_match_score_view: ["Marketplace match score view / batch match API", "`marketplace_match_score_view`"],
  marketplace_batch_match_api: ["Marketplace match score view / batch match API", "`marketplace_batch_match_api`"],
  proactive_marketplace_eoi: ["Seller Signals digest / real-time / Direct Invite", "Direct Invite from Cohort", "§27.9"],
  seller_signals_monthly_digest: ["Seller Signals digest / real-time / Direct Invite", "§27.9", "Seller Signals"],
  seller_signals_weekly_digest: ["Seller Signals digest / real-time / Direct Invite", "§27.9", "Seller Signals"],
  seller_signals_realtime: ["Seller Signals digest / real-time / Direct Invite", "`seller_signals_realtime`"],
  crm_sync: ["CRM Sync", "§31.9", "seller_growth"],
  agent_threshold_tuning: ["Agent Threshold Tuning", "`agent_threshold_tuning`"],
  custom_agent_instructions: ["Custom Agent Instructions", "`custom_agent_instructions`"],
  promoted_marketplace_placement: ["Promoted Marketplace Placement purchase", "§34.16"],
  mfa_enrollment: ["Security / admin plan gates", "MFA"],
  mfa_org_enforcement: ["Security / admin plan gates", "MFA"],
  saml_sso: ["Security / admin plan gates", "SSO"],
  scim_provisioning: ["Security / admin plan gates", "SCIM"],
  ip_allowlist_residency: ["Security / admin plan gates", "IP allowlist"],
  custom_branding: ["Security / admin plan gates", "custom branding"],
  api_add_on: ["Security / admin plan gates", "API add-on"],
  vendor_pro_trial_seat_grant: ["Security / admin plan gates", "Vendor Pro Trial grant"],
};

function featureAccessFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section5 = sectionTextByTitle(doc, /^5\.11 Feature Access Matrix/);
  if (!section5) {
    push(findings, doc, 0, "5.11 Feature Access Matrix", "§5.11 Feature Access Matrix section is missing.");
    return findings;
  }

  const rows = entitlementMatrixRows(doc, findings).filter((row) => row.enforcementMode === "n_a_non_ai");
  for (const row of rows) {
    const tokens = NON_AI_BINDINGS[row.capabilityId];
    if (!tokens) {
      push(
        findings,
        doc,
        row.line,
        row.capabilityId,
        `§34.8.5 n_a_non_ai row ${row.capabilityId} must be added to the feature-access mirror binding map with §5.11 and owning-section evidence.`,
      );
      continue;
    }
    for (const token of tokens) {
      if (!section5.text.includes(token)) {
        push(
          findings,
          doc,
          row.line,
          token,
          `§5.11 Feature Access Matrix is missing mirror evidence for §34.8.5 non-AIOperation row ${row.capabilityId}: ${token}`,
        );
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "entitlement_matrix_feature_access_mirror_consistency",
  sourcePhase: "v7.2.0-REM Phase EM",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...featureAccessFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "entitlement_matrix_feature_access_mirror_consistency")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
