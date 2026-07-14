/**
 * Gate: `agent_output_surface_registry_consistency`
 *
 * Assertion: Agent output affordances named by §21.3 / §21.6 are all
 * represented in Appendix M.1 surface rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  requireDocTokens,
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "agent_output_surface_registry_consistency";
const SOURCE_PHASE = "v7.2.0-REM Phase 4.12";

const AGENT_GUARDRAIL_TOKENS = [
  "**Output labeling:** All Agent-generated content displays `[AI-Generated]` label with confidence score inline:",
  "**User feedback loop:** Every Agent output includes \"Was this helpful?\" (thumbs up/down) and, where the output contains generated text or extracted facts, a \"This is wrong\" hallucination-report link.",
] as const;

const FAILURE_TOKENS = [
  "| Model error / timeout | Retry per §44.1 Agent model retry backoff budget. If retry fails, graceful degradation | Feature works without Agent output. Toast: \"\\[Feature Name\\] suggestion unavailable. You can proceed manually.\" |",
  "| Context window exceeded | Truncate input to fit window (with priority: most recent requirements first). Return partial results with warning | Toast: \"Large request — Agent processed first 500 requirements. Remaining items skipped.\" |",
  "| Prompt injection detected | Reject call with HTTP 422 `prompt_injection_detected`; write AuditEvent `agent.prompt_injection_detected`, Appendix C event `agent.prompt_injection_detected`, and Appendix G event `agent_prompt_injection_detected`; route qualifying repeats to Trust & Safety per §42.3.1 | Toast: \"Request blocked for security. Contact support if you believe this is an error.\" |",
] as const;

const API_TOKENS = [
  "\"agent_output_envelope\": {",
  "\"ai_generated_label_required\": true,",
  "\"confidence_score_required\": true,",
  "\"feedback_enabled\": true",
  "Every invocation response that can render Agent output MUST include an output envelope declaring label, confidence, and feedback requirements.",
] as const;

const APPENDIX_M_TOKENS = [
  "All Agent outputs MUST render `[AI-Generated]` with confidence score when the output is generated, transformed, extracted, summarized, or recommended by an Agent capability.",
  "| Agent suggestion unavailable state | §21.3, §21.6 | \"AI suggestion is unavailable right now\" inline state with \"Try again\" when retryable | All |",
  "| Agent large-request degraded state | §21.6, §32.10.6, §44.1 | \"This request is too large for one AI run\" toast with split / retry affordance where supported | All |",
  "| Agent security-blocked state | §21.6, §32.10.6, Appendix I `prompt_injection_detected` | \"We blocked this AI request for safety\" toast plus support link for authorized admins | All |",
  "| Agent output label `[AI-Generated]` | §21.3 | Inline `[AI-Generated]` label on every generated output | All |",
  "| Agent confidence score inline display | §21.3, §4.8.2, §4.8.15 | Percent confidence text next to Agent output labels | All |",
  "| Agent feedback thumbs | §21.3, §4.8.16 | \"Was this helpful?\" thumbs up/down control | All |",
  "| Agent hallucination report link | §21.3, §4.8.16 | \"This is wrong\" report link on generated text / extracted fact outputs | All |",
] as const;

const M5_ROW_TOKENS = [
  "spec_tree_lint",
  "spec-tree §21.3 / §21.6 / §32.10.6 / Appendix M.1 surface coverage only",
  "frontend rendering, responsive behavior, provider fallbacks, retry buttons, feedback writes, and runtime security-block tests remain product-pack evidence",
] as const;

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: SOURCE_PHASE,
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "21.3-guardrails-and-hallucination-protection",
      "§21.3 Agent guardrails",
      AGENT_GUARDRAIL_TOKENS,
    );
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
    requireDocTokens(findings, ctx.masterSpec, "Agent output Appendix M surface registry", APPENDIX_M_TOKENS);
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
