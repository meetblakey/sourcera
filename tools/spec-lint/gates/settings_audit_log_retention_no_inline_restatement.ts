/**
 * Gate: `settings_audit_log_retention_no_inline_restatement`
 *
 * Assertion: §36.2 Audit Logs cites the plan-retention and financial-retention
 * authorities without restating plan-tier retention values or retired plan names.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_ROW_TOKENS = [
  "§34.1.1",
  "§34.1.2",
  "Audit Log Retention (UI)",
  "§40.2",
  "financial-record audit retention",
  "inline restatement retired",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/settings_audit_log_retention_no_inline_restatement.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§36.2 Audit Logs",
  "§40.2",
  "retired plan names",
];

const INLINE_RETENTION_RE =
  /\b(?:30\s*days?|30d|1\s*year|1yr|3\s*years?|3yr|7\s*years?|7yr)\b/i;
const RETIRED_PLAN_RE = /\bBusiness\b/;

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) {
    push(findings, doc, line, token, `${label} is missing required audit-log retention token: ${token}`);
  }
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function auditLogsRow(doc: SpecDoc, findings: Finding[]): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, "36.2-organization-settings");
  if (!section) {
    push(findings, doc, 0, "36.2-organization-settings", "§36.2 Organization Settings section is missing.");
    return null;
  }

  const table = parseTableAt(doc, section.startLine, section.endLine);
  const row = table.rows.find((r) => (r.cells[0] ?? "").includes("Audit Logs"));
  if (!row) {
    push(findings, doc, section.startLine, "Audit Logs", "§36.2 Audit Logs settings row is missing.");
    return null;
  }
  return { text: row.cells.join(" | "), line: row.line };
}

function settingsFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = auditLogsRow(doc, findings);
  if (!row) return findings;

  for (const token of REQUIRED_ROW_TOKENS) {
    requireToken(findings, doc, row.text, row.line, "§36.2 Audit Logs row", token);
  }

  const inlineRetention = INLINE_RETENTION_RE.exec(row.text);
  if (inlineRetention) {
    push(
      findings,
      doc,
      row.line,
      inlineRetention[0],
      "§36.2 Audit Logs row must not restate plan-tier retention values inline; cite §34.1.1 / §34.1.2 and §40.2 instead.",
    );
  }

  const retiredPlan = RETIRED_PLAN_RE.exec(row.text);
  if (retiredPlan) {
    push(
      findings,
      doc,
      row.line,
      retiredPlan[0],
      "§36.2 Audit Logs row must not use retired plan names such as Business.",
    );
  }

  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `settings_audit_log_retention_no_inline_restatement` |"));
  if (!row) {
    push(findings, doc, 0, "`settings_audit_log_retention_no_inline_restatement`", "§M.5 row settings_audit_log_retention_no_inline_restatement is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) {
    requireToken(findings, doc, row.text, row.line, "§M.5 settings_audit_log_retention_no_inline_restatement row", token);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "settings_audit_log_retention_no_inline_restatement",
  sourcePhase: "Phase 3.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...settingsFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
