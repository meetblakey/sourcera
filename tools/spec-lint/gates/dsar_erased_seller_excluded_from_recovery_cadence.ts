/** Local spec-contract half of the seller-recovery DSAR exclusion gate. */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5PendingLocalGuardFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "dsar_erased_seller_excluded_from_recovery_cadence";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "48.8.12-abandonment-recovery"), "§48.8.12 seller recovery send-time DSAR exclusion", [
    "enqueue→send in-flight window",
    "send/retry dispatch time",
    "dispatch MUST be dropped",
    "recovery state left unchanged",
    "skip_reason='dsar_pseudonymized'",
    "MUST NOT persist the pseudonymized `seller_email`",
  ]);
  findings.push(...m5PendingLocalGuardFindings(doc, GATE_ID, ["deployed enqueue, send-time, retry, and suppression-join evidence remains required"]));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 M02.3 local guard closure",
  rowClass: "runtime_property_test",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] { return findingsFor(ctx.masterSpec); },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
