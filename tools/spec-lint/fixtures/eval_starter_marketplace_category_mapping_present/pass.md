# Sourcera Master Spec Fixture

### 4.5.9 EvalStarter (Marketplace-Domain, Platform-Scoped, Ops-Managed Registry) {#4.5.9-eval-starter}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `marketplace_category_slug` | String | Resolves to §4.5.4 Taxonomy Node `slug` where `kind=marketplace_category` | If null, the Vendors row falls back to generic `/marketplace` search. |

### 13.12.7 Surface — "What We Filled In For You" Callout {#13.12.7-surface-what-we-filled-in-for-you}

The Vendors row uses `EvalStarter.marketplace_category_slug` when present and falls back to generic `/marketplace` search with no vertical filter.

### 13.12.10 Acceptance Criteria {#13.12.10-acceptance-criteria}

The link routes by `EvalStarter.marketplace_category_slug`; generic `/marketplace` search with no vertical filter is required when absent.

#### M.5.1 Fixture {#m-5-1-fixture}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `eval_starter_marketplace_category_mapping_present` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/eval_starter_marketplace_category_mapping_present.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Marketplace fallback category mapping is explicit. | M02.3 |
