/**
 * Gate: `usage_envelope_violation_kind_appendix_i_pairing`
 *
 * Assertion: §51.2.5, Appendix G, Appendix I, Appendix J, and §M.5 agree on
 * the closed 11-cause `usage_envelope_violation_kind` contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { TableRow } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const PAIRINGS = [
  ["missing_required", "usage_event_envelope_violation"],
  ["enum_violation", "usage_event_envelope_enum_violation"],
  ["type_mismatch", "usage_event_envelope_type_mismatch"],
  ["tenancy_mismatch", "usage_event_envelope_tenancy_mismatch"],
  ["residency_mismatch", "usage_event_residency_mismatch"],
  ["cardinality_exceeded", "usage_event_envelope_cardinality_exceeded"],
  ["cross_console_leak", "usage_event_envelope_cross_console_leak"],
  ["schema_version_unsupported", "usage_event_envelope_schema_version_unsupported"],
  ["residency_partition_denial", "usage_event_residency_partition_denial"],
  ["capability_unresolved", "usage_event_capability_unresolved"],
  ["dsar_redaction_failure", "usage_event_dsar_redaction_failure"],
] as const;

const ENUM_VALUES = PAIRINGS.map(([kind]) => kind);
const APPENDIX_I_CODES = PAIRINGS.map(([, code]) => code);

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/usage_envelope_violation_kind_appendix_i_pairing.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§51.2.5 canonical 11-cause mapping",
  "every value has one distinct Appendix I error code",
  "`usage_event_envelope_unknown_property` remains outside the closed enum pairing",
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

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required usage-envelope pairing token: ${token}`);
}

function mappingRows(doc: SpecDoc, findings: Finding[]): TableRow[] {
  const header = findLine(doc, (line) =>
    line.includes("| `usage_envelope_violation_kind` | Authorizing validator check | Appendix I error code | Required behavior |"),
  );
  if (!header) {
    push(findings, doc, 0, "Canonical `usage_envelope_violation_kind` mapping", "§51.2.5 canonical usage-envelope mapping table is missing.");
    return [];
  }
  const table = parseTableAt(doc, header.line);
  const headers = table.header?.cells ?? [];
  const expectedHeaders = ["`usage_envelope_violation_kind`", "Authorizing validator check", "Appendix I error code", "Required behavior"];
  if (expectedHeaders.some((expected, index) => headers[index] !== expected)) {
    push(findings, doc, header.line, doc.lines[header.line] ?? "", "§51.2.5 canonical mapping table header is not the expected four-column contract.");
  }
  return table.rows;
}

function mappingFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const rows = mappingRows(doc, findings);
  if (rows.length !== PAIRINGS.length) {
    push(findings, doc, rows[0]?.line ?? 0, `${rows.length}`, `§51.2.5 canonical mapping table must contain exactly ${PAIRINGS.length} cause rows.`);
  }

  const rowByKind = new Map<string, TableRow>();
  for (const row of rows) {
    const kind = row.cells[0]?.replace(/`/g, "").trim() ?? "";
    if (kind) rowByKind.set(kind, row);
  }

  const seenCodes = new Set<string>();
  for (const [kind, code] of PAIRINGS) {
    const row = rowByKind.get(kind);
    if (!row) {
      push(findings, doc, rows[0]?.line ?? 0, kind, `§51.2.5 canonical mapping table is missing usage_envelope_violation_kind=${kind}.`);
      continue;
    }
    const rowText = row.cells.join(" | ");
    requireToken(findings, doc, rowText, row.line, `§51.2.5 mapping row ${kind}`, code);
    if (seenCodes.has(code)) {
      push(findings, doc, row.line, code, `Appendix I error code ${code} is duplicated in §51.2.5 canonical mapping.`);
    }
    seenCodes.add(code);
  }

  for (const row of rows) {
    const kind = row.cells[0]?.replace(/`/g, "").trim() ?? "";
    if (!ENUM_VALUES.includes(kind as (typeof ENUM_VALUES)[number])) {
      push(findings, doc, row.line, kind, `§51.2.5 canonical mapping table has non-canonical usage_envelope_violation_kind=${kind}.`);
    }
  }
  return findings;
}

function enumFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const heading = findLine(doc, (line) => line.trim().startsWith("#### `usage_envelope_violation_kind`"));
  if (!heading) {
    push(findings, doc, 0, "#### `usage_envelope_violation_kind`", "Appendix J usage_envelope_violation_kind enum section is missing.");
    return findings;
  }
  let enumLine: { text: string; line: number } | null = null;
  for (let line = heading.line + 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (text.trim().startsWith("#### ")) break;
    if (text.trim().startsWith("`missing_required`")) {
      enumLine = { text, line };
      break;
    }
  }
  if (!enumLine) {
    push(findings, doc, heading.line, "missing_required", "Appendix J usage_envelope_violation_kind value list is missing.");
    return findings;
  }
  const found = enumLine.text
    .split(",")
    .map((value) => value.replace(/`/g, "").trim())
    .filter(Boolean);
  const extras = found.filter((value) => !ENUM_VALUES.includes(value as (typeof ENUM_VALUES)[number]));
  const missing = ENUM_VALUES.filter((value) => !found.includes(value));
  for (const value of missing) push(findings, doc, enumLine.line, value, `Appendix J usage_envelope_violation_kind enum is missing ${value}.`);
  for (const value of extras) push(findings, doc, enumLine.line, value, `Appendix J usage_envelope_violation_kind enum has unexpected value ${value}.`);
  if (found.length !== ENUM_VALUES.length) {
    push(findings, doc, enumLine.line, enumLine.text, `Appendix J usage_envelope_violation_kind must have exactly ${ENUM_VALUES.length} values.`);
  }
  return findings;
}

function appendixIFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const appendixI = sectionText(doc, "appendix-i-section-51-additions");
  if (!appendixI) {
    push(findings, doc, 0, "appendix-i-section-51-additions", "Appendix I §51 Product Usage Analytics Errors section is missing.");
    return findings;
  }
  requireToken(findings, doc, appendixI.text, appendixI.line, "Appendix I §51 preamble", "The 11 enum-bounded rejection causes pair 1:1");
  requireToken(findings, doc, appendixI.text, appendixI.line, "Appendix I §51 preamble", "`usage_event_envelope_unknown_property` is a distinct shape error");
  for (const [kind, code] of PAIRINGS) {
    requireToken(findings, doc, appendixI.text, appendixI.line, `Appendix I pairing ${kind}`, `\`${code}\``);
    requireToken(findings, doc, appendixI.text, appendixI.line, `Appendix I pairing ${kind}`, `usage_envelope_violation_kind=${kind}`);
  }
  const unknownLine = appendixI.text
    .split(/\n/)
    .find((line) => line.trim().startsWith("| `usage_event_envelope_unknown_property` |"));
  if (!unknownLine) {
    push(findings, doc, appendixI.line, "usage_event_envelope_unknown_property", "Appendix I unknown-property row is missing.");
  } else {
    if (!unknownLine.includes("Not a `usage_envelope_violation_kind` value")) {
      push(findings, doc, appendixI.line, unknownLine, "Appendix I unknown-property row must be explicitly excluded from the 11-cause enum.");
    }
    if (/Pairs with\s+`usage_envelope_violation_kind=/.test(unknownLine)) {
      push(findings, doc, appendixI.line, unknownLine, "Appendix I unknown-property row must not claim a usage_envelope_violation_kind pairing.");
    }
  }
  return findings;
}

function appendixGFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.includes("| `usage_analytics_envelope_violation` |"));
  if (!row) {
    push(findings, doc, 0, "usage_analytics_envelope_violation", "Appendix G usage_analytics_envelope_violation event row is missing.");
    return findings;
  }
  for (const value of ENUM_VALUES) {
    requireToken(findings, doc, row.text, row.line, "Appendix G usage_analytics_envelope_violation row", value);
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `usage_envelope_violation_kind_appendix_i_pairing` |"));
  if (!row) {
    push(findings, doc, 0, "`usage_envelope_violation_kind_appendix_i_pairing`", "§M.5 row usage_envelope_violation_kind_appendix_i_pairing is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 usage_envelope_violation_kind_appendix_i_pairing row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "usage_envelope_violation_kind_appendix_i_pairing",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...mappingFindings(doc),
      ...enumFindings(doc),
      ...appendixIFindings(doc),
      ...appendixGFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
