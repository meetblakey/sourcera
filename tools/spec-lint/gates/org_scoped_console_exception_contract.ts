/**
 * Gate: `org_scoped_console_exception_contract`
 *
 * Assertion: Buyer Referral and Pro Trial Seat Grant retain their documented
 * non-console record shapes without weakening firewall behavior.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByTitle } from "./policy_ingestion_gate_helpers.js";

const GATE_ID = "org_scoped_console_exception_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.16 Buyer Referral \(Org-Scoped, Buyer-Only\)$/), "§4.3.16 Buyer Referral", [
    "**Console Field Convention Exception.** Buyer Referral intentionally has no `console` field",
    "buyer-originated, Org-scoped financial-attribution record, not a dual-console entity",
    "Seller-console and referee-Org direct resource lookups return HTTP 404",
    "not a Seller, Marketplace, or Console Bridge projection",
  ]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.17 Buyer-Funded Pro Trial Seat Grant \(Org-Scoped, Buyer-Originated, Seller-Redeemed\)$/), "§4.3.17 Pro Trial Seat Grant", [
    "**Console Field Convention Exception.** Pro Trial Seat Grant intentionally has no `console` or `console_origination` field",
    "one grant is authorized from two existing request contexts, the Buyer issuer and Seller redeemer",
    "A fixed stored console would misrepresent that dual-sided record.",
    "never a Console Bridge or Marketplace row",
    "third-party Org or unauthorised projection returns HTTP 404",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Org-scoped console-exception closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
