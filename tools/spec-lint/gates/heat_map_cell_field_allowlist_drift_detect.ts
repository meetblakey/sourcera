/**
 * Gate: `heat_map_cell_field_allowlist_drift_detect`
 *
 * Assertion: HeatMapCell remains a vendor-identity-free aggregate with the
 * field allow-list declared in §4.4.16.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const EXPECTED_HEAT_MAP_CELL_FIELDS = [
  "id",
  "category_id",
  "region_kind",
  "region_id",
  "industry_kind",
  "industry_id",
  "company_size_band",
  "period_start",
  "period_end",
  "signal_count",
  "k_anon_floor",
  "k_anon_satisfied",
  "demand_index",
  "demand_trend",
  "prior_period_signal_count",
  "contributing_source_hash",
  "last_refreshed_at",
  "refresh_cadence_days",
  "next_scheduled_refresh_at",
  "publication_status",
  "residency_region_scope",
  "created_at",
  "updated_at",
  "created_by",
  "updated_by",
  "deleted_at",
] as const;

const BANNED_FIELD_RE = /^(seller_|vendor_|sw_|product_|software_id|owner_user_)/;
const BANNED_REFERENCE_RE = /Opt-Out Registry|Vendor Opt-Out Record|§4\.4\.8|vendor_opt_out_/i;

const SECTION_TOKENS = [
  "Vendor-Identity-Free Aggregate Invariant",
  "HeatMapCell carries NO `vendor_opt_out_honored_at` field",
  "the Opt-Out Registry (§4.4.8) is NOT probed at render time, NOT stamped at refresh time, and NOT referenced by FK from this entity",
  "The §4.4.8 `vendor_opt_out_scope_kind` Appendix-J enum closed-set MUST contain exactly the five values `global | category | software | page_type | specific_page` and MUST NOT contain `not_applicable`, `n/a`, `none`, or any other sentinel value",
  "Marketplace Dimension Pair Contract & Legacy Migration",
  "`us` / `US` is **ambiguous**",
] as const;

const AGGREGATION_CARD_TOKENS = [
  "HeatMapAggregationCard aggregates HeatMapCell rows",
  "the card surface renders NO vendor names, NO Seller Org references, and NO SellerSoftware references at any depth",
  "The field is removed; the entity inherits the §4.4.16 Vendor-Identity-Free Aggregate Invariant",
  "does not probe the Opt-Out Registry at render time",
] as const;

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/heat_map_cell_field_allowlist_drift_detect.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "The §4.4.16 HeatMapCell data-model table is the canonical field-allowlist",
  "Vendor-Identity-Free Aggregate Invariant",
  "D-2.2-060 / D-2.2-061",
] as const;

const REQUIRED_SELLER_SIGNAL_FIELDS = ["region_kind", "region_id", "industry_kind", "industry_id"] as const;
const SELLER_SIGNAL_TOKENS = [
  "§4.4.16 pair contract applies",
  "(industry_kind, industry_id, region_kind, region_id, company_size_band, timeline_band, intent_strength)",
] as const;
const PREFERENCE_TOKENS = ["subscribed_region_dimensions", "subscribed_industry_dimensions", "marketplace_dimension_pair_invalid"] as const;
const API_TOKENS = ["region_kind=", "region_id=", "industry_kind=", "industry_id=", "retired `*_code` filters are rejected"] as const;
const ENUM_TOKENS = ["`marketplace_region_kind`", "`marketplace_macro_region`", "`marketplace_industry_kind`"] as const;

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

function sameValues(actual: string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && expected.every((value, index) => actual[index] === value);
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required HeatMapCell token: ${token}`);
}

function heatMapCellFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "4.4.16-heatmapcell");
  if (!section) {
    push(findings, doc, 0, "4.4.16-heatmapcell", "§4.4.16 HeatMapCell section is missing.");
    return findings;
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  for (const token of SECTION_TOKENS) requireToken(findings, doc, text, section.startLine, "§4.4.16", token);

  const table = parseTableAt(doc, section.startLine, section.endLine);
  const fields = table.rows.map((row) => codeValues(row.cells[0] ?? "")[0] ?? "").filter(Boolean);
  if (!sameValues(fields, EXPECTED_HEAT_MAP_CELL_FIELDS)) {
    push(findings, doc, table.header?.line ?? section.startLine, fields.join(", "), `§4.4.16 HeatMapCell field table must match the allow-list: ${EXPECTED_HEAT_MAP_CELL_FIELDS.join(", ")}.`);
  }

  for (const row of table.rows) {
    const field = codeValues(row.cells[0] ?? "")[0] ?? "";
    const rowText = row.cells.join(" | ");
    if (BANNED_FIELD_RE.test(field)) push(findings, doc, row.line, field, `HeatMapCell field ${field} violates the vendor-identity-free allow-list.`);
    if (field.startsWith("vendor_opt_out_")) push(findings, doc, row.line, field, `HeatMapCell field ${field} must not reference Vendor Opt-Out state.`);
    if (BANNED_REFERENCE_RE.test((row.cells[2] ?? "") + " " + (row.cells[3] ?? ""))) {
      push(findings, doc, row.line, rowText, "HeatMapCell field constraints/notes must not reference Vendor Opt-Out or §4.4.8.");
    }
  }

  return findings;
}

function sellerSignalDimensionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const sellerSignal = findSectionByAnchor(doc, "4.4.18-sellersignal");
  if (!sellerSignal) {
    push(findings, doc, 0, "4.4.18-sellersignal", "§4.4.18 SellerSignal section is missing.");
    return findings;
  }
  const sellerText = doc.lines.slice(sellerSignal.startLine, sellerSignal.endLine + 1).join("\n");
  const sellerTable = parseTableAt(doc, sellerSignal.startLine, sellerSignal.endLine);
  const fields = sellerTable.rows.map((row) => codeValues(row.cells[0] ?? "")[0] ?? "").filter(Boolean);
  for (const field of REQUIRED_SELLER_SIGNAL_FIELDS) {
    if (!fields.includes(field)) push(findings, doc, sellerTable.header?.line ?? sellerSignal.startLine, field, `§4.4.18 SellerSignal field table is missing typed dimension field ${field}.`);
  }
  for (const legacy of ["region_code", "industry_code"]) {
    if (fields.includes(legacy)) push(findings, doc, sellerTable.header?.line ?? sellerSignal.startLine, legacy, `§4.4.18 SellerSignal must not reintroduce legacy ${legacy}.`);
  }
  for (const token of SELLER_SIGNAL_TOKENS) requireToken(findings, doc, sellerText, sellerSignal.startLine, "§4.4.18 SellerSignal", token);

  const preference = findSectionByAnchor(doc, "27.9.3-sellersignaldeliverypreference");
  if (!preference) push(findings, doc, 0, "27.9.3-sellersignaldeliverypreference", "§27.9.3 SellerSignalDeliveryPreference section is missing.");
  else {
    const preferenceText = doc.lines.slice(preference.startLine, preference.endLine + 1).join("\n");
    for (const token of PREFERENCE_TOKENS) requireToken(findings, doc, preferenceText, preference.startLine, "§27.9.3 typed preference contract", token);
  }

  const api = findSectionByAnchor(doc, "27.9.10-api-endpoints");
  if (!api) push(findings, doc, 0, "27.9.10-api-endpoints", "§27.9.10 Seller Signals API section is missing.");
  else {
    const apiText = doc.lines.slice(api.startLine, api.endLine + 1).join("\n");
    for (const token of API_TOKENS) requireToken(findings, doc, apiText, api.startLine, "§27.9.10 typed filter contract", token);
  }

  const appendixJ = findSectionByAnchor(doc, "appendix-j-controlled-vocabulary-registry");
  if (!appendixJ) push(findings, doc, 0, "appendix-j-controlled-vocabulary-registry", "Appendix J is missing.");
  else {
    const enumText = doc.lines.slice(appendixJ.startLine, appendixJ.endLine + 1).join("\n");
    for (const token of ENUM_TOKENS) requireToken(findings, doc, enumText, appendixJ.startLine, "Appendix J marketplace dimension enums", token);
  }
  return findings;
}

function aggregationCardFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const marker = findLine(doc, (line) => line.includes("**New entity: HeatMapAggregationCard"));
  if (!marker) {
    push(findings, doc, 0, "HeatMapAggregationCard", "HeatMapAggregationCard entity block is missing.");
    return findings;
  }
  const table = parseTableAt(doc, marker.line, marker.line + 80);
  for (const row of table.rows) {
    const field = codeValues(row.cells[0] ?? "")[0] ?? "";
    if (BANNED_FIELD_RE.test(field) || field.startsWith("vendor_opt_out_")) {
      push(findings, doc, row.line, field, `HeatMapAggregationCard field ${field} violates the vendor-identity-free aggregate invariant.`);
    }
  }
  const text = doc.lines.slice(marker.line, marker.line + 40).join("\n");
  for (const token of AGGREGATION_CARD_TOKENS) requireToken(findings, doc, text, marker.line, "HeatMapAggregationCard", token);
  return findings;
}

function publicationStatusFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (text.includes("HeatMapCell uses only") && text.includes("suppressed_by_opt_out")) {
      push(findings, doc, line, "suppressed_by_opt_out", "HeatMapCell subset usage must not include `suppressed_by_opt_out`; §4.4.16 makes opt-out suppression structurally unreachable.");
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `heat_map_cell_field_allowlist_drift_detect` |"));
  if (!row) {
    push(findings, doc, 0, "`heat_map_cell_field_allowlist_drift_detect`", "§M.5 row heat_map_cell_field_allowlist_drift_detect is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 heat_map_cell_field_allowlist_drift_detect row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "heat_map_cell_field_allowlist_drift_detect",
  sourcePhase: "V72REM-PH1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.2.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...heatMapCellFindings(doc),
      ...sellerSignalDimensionFindings(doc),
      ...aggregationCardFindings(doc),
      ...publicationStatusFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
