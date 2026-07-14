# Fixture

## 32.1 Overview {#32.1-overview}

REST API. Current version: `v1`. Base URL: `https://api.sourcera.io/v1`.

## 32.5 Endpoints {#32.5-endpoints}

GET /v1/workspaces/{workspace_id}

POST `/v1/ops/taxonomy/nodes`

POST /kb/v1/tools/kb_get_entry

**Full request/response/error/idempotency detail for Vendor Opt-Out endpoints is authored in §27.10.6.** This §32.5 family is the canonical API-catalog registration for those endpoints and uses the `/v1` path-prefix convention from §32.1.

Console-qualified path roots (`/v1/seller/marketplace`, `/v1/buyer/marketplace`, `/v1/ops/marketplace`) are canonical under the §32.1 `/v1` API version and are not alternate API prefixes.

#### M.5.66 v7.2.0-REM Phase 8 API Path Prefix Canonicality P1 addition

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `api_path_prefix_canonical` | content_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/api_path_prefix_canonical.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint + api_contract_test | Every live Master Spec endpoint path token MUST use the §32.1 `/v1` root; legacy `/api/v1` prefix forbidden. | M02.3 |
