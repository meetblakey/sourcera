/**
 * Gate: `pipeline_phase_state_machine_canonicality`
 *
 * Assertion: Appendix L.11 contains the complete adjacent-only pipeline state
 * machine and no active Phase 13 -> Phase 12 rollback path.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

const PHASES = [
  "phase_1_stakeholder_alignment",
  "phase_2_requirement_definition",
  "phase_3_use_case_validation",
  "phase_4_vendor_discovery",
  "phase_5_vendor_outreach",
  "phase_6_vendor_bidding",
  "phase_7_response_refinement",
  "phase_8_due_diligence",
  "phase_9_final_clarifications",
  "phase_10_team_scoring",
  "phase_11_score_review",
  "phase_12_selection",
  "phase_13_contract_closure",
];

const GATE_SECTIONS = [
  "§10.2",
  "§10.3",
  "§10.4",
  "§10.5",
  "§10.5",
  "§10.6",
  "§10.7",
  "§10.8",
  "§10.9",
  "§10.10",
  "§10.11",
  "§10.12",
  "§10.13",
];

function cell(s: string | undefined): string {
  return (s ?? "").replace(/`/g, "").trim();
}

export const gate: SpecLintGate = {
  id: "pipeline_phase_state_machine_canonicality",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const section = findSectionByAnchor(doc, "l-11-pipeline-phase-state-machine");
    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "l-11-pipeline-phase-state-machine",
        message: "Appendix L.11 Pipeline Phase State Machine is missing.",
      }];
    }

    const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
    const table = parseTableAt(doc, section.startLine, section.endLine);
    const findings: Finding[] = [];
    if (!table.header) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        anchor: section.heading.anchor,
        message: "Appendix L.11 transition table is missing.",
      });
      return findings;
    }

    const expectedRows: Array<{ from: string; to: string; cite: string }> = [
      { from: "(none)", to: PHASES[0], cite: "workspace_status=draft" },
      ...PHASES.slice(0, -1).map((from, i) => ({ from, to: PHASES[i + 1], cite: GATE_SECTIONS[i] })),
      { from: PHASES[12], to: "(terminal)", cite: "§10.13" },
    ];

    for (const expected of expectedRows) {
      const row = table.rows.find((r) => cell(r.cells[0]) === expected.from && cell(r.cells[1]) === expected.to);
      if (!row) {
        findings.push({
          file: doc.path,
          line: table.header.line,
          anchor: section.heading.anchor,
          matched_text: `${expected.from} -> ${expected.to}`,
          message: `Appendix L.11 is missing transition ${expected.from} -> ${expected.to}.`,
        });
        continue;
      }
      const rowText = row.cells.join(" | ");
      if (!rowText.includes(expected.cite)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: section.heading.anchor,
          matched_text: rowText,
          message: `Appendix L.11 transition ${expected.from} -> ${expected.to} must cite ${expected.cite}.`,
        });
      }
    }

    for (const required of [
      "phase_advancement_backward_transition_forbidden",
      "gate_validation_failed",
      "phase_advancement_concurrent_request_in_flight",
      "phase_advancement_terminal_phase_no_advance",
      "Idempotency-Key",
      "workspace.phase_advanced",
      "Phase 4 and Phase 5 MUST remain distinct engine states",
      "Phase 12 approval rejection MUST NOT move the Workspace backward",
    ]) {
      if (!text.includes(required)) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: section.heading.anchor,
          matched_text: required,
          message: `Appendix L.11 is missing required rejection / AC binding: ${required}`,
        });
      }
    }

    for (const row of table.rows) {
      if (cell(row.cells[0]) === "phase_13_contract_closure" && cell(row.cells[1]) === "phase_12_selection") {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: section.heading.anchor,
          matched_text: row.cells.join(" | "),
          message: "Appendix L.11 must not allow Phase 13 -> Phase 12 rollback.",
        });
      }
    }

    const chargeSection = findSectionByAnchor(doc, "10.13.7-solo-per-evaluation-charge-phase-13-stripe-charge-failure-path");
    if (chargeSection) {
      for (let i = chargeSection.startLine; i <= chargeSection.endLine; i++) {
        const line = doc.lines[i] ?? "";
        const looksLikeRollback =
          /phase reverts|phase reverted|reverts? the phase|from_phase=.*phase_13_contract_closure.*to_phase=.*phase_12_selection|workspace\.phase_advanced.*to_phase=phase_12/i.test(line);
        const explicitlyNegated = /MUST NOT|no phase revert|not a pipeline transition|no `workspace\.phase_advanced`/i.test(line);
        if (looksLikeRollback && !explicitlyNegated) {
          findings.push({
            file: doc.path,
            line: i,
            anchor: chargeSection.heading.anchor,
            matched_text: line.trim(),
            message: "§10.13.7 must not author an active Phase 13 -> Phase 12 rollback path.",
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
