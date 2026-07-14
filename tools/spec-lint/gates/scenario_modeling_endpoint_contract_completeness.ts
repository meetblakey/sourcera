/**
 * Gate: `scenario_modeling_endpoint_contract_completeness`
 *
 * Assertion: every Scenario Modeling operation resolves to a full §32.10.3.E
 * endpoint contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { requireDocTokens, requireSectionTokens, requireScenarioM5RuntimeActive } from "./scenario_modeling_gate_helpers.js";

const GATE_ID = "scenario_modeling_endpoint_contract_completeness";

const SECTION_TOKENS = [
  "**Endpoint matrix.**",
  "Auth Scope | RBAC | Rate-Limit Class | Idempotency",
  "`/v1/workspaces/{workspace_id}/scenarios`",
  "`/v1/workspaces/{workspace_id}/scenarios/{scenario_id}`",
  "`/v1/workspaces/{workspace_id}/scenarios/{scenario_id}/recalculate`",
  "`/v1/workspaces/{workspace_id}/scenarios/{scenario_id}/sensitivity`",
  "`/v1/workspaces/{workspace_id}/scenarios/compare`",
  "`/v1/workspaces/{workspace_id}/scenarios/export`",
  "**Request body - create.**",
  "**Request body - update.**",
  "**Request body - recalculate.**",
  "**Request body - sensitivity.**",
  "**Request body - compare.**",
  "**Request body - export.**",
  "**Response object fields.**",
  "**Endpoint-specific side effects.**",
  "**Errors.**",
  "`scenario_limit_exceeded`",
  "`scenario_concurrent_edit_conflict`",
  "`scenario_phase_locked`",
  "`scenario_residency_mismatch`",
  "`wallet_hard_capped`",
  "`scenario_export_size_exceeded`",
  "`scenario_dependency_unavailable`",
  "`analytics_export`",
  "`EvaluationScenario.export_csv_uncompressed_bytes`",
  "**Acceptance criteria.**",
  "State-mutating Scenario endpoints MUST require `Idempotency-Key`",
  "Every endpoint-declared error code MUST be registered in Appendix I",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.5",
  rowClass: "api_contract_completeness",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Scenario Modeling endpoint heading", [
      "### 32.10.3.E Scenario Modeling Endpoints {#32.10.3.e-scenario-modeling-endpoints}",
    ]);
    requireSectionTokens(
      findings,
      ctx.masterSpec,
      "32.10.3.e-scenario-modeling-endpoints",
      "§32.10.3.E Scenario Modeling endpoints",
      SECTION_TOKENS,
    );
    requireScenarioM5RuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
