/**
 * Gate: `marketplace_entity_lifecycle_enum_completeness`
 *
 * Assertion: §4.5.1 `status`, §4.5.2 `eoi_status`, and §4.5.3 `nda_status`
 * cite Appendix J canonical enums, and each state machine is covered by the
 * matching Appendix J value set.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  appendixEnumValues,
  m5RuntimeActiveFindings,
  push,
  requireExactValues,
  rowByField,
  stateMachineValues,
  tableRows,
} from "./marketplace_entity_gate_helpers.js";

const CHECKS = [
  {
    anchor: "4.5.1-marketplace-listing",
    label: "§4.5.1 Marketplace Listing",
    field: "status",
    enumId: "marketplace_listing_status",
    heading: "### `marketplace_listing_status`",
    values: ["draft", "published", "flagged_for_review", "hidden", "archived", "removed"],
  },
  {
    anchor: "4.5.2-eoi-record",
    label: "§4.5.2 EOI Record",
    field: "eoi_status",
    enumId: "eoi_record_status",
    heading: "### `eoi_record_status`",
    values: ["draft", "submitted", "acknowledged", "approved", "rejected", "withdrawn"],
  },
  {
    anchor: "4.5.3-nda-record",
    label: "§4.5.3 NDA Record",
    field: "nda_status",
    enumId: "nda_record_status",
    heading: "### `nda_record_status`",
    values: ["draft", "pending_buyer", "pending_seller", "changes_requested", "executed", "expired", "revoked"],
  },
] as const;

function lifecycleFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const check of CHECKS) {
    const table = tableRows(doc, check.anchor);
    if (!table) {
      push(findings, doc, 0, check.anchor, `${check.label} field table is missing.`);
      continue;
    }
    const field = rowByField(doc, check.anchor, check.field);
    if (!field) {
      push(findings, doc, table.header?.line ?? 0, check.field, `${check.label} is missing ${check.field}.`);
    } else if (!field.cells.join(" | ").includes(`Appendix J \`${check.enumId}\``)) {
      push(findings, doc, field.line, check.enumId, `${check.label}.${check.field} must cite Appendix J \`${check.enumId}\`.`);
    }

    const machine = stateMachineValues(doc, check.anchor);
    if (!machine) {
      push(findings, doc, table.header?.line ?? 0, "**State Machine.**", `${check.label} state machine is missing.`);
    } else {
      requireExactValues(findings, doc, `${check.label} state machine`, machine.line, machine.values, check.values);
    }

    const appendix = appendixEnumValues(doc, check.heading);
    if (!appendix) {
      push(findings, doc, 0, check.heading, `Appendix J ${check.enumId} heading or value row is missing.`);
    } else {
      requireExactValues(findings, doc, `Appendix J ${check.enumId}`, appendix.line, appendix.values, check.values);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "marketplace_entity_lifecycle_enum_completeness",
  sourcePhase: "v7.2.0-REM Phase 1.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...lifecycleFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "marketplace_entity_lifecycle_enum_completeness")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

