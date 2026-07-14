# Sourcera Master Spec Fixture

### 4.5.9 EvalStarter (Marketplace-Domain, Platform-Scoped, Ops-Managed Registry) {#4.5.9-eval-starter}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `recommended_longlist` | JSONB | Nullable | Seed vendor list. |

### 13.12.7 Surface — "What We Filled In For You" Callout {#13.12.7-surface-what-we-filled-in-for-you}

The Vendors row searches the Marketplace.

### 13.12.10 Acceptance Criteria {#13.12.10-acceptance-criteria}

The link routes to the Marketplace.

#### M.5.1 Fixture {#m-5-1-fixture}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `eval_starter_marketplace_category_mapping_present` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/eval_starter_marketplace_category_mapping_present.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Marketplace fallback category mapping is explicit. | M02.3 |
