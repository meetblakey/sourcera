/**
 * Gate: `mfa_enforcement_level_canonical_consumer`
 *
 * Assertion: MFA org-wide enforcement is represented by the
 * `Organization.mfa_enforcement_level` enum, with legacy Boolean names allowed
 * only in explicit deprecated/migration notes.
 */

import { computeSectionRanges, parseTableAt } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { TableRow } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "mfa_enforcement_level_canonical_consumer";

const LEGACY_NAMES = ["mfa_required_org_wide", "mfa_enforcement_required", "users.mfa_enabled"];

function sectionByTitle(doc: SpecDoc, title: string): { text: string; startLine: number; endLine: number } | null {
  const section = computeSectionRanges(doc).find((range) => range.heading.title.includes(title));
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

function rowWithFirstCell(rows: TableRow[], value: string): TableRow[] {
  return rows.filter((row) => (row.cells[0] ?? "").includes(`\`${value}\``));
}

function requireOrganizationField(findings: Finding[], doc: SpecDoc) {
  const orgSection = sectionByTitle(doc, "4.2.1 Organization");
  if (!orgSection) {
    push(findings, doc, 0, "4.2.1 Organization", "§4.2.1 Organization section is missing.");
    return;
  }
  const rows = parseTableAt(doc, orgSection.startLine, orgSection.endLine).rows;
  const matches = rowWithFirstCell(rows, "mfa_enforcement_level");
  if (matches.length !== 1) {
    push(findings, doc, orgSection.startLine, "mfa_enforcement_level", "§4.2.1 Organization must contain exactly one mfa_enforcement_level field row.");
    return;
  }
  const row = matches[0];
  const text = row.cells.join(" | ");
  for (const token of [
    "Enum",
    "Appendix J `MFA Enforcement Levels`",
    "Canonical Org-wide MFA enforcement posture",
    "Free and Solo default `off`",
    "paid non-Enterprise tiers default `optional`",
    "Enterprise defaults `optional` and may be promoted to `required`",
    "deprecated Booleans `mfa_required_org_wide` and `mfa_enforcement_required` are legacy read-only migration aliases only",
    "new code MUST consume this enum",
  ]) {
    if (!text.includes(token)) push(findings, doc, row.line, token, "§4.2.1 mfa_enforcement_level row is missing the canonical enum contract.");
  }
}

function appendixJFindings(findings: Finding[], doc: SpecDoc) {
  const row = findLine(doc, (line) => line.includes("**`MFA Enforcement Levels` enum activation"));
  if (!row) {
    push(findings, doc, 0, "MFA Enforcement Levels", "Appendix J MFA Enforcement Levels enum activation row is missing.");
    return;
  }
  for (const token of [
    "`off`, `optional`, `required`",
    "deprecated in favor of a single `Organization.mfa_enforcement_level` column",
    "Pre-existing Boolean rows migrate `false → off`, `true → required`",
    "CI gate `mfa_enforcement_level_canonical_consumer` asserts",
  ]) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, "Appendix J MFA Enforcement Levels row is missing canonical migration wording.");
  }
}

function isAllowedLegacyContext(line: string): boolean {
  return /\b(deprecated|legacy|read-only|migration|migrate|pre-V3|retired|replaces deprecated|remediation|alias|aliases|former)\b/i.test(line);
}

function legacyBooleanFindings(findings: Finding[], doc: SpecDoc) {
  for (let lineNo = 1; lineNo < doc.lines.length; lineNo += 1) {
    const line = doc.lines[lineNo] ?? "";
    for (const legacy of LEGACY_NAMES) {
      if (line.includes(legacy) && !isAllowedLegacyContext(line)) {
        push(
          findings,
          doc,
          lineNo,
          legacy,
          `${legacy} may appear only in explicit deprecated/migration notes; active MFA policy wording must use Organization.mfa_enforcement_level.`,
        );
      }
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 3V MFA Enforcement Enum",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireOrganizationField(findings, doc);
    requireTokens(findings, doc, sectionByTitle(doc, "6.2.2 MFA Enrollment & Enforcement"), "§6.2.2 MFA enforcement consumer", [
      "Per-Org enforcement is `Organization.mfa_enforcement_level` of type `MFA Enforcement Levels`",
      "values `off`, `optional`, `required`",
      "the pre-V3 Boolean `mfa_required_org_wide` and `mfa_enforcement_required` are deprecated",
      "CI gate `mfa_enforcement_level_canonical_consumer`",
    ]);
    appendixJFindings(findings, doc);
    legacyBooleanFindings(findings, doc);
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
