/**
 * Gate: `seller_entity_plan_gate_and_anchor_hygiene`
 *
 * Assertion: §4.4 entity headings retain anchors and the PromotedListing and
 * VerificationReviewRecord plan checks bind to the canonical per-console tier.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "seller_entity_plan_gate_and_anchor_hygiene";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const [anchor, label] of [
    ["4.4.1-bid-workspace", "§4.4.1 Bid Workspace"],
    ["4.4.2-bid-response", "§4.4.2 Bid Response"],
    ["4.4.3-seller-profile", "§4.4.3 Seller Profile"],
    ["4.4.5-bid-task", "§4.4.5 Bid Task"],
    ["4.4.6-bid-schedule", "§4.4.6 Bid Schedule"],
  ] as const) {
    requireTokens(findings, doc, sectionTextByAnchor(doc, anchor), label, ["Field | Type | Constraints | Notes"]);
  }
  const promotedListing = sectionTextByAnchor(doc, "4.4.19-promotedlisting");
  requireTokens(findings, doc, promotedListing, "§4.4.19 plan eligibility", [
    "`Organization.seller_plan_tier` MUST satisfy the PromotedListing eligibility contract in §34.1.2",
    "feature-access enforcement follows §5.11",
    "does not satisfy the §34.1.2 eligibility contract",
  ]);
  const verification = sectionTextByAnchor(doc, "4.4.21-verificationreviewrecord");
  requireTokens(findings, doc, verification, "§4.4.21 plan eligibility", [
    "`Organization.seller_plan_tier` MUST satisfy the Verified eligibility contract in §34.1.2",
    "`Organization.seller_plan_tier` MUST satisfy the Certified eligibility contract in §34.1.2",
    "does not satisfy the requested-tier eligibility in §34.1.2",
  ]);
  for (const [scope, label] of [[promotedListing, "§4.4.19"], [verification, "§4.4.21"]] as const) {
    if (scope?.text.includes("org_id.plan_tier ∈")) {
      push(findings, doc, scope.startLine, "org_id.plan_tier ∈", `${label} must not restate a Seller plan set through the retired single-plan field.`);
    }
  }
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 2.2 seller-entity plan-gate and anchor hygiene",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
