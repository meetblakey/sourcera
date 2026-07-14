import { anchorForLine } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";
import { m5RuntimeActiveFindings } from "./marketplace_entity_gate_helpers.js";

export function normalize(text: string): string {
  return text.replace(/\\_/g, "_").replace(/\\&/g, "&");
}

export function push(findings: Finding[], doc: SpecDoc, line: number, matchedText: string, message: string): void {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matchedText,
    message,
  });
}

export function lineFor(doc: SpecDoc, token: string): number {
  const target = normalize(token);
  for (let line = 1; line < doc.lines.length; line += 1) {
    if (normalize(doc.lines[line] ?? "").includes(target)) return line;
  }
  return 0;
}

export function requireDocTokens(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  tokens: readonly string[],
): void {
  const text = normalize(doc.text);
  for (const token of tokens) {
    if (!text.includes(normalize(token))) {
      push(findings, doc, lineFor(doc, token), token, `${label} is missing required token: ${token}`);
    }
  }
}

export function sliceBetweenTokens(
  doc: SpecDoc,
  startToken: string,
  endToken: string,
): { text: string; startLine: number; endLine: number } | null {
  const startNeedle = normalize(startToken);
  const endNeedle = normalize(endToken);
  let startLine = 0;
  let endLine = doc.lines.length - 1;
  for (let line = 1; line < doc.lines.length; line += 1) {
    if (normalize(doc.lines[line] ?? "").includes(startNeedle)) {
      startLine = line;
      break;
    }
  }
  if (!startLine) return null;
  for (let line = startLine + 1; line < doc.lines.length; line += 1) {
    if (normalize(doc.lines[line] ?? "").includes(endNeedle)) {
      endLine = line - 1;
      break;
    }
  }
  return {
    text: normalize(doc.lines.slice(startLine, endLine + 1).join("\n")),
    startLine,
    endLine,
  };
}

export function requireTokensInSlice(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  slice: { text: string; startLine: number },
  tokens: readonly string[],
): void {
  for (const token of tokens) {
    if (!slice.text.includes(normalize(token))) {
      push(findings, doc, slice.startLine, token, `${label} is missing required token: ${token}`);
    }
  }
}

export function rejectTokensInSlice(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  slice: { text: string; startLine: number },
  tokens: readonly string[],
): void {
  for (const token of tokens) {
    if (slice.text.includes(normalize(token))) {
      push(findings, doc, slice.startLine, token, `${label} contains stale/forbidden token: ${token}`);
    }
  }
}

export function requireQaM5RuntimeActive(findings: Finding[], doc: SpecDoc, gateId: string): void {
  findings.push(...m5RuntimeActiveFindings(doc, gateId));
}
