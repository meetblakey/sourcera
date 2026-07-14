/**
 * Gate: `dsar_cascade_pattern_default_row_retired`
 *
 * Assertion: §6.8.4.1 no longer carries a catch-all Pattern B default row.
 * DSAR cascade routing must use explicit per-entity assignments.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import {
  anchorForLine,
  findSectionByAnchor,
  parseTableAt,
  type TableRow,
} from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const PATTERN_ANCHOR = "6.8.4.1-cascade-pseudonymization-pattern";

function rowText(row: TableRow): string {
  return row.cells.join(" ").replace(/[*`]/g, " ").replace(/\s+/g, " ").trim();
}

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function isDefaultCatchAll(row: TableRow): boolean {
  const entity = (row.cells[0] ?? "").replace(/[*`]/g, " ").replace(/\s+/g, " ").trim();
  const pattern = (row.cells[1] ?? "").replace(/[*`]/g, " ").replace(/\s+/g, " ").trim();
  const text = rowText(row);

  const catchAllEntity =
    /\ball other\b/i.test(entity) ||
    /\bremaining\b/i.test(entity) ||
    /\bany other\b/i.test(entity) ||
    /\bdefault\b/i.test(entity);

  return catchAllEntity && /§4 entities?/i.test(text) && /Pattern B/i.test(pattern);
}

export const gate: SpecLintGate = {
  id: "dsar_cascade_pattern_default_row_retired",
  sourcePhase: "V9 [V11]",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section = findSectionByAnchor(doc, PATTERN_ANCHOR);
    if (!section) {
      push(findings, doc, 0, "§6.8.4.1", "§6.8.4.1 Cascade Pseudonymization Pattern is missing.");
      return findings;
    }

    for (let line = section.startLine; line <= section.endLine; line++) {
      const raw = doc.lines[line] ?? "";
      if (!/^\s*\|.*\|\s*$/.test(raw)) continue;
      const table = parseTableAt(doc, line, section.endLine);
      if (!table.header) continue;
      for (const row of table.rows) {
        if (isDefaultCatchAll(row)) {
          push(
            findings,
            doc,
            row.line,
            rowText(row),
            "§6.8.4.1 reintroduces the retired catch-all Pattern B default row; every User-attribution §4 entity must have an explicit DSAR cascade assignment.",
          );
        }
      }
      line = table.rows.length ? table.rows[table.rows.length - 1].line : line;
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
