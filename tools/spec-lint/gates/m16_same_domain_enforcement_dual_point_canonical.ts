/** Local spec-contract half of the M16 same-domain enforcement gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, m5PendingLocalGuardFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "m16_same_domain_enforcement_dual_point_canonical";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "48.7.3-m16-buyer-referral-credit"), "§48.7.3 M16 same-domain enforcement", [
    "CREATE-TIME hard block",
    "call site provided `referee_email`",
    "SIGNUP-TIME safety net",
    "SSO-resolved email-domain",
    "`m16_referral_same_domain_blocked`",
    "`enforcement_point ∈ {create_time, signup_time}`",
  ]);
  const enumRow = findLine(doc, (line) => line.startsWith("**`m16_same_domain_enforcement_point_kind`**"));
  if (!enumRow?.text.includes("`create_time`, `signup_time`")) {
    push(findings, doc, enumRow?.line ?? 0, "create_time, signup_time", "Appendix J M16 enforcement-point enum is incomplete.");
  }
  const m5 = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  if (m5?.text.includes("m16.referral.same_domain_blocked") || !m5?.text.includes("m16_referral_same_domain_blocked")) {
    push(findings, doc, m5?.line ?? 0, m5?.text ?? GATE_ID, "§M.5 M16 gate must use the canonical event m16_referral_same_domain_blocked.");
  }
  findings.push(...m5PendingLocalGuardFindings(doc, GATE_ID, ["deployed create-time and signup-time validator evidence remains required"]));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 M02.3 local guard closure",
  rowClass: "catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
