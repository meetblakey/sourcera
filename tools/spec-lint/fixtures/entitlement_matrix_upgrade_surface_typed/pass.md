### 34.8.5 Entitlement Matrix (Authoritative)

| capability_id | enforcement_mode | free_allowance_ops | Buyer plan minimum | Seller plan minimum | upgrade_surface |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `pre_scoring` | `hard` | 10 | `buyer_free` | `not_applicable` | `wallet_exhaustion_cta` |
| `tco_modeling` | `n_a_non_ai` | `not_applicable` | `buyer_free` | `not_applicable` | `not_applicable` |

**CTA Copy Registry.** `upgrade_surface` is a routing enum, not copy.

| `upgrade_surface` | `entitlement_cta_copy_id` | Notes |
| :---- | :---- | :---- |
| `wallet_exhaustion_cta` | `entitlement.wallet_exhaustion.default` | Wallet exhausted. |

### entitlement_upgrade_surface (§34.8.5)

`wallet_exhaustion_cta`, `plan_tier_upgrade_cta`, `not_applicable`

| `entitlement_matrix_upgrade_surface_typed` | enum_consistency | **`runtime_active`** (promoted fixture; detector `tools/spec-lint/gates/entitlement_matrix_upgrade_surface_typed.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | fixture row | M02.3 |
