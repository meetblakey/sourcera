/**
 * Gate: `dsar_documentation_hygiene_consistency`
 *
 * Assertion: DSAR access/erasure anchors, console inventory terms, and
 * Pattern B tombstone wording remain internally consistent.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const GATE_ID = "dsar_documentation_hygiene_consistency";

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({ file: doc.path, line, matched_text: matched, message });
}

function section(doc: SpecDoc, anchor: string, findings: Finding[]) {
  const found = findSectionByAnchor(doc, anchor);
  if (!found) {
    push(findings, doc, 0, anchor, `Required DSAR section ${anchor} is missing.`);
    return "";
  }
  return doc.lines.slice(found.startLine, found.endLine + 1).join("\n");
}

function requireTokens(findings: Finding[], doc: SpecDoc, text: string, label: string, tokens: readonly string[]) {
  for (const token of tokens) {
    if (!text.includes(token)) push(findings, doc, 0, token, `${label} is missing DSAR documentation-hygiene token: ${token}`);
  }
}

function m5Row(doc: SpecDoc) {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (text.trim().startsWith(`| \`${GATE_ID}\` |`)) return { text, line };
  }
  return null;
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const access = section(doc, "6.8.1-right-of-access", findings);
  section(doc, "6.8.2-right-to-erasure-anonymization-on-deprovisioning", findings);
  section(doc, "6.8.3-right-to-erasure-complete-deletion-on-account-closure", findings);
  const retained = section(doc, "6.8.5-audit-integrity-exemption", findings);

  requireTokens(findings, doc, access, "§6.8.1 export inventory", [
    "| Buyer console work | Workspaces (§4.3.1)",
    "| Seller console work | Bid Workspaces (§4.4.1)",
  ]);
  requireTokens(findings, doc, retained, "§6.8.5 Pattern B wording", [
    "**Reversibility of identity-bearing PII.** None.",
    "Pattern B preserves the User UUID only as a tombstone join key",
    "the key cannot restore identity-bearing data",
  ]);

  const row = m5Row(doc);
  if (!row) push(findings, doc, 0, GATE_ID, `§M.5 row ${GATE_ID} is missing.`);
  else requireTokens(findings, doc, row.text, `§M.5 ${GATE_ID} row`, [
    "**`runtime_active`**",
    `tools/spec-lint/gates/${GATE_ID}.ts`,
    "verified PASS on live Master Spec and pass/fail fixtures",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 DSAR documentation hygiene closure",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
