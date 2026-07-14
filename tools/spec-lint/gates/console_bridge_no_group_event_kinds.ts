/**
 * Gate: `console_bridge_no_group_event_kinds`
 *
 * Assertion: WorkOS / Org group lifecycle events do not cross the buyer-seller
 * Console Bridge.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { consoleBridgeEventKindTokens, missingBridgeKindSourceFindings } from "./console_bridge_event_kind_forbidden_helpers.js";

const GROUP_EVENT_RE = /(^|[._-])group([._-]|$)|workos[._-]group|group[._-](created|updated|deleted|member)/i;

export const gate: SpecLintGate = {
  id: "console_bridge_no_group_event_kinds",
  sourcePhase: "3V+",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = missingBridgeKindSourceFindings(doc, "console_bridge_no_group_event_kinds");
    for (const item of consoleBridgeEventKindTokens(doc)) {
      if (GROUP_EVENT_RE.test(item.token)) {
        findings.push({
          file: doc.path,
          line: item.line,
          anchor: item.source,
          matched_text: item.token,
          message: `Console Bridge event_kind ${item.token} names a Group lifecycle event; Group events are Org-scoped and must not cross the Console Bridge.`,
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
