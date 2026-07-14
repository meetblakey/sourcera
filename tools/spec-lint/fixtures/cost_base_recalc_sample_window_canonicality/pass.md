### 4.8.6 CostBaseRecalculationLog {#4.8.6-costbaserecalculationlog}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `sample_window_started_at` | Timestamp | UTC; required | Start of the prior 30-day rolling sample window used for this recalc. |
| `sample_window_ended_at` | Timestamp | UTC; required | End of the prior 30-day rolling sample window. |

7. The recalc job's sample window MUST be the prior 30-day rolling window (NOT 24h) of invoice events from the provider assigned to each capability (including Anthropic and Voyage AI where assigned) + Convex compute allocation per `posthog_event_name`, and it MUST populate `sample_window_started_at` / `sample_window_ended_at` per the field constraints above. CI gate `cost_base_recalc_sample_window_canonicality` asserts.

### 34.3.3 Cost-Base Recalculation (Operational Policy Layer)

| Rule | Value | Source |
| :---- | :---- | :---- |
| Recalc inputs (sample window) | Prior 30-day rolling window of invoice events from the provider assigned to each capability (Anthropic or Voyage AI for the current Policy Ingestion paths) + Convex compute allocation per `posthog_event_name` mapping | §4.8.2; §4.8.6 (30-day window supersedes prior 24h reading) |

### 34.17.1 MS §2.11 Baseline — 14 Requirements

| # | Requirement | Implemented By |
| :---- | :---- | :---- |
| 3 | **Nightly `cost_base` recalculation job** | `CostBaseRecalculationLog` (§4.8.6); Scheduler cron `cost_base_recalc_nightly` at 03:00 UTC; prior 30-day rolling telemetry window per §4.8.6 AC #7 |

**CostBaseRecalculationLog.** The per-run audit record of the nightly job that re-derives `cost_base_cents` from the prior 30-day rolling window of actual assigned-provider billing (Anthropic and Voyage AI where assigned), Convex compute attribution, and external-provider billing.

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `cost_base_recalc_sample_window_canonicality` | numerical_singleton_invariant | **runtime_active** | pr_lint | Every live cost-base recalc sample-window reference MUST cite the prior 30-day rolling window and §4.8.6 `sample_window_started_at` / `sample_window_ended_at` constraints; prior-24h recalc-input wording fails. Detector `tools/spec-lint/gates/cost_base_recalc_sample_window_canonicality.ts`. | M02.3 |
