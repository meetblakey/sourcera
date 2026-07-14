/**
 * Gate: `buyer_response_score_lock_lifecycle_contract`
 *
 * Assertion: Buyer Response and Score lifecycle documentation preserves the
 * existing bridge flow and terminal post-Phase-12 Score lock.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor, sectionTextByTitle } from "./policy_ingestion_gate_helpers.js";

const GATE_ID = "buyer_response_score_lock_lifecycle_contract";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];

  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.5 Response \(Console-Scoped, Buyer\)$/), "§4.3.5 Response", [
    "`draft` | `submitted` | `received` | `acknowledged`",
    "`submitted_at` MUST be stamped when the response first becomes seller-finalized",
    "explicit amendment/reverification path that emits a Console Bridge event",
  ]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.6 Score \(Console-Scoped, Buyer\)$/), "§4.3.6 Score", [
    "**Lock Finality.** `locked=true` is terminal for that Score row.",
    "There is no unlock or reversal state: every post-Phase-12 score correction requires Workspace cancellation and a new evaluation",
  ]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.10 Evaluation Pulse Event \(Console-Scoped, Buyer\)$/), "§4.3.10 Evaluation Pulse Event", [
    "In Solo Mode, the Pulse Inbox surface is suppressed per §2.8.4",
    "the engine continues to create and retain every Evaluation Pulse Event",
    "never becomes a Seller, Marketplace, or public projection",
  ]);
  requireTokens(findings, doc, sectionTextByTitle(doc, /^4\.3\.25 Approval Workflow/), "§4.3.25 Approval Workflow", [
    "workflow MUST NOT unlock scores; the only score-changing path is cancellation and a new evaluation",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "l-25-buyer-response-and-score-lock-state-machines"), "Appendix L.25 Buyer Response and Score Lock", [
    "`draft` | `submitted` | Seller finalizes the corresponding Bid Response |",
    "`submitted` | `received` | Buyer-side bridge consumer accepts the submitted projection |",
    "`received` | `acknowledged` | Authorized Buyer Workspace member acknowledges |",
    "a duplicate acknowledgement is idempotent and writes no second Audit Event.",
    "There is no unlock or reversal transition.",
    "| `unlocked` | `locked` | Workspace enters Phase 12 |",
    "| `locked` | `locked` | Attempted append, override, soft-delete, or unlock |",
    "post-Phase-12 correction path is cancellation and a new evaluation",
    "The tables add no enum, API, webhook, plan gate, cross-console projection, retention class, or mobile-only behavior",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Buyer Response and Score-lock lifecycle closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_audit_log_integrity",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
