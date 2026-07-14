### 4.8.6 CostBaseRecalculationLog {#4.8.6-costbaserecalculationlog}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `sample_window_started_at` | Timestamp | UTC | Start of the sample. |

7. The recalc job's sample window is prior 24h invoice events.

### 34.3.3 Cost-Base Recalculation (Operational Policy Layer)

| Rule | Value | Source |
| :---- | :---- | :---- |
| Recalc inputs (sample window) | Prior 24h recalc inputs | §4.8.6 |

### 34.17.1 MS §2.11 Baseline — 14 Requirements

| # | Requirement | Implemented By |
| :---- | :---- | :---- |
| 3 | **Nightly `cost_base` recalculation job** | `CostBaseRecalculationLog` (§4.8.6); one-day telemetry window |

**CostBaseRecalculationLog.** The per-run audit record of the nightly job that re-derives `cost_base_cents` from provider billing.

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `cost_base_recalc_sample_window_canonicality` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint | Sample window checked. | M02.3 |
