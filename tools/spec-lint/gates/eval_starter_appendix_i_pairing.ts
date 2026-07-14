/**
 * Gate: `eval_starter_appendix_i_pairing`  (Source phase: 14.7)
 * Archetype: named-error-code-set cross-reference resolution (shares the
 * `defense_view_appendix_i_pairing` kernel).
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `eval_starter_appendix_i_pairing`; Appendix I v7.1.0 errors; §4.5.9 / §13.12.
 *
 * Assertion (§M.5.4): Every `eval_starter_slug_conflict`,
 * `eval_starter_seed_size_invalid`, `eval_starter_seed_index_oob`,
 * `eval_starter_write_forbidden` reference MUST resolve to its Appendix I row.
 *
 * Override path: not_permitted (error-envelope integrity).
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { computeSectionRanges, anchorForLine, findSectionByTitle } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const CODES = [
  "eval_starter_slug_conflict",
  "eval_starter_seed_size_invalid",
  "eval_starter_seed_index_oob",
  "eval_starter_write_forbidden",
];
const HTTP_IN_ROW = /\b(1\d\d|2\d\d|3\d\d|4\d\d|5\d\d)\b/;

interface Range { start: number; end: number; }

function referenceRanges(doc: SpecDoc): Range[] {
  const out: Range[] = [];
  for (const r of computeSectionRanges(doc)) {
    const n = /^([0-9]+(?:\.[0-9]+)*)/.exec(r.heading.title.trim())?.[1] ?? "";
    if (n === "4.5.9" || n.startsWith("4.5.9.") || n === "13.12" || n.startsWith("13.12.")) {
      out.push({ start: r.startLine, end: r.endLine });
    }
  }
  return out;
}

function appendixIRange(doc: SpecDoc): Range | null {
  const sec = findSectionByTitle(doc, /^Appendix I\b/);
  return sec ? { start: sec.startLine, end: sec.endLine } : null;
}

export const gate: SpecLintGate = {
  id: "eval_starter_appendix_i_pairing",
  sourcePhase: "14.7",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    const refRanges = referenceRanges(doc);
    const apxI = appendixIRange(doc);
    for (const code of CODES) {
      const referenced = refRanges.some((r) => rangeHas(doc, r, code));
      let resolvedLine = -1, hasStatus = false;
      if (apxI) {
        for (let i = apxI.start; i <= apxI.end; i++) {
          const line = doc.lines[i];
          if (line && line.includes(code) && /^\s*\|/.test(line)) {
            resolvedLine = i; hasStatus = HTTP_IN_ROW.test(line.replace(code, "")); break;
          }
        }
      }
      if (referenced && resolvedLine === -1) {
        findings.push({ file: doc.path, line: firstRef(doc, refRanges, code),
          message: `EvalStarter error code \`${code}\` is referenced in §4.5.9/§13.12 but does not resolve to an Appendix I row.` });
      } else if (resolvedLine !== -1 && !hasStatus) {
        findings.push({ file: doc.path, line: resolvedLine, anchor: anchorForLine(doc, resolvedLine), matched_text: code,
          message: `EvalStarter error code \`${code}\` has an Appendix I row but no resolvable HTTP status.` });
      }
    }
    return findings;
  },
};

function rangeHas(doc: SpecDoc, r: Range, t: string): boolean {
  for (let i = r.start; i <= r.end; i++) if (doc.lines[i]?.includes(t)) return true;
  return false;
}
function firstRef(doc: SpecDoc, ranges: Range[], t: string): number {
  for (const r of ranges) for (let i = r.start; i <= r.end; i++) if (doc.lines[i]?.includes(t)) return i;
  return 0;
}

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
