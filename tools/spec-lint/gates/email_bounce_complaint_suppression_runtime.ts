/** Local spec-contract half of the email suppression runtime property gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, m5PendingLocalGuardFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "email_bounce_complaint_suppression_runtime";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "41.4-opt-out-rate-warmup-and-suppression-controls"), "§41.4 suppression execution", [
    "before provider dispatch",
    "Create SuppressionListEntry reason `hard_bounce`; no further email to hash until Ops clears",
    "Create SuppressionListEntry reason `spam_complaint`; no self-clear",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "41.5-acceptance-criteria"), "§41.5 suppression ordering", [
    "Hard bounce and spam complaint events MUST create or update SuppressionListEntry before any subsequent send to the same recipient hash",
    "`email_bounce_complaint_suppression_precedes_next_send`",
  ]);
  for (const event of ["email_send_bounced", "email_send_complained"]) {
    const row = findLine(doc, (line) => line.trim().startsWith(`| \`${event}\` |`));
    if (!row) push(findings, doc, 0, event, `Appendix G event ${event} is missing.`);
  }
  findings.push(...m5PendingLocalGuardFindings(doc, GATE_ID, ["deployed provider-webhook and pre-dispatch suppression evidence remains required"]));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 M02.3 local guard closure",
  rowClass: "runtime_property_test",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
