/**
 * Gate: `section3_appendix_g_event_name_canonicality`
 *
 * Assertion: §3 uses the Appendix G names for page-state, cursor-presence,
 * and Bulk Action telemetry rather than stale aliases.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "section3_appendix_g_event_name_canonicality";

const STALE = [
  "ui_page_state_changed",
  "ui_retry_storm_suppressed",
  "ui_cursor_presence_joined",
  "ui_cursor_presence_left",
  "ui_cursor_presence_palette_wrapped",
  "ui_cursor_presence_throttled",
  "ui_bulk_action_selection_expanded_to_all_in_filter",
  "ui_bulk_action_completed",
  "ui_bulk_action_cancelled",
  "ui_bulk_action_paused_network",
  "ui_bulk_action_permission_midflight",
  "ui_bulk_action_row_deleted_midflight",
  "ui_bulk_action_destructive_confirm_shown",
] as const;

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.7-loading-empty-error-state-catalog"), "§3.7 Appendix G event consumers", [
    "ui_page_state_exited",
    "ui_page_state_entered",
    "ui_page_state_retry_storm_suppressed",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.9-cursor-presence-visualization"), "§3.9 Appendix G event consumers", [
    "ui_cursor_presence_session_joined",
    "ui_cursor_presence_session_idled",
    "ui_cursor_presence_session_evicted",
    "ui_cursor_presence_hue_wrap_collision_detected",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.10-bulk-action-toolbar"), "§3.10 Appendix G event consumers", [
    "ui_bulk_action_selection_cleared",
    "ui_bulk_action_all_in_filter_selected",
    "ui_bulk_action_cap_breach_warned",
    "ui_bulk_action_pagination_persistence_resolved",
  ]);
  for (const token of STALE) {
    const line = doc.lines.findIndex((value) => value.includes(token));
    if (line >= 0) push(findings, doc, line, token, `§3 retains non-canonical Appendix G event alias: ${token}`);
  }
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Section 3 Appendix G event authority closure",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
