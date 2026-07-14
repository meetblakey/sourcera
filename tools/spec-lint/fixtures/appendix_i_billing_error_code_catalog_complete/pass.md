# Fixture

### 32.8.10 POST /v1/orgs/{org_id}/wallet/topup {#32.8.10-post-wallet-topup}

**Errors.**

| HTTP | Code | Condition |
|---|---|---|
| 403 | `billing_admin_role_insufficient` | Caller lacks billing_admin/org_owner |
| 404 | `billing_admin_cross_org_access` | Cross-Org |
| 422 | `topup_amount_out_of_range` | Outside bounds |

### 32.8.23 Acceptance Criteria (Billing Endpoints) {#32.8.23-acceptance-criteria-billing}

1. CI gate `appendix_i_billing_error_code_catalog_complete` MUST assert billing endpoint error-code registration.

### Billing Endpoint Errors (§32.8)

| Code | HTTP | Meaning |
|---|---|---|
| `topup_amount_out_of_range` | 422 | Manual wallet top-up amount outside bounds. |

### Pre-existing Billing Domain Codes {#appendix-i-pre-existing-billing-codes}

| Code | HTTP | Used By | Retryable | Description | Localization Key |
|---|---|---|---|---|---|
| `billing_admin_role_insufficient` | 403 | Billing endpoints | `permanent` | Role lacks billing authority. | `error.billing.billing_admin_role_insufficient` |
| `billing_admin_cross_org_access` | 404 | Billing endpoints | `permanent` | Cross-Org non-leak. | `error.billing.billing_admin_cross_org_access` |
