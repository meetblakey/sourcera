### 32.10.3.E Scenario Modeling Endpoints {#32.10.3.e-scenario-modeling-endpoints}

**Endpoint matrix.**

| Method | Path | Auth Scope | RBAC | Rate-Limit Class | Idempotency |
| :---- | :---- | :---- | :---- | :---- | :---- |
| GET | `/v1/workspaces/{workspace_id}/scenarios` | | | | |
| GET | `/v1/workspaces/{workspace_id}/scenarios/{scenario_id}` | | | | |
| POST | `/v1/workspaces/{workspace_id}/scenarios/{scenario_id}/recalculate` | | | | |
| POST | `/v1/workspaces/{workspace_id}/scenarios/{scenario_id}/sensitivity` | | | | |
| POST | `/v1/workspaces/{workspace_id}/scenarios/compare` | | | | |
| POST | `/v1/workspaces/{workspace_id}/scenarios/export` | | | | |

**Request body - create.**
**Request body - update.**
**Request body - recalculate.**
**Request body - sensitivity.**
**Request body - compare.**
**Request body - export.**
**Response object fields.**
**Endpoint-specific side effects.**
**Errors.**
`scenario_limit_exceeded` `scenario_concurrent_edit_conflict` `scenario_phase_locked` `scenario_residency_mismatch` `wallet_hard_capped` `scenario_export_size_exceeded` `scenario_dependency_unavailable`
`analytics_export` `EvaluationScenario.export_csv_uncompressed_bytes`
**Acceptance criteria.**
State-mutating Scenario endpoints MUST require `Idempotency-Key`.
Every endpoint-declared error code MUST be registered in Appendix I.

| `scenario_modeling_endpoint_contract_completeness` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/scenario_modeling_endpoint_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | contract | M02.3 |
