# 38. Responsive Design & Platform Support {#38.-responsive-design-and-platform-support}

Every top-level route (§3.7 `page_surface_kind` × route) MUST pass an automated `responsive_conformance_suite` test.
The `tap_count_probe` CI job (§38.7.4) MUST run against these 20 workflows.
No Sourcera production release MAY ship if any of the following is true:
1. `tap_count_probe` CI job failing against ≥1 of the 20 workflows at `mobile_xs` or `mobile_sm` tier.
2. `feature_parity_matrix_completeness` CI job failing (a new feature was added without a matrix row).
4. `responsive_conformance_suite` failing at any of the 5 canonical widths (375, 720, 820, 1200, 1440 px).
The gate is enforced at the CI layer via the `release_gate_assert` job.

### 50.14.14 Mobile Feature Parity Dashboard {#50.14.14-mobile-feature-parity-dashboard}

**Purpose:** canonical Ops target for §38.8.2 matrix completeness, `feature_parity_matrix_completeness`, `spec_matrix_lint`, `tap_count_probe`, and release-gate assertion output.

#### M.5.59 v7.2.0-REM Phase 38 Responsive / Mobile P1 addition {#m-5-59-v72rem-phase-38-responsive-mobile-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `responsive_conformance_suite` | responsive_ui_conformance | spec_binding_pending_pack_m21_3 | ui_e2e + visual_regression | UI evidence. | M21.3 |
| `tap_count_probe` | mobile_workflow_efficiency | spec_binding_pending_pack_m21_3 | ui_e2e + nightly_full_sweep | UI evidence. | M21.3 |
| `feature_parity_matrix_completeness` | mobile_parity_consistency | spec_binding_pending_pack_m02_3 | pr_lint | Broad coverage. | M02.3 |
| `release_gate_assert` | release_orchestration | spec_binding_release_gate_only | release_branch_gate | Release gate. | release-orchestration |
| `spec_matrix_lint` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/spec_matrix_lint.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Matrix row shape. | M02.3 |
| `responsive_mobile_ci_gate_catalog_completeness` | catalog_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/responsive_mobile_ci_gate_catalog_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Catalog. | M02.3 |
