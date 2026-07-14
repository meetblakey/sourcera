/**
 * Gate: `phase1_billing_field_cents_uniformity`
 *
 * Assertion: Phase DEC monetary fields use explicit cents-backed names and
 * integer storage across Phase 1 billing and M8 value-curve schemas.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_FIELD_REQUIREMENTS = [
  {
    title: /^4\.3\.16 Buyer Referral\b/,
    label: "§4.3.16 Buyer Referral",
    fields: ["credit_value_cents", "credit_redeemed_cents"],
  },
  {
    title: /^4\.3\.17 Buyer-Funded Pro Trial Seat Grant\b/,
    label: "§4.3.17 Buyer-Funded Pro Trial Seat Grant",
    fields: ["ai_value_consumed_cents"],
  },
  {
    title: /^4\.3\.18 Usage Event\b/,
    label: "§4.3.18 Usage Event",
    fields: ["ai_value_cents"],
  },
  {
    title: /^4\.3\.18\.A Usage Event Daily Aggregate\b/,
    label: "§4.3.18.A Usage Event Daily Aggregate",
    fields: ["total_ai_value_cents"],
  },
  {
    title: /^4\.3\.19 Time-Saved Credit\b/,
    label: "§4.3.19 Time-Saved Credit",
    fields: ["loaded_hourly_rate_cents", "value_saved_cents"],
  },
  {
    title: /^48\.5\.8 M8 Org Intelligence Value Curve\b/,
    label: "§48.5.8 M8 Org Intelligence Value Curve",
    fields: [
      "total_value_saved_cents_cumulative",
      "delta_value_saved_cents_this_evaluation",
      "baseline_value_per_evaluation_cents",
    ],
  },
];

const CONVENTION_TOKENS = [
  "`credit_value_cents`",
  "`credit_redeemed_cents`",
  "`ai_value_consumed_cents`",
  "`ai_value_cents`",
  "`loaded_hourly_rate_cents`",
  "`value_saved_cents`",
  "BigInt / Integer USD cents",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/phase1_billing_field_cents_uniformity.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "explicit `*_cents` names and integer / BigInt storage",
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function sectionText(doc: SpecDoc, title: RegExp, label: string, findings: Finding[]) {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    push(findings, doc, 0, label, `${label} is missing; cannot verify Phase 1 billing cents uniformity.`);
    return { text: "", line: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function findFieldRow(section: { text: string; line: number }, field: string): { text: string; line: number } | null {
  const lines = section.text.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i] ?? "";
    if (text.includes(`| \`${field}\` |`)) return { text, line: section.line + i };
  }
  return null;
}

function fieldFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const req of SECTION_FIELD_REQUIREMENTS) {
    const section = sectionText(doc, req.title, req.label, findings);
    for (const field of req.fields) {
      const row = findFieldRow(section, field);
      if (!row) {
        push(findings, doc, section.line, field, `${req.label} is missing required cents-backed field \`${field}\`.`);
        continue;
      }
      if (!/\|\s*(BigInt|Integer|integer)\s*\|/.test(row.text)) {
        push(findings, doc, row.line, row.text, `${req.label} field \`${field}\` must use integer / BigInt cents storage.`);
      }
      if (!row.text.includes("cents")) {
        push(findings, doc, row.line, row.text, `${req.label} field \`${field}\` must explicitly state cents semantics.`);
      }
    }
  }
  return findings;
}

function conventionFindings(doc: SpecDoc): Finding[] {
  const line = doc.lines.findIndex((value) => value?.includes("**Phase 1 billing cents convention.**"));
  if (line < 0) {
    return [
      {
        file: doc.path,
        line: 0,
        matched_text: "**Phase 1 billing cents convention.**",
        message: "Appendix K Phase 1 billing cents convention glossary entry is missing.",
      },
    ];
  }
  const text = doc.lines[line] ?? "";
  const findings: Finding[] = [];
  for (const token of CONVENTION_TOKENS) {
    if (!text.includes(token)) {
      push(findings, doc, line, token, `Phase 1 billing cents convention is missing canonical token ${token}.`);
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const line = doc.lines.findIndex((value) => value?.trim().startsWith("| `phase1_billing_field_cents_uniformity` |"));
  if (line < 0) {
    return [
      {
        file: doc.path,
        line: 0,
        matched_text: "`phase1_billing_field_cents_uniformity`",
        message: "Appendix M.5 row phase1_billing_field_cents_uniformity is missing.",
      },
    ];
  }
  const row = doc.lines[line] ?? "";
  const findings: Finding[] = [];
  for (const token of M5_TOKENS) {
    if (!row.includes(token)) {
      push(findings, doc, line, token, `§M.5 phase1_billing_field_cents_uniformity row is missing runtime binding ${token}.`);
    }
  }
  return findings;
}

function forbiddenDollarStorageFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const forbidden = /\|\s*`[^`]*(?:_usd|_dollars)[^`]*`\s*\|\s*Decimal\((?:8|10),2\)/;
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (!forbidden.test(text)) continue;
    push(findings, doc, line, text, "Phase 1 monetary field rows must not use Decimal USD-dollar storage; use explicit cents-backed BigInt / Integer fields.");
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "phase1_billing_field_cents_uniformity",
  sourcePhase: "v7.2.0-REM Phase DEC",
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...fieldFindings(doc),
      ...conventionFindings(doc),
      ...m5Findings(doc),
      ...forbiddenDollarStorageFindings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
