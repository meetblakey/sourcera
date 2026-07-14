# 26 Marketplace {#26-marketplace}

### 26.9.10 Page Accessibility & Core Web Vitals {#26.9.10-page-accessibility-and-core-web-vitals}

Public Marketplace page Core Web Vitals are owned here.

# 44 Performance {#44-performance}

## 44.1 Performance Targets {#44.1-performance-targets}

| Metric | Target |
|---|---|
| **In-app LCP - authenticated surfaces** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console MUST meet p75 ≤ 2.5s on desktop and p75 ≤ 4.0s on mobile web. Public-page LCP remains owned by §26.9.10; this row is the in-app Core Web Vitals singleton. |
| **In-app INP - authenticated surfaces** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console MUST meet p75 ≤ 200ms for primary click, keyboard, command, Side Peek, and mobile bottom-sheet interactions. |
| **In-app CLS - authenticated surfaces** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console MUST meet p75 ≤ 0.1 across initial load, route transition, skeleton replacement, Side Peek open/close, and responsive breakpoint change. |
| **In-app TTFB - cached authenticated routes** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console cached SSR / edge routes MUST meet p75 ≤ 600ms on desktop and mobile web. |
| **In-app TTFB - uncached authenticated routes** | Buyer Console, Seller Console, authenticated Marketplace, and Ops Console uncached dynamic routes MUST meet p75 ≤ 1,200ms on desktop and mobile web; provider-outage annotated windows follow §42.6 exclusion discipline. |

#### M.5.60 v7.2.0-REM Phase 44 Performance / Solo P1 addition {#m-5-60-v72rem-phase-44-performance-solo-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `core_web_vitals_in_app_singleton` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/core_web_vitals_in_app_singleton.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Singleton. | M02.3 |
