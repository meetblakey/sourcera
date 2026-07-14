### 4.8.6 CostBaseRecalculationLog {#4.8.6-costbaserecalculationlog}

1. The recalc job MUST run as scheduler cron `cost_base_recalc_nightly` nightly at 03:00 UTC with idempotent retry on failure; missed run alerts Ops within 1 hour.

### 34.3.3 Cost-Base Recalculation (Operational Policy Layer)

| Rule | Value | Source |
| :---- | :---- | :---- |
| Recalc cadence | Scheduler cron `cost_base_recalc_nightly`; nightly at 03:00 UTC | §4.8.6 AC #1 |

### 34.11.3 Cost-Base Recalculation (Operational Cross-Reference)

- Scheduler cron `cost_base_recalc_nightly` runs nightly at 03:00 UTC per §4.8.6 AC #1; idempotent re-run on missed sweep

### 34.17.1 MS §2.11 Baseline — 14 Requirements

| # | Requirement | Implemented By |
| :---- | :---- | :---- |
| 3 | **Nightly `cost_base` recalculation job** | `CostBaseRecalculationLog` (§4.8.6); Scheduler cron `cost_base_recalc_nightly` at 03:00 UTC; prior 30-day rolling telemetry window per §4.8.6 AC #7 |

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `cost_base_recalc_cron_canonicality` | numerical_singleton_invariant | **runtime_active** | pr_lint | §4.8.6, §34.3.3, §34.11.3, and §34.17.1 MUST all cite the same `cost_base_recalc_nightly` cadence, 03:00 UTC, and MUST NOT restate a conflicting 02:30 UTC cost-base schedule. Detector `tools/spec-lint/gates/cost_base_recalc_cron_canonicality.ts`. | M02.3 |
