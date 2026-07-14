import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
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

export function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line += 1) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

export function sectionTextByAnchor(doc: SpecDoc, anchor: string): { text: string; startLine: number; endLine: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

export function requireTokens(
  findings: Finding[],
  doc: SpecDoc,
  scope: { text: string; startLine: number } | null,
  label: string,
  tokens: readonly string[],
) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!scope.text.includes(token)) push(findings, doc, scope.startLine, token, `${label} is missing required token: ${token}`);
  }
}

export function m5RuntimeActiveFindings(doc: SpecDoc, gateId: string): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith(`| \`${gateId}\` |`));
  if (!row) {
    push(findings, doc, 0, gateId, `§M.5 row ${gateId} is missing.`);
    return findings;
  }
  for (const token of [
    "**`runtime_active`**",
    `tools/spec-lint/gates/${gateId}.ts`,
    "verified PASS on live Master Spec and pass/fail fixtures",
  ]) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, `§M.5 row ${gateId} is missing runtime-active evidence token: ${token}`);
  }
  return findings;
}

export function m5PendingLocalGuardFindings(
  doc: SpecDoc,
  gateId: string,
  externalEvidenceTokens: readonly string[],
): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith(`| \`${gateId}\` |`));
  if (!row) {
    push(findings, doc, 0, gateId, `§M.5 row ${gateId} is missing.`);
    return findings;
  }
  for (const token of [
    "spec_binding_pending_pack_m02_3",
    `tools/spec-lint/gates/${gateId}.ts`,
    "pass/fail fixtures",
    ...externalEvidenceTokens,
  ]) {
    if (!row.text.includes(token)) {
      push(findings, doc, row.line, token, `§M.5 ${gateId} row is missing local/external evidence boundary: ${token}`);
    }
  }
  return findings;
}
