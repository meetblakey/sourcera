# 32. API {#32.-api}

### 32.4.5 Rate-Limit Class Registry {#32.4.5-rate-limit-class-registry}

| Class ID | Applies to | Scope | Soft limit | Hard limit | Burst / concurrency | Error code | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `standard_authenticated_per_org` | Default authenticated API class unless an endpoint declares another class | Org | §39.1 `standard_authenticated_per_org` soft limit | §39.1 `standard_authenticated_per_org` hard limit | §39.1 `standard_authenticated_per_org` burst / concurrency | `rate_limit_exceeded` | Also subject to the canonical-plan monthly API-call quotas in §32.4. |
| `data_mutation` | High-volume workspace data mutation endpoints | Org + Workspace | 60 requests/minute | 60 requests/minute hard | N/A | `rate_limited` | Used by §4 / §11 mutation flows. |
| `workspace_read` | Workspace read endpoints | Org | Standard class limits | Standard class limits | Standard class burst | `rate_limit_exceeded` | Registered as a named read class so workspace endpoints do not need to restate the default. |
| `audit_events_export` | Audit-event export initiation and polling | Org | 5 exports/hour | 10 exports/hour | 5 exports/hour burst | `rate_limit_exceeded` | Presigned download URL constraints are handled by §33.1.2. |

### 32.10.9 Core Buyer and Administration API Detail Pack {#32.10.9-core-buyer-and-administration-api-detail-pack}

#### 32.10.9.C Core buyer error sets {#32.10.9.c-core-buyer-error-sets}

| Error set | Codes |
| :---- | :---- |
| `WorkspaceReadErrors` | `invalid_workspace_id`, `workspace_not_found`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |
| `WorkspaceWriteErrors` | `invalid_workspace_id`, `workspace_not_found`, `invalid_use_case_id`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `bad_request`, `rate_limit_exceeded` |
| `ResponseReadErrors` | `invalid_workspace_id`, `invalid_response_id`, `invalid_requirement_id`, `invalid_target_account_id`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |
| `ScoreWriteErrors` | `invalid_workspace_id`, `invalid_score_id`, `invalid_requirement_id`, `invalid_target_account_id`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `bad_request`, `rate_limit_exceeded` |
| `SelectionReportWriteErrors` | `invalid_workspace_id`, `invalid_report_id`, `selection_record_not_finalized`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `bad_request`, `rate_limit_exceeded` |
| `TraceabilityReadErrors` | `invalid_workspace_id`, `invalid_matrix_id`, `invalid_requirement_id`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |
| `CapabilityDeclarationWriteErrors` | `invalid_capability_id`, `capability_declaration_taxonomy_violation`, `token_scope_insufficient`, `idempotency_key_request_mismatch`, `bad_request`, `rate_limit_exceeded` |
| `AuditEventReadErrors` | `audit_event_cross_org_access`, `audit_event_direct_write_forbidden`, `audit_event_immutable`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |
| `IdentityReadErrors` | `unauthenticated`, `token_scope_insufficient`, `not_found`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `rate_limit_exceeded` |

#### 32.10.9.I Acceptance criteria {#32.10.9.i-acceptance-criteria}

7. No Auth Scope in §32.10.9 may be absent from Appendix J `api_token_scope`, and no Rate-Limit Class may be absent from §32.4.5 / Appendix J `api_rate_limit_class`.

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

`invalid_workspace_id`, `workspace_not_found`, `invalid_requirement_id`, `invalid_response_id`, `invalid_score_id`, `invalid_target_account_id`, `invalid_vendor_id`, `invalid_capability_id`, `invalid_report_id`, `invalid_matrix_id`, `invalid_comment_id`, `invalid_use_case_id`, `token_scope_insufficient`, `query_unsupported_filter_combination`, `pagination_cursor_expired`, `idempotency_key_request_mismatch`, `bad_request`, `rate_limit_exceeded`, `selection_record_not_finalized`, `capability_declaration_taxonomy_violation`, `audit_event_cross_org_access`, `audit_event_direct_write_forbidden`, `audit_event_immutable`, `unauthenticated`, `not_found`

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

`read:workspaces`, `write:workspaces`, `admin:workspaces`, `read:requirements`, `write:requirements`, `read:responses`, `write:responses`, `read:scores`, `write:scores`, `read:kb`, `write:kb`, `export:audit_events`, `admin:ops_compliance`

`standard_authenticated_per_org`, `public_pricing_unauth`, `marketplace_public_unauth`, `dsar_subject_request`, `data_mutation`, `workspace_read`, `ai_invocation`, `internal_comment_api`, `kb_export_request`, `kb_export_poll`, `audit_events_export`

#### M.5.68 v7.2.0-REM Phase 8.1 Core API Detail P1 addition (D-V8.1-001 closure) {#m-5-68-v72rem-phase-8-1-core-api-detail-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `core_api_error_code_registration_consistency` | catalog_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/core_api_error_code_registration_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §32.10.9 error/scope/rate-limit registration consistency only; product error mappers, auth-scope middleware, rate-limit middleware, generated OpenAPI schemas, and runtime API tests remain product-pack evidence) | pr_lint | Every error code referenced by §32.10.9 error sets resolves to Appendix I, and every Auth Scope / Rate-Limit Class token in §32.10.9 resolves to Appendix J / §32.4.5. | M02.3 |
