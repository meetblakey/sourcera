/**
 * Gate: `enterprise_security_plan_gating_row_pointer_consistency`
 *
 * Assertion: §33 Enterprise-only security and compliance controls cite the
 * canonical §34.1 row plus the §5.11.4 plan-tier resolver.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const SECTION_TOKENS = [
  "Customer-managed encryption keys (CMEK) | Enterprise production scope",
  "§47.3.1; §5.11.4; §34.1.1 / §34.1.2 Enterprise rows; Appendix M.1",
  "Enterprise analytics / governance feature",
  "cite §5.11.4 / §34.1 before launch",
  "IP allowlisting:** Plan authority is §34.1.1 / §34.1.2 cell **IP Allowlist / Data Residency** and §5.11.4",
  "SBOM:** Distribution authority is §34.1.1 / §34.1.2 row **SBOM Distribution** and §5.11.4.",
  "SIEM Integration:** Plan authority is §34.1.1 / §34.1.2 row **SIEM Log Export** and §5.11.4.",
] as const;

const COMPLIANCE_ROWS = new Map([
  ["SOC 2 Type II", "SOC 2 / ISO Audit Report Distribution"],
  ["ISO 27001", "SOC 2 / ISO Audit Report Distribution"],
  ["HIPAA", "Business Associate Agreement (BAA)"],
]);

const INLINE_ONLY_RE = /\b(?:Enterprise[- ]only|Enterprise customers|Enterprise under NDA|Enterprise on request)\b/i;

function complianceTableFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionTextByAnchor(doc, "33.5-compliance-frameworks");
  if (!section) {
    push(findings, doc, 0, "33.5-compliance-frameworks", "§33.5 Compliance Frameworks section is missing.");
    return findings;
  }

  const table = parseTableAt(doc, section.startLine, section.endLine);
  for (const [framework, sourceRow] of COMPLIANCE_ROWS) {
    const row = table.rows.find((candidate) => (candidate.cells[0] ?? "").includes(framework));
    if (!row) {
      push(findings, doc, section.startLine, framework, `§33.5 is missing ${framework} compliance row.`);
      continue;
    }
    const text = row.cells.join(" | ");
    for (const token of ["§34.1.1 / §34.1.2", "§5.11.4", sourceRow]) {
      if (!text.includes(token)) push(findings, doc, row.line, token, `§33.5 ${framework} row must cite ${token}.`);
    }
  }
  return findings;
}

function inlineOnlyFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionTextByAnchor(doc, "33.-enterprise-security-and-compliance");
  if (!section) return findings;
  for (let line = section.startLine; line <= section.endLine; line += 1) {
    const text = doc.lines[line] ?? "";
    if (text.includes("enterprise_security_plan_gating_row_pointer_consistency")) continue;
    const match = INLINE_ONLY_RE.exec(text);
    if (!match) continue;
    if (!text.includes("§34.1") || !text.includes("§5.11.4")) {
      push(
        findings,
        doc,
        line,
        match[0],
        "Enterprise-only §33 control references must cite both §34.1 and §5.11.4 instead of inline-only availability text.",
      );
    }
  }
  return findings;
}

function m5AssertionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `enterprise_security_plan_gating_row_pointer_consistency` |"));
  if (!row) return m5RuntimeActiveFindings(doc, "enterprise_security_plan_gating_row_pointer_consistency");
  for (const token of ["§33 references", "§34.1.1 / §34.1.2", "§5.11.4", "Enterprise-only security / compliance controls"]) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, `§M.5 enterprise_security_plan_gating row is missing assertion token: ${token}`);
  }
  findings.push(...m5RuntimeActiveFindings(doc, "enterprise_security_plan_gating_row_pointer_consistency"));
  return findings;
}

export const gate: SpecLintGate = {
  id: "enterprise_security_plan_gating_row_pointer_consistency",
  sourcePhase: "v7.2.0-REM Phase 33",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    requireTokens(findings, doc, sectionTextByAnchor(doc, "33.-enterprise-security-and-compliance"), "§33 Enterprise Security", SECTION_TOKENS);
    findings.push(...complianceTableFindings(doc));
    findings.push(...inlineOnlyFindings(doc));
    findings.push(...m5AssertionFindings(doc));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
