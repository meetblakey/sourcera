/**
 * Gate: `section3_plan_gate_bulk_selection_rollback_consistency`
 *
 * Assertion: §3 plan-gate recovery, Bulk Action bounds, and optimistic
 * rollback defaults resolve to their canonical contracts.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "section3_plan_gate_bulk_selection_rollback_consistency";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.5-optimistic-mutation-rollback-behavior"), "§3.5 default rollback coverage", [
    "Default coverage.",
    "Any data-mutating §3.3 feature not named in the table",
    "read-only, navigation, and purely local presentation changes",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.7-loading-empty-error-state-catalog"), "§3.7 plan-gate CTA invariant", [
    "Plan-gate CTA invariant.",
    "Request Upgrade from Billing Admin",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.7.6.2-matrix-surfaces"), "§3.7.6.2 plan-gate recovery", [
    "Secondary CTA: `Request Upgrade from Billing Admin`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.7.6.6-knowledge-base-surfaces"), "§3.7.6.6 plan-gate recovery", [
    "Secondary CTA: `Request Upgrade from Billing Admin`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.10-bulk-action-toolbar"), "§3.10 Bulk Action limit precedence", [
    "bulk_action_all_in_filter_cap",
    "bulk_action_request_row_list_cap",
    "bulk_action_chunk_size_max",
    "Switch to all-in-filter",
    "The dispatch MUST NOT silently elevate",
    "selection exceeds the request-row-list cap",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "39.-object-size-constraints"), "§39 Bulk Action numerical singletons", [
    "bulk_action_chunk_size_max",
    "bulk_action_request_row_list_cap",
    "bulk_action_all_in_filter_cap",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "50.17.4-token-drift-check"), "§50.17.4 plan-gate audit", [
    "plan_gate_row_dual_cta_coverage",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Section 3 plan-gate, Bulk Action, and rollback closure",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
