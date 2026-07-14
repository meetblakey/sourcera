### 32.8.4 POST /v1/orgs/{org_id}/wallet/auto-topup — Configure Auto Top-Up {#32.8.4-post-wallet-auto-topup}

| Field | Type | Required | Constraints | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `max_monthly_value_dollars_cents` | Integer | Conditional | Lower bound and customer-facing upper bound per §4.8.3 `auto_topup_max_monthly_value_dollars` constraint (canonical home; per Authoring Convention #10, this row MUST NOT restate the literal range — schema validation reads the bounds from §4.8.3). Required when `enabled=true`. | Total top-up ceiling per billing period. This customer endpoint rejects values above the self-serve ceiling; Enterprise Ops override values above that ceiling must use §4.8.3.B / §50.23 and cannot be supplied by customer API tokens. |

| HTTP | Code | Trigger |
| :---- | :---- | :---- |
| 422 | `wallet_autotopup_max_monthly_out_of_range` (new; Appendix I) | Max monthly outside the caller's allowed §4.8.3 / §4.8.3.B bounds |
| 403 | `wallet_autotopup_ops_override_forbidden` (new; Appendix I) | Caller attempts an Enterprise Ops override without §4.8.3.B eligibility or authority |

**State-Machine Effect.** Customer-facing writes MUST NOT set §4.8.3.B override audit fields.

### 4.8.3.B Ops Finance Monthly Auto-Topup Ceiling Override {#4.8.3.b-ops-finance-monthly-auto-topup-ceiling-override}

The customer-facing auto-topup configuration surface is capped at the self-serve ceiling.

| Aspect | Rule |
| :---- | :---- |
| Authorization | customer `org_owner` / `billing_admin` tokens cannot set values above the self-serve ceiling. |
| Absolute maximum | Writes above this maximum return `wallet_autotopup_max_monthly_out_of_range`. |
| Failure modes | Non-Enterprise target returns `wallet_autotopup_ops_override_forbidden`. |

**Acceptance Criteria:**
1. Customer-facing API writes MUST reject `auto_topup_max_monthly_value_dollars` values above the self-serve ceiling.

### Pre-existing Billing Domain Codes {#appendix-i-pre-existing-billing-codes}

| Code | HTTP | Used By | Retryable | Description | Localization Key |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `wallet_autotopup_max_monthly_out_of_range` | 422 | `POST /v1/orgs/{org_id}/wallet/auto-topup` or §50.23 Ops override with monthly auto-topup cap outside the caller's allowed §4.8.3 / §4.8.3.B bounds | `permanent` | Customer endpoint returns the self-serve bound source. Ops override returns the Enterprise absolute bound source and rejected value. | `error.billing.wallet_autotopup_max_monthly_out_of_range` |
| `wallet_autotopup_ops_override_forbidden` | 403 | §50.23 monthly auto-topup ceiling override attempted for non-Enterprise target, non-Ops caller, missing approval chain, or missing override reason | `permanent` | Per §4.8.3.B. Body returns the missing predicate without exposing customer financial internals. | `error.billing.wallet_autotopup_ops_override_forbidden` |

| `wallet_autotopup_override_api_surface_guard` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/wallet_autotopup_override_api_surface_guard.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §32.8.4 / §4.8.3.B / Appendix I guard only; product request validators, Ops approval workflow, wallet mutation handlers, Stripe scheduler behavior, deploy validators, and runtime API tests remain product-pack evidence) | pr_lint | §32.8.4 MUST reject customer-supplied override values above the self-serve ceiling and Appendix I MUST register both `wallet_autotopup_max_monthly_out_of_range` and `wallet_autotopup_ops_override_forbidden`. | M02.3 |
