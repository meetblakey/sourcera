/**
 * Gate: `appendix_i_internal_event_no_http_status`  (Source phase: V8.4)
 * Archetype: named-subsection table-column-shape constraint.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `appendix_i_internal_event_no_http_status`; Appendix I; defect D-V8.4-011.
 *
 * Assertion (§M.5.4): "Rows in [the Appendix I 'Internal Integrity Events' and
 * 'Polling Payload Flags'] sub-sections MUST NOT carry an HTTP status column;
 * the catalog convention requires explicit non-HTTP shape annotations."
 * These events are internal integrity signals / polling flags, not HTTP error
 * responses, so an HTTP status would mis-shape the catalog (D-V8.4-011).
 *
 * Detector: locate each named sub-section; parse its table; flag (a) any
 * column header that is HTTP-status-shaped (`http`/`status code`) carrying a
 * 3-digit value, or (b) any data cell that is a bare 3-digit HTTP status token.
 *
 * Override path: not_permitted (catalog shape invariant).
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  computeSectionRanges,
  parseTableAt,
  anchorForLine,
} from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const TARGET_SUBSECTIONS = ["Internal Integrity Events", "Polling Payload Flags"];
const HTTP_STATUS_TOKEN = /^(1\d\d|2\d\d|3\d\d|4\d\d|5\d\d)$/;
const HTTP_HEADER_RE = /\b(http|status\s*code|http\s*status)\b/i;

function scanSubsection(doc: SpecDoc, title: string): Finding[] {
  const findings: Finding[] = [];
  const ranges = computeSectionRanges(doc);
  const section = ranges.find((r) => r.heading.title.includes(title));
  if (!section) return findings; // sub-section absent → nothing to assert
  const { header, rows } = parseTableAt(doc, section.startLine + 1, section.endLine);
  if (!header) return findings;

  // (a) HTTP-status column present?
  const httpCol = header.cells.findIndex((c) => HTTP_HEADER_RE.test(c));
  if (httpCol >= 0) {
    for (const row of rows) {
      const v = (row.cells[httpCol] ?? "").replace(/[`*]/g, "").trim();
      if (HTTP_STATUS_TOKEN.test(v)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: `${header.cells[httpCol]} = ${v}`,
          message: `Appendix I "${title}" row carries an HTTP status (${v}); internal/integrity events MUST NOT carry an HTTP status column (D-V8.4-011).`,
        });
      }
    }
  }

  // (b) bare HTTP-status token in any cell (defensive — catches an HTTP value
  // placed without a named header column).
  for (const row of rows) {
    for (let c = 0; c < row.cells.length; c++) {
      if (c === httpCol) continue;
      const v = (row.cells[c] ?? "").replace(/[`*]/g, "").trim();
      if (HTTP_STATUS_TOKEN.test(v)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: anchorForLine(doc, row.line),
          matched_text: v,
          message: `Appendix I "${title}" row carries a bare HTTP status token (${v}) in column "${header.cells[c] ?? c}"; non-HTTP shape required (D-V8.4-011).`,
        });
      }
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "appendix_i_internal_event_no_http_status",
  sourcePhase: "V8.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    for (const title of TARGET_SUBSECTIONS) {
      findings.push(...scanSubsection(ctx.masterSpec, title));
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
