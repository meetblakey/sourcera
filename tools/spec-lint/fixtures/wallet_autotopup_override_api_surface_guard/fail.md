### 32.8.4 POST /v1/orgs/{org_id}/wallet/auto-topup — Configure Auto Top-Up {#32.8.4-post-wallet-auto-topup}

| Field | Type | Required | Constraints | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `max_monthly_value_dollars_cents` | Integer | Conditional | Bounds in local prose. | Total top-up ceiling per billing period. Enterprise customers may send high ceilings here. |

| HTTP | Code | Trigger |
| :---- | :---- | :---- |
| 422 | `wallet_autotopup_max_monthly_out_of_range` | Max monthly invalid |

**State-Machine Effect.** Updates wallet fields.

### 4.8.3.B Ops Finance Monthly Auto-Topup Ceiling Override {#4.8.3.b-ops-finance-monthly-auto-topup-ceiling-override}

Enterprise customers can receive larger caps.

| Aspect | Rule |
| :---- | :---- |
| Authorization | Billing Admin can request. |

**Acceptance Criteria:**
1. Ops can raise monthly caps.

### Pre-existing Billing Domain Codes {#appendix-i-pre-existing-billing-codes}

| Code | HTTP | Used By | Retryable | Description | Localization Key |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `wallet_autotopup_max_monthly_out_of_range` | 422 | Auto-topup API | `permanent` | Invalid cap. | `error.billing.wallet_autotopup_max_monthly_out_of_range` |

| `wallet_autotopup_override_api_surface_guard` | api_contract_completeness | spec_binding_pending_pack_m02_3 | pr_lint | §32.8.4 MUST reject customer-supplied override values above the self-serve ceiling and Appendix I MUST register both `wallet_autotopup_max_monthly_out_of_range` and `wallet_autotopup_ops_override_forbidden`. | M02.3 |
