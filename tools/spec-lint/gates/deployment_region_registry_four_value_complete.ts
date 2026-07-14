/**
 * Gate: `deployment_region_registry_four_value_complete`
 *
 * Assertion: §1.6, §4.2.1, §40.4, §47.4, Appendix J `data_residency_region`,
 * and Appendix J `residency_region_kind` expose the same four live values:
 * `us`, `eu`, `apac`, `custom`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const EXPECTED = ["us", "eu", "apac", "custom"] as const;
const EXPECTED_DISPLAY = EXPECTED.map((v) => `\`${v}\``).join(", ");

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/deployment_region_registry_four_value_complete.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§1.6, §4.2.1, §40.4, §47.4, Appendix J `data_residency_region`, and Appendix J `residency_region_kind`",
  "same four live values: `us`, `eu`, `apac`, `custom`",
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

function normalizeValue(cell: string): string {
  return cell.replace(/`/g, "").trim().toLowerCase();
}

function valuesEqual(values: string[]): boolean {
  return values.length === EXPECTED.length && EXPECTED.every((value, index) => values[index] === value);
}

function requireValues(findings: Finding[], doc: SpecDoc, line: number, label: string, values: string[]) {
  if (!valuesEqual(values)) {
    push(
      findings,
      doc,
      line,
      values.join(", "),
      `${label} must expose exactly the four canonical residency values in order: ${EXPECTED_DISPLAY}.`,
    );
  }
}

function codeValues(text: string): string[] {
  const values: string[] = [];
  const re = /`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const value = match[1].trim().toLowerCase();
    if (EXPECTED.includes(value as never) || ["uk", "ap", "custom_sovereign_isolated"].includes(value)) {
      values.push(value);
    }
  }
  return values;
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function firstCodeValueLineAfter(doc: SpecDoc, headingLine: number): { text: string; line: number } | null {
  for (let line = headingLine + 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (/^#{1,6}\s+/.test(text)) break;
    if (codeValues(text).length > 0) return { text, line };
  }
  return null;
}

function tableValuesByHeader(
  doc: SpecDoc,
  findings: Finding[],
  anchor: string,
  label: string,
  headerName: string,
): void {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) {
    push(findings, doc, 0, anchor, `${label} section is missing.`);
    return;
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  const headers = table.header?.cells ?? [];
  const valueIndex = headers.findIndex((header) => header === headerName);
  if (valueIndex < 0) {
    push(findings, doc, table.header?.line ?? section.startLine, headerName, `${label} table is missing ${headerName} column.`);
    return;
  }
  const values = table.rows.map((row) => normalizeValue(row.cells[valueIndex] ?? "")).filter(Boolean);
  requireValues(findings, doc, table.header?.line ?? section.startLine, label, values);
}

function deploymentRegionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  tableValuesByHeader(doc, findings, "1.6-deployment-regions", "§1.6 Deployment Regions", "Value");
  return findings;
}

function organizationFieldFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByTitle(doc, "4.2.1 Organization");
  if (!section) {
    push(findings, doc, 0, "4.2.1 Organization", "§4.2.1 Organization section is missing.");
    return findings;
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  const row = table.rows.find((candidate) => candidate.cells[0] === "`data_residency_region`");
  if (!row) {
    push(findings, doc, section.startLine, "`data_residency_region`", "§4.2.1 is missing Organization.`data_residency_region`.");
    return findings;
  }
  const values = codeValues(row.cells[2] ?? "").filter((value) => EXPECTED.includes(value as never));
  requireValues(findings, doc, row.line, "§4.2.1 Organization.`data_residency_region`", values);
  const rowText = row.cells.join(" | ");
  for (const token of ["Appendix J `data_residency_region`", "Appendix J `residency_region_kind`", "custom_sovereign_residency_label"]) {
    if (!rowText.includes(token)) {
      push(findings, doc, row.line, token, `§4.2.1 Organization data-residency row is missing required registry binding token: ${token}`);
    }
  }
  return findings;
}

function residencyContractFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  tableValuesByHeader(doc, findings, "40.4.1-residency-contract-registry", "§40.4.1 Residency Contract Registry", "`data_residency_region`");
  return findings;
}

function currentPostureFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "47.4-data-residency-and-compliance-expansion");
  if (!section) {
    push(findings, doc, 0, "47.4-data-residency-and-compliance-expansion", "§47.4 Data Residency & Compliance Expansion section is missing.");
    return findings;
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  const required = [
    "Four production `data_residency_region` values are current: `us`, `eu`, `apac`, and `custom`",
    "APAC is a current production residency value, not a Phase 2 placeholder",
    "`custom` is the Enterprise / sovereign-cloud route",
    "User.home_residency_region` is infrastructure-only",
  ];
  for (const token of required) {
    if (!text.includes(token)) {
      push(findings, doc, section.startLine, token, `§47.4 is missing current residency posture token: ${token}`);
    }
  }
  return findings;
}

function appendixEnumFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const enumHeadings = [
    { label: "Appendix J `data_residency_region`", startsWith: "### `data_residency_region`" },
    { label: "Appendix J `residency_region_kind`", startsWith: "#### `residency_region_kind`" },
  ];
  for (const enumHeading of enumHeadings) {
    const heading = findLine(doc, (line) => line.startsWith(enumHeading.startsWith));
    if (!heading) {
      push(findings, doc, 0, enumHeading.startsWith, `${enumHeading.label} heading is missing.`);
      continue;
    }
    const valueLine = firstCodeValueLineAfter(doc, heading.line);
    if (!valueLine) {
      push(findings, doc, heading.line, EXPECTED_DISPLAY, `${enumHeading.label} has no value row.`);
      continue;
    }
    requireValues(findings, doc, valueLine.line, enumHeading.label, codeValues(valueLine.text));
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `deployment_region_registry_four_value_complete` |"));
  if (!row) {
    push(findings, doc, 0, "`deployment_region_registry_four_value_complete`", "§M.5 row deployment_region_registry_four_value_complete is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) {
    if (!row.text.includes(token)) {
      push(findings, doc, row.line, token, `§M.5 deployment_region_registry_four_value_complete row is missing required token: ${token}`);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "deployment_region_registry_four_value_complete",
  sourcePhase: "V9.3",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...deploymentRegionFindings(doc),
      ...organizationFieldFindings(doc),
      ...residencyContractFindings(doc),
      ...currentPostureFindings(doc),
      ...appendixEnumFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
