# Sourcera Master Spec Fixture

### 4.5.9 EvalStarter (Marketplace-Domain, Platform-Scoped, Ops-Managed Registry) {#4.5.9-eval-starter}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `seed_schema_version` | Integer | Required | Schema version. |

### `eval_starter_use_case_seed_schema_version` (§4.5.9 EvalStarter)

Integer; current value `1`.

### `eval_starter_requirement_seed_schema_version` (§4.5.9 EvalStarter)

Integer; current value `1`.

#### M.5.1 Fixture {#m-5-1-fixture}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `eval_starter_seed_schema_currency` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/eval_starter_seed_schema_currency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Active EvalStarter rows match current schema. | M02.3 |
