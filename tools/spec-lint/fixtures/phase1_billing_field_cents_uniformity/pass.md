# Fixture

### 4.3.16 Buyer Referral

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `credit_value_cents` | BigInt | >= 0 | Integer USD cents. |
| `credit_redeemed_cents` | BigInt | >= 0 | Integer USD cents. |

### 4.3.17 Buyer-Funded Pro Trial Seat Grant

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `ai_value_consumed_cents` | BigInt | >= 0 | Integer USD cents. |

### 4.3.18 Usage Event

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `ai_value_cents` | BigInt | >= 0 | Integer USD cents. |

### 4.3.18.A Usage Event Daily Aggregate

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `total_ai_value_cents` | BigInt | >= 0 | Integer USD cents. |

### 4.3.19 Time-Saved Credit

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `loaded_hourly_rate_cents` | BigInt | >= 0 | Integer USD cents. |
| `value_saved_cents` | BigInt | >= 0 | Integer USD cents. |

### 48.5.8 M8 Org Intelligence Value Curve

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `total_value_saved_cents_cumulative` | BigInt | >= 0 | Integer USD cents. |
| `delta_value_saved_cents_this_evaluation` | BigInt | >= 0 | Integer USD cents. |
| `baseline_value_per_evaluation_cents` | BigInt | > 0 | Integer USD cents. |

**Phase 1 billing cents convention.** New Phase 1 financial fields authored or corrected by the D-DEC-001 pass use explicit integer-cents names such as `credit_value_cents`, `credit_redeemed_cents`, `ai_value_consumed_cents`, `ai_value_cents`, `loaded_hourly_rate_cents`, and `value_saved_cents`. These fields are BigInt / Integer USD cents for arithmetic and render as dollars only at the presentation layer.

#### M.5.61 v7.2.0-REM Phase DEC Decision-Divergence P1 addition

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `phase1_billing_field_cents_uniformity` | data_model_contract | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/phase1_billing_field_cents_uniformity.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | BuyerReferral, ProTrialSeatGrant, UsageEvent, TimeSavedCredit, and M8 checkpoint value fields introduced or corrected in Phase 1 MUST use explicit `*_cents` names and integer / BigInt storage for monetary arithmetic. | M02.3 |
