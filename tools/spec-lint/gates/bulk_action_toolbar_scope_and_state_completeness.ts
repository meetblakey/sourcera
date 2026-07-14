/**
 * Gate: `bulk_action_toolbar_scope_and_state_completeness`
 *
 * Assertion: §3.8, §3.10, §38.6.2, and the Bulk Action state model agree
 * that Scoring Matrix supports row-level actions and a Scoring Card Side Peek.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "bulk_action_toolbar_scope_and_state_completeness";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.8-side-peek-dimensions-and-behavior"), "§3.8 Side Peek scope", [
    "Scoring Matrix (row → Score Detail / Scoring Card)",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.10-bulk-action-toolbar"), "§3.10 Bulk Action scope and catalog", [
    "Scoring Matrix (row-level only; Score Detail / Scoring Card opens through Side Peek per §3.8 and §38.6.2; cells are excluded)",
    "| Scoring Matrix (row-level; cells excluded) | Reassign Reviewer, Lock Scores, Unlock Scores |",
  ]);
  const state = sectionTextByAnchor(doc, "3.10.7-bulk-action-state-machine");
  requireTokens(findings, doc, state, "§3.10.7 Bulk Action state machine", [
    "| From | To | Trigger | Conditions | Notes |",
    "| `inactive` | `selecting` |",
    "| `selecting` | `selecting_all_in_filter` |",
    "| `dispatching` | `paused_network` |",
    "| `dispatching` | `paused_rate_limit` |",
    "| `dispatching` | `partial_failure_segmented` |",
    "| `partial_failure_segmented` | `dispatching` |",
    "idempotency_key",
  ]);
  const obsolete = "### 3.10.7 Failure Modes";
  const line = doc.lines.findIndex((value) => value.includes(obsolete));
  if (line >= 0) push(findings, doc, line, obsolete, "§3.10.7 must remain the Bulk Action state machine.");
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Bulk Action scope/state closure",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
