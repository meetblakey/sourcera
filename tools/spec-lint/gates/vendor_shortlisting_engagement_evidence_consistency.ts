/**
 * Gate: `vendor_shortlisting_engagement_evidence_consistency`
 *
 * Assertion: Shortlisting uses existing, observable seller participation
 * signals and does not invent a seller-SLA or inferred-interest classifier.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "vendor_shortlisting_engagement_evidence_consistency";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "2.4-vendor-shortlisting-strategy"), "§2.4 vendor-engagement evidence", [
    "Seller explicitly declines to bid (`TargetAccount.solicited → disqualified`",
    "Sourcera does not infer a `vendor_interest_signal` from email latency, calendar availability, or another opaque behavior",
    "§8.4 Team SLA timers do not apply to invited sellers.",
    "`TargetAccount.solicited` records the invite, `solicited → bidding` records accepted bid participation",
    "§10.5 / §10.6 provide aggregate no-confirmation / no-response gate evidence.",
    "existing `buyer_discretion` disqualification path and note",
    "The four-term §20.3 Pulse Health Score remains unchanged.",
    "MUST NOT be labeled an inferred `vendor_interest_signal`.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "20.3-pulse-health-score"), "§20.3 shortlisting boundary", [
    "Vendor engagement is not a fifth Pulse Health Score term.",
    "does not introduce a seller SLA, response-latency classifier, demo-availability classifier, or inferred seller-interest metric.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "l.6-target-account-state-machine"), "Appendix L.6 solicited-to-bidding transition", [
    "| `solicited` | `bidding` | Seller accepts the invitation / begins bid response | Seller-side Bid Workspace status transitions to `active` |",
    "Emits Appendix C webhook `target_account.bidding_started`",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 2 vendor-engagement evidence closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
