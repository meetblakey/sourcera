# 32. API {#32.-api}

### 32.5 Endpoints {#32.5-endpoints}

**Endpoint-detail authority.** This section is the API index. Full request / response / error / rate-limit / idempotency detail lives in the cited owning section for each family. D-V8.1-001 closes the remaining list-only gap by binding Workspaces, Requirements, Responses, Scores, Vendors / Target Accounts, Selection Reports, Traceability Matrices, Capability Declarations, Internal Comments, Audit Events, and Users & Organization to §32.10.9. Families with pre-existing detail remain single-sourced in their cited sections: Phase Advancement (§10.16), Vendor Disqualification (§25.3), Scenario Modeling (§32.10.3.E), TCO Modeling (§32.5.2), Workspace Analytics (§32.10.3.A), Policy Ingestion (§32.10.3.C), Template Library (§32.10.3.D), Phase 13 Integration Exports (§32.10.3.F), Intelligence (§32.5.1), Webhook Subscriptions (§31.11.3), Vendor Opt-Outs (§27.10.6), Marketplace Discovery (§27.11.7), Billing (§32.8), and Seller KB Export (§32.9).

GET    /v1/workspaces
POST   /v1/workspaces
GET    /v1/workspaces/{workspace\_id}/requirements
POST   /v1/workspaces/{workspace\_id}/requirements
GET    /v1/workspaces/{workspace\_id}/responses
POST   /v1/workspaces/{workspace\_id}/scores
GET    /v1/workspaces/{workspace\_id}/vendors
GET    /v1/workspaces/{workspace\_id}/reports
GET    /v1/workspaces/{workspace\_id}/traceability-matrices
GET    /v1/vendors/{vendor\_org\_id}/capabilities
GET    /v1/audit-events
GET    /v1/users/me

### 32.10.9 Core Buyer and Administration API Detail Pack {#32.10.9-core-buyer-and-administration-api-detail-pack}

**Scope.** This pack covers Workspaces, Requirements, Responses, Scores, Vendors / Target Accounts, Selection Reports, Traceability Matrices, Capability Declarations, Internal Comments alias binding, Audit Events, and Users & Organization.

| Contract axis | Requirement |
| :---- | :---- |
| Base URL | All paths are relative to §32.1 `https://api.sourcera.io/v1`; generated OpenAPI MUST NOT reintroduce an api-prefixed root. |
| Authorization | `Authorization: Bearer <api_token>` is required. The endpoint-local `Auth Scope` cell names the minimum Appendix J `api_token_scope` unless the endpoint is token self-introspection, in which case any active registered scope is sufficient. |
| Console scope | Buyer endpoints require `ApiToken.console_scope IN ('buyer','both')`; seller Capability Declaration endpoints require `ApiToken.console_scope IN ('seller','both')`; Audit Events may use the unified audit projection only for Org Owner, Org Admin, Billing Admin, or Ops-supported readers named in §4.6.1 / §6.7. |
| Pagination | List endpoints use the §32.3 cursor envelope, default, and maximum. No endpoint in this pack owns an inline pagination limit. |
| Idempotency | POST / PATCH / DELETE routes require `Idempotency-Key`. Same key + same body returns the original response; same key + different body returns HTTP 409 `idempotency_key_request_mismatch`. |
| Optimistic concurrency | PATCH and DELETE routes that mutate persistent customer rows require `expected_version` unless the owning specialized section defines a stricter state-machine transition. |
| Audit | Mutations write one §4.6.1 AuditEvent after validation and before commit. Read-only audit-event reads write an audit-of-audit row when cross-console or export authority is exercised per §4.6.1 / §6.7. |
| Residency / DSAR | Read and write routes enforce the parent Org / Workspace / Seller Org residency partition before response serialization. DSAR and retention behavior is inherited from the owning §4 entity plus §6.8 and §40.2. |

