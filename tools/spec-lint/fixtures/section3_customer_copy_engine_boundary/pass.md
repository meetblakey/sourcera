## 3.7 Loading / Empty / Error State Catalog {#3.7-loading-empty-error-state-catalog}

### 3.7.6 Per-Surface Catalog {#3.7.6-per-surface-catalog}

| State | Treatment |
| :---- | :---- |
| Empty (no vendors in Scoring Matrix) | Buyer Team: enabled at `pipeline_stage_id >= 4`. Buyer Solo: enabled when the compressed step is `Define`, `Score`, or `Decide`. Tooltip: "Vendor curation becomes available when vendor discovery begins." "Vendor curation becomes available in Define." |
| Error (plan-gate, KB over byte quota) | "You have reached your Knowledge Base size limit. Upgrade to continue indexing." §34.1.2 / §5.11 |

### 3.7.11 Acceptance Criteria {#3.7.11-loading-empty-error-acceptance-criteria}

`scoring_matrix_vendor_cta_surface_boundary` and `kb_quota_error_copy_no_plan_label` pass.

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `section3_customer_copy_engine_boundary` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/section3_customer_copy_engine_boundary.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | Section 3 customer copy remains canonical. | M02.3 |
