/**
 * Gate: `appendix_m5_cross_reference_resolution_completeness`  (Source phase: V11, D-11.3-006)
 * Archetype: catalog self-consistency meta-gate (cross-reference resolution).
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `appendix_m5_cross_reference_resolution_completeness`; §M.5 authoring contract; D-11.3-002.
 *
 * Assertion (§M.5.4): Every spec-body `` Appendix M.5 `<gate_id>` `` citation MUST
 * resolve to a §M.5 catalog row.
 *
 * Detector: collect the full §M.5 catalog Gate-ID universe (every back-ticked
 * snake_case gate id appearing as the first cell of a table row anywhere under
 * the "M.5 CI Gate Catalog" section, across §M.5.4 and the §M.5.10/.12/.13/.17/
 * .18/.19 sub-catalogs); then scan the whole document for
 * `` Appendix M.5 `<id>` `` citations and flag any `<id>` not in the universe.
 *
 * Override path: not_permitted (catalog self-consistency invariant).
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findSectionByTitle, anchorForLine } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const GATE_ID_FIRST_CELL = /^\|\s*`([a-z0-9_]+)`\s*\|/;
const CITATION_RE = /Appendix M\.5\s+`([a-z0-9_]+)`/g;

function catalogGateIds(doc: SpecDoc): Set<string> {
  const ids = new Set<string>();
  const sec = findSectionByTitle(doc, "M.5 CI Gate Catalog");
  if (!sec) return ids;
  for (let i = sec.startLine; i <= sec.endLine; i++) {
    const m = GATE_ID_FIRST_CELL.exec(doc.lines[i] ?? "");
    if (m) ids.add(m[1]);
  }
  return ids;
}

export const gate: SpecLintGate = {
  id: "appendix_m5_cross_reference_resolution_completeness",
  sourcePhase: "V11",
  rowClass: "meta_catalog_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const universe = catalogGateIds(doc);
    if (universe.size === 0) {
      return [{ file: doc.path, line: 0, message: "parse_error: §M.5 catalog produced zero gate ids." }];
    }
    const findings: Finding[] = [];
    for (let i = 1; i < doc.lines.length; i++) {
      const line = doc.lines[i];
      CITATION_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = CITATION_RE.exec(line)) !== null) {
        if (!universe.has(m[1])) {
          findings.push({
            file: doc.path,
            line: i,
            anchor: anchorForLine(doc, i),
            matched_text: m[0],
            message: `Spec-body citation \`Appendix M.5 \`${m[1]}\`\` does not resolve to any §M.5 catalog row.`,
          });
        }
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
