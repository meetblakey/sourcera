/**
 * Gate: `solo_tier_numeric_single_source`  (Source phase: 14.9 [V11])
 * Archetype: numerical-singleton grep (built on makeSingletonGate factory).
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `solo_tier_numeric_single_source`; §34.1.3 invariant; D-11V-001 lexical-pattern
 * tightening.
 *
 * Assertion (§M.5.4): Solo numerics ($49 / $59 / $199) MUST appear ONLY in
 * §34.1.1 / §34.1.2 / §34.2.1 / §34.2.2 / §34.2.5 cells. Lexical pattern set
 * (D-11V-001): (a) `/\$\s*(49|59|199)\b/`; (b) `/\b(49|59|199)\s*(USD|dollars?)\b/i`;
 * (c) word forms; (d) template-token form `{{ solo.*_price_cents | currency }}`
 * permitted inside §34 (and UX §8.1.2, which is out of this Master-Spec scan's
 * scope). Restatements elsewhere fail.
 *
 * Override path: not_permitted_billing_singleton (restatement risks Stripe meter
 * drift / Solo subscription mispricing).
 *
 * Reuse note: this gate and `retention_singleton_section_40_2_canonical` are
 * BOTH instances of the shared `makeSingletonGate` factory (Authoring
 * Convention #10). Two distinct billing/retention singletons, one kernel.
 */

import { isEntrypoint, makeSingletonGate, runGateCli } from "../lib/gate.js";

const LITERAL_PATTERNS: RegExp[] = [
  /\$\s*(49|59|199)\b/g, // (a) dollar-prefixed
  /\b(49|59|199)\s*(USD|dollars?)\b/gi, // (b) suffixed unit
  /\b(forty[- ]?nine|fifty[- ]?nine|one[- ]?hundred[- ]?ninety[- ]?nine)\s*(dollars?)?\b/gi, // (c) word form
  /\{\{\s*solo\.(per_eval|per_bid|subscription)_price_cents\s*\|\s*currency\s*\}\}/g, // (d) template token
];

const ALLOWED_LITERAL_SECTIONS = ["34.1.1", "34.1.2", "34.2.1", "34.2.2", "34.2.5"];

function leadingSectionNumber(title: string): string {
  const m = /^([0-9]+(?:\.[0-9]+)*)/.exec(title.trim());
  return m ? m[1] : "";
}

function isUnderSection(num: string, prefix: string): boolean {
  return num === prefix || num.startsWith(prefix + ".");
}

const TEMPLATE_TOKEN_RE =
  /\{\{\s*solo\.(per_eval|per_bid|subscription)_price_cents\s*\|\s*currency\s*\}\}/;

export const gate = makeSingletonGate({
  id: "solo_tier_numeric_single_source",
  sourcePhase: "14.9 [V11]",
  version: "1.0.0",
  overridePath: "not_permitted_billing_singleton",
  valuePatterns: LITERAL_PATTERNS,
  valueLabel: "Solo plan-tier price literal ($49 / $59 / $199)",
  isAllowedHome(_line, _lineNo, sectionTitle) {
    const num = leadingSectionNumber(sectionTitle);
    return ALLOWED_LITERAL_SECTIONS.some((p) => isUnderSection(num, p));
  },
  isExemptMatch(matchText, _line, sectionTitle) {
    // Template-token restatements are permitted anywhere inside §34.
    if (TEMPLATE_TOKEN_RE.test(matchText)) {
      return isUnderSection(leadingSectionNumber(sectionTitle), "34");
    }
    return false;
  },
});

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
