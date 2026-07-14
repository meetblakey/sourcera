# 20. Inbox & Pulse {#20.-inbox-and-pulse}

## 20.7 Acceptance Criteria {#20.7-acceptance-criteria}

15. Convex, Loops.so, and Anthropic degraded modes MUST follow §20.9 and emit the Appendix G failure / retry events named there.

## 20.9 Dependency Failure Modes {#20.9-dependency-failure-modes}

| Dependency | Failure mode | Required behavior | Observability |
| :---- | :---- | :---- | :---- |
| Convex | Pulse compute or Inbox mutation outage | Read surfaces show the latest successful WorkspacePulseHealth / InboxItem snapshot with stale-state labeling. Mutations return retryable 503 or queue exactly once when the API has already accepted the request. Daily compute retries after provider recovery and MUST NOT create duplicate current-day rows. | §42.6 provider health detector `convex_degraded`; Appendix G `pulse_refresh_requested` carries `degraded_mode=true` when applicable. |
| Loops.so | Digest send failure / 5xx burst | EmailSend follows §41.1 / Appendix F retry and DLQ rules. In-app Inbox and Pulse surfaces remain visible. Digest delivery may be retried without regenerating the AI summary unless the source data changed. | §42.6 detector `loops_degraded`; Appendix C `weekly_digest` retry state and Appendix G `pulse_digest_summary_generation_failed` where summary generation also failed. |
| Anthropic | Summary generation timeout, outage, or policy block | Digest sends deterministic fallback copy with the AI-summary section labeled unavailable. No successful customer-billed AIOperation is posted for the skipped summary. | Appendix G `pulse_digest_summary_generation_failed`; internal error may carry Appendix I `pulse_digest_summary_generation_failed`. |

### 42.6.0 External Provider Health Detectors {#42.6.0-external-provider-health-detectors}

| Loops.so | `loops_dispatch_failure_burst` | Loops 5xx + DLQ rate > 5% over 15-minute window | `loops_degraded` |
| Convex | `convex_reactivity_lag` | Reactive-query p95 freshness > 2s | `convex_degraded` |

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| `pulse_refresh_requested` | §32.10.3.B Pulse refresh endpoint accepts or debounces | `workspace_pulse_health_id`, `refresh_result`, `debounce_active`, `degraded_mode`, `duration_ms` |
| `pulse_digest_summary_generation_failed` | AI summary generation times out, provider fails, or firewall validator blocks output | `failure_code`, `fallback_rendered`, `billable_ai_operation_written`, `firewall_validator`, `provider` |

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

| `pulse_digest_summary_generation_failed` | 503 | `transient` | §20.9 Anthropic outage / timeout / policy block when summary generation fails and deterministic fallback copy is rendered. | `error.pulse.pulse_digest_summary_generation_failed` |

## Appendix C: Notification Event Catalog {#appendix-c-notification-event-catalog}

| `weekly_digest` | Weekly Pulse summary | Workspace Owner, Executive Sponsor | Yes | Yes | Weekly (configurable day/time) |

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pulse_dependency_degraded_mode_contract` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/pulse_dependency_degraded_mode_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §20.9 MUST define Convex, Loops.so, and Anthropic degraded modes and bind each to §42.6 / §41 / Appendix G observability behavior. | M02.3 |
