# 22 Seller KB {#22-seller-kb}

### 22.3.1 KB Entry Entity {#22.3.1-kb-entry-entity}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `review_cadence_days` | Integer | 1 ≤ x ≤ 730; default 90 | Drives §22.4.1 review-state transitions and §22.5 decay. |

### 22.4.1 Entry Lifecycle {#22.4.1-entry-lifecycle}

**Defaults.** The authoritative default and bounds for `review_cadence_days` live on the KBEntry field table in §22.3.1. Sellers may set per-entry cadence within that field's bounds; this lifecycle section consumes the field and does not own a second numeric default.

#### M.5.57 v7.2.0-REM Phase 5.2 KB / MCP P1 addition {#m-5-57-v72rem-phase-5-2-kb-mcp-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `kb_review_cadence_default_single_source` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/kb_review_cadence_default_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Singleton. | M02.3 |
