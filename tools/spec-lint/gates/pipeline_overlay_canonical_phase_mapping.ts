/**
 * Gate: `pipeline_overlay_canonical_phase_mapping`
 *
 * Assertion: §47.3 custom pipeline phases are overlays mapped to canonical
 * Appendix J `pipeline_phase` values and cannot bypass §10 gates.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "pipeline_overlay_canonical_phase_mapping";

const SECTION_47_TOKENS = [
  "#### 47.3.1.E WorkspacePipelinePhaseOverlay",
  "Custom pipeline phases are overlays, not engine forks.",
  "The canonical 13-phase Sourcera Method remains the state machine",
  "| `canonical_phase_span` | Array[Enum] | Non-empty; Appendix J `pipeline_phase` | Mapped canonical phases |",
  "| `gate_checklist_json` | JSONB | Nullable | Customer checklist items; cannot bypass canonical gates |",
  "| `status` | Enum (Appendix J `pipeline_overlay_status`) | Required | `draft`, `active`, `retired` |",
  "custom phase labels and gates are supported when they map to the canonical engine; custom engine phases are still prohibited",
];

const REGISTRATION_TOKENS = [
  "| Pipeline overlays | Appendix I: `pipeline_overlay_invalid_phase_span`, `pipeline_overlay_canonical_gate_bypass`; Appendix G: `pipeline_overlay_activated`; §M.5: `pipeline_overlay_canonical_phase_mapping`. |",
];

const ACCEPTANCE_TOKENS = [
  "Custom pipeline overlays MUST map to canonical `pipeline_phase` values and MUST NOT bypass canonical §10 phase gates.",
];

const APPENDIX_J_TOKENS = [
  "#### `pipeline_overlay_status`",
  "`draft`, `active`, `retired`",
  "**`pipeline_phase` canonical 13-value enum",
  "phase_13_contract_closure",
];

const M5_ROW_TOKENS = [
  "spec-tree §47.3 WorkspacePipelinePhaseOverlay canonical-mapping contract only",
  "product overlay validators, phase-engine enforcement, and runtime tests remain product-pack evidence",
  "Appendix G `pipeline_overlay_activated` row registered",
  "MUST NOT bypass canonical §10 gates",
];

function requireTableRow(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  predicate: (line: string) => boolean,
  tokens: readonly string[],
) {
  const row = findLine(doc, predicate);
  if (!row) {
    push(findings, doc, 0, label, `${label} row is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!row.text.includes(token)) push(findings, doc, row.line, token, `${label} row is missing required token: ${token}`);
  }
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Full-Scope Capability Remediation",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(findings, doc, sectionTextByAnchor(doc, "47.3.1-full-scope-capability-contracts"), "§47.3.1 Full-Scope Capability Contracts", SECTION_47_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "47.3.2-apis-events-errors-and-gates"), "§47.3.2 APIs, Events, Errors, and Gates", REGISTRATION_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "47.3.3-production-capability-acceptance-criteria"), "§47.3.3 Acceptance Criteria", ACCEPTANCE_TOKENS);
    requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-j-controlled-vocabulary-registry"), "Appendix J", APPENDIX_J_TOKENS);

    requireTableRow(findings, doc, "Appendix I pipeline_overlay_invalid_phase_span", (line) => line.trim().startsWith("| `pipeline_overlay_invalid_phase_span` |"), [
      "422",
      "references no canonical phase",
      "`permanent`",
      "`error.pipeline.pipeline_overlay_invalid_phase_span`",
    ]);
    requireTableRow(findings, doc, "Appendix I pipeline_overlay_canonical_gate_bypass", (line) => line.trim().startsWith("| `pipeline_overlay_canonical_gate_bypass` |"), [
      "403",
      "bypass a canonical §10 phase gate",
      "`permanent`",
      "`error.pipeline.pipeline_overlay_canonical_gate_bypass`",
    ]);
    requireTableRow(findings, doc, "Appendix G pipeline_overlay_activated", (line) => line.trim().startsWith("| `pipeline_overlay_activated` |"), [
      "WorkspacePipelinePhaseOverlay transitions to `active`",
      "`workspace_id`",
      "`pipeline_overlay_id`",
      "`canonical_phase_span[]`",
      "`canonical_gate_bypass_blocked=true`",
    ]);

    const m5Row = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
    if (m5Row) {
      for (const token of M5_ROW_TOKENS) {
        if (!m5Row.text.includes(token)) push(findings, doc, m5Row.line, token, `§M.5 ${GATE_ID} row is missing required scope/evidence token: ${token}`);
      }
    }
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
