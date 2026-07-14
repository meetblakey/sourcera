### 4.5.10 MarketplaceMatchFeatureRegistry {#4.5.10-marketplace-match-feature-registry}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | ok |
| `org_id` | UUID | nullable | ok |
| `console` | Enum | ops | ok |
| `feature_id` | String | unique | ok |
| `registry_version` | Integer | >= 1 | ok |
| `display_name` | String | required | ok |
| `feature_type` | Enum | Appendix J | ok |
| `source_entity` | String | required | ok |
| `freshness_requirement` | String | required | ok |
| `weight_mode` | Enum | Appendix J | ok |
| `null_handling` | String | required | ok |
| `state` | Enum | Appendix J | ok |
| `introduced_model_version_id` | UUID | nullable | ok |
| `deprecated_model_version_id` | UUID | nullable | ok |
| `created_at` | Timestamp | immutable | ok |
| `updated_at` | Timestamp | auto | ok |
| `created_by` | UUID | Ops User | ok |
| `updated_by` | UUID | Ops User | ok |
| `deleted_at` | Timestamp | nullable | ok |

**Indexes.** Present.
**Scope isolation, retention, DSAR, and residency.** Present.
**Failure Modes Addressed.** Present.
**Acceptance Criteria.** Present.

### 4.5.11 MarketplaceMatchScoreModelVersion {#4.5.11-marketplace-match-score-model-version}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | ok |
| `org_id` | UUID | nullable | ok |
| `console` | Enum | ops | ok |
| `version_label` | String | required | ok |
| `state` | Enum | Appendix J | ok |
| `residency_scope` | Enum | Appendix J | ok |
| `feature_registry_version` | Integer | >= 1 | ok |
| `feature_registry_snapshot_json` | JSON | required | ok |
| `training_window_start` | Timestamp | nullable | ok |
| `training_window_end` | Timestamp | nullable | ok |
| `trained_at` | Timestamp | nullable | ok |
| `auc_roc` | Decimal | nullable | ok |
| `p_at_10` | Decimal | nullable | ok |
| `parity_metric_json` | JSON | nullable | ok |
| `is_published` | Boolean | derived | ok |
| `published_at` | Timestamp | nullable | ok |
| `deprecated_at` | Timestamp | nullable | ok |
| `retired_at` | Timestamp | nullable | ok |
| `rollback_of_version_id` | UUID | nullable | ok |
| `approved_by` | UUID | nullable | ok |
| `created_at` | Timestamp | immutable | ok |
| `updated_at` | Timestamp | auto | ok |
| `created_by` | UUID | Ops User | ok |
| `updated_by` | UUID | Ops User | ok |
| `deleted_at` | Timestamp | nullable | ok |

**Indexes.** Present.
**Scope isolation, retention, DSAR, and residency.** Present.
**State machine.** Present.
**Failure Modes Addressed.** Present.
**Acceptance Criteria.** Present.

### 4.5.12 MarketplaceMatchScoreSnapshot {#4.5.12-marketplace-match-score-snapshot}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | ok |
| `org_id` | UUID | required | ok |
| `console` | Enum | marketplace | ok |
| `trigger_class` | Enum | Appendix J | ok |
| `marketplace_listing_id` | UUID | nullable | ok |
| `eoi_record_id` | UUID | nullable | ok |
| `workspace_id` | UUID | nullable | ok |
| `buyer_org_id` | UUID | required | ok |
| `seller_org_id` | UUID | required | ok |
| `seller_software_id` | UUID | required | ok |
| `model_version_id` | UUID | required | ok |
| `model_version_label` | String | required | ok |
| `feature_registry_version` | Integer | >= 1 | ok |
| `feature_vector_hash` | String | sha256 | ok |
| `feature_vector_json` | JSON | nullable | ok |
| `score_numeric` | Integer | 0-100 | ok |
| `qualitative_label` | Enum | Appendix J | ok |
| `render_mode_at_serialization` | Enum | Appendix J | ok |
| `hard_gate_triggered` | Enum | nullable | ok |
| `computed_at` | Timestamp | immutable | ok |
| `data_residency_region` | Enum | Appendix J | ok |
| `created_at` | Timestamp | immutable | ok |
| `updated_at` | Timestamp | auto | ok |
| `created_by` | UUID | User or system | ok |
| `updated_by` | UUID | User or system | ok |
| `deleted_at` | Timestamp | nullable | ok |

**Indexes.** Present.
**Scope isolation, retention, DSAR, and residency.** Present.
**Failure Modes Addressed.** Present.
**Acceptance Criteria.** Present.

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `marketplace_match_score_entity_field_table_completeness` | data_model_contract | **`runtime_active`** (detector `tools/spec-lint/gates/marketplace_match_score_entity_field_table_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
