# Fixture

#### 22.8.4.1 `kb_retrieve` {#22.8.4.1-kb_retrieve}

```json
{
  "properties": {
    "query": {
      "type": "string",
      "description": "Short query.",
      "minLength": 0,
      "maxLength": 5000
    }
  }
}
```

### 22.9.1 Retrieval Pipeline {#22.9.1-retrieval-pipeline}

| Stage | Invariant | Rejection / Fallback |
|---|---|---|
| 1. Normalization & Expansion | Query is normalized before retrieval. | HTTP 422. |

#### M.5.31 v7.2.0-REM Phase KB18 Cite/Retrieve Canonicality P1 addition {#m-5-31-v72rem-phase-kb18-cite-retrieve-canonicality-p1-addition}

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `mcp_kb_retrieve_query_singleton_consistency` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Query bounds are local. | `not_permitted_numerical_singleton_drift` | runbook | M02.3 |
