/**
 * Gate: `pricing_formula_capability_multiplier_consistency`
 *
 * Assertion: AIOperation value/cost pricing is expressed through
 * CapabilityRegistryEntry.value_multiplier and .cost_multiplier, not through
 * hard-coded cost_base x 10 / x 1.05 formula text.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    label: "§4.8.1 AIOperation",
    anchor: "4.8.1-aioperation",
    tokens: [
      "cost_base_cents × CapabilityRegistryEntry.value_multiplier",
      "cost_base_cents × CapabilityRegistryEntry.cost_multiplier",
      "default multiplier value lives on CapabilityRegistryEntry, not inline in this row",
    ],
  },
  {
    label: "§4.8.2 CapabilityRegistryEntry",
    anchor: "4.8.2-capabilityregistryentry",
    tokens: [
      "cost_base_cents × CapabilityRegistryEntry.value_multiplier",
      "| `value_multiplier` | Decimal(6,3) | Default 10.000 |",
      "| `cost_multiplier` | Decimal(6,3) | Default 1.050 |",
      "Ops adjusts (display_name, value_multiplier, cost_multiplier, plan_gate_min_tier)",
    ],
  },
  {
    label: "§34.3.1 Pricing Formula",
    title: /^34\.3\.1 Pricing Formula\b/,
    tokens: [
      "value_price_cents[capability] = MAX(min_value_price_cents[capability], cost_base_cents[capability] × CapabilityRegistryEntry.value_multiplier[capability])",
      "cost_price_cents[capability]  = MAX(min_cost_price_cents[capability],  cost_base_cents[capability] × CapabilityRegistryEntry.cost_multiplier[capability])",
      "Default multiplier values live only on §4.8.2 CapabilityRegistryEntry",
    ],
  },
  {
    label: "§34.14 Seller Rate Card",
    anchor: "34.14-seller-rate-card-authoritative",
    tokens: [
      "value_price = MAX(min_value, cost_base × CapabilityRegistryEntry.value_multiplier)",
      "cost_price = MAX(min_cost, cost_base × CapabilityRegistryEntry.cost_multiplier)",
      "Every row applies the outcome pricing formula from §34.3",
    ],
  },
  {
    label: "§48.8 Seller Hero Moment",
    anchor: "48.8-seller-hero-moment-and-onboarding-anti-patterns",
    tokens: [
      "cost_base_cents × CapabilityRegistryEntry.value_multiplier",
      "cost_base × CapabilityRegistryEntry.cost_multiplier",
    ],
  },
  {
    label: "§49.1 Seller Onboarding",
    anchor: "49.1-seller-onboarding-seven-stage-flow",
    tokens: [
      "Accepted interactions settle value-priced via CapabilityRegistryEntry.`value_multiplier`",
      "cost_base_cents × CapabilityRegistryEntry.cost_multiplier",
    ],
  },
];

const APPENDIX_K_TOKENS = [
  "**Value Price.**",
  "cost_base_cents × CapabilityRegistryEntry.value_multiplier",
  "default value on §4.8.2 CapabilityRegistryEntry",
  "**Cost Price.**",
  "cost_base_cents × CapabilityRegistryEntry.cost_multiplier",
];

const M5_TOKENS = [
  "**runtime_active**",
  "tools/spec-lint/gates/pricing_formula_capability_multiplier_consistency.ts",
  "CapabilityRegistryEntry.value_multiplier",
  "CapabilityRegistryEntry.cost_multiplier",
  "hard-coded `cost_base x 10` / `cost_base x 1.05` formula text",
];

const STALE_FORMULA_PATTERNS: RegExp[] = [
  /cost_base(?:_cents)?\s*(?:×|x|\*)\s*\{\s*10(?:\.000)?\s*,\s*1\.05(?:0)?\s*\}/i,
  /cost_base(?:_cents)?\s*(?:×|x|\*)\s*(?:10(?:\.000)?|1\.05(?:0)?)(?![0-9])/i,
  /cost_base(?:_cents)?\s*(?:×|x|\*)\s*(?:value_multiplier|cost_multiplier)\b/i,
  /cost_base\s*×\s*multiplier/i,
];

function sectionText(doc: SpecDoc, req: (typeof SECTION_REQUIREMENTS)[number], findings: Finding[]) {
  const section = req.anchor ? findSectionByAnchor(doc, req.anchor) : findSectionByTitle(doc, req.title!);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: req.anchor ?? req.label,
      message: `${req.label} section is missing; cannot verify capability-multiplier pricing formula.`,
    });
    return { text: "", line: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function requireTokens(doc: SpecDoc, text: string, line: number, label: string, tokens: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line,
        matched_text: token,
        message: `${label} is missing pricing formula multiplier binding: ${token}`,
      });
    }
  }
  return findings;
}

function findLineMatching(doc: SpecDoc, predicate: (text: string) => boolean): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const text = doc.lines[i] ?? "";
    if (predicate(text)) return { text, line: i };
  }
  return null;
}

function staleFormulaFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    const explicitFailureRule =
      line.includes("hard-coded `cost_base x 10` / `cost_base x 1.05`") &&
      line.includes("fails closed");
    if (explicitFailureRule) continue;

    for (const pattern of STALE_FORMULA_PATTERNS) {
      const match = pattern.exec(line);
      if (!match) continue;

      const namespaced =
        line.includes("CapabilityRegistryEntry.value_multiplier") ||
        line.includes("CapabilityRegistryEntry.cost_multiplier");
      if (namespaced && pattern.source.includes("value_multiplier|cost_multiplier")) continue;

      findings.push({
        file: doc.path,
        line: i,
        matched_text: match[0],
        message: "AIOperation pricing formula is not bound to CapabilityRegistryEntry multipliers; replace hard-coded/default formula text with CapabilityRegistryEntry.value_multiplier / cost_multiplier.",
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "pricing_formula_capability_multiplier_consistency",
  sourcePhase: "v7.2.0-REM Phase CONS Pricing Core",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const req of SECTION_REQUIREMENTS) {
      const section = sectionText(doc, req, findings);
      findings.push(...requireTokens(doc, section.text, section.line, req.label, req.tokens));
    }

    const valuePriceLine = findLineMatching(doc, (line) => line.includes("**Value Price.**"));
    const costPriceLine = findLineMatching(doc, (line) => line.includes("**Cost Price.**"));
    if (!valuePriceLine || !costPriceLine) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "**Value Price.** / **Cost Price.**",
        message: "Appendix K Value Price / Cost Price glossary entries are missing.",
      });
    } else {
      findings.push(...requireTokens(doc, `${valuePriceLine.text}\n${costPriceLine.text}`, valuePriceLine.line, "Appendix K Value Price / Cost Price", APPENDIX_K_TOKENS));
    }

    const m5 = findLineMatching(doc, (line) =>
      line.trim().startsWith("| `pricing_formula_capability_multiplier_consistency` |"),
    );
    if (!m5) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`pricing_formula_capability_multiplier_consistency`",
        message: "Appendix M.5 pricing_formula_capability_multiplier_consistency row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5.text, m5.line, "Appendix M.5 pricing_formula_capability_multiplier_consistency row", M5_TOKENS));
    }

    findings.push(...staleFormulaFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
