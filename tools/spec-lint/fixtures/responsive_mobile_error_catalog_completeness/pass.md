# 38. Responsive Design & Platform Support {#38.-responsive-design-and-platform-support}

- `gesture_out_of_safe_area` (HTTP 422) — touch-start origin within iOS back-gesture safe area; gesture absorbed; no user-visible error, telemetry only.
- `mobile_command_palette_hydration_forbidden` (HTTP 500) — Command Palette rendered on `mobile_xs`/`mobile_sm`; SSR defect; Sentry alert + auto-close.
- `tap_count_probe_ceiling_breach` (CI only, exit code 42) — tap-count probe exceeded ceiling.
- `mobile_ops_console_write_attempted` (HTTP 403) — write against Ops Console from `mobile_xs`/`mobile_sm` session; redirects to `/ops/mobile-unsupported`.

## Appendix I: Error Codes {#appendix-i-error-codes}

### Responsive / Mobile Surface Errors (§38) {#appendix-i-responsive-mobile-surface-errors}

| Code | HTTP / Exit | Retryability | Used By | Localization Key | Notes |
|---|---|---|---|---|---|
| `gesture_out_of_safe_area` | 422 | `permanent` | §38.7.3 iOS safe-area gesture filter | `error.responsive.gesture_out_of_safe_area` | |
| `mobile_command_palette_hydration_forbidden` | 500 | `permanent` | §38.6.4 / §38.7 mobile Command Palette guard | `error.responsive.mobile_command_palette_hydration_forbidden` | |
| `tap_count_probe_ceiling_breach` | CI exit 42 | `permanent` | §38.7.4 / §38.8.5 tap-count probe | `error.responsive.tap_count_probe_ceiling_breach` | |
| `mobile_ops_console_write_attempted` | 403 | `permanent` | §38.6.2 / §38.8.5 Ops Console mobile block | `error.responsive.mobile_ops_console_write_attempted` | |

#### M.5.59 v7.2.0-REM Phase 38 Responsive / Mobile P1 addition {#m-5-59-v72rem-phase-38-responsive-mobile-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `responsive_mobile_error_catalog_completeness` | catalog_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/responsive_mobile_error_catalog_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Error catalog. | M02.3 |
