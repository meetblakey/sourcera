/** Local spec-contract half of the retained-row redaction mapping gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5PendingLocalGuardFindings, push, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "audit_integrity_exemption_redaction_path_correctness";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionTextByAnchor(doc, "6.8.5-audit-integrity-exemption");
  if (!section) {
    push(findings, doc, 0, "§6.8.5", "§6.8.5 retained-row catalog is missing.");
  } else {
    for (let row = 1; row <= 17; row += 1) {
      if (!section.text.includes(`| ${row} |`)) {
        push(findings, doc, section.startLine, String(row), `§6.8.5 retained row class ${row} is missing.`);
      }
    }
    for (const token of ["Retention Driver", "Retention Window", "Redaction Treatment", "Pattern B", "body-swept", "Cohorts below floor suppress immediately"]) {
      if (!section.text.includes(token)) push(findings, doc, section.startLine, token, `§6.8.5 retained-row catalog is missing redaction-path token: ${token}`);
    }
  }
  findings.push(...m5PendingLocalGuardFindings(doc, GATE_ID, ["deployed retained-row mapping validator evidence remains required"]));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 M02.3 local guard closure",
  rowClass: "deploy_validator",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
