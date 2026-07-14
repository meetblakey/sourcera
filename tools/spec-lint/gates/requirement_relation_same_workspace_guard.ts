/**
 * Gate: `requirement_relation_same_workspace_guard`
 *
 * Assertion: §47.3 requirement hierarchy/blocker relations are fully specified
 * as same-Workspace, acyclic, phase-gating relations with Appendix I/J/G
 * registrations and an explicit §M.5 evidence boundary.
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

const GATE_ID = "requirement_relation_same_workspace_guard";

const SECTION_47_TOKENS = [
  "#### 47.3.1.D RequirementRelation",
  "| `workspace_id` | UUID | FK -> Workspace | Same Workspace for both endpoints |",
  "| `source_requirement_id` | UUID | FK -> Requirement | Child or blocked requirement depending on relation kind |",
  "| `target_requirement_id` | UUID | FK -> Requirement | Parent or blocker |",
  "| `relation_kind` | Enum (Appendix J `requirement_relation_kind`) | Required | `parent_child`, `blocks`, `relates_to`, `duplicates`, `supersedes` |",
  "Relations are same-Workspace only, acyclic for `parent_child`, and cannot point to deleted Requirements.",
  "Phase advancement fails with HTTP 409 `requirement_blocker_unresolved` when an active `blocks` relation targets an unresolved blocking requirement required by the gate.",
];

const REGISTRATION_TOKENS = [
  "| Requirement relations | Appendix I: `requirement_relation_cycle_detected`, `requirement_blocker_unresolved`; Appendix G: `requirement_relation_changed`; §M.5: `requirement_relation_same_workspace_guard`. |",
];

const ACCEPTANCE_TOKENS = [
  "Requirement hierarchy and blocker relations MUST be same-Workspace, acyclic where hierarchical, and enforce phase gates for unresolved blockers.",
];

const APPENDIX_J_TOKENS = [
  "#### `requirement_relation_kind`",
  "`parent_child`, `blocks`, `relates_to`, `duplicates`, `supersedes`",
];

const M5_ROW_TOKENS = [
  "spec-tree §47.3 RequirementRelation same-Workspace / acyclic / blocker contract only",
  "product relation write validators, phase-advancement enforcement, and runtime tests remain product-pack evidence",
  "Appendix G `requirement_relation_changed` row registered",
  "phase advancement MUST reject unresolved `blocks` relations",
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

    requireTableRow(findings, doc, "Appendix I requirement_relation_cycle_detected", (line) => line.trim().startsWith("| `requirement_relation_cycle_detected` |"), [
      "422",
      "would create a cycle",
      "`permanent`",
      "`error.requirement.requirement_relation_cycle_detected`",
    ]);
    requireTableRow(findings, doc, "Appendix I requirement_blocker_unresolved", (line) => line.trim().startsWith("| `requirement_blocker_unresolved` |"), [
      "409",
      "blocked by an unresolved active Requirement blocker",
      "`permanent`",
      "`error.requirement.requirement_blocker_unresolved`",
    ]);
    requireTableRow(findings, doc, "Appendix G requirement_relation_changed", (line) => line.trim().startsWith("| `requirement_relation_changed` |"), [
      "RequirementRelation created, resolved, archived, or restored",
      "`workspace_id`",
      "`requirement_relation_id`",
      "`relation_kind`",
      "`same_workspace_validated=true`",
      "`cycle_check_passed=true`",
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
