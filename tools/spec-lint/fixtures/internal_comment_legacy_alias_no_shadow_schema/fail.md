# 32. API {#32.-api}

### 32.5 Endpoints {#32.5-endpoints}

GET /v1/workspaces/{workspace_id}/comments

#### 32.10.9.G Internal Comment alias binding {#32.10.9.g-internal-comment-alias-binding}

| Legacy route | Canonical binding | Public reference behavior | Removal gate |
| :---- | :---- | :---- | :---- |
| `GET /v1/workspaces/{workspace_id}/comments` | `GET /v1/workspaces/{workspace_id}/internal-comment-threads` | Alias. | Later. |

#### M.5.68 v7.2.0-REM Phase 8.1 Core API Detail P1 addition (D-V8.1-001 closure) {#m-5-68-v72rem-phase-8-1-core-api-detail-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `internal_comment_legacy_alias_no_shadow_schema` | api_contract_completeness | spec_binding_pending_pack_m02_3 | pr_lint | Incomplete alias control. | M02.3 |
