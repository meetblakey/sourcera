### 4.8.6 CostBaseRecalculationLog {#4.8.6-costbaserecalculationlog}

1. The recalc job MUST run nightly at 02:30 UTC with idempotent retry on failure.

### 34.3.3 Cost-Base Recalculation (Operational Policy Layer)

| Rule | Value | Source |
| :---- | :---- | :---- |
| Recalc cadence | Nightly at 02:30 UTC | §4.8.6 AC #1 |

### 34.11.3 Cost-Base Recalculation (Operational Cross-Reference)

- Nightly run at 02:30 UTC per §4.8.6 AC #1.

### 34.17.1 MS §2.11 Baseline — 14 Requirements

| # | Requirement | Implemented By |
| :---- | :---- | :---- |
| 3 | **Nightly `cost_base` recalculation job** | `CostBaseRecalculationLog` (§4.8.6); Scheduler cron `cost_base_recalc_old` at 02:30 UTC |

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `cost_base_recalc_cron_canonicality` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint | Recalc job cadence is checked. | M02.3 |
