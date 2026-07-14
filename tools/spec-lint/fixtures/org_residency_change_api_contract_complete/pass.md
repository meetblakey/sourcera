# Sourcera {#sourcera}

## 32.4.5 Rate-Limit Class Registry {#32.4.5-rate-limit-class-registry}

| Class | Surface | Scope | Soft limit | Hard limit | Burst / concurrency | Error | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `org_residency_change` | Org residency migration request creation and polling | Org | 10 requests/hour | 20 requests/day | 2 concurrent active requests per Org | `rate_limit_exceeded` | Request creation is idempotent; only one non-terminal §1.6.1 migration may exist per Org. |

### 32.8.25 POST /v1/orgs/{org_id}/residency-migration-requests — Initiate Org Residency Migration {#32.8.25-post-org-residency-migration-request}

**Purpose.** Create an Org residency migration request.

**Authentication.** `Authorization: Bearer <api_token>` with scope `admin:org` plus active UI-session step-up for the initiating Org Owner / Enterprise Admin. API-only initiation without step-up returns HTTP 403 `step_up_required`.

**RBAC.** `role ∈ {org_owner, enterprise_admin}` and plan tier Enterprise.

**Rate-limit class.** `org_residency_change` (§32.4.5).

**Idempotency.** REQUIRED. `Idempotency-Key` dedupes by `(org_id, requested_region, key)` for 24 hours. Same-key/same-body replay returns the original response with `X-Idempotent-Replay: true`; same-key/different-body replay returns HTTP 409 `idempotency_key_request_mismatch`. Replay MUST NOT create a duplicate residency migration request, Ops approval task, audit row, customer notification, Stripe-Customer reconciliation step, or regional execution job.

**Request.**

```http
POST /v1/orgs/{org_id}/residency-migration-requests
```

| Field | Type | Required | Constraints | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `requested_region` | Enum | Yes | Appendix J `data_residency_region` | Target. |
| `custom_sovereign_residency_label` | String | Conditional | Required iff custom | Label. |
| `business_justification` | String | Yes | 20-2,000 chars | Justification. |
| `acknowledged_production_evaluation_pause` | Boolean | Yes | MUST be true | Acknowledgment. |

**Response (HTTP 202 Accepted).**

```json
{
  "residency_change_id": "reschg_01j1",
  "state": "requested",
  "current_region": "us",
  "requested_region": "eu",
  "eligibility": {"passed": true},
  "ops_review_required": true,
  "poll_url": "/v1/orgs/{org_id}/residency-migration-requests/reschg_01j1"
}
```

**Polling.** `GET /v1/orgs/{org_id}/residency-migration-requests/{residency_change_id}` returns the same envelope with `state ∈ Appendix J org_residency_change_state`. Terminal states are `completed`, `rolled_back`, and `cancelled`.

**Errors.**

| HTTP | Code | Condition |
| :---- | :---- | :---- |
| 403 | `step_up_required` | Missing step-up. |
| 403 | `enterprise_plan_required` | Not Enterprise. |
| 409 | `org_residency_change_eligibility_predicate_violated` | Predicate failed. |
| 409 | `org_residency_change_blocked_by_active_dsar` | Active DSAR. |
| 409 | `idempotency_key_request_mismatch` | Body mismatch. |
| 422 | `organization_custom_residency_label_required` | Missing label. |
| 429 | `rate_limit_exceeded` | Per class. |
| 502 | `org_residency_change_stripe_api_failure` | Stripe failure. |

**Events and audit.** Successful request creation writes one §4.6.1 AuditEvent with `entity_type=organization`, `action=created`, `entity_id=org_id`, and `changes.residency_change_id`, `changes.requested_region`, `changes.current_region`, and `changes.state=requested`; it emits no Appendix C webhook at request creation. Appendix C `org.residency_change.initiated` is emitted only after eligibility passes and the §34.10.5.A transaction begins. Completion, rollback, Stripe-Customer creation / closure, and customer notifications use the Appendix C `org.residency_change.*` family. Blocked preflight emits no webhook and uses Loops.so template `lo_org_residency_change_blocked`.

**Acceptance criteria.**

1. The endpoint MUST NOT mutate Organization.`data_residency_region`.
2. The endpoint MUST reject a second non-terminal residency migration request for the same Org.
3. The endpoint MUST return every violated predicate in the response body.
4. `requested_region = custom` MUST require `custom_sovereign_residency_label`.
5. The endpoint MUST be covered by CI gate `org_residency_change_api_contract_complete`.

## Appendix C {#appendix-c}

| Event Kind | Trigger | Recipient | Channel | Cadence | Payload | Retry Curve |
|---|---|---|---|---|---|---|
| `org.residency_change.initiated` | started | Org | Webhook | once | `{}` | `financial_impact` |
| `org.residency_change.stripe_customer_created` | created | Org | Webhook | once | `{}` | `financial_impact` |
| `org.residency_change.stripe_customer_closed` | closed | Org | Webhook | once | `{}` | `financial_impact` |
| `org.residency_change.completed` | completed | Org | Webhook | once | `{}` | `financial_impact` |
| `org.residency_change.rollback` | rollback | Org | Webhook | once | `{}` | `financial_impact` |

## Appendix G {#appendix-g}

| Event | Trigger | Properties |
| :---- | :---- | :---- |
| `org_residency_change_initiated` | Appendix C | `source_webhook_event_type='org.residency_change.initiated'` |
| `org_residency_change_stripe_customer_created` | Appendix C | `source_webhook_event_type='org.residency_change.stripe_customer_created'` |
| `org_residency_change_stripe_customer_closed` | Appendix C | `source_webhook_event_type='org.residency_change.stripe_customer_closed'` |
| `org_residency_change_completed` | Appendix C | `source_webhook_event_type='org.residency_change.completed'` |
| `org_residency_change_rollback` | Appendix C | `source_webhook_event_type='org.residency_change.rollback'` |

## Appendix I {#appendix-i}

- `stripe_customer_active_duplicate` — HTTP 422; permanent. Used by: §32 `POST /v1/orgs/{org_id}/residency-migration-requests`. Localization key: `error.billing.stripe_customer_active_duplicate`.
- `org_residency_change_stripe_api_failure` — HTTP 502. Localization key: `error.billing.org_residency_change_stripe_api_failure`.
- `org_residency_change_eligibility_predicate_violated` — HTTP 409. Localization key: `error.residency.org_residency_change_eligibility_predicate_violated`.
- `organization_custom_residency_label_required` — HTTP 422. Localization key: `error.residency.organization_custom_residency_label_required`.
- `org_residency_change_blocked_by_active_dsar` — HTTP 409. Localization key: `error.residency.org_residency_change_blocked_by_active_dsar`.

## Appendix J {#appendix-j}

| Scope | Meaning | Surface |
| :---- | :---- | :---- |
| `admin:org` | High-trust Org administration APIs with step-up requirements | §32.8.25 residency migration initiation |

`standard_authenticated_per_org`, `org_residency_change`, `analytics_export`

### `org_residency_change_state` (§1.6.1 Per-Org Residency Change Procedure)

`not_requested`, `requested`, `completed`, `rolled_back`, `cancelled`

### Audit Event Action Types

`created`, `updated`, `deleted`

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `org_residency_change_api_contract_complete` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/org_residency_change_api_contract_complete.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | `POST /v1/orgs/{org_id}/residency-migration-requests` and polling MUST declare auth scope, RBAC, rate-limit class, idempotency, request / response schema, error table, and events, with class `org_residency_change` registered in §32.4.5 and Appendix J. | M02.3 |
