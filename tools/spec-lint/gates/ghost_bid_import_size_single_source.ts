/**
 * Gate: `ghost_bid_import_size_single_source`
 * Source phase: v7.2.0-REM Phase 2.2 P1 (D-2.2-031 / D-AS-010)
 *
 * Assertion: GhostBidImport size and parsed-pair caps must live in §39, while
 * §4.4.17 only cites those rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

interface FieldBinding {
  field: string;
  requiredCitations: string[];
  forbidden: RegExp;
}

const FIELD_BINDINGS: FieldBinding[] = [
  {
    field: "`source_file_byte_size`",
    requiredCitations: ["§39", "GhostBidImport.source_file_byte_size"],
    forbidden: /\b250\s*MB\b|250MB|per §39 addition/i,
  },
  {
    field: "`raw_text`",
    requiredCitations: ["§39", "GhostBidImport.raw_text"],
    forbidden: /2,000,000|2000000/i,
  },
  {
    field: "`parsed_qa_pairs_json`",
    requiredCitations: ["§39", "GhostBidImport.parsed_qa_pairs_json", "GhostBidImport.parsed_qa_pairs"],
    forbidden: /1,000,000|1000000|\b500\b/i,
  },
];

const SECTION_39_ROWS = [
  "| GhostBidImport | raw\\_text | 2,000,000 chars |",
  "| GhostBidImport | parsed\\_qa\\_pairs\\_json | 1,000,000 chars |",
  "| GhostBidImport | parsed\\_qa\\_pairs | 500 entries per import |",
  "| GhostBidImport | source\\_file\\_byte\\_size | 250 MB |",
];

export const gate: SpecLintGate = {
  id: "ghost_bid_import_size_single_source",
  sourcePhase: "v7.2.0-REM Phase 2.2 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const section = findSectionByAnchor(doc, "4.4.17-ghostbidimport");

    if (!section) {
      return [{
        file: doc.path,
        line: 0,
        anchor: "4.4.17-ghostbidimport",
        message: "§4.4.17 GhostBidImport section is missing; cannot verify size singleton binding.",
      }];
    }

    const table = parseTableAt(doc, section.startLine, section.endLine);
    for (const binding of FIELD_BINDINGS) {
      const row = table.rows.find((candidate) => candidate.cells[0] === binding.field);
      if (!row) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: "4.4.17-ghostbidimport",
          message: `GhostBidImport is missing ${binding.field} field-table row.`,
        });
        continue;
      }

      const constraints = row.cells[2] ?? "";
      const notes = row.cells[3] ?? "";
      const combined = `${constraints} ${notes}`;
      for (const citation of binding.requiredCitations) {
        if (!combined.includes(citation)) {
          findings.push({
            file: doc.path,
            line: row.line,
            anchor: "4.4.17-ghostbidimport",
            matched_text: constraints,
            message: `${binding.field} must cite ${citation}; §39 is the canonical size/count authority.`,
          });
        }
      }
      if (binding.forbidden.test(constraints)) {
        findings.push({
          file: doc.path,
          line: row.line,
          anchor: "4.4.17-ghostbidimport",
          matched_text: constraints,
          message: `${binding.field} restates a GhostBidImport limit in §4.4.17; cite §39 instead.`,
        });
      }
    }

    for (const rowText of SECTION_39_ROWS) {
      if (!doc.text.includes(rowText)) {
        findings.push({
          file: doc.path,
          line: 0,
          anchor: "39.-object-size-constraints",
          matched_text: rowText,
          message: `§39 is missing canonical GhostBidImport limit row: ${rowText}`,
        });
      }
    }

    if (!doc.text.includes("ghost_bid_import_pair_count_exceeded")) {
      findings.push({
        file: doc.path,
        line: 0,
        anchor: "appendix-i",
        message: "Appendix I must register ghost_bid_import_pair_count_exceeded for parsed-pair cap overflow.",
      });
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
