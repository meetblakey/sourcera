# 38. Responsive Design & Platform Support {#38.-responsive-design-and-platform-support}

Tier-transition telemetry emits `ui_responsive_breakpoint_crossed` (Appendix G).
Emit `ui_responsive_tier_component_reflowed` with `component_id`, `from_tier`, `to_tier`, `preserved_state_bytes`.
Production sessions emit `ui_mobile_workflow_tap_sequence` events for the top-20 workflows.
A runtime telemetry probe (`ui_mobile_tap_count_probe_exceeded`, Appendix G) also fires on observed production sessions where the instrumented workflow exceeds the ceiling.
a hydration pass that detects it present emits `ui_command_palette_mobile_leak_detected` and closes it.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

### v7.2.0-REM Phase 38 Responsive and Mobile Surface Events (2026-06-23) {#appendix-g-v72rem-phase-38-responsive-mobile}

| Event | Trigger | Key Properties |
|---|---|---|
| `ui_responsive_breakpoint_crossed` | Active viewport crosses a §38.6.1 breakpoint tier after debounce | `from_tier`, `to_tier`, `width_px_bucket_64`, `reason`, `active_console`, `prior_console_value_redacted=true`, `sampling_rate=0.1` |
| `ui_responsive_tier_component_reflowed` | Component reflows under §38.8.1 cross-tier transition contract | `component_id`, `from_tier`, `to_tier`, `preserved_state_bytes_bucket`, `focus_preserved=boolean`, `scroll_preserved=boolean`, `sampling_rate=1.0` |
| `ui_mobile_workflow_tap_sequence` | Instrumented mobile workflow in §38.8.4 completes or abandons | `workflow_kind`, `tap_count`, `completed=boolean`, `device_class`, `destructive_exception=boolean`, `sampling_rate=1.0` for top-20 workflows and `0.1` for non-top-20 workflows |
| `ui_mobile_tap_count_probe_exceeded` | Runtime mobile session exceeds the §38.8.4 workflow ceiling | `workflow_kind`, `observed_taps`, `ceiling`, `user_agent_class`, `device_class`, `canary_cohort=boolean`, `sampling_rate=1.0` |
| `ui_command_palette_mobile_leak_detected` | Hydration finds desktop Command Palette present on `mobile_xs` / `mobile_sm` | `surface`, `route`, `breakpoint_tier`, `hydration_phase`, `auto_closed=true`, `sampling_rate=1.0` |

**Cardinality and privacy discipline.** `width_px` is bucketed to `width_px_bucket_64` before PostHog emission. `active_console` is the emitting console only; contralateral console breakpoint state from `UserUIPreference.last_observed_breakpoint_tier_by_console_json` MUST NOT be emitted.

**Sampling discipline.** High-volume breakpoint crossing is sampled at `0.1`; merge-gate, release-gate, leakage, and ceiling-breach events are 1:1.

#### M.5.59 v7.2.0-REM Phase 38 Responsive / Mobile P1 addition {#m-5-59-v72rem-phase-38-responsive-mobile-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `responsive_posthog_event_catalog_completeness` | catalog_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/responsive_posthog_event_catalog_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Event catalog. | M02.3 |
