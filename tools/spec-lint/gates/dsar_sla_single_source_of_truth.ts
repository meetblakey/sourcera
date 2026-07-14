/**
 * Gate: `dsar_sla_single_source_of_truth`
 *
 * Assertion: §6.8.6 is the only active source for the DSAR fulfillment
 * window. Scoped DSAR SLA, response, fulfillment, and redaction prose in
 * §6.8 / §33.4 / §33.9 / §40.2 must cite §6.8.6 instead of restating the
 * numeric window.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, type SectionRange } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const SCOPED_ANCHORS = [
  "6.8-data-privacy-and-gdpr-compliance",
  "33.4-data-subject-access-request-(dsar)",
  "33.9-acceptance-criteria",
  "40.2-data-retention-and-deletion",
];

const NUMERIC_WINDOW_RE = /\b(?:30[- ]day|30 calendar days|30 days)\b/i;
const NUMERIC_TERM = String.raw`(?:\b30[- ]day\b|\b30 calendar days\b|\b30 days\b)`;
const SLA_RESTATEMENT_PATTERNS = [
  new RegExp(`${NUMERIC_TERM}.{0,80}\\b(?:SLA|response window|fulfillment window|statutory ceiling|statutory deadline)\\b`, "i"),
  new RegExp(`\\b(?:DSAR responses?|DSAR fulfillment|GDPR DSAR processing SLA)\\b.{0,100}${NUMERIC_TERM}`, "i"),
  new RegExp(`${NUMERIC_TERM}.{0,100}\\b(?:DSAR responses?|DSAR fulfillment|GDPR DSAR processing SLA)\\b`, "i"),
  new RegExp(String.raw`^\|[^|]*(?:DSAR|GDPR DSAR processing SLA)[^|]*\|.*\b(?:redacted|pseudonymized|redaction|processing-time|process)\b.*${NUMERIC_TERM}`, "i"),
  new RegExp(String.raw`\b(?:redacted|pseudonymized|redaction sweep|DSAR sweep|targeted redaction)\b.{0,80}(?:within|in)\s+(?:the\s+)?${NUMERIC_TERM}.{0,80}\b(?:on DSAR|per §6\.8|DSAR)\b`, "i"),
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function sectionText(doc: SpecDoc, section: SectionRange | null): string {
  return section ? doc.lines.slice(section.startLine, section.endLine + 1).join("\n") : "";
}

function containsLine(doc: SpecDoc, section: SectionRange | null, re: RegExp): boolean {
  if (!section) return false;
  for (let line = section.startLine; line <= section.endLine; line++) {
    if (re.test(doc.lines[line] ?? "")) return true;
  }
  return false;
}

function lineIn(section: SectionRange | null, line: number): boolean {
  return !!section && line >= section.startLine && line <= section.endLine;
}

function isScopedRestatement(line: string): boolean {
  if (!NUMERIC_WINDOW_RE.test(line)) return false;
  const clauses = line.split(/(?<=\.)\s+|;\s+/);
  return clauses.some((clause) => SLA_RESTATEMENT_PATTERNS.some((pattern) => pattern.test(clause)));
}

export const gate: SpecLintGate = {
  id: "dsar_sla_single_source_of_truth",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const authoritative = findSectionByAnchor(doc, "6.8.6-dsar-operational-sla");
    if (!authoritative) {
      push(findings, doc, 0, "§6.8.6", "§6.8.6 DSAR Operational SLA authoritative section is missing.");
      return findings;
    }

    const authText = sectionText(doc, authoritative);
    if (!/\|\s*Subject-request receipt \(`received_at`\) → fulfillment \(export OR confirmation of erasure path\)\s*\|\s*\*\*\\?< 30 calendar days\*\* unless a valid extension is granted\s*\|/.test(authText)) {
      push(
        findings,
        doc,
        authoritative.startLine,
        "Subject-request receipt",
        "§6.8.6 must contain the single authoritative DSAR fulfillment-window table row.",
      );
    }
    if (!/dsar_sla_single_source_of_truth/.test(authText)) {
      push(findings, doc, authoritative.startLine, "dsar_sla_single_source_of_truth", "§6.8.6 acceptance criteria must name this gate.");
    }

    const sections = SCOPED_ANCHORS.map((anchor) => ({ anchor, section: findSectionByAnchor(doc, anchor) }));
    for (const { anchor, section } of sections) {
      if (!section) {
        push(findings, doc, 0, anchor, `Required DSAR SLA consumer section ${anchor} is missing.`);
        continue;
      }
      for (let line = section.startLine; line <= section.endLine; line++) {
        if (lineIn(authoritative, line)) continue;
        const text = doc.lines[line] ?? "";
        if (!isScopedRestatement(text)) continue;
        push(
          findings,
          doc,
          line,
          text.match(NUMERIC_WINDOW_RE)?.[0] ?? "30 days",
          "DSAR SLA/redaction prose must cite §6.8.6 instead of restating the numeric fulfillment window.",
        );
      }
    }

    const section334 = findSectionByAnchor(doc, "33.4-data-subject-access-request-(dsar)");
    if (!containsLine(doc, section334, /DSAR fulfillment SLA:\**\s*§6\.8\.6 is authoritative/i)) {
      push(findings, doc, section334?.startLine ?? 0, "§33.4", "§33.4 must identify §6.8.6 as the authoritative DSAR fulfillment SLA.");
    }

    const section339 = findSectionByAnchor(doc, "33.9-acceptance-criteria");
    if (!containsLine(doc, section339, /DSAR responses generated within the §6\.8\.6 fulfillment window/i)) {
      push(findings, doc, section339?.startLine ?? 0, "§33.9", "§33.9 DSAR acceptance criteria must cite the §6.8.6 fulfillment window.");
    }

    const section402 = findSectionByAnchor(doc, "40.2-data-retention-and-deletion");
    if (!containsLine(doc, section402, /GDPR DSAR processing SLA.*§6\.8\.6 receipt-based window/i)) {
      push(findings, doc, section402?.startLine ?? 0, "GDPR DSAR processing SLA", "§40.2 DSAR processing SLA row must cite the §6.8.6 receipt-based window.");
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
