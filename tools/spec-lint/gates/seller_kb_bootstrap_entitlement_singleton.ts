/**
 * Gate: `seller_kb_bootstrap_entitlement_singleton`
 * Source phase: v7.2.0-REM Phase PT Pricing Singleton P1.
 *
 * Assertion: §34.1.2 cell **KB Bootstrap (Opus)** is the seller-side singleton
 * for the lifetime first-bootstrap grant plus annual re-bootstrap cadence.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  forbiddenLineFindings,
  findLine,
  markdownTableCells,
  m5RuntimeActiveFindings,
  push,
  requireDocTokens,
  requireSectionTokens,
  sectionByAnchor,
  sectionByTitle,
} from "./pricing_singleton_gate_helpers.js";

const GATE_ID = "seller_kb_bootstrap_entitlement_singleton";

const FORBIDDEN = [
  {
    re: /Starter's 1\/yr cap/i,
    message: "Seller Starter KB Bootstrap shorthand must include the lifetime first-bootstrap grant plus annual cadence.",
  },
  {
    re: /Starter's 1\/year cap/i,
    message: "Seller Starter KB Bootstrap shorthand must include the lifetime first-bootstrap grant plus annual cadence.",
  },
  {
    re: /Growth's 3\/yr cap/i,
    message: "Seller Growth KB Bootstrap shorthand must include the lifetime first-bootstrap grant plus annual cadence.",
  },
];

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase PT Pricing Singleton P1",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true, sellerPricing: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const master = ctx.masterSpec;
    const sellerPricing = ctx.extraDocs.get("sellerPricing") ?? master;

    const kbRow = findLine(master, (line) => line.trim().startsWith("| **KB Bootstrap (Opus)** |"));
    if (!kbRow) {
      push(findings, master, 0, "KB Bootstrap (Opus)", "§34.1.2 is missing the KB Bootstrap (Opus) plan-tier row.");
    } else {
      const cells = markdownTableCells(kbRow.text);
      const expected = [
        "1 lifetime (M1 promise)",
        "1 lifetime + 1/year re-bootstrap",
        "1 lifetime + 1/year re-bootstrap",
        "1 lifetime + 3/year re-bootstrap",
        "Unlimited",
        "Unlimited",
      ];
      for (let i = 0; i < expected.length; i++) {
        const actual = cells[i + 1] ?? "";
        if (actual !== expected[i]) {
          push(
            findings,
            master,
            kbRow.line,
            actual,
            `§34.1.2 KB Bootstrap (Opus) column ${i + 1} must be "${expected[i]}"; found "${actual}".`,
          );
        }
      }
    }

    const section34144 = sectionByAnchor(master, "34.14.4-free-allowance-overrides") ??
      sectionByTitle(master, /^34\.14\.4 Free Allowance Overrides/);
    requireSectionTokens(findings, master, section34144, "§34.14.4 Free Allowance Overrides", [
      "annual re-bootstrap cadence per §34.1.2",
      "Seller Solo and Seller Starter: 1/year; Seller Growth: 3/year; Seller Scale/Enterprise: Unlimited",
      "FreeAllowanceCounter.scope_hint = \"lifetime_per_org\"",
    ]);

    requireDocTokens(findings, master, "Master Spec KB Bootstrap singleton mirrors", [
      "Per §34.1.2 cell **KB Bootstrap (Opus)**",
      "Lifetime + per-year cadence per §34.14.4",
    ]);

    const sellerArchitectureRow =
      "| KB Bootstrap | 1 lifetime | 1 lifetime + **1/yr re-bootstrap** | 1 lifetime + 1/yr | 1 lifetime + 3/yr | Unlimited | Unlimited |";
    requireDocTokens(findings, sellerPricing, "Seller Pricing §3/§4/§21", [
      sellerArchitectureRow,
      "1 lifetime KB Bootstrap",
      "1 lifetime + 1/yr re-bootstrap (between Free's lifetime-only and Starter's lifetime + 1/yr cadence)",
    ]);

    findings.push(...forbiddenLineFindings(master, FORBIDDEN));
    if (sellerPricing !== master) findings.push(...forbiddenLineFindings(sellerPricing, FORBIDDEN));
    findings.push(...m5RuntimeActiveFindings(master, GATE_ID));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
