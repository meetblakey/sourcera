# Sourcera Fixture

### 4.4.16 HeatMapCell (Marketplace-Domain, Sourcera-Owned, Aggregated, Public) {#4.4.16-heatmapcell}

**Authoring Intent.** HeatMapCell carries NO `vendor_opt_out_honored_at` field and the Opt-Out Registry (§4.4.8) is NOT probed at render time, NOT stamped at refresh time, and NOT referenced by FK from this entity.

**Vendor-Identity-Free Aggregate Invariant.** The §4.4.8 `vendor_opt_out_scope_kind` Appendix-J enum closed-set MUST contain exactly the five values `global | category | software | page_type | specific_page` and MUST NOT contain `not_applicable`, `n/a`, `none`, or any other sentinel value.

#### Marketplace Dimension Pair Contract & Legacy Migration {#4.4.16-marketplace-dimension-pair-contract}

`us` / `US` is **ambiguous** and is quarantined.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | Standard |
| `category_id` | UUID | FK | Category |
| `region_kind` | Enum | country or macro | Region kind |
| `region_id` | String | kind-bound | Region value |
| `industry_kind` | Enum | NAICS or taxonomy | Industry kind |
| `industry_id` | String | kind-bound | Industry value |
| `company_size_band` | Enum | band | Size |
| `period_start` | Date | ISO | Start |
| `period_end` | Date | ISO | End |
| `signal_count` | Integer | >= 0 | Count |
| `k_anon_floor` | Integer | source row | Floor |
| `k_anon_satisfied` | Boolean | computed | Floor satisfied |
| `demand_index` | Decimal | nullable | Demand |
| `demand_trend` | Enum | trend | Demand trend |
| `prior_period_signal_count` | Integer | nullable | Prior |
| `contributing_source_hash` | String | SHA-256 | Redacted source hash |
| `last_refreshed_at` | Timestamp | UTC | Refresh |
| `refresh_cadence_days` | Integer | 7-60 | Cadence |
| `next_scheduled_refresh_at` | Timestamp | UTC | Next |
| `publication_status` | Enum | draft, published, archived | HeatMapCell subset |
| `residency_region_scope` | Enum | residency scope | Region |
| `created_at` | Timestamp | UTC | Standard |
| `updated_at` | Timestamp | UTC | Standard |
| `deleted_at` | Timestamp | nullable | Soft delete |

**New entity: HeatMapAggregationCard (Marketplace-Domain, Sourcera-Owned, Public).**

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | Standard |
| `slot_kind` | Enum | required | Slot |
| `included_heat_map_cell_ids` | Array[UUID] | 1-20 | Cells |
| `card_title` | String | required | Display |

**Vendor-Identity-Free Aggregate Invariant.** HeatMapAggregationCard aggregates HeatMapCell rows; the card surface renders NO vendor names, NO Seller Org references, and NO SellerSoftware references at any depth. The field is removed; the entity inherits the §4.4.16 Vendor-Identity-Free Aggregate Invariant and does not probe the Opt-Out Registry at render time.

### 4.4.18 SellerSignal (Platform-Scoped, Aggregated, Seller-Visible) {#4.4.18-sellersignal}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | Standard |
| `region_kind` | Enum | kind | §4.4.16 pair contract applies |
| `region_id` | String | id | Region |
| `industry_kind` | Enum | kind | Industry |
| `industry_id` | String | id | Industry |

(industry_kind, industry_id, region_kind, region_id, company_size_band, timeline_band, intent_strength)

region_kind='country_iso'

### 27.9.3 SellerSignalDeliveryPreference {#27.9.3-sellersignaldeliverypreference}

`subscribed_region_dimensions`, `subscribed_industry_dimensions`, `marketplace_dimension_pair_invalid`

### 27.9.10 API Endpoints {#27.9.10-api-endpoints}

`region_kind=`, `region_id=`, `industry_kind=`, `industry_id=`, retired `*_code` filters are rejected

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

**Subset usage:** HeatMapCell uses only `draft`, `published`, `archived` (no editorial review gate).

`marketplace_region_kind`, `marketplace_macro_region`, `marketplace_industry_kind`

## Appendix M {#appendix-m}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | override_path | runbook | pack |
|---|---|---|---|---|---|---|---|
| `heat_map_cell_field_allowlist_drift_detect` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/heat_map_cell_field_allowlist_drift_detect.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Detector at `tools/spec-lint/gates/heat_map_cell_field_allowlist_drift_detect.ts`. The §4.4.16 HeatMapCell data-model table is the canonical field-allowlist for the entity per the Vendor-Identity-Free Aggregate Invariant. D-2.2-060 / D-2.2-061. | `not_permitted_vendor_identity_free_aggregate_invariant` | runbook | M02.3 |
