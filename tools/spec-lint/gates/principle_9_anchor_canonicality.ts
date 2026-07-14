/**
 * Gate: `principle_9_anchor_canonicality`  (Source phase: 14.1)
 * Archetype: multi-file cross-reference alias rejection.
 *
 * Authority anchor: Sourcera_Master_Spec.md §M.5.4 row
 * `principle_9_anchor_canonicality`; §3.13 numbering note.
 *
 * Assertion (§M.5.4): "Any cross-reference targeting Principle 9 must resolve to
 * anchor `#3.13-principle-9-surface-simplicity-engine-complexity` (canonical) —
 * alias anchors `#principle-9` / `#3.13-principle-9` are rejected at lint time."
 * Scans Sourcera_Master_Spec.md AND UX_Design_of_Sourcera.md.
 *
 * Detector: flag any markdown LINK TARGET of the form `(#principle-9)` or
 * `(#3.13-principle-9)` — i.e., the parenthesized link-destination form. The
 * canonical long anchor is NOT matched (negative lookahead on the trailing
 * `-`). Illustrative inline-code mentions (`` `#principle-9` ``) such as those
 * in this very catalog row and the §3.13 numbering note are NOT link targets,
 * so they are not flagged (mirrors the self-reference exemption pattern in
 * appendix_k_canonicality.ts).
 *
 * Override path: not_permitted (anchor canonicality is a hard cross-reference
 * integrity invariant).
 */

import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { anchorForLine, fenceMask } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";

// Match the alias anchors ONLY in link-destination form `(#alias)` / `](#alias)`.
// `(?![\w-])` ensures `#3.13-principle-9-surface-...` (canonical) is NOT matched,
// because the char after `...-9` is `-` (a `[\w-]` member).
const ALIAS_LINK_RE = /\(#(principle-9|3\.13-principle-9)(?![\w-])\)/g;

function scan(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const mask = fenceMask(doc);
  for (let i = 1; i < doc.lines.length; i++) {
    if (mask[i]) continue;
    const line = doc.lines[i];
    ALIAS_LINK_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = ALIAS_LINK_RE.exec(line)) !== null) {
      findings.push({
        file: doc.path,
        line: i,
        anchor: anchorForLine(doc, i),
        matched_text: m[0],
        message: `Non-canonical Principle 9 anchor "#${m[1]}". Use #3.13-principle-9-surface-simplicity-engine-complexity (§3.13 numbering note).`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "principle_9_anchor_canonicality",
  sourcePhase: "14.1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings = scan(ctx.masterSpec);
    if (ctx.uxSpec) findings.push(...scan(ctx.uxSpec));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) {
  void runGateCli(gate);
}
