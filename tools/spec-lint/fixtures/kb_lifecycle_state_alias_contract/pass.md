# 22 Seller KB {#22-seller-kb}

### 22.3.1 KB Entry Entity {#22.3.1-kb-entry-entity}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `status` | Enum | See Appendix J `kb_entry_status` | Canonical persisted lifecycle / review-state field. State machine in Appendix L (`kb_entry_state_machine`); see §22.4.1. API payload aliases `review_state` and `lifecycle_state` are read/write projections of this field, not separate columns. |

#### M.5.57 v7.2.0-REM Phase 5.2 KB / MCP P1 addition {#m-5-57-v72rem-phase-5-2-kb-mcp-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `kb_lifecycle_state_alias_contract` | data_model_contract | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/kb_lifecycle_state_alias_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Alias. | M02.3 |
