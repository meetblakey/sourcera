import { parseTableAt } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
} from "./enterprise_security_gate_helpers.js";

export const RESPONSIVE_SOURCE_PHASE = "v7.2.0-REM Phase 38";

export function requireDocTokens(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  tokens: readonly string[],
): void {
  for (const token of tokens) {
    if (!doc.text.includes(token)) {
      push(findings, doc, 0, token, `${label} is missing required token: ${token}`);
    }
  }
}

export function requireRuntimeActive(findings: Finding[], doc: SpecDoc, gateId: string): void {
  findings.push(...m5RuntimeActiveFindings(doc, gateId));
}

export function requireM5RowTokens(
  findings: Finding[],
  doc: SpecDoc,
  gateId: string,
  tokens: readonly string[],
): void {
  const row = findLine(doc, (line) => line.trim().startsWith(`| \`${gateId}\` |`));
  if (!row) {
    push(findings, doc, 0, gateId, `§M.5 row ${gateId} is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!row.text.includes(token)) {
      push(findings, doc, row.line, token, `§M.5 row ${gateId} is missing required token: ${token}`);
    }
  }
}

export function sectionByAnchorOrFinding(
  findings: Finding[],
  doc: SpecDoc,
  anchor: string,
  label: string,
): { text: string; startLine: number; endLine: number } | null {
  const section = sectionTextByAnchor(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
  }
  return section;
}

export function requireSectionTokensByAnchor(
  findings: Finding[],
  doc: SpecDoc,
  anchor: string,
  label: string,
  tokens: readonly string[],
): void {
  requireTokens(findings, doc, sectionByAnchorOrFinding(findings, doc, anchor, label), label, tokens);
}

export function rejectSectionTokensByAnchor(
  findings: Finding[],
  doc: SpecDoc,
  anchor: string,
  label: string,
  tokens: readonly string[],
): void {
  const section = sectionByAnchorOrFinding(findings, doc, anchor, label);
  if (!section) return;
  const lines = section.text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    for (const token of tokens) {
      if (line.includes(token)) {
        push(findings, doc, section.startLine + i, token, `${label} contains forbidden token: ${token}`);
      }
    }
  }
}

export function sectionTableRowsByAnchor(
  findings: Finding[],
  doc: SpecDoc,
  anchor: string,
  label: string,
): Array<{ cells: string[]; line: number }> {
  const section = sectionByAnchorOrFinding(findings, doc, anchor, label);
  if (!section) return [];
  return parseTableAt(doc, section.startLine, section.endLine).rows;
}
