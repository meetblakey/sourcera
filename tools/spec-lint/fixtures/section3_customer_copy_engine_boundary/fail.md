## 3.7 Loading / Empty / Error State Catalog {#3.7-loading-empty-error-state-catalog}

### 3.7.6 Per-Surface Catalog {#3.7.6-per-surface-catalog}

| State | Treatment |
| :---- | :---- |
| Empty (no vendors in Scoring Matrix) | Primary CTA: `Add Vendors` (if Phase ≥ 3). If Phase < 3: tooltip "Vendor curation begins in Phase 3." |
| Error (plan-gate, KB over byte quota) | "You've reached the Seller Starter KB size limit. Upgrade to Growth to continue indexing." |

### 3.7.11 Acceptance Criteria {#3.7.11-loading-empty-error-acceptance-criteria}

No acceptance criteria exist.

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `section3_customer_copy_engine_boundary` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | incomplete | M02.3 |
