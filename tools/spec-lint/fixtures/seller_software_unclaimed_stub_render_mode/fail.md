### 4.4.9 SellerSoftware

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `public_render_mode` | Enum | local | draft |

### 4.4.11 SoftwarePage

Unclaimed pages may publish Schema.org.

### 26.8.1 SellerSoftware Lifecycle

Auto-created products publish a regular SoftwarePage.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_software_unclaimed_stub_render_mode` | public_render_invariant | spec_binding_pending_pack_m02_3 | pr_lint | fail | M02.3 |
