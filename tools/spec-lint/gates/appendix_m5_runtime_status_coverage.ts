/**
 * Gate: `appendix_m5_runtime_status_coverage`  (Source phase: V11, D-11.3-006)
 * Archetype: catalog self-consistency meta-gate.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `appendix_m5_runtime_status_coverage`; §M.5.3 schema; D-11.3-001.
 *
 * Assertion (§M.5.4): "Every §M.5 catalog row MUST carry a non-null
 * `Runtime status` value drawn from the canonical enum (`runtime_active`,
 * `spec_binding_pending_pack_<id>`, `spec_binding_release_gate_only`). Missing
 * or malformed value fails."
 *
 * Detector: parse the §M.5.4 catalog index table; for every gate row (first
 * cell is a back-ticked snake_case Gate ID — section-divider rows like
 * `| **Phase 14.1 — Principle 9** |` are skipped), extract the `Runtime status`
 * column (col index 2 of the 7-column index) and assert it carries a canonical
 * enum token. This gate self-validates the runtime-status edits made by THIS
 * pass (the eight rows flipped to `runtime_active`).
 *
 * Override path: not_permitted (catalog self-consistency invariant; runtime-
 * status disclosure is the precondition for implementation-pack wiring).
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findSectionByTitle,
  parseTableAt,
  anchorForLine,
} from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const GATE_ID_CELL = /^`[a-z0-9_]+`$/;
const STATUS_ENUM =
  /(runtime_active|spec_binding_pending_pack_[a-z0-9_]+|spec_binding_release_gate_only)/;

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

export const gate: SpecLintGate = {
  id: "appendix_m5_runtime_status_coverage",
  sourcePhase: "V11",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc: SpecDoc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section = findSectionByTitle(doc, "M.5.4 Catalog index");
    if (!section) {
      return [
        {
          file: doc.path,
          line: 0,
          message: "parse_error: §M.5.4 Catalog index section not found.",
        },
      ];
    }
    const { rows } = parseTableAt(doc, section.startLine + 1, section.endLine);
    let gateRowCount = 0;
    for (const row of rows) {
      const idCell = (row.cells[0] ?? "").trim();
      if (!GATE_ID_CELL.test(idCell)) continue; // skip phase-divider rows
      gateRowCount++;
      const statusCell = stripMd(row.cells[2] ?? "");
      if (!STATUS_ENUM.test(statusCell)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: `${idCell} → Runtime status: "${statusCell || "<empty>"}"`,
          message: `§M.5.4 row ${idCell} has a missing or malformed Runtime status; expected one of runtime_active / spec_binding_pending_pack_<id> / spec_binding_release_gate_only.`,
        });
      }
    }
    if (gateRowCount === 0) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        message: "parse_error: §M.5.4 catalog index parsed zero gate rows.",
      });
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
