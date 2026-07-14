/**
 * Gate: `pipeline_surface_compression_engine_unchanged`
 *
 * Assertion: Pipeline Surface Compression is a rendering layer. The Method
 * engine, phase advancement API, audit/webhook side effects, and Appendix M
 * engine rows remain the authority.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const PHASE_HEADINGS = [
  /^10\.2 Phase 1: Stakeholder Alignment & Discovery/,
  /^10\.3 Phase 2: Requirement Definition/,
  /^10\.4 Phase 3: Use Case Definition & Validation/,
  /^10\.5 Phase 4-5: Vendor Discovery & Outreach/,
  /^10\.6 Phase 6: Vendor Bidding Opens/,
  /^10\.7 Phase 7: Vendor Response Refinement/,
  /^10\.8 Phase 8: Buyer Due Diligence & Demos/,
  /^10\.9 Phase 9: Final Vendor Clarifications/,
  /^10\.10 Phase 10: Team Evaluation & Scoring/,
  /^10\.11 Phase 11: Score Review & Consensus/,
  /^10\.12 Phase 12: Selection & Recommendation/,
  /^10\.13 Phase 13: Contract & Closure/,
];

function sectionText(doc: SpecDoc, anchor: string): { line: number; text: string; anchor?: string } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    line: section.startLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    anchor: section.heading.anchor,
  };
}

function requireTokens(
  doc: SpecDoc,
  section: { line: number; text: string; anchor?: string } | null,
  label: string,
  tokens: string[],
): Finding[] {
  if (!section) {
    return [{ file: doc.path, line: 0, anchor: label, message: `${label} section is missing.` }];
  }
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: section.line,
        anchor: section.anchor,
        matched_text: token,
        message: `${label} is missing engine-unchanged binding: ${token}`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "pipeline_surface_compression_engine_unchanged",
  sourcePhase: "14.6",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const pipelineCompression = sectionText(doc, "3.14-pipeline-surface-compression");
    findings.push(...requireTokens(doc, pipelineCompression, "§3.14 Pipeline Surface Compression", [
      "The 13-phase pipeline remains the engine of record",
      "every Phase Advancement API call (§10.16) still transitions one of the 13 engine phases",
      "every audit event (§4.6.1) still names the engine phase",
      "every webhook (§31) still fires on the same engine triggers",
      "The four-step bar is a *rendering* of `pipeline_stage_id`",
      "**`pipeline_surface_compression_engine_unchanged`.** No Phase 14.6 edit may change any §10 phase definition, any §10.16 Phase Advancement API contract, any §4.6.1 audit-event action, any §31 webhook trigger, or any Appendix M Phase-row engine-cite for Phases 1–13. The compression is a pure rendering layer.",
    ]));

    for (const heading of PHASE_HEADINGS) {
      if (!findSectionByTitle(doc, heading)) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: String(heading),
          message: `§10 Method engine heading is missing or renamed: ${heading}`,
        });
      }
    }

    const phaseApi = sectionText(doc, "10.16-phase-advancement-api");
    findings.push(...requireTokens(doc, phaseApi, "§10.16 Phase Advancement API", [
      "POST /v1/workspaces/{workspace_id}/advance",
      "The §32-canonical endpoint is `POST /v1/workspaces/{workspace_id}/advance`",
      "Phase advancement is available via REST API and UI",
      "phase_advanced",
      "workspace.phase_advanced",
    ]));

    const appendixJ = sectionText(doc, "appendix-j-controlled-vocabulary-registry");
    findings.push(...requireTokens(doc, appendixJ, "Appendix J Pipeline Phase", [
      "**`pipeline_phase` canonical 13-value enum",
      "`phase_1_stakeholder_alignment`",
      "`phase_13_contract_closure`",
      "§10.16 Phase Advancement API request schema",
      "Appendix C `phase_advanced` event payload `from_phase` / `to_phase`",
    ]));

    const appendixM = sectionText(doc, "appendix-m-surface-engine-mapping");
    findings.push(...requireTokens(doc, appendixM, "Appendix M Pipeline Surface Compression", [
      "| `pipeline_stage_id` integer (0–15) | §4.3.1 Workspace, §4.4.1 Bid Workspace, §10 |",
      "| Phase Advancement API (POST `/v1/workspaces/{workspace_id}/advance`) | §10.16 |",
      "| Pipeline Surface Compression (§3.14, closed Phase 14.6) |",
      "The §3.14.4 invariants (`pipeline_surface_compression_engine_unchanged`, `pipeline_surface_compression_step_to_phase_canonical`, `pipeline_surface_compression_no_separate_seller_phase_counter`, `pipeline_surface_compression_team_mode_unchanged_buyer`, `pipeline_surface_compression_seller_always_compressed`, `pipeline_surface_compression_soft_gate_solo_only`) are CI-gate identifiers wired in Phase 14.18.",
    ]));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
