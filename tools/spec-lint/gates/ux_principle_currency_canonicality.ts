/**
 * Gate: `ux_principle_currency_canonicality`
 *
 * Assertion: the Linear Constraint and Principle 9 cross-document contract
 * has one current name, a live UX §1.4 reference, and no pre-landing prose.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "ux_principle_currency_canonicality";

function requireTokens(findings: Finding[], doc: SpecDoc, label: string, tokens: readonly string[]) {
  for (const token of tokens) {
    if (!doc.text.includes(token)) push(findings, doc, 0, token, `${label} is missing required token: ${token}`);
  }
}

function forbidTokens(findings: Finding[], doc: SpecDoc, label: string, tokens: readonly string[]) {
  for (const token of tokens) {
    const index = doc.text.indexOf(token);
    if (index < 0) continue;
    const line = doc.text.slice(0, index).split("\n").length;
    push(findings, doc, line, token, `${label} retains stale token: ${token}`);
  }
}

function findingsFor(master: SpecDoc, ux: SpecDoc | undefined): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, master, "Master Spec Linear Constraint", [
    "# 3\\. UX Standard — The Linear Constraint {#3.-ux-standard-—-the-linear-constraint}",
    "**Linear Constraint.**",
    "UX_Design_of_Sourcera.md` §1.4",
  ]);
  forbidTokens(findings, master, "Master Spec Linear Constraint", [
    "Sourcera Constraint",
    "UX_Design_of_Sourcera.md` §X",
    "Until those phases land",
  ]);

  const principle = findSectionByAnchor(master, "3.13-principle-9-surface-simplicity-engine-complexity");
  if (!principle) {
    push(findings, master, 0, "§3.13", "§3.13 Principle 9 section is missing.");
  } else {
    const text = master.lines.slice(principle.startLine, principle.endLine + 1).join("\n");
    for (const token of [
      "Appendix M (§M.1) and the First-30-Seconds Test (`UX_Design_of_Sourcera.md` §1.4) are landed and binding.",
      "Current enforcement status.",
    ]) {
      if (!text.includes(token)) push(findings, master, principle.startLine, token, `§3.13 is missing current-enforcement token: ${token}`);
    }
  }

  if (!ux) {
    push(findings, master, 0, "UX_Design_of_Sourcera.md", "UX Design companion is missing.");
  } else {
    requireTokens(findings, ux, "UX Design Linear Constraint", ["Linear Constraint", "Master Spec §3"]);
    forbidTokens(findings, ux, "UX Design Linear Constraint", ["Sourcera Constraint"]);
  }
  findings.push(...m5RuntimeActiveFindings(master, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Principle 9 currency closure",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec, ctx.uxSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
