# 38. Responsive Design & Platform Support {#38.-responsive-design-and-platform-support}

### 38.6.7 Per-Tier Performance Budgets {#38.6.7-per-tier-performance-budgets}

The following responsive budgets are canonical in §44.1 and are consumed here by row name. §38 MUST NOT restate competing numeric thresholds.
§44.1 `Mobile FCP - mobile_xs / mobile_sm`
§44.1 `Mobile LCP - mobile_xs / mobile_sm`
§44.1 `Mobile INP - mobile_xs / mobile_sm`
§44.1 `Mobile TTI - mobile_xs / mobile_sm`
§44.1 `Mobile initial JS envelope - mobile_xs`
§44.1 `Mobile cold-cache page load - simulated 4G`

6. Mobile production p95 FCP, LCP, INP, TTI, initial JavaScript envelope, or cold-cache page-load budget from §44.1 breaches for 3 consecutive canary days.

# 44. Consumption Model {#44.-consumption-model}

| Metric | Budget |
|---|---|
| **Mobile FCP - mobile_xs / mobile_sm** | p95 ≤ 2.5s on simulated 4G cold-cache first load and production mobile canary cohort. Source authority for §38.6.7; excludes provider-outage annotated windows per §42.6. |
| **Mobile LCP - mobile_xs / mobile_sm** | p95 ≤ 4.0s on simulated 4G cold-cache first load and production mobile canary cohort. Source authority for §38.6.7. |
| **Mobile INP - mobile_xs / mobile_sm** | p95 ≤ 200ms for tap, keyboard, bottom-sheet, and Side Peek interactions on mobile tiers. Source authority for §38.6.7. |
| **Mobile TTI - mobile_xs / mobile_sm** | p95 ≤ 5.0s on simulated 4G cold-cache authenticated routes. Source authority for §38.6.7. |
| **Mobile initial JS envelope - mobile_xs** | Initial route JavaScript ≤ 250 KB gzip for `mobile_xs` authenticated route bundles, excluding code-split deferred panels. Source authority for §38.6.7. |
| **Mobile cold-cache page load - simulated 4G** | p95 ≤ 6.0s from navigation start to first interactive primary action on `mobile_xs` / `mobile_sm`. Source authority for §38.6.7. |

# 50. Ops Console {#50.-ops-console}

### 50.14.13 Responsive Tier Conformance Dashboard {#50.14.13-responsive-tier-conformance-dashboard}

2. The dashboard MUST read mobile budget thresholds by §44.1 row name; no dashboard config may embed an independent numeric threshold.

#### M.5.59 v7.2.0-REM Phase 38 Responsive / Mobile P1 addition {#m-5-59-v72rem-phase-38-responsive-mobile-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `responsive_mobile_performance_budget_single_source` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/responsive_mobile_performance_budget_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint + synthetic_monitor | Single source. | M02.3 |
