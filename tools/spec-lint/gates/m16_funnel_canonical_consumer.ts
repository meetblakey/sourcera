/**
 * Gate: `m16_funnel_canonical_consumer`
 *
 * Assertion: §51.0.3 is the only authoring home for the M16 buyer referral
 * funnel. §48.7.3 may cite the registry, but must not carry inline stage lists.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const FUNNEL_ID = "buyer_referral_funnel";

const STAGE_EVENTS = [
  "m16_referral_created",
  "m16_referral_link_shared",
  "m16_referral_referee_signed_up",
  "m16_referral_referee_activated",
  "m16_referral_credit_issued",
  "m16_referral_credit_applied",
  "m16_referral_credit_fully_redeemed",
] as const;

const DIAGNOSTIC_EVENTS = [
  "m16_referral_same_domain_blocked",
  "m16_referral_payment_overlap_detected",
  "m16_referral_fraud_sweep_completed",
  "m16_referral_exclusivity_blocked",
  "m16_referral_credit_expired",
  "m16_referral_ops_override",
] as const;

const FORBIDDEN_INLINE_STAGE_PATTERNS = [
  "created → link_shared",
  "referee_signed_up → referee_activated",
  "credit_issued → credit_applied",
  "credit_applied → credit_redeemed",
  "m16_referral_credit_redeemed",
  "compose the 7 funnel stages",
  "7 funnel stages (`created",
];

const REQUIRED_4873_TOKENS = [
  "registered at §51.0.3 as `buyer_referral_funnel`",
  "Funnel stage definitions, ordered anchor events, customer-visible dashboard surface, and §42 alert thresholds are single-sourced at §51.0.3",
  "§48.7.3 cites §51.0.3 and does not duplicate the funnel definition",
  "only §51.0.3 decides which of those events are funnel stages versus side-channel diagnostics",
  "CI gate `m16_funnel_canonical_consumer`",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/m16_funnel_canonical_consumer.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§51.0.3 `buyer_referral_funnel` registry is sole authoring home",
  "no inline funnel-stage definition in §48.7.3",
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

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required M16 funnel canonical-consumer token: ${token}`);
}

function registryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionText(doc, "51.0.3-conversion-funnel-registry-per-growth-path");
  if (!section) {
    push(findings, doc, 0, "51.0.3-conversion-funnel-registry-per-growth-path", "§51.0.3 Conversion Funnel Registry section is missing.");
    return findings;
  }
  const table = parseTableAt(doc, section.line);
  const row = table.rows.find((candidate) => candidate.cells[0]?.includes(`\`${FUNNEL_ID}\``));
  if (!row) {
    push(findings, doc, section.line, FUNNEL_ID, "§51.0.3 is missing the buyer_referral_funnel row.");
    return findings;
  }
  const rowText = row.cells.join(" | ");
  for (const event of STAGE_EVENTS) requireToken(findings, doc, rowText, row.line, "§51.0.3 buyer_referral_funnel row", `\`${event}\``);
  requireToken(findings, doc, rowText, row.line, "§51.0.3 buyer_referral_funnel row", '§51.3 Org-Level Dashboard "Referral Funnel" panel');
  requireToken(findings, doc, rowText, row.line, "§51.0.3 buyer_referral_funnel row", "Stage-level regression > 15% → P3");
  if (rowText.includes("m16_referral_credit_redeemed")) {
    push(findings, doc, row.line, "m16_referral_credit_redeemed", "§51.0.3 buyer_referral_funnel must use Appendix G event `m16_referral_credit_fully_redeemed`, not stale `m16_referral_credit_redeemed`.");
  }
  for (const event of DIAGNOSTIC_EVENTS) {
    if (rowText.includes(event)) {
      push(findings, doc, row.line, event, `§51.0.3 buyer_referral_funnel row must not include diagnostic event ${event} as a funnel stage.`);
    }
  }
  return findings;
}

function appendixGFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionText(doc, "appendix-g-section-48-7-additions");
  if (!section) {
    push(findings, doc, 0, "appendix-g-section-48-7-additions", "Appendix G §48.7 event additions section is missing.");
    return findings;
  }
  for (const event of [...STAGE_EVENTS, ...DIAGNOSTIC_EVENTS]) {
    requireToken(findings, doc, section.text, section.line, "Appendix G §48.7 M16 event catalog", `\`${event}\``);
  }
  if (section.text.includes("`m16_referral_credit_redeemed`")) {
    push(findings, doc, section.line, "`m16_referral_credit_redeemed`", "Appendix G §48.7 must not register stale M16 event name `m16_referral_credit_redeemed`.");
  }
  return findings;
}

function consumerFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionText(doc, "48.7.3-m16-buyer-referral-credit");
  if (!section) {
    push(findings, doc, 0, "48.7.3-m16-buyer-referral-credit", "§48.7.3 M16 Buyer Referral Credit section is missing.");
    return findings;
  }
  for (const token of REQUIRED_4873_TOKENS) requireToken(findings, doc, section.text, section.line, "§48.7.3 M16 Conversion Funnel note", token);
  for (const token of FORBIDDEN_INLINE_STAGE_PATTERNS) {
    if (section.text.includes(token)) {
      push(findings, doc, section.line, token, `§48.7.3 must not define M16 funnel stages inline; cite §51.0.3 buyer_referral_funnel instead.`);
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `m16_funnel_canonical_consumer` |"));
  if (!row) {
    push(findings, doc, 0, "`m16_funnel_canonical_consumer`", "§M.5 row m16_funnel_canonical_consumer is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 m16_funnel_canonical_consumer row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "m16_funnel_canonical_consumer",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...registryFindings(doc),
      ...appendixGFindings(doc),
      ...consumerFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
