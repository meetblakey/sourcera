/**
 * Gate: `section_47_4_residency_current_apac_custom`
 *
 * Assertion: §47.4 treats `apac` and `custom` as current residency values
 * while leaving ISO / HIPAA / CCPA certification work in Phase 2.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const ANCHOR = "47.4-data-residency-and-compliance-expansion";
const EXPECTED_VALUES = ["us", "eu", "apac", "custom"] as const;

const CURRENT_TOKENS = [
  "## 47.4 Data Residency & Compliance Expansion",
  "**Current residency contract.**",
  "Four production `data_residency_region` values are current: `us`, `eu`, `apac`, and `custom` (§1.6 / Appendix J).",
  "APAC is a current production residency value, not a Phase 2 placeholder.",
  "Singapore-region primary / same-residency failover behavior is governed by §42.4.1 / §42.4.2.",
  "`custom` is the Enterprise / sovereign-cloud route.",
  "The enum remains `custom`;",
  "Organization.`custom_sovereign_residency_label`",
  "§1.6.1 / §40.4 / §34.10.5.A",
  "GDPR DPA is signed for applicable customers.",
  "SOC 2 Type II is targeted; current evidence and audit-report entitlement rows are governed by §33 and §34.",
  "Residency is controller-side and Organization-scoped.",
  "Sourcera does not provide a customer-facing per-user subject-side residency selector",
  "`User.home_residency_region` is infrastructure-only for identity PII writes and DSAR cascades (§4.2.3.1).",
] as const;

const PHASE_2_TOKENS = [
  "**Phase 2 compliance expansion.**",
  "ISO 27001 certification.",
  "HIPAA BAA available.",
  "CCPA compliance certified.",
  "Expanded sovereign-cloud provider catalog for additional `custom_sovereign_residency_label` values",
  "§40.4 provider-routing approval",
] as const;

const BANNED_STALE_TOKENS = [
  "APAC is a Phase 2 placeholder",
  "`apac` is a Phase 2 placeholder",
  "APAC remains Phase 2",
  "`apac` remains Phase 2",
  "`custom` is a future residency value",
  "`custom` remains future work",
  "custom_sovereign_isolated",
  "`ap`",
  "`uk`",
] as const;

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/section_47_4_residency_current_apac_custom.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§47.4 MUST treat `apac` and `custom` as current residency values",
  "ISO / HIPAA / CCPA certification work in Phase 2",
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
  while ((match = re.exec(text)) !== null) values.push(match[1].trim().toLowerCase());
  return values;
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function valuesEqual(values: string[]): boolean {
  return values.length === EXPECTED_VALUES.length && EXPECTED_VALUES.every((value, index) => values[index] === value);
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required §47.4 residency token: ${token}`);
}

function sectionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, ANCHOR);
  if (!section) {
    push(findings, doc, 0, ANCHOR, "§47.4 Data Residency & Compliance Expansion section is missing.");
    return findings;
  }

  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  for (const token of CURRENT_TOKENS) requireToken(findings, doc, text, section.startLine, "§47.4 current residency contract", token);
  for (const token of PHASE_2_TOKENS) requireToken(findings, doc, text, section.startLine, "§47.4 Phase 2 compliance expansion", token);

  const currentValuesLine = findLine(doc, (line) => line.includes("Four production `data_residency_region` values are current:"));
  if (!currentValuesLine || currentValuesLine.line < section.startLine || currentValuesLine.line > section.endLine) {
    push(findings, doc, section.startLine, "`us`, `eu`, `apac`, and `custom`", "§47.4 is missing the current four-value residency line.");
  } else if (!valuesEqual(codeValues(currentValuesLine.text).filter((value) => EXPECTED_VALUES.includes(value as never)))) {
    push(findings, doc, currentValuesLine.line, currentValuesLine.text, "§47.4 current residency values must be exactly `us`, `eu`, `apac`, and `custom`.");
  }

  for (const token of BANNED_STALE_TOKENS) {
    if (text.includes(token)) push(findings, doc, section.startLine, token, `§47.4 contains stale residency token: ${token}`);
  }

  const phaseMarker = text.indexOf("**Phase 2 compliance expansion.**");
  if (phaseMarker < 0) return findings;
  const phase2Text = text.slice(phaseMarker);
  for (const stale of ["APAC is", "`apac` is", "`apac`,", "`apac` and `custom`"]) {
    if (phase2Text.includes(stale)) push(findings, doc, section.startLine, stale, "§47.4 Phase 2 block must not relegate APAC/current residency values to future compliance work.");
  }

  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `section_47_4_residency_current_apac_custom` |"));
  if (!row) {
    push(findings, doc, 0, "`section_47_4_residency_current_apac_custom`", "§M.5 row section_47_4_residency_current_apac_custom is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 section_47_4_residency_current_apac_custom row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "section_47_4_residency_current_apac_custom",
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
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
