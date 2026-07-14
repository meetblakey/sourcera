# 12. Policy-Powered Requirement Generation {#12.-policy-powered-requirement-generation}

## 12.9 Acceptance Criteria {#12.9-acceptance-criteria}

§32.10.3.C endpoints MUST provide auth scope, RBAC, rate-limit class, request/response schema, error codes, idempotency, pagination where applicable, and examples.

# 32. APIs {#32.-apis}

## 32.5 Endpoints {#32.5-endpoints}

### Policy Ingestion

GET    /v1/workspaces/{workspace\_id}/policy-ingestions
POST   /v1/workspaces/{workspace\_id}/policy-ingestions
GET    /v1/workspaces/{workspace\_id}/policy-ingestions/{job\_id}
POST   /v1/workspaces/{workspace\_id}/policy-ingestions/{job\_id}/framework-confirmations
POST   /v1/workspaces/{workspace\_id}/policy-ingestions/{job\_id}/cancel
GET    /v1/workspaces/{workspace\_id}/policy-ingestions/{job\_id}/controls
POST   /v1/workspaces/{workspace\_id}/policy-ingestions/{job\_id}/dedup-resolutions
GET    /v1/workspaces/{workspace\_id}/policy-ingestions/{job\_id}/amendments
POST   /v1/workspaces/{workspace\_id}/policy-ingestions/{job\_id}/publish

### 32.10.3.C Policy Ingestion Endpoints {#32.10.3.c-policy-ingestion-endpoints}

| Method | Path | Auth Scope | RBAC / plan gate | Rate-Limit Class | Idempotency |
|---|---|---|---|---|---|
| GET | `/v1/workspaces/{workspace_id}/policy-ingestions` | `read:workspaces` | §5.8 roles | `workspace_read` | N/A |
| POST | `/v1/workspaces/{workspace_id}/policy-ingestions` | `write:workspaces` | §5.8 roles; §34.1.1 Policy Ingestion; §34.8.5 `policy_parsing` | `ai_invocation` plus upload sublimits | REQUIRED |
| GET | `/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}` | `read:workspaces` | §5.8 roles | `workspace_read` | N/A |
| POST | `/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/framework-confirmations` | `write:workspaces` | §5.8 roles | `data_mutation` | REQUIRED |
| POST | `/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/cancel` | `write:workspaces` | §5.8 roles | `data_mutation` | REQUIRED |
| GET | `/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/controls` | `read:workspaces` | §5.8 roles | `workspace_read` | N/A |
| POST | `/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/dedup-resolutions` | `write:workspaces` | §5.8 roles | `data_mutation` | REQUIRED |
| GET | `/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/amendments` | `read:workspaces` | §5.8 roles | `workspace_read` | N/A |
| POST | `/v1/workspaces/{workspace_id}/policy-ingestions/{job_id}/publish` | `write:workspaces` | §5.8 roles | `data_mutation` | REQUIRED |

**Console firewall.** Buyer-only.
**Create request.** `"data_residency_region": "us"`
**Create response (HTTP 202 Accepted).** Response.
**Framework confirmation request.** Request.
**Dedup resolution request.** Request.
**Publish request.** Request.
**Response object fields.** Fields.
List responses use §32.3 cursor pagination with `limit` default 50 and max 250.
**Endpoint-specific side effects.** Create emits `policy.ingestion.queued`.
**Errors.** `policy_ingestion_role_insufficient`, `capability_requires_plan_upgrade`, `policy_ingestion_concurrent_request_in_flight`, `policy_extraction_partial_resume_required`, `policy_ingestion_residency_mismatch`, `policy_dedup_resolution_invalid`, `policy_ingestion_mobile_review_not_supported`.
**Example.** Idempotency-Key.
**Acceptance criteria.** Present.

### v7.2.0-REM Phase 10 Additions (2026-06-14) — §12 Policy Ingestion Error Codes {#appendix-i-v72rem-phase-10}

`policy_ingestion_unsupported_language`
`policy_ingestion_unsupported_format`
`policy_ingestion_scanned_image_rejected`
`policy_ingestion_extraction_token_limit_exceeded`
`policy_ingestion_extraction_timeout`
`policy_ingestion_monthly_cap_exceeded`
`policy_ingestion_pages_per_upload_exceeded`
`policy_ingestion_anthropic_outage`
`policy_ingestion_dedup_failed`
`policy_amendment_review_deadline_expired`
`policy_amendment_workflow_violation`
`policy_ingestion_residency_mismatch`
`policy_ingestion_concurrent_request_in_flight`
`policy_ingestion_capability_state_blocked`
`policy_ingestion_not_found`
`policy_extraction_partial_resume_required`
`policy_dedup_resolution_invalid`
`policy_ingestion_mobile_review_not_supported`

#### M.5.49 v7.2.0-REM Phase 12 Policy Ingestion P1 addition {#m-5-49-v72rem-phase-12-policy-ingestion-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `policy_ingestion_endpoint_contract_completeness` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/policy_ingestion_endpoint_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | API contract. | M02.3 |
