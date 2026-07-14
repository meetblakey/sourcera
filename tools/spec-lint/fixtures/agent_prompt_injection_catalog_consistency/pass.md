# Prompt Injection Fixture

## 21.6 Agent Failure Handling {#21.6-agent-failure-handling}

| Failure Type | Behavior | User Impact |
|---|---|---|
| Prompt injection detected | Reject call with HTTP 422 `prompt_injection_detected`; write AuditEvent `agent.prompt_injection_detected`, Appendix C event `agent.prompt_injection_detected`, and Appendix G event `agent_prompt_injection_detected`; route qualifying repeats to Trust & Safety per §42.3.1 | Toast: "Request blocked for security. Contact support if you believe this is an error." |

| From | To | Trigger | Conditions | Notes |
|---|---|---|---|---|
| invocation_started | rejected_security | Prompt-injection detector fires | Detector confidence passes security threshold; raw prompt is not echoed to the user | Writes `prompt_injection_detected` error / event rows and does not call the model. |

## 32.10.6 Agent Invocation and Configuration Endpoints {#32.10.6-agent-invocation-and-configuration-endpoints}

| HTTP | Code | Condition |
|---|---|---|
| 422 | `prompt_injection_detected` | Prompt-injection detector rejected the request before provider invocation |

Prompt-injection rejects MUST write the registered audit / Appendix C / Appendix G events and MUST NOT create a provider invocation.

| `agent.prompt_injection_detected` | §21.6 / §32.10.6 prompt-injection detector rejects an Agent request before provider invocation | Trust & Safety Ops queue; |
| `agent_prompt_injection_detected` | Appendix C `agent.prompt_injection_detected` emitted | `org_id`, `console`, `actor_user_id`, `capability_id`, `detection_classifier_id`, `detected_pattern_class`, `request_id`, `source_webhook_event_type='agent.prompt_injection_detected'` |
| `prompt_injection_detected` | 422 | §21 / §32.10.6 agent invocation endpoints | Agent prompt-injection detector rejected the request before provider invocation; AuditEvent, Appendix C, and Appendix G events are emitted. | `error.agent.prompt_injection_detected` |

`agent.prompt_injection_detected`

**Agent action extensions (§21 / §32.10.6).** The following qualified action strings are valid for `entity_type in {ai_operation, agent_feedback_record, org_agent_capability_config, team}`.

**42.3.1.a Per-Severity Triage SLA**

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `agent_prompt_injection_catalog_consistency` | catalog_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/agent_prompt_injection_catalog_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §21.6 / §32.10.6 / Appendix C/G/I/J / §42.3.1 catalog consistency only; prompt-injection classifier runtime behavior, provider-call suppression, audit writes, and incident routing tests remain product-pack evidence) | pr_lint | Assertion. | M02.3 |
