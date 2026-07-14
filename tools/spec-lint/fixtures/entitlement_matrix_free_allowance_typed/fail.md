### 34.8.5 Entitlement Matrix (Authoritative)

| capability_id | enforcement_mode | free_allowance_ops | Buyer plan minimum | Seller plan minimum | upgrade_surface |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `pre_scoring` | `hard` | one lifetime op | `buyer_free` | `not_applicable` | `wallet_exhaustion_cta` |
| `marketplace_search_filter` | `n_a_non_ai` | 10 | `business_starter` | `not_applicable` | `plan_tier_upgrade_cta` |

| `entitlement_matrix_free_allowance_typed` | data_model_contract | **`runtime_active`** (promoted fixture; detector `tools/spec-lint/gates/entitlement_matrix_free_allowance_typed.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | fixture row | M02.3 |
