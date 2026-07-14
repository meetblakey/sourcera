/**
 * Gate: `decisions_status_field_completeness`
 *
 * Assertion: `_integration/Decisions.md` carries an explicit Status field for
 * every decision row in the E/C/F/T, Phase 2.5, and v7.1.0 decision sets.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_IDS = [
  "E-1",
  "E-2",
  "E-3",
  "E-4",
  "E-5",
  "E-6",
  "E-7",
  "E-8",
  "E-9",
  "E-10",
  "C-1",
  "C-2",
  "C-3",
  "C-4",
  "C-5",
  "F-1",
  "F-2",
  "T-1",
  "D-S1",
  "D-O1",
  "D-P1",
  "D-PROMPT1",
  "D-7.1-001",
  "D-7.1-002",
  "D-7.1-003",
  "D-7.1-004",
  "D-7.1-005",
  "D-7.1-006",
  "D-7.1-007",
];

const HEADING_RE = /^### (?<id>E-\d+|C-\d+|F-\d+|T-\d+|D-S1|D-O1|D-P1|D-PROMPT1|D-7\.1-\d{3})(?:[.\s—-]|$)/;
const STATUS_RE = /^\*\*Status:\*\* (pending|partially_closed|closed|superseded)\b/;

interface DecisionSection {
  id: string;
  startLine: number;
  endLine: number;
  text: string;
}

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    matched_text: matched,
    message,
  });
}

function decisionSections(doc: SpecDoc): Map<string, DecisionSection> {
  const starts: Array<{ id: string; line: number }> = [];
  for (let line = 1; line < doc.lines.length; line++) {
    const match = HEADING_RE.exec(doc.lines[line] ?? "");
    if (match?.groups?.id) starts.push({ id: match.groups.id, line });
  }

  const sections = new Map<string, DecisionSection>();
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const endLine = i + 1 < starts.length ? starts[i + 1].line - 1 : doc.lines.length - 1;
    sections.set(start.id, {
      id: start.id,
      startLine: start.line,
      endLine,
      text: doc.lines.slice(start.line, endLine + 1).join("\n"),
    });
  }
  return sections;
}

function statusLine(doc: SpecDoc, section: DecisionSection): { line: number; text: string } | null {
  for (let line = section.startLine + 1; line <= section.endLine; line++) {
    const text = doc.lines[line] ?? "";
    if (text.startsWith("**Status:**")) return { line, text };
  }
  return null;
}

function schemaIntroFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const required = [
    "- **Status:** One of `pending`, `partially_closed`, `closed`, or `superseded`",
    "- **Defect Link:** Required only when status is `pending` or `partially_closed`",
  ];
  for (const token of required) {
    if (!doc.text.includes(token)) {
      push(findings, doc, 10, token, `Decisions.md How-to-Read schema is missing required field guidance: ${token}`);
    }
  }
  return findings;
}

function decisionsStatusFindings(doc: SpecDoc): Finding[] {
  const findings = schemaIntroFindings(doc);
  const sections = decisionSections(doc);

  for (const id of REQUIRED_IDS) {
    const section = sections.get(id);
    if (!section) {
      push(findings, doc, 0, id, `Decisions.md is missing required decision row ${id}.`);
      continue;
    }

    const status = statusLine(doc, section);
    if (!status) {
      push(findings, doc, section.startLine, id, `${id} is missing an explicit **Status:** field.`);
      continue;
    }

    const match = STATUS_RE.exec(status.text);
    if (!match) {
      push(
        findings,
        doc,
        status.line,
        status.text.trim(),
        `${id} has invalid status syntax; use lowercase pending, partially_closed, closed, or superseded.`,
      );
      continue;
    }

    const value = match[1];
    if ((value === "pending" || value === "partially_closed") && !section.text.includes("**Defect Link:**")) {
      push(findings, doc, status.line, status.text.trim(), `${id} is ${value} but lacks required **Defect Link:** field.`);
    }
  }

  for (const section of sections.values()) {
    if (!REQUIRED_IDS.includes(section.id)) {
      push(findings, doc, section.startLine, section.id, `Unexpected decision ID ${section.id}; update decisions_status_field_completeness if this is a new decision row.`);
    }
  }

  return findings;
}

export const gate: SpecLintGate = {
  id: "decisions_status_field_completeness",
  sourcePhase: "v7.1.1 D-DEC-012",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, decisions: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const decisions = ctx.extraDocs.get("decisions");
    if (!decisions) {
      return [
        {
          file: ctx.masterSpec.path,
          line: 0,
          matched_text: "_integration/Decisions.md",
          message: "decisions_status_field_completeness requires _integration/Decisions.md.",
        },
      ];
    }
    return decisionsStatusFindings(decisions);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
