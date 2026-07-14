/**
 * Gate: `section_anchor_slug_no_colon`  (Source phase: v7.2.0-REM M02.3; Authored Extension)
 * Archetype: single-pattern anchor-slug grep (broad-scope sibling of
 * `appendix_anchor_slug_no_colon`).
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.4 anchor-resolution integrity;
 * Authoring Convention #11; defect D-V72REM-M023-002 (the 13 §2.2/§10.x colon
 * section anchors surfaced by the M02.3 Runtime-Wiring pass). This gate is the
 * follow-on proposed in that defect: where `appendix_anchor_slug_no_colon` is
 * chartered to the 12 Appendix anchors, this one covers ALL heading-declared
 * anchors.
 *
 * Assertion: No heading-declared anchor slug `{#…}` may contain `:`, `&`, or
 * `,` (these characters create renderer-dependent GitHub/MkDocs fragments).
 *
 * Status note: promoted to `runtime_active` in the 2026-06-24 M02.3 advisory
 * runtime-promotion pass after D-V72REM-M023-002 cleared and the gate returned
 * 0 findings on the live Master Spec plus pass/fail fixtures.
 *
 * Override path: not_permitted (anchor-resolution integrity).
 */

import type { Finding, GateContext, SpecLintGate } from "../lib/types.js";
import { parseHeadings } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

export const gate: SpecLintGate = {
  id: "section_anchor_slug_no_colon",
  sourcePhase: "v7.2.0-REM M02.3",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];
    for (const h of parseHeadings(doc)) {
      if (h.anchor && /[:,&]/.test(h.anchor)) {
        findings.push({
          file: doc.path,
          line: h.line,
          anchor: h.anchor,
          matched_text: `{#${h.anchor}}`,
          message: `Heading anchor slug contains a nonportable character ("${h.anchor}"); normalize colon, ampersand, and comma to a renderer-safe form (D-V72REM-M023-002; D-42-030).`,
        });
      }
    }
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
