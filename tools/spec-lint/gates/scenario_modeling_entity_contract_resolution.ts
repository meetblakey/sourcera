/**
 * Gate: `scenario_modeling_entity_contract_resolution`
 *
 * Assertion: §14 Scenario Modeling resolves to the canonical §4.3.8
 * EvaluationScenario entity and cannot reintroduce an orphan inline schema.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireDocTokens, requireScenarioM5RuntimeActive } from "./scenario_modeling_gate_helpers.js";

const GATE_ID = "scenario_modeling_entity_contract_resolution";

const REQUIRED_TOKENS = [
  "### 4.3.8 Evaluation Scenario (Console-Scoped, Buyer) {#4.3.8-evaluation-scenario-console-scoped-buyer}",
  "### 14.2.1 Scenario Object Schema",
  "§14.2.1 forwards to those anchors and does not re-author the schema inline",
  "§4.3.8 is canonical",
  "| `id` | UUID |",
  "| `org_id` | UUID |",
  "| `workspace_id` | UUID |",
  "| `console` | Enum | `buyer` (fixed) |",
  "| `name` | String | 1–200 chars |",
  "| `description` | String | 0–2000 chars |",
  "| `parameters` | JSONB | Schema per §4.3.8.1",
  "| `results` | JSONB | Schema per §4.3.8.2",
  "| `version` | Integer | ≥ 1",
  "| `is_locked` | Boolean | Default `false`",
  "| `locked_at` | Timestamp | Nullable |",
  "| `created_at` | Timestamp | Immutable |",
  "| `updated_at` | Timestamp | Auto-updated |",
  "| `created_by` | UUID (FK) |",
  "| `updated_by` | UUID (FK) |",
  "| `deleted_at` | Timestamp | Nullable |",
  "**Scope Isolation.**",
  "**Required Indexes.**",
  "**Retention.**",
  "**DSAR Behavior.**",
  "**Data Residency.**",
  "**Acceptance Criteria:**",
  "#### 4.3.8.1 Scenario Parameters JSON Schema (V4 canonical) {#4.3.8.1-scenario-parameters-json-schema}",
  "#### 4.3.8.2 Scenario Results JSON Schema (V4 canonical)",
  "### 4.3.9 Evaluation Scenario Parameters (Retired in V4) {#4.3.9-evaluation-scenario-parameters-retired-in-v4}",
  "No create, read, update, delete, API, UI, CI, webhook, or migration path may treat §4.3.9 as a live entity or schema",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.5",
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Scenario Modeling entity contract", REQUIRED_TOKENS);
    requireScenarioM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
