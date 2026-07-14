# Sourcera Master Spec Fixture

### 4.5.9 EvalStarter (Marketplace-Domain, Platform-Scoped, Ops-Managed Registry) {#4.5.9-eval-starter}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `use_cases` | JSONB | Required | Each entry has `requirement_indices`. |
| `requirements` | JSONB | Required | Seed Requirement set. |

### 13.12.4 Materialization & Plan-Tier Truncation {#13.12.4-materialization-and-plan-tier-truncation}

Each surviving seed Requirement is attached through `requirement_indices`.

#### M.5.1 Fixture {#m-5-1-fixture}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `eval_starter_seed_use_case_index_validity` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/eval_starter_seed_use_case_index_validity.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Requirement use-case indexes resolve in bounds. | M02.3 |
