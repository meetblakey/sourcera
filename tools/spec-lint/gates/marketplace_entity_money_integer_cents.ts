/**
 * Gate: `marketplace_entity_money_integer_cents`
 *
 * Assertion: Marketplace Listing and EOI Record store money as integer cents
 * plus `currency_code`; Decimal or `*_usd` fields are forbidden in field tables.
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

const MONEY_FIELDS = [
  {
    anchor: "4.5.1-marketplace-listing",
    label: "§4.5.1 Marketplace Listing",
    fields: ["min_price_cents_monthly", "max_price_cents_monthly", "currency_code"],
  },
  {
    anchor: "4.5.2-eoi-record",
    label: "§4.5.2 EOI Record",
    fields: ["estimated_contract_value_cents", "currency_code"],
  },
] as const;

function moneyFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const check of MONEY_FIELDS) {
    const table = tableRows(doc, check.anchor);
    if (!table) {
      push(findings, doc, 0, check.anchor, `${check.label} field table is missing.`);
      continue;
    }
    for (const field of check.fields) {
      const row = rowByField(doc, check.anchor, field);
      if (!row) {
        push(findings, doc, table.header?.line ?? 0, field, `${check.label} is missing money field ${field}.`);
        continue;
      }
      const rowText = row.cells.join(" | ");
      if (field.endsWith("_cents_monthly") || field.endsWith("_value_cents")) {
        if (!rowText.includes("BigInt") || !rowText.includes("integer cents")) {
          push(findings, doc, row.line, field, `${check.label}.${field} must be BigInt integer cents.`);
        }
      }
      if (field === "currency_code" && !rowText.includes("Appendix J `billing_currency`")) {
        push(findings, doc, row.line, field, `${check.label}.currency_code must cite Appendix J billing_currency.`);
      }
    }
    for (const name of fieldNames(doc, check.anchor)) {
      if (name.endsWith("_usd")) {
        push(findings, doc, table.header?.line ?? 0, name, `${check.label} field table must not contain *_usd money fields.`);
      }
    }
    for (const row of table.rows) {
      if (row.cells.join(" | ").includes("Decimal")) {
        push(findings, doc, row.line, "Decimal", `${check.label} field table must not contain Decimal money fields.`);
      }
    }
  }
  requireTokens(findings, doc, "4.5.1-marketplace-listing", "§4.5.1 Marketplace Listing", [
    "`marketplace_listing_price_requires_integer_cents`",
    "migration worker converts existing Decimal values",
  ]);
  requireTokens(findings, doc, "4.5.2-eoi-record", "§4.5.2 EOI Record", [
    "`eoi_contract_value_requires_integer_cents`",
    "`estimated_contract_value_usd` is a legacy migration alias only",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "marketplace_entity_money_integer_cents",
  sourcePhase: "v7.2.0-REM Phase 1.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_billing_singleton",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [...moneyFindings(ctx.masterSpec), ...m5RuntimeActiveFindings(ctx.masterSpec, "marketplace_entity_money_integer_cents")];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

