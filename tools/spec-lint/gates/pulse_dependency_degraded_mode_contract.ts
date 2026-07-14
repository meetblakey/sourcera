/**
 * Gate: `pulse_dependency_degraded_mode_contract`
 *
 * Assertion: §20.9 defines Convex, Loops.so, and Anthropic degraded modes and
 * binds them to provider health, retry/DLQ, Appendix G, and Appendix I signals.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "pulse_dependency_degraded_mode_contract";

const REQUIRED_TOKENS = [
  "15. Convex, Loops.so, and Anthropic degraded modes MUST follow §20.9 and emit the Appendix G failure / retry events named there.",
  "## 20.9 Dependency Failure Modes {#20.9-dependency-failure-modes}",
  "| Convex | Pulse compute or Inbox mutation outage | Read surfaces show the latest successful WorkspacePulseHealth / InboxItem snapshot with stale-state labeling. Mutations return retryable 503 or queue exactly once when the API has already accepted the request. Daily compute retries after provider recovery and MUST NOT create duplicate current-day rows. | §42.6 provider health detector `convex_degraded`; Appendix G `pulse_refresh_requested` carries `degraded_mode=true` when applicable. |",
  "| Loops.so | Digest send failure / 5xx burst | EmailSend follows §41.1 / Appendix F retry and DLQ rules. In-app Inbox and Pulse surfaces remain visible. Digest delivery may be retried without regenerating the AI summary unless the source data changed. | §42.6 detector `loops_degraded`; Appendix C `weekly_digest` retry state and Appendix G `pulse_digest_summary_generation_failed` where summary generation also failed. |",
  "| Anthropic | Summary generation timeout, outage, or policy block | Digest sends deterministic fallback copy with the AI-summary section labeled unavailable. No successful customer-billed AIOperation is posted for the skipped summary. | Appendix G `pulse_digest_summary_generation_failed`; internal error may carry Appendix I `pulse_digest_summary_generation_failed`. |",
  "| Loops.so | `loops_dispatch_failure_burst` | Loops 5xx + DLQ rate > 5% over 15-minute window | `loops_degraded` |",
  "| Convex | `convex_reactivity_lag` | Reactive-query p95 freshness > 2s | `convex_degraded` |",
  "| `pulse_refresh_requested` | §32.10.3.B Pulse refresh endpoint accepts or debounces | `workspace_pulse_health_id`, `refresh_result`, `debounce_active`, `degraded_mode`, `duration_ms` |",
  "| `pulse_digest_summary_generation_failed` | AI summary generation times out, provider fails, or firewall validator blocks output | `failure_code`, `fallback_rendered`, `billable_ai_operation_written`, `firewall_validator`, `provider` |",
  "| `pulse_digest_summary_generation_failed` | 503 | `transient` | §20.9 Anthropic outage / timeout / policy block when summary generation fails and deterministic fallback copy is rendered. | `error.pulse.pulse_digest_summary_generation_failed` |",
  "| `weekly_digest` | Weekly Pulse summary | Workspace Owner, Executive Sponsor | Yes | Yes | Weekly (configurable day/time) |",
] as const;

function requireDocTokens(findings: Finding[], doc: SpecDoc): void {
  for (const token of REQUIRED_TOKENS) {
    if (!doc.text.includes(token)) {
      push(findings, doc, 0, token, `Pulse dependency degraded-mode contract is missing required token: ${token}`);
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.11",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_retry_class_binding",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec);
    findings.push(...m5RuntimeActiveFindings(ctx.masterSpec, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
