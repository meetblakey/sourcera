/**
 * Gate: `enum_bound_no_inline_sentinel_admission`
 *
 * Assertion: closed Appendix J enum values cannot be extended by inline
 * sentinel prose such as `scope_kind=not_applicable`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, computeSectionRanges, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const ENUM_EXPECTATIONS = new Map<string, string[]>([
  ["vendor_opt_out_scope_kind", ["global", "category", "software", "page_type", "specific_page"]],
  ["vendor_opt_out_scope_ref_type", ["marketplace_category", "seller_software", "category_page", "comparison_page", "guide_page", "market_intelligence_report", "heat_map_cell", "public_selection_report", "seller_org_page", "software_page", "null"]],
  ["vendor_opt_out_page_type_filter", ["comparison_page", "category_page", "guide_page", "market_intelligence_report", "heat_map_cell", "public_selection_report", "seller_org_page", "software_page"]],
  ["vendor_opt_out_reason_code", ["legal", "competitive", "accuracy_dispute", "gdpr_request", "ops_imposed", "other"]],
  ["vendor_opt_out_ops_review_status", ["auto_honored", "pending_ops_review", "approved", "rejected", "revoked"]],
  ["vendor_opt_out_retro_backfill_status", ["pending", "in_progress", "complete", "failed", "not_applicable"]],
]);

const FIELD_TO_ENUM = new Map<string, string>([
  ["scope_kind", "vendor_opt_out_scope_kind"],
  ["scope_ref_type", "vendor_opt_out_scope_ref_type"],
  ["page_type_filter", "vendor_opt_out_page_type_filter"],
  ["reason_code", "vendor_opt_out_reason_code"],
  ["ops_review_status", "vendor_opt_out_ops_review_status"],
  ["retro_backfill_status", "vendor_opt_out_retro_backfill_status"],
]);

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/enum_bound_no_inline_sentinel_admission.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "closed Appendix-J enum",
  "Inline references to non-registered values",
] as const;

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

function sameValues(actual: string[], expected: string[]): boolean {
  return actual.length === expected.length && expected.every((value, index) => actual[index] === value);
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function findEnumValues(doc: SpecDoc, enumName: string): { values: string[]; line: number } | null {
  const heading = findLine(doc, (line) => /^#{3,5}\s+/.test(line) && line.includes(`\`${enumName}\``));
  if (!heading) return null;
  for (let line = heading.line + 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (/^#{1,5}\s+/.test(text)) break;
    const values = codeValues(text);
    if (values.length > 0) return { values, line };
  }
  return null;
}

function enumRegistryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const [enumName, expected] of ENUM_EXPECTATIONS) {
    const found = findEnumValues(doc, enumName);
    if (!found) {
      push(findings, doc, 0, enumName, `Appendix J enum ${enumName} is missing.`);
      continue;
    }
    if (!sameValues(found.values, expected)) {
      push(findings, doc, found.line, found.values.join(", "), `Appendix J enum ${enumName} must be exactly: ${expected.join(", ")}.`);
    }
  }
  return findings;
}

function vendorOptOutTableFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "4.4.8-vendor-opt-out-record");
  if (!section) {
    push(findings, doc, 0, "4.4.8-vendor-opt-out-record", "§4.4.8 Vendor Opt-Out Record section is missing.");
    return findings;
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  for (const [fieldName, enumName] of FIELD_TO_ENUM) {
    const row = table.rows.find((candidate) => candidate.cells[0] === `\`${fieldName}\``);
    if (!row) {
      push(findings, doc, table.header?.line ?? section.startLine, fieldName, `§4.4.8 is missing ${fieldName}.`);
      continue;
    }
    const expected = ENUM_EXPECTATIONS.get(enumName) ?? [];
    const actual = codeValues(row.cells[2] ?? "").filter((value) => expected.includes(value));
    if (!sameValues(actual, expected)) {
      push(findings, doc, row.line, row.cells.join(" | "), `§4.4.8 ${fieldName} must cite the Appendix J ${enumName} values exactly.`);
    }
  }
  return findings;
}

function makeSkipPredicate(doc: SpecDoc): (line: number) => boolean {
  const ranges = computeSectionRanges(doc);
  const appendixJ = findSectionByAnchor(doc, "appendix-j-controlled-vocabulary-registry");
  const m513 = findSectionByAnchor(doc, "m-5-13-v72rem-phase-1-additions");
  return (line: number): boolean => {
    if (appendixJ && line >= appendixJ.startLine && line <= appendixJ.endLine) return true;
    if (m513 && line >= m513.startLine && line <= m513.endLine) return true;
    const section = [...ranges].reverse().find((range) => line >= range.startLine && line <= range.endLine);
    const text = doc.lines[line] ?? "";
    return Boolean(section?.heading.anchor === "4.4.16-heatmapcell" && text.includes("Prior v7.1.0 wording"));
  };
}

function inlineReferenceFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const skippedLine = makeSkipPredicate(doc);
  const ranges = computeSectionRanges(doc);
  const sectionAnchorForLine = (line: number): string | undefined => [...ranges].reverse().find((range) => line >= range.startLine && line <= range.endLine)?.heading.anchor;
  const enumForField = (field: string, line: number, text: string): string | undefined => {
    const enumName = FIELD_TO_ENUM.get(field);
    if (!enumName) return undefined;
    const anchor = sectionAnchorForLine(line);
    const isVendorOptOutContext =
      anchor === "4.4.8-vendor-opt-out-record" ||
      anchor === "4.4.16-heatmapcell" ||
      text.includes("vendor_opt_out") ||
      text.includes("Vendor Opt-Out") ||
      text.includes("Opt-Out Registry");
    return isVendorOptOutContext ? enumName : undefined;
  };
  for (let line = 1; line < doc.lines.length; line++) {
    if (skippedLine(line)) continue;
    const text = doc.lines[line] ?? "";

    const assignmentRe = /`([a-z_]+)\s*=\s*([a-z0-9_]+)`/g;
    let assignment: RegExpExecArray | null;
    while ((assignment = assignmentRe.exec(text)) !== null) {
      const enumName = enumForField(assignment[1], line, text);
      const value = assignment[2];
      if (enumName && !(ENUM_EXPECTATIONS.get(enumName) ?? []).includes(value)) {
        push(findings, doc, line, assignment[0], `Inline enum reference ${assignment[0]} is not registered in Appendix J ${enumName}.`);
      }
    }

    const setRe = /`([a-z_]+)\s*∈\s*\{([^}]+)\}`/g;
    let set: RegExpExecArray | null;
    while ((set = setRe.exec(text)) !== null) {
      const enumName = enumForField(set[1], line, text);
      if (!enumName) continue;
      const expected = ENUM_EXPECTATIONS.get(enumName) ?? [];
      const values = set[2].split(",").map((value) => value.trim().replace(/`/g, ""));
      for (const value of values) {
        if (!expected.includes(value)) push(findings, doc, line, value, `Inline enum set for ${set[1]} contains unregistered value ${value}.`);
      }
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `enum_bound_no_inline_sentinel_admission` |"));
  if (!row) {
    push(findings, doc, 0, "`enum_bound_no_inline_sentinel_admission`", "§M.5 row enum_bound_no_inline_sentinel_admission is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, `§M.5 enum_bound_no_inline_sentinel_admission row is missing required token: ${token}`);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "enum_bound_no_inline_sentinel_admission",
  sourcePhase: "V72REM-PH1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...enumRegistryFindings(doc),
      ...vendorOptOutTableFindings(doc),
      ...inlineReferenceFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
