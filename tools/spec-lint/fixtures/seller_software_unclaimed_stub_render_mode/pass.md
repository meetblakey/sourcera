### 4.4.9 SellerSoftware

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `public_render_mode` | Enum | Appendix J `seller_software_public_render_mode` | `unclaimed_stub`, `published_full`, `suppressed_placeholder`, `archived_gone` |

### 4.4.11 SoftwarePage

Unclaimed behavior: `unclaimed_stub` route rendering is produced from SellerSoftware, emits X-Robots-Tag: noindex, nofollow, is excluded from sitemaps, and MUST NOT serialize `pending_enrichment_draft_json`, KB fields, Capability Declaration evidence ids, seller contacts, or Schema.org `Product` payload.

### 26.8.1 SellerSoftware Lifecycle

Auto-created products use public_render_mode=unclaimed_stub. An unclaimed stub is not a published SoftwarePage, is excluded from sitemaps, and emits X-Robots-Tag: noindex, nofollow.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_software_unclaimed_stub_render_mode` | public_render_invariant | **`runtime_active`** (detector `tools/spec-lint/gates/seller_software_unclaimed_stub_render_mode.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
