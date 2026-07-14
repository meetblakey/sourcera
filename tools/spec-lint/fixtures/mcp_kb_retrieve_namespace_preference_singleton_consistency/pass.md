# Fixture

#### 22.8.4.1 `kb_retrieve` {#22.8.4.1-kb_retrieve}

```json
{
  "properties": {
    "namespace_preference": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Ordered list of namespace IDs. First is highest priority. Typically [software_kb_id, org_kb_id]. The server clamps to the allowed_namespace_ids from the vault JWT. Length bounds are canonical in §39 row mcp_kb_retrieve_namespace_preference_length.",
      "minItems": 1,
      "maxItems": 10
    }
  },
  "required": ["query", "namespace_preference"]
}
```

### 22.9.1 Retrieval Pipeline {#22.9.1-retrieval-pipeline}

| Stage | Invariant | Rejection / Fallback |
|---|---|---|
| 1. Normalization & Expansion | `query` length binds to §39 row `mcp_kb_retrieve_query`; `namespace_preference[]` length binds to §39 row `mcp_kb_retrieve_namespace_preference_length`; each filter value is a registered Appendix J enum value. | HTTP 422 `bad_request` with `details.invalid_field` populated. |
| 2. Metadata Pre-Filter | `allowed_namespace_ids[]` derived from JWT (§22.8.3) intersected with schema-non-empty `namespace_preference[]`; an empty intersection means no authorized namespace overlaps the requested set and returns `top_k = []` with `retrieval_metadata.no_authorized_namespace=true`. | Never falls back to a wider scope; the firewall is unconditional. |

## 39 Object Size Constraints

| Object | Field | Limit | Notes |
|---|---|---|---|
| MCP `kb_retrieve` | `namespace_preference.length` (`mcp_kb_retrieve_namespace_preference_length`) | 1–10 entries | Source for §22.8.4.1 input schema and §22.9.1 Stage 1 validation. Empty arrays reject before retrieval; §22.9.1 Stage 2 empty-intersection handling only covers non-overlap between a non-empty requested set and JWT-authorized namespaces. |

#### M.5.31 v7.2.0-REM Phase KB18 Cite/Retrieve Canonicality P1 addition {#m-5-31-v72rem-phase-kb18-cite-retrieve-canonicality-p1-addition}

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `mcp_kb_retrieve_namespace_preference_singleton_consistency` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/mcp_kb_retrieve_namespace_preference_singleton_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §39 row `mcp_kb_retrieve_namespace_preference_length` is the sole canonical home for `kb_retrieve.namespace_preference[]` bounds. §22.9.1 Stage 2 MUST describe empty intersection as non-overlap between schema-non-empty requested namespaces and JWT-authorized namespaces. | `not_permitted_numerical_singleton_drift` | runbook | M02.3 |
