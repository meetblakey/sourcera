/**
 * Gate: `agent_prompt_injection_catalog_consistency`
 *
 * Assertion: `prompt_injection_detected` is registered consistently across
 * failure handling, API errors, notification events, analytics, audit actions,
 * and incident routing.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "agent_prompt_injection_catalog_consistency";
const SOURCE_PHASE = "v7.2.0-REM Phase 4.12";

const FAILURE_TOKENS = [
  "| Prompt injection detected | Reject call with HTTP 422 `prompt_injection_detected`; write AuditEvent `agent.prompt_injection_detected`, Appendix C event `agent.prompt_injection_detected`, and Appendix G event `agent_prompt_injection_detected`; route qualifying repeats to Trust & Safety per §42.3.1 |",
  "| invocation_started | rejected_security | Prompt-injection detector fires | Detector confidence passes security threshold; raw prompt is not echoed to the user | Writes `prompt_injection_detected` error / event rows and does not call the model. |",
] as const;

const API_TOKENS = [
  "| 422 | `prompt_injection_detected` | Prompt-injection detector rejected the request before provider invocation |",
  "Prompt-injection rejects MUST write the registered audit / Appendix C / Appendix G events and MUST NOT create a provider invocation.",
] as const;

const DOC_TOKENS = [
  "| `agent.prompt_injection_detected` | §21.6 / §32.10.6 prompt-injection detector rejects an Agent request before provider invocation | Trust & Safety Ops queue;",
  "| `agent_prompt_injection_detected` | Appendix C `agent.prompt_injection_detected` emitted | `org_id`, `console`, `actor_user_id`, `capability_id`, `detection_classifier_id`, `detected_pattern_class`, `request_id`, `source_webhook_event_type='agent.prompt_injection_detected'` |",
  "| `prompt_injection_detected` | 422 | §21 / §32.10.6 agent invocation endpoints | Agent prompt-injection detector rejected the request before provider invocation; AuditEvent, Appendix C, and Appendix G events are emitted. | `error.agent.prompt_injection_detected` |",
  "`agent.prompt_injection_detected`",
  "**Agent action extensions (§21 / §32.10.6).** The following qualified action strings are valid for `entity_type in {ai_operation, agent_feedback_record, org_agent_capability_config, team}`",
  "**42.3.1.a Per-Severity Triage SLA",
] as const;

const M5_ROW_TOKENS = [
  "catalog_consistency",
  "spec-tree §21.6 / §32.10.6 / Appendix C/G/I/J / §42.3.1 catalog consistency only",
  "prompt-injection classifier runtime behavior, provider-call suppression, audit writes, and incident routing tests remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "catalog_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "21.6-agent-failure-handling",
      "§21.6 Agent failure handling",
      FAILURE_TOKENS,
    );
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "32.10.6-agent-invocation-and-configuration-endpoints",
      "§32.10.6 Agent APIs",
      API_TOKENS,
    );
    requireDocTokens(findings, ctx.masterSpec, "Prompt-injection cross-catalog contract", DOC_TOKENS);
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
