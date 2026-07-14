/**
 * Gate: `offline_connectivity_mobile_parity_and_telemetry`
 *
 * Assertion: the global offline contract has one owner across web and native
 * clients, aggregates queued writes, and registers its Appendix G telemetry.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "offline_connectivity_mobile_parity_and_telemetry";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.5-optimistic-mutation-rollback-behavior"), "§3.5 offline mutation precedence", [
    "§3.7.10 is the sole top-of-viewport offline owner",
    "per-mutation top banner MUST NOT render",
    "Retry / Discard inline",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "3.7.10-connectivity-offline-signaling"), "§3.7.10 native offline contract", [
    "navigator.onLine",
    "NWPathMonitor on iOS 16+",
    "ConnectivityManager.NetworkCallback on Android API 24+",
    "within 500ms",
    "one global offline window",
    "N pending changes — will sync when you reconnect",
    "ui_offline_banner_shown",
    "ui_offline_banner_dismissed",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-g-section-3-ux-additions"), "Appendix G offline telemetry", [
    "`ui_offline_banner_shown`",
    "`ui_offline_banner_dismissed`",
    "online_signal_source ∈ online_signal_source",
    "pending_changes_count",
    "time_since_last_online_ms",
    "offline_duration_ms",
    "dismiss_reason ∈ offline_banner_dismiss_reason",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-j-section-3-ux-additions"), "Appendix J offline enums", [
    "#### `online_signal_source` (§3.7.10)",
    "`browser_online_event`, `ios_nwpath`, `android_connectivity_callback`",
    "#### `offline_banner_dismiss_reason` (§3.7.10)",
    "`online_event`, `manual_user_dismiss`",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Section 3 offline mobile and telemetry closure",
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
