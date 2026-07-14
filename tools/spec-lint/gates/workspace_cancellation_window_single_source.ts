/**
 * Gate: `workspace_cancellation_window_single_source`
 *
 * Assertion: cancellation timing resolves to §10.14 + §40.2:
 * 14-day undo grace, 30-day processing/recovery, Day-44 hard cutoff.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const REQUIRED_10_14 = [
  "Cancellation Grace Period (Days 0-14)",
  "Cancellation Processing (Days 14-44)",
  "After 14 days, cancellation cannot be undone",
  "During the processing/recovery window (Days 14-44 from cancellation initiation), the Workspace Owner may recover the Workspace:",
  "After Day 44 from cancellation initiation, the Workspace is permanently deleted unless a §40.2 retention exemption applies. No recovery is possible after this cutoff.",
];

const REQUIRED_40_2 = "Workspace cancellation grace + processing window (§10.14) | **14-day undo grace + 30-day processing/recovery window = 44 days from cancellation initiation.**";

const FORBIDDEN = [
  /Within 30 days of cancellation/i,
  /After 30 days \\(Day 44 from cancellation initiation\\)/i,
  /30-day-from-closure purge/i,
  /30-day from closure/i,
];

export const gate: SpecLintGate = {
  id: "workspace_cancellation_window_single_source",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section = findSectionByAnchor(doc, "10.14-bid-workspace-cancellation-protocol");
    const text = section ? doc.lines.slice(section.startLine, section.endLine + 1).join("\n") : "";
    if (!section) {
      return [{ file: doc.path, line: 0, anchor: "10.14-bid-workspace-cancellation-protocol", message: "§10.14 cancellation section is missing." }];
    }

    for (const required of REQUIRED_10_14) {
      if (!text.includes(required)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: required,
          message: `§10.14 is missing canonical cancellation-window text: ${required}`,
        });
      }
    }

    if (!doc.text.includes(REQUIRED_40_2)) {
      findings.push({
        file: doc.path,
        line: doc.lines.findIndex((line) => line.includes("Workspace cancellation grace + processing window")),
        anchor: "40.2-retention-periods-by-entity",
        matched_text: REQUIRED_40_2,
        message: "§40.2 must carry the canonical Workspace cancellation 14+30=44-day row.",
      });
    }

    for (let i = section.startLine; i <= section.endLine; i++) {
      const line = doc.lines[i] ?? "";
      for (const re of FORBIDDEN) {
        if (re.test(line)) {
          findings.push({
            file: doc.path,
            line: i,
            anchor: section.heading.anchor,
            matched_text: line.trim(),
            message: "§10.14 contains stale or ambiguous cancellation-window wording.",
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
