/**
 * Gate: `org_residency_change_state_machine_complete`
 *
 * Assertion: §1.6.1 defines the Org residency migration state machine with
 * eligibility predicates, DSAR rollback, legal-hold source-retention behavior,
 * and Appendix J `org_residency_change_state` membership.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const STATES = [
  "not_requested",
  "requested",
  "eligibility_blocked",
  "approval_pending",
  "approved",
  "migration_in_progress",
  "rollback_required",
  "rolled_back",
  "cutover_committed",
  "source_retention_hold",
  "completed",
  "cancelled",
] as const;

const REQUIRED_TRANSITIONS = [
  "not_requested->requested",
  "requested->eligibility_blocked",
  "requested->approval_pending",
  "approval_pending->approved",
  "approval_pending->cancelled",
  "approved->migration_in_progress",
  "migration_in_progress->rollback_required",
  "rollback_required->rolled_back",
  "migration_in_progress->cutover_committed",
  "cutover_committed->source_retention_hold",
  "cutover_committed->completed",
  "source_retention_hold->completed",
] as const;

const REQUIRED_PREDICATES = [
  "bid_workspace_active_phase_7_through_13",
  "ai_operation_pending_settlement",
  "dsar_request_in_flight",
  "outcome_contract_in_renewal_window",
] as const;

const SECTION_TOKENS = [
  "closed predicate set",
  "before any Stripe, storage, backup, export, or analytics side effect",
  "Legal hold is not part of the pre-cutover eligibility predicate set",
  "keeps the request in `source_retention_hold` until Legal releases the hold",
  "**DSAR deadlock rule.**",
  "`org_residency_change_blocked_by_active_dsar`",
  "transitions to `rollback_required` and then `rolled_back`",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/org_residency_change_state_machine_complete.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§1.6.1 MUST define the Org residency migration state machine with eligibility predicates, DSAR rollback, legal-hold source-retention behavior, and Appendix J `org_residency_change_state` membership",
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

function codeValues(text: string): string[] {
  const values: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) values.push(match[1].trim());
  return values;
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function findLineInRange(
  doc: SpecDoc,
  startLine: number,
  endLine: number,
  predicate: (line: string) => boolean,
): { text: string; line: number } | null {
  for (let line = startLine; line <= endLine; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required residency-change token: ${token}`);
}

function sectionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "1.6.1-per-org-residency-change-procedure");
  if (!section) {
    push(findings, doc, 0, "1.6.1-per-org-residency-change-procedure", "§1.6.1 residency-change procedure section is missing.");
    return findings;
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  for (const token of SECTION_TOKENS) {
    requireToken(findings, doc, text, section.startLine, "§1.6.1 residency-change procedure", token);
  }
  return findings;
}

function eligibilityFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "1.6.1-per-org-residency-change-procedure");
  if (!section) return findings;
  const marker = findLineInRange(doc, section.startLine, section.endLine, (line) => line.includes("**Eligibility predicates.**"));
  if (!marker) {
    push(findings, doc, section.startLine, "**Eligibility predicates.**", "§1.6.1 eligibility predicates block is missing.");
    return findings;
  }
  const table = parseTableAt(doc, marker.line, section.endLine);
  const seen = new Map<string, number>();
  for (const row of table.rows) {
    const predicate = codeValues(row.cells[0] ?? "")[0];
    if (predicate) seen.set(predicate, row.line);
  }
  for (const predicate of REQUIRED_PREDICATES) {
    if (!seen.has(predicate)) {
      push(findings, doc, marker.line, predicate, `§1.6.1 eligibility predicates table is missing ${predicate}.`);
    }
  }
  const dsarRow = table.rows.find((row) => codeValues(row.cells[0] ?? "")[0] === "dsar_request_in_flight");
  if (!dsarRow || !(dsarRow.cells.join(" | ")).includes("`org_residency_change_blocked_by_active_dsar`")) {
    push(findings, doc, dsarRow?.line ?? marker.line, "`org_residency_change_blocked_by_active_dsar`", "§1.6.1 DSAR eligibility predicate must bind to org_residency_change_blocked_by_active_dsar.");
  }
  return findings;
}

function transitionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "1.6.1-per-org-residency-change-procedure");
  if (!section) return findings;
  const marker = findLineInRange(doc, section.startLine, section.endLine, (line) => line.includes("**State machine.**"));
  if (!marker) {
    push(findings, doc, section.startLine, "**State machine.**", "§1.6.1 state machine block is missing.");
    return findings;
  }
  const table = parseTableAt(doc, marker.line, section.endLine);
  const headers = table.header?.cells ?? [];
  for (const header of ["From", "To", "Trigger", "Conditions", "Notes"]) {
    if (!headers.includes(header)) push(findings, doc, table.header?.line ?? marker.line, header, `§1.6.1 state machine table is missing ${header} column.`);
  }

  const transitions = new Set<string>();
  const seenStates = new Set<string>();
  for (const row of table.rows) {
    const fromStates = codeValues(row.cells[0] ?? "").filter((value) => STATES.includes(value as never));
    const toStates = codeValues(row.cells[1] ?? "").filter((value) => STATES.includes(value as never));
    for (const state of [...fromStates, ...toStates]) seenStates.add(state);
    for (const from of fromStates) {
      for (const to of toStates) transitions.add(`${from}->${to}`);
    }
  }

  for (const state of STATES) {
    if (!seenStates.has(state)) push(findings, doc, marker.line, state, `§1.6.1 state machine table never references registered state ${state}.`);
  }
  for (const transition of REQUIRED_TRANSITIONS) {
    if (!transitions.has(transition)) push(findings, doc, marker.line, transition, `§1.6.1 state machine table is missing transition ${transition}.`);
  }
  return findings;
}

function appendixEnumFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const heading = findLine(doc, (line) => line.startsWith("### `org_residency_change_state`"));
  if (!heading) {
    push(findings, doc, 0, "### `org_residency_change_state`", "Appendix J `org_residency_change_state` heading is missing.");
    return findings;
  }
  let valueLine: { text: string; line: number } | null = null;
  for (let line = heading.line + 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (/^#{1,6}\s+/.test(text)) break;
    if (codeValues(text).length > 0) {
      valueLine = { text, line };
      break;
    }
  }
  if (!valueLine) {
    push(findings, doc, heading.line, STATES.join(", "), "Appendix J `org_residency_change_state` has no value row.");
    return findings;
  }
  const values = codeValues(valueLine.text);
  if (values.length !== STATES.length || !STATES.every((state, index) => values[index] === state)) {
    push(findings, doc, valueLine.line, values.join(", "), `Appendix J org_residency_change_state must list exactly: ${STATES.map((v) => `\`${v}\``).join(", ")}.`);
  }
  const notes = doc.lines.slice(heading.line, Math.min(heading.line + 8, doc.lines.length)).join("\n");
  for (const token of ["Terminal states are `completed`, `rolled_back`, and `cancelled`", "§32.8.25 polling responses", "§50.30 Ops proposals"]) {
    requireToken(findings, doc, notes, heading.line, "Appendix J org_residency_change_state notes", token);
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `org_residency_change_state_machine_complete` |"));
  if (!row) {
    push(findings, doc, 0, "`org_residency_change_state_machine_complete`", "§M.5 row org_residency_change_state_machine_complete is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 org_residency_change_state_machine_complete row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "org_residency_change_state_machine_complete",
  sourcePhase: "V9.3",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...sectionFindings(doc),
      ...eligibilityFindings(doc),
      ...transitionFindings(doc),
      ...appendixEnumFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
