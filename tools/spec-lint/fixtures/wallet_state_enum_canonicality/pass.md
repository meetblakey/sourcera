### 4.8.3 AIWallet (Org-Scoped, Pooled Across Consoles) {#4.8.3-aiwallet}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `wallet_state` | Enum | See Appendix J `ai_wallet_state`: `active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `hard_capped_auto_topup_monthly_cap`, `payment_failed_grace`, `suspended`, `closed` | See state machine below. |

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `active` | `soft_warned_50` | Consumed crosses 50% | | |
| `soft_warned_50` | `soft_warned_80` | Consumed crosses 80% | | |
| `soft_warned_80` | `hard_capped_100` | Hard cap reached | | |
| `soft_warned_80` | `hard_capped_auto_topup_monthly_cap` | Monthly cap reached | | |
| `payment_failed_grace` | `suspended` | Grace expires | | |

### 31.8.4 Wallet Threshold and Auto-Topup Events

**Trigger.** AIWallet ratio first crosses 0.50 AND `wallet_state ∈ {active, soft_warned_50}`.
**Payload.** `new_wallet_state=soft_warned_50`.

**Trigger.** AIWallet ratio first crosses 0.80 AND `wallet_state ∈ {active, soft_warned_50}`.

| Field | Type | Notes |
| :---- | :---- | :---- |
| `new_wallet_state` | Enum | Typically `soft_warned_80` |
| `new_wallet_state` | Enum | `soft_warned_80` when overage headroom remains, `hard_capped_100` when overage is disabled or already at the overage ceiling, or `hard_capped_auto_topup_monthly_cap` when the binding constraint is the configured monthly auto-topup ceiling |
| `prior_wallet_state` | Enum | Typically `soft_warned_80`, `hard_capped_100`, or `hard_capped_auto_topup_monthly_cap` |

### 34.10.4 Wallet State Machine (Reference)

The full state machine lives at §4.8.3 (`active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `hard_capped_auto_topup_monthly_cap`, `payment_failed_grace`, `suspended`, `closed`).
Canonical webhook emission is `billing.wallet.auto_topup_failed` with `failure_category='monthly_cap_would_be_exceeded'`.

### AI Wallet State (§4.8.3)

`active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `hard_capped_auto_topup_monthly_cap`, `payment_failed_grace`, `suspended`, `closed`

**AIWallet.** State machine includes `active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `hard_capped_auto_topup_monthly_cap`, `payment_failed_grace`, `suspended`, `closed`. See §4.8.3.

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `wallet_state_enum_canonicality` | enum_consistency | **runtime_active** (promoted 2026-07-07; detector `tools/spec-lint/gates/wallet_state_enum_canonicality.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Wallet-state prose, webhook payload tables, API examples, Appendix J, and Appendix K MUST use exactly the Appendix J `ai_wallet_state` values: `active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `hard_capped_auto_topup_monthly_cap`, `payment_failed_grace`, `suspended`, `closed`; retired `soft_capped_*` labels fail. | M02.3 |
