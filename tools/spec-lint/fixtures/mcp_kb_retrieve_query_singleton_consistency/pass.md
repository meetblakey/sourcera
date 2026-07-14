# Fixture

#### 22.8.4.1 `kb_retrieve` {#22.8.4.1-kb_retrieve}

```json
{
  "properties": {
    "query": {
      "type": "string",
      "description": "The requirement text or sub-question to retrieve evidence for. Should be the rewritten, expanded query, not the original raw requirement. Length bounds are canonical in §39 row mcp_kb_retrieve_query.",
      "minLength": 1,
      "maxLength": 2000
    }
  }
}
```

### 22.9.1 Retrieval Pipeline {#22.9.1-retrieval-pipeline}

| Stage | Invariant | Rejection / Fallback |
|---|---|---|
| 1. Normalization & Expansion | `query` length binds to §39 row `mcp_kb_retrieve_query`; `namespace_preference[]` length binds to §39 row `mcp_kb_retrieve_namespace_preference_length`; each filter value is a registered Appendix J enum value. | HTTP 422 `bad_request` with `details.invalid_field` populated. |

## 39 Object Size Constraints

| Object | Field | Limit | Notes |
|---|---|---|---|
| MCP `kb_retrieve` | `query` (`mcp_kb_retrieve_query`) | 1–2,000 chars | Source for §22.8.4.1 input schema and §22.9.1 Stage 1 validation. Calls outside bounds reject before retrieval with HTTP 422 `bad_request` and `details.invalid_field='query'`. |

#### M.5.31 v7.2.0-REM Phase KB18 Cite/Retrieve Canonicality P1 addition {#m-5-31-v72rem-phase-kb18-cite-retrieve-canonicality-p1-addition}

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `mcp_kb_retrieve_query_singleton_consistency` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/mcp_kb_retrieve_query_singleton_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §39 row `mcp_kb_retrieve_query` is the sole canonical home for `kb_retrieve.query` bounds. §22.8.4.1 input schema and §22.9.1 Stage 1 MUST bind to that row. | `not_permitted_numerical_singleton_drift` | runbook | M02.3 |
