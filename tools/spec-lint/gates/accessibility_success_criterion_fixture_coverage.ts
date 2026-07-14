/**
 * Gate: `accessibility_success_criterion_fixture_coverage`
 *
 * Assertion: every §37.1 WCAG Success Criterion resolves to a named automated
 * fixture or documented manual procedure in §37.5.1.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const PROCEDURE_TOKEN = /\b(axe|manual|screen_reader|keyboard|responsive|rtl|locale|visual|motion|e2e):[a-z0-9_]+/;

function stripMd(value: string): string {
  return value.replace(/\*\*/g, "").replace(/`/g, "").trim();
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
    return { text: "", line: 0, anchor: label, startLine: 0, endLine: 0 };
  }
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor ?? section.heading.title,
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

function findLineIncludingAll(doc: SpecDoc, tokens: readonly string[]) {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (tokens.every((token) => line.includes(token))) return { text: line, line: i };
  }
  return null;
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
        message: `${label} is missing required fixture-coverage token: ${token}`,
      });
    }
  }
  return findings;
}

function successCriteriaFrom37(section: { text: string; line: number }, doc: SpecDoc): { values: string[]; findings: Finding[] } {
  const criterionLine = section.text
    .split(/\r?\n/)
    .find((line) => line.includes("**Success Criterion set.**")) ?? "";
  const values = [...new Set(criterionLine.match(/\b\d+\.\d+\.\d+\b/g) ?? [])].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
  const findings: Finding[] = [];
  if (values.length === 0) {
    findings.push({
      file: doc.path,
      line: section.line,
      anchor: "37.1",
      message: "§37.1 Success Criterion set contains no parseable WCAG criterion tokens.",
    });
  }
  return { values, findings };
}

function manifestFindings(doc: SpecDoc, expectedCriteria: string[]): Finding[] {
  const findings: Finding[] = [];
  const manifest = findSectionByTitle(doc, /^37\.5\.1 Accessibility Audit Manifest$/);
  if (!manifest) {
    return [{
      file: doc.path,
      line: 0,
      anchor: "37.5.1",
      message: "§37.5.1 Accessibility Audit Manifest is missing.",
    }];
  }

  const table = parseTableAt(doc, manifest.startLine + 1, manifest.endLine);
  if (!table.header || table.rows.length === 0) {
    return [{
      file: doc.path,
      line: manifest.startLine,
      anchor: manifest.heading.anchor,
      message: "parse_error: §37.5.1 Accessibility Audit Manifest table not found.",
    }];
  }

  const headers = table.header.cells.map((cell) => stripMd(cell).toLowerCase());
  const criterionIdx = headers.findIndex((header) => header === "success criterion");
  const fixtureIdx = headers.findIndex((header) => header === "fixture / procedure");
  const requirementIdx = headers.findIndex((header) => header === "requirement");
  const scopeIdx = headers.findIndex((header) => header === "scope");
  if ([criterionIdx, fixtureIdx, requirementIdx, scopeIdx].some((idx) => idx < 0)) {
    return [{
      file: doc.path,
      line: table.header.line,
      anchor: anchorForLine(doc, table.header.line),
      message: "parse_error: §37.5.1 manifest table is missing Success Criterion, Requirement, Fixture / procedure, or Scope columns.",
    }];
  }

  const seen = new Map<string, number[]>();
  for (const row of table.rows) {
    const criterion = stripMd(row.cells[criterionIdx] ?? "");
    if (!criterion) continue;
    const lines = seen.get(criterion) ?? [];
    lines.push(row.line);
    seen.set(criterion, lines);

    const fixture = row.cells[fixtureIdx] ?? "";
    const requirement = row.cells[requirementIdx] ?? "";
    const scope = row.cells[scopeIdx] ?? "";
    if (!PROCEDURE_TOKEN.test(fixture)) {
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: criterion,
        message: `§37.5.1 criterion ${criterion} lacks a named fixture/procedure token.`,
      });
    }
    if (!requirement.trim() || !scope.trim()) {
      findings.push({
        file: doc.path,
        line: row.line,
        anchor: anchorForLine(doc, row.line),
        matched_text: criterion,
        message: `§37.5.1 criterion ${criterion} must carry non-empty Requirement and Scope cells.`,
      });
    }
  }

  for (const criterion of expectedCriteria) {
    if (!seen.has(criterion)) {
      findings.push({
        file: doc.path,
        line: manifest.startLine,
        anchor: manifest.heading.anchor,
        matched_text: criterion,
        message: `§37.5.1 manifest is missing Success Criterion ${criterion}.`,
      });
    }
  }
  for (const [criterion, lines] of seen) {
    if (!expectedCriteria.includes(criterion)) {
      findings.push({
        file: doc.path,
        line: lines[0],
        anchor: anchorForLine(doc, lines[0]),
        matched_text: criterion,
        message: `§37.5.1 manifest contains criterion ${criterion}, but §37.1 does not list it.`,
      });
    }
    if (lines.length > 1) {
      findings.push({
        file: doc.path,
        line: lines[1],
        anchor: anchorForLine(doc, lines[1]),
        matched_text: criterion,
        message: `§37.5.1 manifest duplicates Success Criterion ${criterion}.`,
      });
    }
  }

  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const row = findLineIncludingAll(doc, ["| `accessibility_success_criterion_fixture_coverage` |"]);
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "`accessibility_success_criterion_fixture_coverage`",
      message: "Appendix M.5 accessibility_success_criterion_fixture_coverage row is missing.",
    }];
  }
  return requireTokens(doc, { text: row.text, line: row.line, anchor: "m5" }, "Appendix M.5 accessibility_success_criterion_fixture_coverage row", [
    "**`runtime_active`**",
    "tools/spec-lint/gates/accessibility_success_criterion_fixture_coverage.ts",
    "§37.5.1",
    "duplicate criterion",
    "blank fixture cell",
  ]);
}

export const gate: SpecLintGate = {
  id: "accessibility_success_criterion_fixture_coverage",
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
    const { values, findings: scFindings } = successCriteriaFrom37(section37, doc);
    findings.push(...scFindings);
    findings.push(...manifestFindings(doc, values));
    findings.push(...m5Findings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
