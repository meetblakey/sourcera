/**
 * Gate: `solo_role_grid_inclusion`
 *
 * Assertion: plan-tier references in §5.11 / §34 / §39 / Appendix M.1 are
 * Solo-aware and §5.11.4 remains the canonical plan-tier overlay resolver.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { planTierInlineFindings } from "./plan_tier_inline_helpers.js";

export const gate: SpecLintGate = {
  id: "solo_role_grid_inclusion",
  sourcePhase: "14.9",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return planTierInlineFindings(ctx.masterSpec, "solo_role_grid_inclusion");
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
