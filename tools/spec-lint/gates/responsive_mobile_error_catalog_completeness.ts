/**
 * Gate: `responsive_mobile_error_catalog_completeness`
 *
 * Assertion: §38 responsive/mobile error references resolve to Appendix I.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireRuntimeActive,
  RESPONSIVE_SOURCE_PHASE,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "responsive_mobile_error_catalog_completeness";

const REQUIRED_TOKENS = [
  "- `gesture_out_of_safe_area` (HTTP 422) — touch-start origin within iOS back-gesture safe area; gesture absorbed; no user-visible error, telemetry only.",
  "- `mobile_command_palette_hydration_forbidden` (HTTP 500) — Command Palette rendered on `mobile_xs`/`mobile_sm`; SSR defect; Sentry alert + auto-close.",
  "- `tap_count_probe_ceiling_breach` (CI only, exit code 42) — tap-count probe exceeded ceiling.",
  "- `mobile_ops_console_write_attempted` (HTTP 403) — write against Ops Console from `mobile_xs`/`mobile_sm` session; redirects to `/ops/mobile-unsupported`.",
  "### Responsive / Mobile Surface Errors (§38) {#appendix-i-responsive-mobile-surface-errors}",
  "| `gesture_out_of_safe_area` | 422 | `permanent` | §38.7.3 iOS safe-area gesture filter | `error.responsive.gesture_out_of_safe_area` |",
  "| `mobile_command_palette_hydration_forbidden` | 500 | `permanent` | §38.6.4 / §38.7 mobile Command Palette guard | `error.responsive.mobile_command_palette_hydration_forbidden` |",
  "| `tap_count_probe_ceiling_breach` | CI exit 42 | `permanent` | §38.7.4 / §38.8.5 tap-count probe | `error.responsive.tap_count_probe_ceiling_breach` |",
  "| `mobile_ops_console_write_attempted` | 403 | `permanent` | §38.6.2 / §38.8.5 Ops Console mobile block | `error.responsive.mobile_ops_console_write_attempted` |",
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
    requireDocTokens(findings, ctx.masterSpec, "Responsive/mobile error catalog", REQUIRED_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
