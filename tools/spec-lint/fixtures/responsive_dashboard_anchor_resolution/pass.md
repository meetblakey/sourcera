# 38. Responsive Design & Platform Support {#38.-responsive-design-and-platform-support}

Conformance results are aggregated into the Responsive Tier Conformance Dashboard (§50.14.13).
Uploaded to the Responsive Tier Conformance Dashboard (§50.14.13).
A missing row is a CI failure in the `feature_parity_matrix_completeness` job and is reported on the Mobile Feature Parity Dashboard (§50.14.14).

# 50. Ops Console {#50.-ops-console}

### 50.14.13 Responsive Tier Conformance Dashboard {#50.14.13-responsive-tier-conformance-dashboard}

**Purpose:** canonical Ops target for §38.6.5 `responsive_conformance_suite` artifacts, §38.7.4 tap-probe artifacts, and §38.6.7 mobile performance budget signals.

### 50.14.14 Mobile Feature Parity Dashboard {#50.14.14-mobile-feature-parity-dashboard}

**Purpose:** canonical Ops target for §38.8.2 matrix completeness, `feature_parity_matrix_completeness`, `spec_matrix_lint`, `tap_count_probe`, and release-gate assertion output.

#### M.5.59 v7.2.0-REM Phase 38 Responsive / Mobile P1 addition {#m-5-59-v72rem-phase-38-responsive-mobile-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `responsive_dashboard_anchor_resolution` | content_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/responsive_dashboard_anchor_resolution.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Anchor resolution. | M02.3 |
