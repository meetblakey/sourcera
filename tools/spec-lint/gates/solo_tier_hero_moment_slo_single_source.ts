/**
 * Gate: `solo_tier_hero_moment_slo_single_source`
 *
 * Assertion: seller Free/Solo Hero Moment activation-metric relaxation is
 * single-sourced at §44.6.4.2 and consumed by §48.8.10 AC #42. The retired
 * placeholder reference §44.6.4.X must not remain on the seller SLO path.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "solo_tier_hero_moment_slo_single_source";

const SLO_SECTION_TOKENS = [
  "sole source for the seller-side Hero Moment activation-metric relaxation",
  "`seller_free` and `seller_solo` cohorts",
  "§48.8.10 AC #42 consumes this table",
  "MUST NOT restate a competing Solo / Free threshold",
  "active-workflow capabilities remain unthrottled",
  "`low_priority_background` capabilities may be silently suppressed",
  "| Throttled-tier seller Hero Moment relaxation | `seller_free`, `seller_solo` |",
  "≤ 25 minutes",
  "≤ 75 minutes",
  "All six Appendix J `seller_onboarding_invite_source` values",
  "Regression > 10% in any `(plan_tier, invite_source)` cell raises §42 P2 to `ops_growth_admin`",
];

const AC42_TOKENS = [
  "Plan-tier × invite-source cohort breakdown for activation metric",
  "`plan_tier × invite_source` cross-product cohort matrix",
  "Solo / Free seller cohorts under §44.6 Solo-Tier Surface Treatment throttling",
  "§44.6.4.2 \"Throttled-Tier Hero Moment SLO\"",
  "`seller_solo` cohort p50 ≤ 25 minutes",
  "p90 ≤ 75 minutes",
  "`seller_free` cohort: same relaxed bands as `seller_solo`",
  "registered exclusively at §44.6.4.2",
];

function numberedLine(text: string, number: string): string | null {
  const re = new RegExp(`^${number}\\.\\s+`, "m");
  return text.split("\n").find((line) => re.test(line)) ?? null;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const slo = sectionTextByAnchor(doc, "44.6.4.2-throttled-tier-hero-moment-slo");
    requireTokens(findings, doc, slo, "§44.6.4.2 Throttled-Tier Hero Moment SLO", SLO_SECTION_TOKENS);

    const acSection = sectionTextByAnchor(doc, "48.8.10-acceptance-criteria-aggregate");
    requireTokens(findings, doc, acSection, "§48.8.10 Acceptance Criteria", ["Hero Moment terminal predicate remains `hero_moment_completed_at`"]);
    if (acSection) {
      const ac42 = numberedLine(acSection.text, "42");
      if (!ac42) {
        push(findings, doc, acSection.startLine, "AC #42", "§48.8.10 AC #42 is missing.");
      } else {
        for (const token of AC42_TOKENS) {
          if (!ac42.includes(token)) push(findings, doc, acSection.startLine, token, `§48.8.10 AC #42 is missing required token: ${token}`);
        }
        if (ac42.includes("§44.6.4.X")) {
          push(findings, doc, acSection.startLine, "§44.6.4.X", "§48.8.10 AC #42 must cite §44.6.4.2, not the retired §44.6.4.X placeholder.");
        }
      }
    }

    const sellerPathForbidden = [
      /§44\.6\.4\.X "Throttled-Tier Hero Moment SLO"/,
      /Solo\/Free relaxation registered exclusively at §44\.6\.4\.X/,
      /Solo \/ Free seller relaxation is registered exclusively at §44\.6\.4\.X/,
    ];
    for (let line = 1; line < doc.lines.length; line += 1) {
      const text = doc.lines[line] ?? "";
      for (const re of sellerPathForbidden) {
        if (re.test(text)) {
          push(findings, doc, line, text, "Seller Hero Moment SLO path still references retired §44.6.4.X placeholder.");
        }
      }
    }

    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
