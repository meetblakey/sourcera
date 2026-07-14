/**
 * Gate: `console_bridge_no_dsar_event_kinds`
 *
 * Assertion: DSAR lifecycle events never cross the Console Bridge event-kind
 * enum. DSAR is subject-rights / privacy infrastructure, not buyer-seller sync.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { consoleBridgeEventKindTokens, missingBridgeKindSourceFindings } from "./console_bridge_event_kind_forbidden_helpers.js";

export const gate: SpecLintGate = {
  id: "console_bridge_no_dsar_event_kinds",
  sourcePhase: "3V",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = missingBridgeKindSourceFindings(doc, "console_bridge_no_dsar_event_kinds");
    for (const item of consoleBridgeEventKindTokens(doc)) {
      if (/\bdsar\b|dsar[._-]/i.test(item.token)) {
        findings.push({
          file: doc.path,
          line: item.line,
          anchor: item.source,
          matched_text: item.token,
          message: `Console Bridge event_kind ${item.token} names a DSAR lifecycle event; DSAR events must not cross the Console Bridge.`,
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
