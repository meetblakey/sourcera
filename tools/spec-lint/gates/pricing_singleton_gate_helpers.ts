import { anchorForLine, findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";

export function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: line > 0 ? anchorForLine(doc, line) : undefined,
    matched_text: matched,
    message,
  });
}

export function sectionByAnchor(doc: SpecDoc, anchor: string) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

export function sectionByTitle(doc: SpecDoc, title: string | RegExp) {
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

export function findLine(doc: SpecDoc, predicate: (line: string) => boolean) {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

export function markdownTableCells(lineText: string): string[] {
  return lineText
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function requireDocTokens(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  tokens: string[],
): void {
  for (const token of tokens) {
    if (!doc.text.includes(token)) {
      push(findings, doc, 0, token, `${label} is missing required pricing singleton token: ${token}`);
    }
  }
}

export function requireSectionTokens(
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
      push(findings, doc, section.startLine, token, `${label} is missing required pricing singleton token: ${token}`);
    }
  }
}

export function forbiddenLineFindings(
  doc: SpecDoc,
  patterns: Array<{ re: RegExp; message: string }>,
): Finding[] {
  const findings: Finding[] = [];
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    for (const pattern of patterns) {
      pattern.re.lastIndex = 0;
      const match = pattern.re.exec(text);
      if (match) {
        push(findings, doc, line, match[0], pattern.message);
      }
    }
  }
  return findings;
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
