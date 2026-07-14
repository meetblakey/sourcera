/**
 * Gate: `k_anon_floor_single_source`
 * Source phase: v7.2.0-REM Phase 2.2 P1 (D-2.2-025 / D-2.2-026)
 *
 * Assertion: the §4.4 k-anonymity field-table rows must cite the canonical
 * floor authority instead of restating integer floor values or pointing at the
 * retired Summary §3.5 source.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";

interface KAnonBinding {
  anchor: string;
  entity: string;
  requiredCitations: string[];
}

const BINDINGS: KAnonBinding[] = [
  {
    anchor: "4.4.12-categorypage",
    entity: "CategoryPage",
    requiredCitations: ["§48.4.7", "§48.6.4"],
  },
  {
    anchor: "4.4.13-guidepage",
    entity: "GuidePage",
    requiredCitations: ["§48.4.7", "§48.6.4"],
  },
  {
    anchor: "4.4.14-comparisonpage",
    entity: "ComparisonPage",
    requiredCitations: ["§48.4.7", "§48.6.4"],
  },
  {
    anchor: "4.4.15-marketintelligencereport",
    entity: "MarketIntelligenceReport",
    requiredCitations: ["§48.4.7", "§48.6.4"],
  },
  {
    anchor: "4.4.16-heatmapcell",
    entity: "HeatMapCell",
    requiredCitations: ["§48.4.7", "§48.6.4"],
  },
  {
    anchor: "4.4.18-sellersignal",
    entity: "SellerSignal",
    requiredCitations: ["§48.4.7"],
  },
  {
    anchor: "4.4.19-promotedlisting",
    entity: "PromotedListing",
    requiredCitations: ["§27.11.2", "§34.16.1"],
  },
];

const INLINE_FLOOR_LITERAL_RE = /\b(?:5|10|20)\b/;
const STALE_SUMMARY_K_ANON_RE = /Summary §3\.5/i;
const K_ANON_CONTEXT_RE = /k[-_ ]?anon|anonymity floor|cohort floor|floor/i;

export const gate: SpecLintGate = {
  id: "k_anon_floor_single_source",
  sourcePhase: "v7.2.0-REM Phase 2.2 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    for (const binding of BINDINGS) {
      const section = findSectionByAnchor(doc, binding.anchor);
      if (!section) {
        findings.push({
          file: doc.path,
          line: 0,
          anchor: binding.anchor,
          message: `${binding.entity} section ${binding.anchor} is missing; cannot verify k-anonymity floor source.`,
        });
        continue;
      }

      const table = parseTableAt(doc, section.startLine, section.endLine);
      const fieldRow = table.rows.find((row) => row.cells[0] === "`k_anon_floor`");
      if (!fieldRow) {
        findings.push({
          file: doc.path,
          line: section.startLine,
          anchor: binding.anchor,
          message: `${binding.entity} is missing a k_anon_floor field-table row.`,
        });
      } else {
        const constraints = fieldRow.cells[2] ?? "";
        const notes = fieldRow.cells[3] ?? "";
        for (const citation of binding.requiredCitations) {
          if (!constraints.includes(citation) && !notes.includes(citation)) {
            findings.push({
              file: doc.path,
              line: fieldRow.line,
              anchor: binding.anchor,
              matched_text: constraints,
              message: `${binding.entity}.k_anon_floor must cite ${citation}; do not restate the floor value inline.`,
            });
          }
        }
        if (INLINE_FLOOR_LITERAL_RE.test(constraints)) {
          findings.push({
            file: doc.path,
            line: fieldRow.line,
            anchor: binding.anchor,
            matched_text: constraints,
            message: `${binding.entity}.k_anon_floor restates an integer floor in the Constraints cell; cite the canonical floor authority instead.`,
          });
        }
        if (STALE_SUMMARY_K_ANON_RE.test(constraints) || STALE_SUMMARY_K_ANON_RE.test(notes)) {
          findings.push({
            file: doc.path,
            line: fieldRow.line,
            anchor: binding.anchor,
            matched_text: constraints,
            message: `${binding.entity}.k_anon_floor cites retired Summary §3.5; cite the current Master Spec authority instead.`,
          });
        }
      }

      for (let line = section.startLine; line <= section.endLine; line++) {
        const text = doc.lines[line] ?? "";
        if (STALE_SUMMARY_K_ANON_RE.test(text) && K_ANON_CONTEXT_RE.test(text)) {
          findings.push({
            file: doc.path,
            line,
            anchor: binding.anchor,
            matched_text: "Summary §3.5",
            message: `${binding.entity} still uses retired Summary §3.5 as a k-anonymity authority; cite §48.4.7 / §48.6.4 or the entity-specific current authority.`,
          });
        }
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
