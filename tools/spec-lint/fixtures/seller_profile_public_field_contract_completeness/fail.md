### 4.4.3 Seller Profile

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `industries` | Array[String] | Free-form strings | Missing controlled vocabulary authority. |
| `verification_tier` | Enum | local enum | Missing §4.4.21 authority. |

## 26.1 Seller Profile

This section owns seller profile fields directly.

| Public label | Canonical field / source | Notes |
|---|---|---|
| Public contact email | `contact_email` | Surface-only. |

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_profile_public_field_contract_completeness` | data_model_contract | spec_binding_pending_pack_m02_3 | pr_lint | fail | M02.3 |
