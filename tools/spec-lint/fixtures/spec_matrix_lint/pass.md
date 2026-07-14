# 38. Responsive Design & Platform Support {#38.-responsive-design-and-platform-support}

### 38.8.2 Mobile Feature Parity Matrix {#38.8.2-mobile-feature-parity-matrix}

| Feature | Desktop | Tablet | Mobile | Notes |
|---|---|---|---|---|
| **Buyer Console** | | | | |
| Workspace List | parity | parity | parity | |
| Workspace Creation Wizard | parity | parity | simplified | Mobile defaults advanced governance; desktop can edit later. |
| Requirement Create (bulk / CSV) | parity | parity | not_supported | Desktop-only; mobile shows redirect banner. |

### 38.8.3 Simplification Disclosure Contract {#38.8.3-simplification-disclosure-contract}

| Status | Disclosure Pattern |
|---|---|
| `simplified` | **Informational chip** at the top of the mobile feature surface: |
| `not_supported` (redirect permitted) | **Redirect banner** with continue/dismiss: |
| `not_supported` (hard block) | **Hard redirect** to the `/:console/mobile-unsupported` informational page |

**Destructive destructive-exception workflows (tracked separately, 6-tap ceiling).**

8. Destructive-exception workflows MUST NOT exceed 6 taps; `destructive_exception=true` MUST be set in fixtures and the runtime-probe event.

#### M.5.59 v7.2.0-REM Phase 38 Responsive / Mobile P1 addition {#m-5-59-v72rem-phase-38-responsive-mobile-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `spec_matrix_lint` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/spec_matrix_lint.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Matrix row shape. | M02.3 |
