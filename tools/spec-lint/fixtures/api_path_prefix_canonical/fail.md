# Fixture

## 32.1 Overview {#32.1-overview}

REST API. Current version: `v1`. Base URL: `https://api.sourcera.io/api/v1`.

## 32.5 Endpoints {#32.5-endpoints}

GET /api/v1/workspaces/{workspace_id}

POST `/ops/taxonomy/nodes`

POST /.../publish

#### M.5.66 v7.2.0-REM Phase 8 API Path Prefix Canonicality P1 addition

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `api_path_prefix_canonical` | content_consistency | spec_binding_pending_pack_m02_3 | pr_lint + api_contract_test | Every live Master Spec endpoint path token MUST use the §32.1 `/v1` root. | M02.3 |
