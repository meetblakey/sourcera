# Fixture

### 32.8.10 POST /v1/orgs/{org_id}/wallet/topup {#32.8.10-post-wallet-topup}

**Errors.**

| HTTP | Code | Condition |
|---|---|---|
| 403 | `billing_admin_role_insufficient` | Caller lacks billing_admin/org_owner |
| 404 | `missing_code` | Missing registration |
| 422 | `topup_amount_out_of_range` | Status drift |

### 32.8.11 POST /v1/orgs/{org_id}/ai-operations/export {#32.8.11-post-ai-operations-export}

**Errors.** Standard (`billing_admin_role_insufficient`).

### 32.8.23 Acceptance Criteria (Billing Endpoints) {#32.8.23-acceptance-criteria-billing}

1. Billing endpoint error codes should be registered.

### Billing Endpoint Errors (§32.8)

| Code | HTTP | Meaning |
|---|---|---|
| `topup_amount_out_of_range` | 400 | Manual wallet top-up amount outside bounds. |

### Pre-existing Billing Domain Codes {#appendix-i-pre-existing-billing-codes}

| Code | HTTP | Used By | Retryable | Description | Localization Key |
|---|---|---|---|---|---|
| `billing_admin_role_insufficient` | 403 | Billing endpoints | `permanent` | Role lacks billing authority. | `error.billing.billing_admin_role_insufficient` |
