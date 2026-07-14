### 34.8.5 Entitlement Matrix (Authoritative)

| capability_id | enforcement_mode | free_allowance_ops | Buyer plan minimum | Seller plan minimum | upgrade_surface |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `tco_modeling` | n/a (non-AI) | `not_applicable` | `buyer_free` | `not_applicable` | `not_applicable` |

### capability_enforcement_mode (§34.8)

`soft`, `hard`, `n_a_non_ai`, `n_a_free_forever`, `n_a_sourcera_owned`, `n_a_platform_marketing`, `n_a_platform_internal_aggregation`

| `entitlement_matrix_enforcement_mode_enum_bound` | enum_consistency | **`runtime_active`** (promoted fixture; detector `tools/spec-lint/gates/entitlement_matrix_enforcement_mode_enum_bound.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | fixture row | M02.3 |
