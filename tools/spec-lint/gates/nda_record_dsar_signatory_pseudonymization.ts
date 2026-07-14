/**
 * Gate: `nda_record_dsar_signatory_pseudonymization`
 *
 * Assertion: §4.5.3 NDA Record declares Pattern B for actor UUID FKs and
 * Pattern A string-column pseudonymization for signatory emails, with matching
 * explicit §6.8.4.1 and §6.8.4.3 registry rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  rowByField,
  sectionText,
  tableRows,
} from "./marketplace_entity_gate_helpers.js";

const NDA_FIELDS = ["created_by", "updated_by", "revoked_by", "change_requested_by"] as const;
const SIGNATORY_FIELDS = ["nda_buyer_signatory_email", "nda_seller_signatory_email"] as const;
const PSEUDONYM = "anonymized_<console>_user_<base32(hash)[:16]>@anonymized.invalid";

function fieldFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const anchor = "4.5.3-nda-record";
  const table = tableRows(doc, anchor);
  if (!table) {
    push(findings, doc, 0, anchor, "§4.5.3 NDA Record field table is missing.");
    return findings;
  }
  for (const field of NDA_FIELDS) {
    const row = rowByField(doc, anchor, field);
    if (!row) {
      push(findings, doc, table.header?.line ?? 0, field, `§4.5.3 NDA Record is missing actor FK ${field}.`);
    } else if (!row.cells.join(" | ").includes("Pattern B DSAR treatment")) {
      push(findings, doc, row.line, field, `§4.5.3 ${field} must declare Pattern B DSAR treatment.`);
    }
  }
  for (const field of SIGNATORY_FIELDS) {
    const row = rowByField(doc, anchor, field);
    if (!row) {
      push(findings, doc, table.header?.line ?? 0, field, `§4.5.3 NDA Record is missing signatory field ${field}.`);
    } else if (!row.cells.join(" | ").includes("Pattern A string-column pseudonymization on DSAR")) {
      push(findings, doc, row.line, field, `§4.5.3 ${field} must declare Pattern A string-column pseudonymization.`);
    }
  }
  requireTokens(findings, doc, anchor, "§4.5.3 NDA Record", [
    "`created_by`, `updated_by`, `revoked_by`, and `change_requested_by` follow Pattern B",
    "`nda_buyer_signatory_email` and `nda_seller_signatory_email` follow Pattern A string-column pseudonymization",
    PSEUDONYM,
    "contract row, signature timestamps, NDA type, issuer, version pointer, change-request hash, and non-PII legal facts are preserved",
  ]);
  return findings;
}

function registryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const patternSection = sectionText(doc, "6.8.4.1-cascade-pseudonymization-pattern");
  if (!patternSection) {
    push(findings, doc, 0, "6.8.4.1-cascade-pseudonymization-pattern", "§6.8.4.1 pattern section is missing.");
  } else {
    const rowToken = "| §4.5.3 NDA Record (`created_by`, `updated_by`, `revoked_by`, `change_requested_by`, signatory emails) |";
    for (const token of [
      rowToken,
      "Pattern B for UUID FK fields; Pattern A string-column pseudonymization for `nda_buyer_signatory_email` / `nda_seller_signatory_email`",
      PSEUDONYM,
    ]) {
      if (!patternSection.text.includes(token)) {
        push(findings, doc, patternSection.startLine, token, `§6.8.4.1 must carry the explicit NDA Record assignment token: ${token}`);
      }
    }
  }

  const classSection = sectionText(doc, "6.8.4.3-cascade-class-coverage-registry");
  if (!classSection) {
    push(findings, doc, 0, "6.8.4.3-cascade-class-coverage-registry", "§6.8.4.3 cascade class registry is missing.");
  } else {
    const rowToken = "| §4.5.3 | NDA Record | 5 (binding contract) | Pattern B on `created_by`, `updated_by`, `revoked_by`, `change_requested_by`; Pattern A on `nda_buyer_signatory_email`, `nda_seller_signatory_email` |";
    if (!classSection.text.includes(rowToken)) {
      push(findings, doc, classSection.startLine, rowToken, "§6.8.4.3 NDA Record registry row must use the real §4.5.3 fields, not stale signatory placeholders.");
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "nda_record_dsar_signatory_pseudonymization",
  sourcePhase: "v7.2.0-REM Phase 1.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...fieldFindings(ctx.masterSpec),
      ...registryFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "nda_record_dsar_signatory_pseudonymization"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);

