/**
 * Local pr_lint half of `ops_session_numerical_caps_single_source`.
 * The composite §M.5 row remains pending until the Convex deploy validator exists.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "ops_session_numerical_caps_single_source";
const EXPECTED = new Map([
  ["OpsSession request-history alert threshold", "10,000 linked requests"],
  ["OpsSession operational hard-close threshold", "50,000 linked requests"],
  ["OpsSessionApiRequestLink storage capacity", "100,000 rows per OpsSession"],
]);

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const marker = findLine(doc, (line) => line.includes("§39.5 OpsSession Request-History Numerical Singletons"));
  if (!marker) {
    push(findings, doc, 0, "§39.5", "§39.5 OpsSession numerical singleton registry is missing.");
    return findings;
  }
  const table = parseTableAt(doc, marker.line + 1);
  const seen = new Map<string, string>();
  for (const row of table.rows) seen.set(row.cells[0] ?? "", row.cells[1] ?? "");
  for (const [contract, value] of EXPECTED) {
    if (seen.get(contract) !== value) push(findings, doc, marker.line, contract, `§39.5 ${contract} must equal ${value}.`);
  }
  if (seen.size !== EXPECTED.size) push(findings, doc, marker.line, String(seen.size), `§39.5 must contain exactly ${EXPECTED.size} OpsSession cap rows.`);

  const stalePatterns = [
    /50,000 legacy api_request_ids/i,
    /api_request_ids[^\n]{0,80}(?:hard cap|cap)[^\n]{0,20}50,000/i,
    /hard cap 50,000[^\n]{0,80}(?:api-request|api_request|session)/i,
    /100,000 rows per OpsSession/i,
    /10,000 linked requests/i,
    /50,000 linked requests/i,
  ];
  const authorityLines = new Set<number>([marker.line]);
  if (table.header) authorityLines.add(table.header.line);
  for (const row of table.rows) authorityLines.add(row.line);
  for (let line = 1; line < doc.lines.length; line += 1) {
    if (authorityLines.has(line)) continue;
    const text = doc.lines[line] ?? "";
    if (stalePatterns.some((pattern) => pattern.test(text))) {
      push(findings, doc, line, text.trim(), "OpsSession request-history caps must cite §39.5 instead of restating a numeric value.");
    }
  }

  for (const token of [
    "The §39 operational hard-close threshold ends a live session before the distinct §39 storage-capacity ceiling",
    "the higher capacity exists only for migration, forensic import, and defense in depth and is not an operational entitlement",
    "The alert threshold, operational hard-close threshold, and separate link-table storage capacity resolve exclusively from §39",
  ]) {
    if (!doc.text.includes(token)) push(findings, doc, 0, token, `OpsSession consumer contract is missing §39.5 pointer: ${token}`);
  }

  const m5 = findLine(doc, (line) => line.trim().startsWith(`| \`${GATE_ID}\` |`));
  for (const token of [
    "spec_binding_pending_pack_m02_3",
    `tools/spec-lint/gates/${GATE_ID}.ts`,
    "convex/deploy_validators/ops_session_request_history_caps.ts",
  ]) {
    if (!m5?.text.includes(token)) push(findings, doc, m5?.line ?? 0, token, `§M.5 ${GATE_ID} row is missing local/external evidence boundary: ${token}`);
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 50",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
