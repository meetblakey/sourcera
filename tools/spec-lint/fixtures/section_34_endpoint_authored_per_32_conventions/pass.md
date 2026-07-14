# Fixture

## 32.8 Billing Endpoint Detail {#32.8-billing-endpoint-detail}

### 32.8.0 Common Conventions for Billing Endpoints {#32.8.0-common-conventions-for-billing-endpoints}

- **Pagination. All list endpoints follow §32.3: cursor-based**, opaque `next_cursor`, default `limit=50`, max `limit=250`.
- **Idempotency for POST mutations.** Every state-mutating POST endpoint in §32.8 requires an `Idempotency-Key` request header.
- **Error envelope.** Every error includes `request_id` for support escalation.

### 32.8.1 GET /v1/pricing — Public Pricing API {#32.8.1-get-pricing}

**Method & Path.** `GET https://api.sourcera.io/v1/pricing`

**Auth Scope.** None.

**RBAC.** N/A (no authentication).

**Rate-Limit Class.** `public_pricing_unauth`

**Query Parameters.**

**Request Headers.**

**Response Headers.**

**Response Body (HTTP 200).**

**Error Codes.** `pricing_table_currency_not_published`, `pricing_table_version_not_found`, `pricing_table_capability_not_published`

**Pagination.** None

**Idempotency.** N/A (read endpoint).

**Concrete Example (curl).**

### 32.8.5 GET /v1/orgs/{org_id}/ai-operations — Billing Ledger (List) {#32.8.5-get-ai-operations-list}

**Method & Path.** `GET https://api.sourcera.io/v1/orgs/{org_id}/ai-operations`

**Auth Scope.** `read:billing`.

Cross-console union (`?console=all`) requires `role ∈ {org_owner, billing_admin}`.

**Rate-Limit Class.** `standard_authenticated_per_org`

**Query Parameters.**

**Response Body (HTTP 200).**

**Error Codes.** `billing_ledger_cross_console_role_insufficient`, `ai_operation_cross_org_access`, `pagination_cursor_expired`

**Pagination.** §32.3 cursor-based, default 50, max 250.

**Idempotency.** N/A.

**Concrete Example.**

### 32.8.7 POST /v1/orgs/{org_id}/ai-operations/{op_id}/contest — File Contest {#32.8.7-post-ai-operation-contest}

**Method & Path.** `POST https://api.sourcera.io/v1/orgs/{org_id}/ai-operations/{op_id}/contest`

**Auth Scope.** `admin:billing`

**RBAC.** `role = billing_admin` ONLY

**Rate-Limit Class.** `standard_authenticated_per_org`

**Request Body (JSON).** `reason_code`, `reason_narrative`, `provenance_hash_at_file`

**Response Body (HTTP 201 Created).**

**Error Codes.** `contest_role_must_be_billing_admin`, `contest_already_filed`, `ai_operation_contest_window_expired`, `contest_provenance_hash_mismatch`, `contest_invalid_settlement_state`, `contest_requested_credit_exceeds_charge`, `contest_locked_for_dsar`, `contest_filing_rate_limit_exceeded`

**Idempotency.** REQUIRED. Replays return `X-Idempotent-Replay: true`; body mismatch returns `idempotency_key_request_mismatch`.

**State-Machine Effect.** creates ContestRecord and emits webhook `billing.contest.filed`.

**Concrete Example.**

### 32.8.23 Acceptance Criteria (Billing Endpoints) {#32.8.23-acceptance-criteria-billing}

1. Public Pricing API never requires authentication.
2. AIOperation list endpoint enforces order `created_at DESC, id ASC`.
3. Contest endpoint enforces 14-day window using database transaction commit time.
4. Contest endpoint rejects role-non-`billing_admin` filings.
5. Contest endpoint atomically transitions AIOperation, places soft credit, and creates the ContestRecord.
6. Implicit-Org alias paths (`/v1/billing/...`) MUST resolve identically to explicit-Org canonical paths.
7. Every §32.8.10-.22 endpoint error table MUST resolve to Appendix I.

## 34 Pricing {#34-pricing}

The Public Pricing API is available at `GET /v1/pricing` per §32.8.1.

The Billing Ledger view (`GET /v1/orgs/{org_id}/ai-operations` per §32.8.5; implicit alias `GET /v1/billing/operations`) returns rows.

The contest filing path uses API `POST /v1/orgs/{org_id}/ai-operations/{op_id}/contest` per §32.8.7.

API endpoints for §34 (Billing Ledger, Public Pricing API, Wallet read/configure, Contest file/list) MUST follow §32 patterns. Canonical paths live in §32.8.

## Appendix I Error Codes {#appendix-i-error-codes}

| Code | HTTP | Scope | Meaning |
|---|---|---|---|
| `pricing_table_currency_not_published` | 400 | §32.8 | Registered |
| `pricing_table_version_not_found` | 404 | §32.8 | Registered |
| `pricing_table_capability_not_published` | 404 | §32.8 | Registered |
| `billing_ledger_cross_console_role_insufficient` | 403 | §32.8 | Registered |
| `ai_operation_cross_org_access` | 404 | §32.8 | Registered |
| `ai_operation_cross_console_access` | 404 | §32.8 | Registered |
| `ai_operation_not_found` | 404 | §32.8 | Registered |
| `pagination_cursor_expired` | 422 | §32.8 | Registered |
| `query_unsupported_filter_combination` | 422 | §32.8 | Registered |
| `contest_role_must_be_billing_admin` | 403 | §32.8 | Registered |
| `contest_filing_rate_limit_exceeded` | 429 | §32.8 | Registered |
| `contest_already_filed` | 409 | §32.8 | Registered |
| `ai_operation_contest_window_expired` | 410 | §32.8 | Registered |
| `contest_provenance_hash_mismatch` | 422 | §32.8 | Registered |
| `contest_invalid_settlement_state` | 422 | §32.8 | Registered |
| `contest_requested_credit_exceeds_charge` | 422 | §32.8 | Registered |
| `contest_locked_for_dsar` | 423 | §32.8 | Registered |
| `idempotency_key_request_mismatch` | 409 | §32.8 | Registered |

## Appendix M.5 {#appendix-m-5}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `section_34_endpoint_authored_per_32_conventions` | api_contract_completeness | **runtime_active** (promoted 2026-07-07; detector `tools/spec-lint/gates/section_34_endpoint_authored_per_32_conventions.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §34 references to public pricing, billing operations, and contest filing MUST resolve to fully-authored §32.8 endpoint contracts with method/path/auth/rate-limit/pagination/idempotency/schemas/examples and Appendix I error registrations; `endpoint pending` placeholders fail. | M02.3 |
