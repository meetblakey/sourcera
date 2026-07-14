/**
 * Gate: `workspace_status_canonical_consumer`
 *
 * Assertion: Active Workspace predicates consume `workspace_status` plus the
 * canonical 13-value `pipeline_phase` enum, not ordinal `pipeline_stage_id`
 * comparisons or retired 12-phase vocabularies.
 */

import { computeSectionRanges } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "workspace_status_canonical_consumer";

const PIPELINE_PHASES = [
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

function sectionByTitle(doc: SpecDoc, title: string): { text: string; startLine: number; endLine: number } | null {
  const section = computeSectionRanges(doc).find((range) => range.heading.title.includes(title));
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

function appendixJWorkspaceStatusFindings(findings: Finding[], doc: SpecDoc) {
  const row = findLine(doc, (line) => line.includes("**`workspace_status` enum"));
  if (!row) {
    push(findings, doc, 0, "workspace_status", "Appendix J workspace_status enum row is missing.");
    return;
  }
  for (const token of [
    "`draft`, `active`, `suspended`, `closed`, `archived`",
    "Used by §5.10 Active Workspace Definition",
    "workspace_status = 'active' AND pipeline_phase",
    "phase_13_contract_closure",
    "pre-V4 ordinal `pipeline_stage_id < 13` comparisons remain forbidden",
  ]) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, "Appendix J workspace_status row is missing canonical active-workspace wording.");
  }
}

function isAllowedRetiredContext(line: string): boolean {
  return /\b(pre-V3|pre-V4|retired|superseded|historical|old|prior|V4 doc-string|closure|D-4\.2-001)\b/i.test(line);
}

function scanRetiredPredicates(findings: Finding[], doc: SpecDoc) {
  const retiredPatterns = [
    /pipeline_stage_id\s*<\s*13/,
    /\b12-phase enum\b/i,
    /\b12-value enum\b/i,
    /\bphase_4_5_vendor_discovery\b/,
  ];
  for (let lineNo = 1; lineNo < doc.lines.length; lineNo += 1) {
    const line = doc.lines[lineNo] ?? "";
    for (const pattern of retiredPatterns) {
      const match = line.match(pattern);
      if (match && !isAllowedRetiredContext(line)) {
        push(findings, doc, lineNo, match[0], "Active Workspace predicates must not use retired ordinal or 12-phase pipeline forms.");
      }
    }
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 3V Workspace Status Enum",
  rowClass: "enum_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(findings, doc, sectionByTitle(doc, "5.10 Active Workspace Definition"), "§5.10 Active Workspace Definition", [
      "Workspace.status` ∈ `{active}` per Appendix J `workspace_status` enum",
      "MUST NOT be `draft`, `suspended`, `closed`, or `archived`",
      "Workspace.pipeline_phase` ∈",
      ...PIPELINE_PHASES,
      "integer storage in `pipeline_stage_id` MUST resolve through the Appendix J Pipeline Phase Integer ↔ Enum Mapping table",
      "Pre-V3 prose used the integer comparison `pipeline_stage_id < 13` and the retired pre-V4 12-phase enum",
      "CI gate `workspace_status_canonical_consumer` asserts every active-workspace predicate consumes the enum",
    ]);
    appendixJWorkspaceStatusFindings(findings, doc);
    scanRetiredPredicates(findings, doc);
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
