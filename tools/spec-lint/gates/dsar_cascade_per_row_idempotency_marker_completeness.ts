/**
 * Gate: `dsar_cascade_per_row_idempotency_marker_completeness`
 *
 * Assertion: every persisted §6.8.4.3 cascade target inherits the §4.1.1
 * DSAR row-level idempotency marker pair, and no entity-local field table
 * narrows or renames that pair.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  findSectionByAnchor,
  parseTableAt,
  type SectionRange,
  type TableRow,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const MIXIN_ANCHOR = "4.1.1-dsar-cascade-idempotency-marker-mixin";
const REGISTRY_ANCHOR = "6.8.4.3-cascade-class-coverage-registry";
const REQUEST_MARKER = "dsar_redacted_under_request_id";
const TIMESTAMP_MARKER = "dsar_redacted_at";

const NON_ENTITY_TITLE_RE =
  /\b(JSON|Schema|Registry|Field Definitions|Lifecycle|State Machine|Acceptance Criteria|Endpoint Binding|Plan Limits|Residency|Retention & DSAR Cascade)\b/i;

function clean(cell: string): string {
  return cell.replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
}

function normalizeHeader(cell: string): string {
  return clean(cell).toLowerCase().replace(/[^a-z0-9§]+/g, "");
}

function fieldName(cell: string): string {
  return clean(cell).replace(/\s+/g, "");
}

function sectionNumber(title: string): string | null {
  return title.match(/^(4(?:\.\d+)+)\b/)?.[1] ?? null;
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

function fieldTableRows(doc: SpecDoc, section: SectionRange): TableRow[] {
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const table = parseTableAt(doc, line, section.endLine);
    if (!table.header) continue;
    const headers = table.header.cells.map(normalizeHeader);
    if (headers[0] === "field" && headers.includes("type") && headers.includes("constraints")) {
      return table.rows;
    }
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  return [];
}

function rowByField(rows: TableRow[], field: string): TableRow | undefined {
  return rows.find((row) => fieldName(row.cells[0] ?? "") === field);
}

function sectionText(doc: SpecDoc, section: SectionRange): string {
  return doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
}

function validateRequestMarker(row: TableRow | undefined, doc: SpecDoc, findings: Finding[], scope: string) {
  if (!row) {
    push(findings, doc, 0, REQUEST_MARKER, `${scope} must define \`${REQUEST_MARKER}\`.`);
    return;
  }
  const type = clean(row.cells[1] ?? "");
  const constraints = clean(row.cells[2] ?? "");
  const notes = clean(row.cells[3] ?? "");
  if (!/\bUUID\b/i.test(type) || !/\bFK\b/i.test(type) || !/(DSARRequest|§4\.6\.5)/i.test(type + " " + notes)) {
    push(
      findings,
      doc,
      row.line,
      row.cells.join(" | "),
      `${scope} \`${REQUEST_MARKER}\` must be a UUID FK to §4.6.5 DSARRequest.id.`,
    );
  }
  if (!/\bnullable\b/i.test(constraints)) {
    push(
      findings,
      doc,
      row.line,
      row.cells.join(" | "),
      `${scope} \`${REQUEST_MARKER}\` must be nullable.`,
    );
  }
  if (/default\s+[^;,.|]*[a-z0-9_]/i.test(constraints) && !/no default|without default/i.test(constraints)) {
    push(
      findings,
      doc,
      row.line,
      row.cells.join(" | "),
      `${scope} \`${REQUEST_MARKER}\` must not define a non-null default.`,
    );
  }
  if (!/DSAR/i.test(notes) || !/idempot/i.test(notes)) {
    push(
      findings,
      doc,
      row.line,
      row.cells.join(" | "),
      `${scope} \`${REQUEST_MARKER}\` notes must bind the field to DSAR idempotency.`,
    );
  }
}

function validateTimestampMarker(row: TableRow | undefined, doc: SpecDoc, findings: Finding[], scope: string) {
  if (!row) {
    push(findings, doc, 0, TIMESTAMP_MARKER, `${scope} must define \`${TIMESTAMP_MARKER}\`.`);
    return;
  }
  const type = clean(row.cells[1] ?? "");
  const constraints = clean(row.cells[2] ?? "");
  const notes = clean(row.cells[3] ?? "");
  if (!/(Timestamp|timestamptz)/i.test(type)) {
    push(
      findings,
      doc,
      row.line,
      row.cells.join(" | "),
      `${scope} \`${TIMESTAMP_MARKER}\` must be a Timestamp.`,
    );
  }
  if (!/\bnullable\b/i.test(constraints)) {
    push(
      findings,
      doc,
      row.line,
      row.cells.join(" | "),
      `${scope} \`${TIMESTAMP_MARKER}\` must be nullable.`,
    );
  }
  if (!/required iff/i.test(constraints) || !constraints.includes(REQUEST_MARKER)) {
    push(
      findings,
      doc,
      row.line,
      row.cells.join(" | "),
      `${scope} \`${TIMESTAMP_MARKER}\` must be required iff \`${REQUEST_MARKER}\` is non-null.`,
    );
  }
  if (!/(redaction|pseudonymization|hard-delete|purge|suppression|DSAR)/i.test(notes)) {
    push(
      findings,
      doc,
      row.line,
      row.cells.join(" | "),
      `${scope} \`${TIMESTAMP_MARKER}\` notes must describe the row-level DSAR mutation timestamp.`,
    );
  }
}

function isEntitySection(section: SectionRange): boolean {
  const number = sectionNumber(section.heading.title);
  if (!number) return false;
  if (number.startsWith("4.1")) return false;
  if ((number.match(/\./g) ?? []).length < 2) return false;
  return !NON_ENTITY_TITLE_RE.test(section.heading.title);
}

function registryRows(doc: SpecDoc, findings: Finding[]): TableRow[] {
  const section = findSectionByAnchor(doc, REGISTRY_ANCHOR);
  if (!section) {
    push(findings, doc, 0, "§6.8.4.3", "§6.8.4.3 Cascade Class Coverage Registry is missing.");
    return [];
  }
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const table = parseTableAt(doc, line, section.endLine);
    if (!table.header) continue;
    const headers = table.header.cells.map(normalizeHeader);
    if (headers.includes("entity") && headers.includes("class§684") && headers.some((h) => h.startsWith("pattern"))) {
      return table.rows;
    }
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  push(findings, doc, section.startLine, "Cascade Class Coverage Registry", "§6.8.4.3 registry table is missing.");
  return [];
}

export const gate: SpecLintGate = {
  id: "dsar_cascade_per_row_idempotency_marker_completeness",
  sourcePhase: "V9",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const mixin = findSectionByAnchor(doc, MIXIN_ANCHOR);
    if (!mixin) {
      push(findings, doc, 0, "§4.1.1", "§4.1.1 DSAR Cascade Idempotency Marker Mixin is missing.");
      return findings;
    }

    const mixinText = sectionText(doc, mixin);
    if (!/Every persisted entity registered in §6\.8\.4\.3/i.test(mixinText)) {
      push(
        findings,
        doc,
        mixin.startLine,
        "Every persisted entity registered in §6.8.4.3",
        "§4.1.1 must explicitly bind the marker mixin to every persisted §6.8.4.3 cascade target.",
      );
    }
    if (!/MUST NOT rename, narrow, or omit/i.test(mixinText)) {
      push(
        findings,
        doc,
        mixin.startLine,
        "MUST NOT rename, narrow, or omit",
        "§4.1.1 must forbid entity-specific marker narrowing, renaming, or omission.",
      );
    }

    const mixinRows = fieldTableRows(doc, mixin);
    validateRequestMarker(rowByField(mixinRows, REQUEST_MARKER), doc, findings, "§4.1.1");
    validateTimestampMarker(rowByField(mixinRows, TIMESTAMP_MARKER), doc, findings, "§4.1.1");

    const rows = registryRows(doc, findings);
    if (rows.length === 0) {
      push(findings, doc, mixin.startLine, "§6.8.4.3", "No §6.8.4.3 registry rows found to bind to the marker mixin.");
    }
    for (const row of rows) {
      const raw = row.cells.join(" | ");
      if (/marker\s+exempt|idempotency\s+exempt|does not carry dsar_redacted/i.test(raw)) {
        push(
          findings,
          doc,
          row.line,
          raw,
          "§6.8.4.3 registry rows cannot exempt persisted cascade targets from the §4.1.1 DSAR marker mixin.",
        );
      }
    }

    for (const section of computeSectionRanges(doc).filter(isEntitySection)) {
      const rowsInSection = fieldTableRows(doc, section);
      const requestRow = rowByField(rowsInSection, REQUEST_MARKER);
      const timestampRow = rowByField(rowsInSection, TIMESTAMP_MARKER);
      if (requestRow) validateRequestMarker(requestRow, doc, findings, `§${sectionNumber(section.heading.title)}`);
      if (timestampRow) validateTimestampMarker(timestampRow, doc, findings, `§${sectionNumber(section.heading.title)}`);
      if ((requestRow && !timestampRow) || (!requestRow && timestampRow)) {
        push(
          findings,
          doc,
          section.heading.line,
          section.heading.title,
          "Entity-specific field tables that repeat a DSAR idempotency marker must repeat both marker fields.",
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
