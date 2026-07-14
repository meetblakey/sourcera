# 22 Seller KB {#22-seller-kb}

### 22.3.1 KB Entry Entity {#22.3.1-kb-entry-entity}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `review_cadence_days` | Integer | 1 ≤ x ≤ 730; default 90 | Drives §22.4.1 review-state transitions and §22.5 decay. |

### 22.4.1 Entry Lifecycle {#22.4.1-entry-lifecycle}

The lifecycle default is 90 days here too.

#### M.5.57 v7.2.0-REM Phase 5.2 KB / MCP P1 addition {#m-5-57-v72rem-phase-5-2-kb-mcp-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `kb_review_cadence_default_single_source` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint | Singleton. | M02.3 |