| Method | Path | Request schema | Response schema | Auth Scope | RBAC | Rate-Limit Class | Idempotency | Error set |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| GET | `/v1/workspaces` | `WorkspaceListQuery` | `WorkspaceListResponse` | `read:workspaces` | Org Owner / Org Admin / Workspace member visible in buyer console | `workspace_read` | N/A | `WorkspaceReadErrors` |
| POST | `/v1/workspaces` | `WorkspaceCreateRequest` | `WorkspaceMutationResponse` | `write:workspaces` | Org Owner / Org Admin / role with §5.11 Workspace create permission | `data_mutation` | Required | `WorkspaceWriteErrors` |
| DELETE | `/v1/workspaces/{workspace_id}` | `WorkspaceDeleteRequest` | `WorkspaceMutationResponse` | `admin:workspaces` | Org Owner / Org Admin; soft-delete only | `data_mutation` | Required | `WorkspaceWriteErrors` |
| GET | `/v1/workspaces/{workspace_id}/requirements` | `RequirementListQuery` | `RequirementListResponse` | `read:requirements` | Workspace member or scoped guest with requirement visibility | `workspace_read` | N/A | `RequirementReadErrors` |
| POST | `/v1/workspaces/{workspace_id}/requirements` | `RequirementWriteRequest` | `RequirementMutationResponse` | `write:requirements` | Workspace owner, Use Case Lead, or editor role per §12 | `data_mutation` | Required | `RequirementWriteErrors` |
| GET | `/v1/workspaces/{workspace_id}/responses` | `ResponseListQuery` | `ResponseListResponse` | `read:responses` | Buyer Workspace member; seller response bodies remain behind seller/bid APIs | `workspace_read` | N/A | `ResponseReadErrors` |
| POST | `/v1/workspaces/{workspace_id}/scores` | `ScoreWriteRequest` | `ScoreMutationResponse` | `write:scores` | Workspace owner, evaluation lead, or score editor | `data_mutation` | Required | `ScoreWriteErrors` |
| GET | `/v1/workspaces/{workspace_id}/vendors` | `TargetAccountListQuery` | `TargetAccountListResponse` | `read:workspaces` | Workspace member with vendor-list visibility | `workspace_read` | N/A | `TargetAccountReadErrors` |
| POST | `/v1/workspaces/{workspace_id}/reports` | `SelectionReportCreateRequest` | `SelectionReportMutationResponse` | `write:workspaces` | Workspace owner, evaluation lead, or approver per §10.12 / §10.13 | `data_mutation` | Required | `SelectionReportWriteErrors` |
| GET | `/v1/workspaces/{workspace_id}/traceability-matrices` | `TraceabilityMatrixListQuery` | `TraceabilityMatrixListResponse` | `read:requirements` | Workspace member with requirement visibility | `workspace_read` | N/A | `TraceabilityReadErrors` |
| GET | `/v1/vendors/{vendor_org_id}/capabilities` | `CapabilityDeclarationListQuery` | `CapabilityDeclarationListResponse` | `read:kb` | Seller Org Owner/Admin, seller marketing editor, marketplace publisher, or seller KB editor with declaration visibility | `standard_authenticated_per_org` | N/A | `CapabilityDeclarationReadErrors` |
| GET | `/v1/audit-events` | `AuditEventListQuery` | `AuditEventListResponse` | `export:audit_events` | Org Owner / Org Admin / Billing Admin; Ops support reads per §50 only | `audit_events_export` | N/A | `AuditEventReadErrors` |
| GET | `/v1/users/me` | None | `UserSelfResponse` | Any active Appendix J `api_token_scope` on the caller token | Token subject only | `standard_authenticated_per_org` | N/A | `IdentityReadErrors` |

**Response envelope shapes.** Read and mutation responses use §32.3 envelopes.

#### 32.10.9.I Acceptance criteria {#32.10.9.i-acceptance-criteria}

1. Every live §32.5 endpoint family MUST either cite a specialized owner section or appear in a §32.10.9 endpoint matrix with request schema, response schema, error set, auth scope, rate-limit class, idempotency behavior, and RBAC.
2. Generated OpenAPI / SDK references MUST fail build if any §32.5 route has method + path only and lacks an owning detail reference.
3. Mutating routes in §32.10.9 MUST reject missing `Idempotency-Key`; same-key / different-body replay MUST return HTTP 409 `idempotency_key_request_mismatch`.
4. PATCH / DELETE routes in §32.10.9 MUST enforce `expected_version` where the route changes a customer row and no stricter owning state-machine section applies.
5. List endpoints in §32.10.9 MUST use §32.3 cursor semantics and MUST NOT define a duplicate inline page-size limit.

#### M.5.68 v7.2.0-REM Phase 8.1 Core API Detail P1 addition (D-V8.1-001 closure) {#m-5-68-v72rem-phase-8-1-core-api-detail-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `core_api_endpoint_detail_completeness` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/core_api_endpoint_detail_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §32.5 ↔ §32.10.9 endpoint-detail completeness only; product OpenAPI generation, SDK generation, endpoint handlers, auth middleware, idempotency persistence, and API contract tests remain product-pack evidence) | pr_lint | Every live §32.5 route either cites a specialized owner section or appears in §32.10.9 with request schema, response schema, error set, auth scope, rate-limit class, idempotency behavior, and RBAC; method+path-only rows fail. | M02.3 |
