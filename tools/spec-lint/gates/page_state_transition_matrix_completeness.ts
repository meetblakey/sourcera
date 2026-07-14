/**
 * Gate: `page_state_transition_matrix_completeness`
 *
 * Assertion: §3.7.1 exposes an unambiguous transition table for all five
 * `page_state_kind` values and does not reintroduce the contradictory ASCII.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "page_state_transition_matrix_completeness";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const state = sectionTextByAnchor(doc, "3.7.1-state-governance");
  requireTokens(findings, doc, state, "§3.7.1 page-state transition matrix", [
    "| From | To | Trigger | Conditions | Notes |",
    "| `loading` | `ready` |",
    "| `loading` | `empty` |",
    "| `loading` | `error` |",
    "| `loading` | `partial` |",
    "| `partial` | `ready` |",
    "| `partial` | `error` |",
    "| `ready` | `loading` |",
    "| `empty` | `loading` |",
    "| `error` | `loading` |",
    "Direct transition is not permitted",
    "ui_page_state_exited",
    "ui_page_state_entered",
  ]);
  for (const stale of ["loading → (no upward transition", "(mount) → loading → ready | empty | error | partial"]) {
    const line = doc.lines.findIndex((value) => value.includes(stale));
    if (line >= 0) push(findings, doc, line, stale, "§3.7.1 retains the retired ambiguous ASCII state diagram.");
  }
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 page-state transition closure",
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
