import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
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

export function sectionText(doc: SpecDoc, anchor: string): { text: string; startLine: number; endLine: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

export function tableRows(doc: SpecDoc, anchor: string) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return parseTableAt(doc, section.startLine, section.endLine);
}

export function rowByField(doc: SpecDoc, anchor: string, field: string) {
  const table = tableRows(doc, anchor);
  return table?.rows.find((row) => row.cells[0] === `\`${field}\``) ?? null;
}

export function fieldNames(doc: SpecDoc, anchor: string): string[] {
  const table = tableRows(doc, anchor);
  if (!table) return [];
  return table.rows.map((row) => row.cells[0]?.replace(/`/g, "").trim()).filter(Boolean);
}

export function codeValues(text: string): string[] {
  const values: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) values.push(match[1].trim());
  return values;
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
  anchor: string,
  label: string,
  tokens: string[],
): void {
  const section = sectionText(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      push(findings, doc, section.startLine, token, `${label} is missing required token: ${token}`);
    }
  }
}

export function appendixEnumValues(doc: SpecDoc, headingStart: string): { values: string[]; line: number } | null {
  const heading = findLine(doc, (line) => line.startsWith(headingStart));
  if (!heading) return null;
  for (let line = heading.line + 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (/^#{1,6}\s+/.test(text)) return null;
    const values = codeValues(text);
    if (values.length > 0) return { values, line };
  }
  return null;
}

export function stateMachineValues(doc: SpecDoc, anchor: string): { values: string[]; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  let marker = 0;
  for (let line = section.startLine; line <= section.endLine; line++) {
    if ((doc.lines[line] ?? "").includes("**State Machine.**")) {
      marker = line;
      break;
    }
  }
  if (!marker) return null;
  const table = parseTableAt(doc, marker, section.endLine);
  const values = new Set<string>();
  for (const row of table.rows) {
    for (const value of [...codeValues(row.cells[0] ?? ""), ...codeValues(row.cells[1] ?? "")]) {
      values.add(value);
    }
  }
  return { values: [...values], line: table.header?.line ?? marker };
}

export function requireExactValues(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  line: number,
  values: string[],
  expected: readonly string[],
): void {
  if (values.length !== expected.length || !expected.every((value) => values.includes(value))) {
    push(
      findings,
      doc,
      line,
      values.join(", "),
      `${label} must contain exactly: ${expected.map((value) => `\`${value}\``).join(", ")}.`,
    );
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

