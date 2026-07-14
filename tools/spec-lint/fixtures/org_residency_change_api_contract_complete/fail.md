# Sourcera {#sourcera}

### 32.8.25 POST /v1/organizations/{org_id}/residency-migration-requests — Initiate Org Residency Migration {#32.8.25-post-org-residency-migration-request}

**Authentication.** Token only.

**Request.**

| Field | Type | Required | Constraints | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `requested_region` | Enum | Yes | Any string | Target. |

**Errors.**

| HTTP | Code | Condition |
| :---- | :---- | :---- |
| 500 | `unknown_error` | Anything. |

**Events and audit.** Successful creation emits AuditEvent `org.residency_change.requested`.

## Appendix I {#appendix-i}

- `stripe_customer_active_duplicate` — HTTP 422. Used by: §32 `POST /v1/organizations/{org_id}/residency-migration-requests`. Localization key: `error.billing.stripe_customer_active_duplicate`.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `org_residency_change_api_contract_complete` | api_contract_completeness | spec_binding_pending_pack_m02_3 | pr_lint | Incomplete. | M02.3 |
