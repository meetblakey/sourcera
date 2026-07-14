/**
 * Gate: `organization_plan_state_integrity_contract`
 *
 * Assertion: the legacy Organization plan split and derived User role cache
 * remain deterministic, side-effect-safe, private, and non-authoritative.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor, sectionTextByTitle } from "./policy_ingestion_gate_helpers.js";

const GATE_ID = "organization_plan_state_integrity_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.2\.1 Organization \(Org-Scoped\)$/), "§4.2.1 Organization snapshots", [
    "authorization and plan gating always resolve the canonical per-console plan fields, never a snapshot.",
    "`max_workspaces` for `console_modes_active = both` equals the Buyer **Active Evaluations (concurrent)** ceiling plus the Seller **Bid Workspace Access — concurrent** ceiling",
    "`max_members` is NULL for every current plan",
    "`max_req_per_workspace` is the Buyer ceiling when the Buyer console is active and NULL otherwise",
    "`max_kb_entries` is the Seller ceiling when the Seller console is active and NULL otherwise",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.2.1.2-plan-tier-split-migration-contract"), "§4.2.1.2 plan-tier migration", [
    "Authored Extension — requires human sign-off",
    "| `free` | `buyer_free` | `seller_free` |",
    "| `business` | `business_growth` | `seller_growth` |",
    "| `enterprise` | `buyer_enterprise` | `seller_enterprise` |",
    "No product read path may mutate Organization plan fields",
    "`action=org.plan_tier_split_migrated`",
    "no Stripe action, and no entitlement change",
    "The worker runs only in the Organization residency partition.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "32.8.15-post-plan-change"), "§32.8.15 migration failure", [
    "`plan_tier_split_migration_incomplete`",
    "no plan, Stripe, entitlement, or snapshot mutation occurs.",
  ]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.2\.3 User \(Global\)$/), "§4.2.3 role-context field", [
    "`role_context` | JSON \\| NULL",
    "It is never an RBAC or entitlement source of truth.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.2.3.2-role-context-cache-contract"), "§4.2.3.2 role-context cache", [
    "Authored Extension — requires human sign-off",
    "§4.2.2 OrgMembership is the sole role authority",
    "capped at 16 entries",
    "Any OrgMembership create, role change, SCIM-derived role change, or revocation locks the User row in the same transaction",
    "never copied into audit, webhook, Console Bridge, analytics, logs, or customer responses",
    "DSAR / account deletion clears the entire field",
    "There is no customer API field, mobile control, empty state, loading state, or retry affordance for this cache.",
  ]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^Billing Admin Audit Action Types/), "Appendix J plan migration audit action", [
    "`org.plan_tier_split_migrated`",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Organization plan-state integrity closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_audit_log_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
