### 4.8.3 AIWallet (Org-Scoped, Pooled Across Consoles) {#4.8.3-aiwallet}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `wallet_state` | Enum | See Appendix J `ai_wallet_state`: `active`, `soft_capped_50`, `soft_warned_80`, `hard_capped_100`, `payment_failed_grace`, `suspended`, `closed` | See state machine below. |

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `active` | `soft_capped_50` | Consumed crosses 50% | | |
| `soft_capped_50` | `soft_warned_80` | Consumed crosses 80% | | |

### 31.8.4 Wallet Threshold and Auto-Topup Events

**Trigger.** AIWallet ratio first crosses 0.80 AND `wallet_state ∈ {active, soft_warned_80}`.
Soft-capped states honor overage policy.

### 34.10.4 Wallet State Machine (Reference)

The full state machine lives at §4.8.3 (`active`, `soft_capped_50`, `soft_warned_80`, `hard_capped_100`, `payment_failed_grace`, `suspended`, `closed`).

### AI Wallet State (§4.8.3)

`active`, `soft_capped_50`, `soft_warned_80`, `hard_capped_100`, `payment_failed_grace`, `suspended`, `closed`

**AIWallet.** State machine includes `active`, `soft_capped_50`, `soft_warned_80`, `hard_capped_100`, `payment_failed_grace`, `suspended`, `closed`. See §4.8.3.

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `wallet_state_enum_canonicality` | enum_consistency | spec_binding_pending_pack_m02_3 | pr_lint | Wallet-state prose checked. | M02.3 |
