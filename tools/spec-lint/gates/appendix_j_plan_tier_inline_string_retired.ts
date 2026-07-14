/**
 * Gate: `appendix_j_plan_tier_inline_string_retired`
 *
 * Assertion: the Phase 14.9.1 inline plan-tier-list backlog stays retired.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { planTierInlineFindings } from "./plan_tier_inline_helpers.js";

export const gate: SpecLintGate = {
  id: "appendix_j_plan_tier_inline_string_retired",
  sourcePhase: "V11",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return planTierInlineFindings(ctx.masterSpec, "appendix_j_plan_tier_inline_string_retired");
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
