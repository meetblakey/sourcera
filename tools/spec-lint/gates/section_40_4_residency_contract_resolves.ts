/**
 * Gate: `section_40_4_residency_contract_resolves`
 *
 * Assertion: §40.4 resolves residency citations to a data-plane residency
 * contract registry, not merely the historical import round-trip-fidelity text.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const ANCHOR = "40.4-import-round-trip-fidelity";

const REGION_TO_LEGAL_ENTITY = new Map([
  ["us", "sourcera_us_llc"],
  ["eu", "sourcera_eu_gmbh"],
  ["apac", "sourcera_apac_pte"],
  ["custom", "sourcera_custom"],
]);

const SECTION_TOKENS = [
  "## 40.4 Data Residency Contract Registry & Import Round-Trip Fidelity",
  "canonical data-plane residency contract consumed by §1.6, §4 entity rows, §6.7, §6.8, §32, §41, §42, §47, §50, and Appendix J",
  "Historical citations that say \"§40.4 residency\" resolve here",
  "import round-trip fidelity remains in §40.4.3 below",
  "### 40.4.1 Residency Contract Registry",
  "### 40.4.2 Export, Import, Migration, and Source-Retention Rules",
  "### 40.4.3 Import Round-Trip Fidelity",
  "Exports are generated in the source entity's residency partition",
  "Imports stage in the target Organization / Workspace residency before validation",
  "Provider processing for document parsing, embeddings, policy extraction, email dispatch metadata, analytics, logging, and support references must either run in-region or use a contract-approved `custom` routing exception",
  "A §1.6.1 residency migration snapshots source data, restores to target, validates row / object / hash counts, re-roots audit hash chains, executes §34.10.5.A billing rebinding",
  "Source-retention hold lasts for the §40.2 evacuation-grace-period row",
  "Cross-region replication for DR requires the §42.4.2 DPA-addendum-approved replica policy",
  "Export, import, DSAR, and audit artifacts MUST preserve their source residency partition through staging, signing, and download",
  "CI gate `section_40_4_residency_contract_resolves` asserts",
  "`apac` and `custom` MUST be accepted by every §40.4 consumer that already accepts `us` and `eu`",
] as const;

const BANNED_STALE_TOKENS = [
  "[40.4 Import Round-Trip Fidelity](#40.4-import-round-trip-fidelity)",
  "## 40.4 Import Round-Trip Fidelity {#40.4-import-round-trip-fidelity}",
] as const;

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/section_40_4_residency_contract_resolves.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "Every body citation to \"§40.4 residency\" MUST resolve to a residency contract registry",
  "MUST NOT point only to import round-trip fidelity",
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

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required §40.4 residency-contract token: ${token}`);
}

function sectionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const token of BANNED_STALE_TOKENS) {
    const line = findLine(doc, (candidate) => candidate.includes(token));
    if (line) push(findings, doc, line.line, token, "§40.4 must not be labeled as only Import Round-Trip Fidelity.");
  }

  const section = findSectionByAnchor(doc, ANCHOR);
  if (!section) {
    push(findings, doc, 0, ANCHOR, "§40.4 section is missing.");
    return findings;
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  for (const token of SECTION_TOKENS) requireToken(findings, doc, text, section.startLine, "§40.4", token);
  return findings;
}

function registryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "40.4.1-residency-contract-registry");
  if (!section) {
    push(findings, doc, 0, "40.4.1-residency-contract-registry", "§40.4.1 residency contract registry is missing.");
    return findings;
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  const headers = table.header?.cells ?? [];
  for (const header of ["`data_residency_region`", "Primary data plane", "Backup / DR plane", "Export / import staging", "Observability and provider routing", "Billing legal entity"]) {
    if (!headers.includes(header)) push(findings, doc, table.header?.line ?? section.startLine, header, `§40.4.1 registry table is missing ${header} column.`);
  }
  const seen = new Map<string, { legalEntity: string; line: number; text: string }>();
  for (const row of table.rows) {
    const region = codeValues(row.cells[0] ?? "")[0];
    const legalEntity = codeValues(row.cells[5] ?? "")[0];
    if (region) seen.set(region, { legalEntity, line: row.line, text: row.cells.join(" | ") });
  }
  for (const [region, legalEntity] of REGION_TO_LEGAL_ENTITY) {
    const row = seen.get(region);
    if (!row) {
      push(findings, doc, table.header?.line ?? section.startLine, region, `§40.4.1 registry is missing ${region}.`);
      continue;
    }
    if (row.legalEntity !== legalEntity) push(findings, doc, row.line, row.legalEntity, `§40.4.1 ${region} row must map to ${legalEntity}.`);
    for (const token of ["data", "object", "signer", "routing"]) {
      if (!row.text.toLowerCase().includes(token)) push(findings, doc, row.line, token, `§40.4.1 ${region} row must specify data plane, object storage/staging, signer, and routing.`);
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `section_40_4_residency_contract_resolves` |"));
  if (!row) {
    push(findings, doc, 0, "`section_40_4_residency_contract_resolves`", "§M.5 row section_40_4_residency_contract_resolves is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 section_40_4_residency_contract_resolves row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "section_40_4_residency_contract_resolves",
  sourcePhase: "V9.3",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...sectionFindings(doc),
      ...registryFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
