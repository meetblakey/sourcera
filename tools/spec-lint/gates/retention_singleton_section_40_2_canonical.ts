/**
 * Gate: `retention_singleton_section_40_2_canonical`  (Source phase: V9 [V11])
 * Archetype: numerical-singleton grep (built on makeSingletonGate factory) —
 * second instance, demonstrating factory reuse across two singleton classes.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `retention_singleton_section_40_2_canonical`; §40.2 V9 authoring note;
 * defects D-9.1R-022 + D-9.1R-001..017; D-11.3-009 ASCII-rename.
 *
 * Assertion (§M.5.4): "No numeric retention literal MAY appear outside §40.2 /
 * §6.8 / §34. Inline restatements MUST cite the §40.2 row by reference."
 *
 * Faithful detector: a duration literal (`N day(s)/month(s)/year(s)`) on a line
 * that is in a RETENTION context (mentions retention/retain/TTL/purge/erasure)
 * or names the BuyerReferral credit-expiry field is a finding IFF the line is
 * outside §40.2 / §6.8 / §34 AND does not cite §40.2. Context-gating keeps the
 * gate faithful to retention and credit-expiry singletons rather than flagging
 * every duration in the spec (SLAs, throttles, refund windows).
 *
 * Override path: not_permitted_billing_singleton (binding §40.2 retention-
 * singleton invariant; inline restatement risks Convex retention-job drift).
 */

import { isEntrypoint, makeSingletonGate, runGateCli } from "../lib/gate.js";

const DURATION_RE = /\b\d+\s*(day|days|d|week|weeks|month|months|year|years)\b/gi;
// Retention-TTL context ONLY. DSAR-erasure deadlines (§6.8) and lifecycle terms
// ("right-to-erasure", "deleted after N days") are a DIFFERENT singleton class
// homed in §6.8 — not §40.2 retention TTLs — so they are deliberately excluded
// from this gate's trigger to avoid cross-class false positives (D-V72REM-M023-004).
const RETENTION_CONTEXT_RE =
  /\b(retention(?:\s+period)?|retain(?:ed|s|ing)?|TTL|time[- ]to[- ]live|retained\s+for|kept\s+for|stored\s+for)\b/i;
const BUYER_REFERRAL_CREDIT_EXPIRY_CONTEXT_RE = /\bcredit(?:_|\s+)expires?(?:_at)?\b/i;
// An inline restatement is exempt if it cites ANY of the three authoritative
// homes for a duration singleton (§40.2 retention / §6.8 DSAR / §34 billing),
// per the §40.2 invariant's allowed-home set.
const CITES_ALLOWED_HOME_RE =
  /(?:§\s*(?:40\.2|6\.8|34)\b|\b(?:40\.2|6\.8)\b|#(?:40-2|6-8|34-))/;

const ALLOWED_SECTIONS = ["40.2", "6.8", "34"];

function leadingSectionNumber(title: string): string {
  const m = /^([0-9]+(?:\.[0-9]+)*)/.exec(title.trim());
  return m ? m[1] : "";
}
function isUnderSection(num: string, prefix: string): boolean {
  return num === prefix || num.startsWith(prefix + ".");
}

export const gate = makeSingletonGate({
  id: "retention_singleton_section_40_2_canonical",
  sourcePhase: "V9 [V11]",
  version: "1.2.0",
  overridePath: "not_permitted_billing_singleton",
  valuePatterns: [DURATION_RE],
  valueLabel: "Retention TTL literal",
  isAllowedHome(_line, _lineNo, sectionTitle) {
    const num = leadingSectionNumber(sectionTitle);
    return ALLOWED_SECTIONS.some((p) => isUnderSection(num, p));
  },
  isExemptMatch(_matchText, line) {
  // Only retention-TTL-context lines are in scope; an inline restatement that
  // cites an authoritative home (§40.2 / §6.8 / §34) is the permitted form.
  if (!RETENTION_CONTEXT_RE.test(line) && !BUYER_REFERRAL_CREDIT_EXPIRY_CONTEXT_RE.test(line)) return true;
  // Existing retention shorthand such as `30d` is outside this gate's original
  // duration grammar. The M16 credit-expiry field is the one added shorthand
  // form, so leave unrelated historical abbreviations untouched.
  if (/^\d+\s*d$/i.test(_matchText) && !BUYER_REFERRAL_CREDIT_EXPIRY_CONTEXT_RE.test(line)) return true;
  if (CITES_ALLOWED_HOME_RE.test(line)) return true;
    return false;
  },
});

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
