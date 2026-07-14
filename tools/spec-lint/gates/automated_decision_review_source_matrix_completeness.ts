/**
 * Gate: `automated_decision_review_source_matrix_completeness`
 *
 * Assertion: every Appendix J `dsar_automated_decision_source_type` value has
 * exactly one row in §6.8.11's Article 22 reviewable source matrix.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const EXPECTED = [
  "ai_scoring",
  "match_score",
  "sim_flag",
  "abuse_report_severity",
  "k_anonymity_suppression",
  "ai_operation_other",
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

function codeTokens(text: string): string[] {
  return [...text.matchAll(/`([a-z0-9_]+)`/g)].map((match) => match[1]);
}

function findLine(doc: SpecDoc, re: RegExp, start = 1, end = doc.lines.length - 1): number {
  for (let line = start; line <= end; line++) {
    if (re.test(doc.lines[line] ?? "")) return line;
  }
  return -1;
}

function enumValues(doc: SpecDoc, findings: Finding[]): Map<string, number> {
  const start = findLine(doc, /`dsar_automated_decision_source_type` enum/);
  if (start < 0) {
    push(findings, doc, 0, "dsar_automated_decision_source_type", "Appendix J must register `dsar_automated_decision_source_type`.");
    return new Map();
  }

  const values = new Map<string, number>();
  for (let line = start + 1; line <= Math.min(start + 20, doc.lines.length - 1); line++) {
    const text = doc.lines[line] ?? "";
    if (/^\*\*`dsar_request_state` enum/.test(text)) break;
    const first = codeTokens(text)[0];
    if (first && first !== "dsar_automated_decision_source_type") values.set(first, line);
  }
  return values;
}

function matrixValues(doc: SpecDoc, findings: Finding[]): Map<string, number[]> {
  const section = findSectionByAnchor(doc, "6.8.11-automated-decision-rights");
  if (!section) {
    push(findings, doc, 0, "6.8.11", "§6.8.11 Automated-Decision Rights section is missing.");
    return new Map();
  }

  const start = findLine(doc, /Reviewable source matrix/, section.startLine, section.endLine);
  const end = findLine(doc, /Right surface/, section.startLine, section.endLine);
  if (start < 0 || end < 0 || end <= start) {
    push(findings, doc, section.startLine, "Reviewable source matrix", "§6.8.11 must contain a reviewable source matrix before the Right surface block.");
    return new Map();
  }

  const values = new Map<string, number[]>();
  for (let line = start; line < end; line++) {
    const match = /^\|\s*`([a-z0-9_]+)`\s*\|/.exec(doc.lines[line] ?? "");
    if (!match) continue;
    if (match[1] === "decision_source_type") continue;
    const prior = values.get(match[1]) ?? [];
    prior.push(line);
    values.set(match[1], prior);
  }
  return values;
}

export const gate: SpecLintGate = {
  id: "automated_decision_review_source_matrix_completeness",
  sourcePhase: "V711-PH35",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_article_22",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const enumMap = enumValues(doc, findings);
    const matrixMap = matrixValues(doc, findings);

    for (const value of EXPECTED) {
      if (!enumMap.has(value)) {
        push(findings, doc, 0, value, `Appendix J is missing automated decision source type \`${value}\`.`);
      }
      const rows = matrixMap.get(value) ?? [];
      if (rows.length !== 1) {
        push(
          findings,
          doc,
          rows[0] ?? 0,
          value,
          `§6.8.11 reviewable source matrix must contain exactly one row for \`${value}\`; found ${rows.length}.`,
        );
      }
    }

    for (const [value, line] of enumMap.entries()) {
      if (!matrixMap.has(value)) {
        push(findings, doc, line, value, `Appendix J value \`${value}\` has no §6.8.11 reviewable source matrix row.`);
      }
    }
    for (const [value, rows] of matrixMap.entries()) {
      if (!enumMap.has(value)) {
        push(findings, doc, rows[0], value, `§6.8.11 reviewable source matrix value \`${value}\` is not registered in Appendix J.`);
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
