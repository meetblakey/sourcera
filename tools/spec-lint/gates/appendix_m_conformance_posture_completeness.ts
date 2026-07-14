/**
 * Gate: `appendix_m_conformance_posture_completeness`
 *
 * Assertion: every customer-visible or Ops-visible Appendix M.1 row carries an
 * explicit §37.1 conformance posture note.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { TableRow } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface M1Columns {
  concept: number;
  surface: number;
  tier: number;
  notes: number;
}

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function findLineIncludingAll(doc: SpecDoc, tokens: readonly string[]) {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (tokens.every((token) => line.includes(token))) return { text: line, line: i };
  }
  return null;
}

function sectionText(doc: SpecDoc, title: RegExp, label: string, findings: Finding[]) {
  const section = findSectionByTitle(doc, title);
  if (!section) {
    findings.push({
      file: doc.path,
      line: 0,
      anchor: label,
      message: `${label} section is missing.`,
    });
    return { text: "", line: 0, anchor: label };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor ?? section.heading.title,
  };
}

function requireTokens(
  doc: SpecDoc,
  target: { text: string; line: number; anchor?: string },
  label: string,
  tokens: readonly string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!target.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: target.line,
        anchor: target.anchor,
        matched_text: token,
        message: `${label} is missing required conformance-posture token: ${token}`,
      });
    }
  }
  return findings;
}

function isSectionRow(row: TableRow, cols: M1Columns): boolean {
  const concept = row.cells[cols.concept] ?? "";
  return /^\*\*.*\*\*$/.test(concept.trim()) && row.cells.slice(1).every((cell) => !cell.trim());
}

function isVisibleRow(row: TableRow, cols: M1Columns): boolean {
  if (isSectionRow(row, cols)) return false;
  const surface = row.cells[cols.surface] ?? "";
  const tier = row.cells[cols.tier] ?? "";
  const notes = row.cells[cols.notes] ?? "";
  const blob = `${surface} ${tier} ${notes}`;

  if (/Ops Console|Ops-only|Ops dashboard|Ops dashboards|Ops admins|Ops-side|Ops target|spec-ops/i.test(blob)) {
    return true;
  }
  if (/Internal-only, never surfaced/i.test(blob)) return false;
  if (/^No surface/i.test(surface.trim()) || /^No customer surface/i.test(surface.trim())) return false;
  return true;
}

function postureIsValid(notes: string): boolean {
  if (/Conformance posture:\s*inherits_§37\.1/i.test(notes)) return true;
  if (/Conformance posture:\s*deviation rationale/i.test(notes) && /mitigation/i.test(notes)) return true;
  return false;
}

function m1Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByTitle(doc, /^M\.1 Master Surface\/Engine Mapping Table$/);
  if (!section) {
    return [{
      file: doc.path,
      line: 0,
      message: "parse_error: Appendix M.1 mapping table section not found.",
    }];
  }

  const table = parseTableAt(doc, section.startLine + 1, section.endLine);
  if (!table.header || table.rows.length === 0) {
    return [{
      file: doc.path,
      line: section.startLine,
      anchor: section.heading.anchor,
      message: "parse_error: Appendix M.1 mapping table not found.",
    }];
  }

  const headers = table.header.cells.map((cell) => stripMd(cell).toLowerCase());
  const cols: M1Columns = {
    concept: headers.findIndex((header) => header === "engine concept"),
    surface: headers.findIndex((header) => header === "surface metaphor"),
    tier: headers.findIndex((header) => header === "tier visibility"),
    notes: headers.findIndex((header) => header === "notes"),
  };
  if (Object.values(cols).some((idx) => idx < 0)) {
    return [{
      file: doc.path,
      line: table.header.line,
      anchor: anchorForLine(doc, table.header.line),
      message: "parse_error: Appendix M.1 table is missing Engine concept, Surface metaphor, Tier visibility, or Notes columns.",
    }];
  }

  for (const row of table.rows) {
    if (!isVisibleRow(row, cols)) continue;
    const notes = row.cells[cols.notes] ?? "";
    if (!postureIsValid(notes)) {
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: row.cells[cols.concept] ?? "",
        message:
          "Appendix M.1 customer-visible or Ops-visible row is missing a valid conformance posture note: use `Conformance posture: inherits_§37.1.` or `Conformance posture: deviation rationale ... mitigation ...`.",
      });
    }
  }

  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const row = findLineIncludingAll(doc, ["| `appendix_m_conformance_posture_completeness` |"]);
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "`appendix_m_conformance_posture_completeness`",
      message: "Appendix M.5 appendix_m_conformance_posture_completeness row is missing.",
    }];
  }
  return requireTokens(doc, { text: row.text, line: row.line, anchor: "m5" }, "Appendix M.5 appendix_m_conformance_posture_completeness row", [
    "**`runtime_active`**",
    "tools/spec-lint/gates/appendix_m_conformance_posture_completeness.ts",
    "inherits_§37.1",
    "deviation rationale + mitigation",
  ]);
}

export const gate: SpecLintGate = {
  id: "appendix_m_conformance_posture_completeness",
  sourcePhase: "Phase 37 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const section37 = sectionText(doc, /^37\.1 Accessibility \(WCAG 2\.1 AA\)$/, "§37.1", findings);
    findings.push(...requireTokens(doc, section37, "§37.1", [
      "Every UI surface MUST carry a WCAG conformance posture binding.",
      "appendix_m_conformance_posture_completeness",
      "Appendix M.1 conformance-posture note",
    ]));

    findings.push(...m1Findings(doc));
    findings.push(...m5Findings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
