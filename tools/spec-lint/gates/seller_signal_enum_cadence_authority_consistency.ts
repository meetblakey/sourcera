/**
 * Gate: `seller_signal_enum_cadence_authority_consistency`
 *
 * Assertion: Seller Signals uses Appendix J's aggregation and delivery
 * suppression enums, §34.1.2 remains the cadence singleton, and Marketplace
 * webhook audience scope retains its closed union.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "seller_signal_enum_cadence_authority_consistency";

function forbidTokens(findings: Finding[], doc: SpecDoc, scope: { text: string; startLine: number } | null, label: string, tokens: readonly string[]) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (scope.text.includes(token)) push(findings, doc, scope.startLine, token, `${label} contains retired or non-canonical token: ${token}`);
  }
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const sellerSignal = sectionTextByAnchor(doc, "4.4.18-sellersignal");
  requireTokens(findings, doc, sellerSignal, "§4.4.18 SellerSignal enum fields", [
    "See Appendix J `seller_signal_suppressed_reason`: `k_anon_floor_not_met`, `buyer_opt_out`, `residency_mismatch`, `vendor_opt_out`, `expired`, `distinctiveness_exceeds_threshold`; nullable",
    "See Appendix J `seller_signal_delivery_suppressed_reason`; nullable",
    "suppressed_reason=distinctiveness_exceeds_threshold",
  ]);
  forbidTokens(findings, doc, sellerSignal, "§4.4.18 SellerSignal enum fields", ["tuple_distinctiveness_threshold_exceeded"]);

  const aggregation = sectionTextByAnchor(doc, "27.9.5-aggregation-and-k-anonymity-enforcement-pipeline");
  requireTokens(findings, doc, aggregation, "§27.9.5 aggregation and delivery suppression", [
    "suppressed_reason='distinctiveness_exceeds_threshold'",
    "suppressed_at_delivery_reason='recompute_deadline_exceeded'",
    "seller_signal_delivery_suppressed_reason",
  ]);
  forbidTokens(findings, doc, aggregation, "§27.9.5 aggregation and delivery suppression", ["suppressed_reason='distinctiveness_veto'", "suppressed_reason='recompute_deadline_exceeded'"]);

  const stateMachine = sectionTextByAnchor(doc, "27.9.5.1-k-anon-satisfied-state-machine");
  requireTokens(findings, doc, stateMachine, "§27.9.5.1 state machine", [
    "suppressed_reason='distinctiveness_exceeds_threshold'",
    "suppressed_at_delivery_reason='distinctiveness_exceeds_threshold'",
  ]);
  forbidTokens(findings, doc, stateMachine, "§27.9.5.1 state machine", ["suppressed_reason='distinctiveness_veto'", "suppressed_at_delivery_reason='distinctiveness_veto'"]);

  const delivery = sectionTextByAnchor(doc, "27.9.6-delivery-surfaces");
  requireTokens(findings, doc, delivery, "§27.9.6 delivery cadence", ["§34.1.2 cell **Seller Signals**", "does not restate plan-tier cadence values"]);
  forbidTokens(findings, doc, delivery, "§27.9.6 delivery cadence", ["monthly digest on seller_starter", "weekly on seller_growth+", "real-time on seller_scale+"]);

  const acceptance = sectionTextByAnchor(doc, "27.9.12-acceptance-criteria");
  requireTokens(findings, doc, acceptance, "§27.9.12 acceptance criteria", [
    "suppressed_reason='distinctiveness_exceeds_threshold'",
    "suppressed_at_delivery_reason='recompute_deadline_exceeded'",
  ]);

  const appendixJ = sectionTextByAnchor(doc, "appendix-j-controlled-vocabulary-registry");
  requireTokens(findings, doc, appendixJ, "Appendix J Seller Signals and audience enums", [
    "### `seller_signal_suppressed_reason` (Seller Signal Suppressed Reason)",
    "`k_anon_floor_not_met`, `buyer_opt_out`, `residency_mismatch`, `vendor_opt_out`, `expired`, `distinctiveness_exceeds_threshold`",
    "### `seller_signal_delivery_suppressed_reason` (Seller Signal Delivery Suppressed Reason)",
    "`k_anon_floor_not_met`, `distinctiveness_exceeds_threshold`, `vendor_opt_out`, `recompute_deadline_exceeded`",
    "#### `webhook_delivery_audience_scope` (NEW)",
    "| `subject` |",
    "| `reporter` |",
    "| `ops` |",
    "`seller` and `buyer` are recipient descriptions in domain catalogs, not `webhook_delivery_audience_scope` values.",
  ]);

  const vendorOptOut = sectionTextByAnchor(doc, "27.10.7-webhook-catalog");
  forbidTokens(findings, doc, vendorOptOut, "§27.10.7 webhook catalog", ["delivery_audience_scope='seller'", "delivery_audience_scope='buyer'", "delivery_audience_scope = seller", "delivery_audience_scope = buyer"]);
  const verification = sectionTextByAnchor(doc, "26.2-verification-tiers");
  requireTokens(findings, doc, verification, "§26.2 Verification Tiers", ["§4.4.21 is the canonical source"]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Seller Signals enum and cadence canonicality",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
