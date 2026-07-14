/**
 * Gate: `inbox_pulse_plan_gating_coverage`
 *
 * Assertion: §20 Inbox/Pulse surfaces resolve to the canonical role, plan,
 * entitlement, Solo-compression, API, and Appendix M surface contracts.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "inbox_pulse_plan_gating_coverage";

const REQUIRED_TOKENS = [
  "| Role and plan gating | §5.11 Inbox & Pulse rows, §34.8.5, §44.6, Appendix M.1 |",
  "When `Workspace.evaluation_owner_mode = solo` or the console plan tier is `buyer_solo`, the full grouped Pulse Inbox, per-component Pulse Health breakdown, In-App Pulse Widget, and Pulse Digest default delivery are suppressed per §2.8.4, §44.6, and Appendix M.1.",
  "| Read Inbox feed / Inbox item detail (§20.2; §32.10.3.B) |",
  "| Mark Inbox item read / dismiss / restore (§20.2.3; §32.10.3.B) |",
  "| Mark all Inbox items read (§20.2.3; mobile simplified per §38.8.2) |",
  "| View Pulse Health Score / trend (§20.3 / §20.5; paid Team Mode; Free has no Pulse per §34.8.5 / Appendix M.1) |",
  "| Refresh Pulse current-day row (§20.3.4; §32.10.3.B debounce) |",
  "| Receive Pulse Digest Email (§20.4; §41.2 `weekly_digest`; `pulse_digest_weekly` AIOperation; Solo opt-in only) |",
  "| View Pulse Digest Archive (§20.5.3) |",
  "| Export Pulse Digest Archive CSV (§20.5.3; §34.1.1 Export Formats; mobile unsupported) |",
  "| Edit Notification Preferences for Inbox / Pulse (§20.6 / §29.3) |",
  "**Purpose.** Bind §20 Inbox, Pulse Health, Pulse Digest Archive, and Notification Preferences workflows to public API routes while preserving Buyer-console scope, §5.11 role gates, §34.8.5 plan gates, Solo compression, §29 preference authority, and §38.8.2 mobile parity.",
  "| GET | `/v1/workspaces/{workspace_id}/pulse` | `read:workspaces` | §5.11 View Pulse Health row; Free has no Pulse per §34.8.5 / Appendix M.1 | `workspace_read` | N/A |",
  "| 403 | `workspace_pulse_plan_required` | Requested Pulse operation is unavailable under §34.8.5 / Appendix M.1 |",
  "| `pulse_digest_weekly` | `hard` | 10 | `business_starter` | `seller_starter` | `pulse_digest_upgrade_cta` |",
  "| `pulse_digest_upgrade_cta` | `entitlement.pulse_digest.starter` | Pulse Digest unlocks at Buyer Business Starter / Seller Starter. |",
  "| Pulse Inbox + InboxItem + Inbox Item Group | §20.2, §4.3.22.1, §4.3.22, §2.8.4 |",
  "| Pulse Health Score (composite of SLA timers, response rates, agreement, etc.) | §20.3, §4.3.22.2, §2.8.4 |",
  "| Pulse Digest Email (weekly cadence) | §20.4, §2.8.4 |",
  "| In-App Pulse Widget | §20.5 | Persistent right-rail widget | All paid |",
  "| Notification Preferences | §20.6 | \"Notification settings\" page | All |",
] as const;

const FORBIDDEN_TOKENS = [
  "Pulse Digest Email (daily / weekly cadence)",
] as const;

function requireDocTokens(findings: Finding[], doc: SpecDoc): void {
  for (const token of REQUIRED_TOKENS) {
    if (!doc.text.includes(token)) {
      push(findings, doc, 0, token, `Inbox/Pulse plan-gating coverage is missing required token: ${token}`);
    }
  }
}

function rejectDocTokens(findings: Finding[], doc: SpecDoc): void {
  for (const token of FORBIDDEN_TOKENS) {
    const line = doc.lines.findIndex((text) => text.includes(token));
    if (line >= 0) {
      push(findings, doc, line, token, `Inbox/Pulse plan-gating coverage contains stale or conflicting token: ${token}`);
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 4.11",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_entitlement_drift",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireDocTokens(findings, ctx.masterSpec);
    rejectDocTokens(findings, ctx.masterSpec);
    findings.push(...m5RuntimeActiveFindings(ctx.masterSpec, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
