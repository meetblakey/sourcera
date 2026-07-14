/**
 * Gate: `marketplace_entity_convention_bar_completeness`
 *
 * Assertion: §4.5.1, §4.5.2, and §4.5.3 each carry the required production
 * entity convention blocks: field table, indexes, scope, state machine,
 * retention/DSAR/residency, failure modes, and numbered acceptance criteria.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  fieldNames,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionText,
  tableRows,
} from "./marketplace_entity_gate_helpers.js";

const SECTIONS = [
  { anchor: "4.5.1-marketplace-listing", label: "§4.5.1 Marketplace Listing" },
  { anchor: "4.5.2-eoi-record", label: "§4.5.2 EOI Record" },
  { anchor: "4.5.3-nda-record", label: "§4.5.3 NDA Record" },
] as const;

function conventionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const sectionInfo of SECTIONS) {
    const section = sectionText(doc, sectionInfo.anchor);
    if (!section) {
      push(findings, doc, 0, sectionInfo.anchor, `${sectionInfo.label} section is missing.`);
      continue;
    }
    const table = tableRows(doc, sectionInfo.anchor);
    if (!table?.header || table.header.cells.join("|") !== "Field|Type|Constraints|Notes") {
      push(findings, doc, section.startLine, "Field | Type | Constraints | Notes", `${sectionInfo.label} must carry a production field table.`);
    }
    for (const field of ["id", "created_at", "updated_at", "created_by", "updated_by", "deleted_at"]) {
      if (!fieldNames(doc, sectionInfo.anchor).includes(field)) {
        push(findings, doc, section.startLine, field, `${sectionInfo.label} is missing required convention field ${field}.`);
      }
    }
    requireTokens(findings, doc, sectionInfo.anchor, sectionInfo.label, [
      "**Scope:",
      "**Indexes.**",
      "**State Machine.**",
      "**Retention, DSAR, and residency.**",
      "**Failure Modes Addressed.**",
      "**Acceptance Criteria.**",
    ]);
    if (!/\n1\.\s+/.test(section.text) || !/\n[5-9]\.\s+/.test(section.text)) {
      push(findings, doc, section.startLine, "Acceptance Criteria", `${sectionInfo.label} must contain numbered acceptance criteria with at least five checks.`);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "marketplace_entity_convention_bar_completeness",
  sourcePhase: "v7.2.0-REM Phase 1.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...conventionFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "marketplace_entity_convention_bar_completeness")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

