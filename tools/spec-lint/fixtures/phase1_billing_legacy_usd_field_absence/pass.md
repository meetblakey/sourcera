# Fixture

## 4.3.16 Buyer Referral {#4.3.16-buyer-referral}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `credit_value_cents` | BigInt | >= 0 | Cents-backed referral credit. |
| `credit_redeemed_cents` | BigInt | >= 0 | Cents-backed redeemed amount. |

## 4.3.17 Pro Trial Seat Grant {#4.3.17-pro-trial-seat-grant}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `ai_value_consumed_cents` | BigInt | >= 0 | Cents-backed consumed value. |

## 4.3.19 Time-Saved Credit {#4.3.19-time-saved-credit}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `loaded_hourly_rate_cents` | BigInt | >= 0 | Cents-backed hourly rate. |
| `value_saved_cents` | BigInt | >= 0 | Cents-backed saved value. |

#### M.5.61 v7.2.0-REM Phase DEC Decision-Divergence P1 addition {#m-5-61-v72rem-phase-dec-decision-divergence-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `phase1_billing_legacy_usd_field_absence` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/phase1_billing_legacy_usd_field_absence.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Legacy direct field names `credit_value_usd`, `credit_redeemed_usd`, `ai_value_dollars`, `loaded_hourly_rate_usd`, and `value_saved_usd` MUST NOT reappear except inside historical `_versions` snapshots or migration notes explicitly marked retired. | M02.3 |
