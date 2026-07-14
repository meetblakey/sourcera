import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, SpecDoc } from "../lib/types.js";
import { m5RuntimeActiveFindings } from "./marketplace_entity_gate_helpers.js";

export const SCENARIO_DOTTED_EVENTS = [
  "scenario.created",
  "scenario.updated",
  "scenario.deleted",
  "scenario.recalculated",
  "scenario.locked",
] as const;

export const SCENARIO_POSTHOG_EVENTS = [
  "scenario_created",
  "scenario_updated",
  "scenario_deleted",
  "scenario_recalculated",
  "scenario_locked",
] as const;

export const SCENARIO_LIFECYCLE_STATES = [
  "original",
  "created",
  "edited",
  "results_recomputed",
  "locked",
  "soft_deleted",
  "rejected",
] as const;

export function push(findings: Finding[], doc: SpecDoc, line: number, matchedText: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matchedText,
    message,
  });
}

export function normalize(text: string): string {
  return text.replace(/\\_/g, "_");
}

export function lineFor(doc: SpecDoc, token: string): number {
  const normalizedToken = normalize(token);
  for (let line = 1; line < doc.lines.length; line++) {
    if (normalize(doc.lines[line] ?? "").includes(normalizedToken)) return line;
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

export function requireSectionTokens(
  findings: Finding[],
  doc: SpecDoc,
  anchor: string,
  label: string,
  tokens: readonly string[],
): void {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
    return;
  }
  const text = normalize(doc.lines.slice(section.startLine, section.endLine + 1).join("\n"));
  for (const token of tokens) {
    if (!text.includes(normalize(token))) {
      push(findings, doc, section.startLine, token, `${label} is missing required token: ${token}`);
    }
  }
}

export function requireScenarioM5RuntimeActive(findings: Finding[], doc: SpecDoc, gateId: string): void {
  findings.push(...m5RuntimeActiveFindings(doc, gateId));
}
