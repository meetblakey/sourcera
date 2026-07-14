/**
 * Gate: `appendix_m_no_inline_engine_concepts_in_ux_spec`
 *
 * Assertion: UX sections that intentionally name engine concepts carry local
 * Appendix M bindings and do not point finalized artifacts at stale draft rows.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface UxSectionExpectation {
  title: RegExp;
  label: string;
  signals: string[];
  forbidden?: RegExp[];
}

const UX_SECTION_EXPECTATIONS: UxSectionExpectation[] = [
  {
    title: /^4\.2\.13 Defense View$/,
    label: "UX §4.2.13 Defense View",
    signals: [
      "**Master Spec home:** §13.11. **Appendix M row:** Defense View (§13.11, closed Phase 14.5). **Engine entity:** `DefenseView` (§13.11.7).",
      "**Engine cross-references (per Appendix M / `appendix_m_no_inline_engine_concepts_in_ux_spec`):**",
      "`DefenseView` entity → Master Spec §13.11.7. Surface metaphor row: Appendix M \"Defense View (§13.11, closed Phase 14.5).\"",
      "`defense_view_generate` AIOperation capability → Master Spec §13.11.5; Appendix M Architecture row \"AIOperation.\"",
      "Selection Record / Selection Report sources → Master Spec §4.3.23, §4.3.24, §10.12 step 4, §10.13 step 5; Appendix M rows \"Selection Report,\" \"Selection Record,\" and \"Selection Report SHA-256 content hash.\"",
      "Codified by Appendix M rows \"Defense View (§13.11, closed Phase 14.5),\" \"Selection Report,\" \"Selection Record,\" \"Selection Report SHA-256 content hash,\" and the AIOperation row in the Architecture block.",
      "Cross-references: Master Spec §3.13 (Principle 9 — Surface Simplicity, Engine Complexity); Master Spec Appendix M rows above; `UX_Design_of_Sourcera.md` §1.4 (First-30-Seconds Test).",
    ],
    forbidden: [
      /Selection Record \/ Selection Report sources\s+→\s+Master Spec §4\.3\.21/,
      /Synthesizes the finalized Selection Record \(Master Spec §4\.3\.21\)/,
      /Engine entity:\s+`DefenseView`\s+\(§4\.3 \/ §13\.11\.7\)/,
      /Appendix M rows "Selection Report Draft"[^.\n]*Selection Report SHA-256 content hash/,
    ],
  },
  {
    title: /^5\.2\.19 PipelineSurface$/,
    label: "UX §5.2.19 PipelineSurface",
    signals: [
      "**Master Spec / Appendix M cross-references:** Master Spec §3.14 (Pipeline Surface Compression — canonical contract)",
      "Appendix M row \"Pipeline Surface Compression.\"",
      "Codified by Appendix M rows \"Pipeline Surface Compression,\" \"`pipeline_stage_id` integer (0–15),\" and the per-phase rows in the Sourcera Method block",
    ],
  },
];

const GLOBAL_SIGNALS = [
  "A companion Master Spec CI gate (`appendix_m_no_inline_engine_concepts_in_ux_spec`) already enforces that every engine concept named on a UX surface either resolves to an Appendix M row or is named only inside a \"Hidden\" bullet of a First-30-Seconds Test sub-section.",
  "**Master Spec / Appendix M cross-references:** §22.1 Audience Note (Seller Maya persona)",
  "Appendix M rows \"Seller Maya Surface Abstraction — Capability Declarations auto-publish (Phase 14.8 — closed)\"",
  "**Master Spec / Appendix M cross-references:** §13.12 (intake authoritative spec)",
  "Appendix M rows \"What Are You Evaluating?\" Intake and Workspace pre-population materializer in Scoring Engine block, Appendix M Per-Vertical Eval Starters (Phase 14.7 — closed) row.",
];

function sectionText(doc: SpecDoc, expectation: UxSectionExpectation): { text: string; line: number; anchor?: string } | null {
  const section = findSectionByTitle(doc, expectation.title);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

export const gate: SpecLintGate = {
  id: "appendix_m_no_inline_engine_concepts_in_ux_spec",
  sourcePhase: "14.2",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.uxSpec;
    if (!doc) {
      return [{
        file: "UX_Design_of_Sourcera.md",
        line: 0,
        message: "parse_error: UX spec not loaded; pass --ux UX_Design_of_Sourcera.md.",
      }];
    }

    const findings: Finding[] = [];
    for (const expectation of UX_SECTION_EXPECTATIONS) {
      const section = sectionText(doc, expectation);
      if (!section) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: expectation.label,
          message: `parse_error: ${expectation.label} section not found.`,
        });
        continue;
      }
      for (const signal of expectation.signals) {
        if (!section.text.includes(signal)) {
          findings.push({
            file: doc.path,
            line: section.line,
            anchor: section.anchor,
            matched_text: signal,
            message: `${expectation.label} is missing required Appendix M engine-reference binding "${signal}".`,
          });
        }
      }
      for (const forbidden of expectation.forbidden ?? []) {
        const match = forbidden.exec(section.text);
        if (match) {
          findings.push({
            file: doc.path,
            line: section.line,
            anchor: section.anchor,
            matched_text: match[0],
            message: `${expectation.label} contains a stale inline engine reference that must resolve to the finalized artifact and Appendix M row.`,
          });
        }
      }
    }

    for (const signal of GLOBAL_SIGNALS) {
      const line = doc.lines.findIndex((candidate) => candidate.includes(signal));
      if (line < 0) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: signal,
          message: `Missing UX-wide Appendix M binding "${signal}".`,
        });
      }
    }

    for (let i = 1; i < doc.lines.length; i++) {
      const line = doc.lines[i] ?? "";
      if (/Selection Record.*§4\.3\.21/.test(line) || /Selection Report.*§4\.3\.21/.test(line)) {
        findings.push({
          file: doc.path,
          line: i,
          anchor: anchorForLine(doc, i),
          matched_text: line.trim(),
          message: "UX spec must not point finalized Selection Record / Selection Report concepts at mutable Selection Report Draft (§4.3.21).",
        });
      }
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
