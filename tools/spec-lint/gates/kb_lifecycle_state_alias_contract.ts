/**
 * Gate: `kb_lifecycle_state_alias_contract`
 *
 * Assertion: `review_state` and `lifecycle_state` are API aliases for
 * persisted `KBEntry.status`, not separate persisted KBEntry columns.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push } from "./enterprise_security_gate_helpers.js";
import {
  requireRuntimeActive,
  requireSectionTokensByAnchor,
  sectionByAnchorOrFinding,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "kb_lifecycle_state_alias_contract";
const SOURCE_PHASE = "v7.2.0-REM Phase 5.2";

const REQUIRED_TOKENS = [
  "| `status` | Enum | See Appendix J `kb_entry_status` | Canonical persisted lifecycle / review-state field. State machine in Appendix L (`kb_entry_state_machine`); see §22.4.1. API payload aliases `review_state` and `lifecycle_state` are read/write projections of this field, not separate columns. |",
] as const;

function rejectSeparatePersistedColumns(findings: Finding[], ctx: GateContext): void {
  const section = sectionByAnchorOrFinding(findings, ctx.masterSpec, "22.3.1-kb-entry-entity", "§22.3.1 KBEntry entity");
  if (!section) return;

  const lines = section.text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (/^\|\s*`(?:review_state|lifecycle_state)`\s*\|/.test(line)) {
      push(findings, ctx.masterSpec, section.startLine + i, line.trim(), "KBEntry must not persist separate `review_state` or `lifecycle_state` columns; both are aliases for `status`.");
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "22.3.1-kb-entry-entity", "§22.3.1 KBEntry lifecycle alias contract", REQUIRED_TOKENS);
    rejectSeparatePersistedColumns(findings, ctx);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
