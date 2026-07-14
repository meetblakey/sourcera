/**
 * Gate: `pipeline_phase_canonical_13_value_consumer`
 *
 * Assertion: Appendix J defines exactly the canonical 13 buyer pipeline phases,
 * binds them 1:1 to `pipeline_stage_id` 1-13, and active documentation consumes
 * that enum rather than a retired collapsed phase.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const EXPECTED = [
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

const EXPECTED_ANCHORS = [
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

function backtickTokens(s: string): string[] {
  return [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
}

function same(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function tokenLine(doc: SpecDoc, token: string): number {
  for (let i = 1; i < doc.lines.length; i++) {
    if ((doc.lines[i] ?? "").includes(token)) return i;
  }
  return 0;
}

function appendixJText(doc: SpecDoc): { text: string; line: number } {
  const section = findSectionByAnchor(doc, "appendix-j-controlled-vocabulary-registry");
  if (!section) return { text: "", line: 0 };
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
  };
}

export const gate: SpecLintGate = {
  id: "pipeline_phase_canonical_13_value_consumer",
  sourcePhase: "4.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const appendix = appendixJText(doc);
    if (!appendix.text) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "appendix-j-controlled-vocabulary-registry",
        message: "Appendix J is missing; cannot verify canonical pipeline_phase enum.",
      }];
    }

    const enumLineIndex = doc.lines.findIndex((line) => line.includes("`pipeline_phase` canonical 13-value enum"));
    const enumLine = enumLineIndex > 0 ? doc.lines[enumLineIndex] : "";
    if (!enumLine) {
      findings.push({
        file: doc.path,
        line: appendix.line,
        anchor: "appendix-j-controlled-vocabulary-registry",
        message: "Appendix J is missing the `pipeline_phase` canonical 13-value enum declaration.",
      });
    } else {
      const phases = [...new Set(backtickTokens(enumLine).filter((t) => /^phase_\d+_[a-z0-9_]+$/.test(t)))];
      if (!same(phases, EXPECTED)) {
        findings.push({
          file: doc.path,
          line: enumLineIndex,
          anchor: "appendix-j-controlled-vocabulary-registry",
          matched_text: phases.join(", "),
          message: `Appendix J pipeline_phase enum is ${phases.join(", ") || "<empty>"}; expected exactly ${EXPECTED.join(", ")}.`,
        });
      }
    }

    const mappingLine = doc.lines.findIndex((line) => line.startsWith("**Pipeline Phase Integer"));
    const table = mappingLine > 0 ? parseTableAt(doc, mappingLine) : { header: null, rows: [] };
    if (!table.header) {
      findings.push({
        file: doc.path,
        line: appendix.line,
        anchor: "appendix-j-controlled-vocabulary-registry",
        message: "Appendix J Pipeline Phase Integer mapping table is missing.",
      });
    } else {
      for (let i = 1; i <= EXPECTED.length; i++) {
        const row = table.rows.find((r) => (r.cells[0] ?? "").trim() === String(i));
        const expectedPhase = EXPECTED[i - 1];
        const expectedAnchor = EXPECTED_ANCHORS[i - 1];
        if (!row) {
          findings.push({
            file: doc.path,
            line: table.header.line,
            anchor: "appendix-j-controlled-vocabulary-registry",
            matched_text: String(i),
            message: `Pipeline Phase Integer mapping is missing pipeline_stage_id ${i}.`,
          });
          continue;
        }
        if ((row.cells[1] ?? "") !== `\`${expectedPhase}\`` || !(row.cells[2] ?? "").includes(expectedAnchor)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: "appendix-j-controlled-vocabulary-registry",
            matched_text: row.cells.join(" | "),
            message: `pipeline_stage_id ${i} must map to ${expectedPhase} and ${expectedAnchor}.`,
          });
        }
      }
    }

    const workspace = findSectionByTitle(doc, /^4\.3\.1 Workspace\b/);
    const activeWorkspace = findSectionByAnchor(doc, "5.10-active-workspace-definition-(gap-s-7)");
    for (const [section, label] of [[workspace, "§4.3.1 Workspace"], [activeWorkspace, "§5.10 Active Workspace Definition"]] as const) {
      if (!section) {
        findings.push({ file: doc.path, line: 0, message: `${label} section is missing.` });
        continue;
      }
      const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
      for (const phase of EXPECTED) {
        if (!text.includes(phase)) {
          findings.push({
            file: doc.path,
            line: section.startLine,
            anchor: section.heading.anchor,
            matched_text: phase,
            message: `${label} does not consume canonical pipeline_phase value ${phase}.`,
          });
        }
      }
    }

    for (let i = 1; i < doc.lines.length; i++) {
      const line = doc.lines[i] ?? "";
      if (!line.includes("phase_4_5_vendor_discovery")) continue;
      if (/(historical|retired|superseded|forbidden|§M\.5|gate)/i.test(line)) continue;
      findings.push({
        file: doc.path,
        line: i,
        matched_text: "phase_4_5_vendor_discovery",
        message: "Collapsed phase_4_5_vendor_discovery token is forbidden outside historical / retired notes.",
      });
    }

    for (const phase of EXPECTED) {
      if (!appendix.text.includes(phase)) {
        findings.push({
          file: doc.path,
          line: tokenLine(doc, "pipeline_phase"),
          anchor: "appendix-j-controlled-vocabulary-registry",
          matched_text: phase,
          message: `Appendix J is missing canonical pipeline_phase value ${phase}.`,
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
