/**
 * Gate: `solo_billing_card_price_single_source`
 *
 * Assertion: the Solo billing card never hard-codes Solo subscription,
 * per-evaluation, or per-bid prices. UX/card copy must resolve prices from
 * Master Spec §34.2.1 / §34.2.2 / §34.2.5 at presentation time.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  findSectionByAnchor,
  findSectionByTitle,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const STATIC_SOLO_PRICE_RE = /\$\s*(49|59|199)\b/g;

function sectionTextByTitle(doc: SpecDoc, title: string | RegExp): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor ?? section.heading.title,
  };
}

function sectionTextByAnchor(doc: SpecDoc, anchor: string): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

function requireTokens(
  doc: SpecDoc,
  section: { text: string; line: number; anchor?: string } | null,
  label: string,
  tokens: string[],
): Finding[] {
  if (!section) {
    return [{
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing.`,
    }];
  }
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: section.line,
        anchor: section.anchor,
        matched_text: token,
        message: `${label} is missing Solo billing-card price-source binding: ${token}`,
      });
    }
  }
  return findings;
}

function staticPriceFindings(doc: SpecDoc, section: { text: string; line: number; anchor?: string } | null): Finding[] {
  if (!section) return [];
  const findings: Finding[] = [];
  const lines = section.text.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    STATIC_SOLO_PRICE_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = STATIC_SOLO_PRICE_RE.exec(line)) !== null) {
      findings.push({
        file: doc.path,
        line: section.line + i,
        anchor: section.anchor,
        matched_text: match[0],
        message:
          "UX §8.1.2 Solo billing card contains a static Solo price; render from §34.2.1 / §34.2.2 / §34.2.5 instead.",
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "solo_billing_card_price_single_source",
  sourcePhase: "14.10 [V11]",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    const doc = ctx.masterSpec;
    const ux = ctx.uxSpec;

    if (!ux) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "UX_Design_of_Sourcera.md",
        message: "UX spec is required for solo_billing_card_price_single_source.",
      });
      return findings;
    }

    const uxBilling = sectionTextByTitle(ux, /^8\.1\.2 Solo-Tier Billing Surface\b/);
    findings.push(...staticPriceFindings(ux, uxBilling));
    findings.push(...requireTokens(ux, uxBilling, "UX §8.1.2 Solo-Tier Billing Surface", [
      "Price authority in Master Spec §34.2.1 / §34.2.2 / §34.2.5.",
      "**\"{canonical Solo subscription price}/mo\"**",
      "**\"{canonical per-evaluation price} paid {YYYY-MM-DD}\"**",
      "**\"{canonical per-bid price} charged {YYYY-MM-DD}\"**",
      "Card content MUST cite Master Spec §34.2.1 / §34.2.2 / §34.2.5 for prices at presentation time; static prices in component code are forbidden",
    ]));

    const masterBilling = sectionTextByAnchor(doc, "44.6.2-single-card-billing-surface");
    findings.push(...requireTokens(doc, masterBilling, "§44.6.2 Single-Card Billing Surface", [
      "{canonical Solo annual subscription price}",
      "{canonical Solo monthly subscription price}",
      "{canonical per-evaluation price}",
      "{canonical per-bid price}",
      "dollar values cited in the card render are sourced from §34.2.1 / §34.2.2 / §34.2.5 at presentation time",
      "static prices in component code are forbidden",
    ]));

    const ac = sectionTextByAnchor(doc, "44.6.8-acceptance-criteria");
    findings.push(...requireTokens(doc, ac, "§44.6.8 Acceptance Criteria", [
      "14. **`solo_billing_card_price_single_source`.**",
      "The §44.6.2 single-card content MUST source prices from §34.2.1 / §34.2.2 / §34.2.5 verbatim at presentation time.",
      "Static prices in component code are forbidden.",
    ]));

    const appendixM = sectionTextByAnchor(doc, "appendix-m-surface-engine-mapping");
    findings.push(...requireTokens(doc, appendixM, "Appendix M Solo billing card row", [
      "Solo billing single-card surface (Phase 14.10)",
      "Card content cites §34.2.1 / §34.2.2 / §34.2.5 prices verbatim at presentation time; static prices in component code are forbidden",
    ]));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
