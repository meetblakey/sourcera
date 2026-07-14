### 34.8.5 Entitlement Matrix (Authoritative)

| capability_id | enforcement_mode | free_allowance_ops | Buyer plan minimum | Seller plan minimum | upgrade_surface |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `tco_modeling` | `n_a_non_ai` | `not_applicable` | `buyer_free` | `not_applicable` | `not_applicable` |
| `crm_sync` | `n_a_non_ai` | `not_applicable` | `not_applicable` | `seller_growth` | `crm_sync_upgrade_cta` |

## 5.11 Feature Access Matrix (Comprehensive)

| §5.11 row family | Buyer plan authority | Seller plan authority | Source row |
| :---- | :---- | :---- | :---- |
| TCO Modeling deterministic calculator | `buyer_free` | n/a | §15; §34.8.5 `tco_modeling`; non-AIOperation branch |
| CRM Sync | n/a | §34.1.2 cell **CRM Sync (Salesforce, HubSpot, Dynamics, Pipedrive)** | §31.9; §34.1.2; seller_growth |

| `entitlement_matrix_feature_access_mirror_consistency` | content_consistency | **`runtime_active`** (promoted fixture; detector `tools/spec-lint/gates/entitlement_matrix_feature_access_mirror_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | fixture row | M02.3 |
