/**
 * Gate: `solo_per_eval_refund_open_threshold_singleton`
 * Source phase: v7.2.0-REM Phase PT Pricing Singleton P1.
 *
 * Assertion: §34.2.5 is the sole canonical home for Buyer Solo automated
 * per-eval refund-open eligibility. Companion docs must preserve `< 3 opens`
 * as the automated threshold and route the third open and later to operator
 * judgment.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  forbiddenLineFindings,
  m5RuntimeActiveFindings,
  push,
  requireDocTokens,
  requireSectionTokens,
  sectionByAnchor,
} from "./pricing_singleton_gate_helpers.js";

const GATE_ID = "solo_per_eval_refund_open_threshold_singleton";

const FORBIDDEN = [
  {
    re: /(?:≤|<=)\s*3(?:-open|\s*times|\s*opens)/i,
    message: "Retired inclusive three-open threshold wording is forbidden; canonical automated eligibility is < 3 opens.",
  },
  {
    re: /less than or equal to\s*(?:three|3)\s*(?:opens?|times?)/i,
    message: "Retired inclusive three-open threshold wording is forbidden; canonical automated eligibility is < 3 opens.",
  },
  {
    re: /third open[^.\n|]*(?:automatically eligible|auto[- ]?eligible|eligible for automated refund)/i,
    message: "The third open must route to operator judgment, not automated refund eligibility.",
  },
  {
    re: /3\+?\s*opens?[^.\n|]*(?:automatically eligible|auto[- ]?eligible|eligible for automated refund)/i,
    message: "3+ opens must route to operator judgment, not automated refund eligibility.",
  },
];

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase PT Pricing Singleton P1",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_refund_threshold_drift",
  inputs: { masterSpec: true, buyerPricing: true, aeLedger: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const master = ctx.masterSpec;
    const buyerPricing = ctx.extraDocs.get("buyerPricing") ?? master;
    const aeLedger = ctx.extraDocs.get("aeLedger") ?? master;

    const section3425 = sectionByAnchor(master, "34.2.5-solo-tier-per-evaluation-per-bid-charge-orchestration");
    requireSectionTokens(findings, master, section3425, "§34.2.5 Buyer Solo refund table", [
      "Refund eligibility check | Selection Report PDF MUST have been opened < 3 times",
      "At 3+ opens | Refund is operator-judgment",
      "7-day refund window with < 3-open automated check",
    ]);

    requireDocTokens(findings, master, "Master Spec companion bindings", [
      "$199 / completed evaluation (charged on Selection Report PDF export; 7-day refund window with < 3-open automated check",
      "Refund CTA available within 7 days if PDF opened < 3 times",
    ]);

    const buyerHasEquivalentThreshold =
      buyerPricing.text.includes("Selection Report PDF has not been opened ≥3 times") ||
      buyerPricing.text.includes("Selection Report PDF has been opened < 3 times");
    if (!buyerHasEquivalentThreshold) {
      push(
        findings,
        buyerPricing,
        0,
        "BPS §5.4 refund threshold",
        "Buyer Pricing §5.4 must state the canonical < 3-open automated refund threshold or its equivalent not-opened-3-times phrasing.",
      );
    }
    requireDocTokens(findings, buyerPricing, "Buyer Pricing §5.4", [
      "After 3 opens, refund is judgment-call",
    ]);

    requireDocTokens(findings, aeLedger, "AE Ledger pricing rows", [
      "< 3-open",
      "3+ operator-judgment semantics",
      "AE-V72REM-PHPT-PRICING-SINGLETON-01",
    ]);

    findings.push(...forbiddenLineFindings(master, FORBIDDEN));
    if (buyerPricing !== master) findings.push(...forbiddenLineFindings(buyerPricing, FORBIDDEN));
    if (aeLedger !== master && aeLedger !== buyerPricing) findings.push(...forbiddenLineFindings(aeLedger, FORBIDDEN));
    findings.push(...m5RuntimeActiveFindings(master, GATE_ID));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
