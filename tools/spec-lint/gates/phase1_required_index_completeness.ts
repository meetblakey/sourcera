/**
 * Gate: `phase1_required_index_completeness`
 *
 * Assertion: D-DEC-002 required Phase 1 indexes remain present on the
 * canonical entity contracts that depend on them.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SECTION_REQUIREMENTS = [
  {
    title: /^4\.3\.11 Internal Comment Thread\b/,
    label: "§4.3.11 Internal Comment Thread",
    tokens: [
      "| `subscribed_user_ids` | Array",
      "`GIN (subscribed_user_ids)`",
      "my subscribed threads",
      "without scanning all Workspace threads",
    ],
  },
  {
    title: /^4\.3\.16 Buyer Referral\b/,
    label: "§4.3.16 Buyer Referral",
    tokens: [
      "`(referee_email, status)`",
      "lowercased-email referee exclusivity lookup",
      "Referee Exclusivity Rule",
      "Multiple Buyer Referral rows may coexist in `pending` for the same lowercased `referee_email`",
    ],
  },
  {
    title: /^4\.3\.17 Buyer-Funded Pro Trial Seat Grant\b/,
    label: "§4.3.17 Buyer-Funded Pro Trial Seat Grant",
    tokens: [
      "`(buyer_org_id, vendor_org_id, created_at DESC)`",
      "buyer/vendor 365-day rule after vendor Org binding",
      "Same buyer/vendor within 365 days",
      "`same_buyer_365d_block_triggered = true`",
    ],
  },
  {
    title: /^4\.3\.19 Time-Saved Credit\b/,
    label: "§4.3.19 Time-Saved Credit",
    tokens: [
      "`(org_id, recognized_at DESC) WHERE reversed_by_credit_id IS NULL`",
      "reversal-aware aggregate SUM queries",
      "SUM across Time-Saved Credit rows where `reversed_by_credit_id IS NULL`",
      "Reversal rows MUST set `reversal_of_credit_id`",
    ],
  },
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/phase1_required_index_completeness.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "D-DEC-002 required indexes",
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

function sectionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const req of SECTION_REQUIREMENTS) {
    const section = findSectionByTitle(doc, req.title);
    if (!section) {
      push(findings, doc, 0, req.label, `${req.label} is missing; cannot verify D-DEC-002 required indexes.`);
      continue;
    }

    const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    for (const token of req.tokens) {
      if (!text.includes(token)) {
        push(findings, doc, section.startLine, token, `${req.label} is missing required D-DEC-002 index contract token: ${token}`);
      }
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const line = doc.lines.findIndex((value) => value?.trim().startsWith("| `phase1_required_index_completeness` |"));
  if (line < 0) {
    return [
      {
        file: doc.path,
        line: 0,
        matched_text: "`phase1_required_index_completeness`",
        message: "Appendix M.5 row phase1_required_index_completeness is missing.",
      },
    ];
  }

  const row = doc.lines[line] ?? "";
  const findings: Finding[] = [];
  for (const token of M5_TOKENS) {
    if (!row.includes(token)) {
      push(findings, doc, line, token, `§M.5 phase1_required_index_completeness row is missing runtime binding ${token}.`);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "phase1_required_index_completeness",
  sourcePhase: "v7.2.0-REM Phase DEC",
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [...sectionFindings(doc), ...m5Findings(doc)];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
