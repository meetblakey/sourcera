/**
 * Gate: `touch_target_per_tier_single_source`
 *
 * Assertion: touch/tap-target numeric values are sourced from §38.6.2.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, fenceMask, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const TARGET_CONTEXT_RE = /\b(touch[-\s]?targets?|tap[-\s]?targets?|target[-\s]?size|touch target size)\b/i;
const TARGET_SIZE_LITERAL_RE =
  /\b(?:48|44|32)\s*(?:×|x)\s*(?:48|44|32)\s*(?:CSS\s*)?px\b|\b(?:48|44|32)\s*px\b/i;
const STALE_AUTHORITY_RE = /per WCAG\s*\/\s*Master Spec Section 37\.1/i;
const CANONICAL_TOUCH_ROW =
  "| Touch-target minimum | 48 × 48 CSS px | 48 × 48 CSS px | 44 × 44 CSS px | 32 × 32 CSS px | 32 × 32 CSS px |";

function findLineIncludingAll(doc: SpecDoc, tokens: readonly string[]) {
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (tokens.every((token) => line.includes(token))) return { text: line, line: i };
  }
  return null;
}

function requireTokens(
  doc: SpecDoc,
  target: { text: string; line: number; anchor?: string },
  label: string,
  tokens: readonly string[],
): Finding[] {
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!target.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: target.line,
        anchor: target.anchor,
        matched_text: token,
        message: `${label} is missing required touch-target single-source token: ${token}`,
      });
    }
  }
  return findings;
}

function sectionBounds(doc: SpecDoc, title: RegExp) {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return { start: section.startLine, end: section.endLine, anchor: section.heading.anchor };
}

function isWithin(line: number, bounds: { start: number; end: number } | null): boolean {
  return !!bounds && line >= bounds.start && line <= bounds.end;
}

function citesSourceTable(line: string): boolean {
  return /(?:Master Spec\s*)?§38\.6\.2/.test(line);
}

function numericRestatementFindings(doc: SpecDoc, canonicalBounds: { start: number; end: number } | null): Finding[] {
  const findings: Finding[] = [];
  const mask = fenceMask(doc);
  for (let i = 1; i < doc.lines.length; i++) {
    const line = doc.lines[i] ?? "";
    if (mask[i]) continue;

    if (STALE_AUTHORITY_RE.test(line)) {
      findings.push({
        file: doc.path,
        line: i,
        anchor: anchorForLine(doc, i),
        matched_text: line.trim(),
        message: "Touch-target authority still points to WCAG / Master Spec Section 37.1; cite §38.6.2 instead.",
      });
      continue;
    }

    if (!TARGET_CONTEXT_RE.test(line) || !TARGET_SIZE_LITERAL_RE.test(line)) continue;
    if (isWithin(i, canonicalBounds)) continue;
    if (citesSourceTable(line)) continue;

    findings.push({
      file: doc.path,
      line: i,
      anchor: anchorForLine(doc, i),
      matched_text: line.trim(),
      message: "Inline touch/tap-target numeric value must cite §38.6.2 or move to the §38.6.2 source table.",
    });
  }
  return findings;
}

function section37Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByTitle(doc, /^37\.1 Accessibility \(WCAG 2\.1 AA\)$/);
  if (!section) {
    return [{
      file: doc.path,
      line: 0,
      anchor: "37.1",
      message: "§37.1 Accessibility section is missing.",
    }];
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  for (const token of [
    "Touch-target minimums are sourced only from §38.6.2",
    "never authors an independent target-size number",
  ]) {
    if (!text.includes(token)) {
      findings.push({
        file: doc.path,
        line: section.startLine,
        anchor: section.heading.anchor,
        matched_text: token,
        message: `§37.1 Motor and target size rule is missing required source-of-truth wording: ${token}`,
      });
    }
  }
  return findings;
}

function section38Findings(doc: SpecDoc): { findings: Finding[]; canonicalBounds: { start: number; end: number } | null } {
  const section = sectionBounds(doc, /^38\.6\.2 Per-Breakpoint Layout Rules$/);
  if (!section) {
    return {
      canonicalBounds: null,
      findings: [{
        file: doc.path,
        line: 0,
        anchor: "38.6.2",
        message: "§38.6.2 Per-Breakpoint Layout Rules section is missing.",
      }],
    };
  }
  const row = doc.lines.slice(section.start, section.end + 1).find((line) => line.includes("| Touch-target minimum |"));
  if (row !== CANONICAL_TOUCH_ROW) {
    return {
      canonicalBounds: section,
      findings: [{
        file: doc.path,
        line: section.start,
        anchor: section.anchor,
        matched_text: row?.trim() ?? "missing Touch-target minimum row",
        message: `§38.6.2 must retain the canonical touch-target row: ${CANONICAL_TOUCH_ROW}`,
      }],
    };
  }
  return { findings: [], canonicalBounds: section };
}

function m5Findings(doc: SpecDoc): Finding[] {
  const row = findLineIncludingAll(doc, ["| `touch_target_per_tier_single_source` |"]);
  if (!row) {
    return [{
      file: doc.path,
      line: 0,
      matched_text: "`touch_target_per_tier_single_source`",
      message: "Appendix M.5 touch_target_per_tier_single_source row is missing.",
    }];
  }
  return requireTokens(doc, { text: row.text, line: row.line, anchor: "m5" }, "Appendix M.5 touch_target_per_tier_single_source row", [
    "**`runtime_active`**",
    "tools/spec-lint/gates/touch_target_per_tier_single_source.ts",
    "§38.6.2",
    "inline target-size numbers outside §38.6.2",
    "source-table citation",
  ]);
}

function uxFindings(
  ux: SpecDoc | undefined,
  masterPath: string,
  fixtureCanonicalBounds: { start: number; end: number } | null,
): Finding[] {
  if (!ux) {
    return [{
      file: masterPath,
      line: 0,
      matched_text: "UX_Design_of_Sourcera.md",
      message: "UX spec is required for touch_target_per_tier_single_source.",
    }];
  }
  return numericRestatementFindings(ux, ux.path === masterPath ? fixtureCanonicalBounds : null);
}

export const gate: SpecLintGate = {
  id: "touch_target_per_tier_single_source",
  sourcePhase: "Phase 37 P1",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "default_ci_gate_override",
  inputs: { masterSpec: true, uxSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const { findings: section38, canonicalBounds } = section38Findings(doc);
    return [
      ...section37Findings(doc),
      ...section38,
      ...numericRestatementFindings(doc, canonicalBounds),
      ...uxFindings(ctx.uxSpec, doc.path, canonicalBounds),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
