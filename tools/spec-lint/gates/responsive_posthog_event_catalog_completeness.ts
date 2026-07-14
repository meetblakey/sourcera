/**
 * Gate: `responsive_posthog_event_catalog_completeness`
 *
 * Assertion: §38 responsive/mobile telemetry resolves to Appendix G with
 * cardinality, privacy, and sampling discipline.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireRuntimeActive,
  RESPONSIVE_SOURCE_PHASE,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "responsive_posthog_event_catalog_completeness";

const REQUIRED_TOKENS = [
  "Tier-transition telemetry emits `ui_responsive_breakpoint_crossed` (Appendix G)",
  "Emit `ui_responsive_tier_component_reflowed` with `component_id`, `from_tier`, `to_tier`, `preserved_state_bytes`.",
  "Production sessions emit `ui_mobile_workflow_tap_sequence` events for the top-20 workflows",
  "A runtime telemetry probe (`ui_mobile_tap_count_probe_exceeded`, Appendix G) also fires on observed production sessions where the instrumented workflow exceeds the ceiling",
  "a hydration pass that detects it present emits `ui_command_palette_mobile_leak_detected` and closes it.",
  "### v7.2.0-REM Phase 38 Responsive and Mobile Surface Events (2026-06-23) {#appendix-g-v72rem-phase-38-responsive-mobile}",
  "| `ui_responsive_breakpoint_crossed` | Active viewport crosses a §38.6.1 breakpoint tier after debounce | `from_tier`, `to_tier`, `width_px_bucket_64`, `reason`, `active_console`, `prior_console_value_redacted=true`, `sampling_rate=0.1` |",
  "| `ui_responsive_tier_component_reflowed` | Component reflows under §38.8.1 cross-tier transition contract | `component_id`, `from_tier`, `to_tier`, `preserved_state_bytes_bucket`, `focus_preserved=boolean`, `scroll_preserved=boolean`, `sampling_rate=1.0` |",
  "| `ui_mobile_workflow_tap_sequence` | Instrumented mobile workflow in §38.8.4 completes or abandons | `workflow_kind`, `tap_count`, `completed=boolean`, `device_class`, `destructive_exception=boolean`, `sampling_rate=1.0` for top-20 workflows and `0.1` for non-top-20 workflows |",
  "| `ui_mobile_tap_count_probe_exceeded` | Runtime mobile session exceeds the §38.8.4 workflow ceiling | `workflow_kind`, `observed_taps`, `ceiling`, `user_agent_class`, `device_class`, `canary_cohort=boolean`, `sampling_rate=1.0` |",
  "| `ui_command_palette_mobile_leak_detected` | Hydration finds desktop Command Palette present on `mobile_xs` / `mobile_sm` | `surface`, `route`, `breakpoint_tier`, `hydration_phase`, `auto_closed=true`, `sampling_rate=1.0` |",
  "**Cardinality and privacy discipline.** `width_px` is bucketed to `width_px_bucket_64` before PostHog emission",
  "`active_console` is the emitting console only; contralateral console breakpoint state from `UserUIPreference.last_observed_breakpoint_tier_by_console_json` MUST NOT be emitted.",
  "**Sampling discipline.** High-volume breakpoint crossing is sampled at `0.1`; merge-gate, release-gate, leakage, and ceiling-breach events are 1:1.",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: RESPONSIVE_SOURCE_PHASE,
  rowClass: "catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Responsive PostHog event catalog", REQUIRED_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
