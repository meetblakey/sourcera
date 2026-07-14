## 3.5 Optimistic Mutation Rollback Behavior {#3.5-optimistic-mutation-rollback-behavior}

**Default coverage.** Any data-mutating §3.3 feature not named in the table inherits the default. This excludes read-only, navigation, and purely local presentation changes.

## 3.7 Loading / Empty / Error State Catalog {#3.7-loading-empty-error-state-catalog}

**Plan-gate CTA invariant.** Use Request Upgrade from Billing Admin.

#### 3.7.6.2 Matrix Surfaces {#3.7.6.2-matrix-surfaces}

Secondary CTA: `Request Upgrade from Billing Admin`

#### 3.7.6.6 Knowledge Base Surfaces {#3.7.6.6-knowledge-base-surfaces}

Secondary CTA: `Request Upgrade from Billing Admin`

## 3.10 Bulk Action Toolbar {#3.10-bulk-action-toolbar}

bulk_action_all_in_filter_cap; bulk_action_request_row_list_cap; bulk_action_chunk_size_max. Offer Switch to all-in-filter. The dispatch MUST NOT silently elevate. A selection exceeds the request-row-list cap.

# 39. Object Size Constraints {#39.-object-size-constraints}

bulk_action_chunk_size_max; bulk_action_request_row_list_cap; bulk_action_all_in_filter_cap.

### 50.17.4 Token Drift Check {#50.17.4-token-drift-check}

plan_gate_row_dual_cta_coverage

| `section3_plan_gate_bulk_selection_rollback_consistency` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/section3_plan_gate_bulk_selection_rollback_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
