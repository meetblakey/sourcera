### 4.4.9 SellerSoftware

Resolver modes are published and archived only.

### 4.4.10 SellerOrgPage

Opt-out archives the page.

### 4.5.6 Vendor Opt-Out Record

| Consumer | Redaction Behavior |
|---|---|
| SellerOrgPage (§4.4.10), SoftwarePage (§4.4.11) | Active opt-out returns HTTP 410. |

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `opt_out_http_response_single_source` | marketplace_redaction_invariant | spec_binding_pending_pack_m02_3 | pr_lint | fail | M02.3 |
