/**
 * Gate: `kb_review_cadence_default_single_source`
 *
 * Assertion: `KBEntry.review_cadence_days` in §22.3.1 owns the default and
 * bounds; §22.4 lifecycle prose only consumes that field.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { push } from "./enterprise_security_gate_helpers.js";
import {
  requireRuntimeActive,
  requireSectionTokensByAnchor,
  sectionByAnchorOrFinding,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "kb_review_cadence_default_single_source";
const SOURCE_PHASE = "v7.2.0-REM Phase 5.2";

const FIELD_TOKENS = [
  "| `review_cadence_days` | Integer | 1 ≤ x ≤ 730; default 90 | Drives §22.4.1 review-state transitions and §22.5 decay. |",
] as const;

const LIFECYCLE_TOKENS = [
  "**Defaults.** The authoritative default and bounds for `review_cadence_days` live on the KBEntry field table in §22.3.1. Sellers may set per-entry cadence within that field's bounds; this lifecycle section consumes the field and does not own a second numeric default.",
] as const;

function rejectLifecycleRestatement(findings: Finding[], ctx: GateContext): void {
  const section = sectionByAnchorOrFinding(findings, ctx.masterSpec, "22.4.1-entry-lifecycle", "§22.4.1 KB lifecycle");
  if (!section) return;

  const forbidden = [/KB_Engineering_Spec\.md §0/i, /\breview_cadence_days\b.{0,80}\bdefault\s+\d+/i, /\bdefault\s+\d+\s+days\b/i];
  const lines = section.text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (forbidden.some((re) => re.test(line))) {
      push(findings, ctx.masterSpec, section.startLine + i, line.trim(), "§22.4.1 must cite §22.3.1 for review cadence defaults and must not restate a second default.");
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "22.3.1-kb-entry-entity", "§22.3.1 KBEntry cadence field", FIELD_TOKENS);
    requireSectionTokensByAnchor(findings, ctx.masterSpec, "22.4.1-entry-lifecycle", "§22.4.1 KB lifecycle cadence consumer", LIFECYCLE_TOKENS);
    rejectLifecycleRestatement(findings, ctx);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
