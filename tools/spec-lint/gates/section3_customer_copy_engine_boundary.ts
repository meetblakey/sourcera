/**
 * Gate: `section3_customer_copy_engine_boundary`
 *
 * Assertion: Section 3 keeps engine phase and plan-resolution detail out of
 * first-timer copy while preserving the canonical Team/Solo eligibility rule.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "section3_customer_copy_engine_boundary";

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return { text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"), line: section.startLine };
}

function requireRowTokens(
  findings: Finding[],
  doc: SpecDoc,
  scope: { text: string; line: number } | null,
  label: string,
  predicate: (line: string) => boolean,
  required: readonly string[],
  forbidden: readonly string[],
) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  const lines = scope.text.split("\n");
  const index = lines.findIndex(predicate);
  if (index < 0) {
    push(findings, doc, scope.line, label, `${label} row is missing.`);
    return;
  }
  const row = lines[index] ?? "";
  for (const token of required) {
    if (!row.includes(token)) push(findings, doc, scope.line + index, token, `${label} row is missing required token: ${token}`);
  }
  for (const token of forbidden) {
    if (row.includes(token)) push(findings, doc, scope.line + index, token, `${label} row retains forbidden customer-copy token: ${token}`);
  }
}

function requireTokens(
  findings: Finding[],
  doc: SpecDoc,
  scope: { text: string; line: number } | null,
  label: string,
  tokens: readonly string[],
) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!scope.text.includes(token)) push(findings, doc, scope.line, token, `${label} is missing required token: ${token}`);
  }
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const catalog = sectionText(doc, "3.7.6-per-surface-catalog");
  requireRowTokens(
    findings,
    doc,
    catalog,
    "§3.7.6.2 Scoring Matrix vendor CTA",
    (line) => line.trim().startsWith("| Empty (no vendors in Scoring Matrix) |"),
    [
      "Buyer Team: enabled at `pipeline_stage_id >= 4`",
      "Buyer Solo: enabled when the compressed step is `Define`, `Score`, or `Decide`",
      "Vendor curation becomes available when vendor discovery begins.",
      "Vendor curation becomes available in Define.",
    ],
    ["Phase ≥ 3", "Phase < 3", "begins in Phase 3"],
  );
  requireRowTokens(
    findings,
    doc,
    catalog,
    "§3.7.6.6 Knowledge Base quota banner",
    (line) => line.trim().startsWith("| Error (plan-gate, KB over byte quota) |"),
    ["You have reached your Knowledge Base size limit. Upgrade to continue indexing.", "§34.1.2 / §5.11"],
    ["Seller Starter", "Upgrade to Growth"],
  );
  requireTokens(findings, doc, sectionText(doc, "3.7.11-loading-empty-error-acceptance-criteria"), "§3.7.11 customer-copy acceptance criteria", [
    "scoring_matrix_vendor_cta_surface_boundary",
    "kb_quota_error_copy_no_plan_label",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Section 3 customer-copy closure",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
