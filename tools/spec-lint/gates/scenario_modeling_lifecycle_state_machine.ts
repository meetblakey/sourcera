/**
 * Gate: `scenario_modeling_lifecycle_state_machine`
 *
 * Assertion: Scenario Modeling lifecycle states are derived, registered in
 * Appendix J, and governed by §14.6.4 without a parallel persisted status.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireScenarioM5RuntimeActive,
  SCENARIO_LIFECYCLE_STATES,
} from "./scenario_modeling_gate_helpers.js";

const GATE_ID = "scenario_modeling_lifecycle_state_machine";

const REQUIRED_TOKENS = [
  "### 14.6.4 Scenario Lifecycle State Machine {#14.6.4-scenario-lifecycle-state-machine}",
  "derived from §4.3.8 fields (`results`, `version`, `is_locked`, `deleted_at`)",
  "no parallel status column is introduced",
  "#### `evaluation_scenario_lifecycle_state` (§4.3.8 / §14.6.4)",
  "`original`, `created`, `edited`, `results_recomputed`, `locked`, `soft_deleted`, `rejected`",
  "`rejected` is an API / state-machine outcome label only and MUST NOT be stored as an entity state",
  "| `(implicit)` | `original` |",
  "| `(none)` | `created` |",
  "| `edited` / `created` | `results_recomputed` |",
  "| `created` / `edited` / `results_recomputed` | `locked` |",
  "| `created` / `edited` / `results_recomputed` | `soft_deleted` |",
  "`scenario_phase_locked`",
  "`scenario_concurrent_edit_conflict`",
  "Emits `scenario.locked`",
  ...SCENARIO_LIFECYCLE_STATES,
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.5",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Scenario Modeling lifecycle state machine", REQUIRED_TOKENS);
    requireScenarioM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
