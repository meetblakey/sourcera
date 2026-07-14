/**
 * Gate: `appendix_c_to_appendix_f_retry_class_coverage`
 * Source phase: v7.2.0-REM Phase 6 (§M.5.18)
 *
 * Assertion: Phase 6 and Phase 10 customer webhook rows bind to Appendix F
 * retry classes and do not introduce a third webhook retry taxonomy.
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

function retryClassFindings(
  docLines: string[],
  docPath: string,
  anchor: string,
  expected: string[],
): Finding[] {
  const rows = new Map(firstCellBacktickTokens({ path: docPath, text: "", lines: docLines }, anchor).map((t) => [t.token, t.line]));
  const findings: Finding[] = [];
  for (const event of expected) {
    const line = rows.get(event) ?? 0;
    const text = docLines[line] ?? "";
    if (!/\|\s*`standard`\s*\(F\.1\)\s*\|/.test(text) && !/\|\s*`financial_impact`\s*\(F\.2\)\s*\|/.test(text)) {
      findings.push({
        file: docPath,
        line,
        anchor,
        matched_text: event,
        message: `${event} must resolve to Appendix F.1 standard or Appendix F.2 financial_impact retry class.`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "appendix_c_to_appendix_f_retry_class_coverage",
  sourcePhase: "v7.2.0-REM Phase 6",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [
      ...requireText(doc, "appendix-f-webhook-retry-recovery", "standard retry curve in §F.1", "Appendix F must retain the standard retry-class authority."),
      ...requireText(doc, "appendix-j-v72rem-phase-6", "**`webhook_retry_class`**", "Appendix J must register webhook_retry_class."),
      ...requireText(doc, "appendix-j-v72rem-phase-6", "`standard`, `financial_impact`", "Appendix J webhook_retry_class must remain the binary standard / financial_impact taxonomy."),
      ...retryClassFindings(doc.lines, doc.path, "appendix-c-v72rem-phase-10", POLICY_INGESTION_EVENTS),
      ...retryClassFindings(doc.lines, doc.path, "appendix-c-v72rem-phase-6", PHASE_6_EVENTS),
    ];
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
