/**
 * Gate: `webhook_default_retry_class`
 * Source phase: v7.2.0-REM Phase 6 (§M.5.18)
 *
 * Assertion: customer webhooks default to Appendix F.1 `standard` unless they
 * are explicitly listed as Appendix F.2 `financial_impact`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import {
  PHASE_6_EVENTS,
  POLICY_INGESTION_EVENTS,
  firstCellBacktickTokens,
  lineForToken,
  requireText,
} from "./catalog_gate_helpers.js";

function defaultClassFindings(
  docPath: string,
  lines: string[],
  anchor: string,
  events: string[],
): Finding[] {
  const rows = new Map(firstCellBacktickTokens({ path: docPath, text: "", lines }, anchor).map((t) => [t.token, t.line]));
  return events.flatMap((event): Finding[] => {
    const line = rows.get(event) ?? 0;
    const text = lines[line] ?? "";
    if (text.includes("`standard` (F.1)")) return [];
    return [{
      file: docPath,
      line,
      anchor,
      matched_text: event,
      message: `${event} must use Appendix F.1 standard retry class unless explicitly registered in Appendix F.2.`,
    }];
  });
}

export const gate: SpecLintGate = {
  id: "webhook_default_retry_class",
  sourcePhase: "v7.2.0-REM Phase 6",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_retry_class_binding",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [
      ...requireText(doc, "appendix-f-webhook-retry-recovery", "Authoring a new webhook event without an explicit retry-class assignment defaults to standard.", "Appendix F.1 must state the webhook default retry-class rule."),
      ...requireText(doc, "appendix-j-v72rem-phase-6", "`webhook_retry_class`", "Appendix J must register the webhook_retry_class enum."),
      ...defaultClassFindings(doc.path, doc.lines, "appendix-c-v72rem-phase-10", POLICY_INGESTION_EVENTS),
      ...defaultClassFindings(doc.path, doc.lines, "appendix-c-v72rem-phase-6", PHASE_6_EVENTS),
    ];
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
