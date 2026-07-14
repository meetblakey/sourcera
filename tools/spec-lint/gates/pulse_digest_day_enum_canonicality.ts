/**
 * Gate: `pulse_digest_day_enum_canonicality`
 *
 * Assertion: Pulse Digest day selection uses Appendix J `pulse_digest_day`,
 * supports all seven days, and rejects Mon/Wed/Fri-style drift.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "pulse_digest_day_enum_canonicality";

const REQUIRED_TOKENS = [
  "Pulse Digest dispatch uses the recipient's resolved timezone and is enqueued for 09:00 local time on the configured Appendix J `pulse_digest_day`; DST is resolved at enqueue time so the wall-clock delivery target does not drift.",
  "| Cadence | Weekly on Appendix J `pulse_digest_day`; default `monday`. |",
  "- **Pulse-specific controls:** Weekly digest enabled / disabled, Appendix J `pulse_digest_day`, workspace-level audience inclusion, and Solo opt-in state.",
  "| Notification preferences patch | JSON body `{digest_enabled, pulse_digest_day, channel_preferences, notification_item_type_preferences, client_request_id}`; `pulse_digest_day` MUST resolve to Appendix J; reject SMS channel keys until that contract is authored. |",
  "\"pulse_digest_day\": \"monday\"",
  "| Notification preferences | `workspace_id`, `user_id`, `digest_enabled`, `pulse_digest_day`, `channel_preferences`, `notification_item_type_preferences`, `quiet_hours_ref`, `dnd_ref`, `updated_at` |",
  "| `notification_preferences_updated` | §32.10.3.B preference patch commits | `changed_keys`, `pulse_digest_day`, `digest_enabled`, `channel_keys`, `actor_role` |",
  "#### `pulse_digest_day` (§20.4.1, §20.6.1)",
  "`monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`",
  "**Notes.** Weekly Pulse Digest dispatch day. Default is `monday`, but all seven days are supported for locale, timezone, and non-Western workweek compatibility.",
] as const;

const FORBIDDEN_DRIFT_PATTERNS = [
  /Mon\/Wed\/Fri/i,
  /\bmonday,\s*wednesday,\s*friday\b/i,
  /\bmonday\s*\/\s*wednesday\s*\/\s*friday\b/i,
] as const;

function requireDocTokens(findings: Finding[], doc: SpecDoc): void {
  for (const token of REQUIRED_TOKENS) {
    if (!doc.text.includes(token)) {
      push(findings, doc, 0, token, `Pulse Digest day canonicality is missing required token: ${token}`);
    }
  }
}

function rejectDayDrift(findings: Finding[], doc: SpecDoc): void {
  for (let line = 1; line < doc.lines.length; line += 1) {
    const text = doc.lines[line] ?? "";
    if (text.includes(GATE_ID)) continue;
    for (const pattern of FORBIDDEN_DRIFT_PATTERNS) {
      if (pattern.test(text)) {
        push(findings, doc, line, text.trim(), "Pulse Digest day support must resolve to Appendix J `pulse_digest_day` with all seven values.");
      }
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.11",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec);
    rejectDayDrift(findings, ctx.masterSpec);
    findings.push(...m5RuntimeActiveFindings(ctx.masterSpec, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
