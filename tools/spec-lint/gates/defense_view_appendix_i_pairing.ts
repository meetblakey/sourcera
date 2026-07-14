/**
 * Gate: `defense_view_appendix_i_pairing`  (Source phase: 14.5)
 * Archetype: named-error-code-set cross-reference resolution (with HTTP-status
 * presence check).
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `defense_view_appendix_i_pairing`; Appendix I v7.1.0 errors; §13.11 / §32.5 /
 * Appendix L.7.
 *
 * Assertion (§M.5.4): "Every `selection_record_not_finalized`,
 * `regeneration_throttle`, `defense_view_capability_disabled`,
 * `defense_view_archived_with_workspace`, `defense_view_cross_console_access`
 * reference in §13.11 / §32.5 / Appendix L.7 MUST resolve to its Appendix I row
 * with matching HTTP status."
 *
 * Detector: for each of the five Defense-View error codes, confirm (1) it is
 * referenced in at least one of §13.11 / §32.5 / Appendix L.7, and (2) it
 * resolves to an Appendix I table row carrying a valid 3-digit HTTP status.
 * A code referenced but unresolved, or resolved without an HTTP status, is a
 * finding.
 *
 * Override path: not_permitted (error-envelope integrity — an unbound code
 * surfaces an undefined error to the client).
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  computeSectionRanges,
  anchorForLine,
  findSectionByTitle,
} from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

const CODES = [
  "selection_record_not_finalized",
  "regeneration_throttle",
  "defense_view_capability_disabled",
  "defense_view_archived_with_workspace",
  "defense_view_cross_console_access",
];

const HTTP_IN_ROW = /\b(1\d\d|2\d\d|3\d\d|4\d\d|5\d\d)\b/;

interface Range {
  start: number;
  end: number;
}

/** Ranges of the three reference homes the assertion names. */
function referenceRanges(doc: SpecDoc): Range[] {
  const ranges = computeSectionRanges(doc);
  const wanted: Range[] = [];
  for (const r of ranges) {
    const n = /^([0-9]+(?:\.[0-9]+)*)/.exec(r.heading.title.trim())?.[1] ?? "";
    if (n === "13.11" || n.startsWith("13.11.") || n === "32.5" || n.startsWith("32.5.")) {
      wanted.push({ start: r.startLine, end: r.endLine });
    }
    if (/Appendix L\.7\b/.test(r.heading.title) || r.heading.anchor?.startsWith("l-7") || /^L\.7\b/.test(r.heading.title)) {
      wanted.push({ start: r.startLine, end: r.endLine });
    }
  }
  return wanted;
}

function appendixIRange(doc: SpecDoc): Range | null {
  // Anchor on a heading whose title STARTS WITH "Appendix I" so we bind the
  // top-level "## Appendix I: API Error Code Catalog" and NOT an earlier body
  // sub-heading that merely mentions Appendix I (e.g.,
  // "#### 10.13.7.6 Appendix I Error Codes (V4 additions)").
  const sec = findSectionByTitle(doc, /^Appendix I\b/);
  return sec ? { start: sec.startLine, end: sec.endLine } : null;
}

export const gate: SpecLintGate = {
  id: "defense_view_appendix_i_pairing",
  sourcePhase: "14.5",
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
      // (1) referenced in one of the named homes?
      const referenced = refRanges.some((r) =>
        rangeContainsToken(doc, r, code),
      );
      // (2) resolves to an Appendix I row with an HTTP status?
      let resolvedLine = -1;
      let hasStatus = false;
      if (apxI) {
        for (let i = apxI.start; i <= apxI.end; i++) {
          const line = doc.lines[i];
          if (line && line.includes(code) && /^\s*\|/.test(line)) {
            resolvedLine = i;
            hasStatus = HTTP_IN_ROW.test(line.replace(code, ""));
            break;
          }
        }
      }

      if (referenced && resolvedLine === -1) {
        findings.push({
          file: doc.path,
          line: firstRefLine(doc, refRanges, code),
          message: `Defense-View error code \`${code}\` is referenced in §13.11/§32.5/Appendix L.7 but does not resolve to an Appendix I row.`,
        });
      } else if (resolvedLine !== -1 && !hasStatus) {
        findings.push({
          file: doc.path,
          line: resolvedLine,
          anchor: anchorForLine(doc, resolvedLine),
          matched_text: code,
          message: `Defense-View error code \`${code}\` has an Appendix I row but no resolvable HTTP status.`,
        });
      }
    }
    return findings;
  },
};

function rangeContainsToken(doc: SpecDoc, r: Range, token: string): boolean {
  for (let i = r.start; i <= r.end; i++) {
    if (doc.lines[i]?.includes(token)) return true;
  }
  return false;
}
function firstRefLine(doc: SpecDoc, ranges: Range[], token: string): number {
  for (const r of ranges) {
    for (let i = r.start; i <= r.end; i++) {
      if (doc.lines[i]?.includes(token)) return i;
    }
  }
  return 0;
}

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
