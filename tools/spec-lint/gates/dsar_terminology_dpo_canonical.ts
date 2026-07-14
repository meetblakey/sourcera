/** Gate: `dsar_terminology_dpo_canonical`. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const GATE_ID = "dsar_terminology_dpo_canonical";

function finding(doc: SpecDoc, line: number, matched: string, message: string): Finding {
  return { file: doc.path, line, matched_text: matched, message };
}

function lineContaining(doc: SpecDoc, token: string) {
  const index = doc.lines.findIndex((line) => line.includes(token));
  return index >= 0 ? { text: doc.lines[index] ?? "", line: index } : null;
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const sla = findSectionByAnchor(doc, "6.8.6-dsar-operational-sla");
  if (!sla) {
    findings.push(finding(doc, 0, "6.8.6-dsar-operational-sla", "Required DSAR SLA section is missing."));
  } else {
    const text = doc.lines.slice(sla.startLine, sla.endLine + 1).join("\n");
    if (!text.includes("P0 alert; pages DPO on-call through Appendix J `ops_dpo_admin`.")) {
      findings.push(finding(doc, sla.startLine, "DPO on-call", "§6.8.6 AC #3 must route the P0 page to DPO on-call through ops_dpo_admin."));
    }
    if (text.includes("Privacy Officer on-call")) {
      findings.push(finding(doc, sla.startLine, "Privacy Officer on-call", "Privacy Officer on-call is retired; use DPO on-call through ops_dpo_admin."));
    }
  }

  const glossary = lineContaining(doc, "**DPO (Data Protection Officer).**");
  if (!glossary) {
    findings.push(finding(doc, 0, "DPO (Data Protection Officer)", "Appendix K DPO glossary entry is missing."));
  } else {
    for (const token of ["Appendix J `ops_dpo_admin`", "not a separate RBAC principal", "on-call rotation"]) {
      if (!glossary.text.includes(token)) findings.push(finding(doc, glossary.line, token, `DPO glossary entry is missing: ${token}`));
    }
  }

  const m5 = lineContaining(doc, `| \`${GATE_ID}\` |`);
  if (!m5) {
    findings.push(finding(doc, 0, GATE_ID, `§M.5 row ${GATE_ID} is missing.`));
  } else {
    for (const token of ["**`runtime_active`**", `tools/spec-lint/gates/${GATE_ID}.ts`, "verified PASS on live Master Spec and pass/fail fixtures"]) {
      if (!m5.text.includes(token)) findings.push(finding(doc, m5.line, token, `§M.5 ${GATE_ID} row is missing: ${token}`));
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 DSAR DPO terminology closure",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
