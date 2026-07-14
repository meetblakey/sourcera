import { anchorForLine, findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";

export function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

export function sectionTextByAnchor(doc: SpecDoc, anchor: string) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

export function sectionTextByTitle(doc: SpecDoc, title: string | RegExp) {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

export function tableRowsByAnchor(doc: SpecDoc, anchor: string) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return parseTableAt(doc, section.startLine, section.endLine);
}

export function tableRowsByTitle(doc: SpecDoc, title: string | RegExp) {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return parseTableAt(doc, section.startLine, section.endLine);
}

export function fieldNamesByAnchor(doc: SpecDoc, anchor: string): string[] {
  const table = tableRowsByAnchor(doc, anchor);
  if (!table) return [];
  return table.rows.map((row) => row.cells[0]?.replace(/`/g, "").trim()).filter(Boolean);
}

export function fieldNamesByTitle(doc: SpecDoc, title: string | RegExp): string[] {
  const table = tableRowsByTitle(doc, title);
  if (!table) return [];
  return table.rows.map((row) => row.cells[0]?.replace(/`/g, "").trim()).filter(Boolean);
}

export function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

export function requireTokens(
  findings: Finding[],
  doc: SpecDoc,
  section: { text: string; startLine: number } | null,
  label: string,
  tokens: string[],
): void {
  if (!section) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      push(findings, doc, section.startLine, token, `${label} is missing required WorkspaceTemplate binding token: ${token}`);
    }
  }
}

export function m5RuntimeActiveFindings(doc: SpecDoc, gateId: string): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith(`| \`${gateId}\` |`));
  if (!row) {
    push(findings, doc, 0, gateId, `§M.5 row ${gateId} is missing.`);
    return findings;
  }
  const tokens = [
    "**`runtime_active`**",
    `tools/spec-lint/gates/${gateId}.ts`,
    "verified PASS on live Master Spec and pass/fail fixtures",
  ];
  for (const token of tokens) {
    if (!row.text.includes(token)) {
      push(findings, doc, row.line, token, `§M.5 ${gateId} row is missing required runtime-active token: ${token}`);
    }
  }
  return findings;
}

export function enumValuesInSection(doc: SpecDoc, title: string | RegExp): Set<string> {
  const section = sectionTextByTitle(doc, title);
  const values = new Set<string>();
  if (!section) return values;
  for (const match of section.text.matchAll(/`([^`]+)`/g)) {
    values.add(match[1]);
  }
  return values;
}
