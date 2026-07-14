# Sourcera Fixture

## 4.4 Data Model

### 4.4.8 Vendor Opt-Out Record {#4.4.8-vendor-opt-out-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `scope_kind` | Enum | See Appendix J `vendor_opt_out_scope_kind`: `global`, `category`, `software`, `page_type`, `specific_page` | Controls suppression breadth |
| `scope_ref_type` | Enum | See Appendix J `vendor_opt_out_scope_ref_type`: `marketplace_category`, `seller_software`, `category_page`, `comparison_page`, `guide_page`, `market_intelligence_report`, `heat_map_cell`, `public_selection_report`, `null` | Missing values |
| `page_type_filter` | Enum | Nullable; see Appendix J `vendor_opt_out_page_type_filter`: `comparison_page`, `category_page`, `guide_page`, `market_intelligence_report`, `heat_map_cell`, `public_selection_report`, `seller_org_page`, `software_page` | Required |
| `reason_code` | Enum | See Appendix J `vendor_opt_out_reason_code`: `legal`, `competitive`, `accuracy_dispute`, `gdpr_request`, `ops_imposed`, `other` | Drives review |
| `ops_review_status` | Enum | See Appendix J `vendor_opt_out_ops_review_status`: `auto_honored`, `pending_ops_review`, `approved`, `rejected`, `revoked` | Review state |
| `retro_backfill_status` | Enum | See Appendix J `vendor_opt_out_retro_backfill_status`: `pending`, `in_progress`, `complete`, `failed`, `not_applicable` | Sweep state |

This live text adds `scope_kind=not_applicable` and `scope_ref_type=heat_map_cell_aggregate`.
This live text adds `reason_code ∈ {legal, ops_override}`.

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### `vendor_opt_out_scope_kind` (Vendor Opt-Out Scope Kind)

`global`, `category`, `software`, `page_type`, `specific_page`, `not_applicable`

### `vendor_opt_out_scope_ref_type` (Vendor Opt-Out Scope Ref Type)

`marketplace_category`, `seller_software`, `category_page`, `comparison_page`, `guide_page`, `market_intelligence_report`, `heat_map_cell`, `public_selection_report`, `null`

### `vendor_opt_out_page_type_filter` (Vendor Opt-Out Page Type Filter)

`comparison_page`, `category_page`, `guide_page`, `market_intelligence_report`, `heat_map_cell`, `public_selection_report`, `seller_org_page`, `software_page`

### `vendor_opt_out_reason_code` (Vendor Opt-Out Reason Code)

`legal`, `competitive`, `accuracy_dispute`, `gdpr_request`, `ops_imposed`, `other`

### `vendor_opt_out_ops_review_status` (Vendor Opt-Out Ops Review Status)

`auto_honored`, `pending_ops_review`, `approved`, `rejected`, `revoked`

### `vendor_opt_out_retro_backfill_status` (Vendor Opt-Out Retro Backfill Status)

`pending`, `in_progress`, `complete`, `failed`, `not_applicable`

## Appendix M {#appendix-m}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | override_path | runbook | pack |
|---|---|---|---|---|---|---|---|
| `enum_bound_no_inline_sentinel_admission` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint + nightly_cron | Detector at `tools/spec-lint/enum_bound_sentinel.ts`. Inline references to non-registered values fail. | `not_permitted_closed_enum_integrity` | runbook | M02.3 |
