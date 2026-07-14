/**
 * Gate: `scenario_modeling_plan_cap_single_source`
 *
 * Assertion: Scenario active-object caps resolve to §14.8.1 and the mirrored
 * §39 `EvaluationScenario.active_per_workspace` row, including Buyer Solo.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireDocTokens, requireScenarioM5RuntimeActive } from "./scenario_modeling_gate_helpers.js";

const GATE_ID = "scenario_modeling_plan_cap_single_source";

const REQUIRED_TOKENS = [
  "### 14.8.1 Scenario Limits",
  "Scenario-object caps are object-size / plan-limit controls mirrored in §39 row `EvaluationScenario.active_per_workspace`",
  "wallet ceilings and free-allowance behavior are authoritative in §34.1 / §4.8.7 and MUST NOT be inferred from the object caps below",
  "| `buyer_free` | 5 |",
  "| `buyer_solo` | 5 |",
  "| `business_starter` | 10 |",
  "| `business_growth` | 25 |",
  "| `business_scale` | 50 |",
  "| `buyer_enterprise` | Unlimited |",
  "| EvaluationScenario | active_per_workspace | Per §14.8.1 |",
  "Counted where `deleted_at IS NULL` and excluding the implicit Original Scoring scenario",
  "Create requests MUST enforce §14.8.1 / §39 `EvaluationScenario.active_per_workspace` caps for every Buyer tier, including `buyer_solo`",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.5",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Scenario Modeling plan-cap singleton", REQUIRED_TOKENS);
    requireScenarioM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
