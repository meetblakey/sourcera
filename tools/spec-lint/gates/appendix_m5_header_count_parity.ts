/**
 * Gate: `appendix_m5_header_count_parity`  (Source phase: V11, D-11.3-006)
 * Archetype: catalog row-count parity meta-gate.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `appendix_m5_header_count_parity`; §M.5 authoring contract; D-11.3-003.
 *
 * Assertion (§M.5.4): "Section header row-count claims MUST match the actual
 * gate-row count ... on every PR merging into `main`. Drift fails."
 *
 * Detector: extract the claimed §M.5.4 catalog-index row count from the
 * §M.5.4 header prose ("Total catalog row count post-Phase V11: N rows") and
 * the §M.5.6 restatement ("§M.5.4 catalog-index row count post-V11: N gates"),
 * count the ACTUAL gate rows in the §M.5.4 table, and flag any divergence.
 * Status flips (this pass) do NOT change the row count, so this gate is
 * unaffected by the runtime-status edits — it polices structural drift only.
 *
 * Override path: not_permitted (catalog self-consistency invariant).
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const GATE_ID_CELL = /^`[a-z0-9_]+`$/;
const HEADER_CLAIM_RE = /Total catalog row count post-Phase V11:\s*\*{0,2}(\d+)\s*rows/i;
const M56_CLAIM_RE = /§M\.5\.4 catalog-index row count post-V11:\s*\*{0,2}(\d+)\s*gates/i;

function countGateRows(doc: SpecDoc): { count: number; ok: boolean } {
  const section = findSectionByTitle(doc, "M.5.4 Catalog index");
  if (!section) return { count: 0, ok: false };
  const { rows } = parseTableAt(doc, section.startLine + 1, section.endLine);
  let count = 0;
  for (const row of rows) {
    if (GATE_ID_CELL.test((row.cells[0] ?? "").trim())) count++;
  }
  return { count, ok: count > 0 };
}

function findClaim(doc: SpecDoc, re: RegExp): { value: number; line: number } | null {
  for (let i = 1; i < doc.lines.length; i++) {
    const m = re.exec(doc.lines[i]);
    if (m) return { value: Number(m[1]), line: i };
  }
  return null;
}

export const gate: SpecLintGate = {
  id: "appendix_m5_header_count_parity",
  sourcePhase: "V11",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const { count, ok } = countGateRows(doc);
    if (!ok) {
      return [
        {
          file: doc.path,
          line: 0,
          message: "parse_error: §M.5.4 catalog index not found or parsed zero rows.",
        },
      ];
    }
    for (const [label, re] of [
      ["§M.5.4 header", HEADER_CLAIM_RE],
      ["§M.5.6 restatement", M56_CLAIM_RE],
    ] as const) {
      const claim = findClaim(doc, re);
      if (!claim) {
        findings.push({
          file: doc.path,
          line: 0,
          message: `${label} row-count claim not found; expected a "${re.source}" statement to assert parity against (${count} actual gate rows).`,
        });
      } else if (claim.value !== count) {
        findings.push({
          file: doc.path,
          line: claim.line,
          matched_text: `claim=${claim.value}, actual=${count}`,
          message: `${label} claims ${claim.value} §M.5.4 rows but the table contains ${count} gate rows. Reconcile the header claim or the catalog (D-11.3-003).`,
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
