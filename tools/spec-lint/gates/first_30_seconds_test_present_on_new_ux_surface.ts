/**
 * Gate: `first_30_seconds_test_present_on_new_ux_surface`
 *
 * Assertion: the UX spec carries the §1.4 First-30-Seconds contract and the
 * v7.1.0 retro-documented surface homes preserve the required four-bullet
 * structure, Master Spec §3.13 binding, and Appendix M hide contract.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, computeSectionRanges } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

interface SectionBlock {
  text: string;
  line: number;
  anchor?: string;
}

interface SurfaceExpectation {
  label: string;
  parentTitle: RegExp;
  blockTitle: RegExp;
  appendixMSignals: string[];
}

const REQUIRED_TEMPLATE_SIGNALS = [
  "Every UI surface authored in this specification MUST include a \"First 30 Seconds\" sub-section",
  "1. **What the user sees on the screen**",
  "2. **What they understand without training**",
  "3. **What they do next**",
  "4. **What is hidden and why**",
  "Cross-references to Master Spec §3.13 (Principle 9) and Appendix M (Surface/Engine Mapping) are mandatory in the sub-section.",
];

const REQUIRED_GATE_SIGNALS = [
  "The CI gate `first_30_seconds_test_present_on_new_ux_surface` asserts",
  "new `### N.N.N` component spec",
  "new `#### {Surface Name}` sub-section",
  "new `## N.N` chapter sub-section",
  "four required bullets and the mandatory cross-references to Master Spec §3.13 and Appendix M",
];

const REQUIRED_RETRO_SIGNALS = [
  "Buyer Maya onboarding — \"What Are You Evaluating?\" Intake",
  "Defense View",
  "Compressed pipeline progress bar (PipelineSurface)",
  "Seller Maya magic-link Hero Moment landing",
  "Each of the four sub-sections follows the §1.4.1 four-bullet structure and cites Master Spec §3.13",
];

const SURFACE_EXPECTATIONS: SurfaceExpectation[] = [
  {
    label: "UX §4.2.13 Defense View",
    parentTitle: /^4\.2\.13 Defense View$/,
    blockTitle: /^First 30 Seconds \(per §1\.4\)$/,
    appendixMSignals: [
      "Defense View (§13.11, closed Phase 14.5)",
      "Selection Report",
      "Selection Record",
      "Selection Report SHA-256 content hash",
      "AIOperation row in the Architecture block",
    ],
  },
  {
    label: "Seller Magic-Link Hero Moment landing",
    parentTitle: /^Seller Magic-Link Hero Moment Landing — Phase 14\.8 Polish \(2026-04-27\)$/,
    blockTitle: /^First 30 Seconds — Screen 1, Magic-Link Landing Page \(per §1\.4\)$/,
    appendixMSignals: [
      "Seller Maya Surface Abstraction — Capability Declarations auto-publish",
      "Seller Maya Surface Abstraction — KB governance silent engine + weekly notification",
      "Seller Maya Surface Abstraction — Match Score three-label compression",
      "AIOperation row in the Architecture block",
    ],
  },
  {
    label: "Buyer Maya intake",
    parentTitle: /^"What Are You Evaluating\?" Intake \(Phase 14\.7 — 2026-04-27\)$/,
    blockTitle: /^First 30 Seconds — Screen 1, Intake \(per §1\.4\)$/,
    appendixMSignals: [
      "\"What Are You Evaluating?\" Intake",
      "Per-Vertical Eval Starters",
      "Workspace pre-population materializer",
      "`EvalStarter` / `EvalVertical` rows",
    ],
  },
  {
    label: "UX §5.2.19 PipelineSurface",
    parentTitle: /^5\.2\.19 PipelineSurface$/,
    blockTitle: /^First 30 Seconds \(per §1\.4\)$/,
    appendixMSignals: [
      "Pipeline Surface Compression",
      "`pipeline_stage_id` integer (0–15)",
      "per-phase rows in the Sourcera Method block",
    ],
  },
];

const BULLET_PATTERNS: Array<[string, RegExp]> = [
  ["What the user sees", /^\d+\.\s+\*\*What the user sees\./m],
  ["What they understand without training", /^\d+\.\s+\*\*What they understand without training\./m],
  ["What they do next", /^\d+\.\s+\*\*What they do next\./m],
  ["What is hidden and why", /^\d+\.\s+\*\*What is hidden,? and why\./m],
];

const FORBIDDEN_FIRST_THREE_BULLET_TERMS = [
  "pipeline_stage_id",
  "Capability Declaration",
  "AIOperation",
  "Match Score",
  "KB Health Model",
  "OutcomeContract",
  "Defense Record",
  "EvalStarter",
  "Bid Workspace populator",
  "SellerOnboardingSession",
];

function findSection(doc: SpecDoc, title: RegExp): SectionBlock | null {
  const section = computeSectionRanges(doc).find((candidate) => title.test(candidate.heading.title));
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    line: section.startLine,
    anchor: section.heading.anchor,
  };
}

function findChildSection(doc: SpecDoc, parentTitle: RegExp, childTitle: RegExp): SectionBlock | null {
  const ranges = computeSectionRanges(doc);
  const parent = ranges.find((candidate) => parentTitle.test(candidate.heading.title));
  if (!parent) return null;
  const child = ranges.find(
    (candidate) =>
      candidate.startLine > parent.startLine &&
      candidate.endLine <= parent.endLine &&
      candidate.heading.level > parent.heading.level &&
      childTitle.test(candidate.heading.title),
  );
  if (!child) return null;
  return {
    text: doc.lines.slice(child.startLine, child.endLine + 1).join("\n"),
    line: child.startLine,
    anchor: child.heading.anchor,
  };
}

function firstThreeBullets(text: string): string {
  const match = text.match(
    /^\d+\.\s+\*\*What the user sees[\s\S]*?^\d+\.\s+\*\*What is hidden,? and why\./m,
  );
  return match?.[0] ?? "";
}

function requireSignals(doc: SpecDoc, block: SectionBlock, label: string, signals: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const signal of signals) {
    if (!block.text.includes(signal)) {
      findings.push({
        file: doc.path,
        line: block.line,
        anchor: block.anchor ?? anchorForLine(doc, block.line),
        matched_text: signal,
        message: `${label} is missing required First-30-Seconds signal "${signal}".`,
      });
    }
  }
  return findings;
}

function validateFirst30Block(doc: SpecDoc, block: SectionBlock, expectation: SurfaceExpectation): Finding[] {
  const findings: Finding[] = [];
  for (const [label, pattern] of BULLET_PATTERNS) {
    if (!pattern.test(block.text)) {
      findings.push({
        file: doc.path,
        line: block.line,
        anchor: block.anchor ?? anchorForLine(doc, block.line),
        matched_text: label,
        message: `${expectation.label} First-30-Seconds block is missing the required "${label}" bullet.`,
      });
    }
  }
  for (const signal of [
    "Master Spec §3.13",
    "Master Spec Appendix M",
    "`UX_Design_of_Sourcera.md` §1.4",
  ]) {
    if (!block.text.includes(signal)) {
      findings.push({
        file: doc.path,
        line: block.line,
        anchor: block.anchor ?? anchorForLine(doc, block.line),
        matched_text: signal,
        message: `${expectation.label} First-30-Seconds block must cite ${signal}.`,
      });
    }
  }
  findings.push(...requireSignals(doc, block, expectation.label, expectation.appendixMSignals));

  const visibleBullets = firstThreeBullets(block.text);
  for (const term of FORBIDDEN_FIRST_THREE_BULLET_TERMS) {
    if (visibleBullets.includes(term)) {
      findings.push({
        file: doc.path,
        line: block.line,
        anchor: block.anchor ?? anchorForLine(doc, block.line),
        matched_text: term,
        message: `${expectation.label} leaks engine vocabulary "${term}" before the Hidden bullet; §1.4 only permits those concepts in the hide contract.`,
      });
    }
  }

  return findings;
}

export const gate: SpecLintGate = {
  id: "first_30_seconds_test_present_on_new_ux_surface",
  sourcePhase: "14.17",
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
    const template = findSection(doc, /^1\.4\.1 Required Sub-Section in Every New Surface Spec$/);
    if (!template) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "1.4.1 Required Sub-Section in Every New Surface Spec",
        message: "UX §1.4.1 First-30-Seconds template section is missing.",
      });
    } else {
      findings.push(...requireSignals(doc, template, "UX §1.4.1 template", REQUIRED_TEMPLATE_SIGNALS));
    }

    const gateNote = findSection(doc, /^1\.4\.3 CI-Gate Note$/);
    if (!gateNote) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "1.4.3 CI-Gate Note",
        message: "UX §1.4.3 CI-Gate Note is missing.",
      });
    } else {
      findings.push(...requireSignals(doc, gateNote, "UX §1.4.3 CI-Gate Note", REQUIRED_GATE_SIGNALS));
    }

    const retro = findSection(doc, /^1\.4\.4 Retro-Documentation of v7\.1\.0 Surfaces$/);
    if (!retro) {
      findings.push({
        file: doc.path,
        line: 0,
        matched_text: "1.4.4 Retro-Documentation of v7.1.0 Surfaces",
        message: "UX §1.4.4 retro-documentation index is missing.",
      });
    } else {
      findings.push(...requireSignals(doc, retro, "UX §1.4.4 retro-documentation index", REQUIRED_RETRO_SIGNALS));
    }

    for (const expectation of SURFACE_EXPECTATIONS) {
      const block = findChildSection(doc, expectation.parentTitle, expectation.blockTitle);
      if (!block) {
        findings.push({
          file: doc.path,
          line: 0,
          matched_text: expectation.label,
          message: `${expectation.label} is missing its required First 30 Seconds (per §1.4) block.`,
        });
        continue;
      }
      findings.push(...validateFirst30Block(doc, block, expectation));
    }

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
