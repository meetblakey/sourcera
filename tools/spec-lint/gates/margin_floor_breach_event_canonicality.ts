/**
 * Gate: `margin_floor_breach_event_canonicality`
 *
 * Assertion: immediate cost-base margin-floor breaches emit
 * `billing.cost_base_recalc.margin_floor_breach` with standard retry, while
 * realized monthly hard-floor misses emit `billing.finance.margin_floor_breach_hard`
 * with Appendix F.2 `financial_impact` retry. Legacy unprefixed aliases and the
 * old §50.12 `min_margin_floor_pct` parameter are forbidden.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    label: "§31.8.12 Billing Governance Webhooks",
    anchor: "31.8.12-contest-sla-and-pricing-table-lifecycle-webhook-completeness-pack",
    tokens: [
      "| `billing.cost_base_recalc.margin_floor_breach` |",
      "| `billing.finance.margin_floor_breach_hard` |",
      "the unprefixed legacy alias `cost_base_recalc.margin_floor_breach` MUST NOT be emitted",
      "`billing.contest.sla_breach` and `billing.cost_base_recalc.margin_floor_breach` use the standard Appendix F retry curve",
      "`billing.finance.margin_floor_breach_hard` and lock pricing-publish until Ops Finance clears the incident",
    ],
  },
  {
    label: "§50.12 Pricing Admin",
    anchor: "50.12.13-acceptance-criteria",
    tokens: [
      "§34.18.1 `rev_ai_wallet` 88% hard floor",
      "pricing_admin_change_margin_floor_breach",
      "§34.18 floor-asymmetry rule",
    ],
  },
  {
    label: "Appendix C Billing Governance Events",
    anchor: "appendix-c-v711-billing-governance-webhook-completeness-events",
    tokens: [
      "| `billing.cost_base_recalc.margin_floor_breach` |",
      "| `billing.finance.margin_floor_breach_hard` |",
      "`standard` (F.1)",
      "`financial_impact` (F.2)",
    ],
  },
  {
    label: "Appendix G Billing Governance Events",
    title: /^v7\.1\.1 Billing Governance Webhook Completeness Mirrors/,
    tokens: [
      "| `billing_cost_base_recalc_margin_floor_breach` | Mirror of `billing.cost_base_recalc.margin_floor_breach` |",
      "| `billing_finance_margin_floor_breach_hard` | Mirror of `billing.finance.margin_floor_breach_hard` |",
    ],
  },
];

const M5_TOKENS = [
  "**runtime_active**",
  "tools/spec-lint/gates/margin_floor_breach_event_canonicality.ts",
  "`billing.cost_base_recalc.margin_floor_breach` with standard retry",
  "`billing.finance.margin_floor_breach_hard` with Appendix F.2 financial-impact retry",
  "unprefixed legacy aliases",
];

function sectionText(doc: SpecDoc, req: (typeof SECTION_REQUIREMENTS)[number], findings: Finding[]) {
  const section = req.anchor ? findSectionByAnchor(doc, req.anchor) : findSectionByTitle(doc, req.title!);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: req.anchor ?? req.label,
      message: `${req.label} section is missing; cannot verify margin-floor event canonicality.`,
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
        message: `${label} is missing margin-floor event binding: ${token}`,
      });
    }
  }
  return findings;
}

function findM5Row(doc: SpecDoc): { text: string; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (line.trim().startsWith("| `margin_floor_breach_event_canonicality` |")) return { text: line, line: i };
  }
  return null;
}

function staleAliasFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";

    if (line.includes("cost_base_recalc.margin_floor_breach") && !line.includes("billing.cost_base_recalc.margin_floor_breach")) {
      const lower = line.toLowerCase();
      const explicitBan = lower.includes("legacy alias") && lower.includes("must not");
      if (!explicitBan) {
        findings.push({
          file: doc.path,
          line: i,
          matched_text: "cost_base_recalc.margin_floor_breach",
          message: "Unprefixed legacy margin-floor event alias is still live; use `billing.cost_base_recalc.margin_floor_breach`.",
        });
      }
    }

    if (line.includes("min_margin_floor_pct")) {
      findings.push({
        file: doc.path,
        line: i,
        matched_text: "min_margin_floor_pct",
        message: "§50.12 must use the §34.18.1 88% hard floor, not the retired min_margin_floor_pct parameter.",
      });
    }

    if (/margin[- ]floor/i.test(line) && /default 25%/.test(line)) {
      findings.push({
        file: doc.path,
        line: i,
        matched_text: "default 25%",
        message: "Margin-floor wording still carries the retired 25% default; use the §34.18.1 88% hard floor.",
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "margin_floor_breach_event_canonicality",
  sourcePhase: "v7.2.0-REM Phase CONS Pricing Core",
  rowClass: "webhook_catalog_consistency",
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

    const f2Line = doc.lines.findIndex((line) => line?.includes("- `billing.finance.margin_floor_breach_hard`"));
    if (f2Line < 0) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`billing.finance.margin_floor_breach_hard`",
        message: "Appendix F.2 financial-impact retry list is missing `billing.finance.margin_floor_breach_hard`.",
      });
    }

    const m5 = findM5Row(doc);
    if (!m5) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "`margin_floor_breach_event_canonicality`",
        message: "Appendix M.5 margin_floor_breach_event_canonicality row is missing.",
      });
    } else {
      findings.push(...requireTokens(doc, m5.text, m5.line, "Appendix M.5 margin_floor_breach_event_canonicality row", M5_TOKENS));
    }

    findings.push(...staleAliasFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
