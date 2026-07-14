/**
 * Gate: `audit_event_hash_chain_columns_present`
 *
 * Assertion: §4.6.1 Audit Event schema and §6.7.5 integrity contract carry
 * the three hash-chain fields required by D-3.4-001:
 * `prev_event_hash`, `event_content_hash`, and `chain_position`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const REQUIRED_FIELDS = ["prev_event_hash", "event_content_hash", "chain_position"];

interface Row {
  field: string;
  type: string;
  constraints: string;
  notes: string;
  line: number;
}

function normalizedHeader(cell: string): string {
  return cell.replace(/[*`]/g, "").trim().toLowerCase();
}

function codeToken(cell: string): string {
  return cell.match(/`([^`]+)`/)?.[1] ?? "";
}

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function fieldRows(doc: SpecDoc, sectionAnchor: string, findings: Finding[], sectionLabel: string): Map<string, Row> {
  const section = findSectionByAnchor(doc, sectionAnchor);
  if (!section) {
    push(findings, doc, 0, sectionAnchor, `${sectionLabel} section is missing.`);
    return new Map();
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  if (!table.header) {
    push(findings, doc, section.startLine, sectionLabel, `${sectionLabel} must contain a field/column table.`);
    return new Map();
  }
  const headers = table.header.cells.map(normalizedHeader);
  const fieldIdx = headers.findIndex((h) => h === "field" || h === "column");
  const typeIdx = headers.findIndex((h) => h === "type");
  const constraintsIdx = headers.findIndex((h) => h === "constraints");
  const notesIdx = headers.findIndex((h) => h === "notes");
  if ([fieldIdx, typeIdx, constraintsIdx, notesIdx].some((idx) => idx < 0)) {
    push(findings, doc, table.header.line, table.header.cells.join(" | "), `${sectionLabel} table must include Field/Column, Type, Constraints, and Notes.`);
    return new Map();
  }

  const rows = new Map<string, Row>();
  for (const row of table.rows) {
    const field = codeToken(row.cells[fieldIdx] ?? "");
    if (!field) continue;
    rows.set(field, {
      field,
      type: row.cells[typeIdx] ?? "",
      constraints: row.cells[constraintsIdx] ?? "",
      notes: row.cells[notesIdx] ?? "",
      line: row.line,
    });
  }
  return rows;
}

function checkRows(
  findings: Finding[],
  doc: SpecDoc,
  rows: Map<string, Row>,
  label: string,
  require67Pointer: boolean,
) {
  for (const field of REQUIRED_FIELDS) {
    const row = rows.get(field);
    if (!row) {
      push(findings, doc, 0, field, `${label} is missing \`${field}\`.`);
      continue;
    }
    const combined = `${row.type} ${row.constraints} ${row.notes}`;
    if (!/required/i.test(row.constraints)) {
      push(findings, doc, row.line, field, `${label} row for \`${field}\` must mark the column required.`);
    }
    if (require67Pointer && !/§6\.7\.5/.test(combined)) {
      push(findings, doc, row.line, field, `${label} row for \`${field}\` must cite §6.7.5.`);
    }
  }
}

export const gate: SpecLintGate = {
  id: "audit_event_hash_chain_columns_present",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_audit_log_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const auditEventRows = fieldRows(doc, "4.6.1-audit-event", findings, "§4.6.1 Audit Event");
    checkRows(findings, doc, auditEventRows, "§4.6.1 Audit Event", true);

    const integrityRows = fieldRows(doc, "6.7.5-audit-log-integrity-protection", findings, "§6.7.5 hash-chain columns");
    checkRows(findings, doc, integrityRows, "§6.7.5 hash-chain columns", false);

    const section = findSectionByAnchor(doc, "6.7.5-audit-log-integrity-protection");
    const sectionText = section ? doc.lines.slice(section.startLine, section.endLine + 1).join("\n") : "";
    const acLine = section
      ? doc.lines.findIndex((line, idx) =>
          idx >= section.startLine &&
          idx <= section.endLine &&
          /Every AuditEvent INSERT MUST populate/.test(line),
        )
      : -1;
    const hasAc = /Every AuditEvent INSERT MUST populate `prev_event_hash`, `event_content_hash`, and `chain_position`/.test(sectionText);
    if (!hasAc) {
      push(
        findings,
        doc,
        acLine > 0 ? acLine : section?.startLine ?? 0,
        "Every AuditEvent INSERT",
        "§6.7.5 acceptance criteria must require every AuditEvent INSERT to populate the three hash-chain columns.",
      );
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
