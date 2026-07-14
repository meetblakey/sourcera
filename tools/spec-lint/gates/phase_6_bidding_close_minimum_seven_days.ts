/**
 * Gate: `phase_6_bidding_close_minimum_seven_days`
 *
 * Assertion: Phase 5 -> Phase 6 rejects below-minimum bidding windows with
 * HTTP 422 `phase_6_bidding_close_below_minimum_window`.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const CODE = "phase_6_bidding_close_below_minimum_window";
const REQUIRED_TEXTS = [
  "bidding_close_at >= phase_6_entered_at + 7 calendar days",
  "calendar authority is §10.1.3 `phase_calendar_timezone`, never `data_residency_region`.",
  "| 422 | `phase_6_bidding_close_below_minimum_window` | Phase 5 -> 6 advance attempted with `bidding_close_at < phase_6_entered_at + 7 calendar days` per §10.6 / §39 row `Phase6BiddingCloseMinimumDuration`. |",
  "| `phase_6_bidding_close_below_minimum_window` | 422 |",
  "Below-floor close returns HTTP 422 `phase_6_bidding_close_below_minimum_window`.",
];

const BAD_STATUS_RE = /\bHTTP\s+(?!422\b)(\d{3})\b/g;
const BAD_TABLE_RE = /^\s*\|\s*(?!422\b)(\d{3})\s*\|\s*`phase_6_bidding_close_below_minimum_window`\s*\|/;

export const gate: SpecLintGate = {
  id: "phase_6_bidding_close_minimum_seven_days",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const phase6 = findSectionByAnchor(doc, "10.6-phase-6-vendor-bidding-opens");
    if (!phase6) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "10.6-phase-6-vendor-bidding-opens",
        message: "§10.6 Phase 6 section is missing.",
      }];
    }

    for (const required of REQUIRED_TEXTS) {
      if (!doc.text.includes(required)) {
        findings.push({
          file: doc.path,
          line: phase6.startLine,
          anchor: phase6.heading.anchor,
          matched_text: required,
          message: `Missing Phase 6 minimum bidding-window binding: ${required}`,
        });
      }
    }

    for (let lineNo = 1; lineNo < doc.lines.length; lineNo++) {
      const line = doc.lines[lineNo] ?? "";
      if (!line.includes(CODE)) continue;

      if (BAD_TABLE_RE.test(line)) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: line.trim(),
          message: "`phase_6_bidding_close_below_minimum_window` table rows must use HTTP 422.",
        });
      }

      BAD_STATUS_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = BAD_STATUS_RE.exec(line)) !== null) {
        findings.push({
          file: doc.path,
          line: lineNo,
          anchor: anchorForLine(doc, lineNo),
          matched_text: m[0],
          message: "`phase_6_bidding_close_below_minimum_window` active prose must use HTTP 422.",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
