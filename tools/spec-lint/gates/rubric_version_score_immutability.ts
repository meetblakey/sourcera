/**
 * Gate: `rubric_version_score_immutability`
 *
 * Assertion: §47.3 custom rubrics are fully specified in the spec tree:
 * versioned rubric rows, immutable historical scoring, Appendix I/J/G
 * registrations, acceptance criteria, and the §M.5 evidence boundary.
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

const GATE_ID = "rubric_version_score_immutability";

const SECTION_47_TOKENS = [
  "#### 47.3.1.C WorkspaceScoringRubricVersion",
  "| `version` | Integer | >= 1; unique per Workspace | Monotonic |",
  "| `status` | Enum (Appendix J `rubric_version_status`) | Required | `draft`, `active`, `retired`, `locked` |",
  "| `grade_scale_json` | JSONB | Required | FM/PM/DNM/EX plus any customer labels; values remain within §13.2 bounds |",
  "| `pm_default_value` | Decimal | 0.1-0.9 | Snapshot value |",
  "Score calculations persist the rubric version used so historical rankings do not drift.",
];

const REGISTRATION_TOKENS = [
  "| Custom rubrics | Appendix I: `rubric_version_locked`, `rubric_activation_requires_approval`; Appendix G: `scoring_rubric_version_activated`; §M.5: `rubric_version_score_immutability`. |",
];

const ACCEPTANCE_TOKENS = [
  "Rubric versions MUST preserve historical scoring. Activating a new rubric cannot change an already-submitted ScoreGradeEntry or finalized Selection Record.",
];

const APPENDIX_J_TOKENS = [
  "#### `rubric_version_status`",
  "`draft`, `active`, `retired`, `locked`",
];

const M5_ROW_TOKENS = [
  "spec-tree §47.3 WorkspaceScoringRubricVersion immutability contract only",
  "product rubric activation transactions, score persistence, and runtime tests remain product-pack evidence",
  "Appendix G `scoring_rubric_version_activated` row registered",
  "historical ScoreGradeEntry / SelectionRecord calculations unchanged",
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
  rowClass: "data_model_contract",
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

    requireTableRow(findings, doc, "Appendix I rubric_version_locked", (line) => line.trim().startsWith("| `rubric_version_locked` |"), [
      "409",
      "§47.3 launch-contract endpoint families",
      "cannot mutate",
      "`permanent`",
      "`error.scoring.rubric_version_locked`",
    ]);
    requireTableRow(findings, doc, "Appendix I rubric_activation_requires_approval", (line) => line.trim().startsWith("| `rubric_activation_requires_approval` |"), [
      "403",
      "requires approval",
      "`permanent`",
      "`error.scoring.rubric_activation_requires_approval`",
    ]);
    requireTableRow(findings, doc, "Appendix G scoring_rubric_version_activated", (line) => line.trim().startsWith("| `scoring_rubric_version_activated` |"), [
      "WorkspaceScoringRubricVersion transitions to `active`",
      "`workspace_id`",
      "`rubric_version_id`",
      "`prior_rubric_version_id`",
      "`historical_scores_preserved=true`",
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
