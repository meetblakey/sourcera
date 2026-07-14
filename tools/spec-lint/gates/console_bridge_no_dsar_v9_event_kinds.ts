/**
 * Gate: `console_bridge_no_dsar_v9_event_kinds`
 *
 * Assertion: V9 DSAR cascade and residency-DR events never cross the Console
 * Bridge event-kind enum.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { consoleBridgeEventKindTokens, missingBridgeKindSourceFindings } from "./console_bridge_event_kind_forbidden_helpers.js";

function forbiddenKind(token: string): string | null {
  if (/^dsar[._-]cascade[._-]/i.test(token) || /^dsar_cascade_/i.test(token)) {
    return "V9 DSAR cascade event";
  }
  if (/^dr[._-](residency|failover)/i.test(token)) {
    return "residency-DR event";
  }
  if (/^org[._-]residency[._-]/i.test(token)) {
    return "residency-DR event";
  }
  if (/^(residency_partition|failover_residency|cross_region_replica)/i.test(token)) {
    return "residency-DR event";
  }
  return null;
}

export const gate: SpecLintGate = {
  id: "console_bridge_no_dsar_v9_event_kinds",
  sourcePhase: "V9",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = missingBridgeKindSourceFindings(doc, "console_bridge_no_dsar_v9_event_kinds");
    for (const item of consoleBridgeEventKindTokens(doc)) {
      const reason = forbiddenKind(item.token);
      if (!reason) continue;
      findings.push({
        file: doc.path,
        line: item.line,
        anchor: item.source,
        matched_text: item.token,
        message: `Console Bridge event_kind ${item.token} names a ${reason}; V9 DSAR cascade and residency-DR events must remain Ops/platform-scoped and must not cross the Console Bridge.`,
      });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
