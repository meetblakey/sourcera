/**
 * Gate: `bridge_event_body_pii_sweep_completeness`
 *
 * Assertion: every free-text field carried by a Console Bridge Event payload is
 * listed in the §6.8.4.5 bridge-event body PII sweep table, or the row carries
 * an explicit non-PII attestation.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  findSectionByAnchor,
  parseTableAt,
  type TableRow,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const BRIDGE_ANCHOR = "4.7.1-console-bridge-event";
const SWEEP_ANCHOR = "6.8.4.5-bridge-event-body-text-pii-sweep";

interface EventRow {
  event: string;
  fields: string[];
  text: string;
  line: number;
}

function codeTokens(cell: string): string[] {
  return [...cell.matchAll(/`([^`]+)`/g)].map((m) => normalizeField(m[1]));
}

function normalizeField(field: string): string {
  return field
    .replace(/\s*\(.*$/, "")
    .replace(/^payload_json\./, "")
    .trim();
}

function rowText(row: TableRow): string {
  return row.cells.join(" ").replace(/\s+/g, " ").trim();
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

function redactionRows(doc: SpecDoc, findings: Finding[]): Map<string, EventRow> {
  const section = findSectionByAnchor(doc, BRIDGE_ANCHOR);
  const out = new Map<string, EventRow>();
  if (!section) {
    push(findings, doc, 0, "§4.7.1", "§4.7.1 Console Bridge Event section is missing.");
    return out;
  }
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const table = parseTableAt(doc, line, section.endLine);
    if (!table.header) continue;
    const headers = table.header.cells.map((cell) => cell.replace(/[*`]/g, "").trim().toLowerCase());
    const eventIdx = headers.indexOf("event kind");
    const carriedIdx = headers.indexOf("fields carried");
    if (eventIdx < 0 || carriedIdx < 0) {
      line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
      continue;
    }
    for (const row of table.rows) {
      const event = codeTokens(row.cells[eventIdx] ?? "")[0];
      if (!event) continue;
      out.set(event, {
        event,
        fields: codeTokens(row.cells[carriedIdx] ?? ""),
        text: rowText(row),
        line: row.line,
      });
    }
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  return out;
}

function sweepRows(doc: SpecDoc, findings: Finding[]): Map<string, EventRow> {
  const section = findSectionByAnchor(doc, SWEEP_ANCHOR);
  const out = new Map<string, EventRow>();
  if (!section) {
    push(findings, doc, 0, "§6.8.4.5", "§6.8.4.5 Bridge-Event Body Text PII Sweep section is missing.");
    return out;
  }
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const table = parseTableAt(doc, line, section.endLine);
    if (!table.header) continue;
    const headers = table.header.cells.map((cell) => cell.replace(/[*`]/g, "").trim().toLowerCase());
    const eventIdx = headers.indexOf("bridge event kind");
    const fieldsIdx = headers.indexOf("free-text fields scanned");
    if (eventIdx < 0 || fieldsIdx < 0) {
      line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
      continue;
    }
    for (const row of table.rows) {
      const event = codeTokens(row.cells[eventIdx] ?? "")[0];
      if (!event) continue;
      out.set(event, {
        event,
        fields: codeTokens(row.cells[fieldsIdx] ?? ""),
        text: rowText(row),
        line: row.line,
      });
    }
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  return out;
}

function isFreeTextField(field: string): boolean {
  if (/_id$|_ids$|_url$|_urls$|_at$|_count$|_phase$|_status$|_type$|_kind$|_category$|_snapshot$|_version$/.test(field)) {
    return false;
  }
  if (/^(order|priority|weight|response_type|vendor_org_id)$/.test(field)) return false;
  return /(^|_)(title|description|summary|reason|note|body|rationale|payload|comment|message|copy|terms|narrative|conditions)($|_)/i.test(field);
}

function hasNonPiiAttestation(row: EventRow): boolean {
  return /\b(non-PII-bearing|no PII-bearing|PII excluded|not PII-bearing)\b/i.test(row.text);
}

export const gate: SpecLintGate = {
  id: "bridge_event_body_pii_sweep_completeness",
  sourcePhase: "V9",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const redaction = redactionRows(doc, findings);
    const sweep = sweepRows(doc, findings);

    for (const [event, sweepRow] of sweep) {
      const source = redaction.get(event);
      if (!source) {
        push(findings, doc, sweepRow.line, event, `§6.8.4.5 sweep table names ${event}, but §4.7.1 Field-Level Redaction Rules has no matching event row.`);
        continue;
      }
      for (const field of sweepRow.fields) {
        if (!source.fields.includes(field)) {
          push(findings, doc, sweepRow.line, `${event}.${field}`, `§6.8.4.5 sweep field ${event}.${field} is not present in §4.7.1 Fields CARRIED for that event.`);
        }
      }
    }

    for (const [event, source] of redaction) {
      if (hasNonPiiAttestation(source)) continue;
      const sweepRow = sweep.get(event);
      for (const field of source.fields) {
        if (!isFreeTextField(field)) continue;
        if (!sweepRow) {
          push(findings, doc, source.line, `${event}.${field}`, `§4.7.1 carries free-text field ${event}.${field}, but §6.8.4.5 has no sweep-scope row for ${event}.`);
          continue;
        }
        if (!sweepRow.fields.includes(field)) {
          push(findings, doc, source.line, `${event}.${field}`, `§4.7.1 carries free-text field ${event}.${field}, but §6.8.4.5 does not scan that field.`);
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
