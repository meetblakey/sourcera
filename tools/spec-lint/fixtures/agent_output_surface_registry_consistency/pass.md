# Agent Output Fixture

## 21.3 Guardrails & Hallucination Protection {#21.3-guardrails-and-hallucination-protection}

**Output labeling:** All Agent-generated content displays `[AI-Generated]` label with confidence score inline:
**User feedback loop:** Every Agent output includes "Was this helpful?" (thumbs up/down) and, where the output contains generated text or extracted facts, a "This is wrong" hallucination-report link.
All Agent outputs MUST render `[AI-Generated]` with confidence score when the output is generated, transformed, extracted, summarized, or recommended by an Agent capability.

## 21.6 Agent Failure Handling {#21.6-agent-failure-handling}

| Failure Type | Behavior | User Impact |
|---|---|---|
| Model error / timeout | Retry per §44.1 Agent model retry backoff budget. If retry fails, graceful degradation | Feature works without Agent output. Toast: "\[Feature Name\] suggestion unavailable. You can proceed manually." |
| Context window exceeded | Truncate input to fit window (with priority: most recent requirements first). Return partial results with warning | Toast: "Large request — Agent processed first 500 requirements. Remaining items skipped." |
| Prompt injection detected | Reject call with HTTP 422 `prompt_injection_detected`; write AuditEvent `agent.prompt_injection_detected`, Appendix C event `agent.prompt_injection_detected`, and Appendix G event `agent_prompt_injection_detected`; route qualifying repeats to Trust & Safety per §42.3.1 | Toast: "Request blocked for security. Contact support if you believe this is an error." |

## 32.10.6 Agent Invocation and Configuration Endpoints {#32.10.6-agent-invocation-and-configuration-endpoints}

```json
{
  "agent_output_envelope": {
    "ai_generated_label_required": true,
    "confidence_score_required": true,
    "feedback_enabled": true
  }
}
```

Every invocation response that can render Agent output MUST include an output envelope declaring label, confidence, and feedback requirements.

| Agent suggestion unavailable state | §21.3, §21.6 | "AI suggestion is unavailable right now" inline state with "Try again" when retryable | All |
| Agent large-request degraded state | §21.6, §32.10.6, §44.1 | "This request is too large for one AI run" toast with split / retry affordance where supported | All |
| Agent security-blocked state | §21.6, §32.10.6, Appendix I `prompt_injection_detected` | "We blocked this AI request for safety" toast plus support link for authorized admins | All |
| Agent output label `[AI-Generated]` | §21.3 | Inline `[AI-Generated]` label on every generated output | All |
| Agent confidence score inline display | §21.3, §4.8.2, §4.8.15 | Percent confidence text next to Agent output labels | All |
| Agent feedback thumbs | §21.3, §4.8.16 | "Was this helpful?" thumbs up/down control | All |
| Agent hallucination report link | §21.3, §4.8.16 | "This is wrong" report link on generated text / extracted fact outputs | All |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `agent_output_surface_registry_consistency` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/agent_output_surface_registry_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §21.3 / §21.6 / §32.10.6 / Appendix M.1 surface coverage only; frontend rendering, responsive behavior, provider fallbacks, retry buttons, feedback writes, and runtime security-block tests remain product-pack evidence) | pr_lint | Assertion. | M02.3 |
