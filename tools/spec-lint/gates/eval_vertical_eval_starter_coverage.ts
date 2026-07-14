/**
 * Gate: `eval_vertical_eval_starter_coverage`
 *
 * Assertion: every Appendix J `EvalVertical` value has a matching §13.12
 * default tile and the §4.5.9 public-active registry coverage contract remains
 * explicit.
 */

import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings } from "./marketplace_entity_gate_helpers.js";

const GATE_ID = "eval_vertical_eval_starter_coverage";
const EXPECTED = ["crm", "itsm", "edr", "observability", "payroll_hris", "other"];

function push(findings: Finding[], doc: SpecDoc, line: number, matchedText: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matchedText,
    message,
  });
}

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return { text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"), line: section.startLine };
}

function appendixEvalVerticalValues(doc: SpecDoc): { values: string[]; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    if ((doc.lines[line] ?? "").startsWith("### `EvalVertical`")) {
      for (let valueLine = line + 1; valueLine < doc.lines.length; valueLine++) {
        const text = doc.lines[valueLine] ?? "";
        if (/^#{1,6}\s+/.test(text)) return null;
        const values = [...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
        if (values.length > 0) return { values, line: valueLine };
      }
    }
  }
  return null;
}

function surfaceVerticalRows(doc: SpecDoc): { values: string[]; line: number } | null {
  const section = findSectionByAnchor(doc, "13.12.2-surface");
  if (!section) return null;
  const table = parseTableAt(doc, section.startLine, section.endLine);
  const values = table.rows
    .map((row) => row.cells[0]?.replace(/`/g, "").trim())
    .filter(Boolean) as string[];
  return { values, line: table.header?.line ?? section.startLine };
}

function exactSetFindings(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  line: number,
  values: string[],
): void {
  for (const expected of EXPECTED) {
    if (!values.includes(expected)) {
      push(findings, doc, line, expected, `${label} is missing EvalVertical value \`${expected}\`.`);
    }
  }
  for (const value of values) {
    if (!EXPECTED.includes(value)) {
      push(findings, doc, line, value, `${label} contains unrecognized EvalVertical value \`${value}\`.`);
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "14.7",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const appendixValues = appendixEvalVerticalValues(doc);
    if (!appendixValues) {
      push(findings, doc, 0, "EvalVertical", "Appendix J `EvalVertical` registry is missing.");
    } else {
      exactSetFindings(findings, doc, "Appendix J `EvalVertical`", appendixValues.line, appendixValues.values);
    }

    const surfaceRows = surfaceVerticalRows(doc);
    if (!surfaceRows) {
      push(findings, doc, 0, "13.12.2", "§13.12.2 default vertical tile table is missing.");
    } else {
      exactSetFindings(findings, doc, "§13.12.2 default tile table", surfaceRows.line, surfaceRows.values);
    }

    const entity = sectionText(doc, "4.5.9-eval-starter");
    if (!entity) {
      push(findings, doc, 0, "4.5.9", "§4.5.9 EvalStarter entity section is missing.");
    } else {
      for (const token of ["corresponds to `EvalVertical`", "state=active` AND `visibility=public", "eval_vertical_eval_starter_coverage"]) {
        if (!entity.text.includes(token)) {
          push(findings, doc, entity.line, token, `§4.5.9 EvalStarter is missing public-active coverage token: ${token}`);
        }
      }
    }

    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
