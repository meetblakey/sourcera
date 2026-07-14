/**
 * Gate: `solo_absorption_cap_event_catalog_completeness`
 *
 * Assertion: `solo.envelope.absorption_cap_reached` resolves through §44.6.5,
 * Appendix C, Appendix G, Appendix I, and Appendix M.1 as Ops-only telemetry.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireRuntimeActive,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "solo_absorption_cap_event_catalog_completeness";
const SOURCE_PHASE = "v7.2.0-REM Phase 44";

const REQUIRED_TOKENS = [
  "5. The engine emits `solo.envelope.absorption_cap_reached` to Ops Finance and opens a SEV-2 incident under §42.3.1; customer webhook, in-app, and email routing are forbidden.",
  "| `solo.envelope.absorption_cap_reached` | Solo Org reaches the §44.6.3.A absorbed-overage hard ceiling | Ops Finance + on-call SRE | Yes | Yes (Ops only) | Yes (Ops only) | Opens a SEV-2 incident per §42.3.1. Payload is Ops-only and includes `console`, `plan_tier`, `envelope_window_id`, `triggering_ai_operation_id`, `consumed_value_cents`, and `absorption_cap_value_cents`. Never customer-routed. |",
  "| `solo.envelope.absorption_cap_reached` | Solo absorbed-overage hard ceiling is reached per §44.6.3.A | Ops Finance + on-call SRE only | Webhook + Ops page; never customer-routed | Per envelope window | `{event_id, org_id, console, plan_tier, envelope_window_id, triggering_ai_operation_id, consumed_value_cents, absorption_cap_value_cents}` | `standard` (F.1) |",
  "| `solo_envelope_absorption_cap_reached` | mirror of `solo.envelope.absorption_cap_reached` | `org_id`, `console`, `plan_tier`, `envelope_window_id`, `triggering_ai_operation_id`, `consumed_value_cents`, `absorption_cap_value_cents` |",
  "| `solo_envelope_absorption_cap_reached` | 429 | §44.6 Solo configuration surfaces |",
  "| Solo absorbed-overage hard ceiling (`absorption_cap_value_dollars`) | §4.8.14 SoloEnvelopeCounter, §44.6.3.A, §44.6.7 #16 | No customer surface — engine-internal fail-closed guard with generic degraded-AI customer copy only after cap reach | Internal-only; Ops Finance and on-call SRE only | Authored Extension AE-V72REM-PH44-PERFORMANCE-SOLO-P1-01. Prevents runaway no-block Solo workflows from creating unbounded margin loss. Emits `solo.envelope.absorption_cap_reached` Ops-only telemetry; never exposes cap, cost, or envelope values to Solo customers. Conformance posture: inherits_§37.1. |",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec, "Solo absorption-cap event catalog", REQUIRED_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
