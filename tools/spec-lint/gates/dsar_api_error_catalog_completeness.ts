/**
 * Gate: `dsar_api_error_catalog_completeness`
 *
 * Assertion: every error code named by the DSAR API contract resolves to an
 * Appendix I row with HTTP status, meaning, and DSAR/shared API traceability.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  computeSectionRanges,
  findSectionByAnchor,
  parseTableAt,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface ExpectedError {
  code: string;
  http: string;
}

interface RegistryRow {
  code: string;
  http: string;
  usedBy: string;
  meaning: string;
  line: number;
}

const DSAR_API_ANCHOR = "6.8.13-dsar-api-contract";

const EXPECTED: ExpectedError[] = [
  { code: "dsar_subject_request_rate_limited", http: "429" },
  { code: "dsar_request_scope_forbidden", http: "404" },
  { code: "validation_error", http: "422" },
  { code: "idempotency_key_request_mismatch", http: "409" },
  { code: "dsar_verification_failed", http: "401" },
  { code: "dsar_request_invalid_state_transition", http: "422" },
  { code: "dsar_request_not_found", http: "404" },
  { code: "dsar_request_export_not_ready", http: "409" },
  { code: "dsar_request_export_link_expired", http: "410" },
  { code: "dsar_request_withdrawal_not_allowed", http: "409" },
  { code: "dsar_extension_not_allowed", http: "409" },
  { code: "dsar_org_admin_subject_notice_required", http: "422" },
];

function normalized(cell: string): string {
  return cell.replace(/[*`]/g, "").trim().toLowerCase();
}

function codeToken(cell: string): string {
  return cell.match(/`([^`]+)`/)?.[1] ?? "";
}

function httpStatus(cell: string): string {
  return cell.match(/\b(\d{3})\b/)?.[1] ?? "";
}

function push(
  findings: Finding[],
  doc: SpecDoc,
  line: number,
  matched: string,
  message: string,
) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function appendixIRange(doc: SpecDoc) {
  return computeSectionRanges(doc).find((item) => /^Appendix I:/.test(item.heading.title)) ?? null;
}

function registryRows(doc: SpecDoc, findings: Finding[]): Map<string, RegistryRow[]> {
  const appendix = appendixIRange(doc);
  if (!appendix) {
    push(findings, doc, 0, "Appendix I", "Appendix I is missing.");
    return new Map();
  }

  const rows = new Map<string, RegistryRow[]>();
  for (let line = appendix.startLine; line <= appendix.endLine; line++) {
    const raw = doc.lines[line] ?? "";
    if (!/^\s*\|.*\|\s*$/.test(raw)) continue;

    const table = parseTableAt(doc, line, appendix.endLine);
    if (!table.header) continue;
    const headers = table.header.cells.map(normalized);
    const codeIdx = headers.findIndex((header) => header === "code" || header === "error code");
    const httpIdx = headers.findIndex((header) => header === "http" || header.startsWith("http "));
    const usedByIdx = headers.findIndex((header) => header === "used by" || header.includes("used by") || header === "endpoint");
    const meaningIdx = headers.findIndex((header) => ["meaning", "notes", "description", "trigger"].includes(header));
    if (codeIdx < 0 || httpIdx < 0) {
      line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
      continue;
    }

    for (const row of table.rows) {
      const code = codeToken(row.cells[codeIdx] ?? "");
      if (!code) continue;
      const list = rows.get(code) ?? [];
      list.push({
        code,
        http: httpStatus(row.cells[httpIdx] ?? ""),
        usedBy: usedByIdx >= 0 ? (row.cells[usedByIdx] ?? "").trim() : "",
        meaning: meaningIdx >= 0 ? (row.cells[meaningIdx] ?? "").trim() : "",
        line: row.line,
      });
      rows.set(code, list);
    }
    line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
  }
  return rows;
}

function hasDsarTraceability(row: RegistryRow): boolean {
  const value = row.usedBy.replace(/[*`]/g, "");
  return /§6\.8\.13|DSAR endpoints|All §32|state-mutating endpoints/i.test(value);
}

export const gate: SpecLintGate = {
  id: "dsar_api_error_catalog_completeness",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const apiSection = findSectionByAnchor(doc, DSAR_API_ANCHOR);
    if (!apiSection) {
      push(findings, doc, 0, "§6.8.13", "§6.8.13 DSAR API Contract section is missing.");
      return findings;
    }

    const apiText = doc.lines.slice(apiSection.startLine, apiSection.endLine + 1).join("\n");
    const registry = registryRows(doc, findings);

    for (const expected of EXPECTED) {
      if (!apiText.includes(`\`${expected.code}\``)) {
        push(
          findings,
          doc,
          apiSection.startLine,
          expected.code,
          `§6.8.13 DSAR API contract must name ${expected.code} in an endpoint error set.`,
        );
      }

      const rows = registry.get(expected.code) ?? [];
      if (!rows.length) {
        push(findings, doc, apiSection.startLine, expected.code, `Appendix I is missing DSAR API error ${expected.code}.`);
        continue;
      }
      if (!rows.some((row) => row.http === expected.http)) {
        const seen = rows.map((row) => row.http || "<missing>").join(", ");
        push(
          findings,
          doc,
          rows[0].line,
          expected.code,
          `Appendix I DSAR API error ${expected.code} must use HTTP ${expected.http}; found ${seen}.`,
        );
      }
      for (const row of rows) {
        if (!row.meaning) {
          push(findings, doc, row.line, expected.code, `Appendix I row ${expected.code} is missing a meaning/description.`);
        }
      }
      if (!rows.some(hasDsarTraceability)) {
        push(
          findings,
          doc,
          rows[0].line,
          expected.code,
          `Appendix I row ${expected.code} must trace to §6.8.13 DSAR endpoints or a shared All §32 endpoint class.`,
        );
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
