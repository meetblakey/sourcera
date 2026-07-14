# Sourcera Fixture

### 4.4.16 HeatMapCell (Marketplace-Domain, Sourcera-Owned, Aggregated, Public) {#4.4.16-heatmapcell}

**Authoring Intent.** HeatMapCell carries fields.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | Standard |
| `category_id` | UUID | FK | Category |
| `seller_org_id` | UUID | FK | Forbidden |
| `vendor_opt_out_ref_id` | UUID | FK | Forbidden |

**New entity: HeatMapAggregationCard (Marketplace-Domain, Sourcera-Owned, Public).**

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | Standard |
| `seller_software_id` | UUID | FK | Forbidden |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

**Subset usage:** HeatMapCell uses only `draft`, `published`, `suppressed_by_opt_out`, `archived` (no editorial review gate).

## Appendix M {#appendix-m}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | override_path | runbook | pack |
|---|---|---|---|---|---|---|---|
| `heat_map_cell_field_allowlist_drift_detect` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | Detector at `tools/spec-lint/heat_map_cell_field_allowlist.ts`. The §4.4.16 HeatMapCell data-model table is the canonical field-allowlist. | `not_permitted_vendor_identity_free_aggregate_invariant` | runbook | M02.3 |
