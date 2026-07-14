/**
 * Gate: `dsar_cascade_class_coverage_completeness`
 *
 * Assertion: every §4 entity field table carrying a User-attribution field has
 * an explicit §6.8.4.3 cascade-class registry row with a non-empty class and a
 * non-`n/a` redaction treatment.
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

const REGISTRY_ANCHOR = "6.8.4.3-cascade-class-coverage-registry";

const NON_ENTITY_TITLE_RE =
  /\b(JSON|Schema|Registry|Field Definitions|Lifecycle|State Machine|Acceptance Criteria|Endpoint Binding|Plan Limits|Residency|Retention & DSAR Cascade)\b/i;

const USER_FIELD_RE =
  /(^|_)(user|actor|author|creator|updater|owner|reviewer|reporter|requester|requested|recipient|subject|subscriber|verifier|revoker|granter|signatory|signer|closer|assignee|assigned|mentioned|mentioning|admin|ops)(_id|_ids|\[\]|$)|^(created_by|updated_by|deleted_by|archived_by|reviewed_by|granted_by|accepted_by|requested_by|generated_by|authored_by|acting_user_id|quorum_signoff_user_ids\[\])$/i;

const COMMON_NON_USER_FIELDS = new Set([
  "id",
  "org_id",
  "workspace_id",
  "bid_workspace_id",
  "seller_org_id",
  "buyer_org_id",
  "team_id",
  "group_id",
  "console",
  "created_at",
  "updated_at",
  "deleted_at",
]);

interface EntityCoverage {
  section: string;
  title: string;
  line: number;
  userFields: string[];
}

interface RegistryRow {
  section: string;
  line: number;
  entity: string;
  classCell: string;
  patternCell: string;
}

function clean(cell: string): string {
  return cell.replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
}

function normalizeHeader(cell: string): string {
  return clean(cell).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function sectionNumber(title: string): string | null {
  return title.match(/^(4(?:\.\d+)+)\b/)?.[1] ?? null;
}

function fieldName(cell: string): string {
  return clean(cell).replace(/\s+/g, "");
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

function isEntitySection(section: SectionRange): boolean {
  const number = sectionNumber(section.heading.title);
  if (!number) return false;
  if ((number.match(/\./g) ?? []).length < 2) return false;
  return !NON_ENTITY_TITLE_RE.test(section.heading.title);
}

function userFieldsInSection(doc: SpecDoc, section: SectionRange): string[] {
  const fields = new Set<string>();
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const table = parseTableAt(doc, line, section.endLine);
    if (!table.header) continue;
    const headers = table.header.cells.map(normalizeHeader);
    if (headers[0] !== "field") {
      line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
      continue;
    }
    for (const row of table.rows) {
      const field = fieldName(row.cells[0] ?? "");
      if (!field || COMMON_NON_USER_FIELDS.has(field)) continue;
      if (USER_FIELD_RE.test(field)) fields.add(field);
    }
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  return [...fields].sort();
}

function entityCoverage(doc: SpecDoc): EntityCoverage[] {
  return computeSectionRanges(doc)
    .filter(isEntitySection)
    .map((section) => ({
      section: sectionNumber(section.heading.title)!,
      title: section.heading.title.replace(/^(4(?:\.\d+)+)\s+/, ""),
      line: section.heading.line,
      userFields: userFieldsInSection(doc, section),
    }))
    .filter((entity) => entity.userFields.length > 0);
}

function registryRows(doc: SpecDoc, findings: Finding[]): Map<string, RegistryRow> {
  const section = findSectionByAnchor(doc, REGISTRY_ANCHOR);
  const out = new Map<string, RegistryRow>();
  if (!section) {
    push(findings, doc, 0, "§6.8.4.3", "§6.8.4.3 Cascade Class Coverage Registry is missing.");
    return out;
  }
  for (let line = section.startLine; line <= section.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
    const table = parseTableAt(doc, line, section.endLine);
    if (!table.header) continue;
    const headers = table.header.cells.map(normalizeHeader);
    const sectionIdx = headers.indexOf("§") >= 0 ? headers.indexOf("§") : headers.indexOf("");
    const entityIdx = headers.indexOf("entity");
    const classIdx = headers.findIndex((h) => h.startsWith("class"));
    const patternIdx = headers.findIndex((h) => h.startsWith("pattern"));
    if (sectionIdx < 0 || entityIdx < 0 || classIdx < 0 || patternIdx < 0) {
      line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
      continue;
    }
    for (const row of table.rows) {
      const id = clean(row.cells[sectionIdx] ?? "").match(/§?\s*(4(?:\.\d+)+)/)?.[1];
      if (!id) continue;
      out.set(id, {
        section: id,
        line: row.line,
        entity: clean(row.cells[entityIdx] ?? ""),
        classCell: clean(row.cells[classIdx] ?? ""),
        patternCell: clean(row.cells[patternIdx] ?? ""),
      });
    }
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  return out;
}

function hasExplicitClass(row: RegistryRow): boolean {
  return row.classCell.length > 0 && !/^n\/?a$/i.test(row.classCell);
}

function hasExplicitTreatment(row: RegistryRow): boolean {
  if (/^n\/?a(?:\s|$)/i.test(row.patternCell)) return false;
  return /\bPattern [AB]\b/i.test(row.patternCell) || /\bhard-delete\b/i.test(row.patternCell);
}

function rowSummary(row: RegistryRow): string {
  return `§${row.section} ${row.entity} | ${row.classCell} | ${row.patternCell}`;
}

export const gate: SpecLintGate = {
  id: "dsar_cascade_class_coverage_completeness",
  sourcePhase: "V9 [V11]",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const registry = registryRows(doc, findings);

    for (const entity of entityCoverage(doc)) {
      const row = registry.get(entity.section);
      if (!row) {
        push(
          findings,
          doc,
          entity.line,
          `§${entity.section} ${entity.title}`,
          `§${entity.section} carries User-attribution fields (${entity.userFields.join(", ")}) but has no §6.8.4.3 cascade-class registry row.`,
        );
        continue;
      }
      if (!hasExplicitClass(row)) {
        push(
          findings,
          doc,
          row.line,
          rowSummary(row),
          `§${entity.section} registry row has no explicit DSAR cascade class for User-attribution fields (${entity.userFields.join(", ")}).`,
        );
      }
      if (!hasExplicitTreatment(row)) {
        push(
          findings,
          doc,
          row.line,
          rowSummary(row),
          `§${entity.section} registry row must name Pattern A, Pattern B, or row hard-delete treatment for User-attribution fields (${entity.userFields.join(", ")}); n/a is not allowed.`,
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
