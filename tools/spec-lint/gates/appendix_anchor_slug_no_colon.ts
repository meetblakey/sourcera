/**
 * Gate: `appendix_anchor_slug_no_colon`  (Source phase: V8.4)
 * Archetype: single-pattern anchor-slug grep.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row `appendix_anchor_slug_no_colon`;
 * Appendix I Preamble; defect D-V8.4-016.
 *
 * Assertion (§M.5.4): "No anchor slug of the form `{#appendix-X:-...}`
 * (containing a colon) is permitted. All 12 Appendix anchors normalized to
 * colon-free form." Colons in anchor slugs break GitHub/MkDocs anchor
 * resolution and were the D-V8.4-016 root cause.
 *
 * Detector scope (chartered): HEADING-declared anchor slugs that begin with
 * `appendix-` (the 12 Appendix anchors). Only heading-line declarations are
 * considered, so the illustrative `` `{#appendix-X:-...}` `` literal that this
 * gate's own §M.5.4 row carries in prose is NOT self-flagged (mirrors the
 * appendix_k_canonicality self-reference exemption). Colon-bearing NON-appendix
 * section anchors (e.g., §2.2 / §10.x phase anchors) are out of this gate's
 * charter and are tracked separately as a follow-on `section_anchor_slug_no_colon`
 * candidate in `_integration/M02_3_RUNTIME_WIRING_PLAN.md`.
 *
 * Override path: not_permitted (anchor-resolution integrity — a colon anchor is
 * never valid).
 */

import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { parseHeadings } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

export const gate: SpecLintGate = {
  id: "appendix_anchor_slug_no_colon",
  sourcePhase: "V8.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    for (const h of parseHeadings(doc)) {
      const slug = h.anchor;
      if (!slug) continue;
      // Chartered scope: the Appendix anchors only (slug begins "appendix-").
      if (!/^appendix-/i.test(slug)) continue;
      if (slug.includes(":")) {
        findings.push({
          file: doc.path,
          line: h.line,
          anchor: slug,
          matched_text: `{#${slug}}`,
          message: `Appendix anchor slug contains a colon ("${slug}"); normalize to colon-free form (D-V8.4-016). Colons break anchor resolution.`,
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
