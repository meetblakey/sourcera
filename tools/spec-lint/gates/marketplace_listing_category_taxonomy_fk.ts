/**
 * Gate: `marketplace_listing_category_taxonomy_fk`
 *
 * Assertion: §4.5.1 Marketplace Listing uses `category_taxonomy_node_id`
 * pointing to §4.5.4 Taxonomy Node where `kind=marketplace_category`; the
 * retired inline `category` enum is allowed only in legacy-migration prose.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  fieldNames,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  rowByField,
  tableRows,
} from "./marketplace_entity_gate_helpers.js";

function fieldFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const anchor = "4.5.1-marketplace-listing";
  const table = tableRows(doc, anchor);
  if (!table) {
    push(findings, doc, 0, anchor, "§4.5.1 Marketplace Listing field table is missing.");
    return findings;
  }
  const row = rowByField(doc, anchor, "category_taxonomy_node_id");
  if (!row) {
    push(findings, doc, table.header?.line ?? 0, "`category_taxonomy_node_id`", "§4.5.1 must define MarketplaceListing.category_taxonomy_node_id.");
  } else {
    const rowText = row.cells.join(" | ");
    for (const token of ["UUID (FK)", "Taxonomy Node (§4.5.4)", "kind=marketplace_category", "Canonical category binding"]) {
      if (!rowText.includes(token)) {
        push(findings, doc, row.line, token, "MarketplaceListing.category_taxonomy_node_id is missing the canonical taxonomy-FK binding.");
      }
    }
  }
  if (fieldNames(doc, anchor).includes("category")) {
    push(findings, doc, table.header?.line ?? 0, "`category`", "§4.5.1 field table must not reintroduce the retired inline category enum.");
  }
  requireTokens(findings, doc, anchor, "§4.5.1 Marketplace Listing", [
    "**Legacy category migration.**",
    "New writes MUST NOT accept the inline enum",
    "`marketplace_listing_category_requires_taxonomy_node`",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "marketplace_listing_category_taxonomy_fk",
  sourcePhase: "v7.2.0-REM Phase 1.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...fieldFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "marketplace_listing_category_taxonomy_fk")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

