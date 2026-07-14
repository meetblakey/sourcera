### 14.8.1 Scenario Limits

Scenario-object caps are object-size / plan-limit controls mirrored in §39 row `EvaluationScenario.active_per_workspace`; wallet ceilings and free-allowance behavior are authoritative in §34.1 / §4.8.7 and MUST NOT be inferred from the object caps below.

| Buyer plan tier | Max Scenario Objects per Workspace | Report Integration |
| :---- | :---- | :---- |
| `buyer_free` | 5 | |
| `buyer_solo` | 5 | |
| `business_starter` | 10 | |
| `business_growth` | 25 | |
| `business_scale` | 50 | |
| `buyer_enterprise` | Unlimited | |

Create requests MUST enforce §14.8.1 / §39 `EvaluationScenario.active_per_workspace` caps for every Buyer tier, including `buyer_solo`.

| Entity | Field | Limit | Notes |
| :---- | :---- | :---- | :---- |
| EvaluationScenario | active_per_workspace | Per §14.8.1 | Counted where `deleted_at IS NULL` and excluding the implicit Original Scoring scenario |

| `scenario_modeling_plan_cap_single_source` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/scenario_modeling_plan_cap_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | contract | M02.3 |
