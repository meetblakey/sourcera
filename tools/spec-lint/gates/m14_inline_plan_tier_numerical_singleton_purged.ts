/**
 * Gate: `m14_inline_plan_tier_numerical_singleton_purged`
 *
 * Assertion: §48.7.1 contains no inline M14 plan-tier cap or safety-net
 * threshold numbers; those values are single-sourced in §34.1.2.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const CANONICAL_ROW = "§34.1.2 row **Bid Success Shares (M14)**";

const REQUIRED_SECTION_TOKENS = [
  "numerical caps cite §34.1.2 cited cells exclusively; no inline integer duplication",
  "numerical values single-sourced at §34.1.2",
  "`m14_inline_plan_tier_numerical_singleton_purged`",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/m14_inline_plan_tier_numerical_singleton_purged.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "§48.7.1 carries no inline integer plan-tier caps",
  "all M14 caps and safety-net thresholds cite §34.1.2 cells",
];

const FORBIDDEN_INLINE_CAP_PATTERNS: Array<[RegExp, string]> = [
  [/\b3\s*\/\s*month\b/i, "Starter monthly cap"],
  [/\b10\s*\/\s*month\b/i, "Growth monthly cap"],
  [/\b100\s+publishes\b/i, "Scale/Enterprise anti-abuse safety-net threshold"],
  [/\b30-day rolling window\b/i, "Scale/Enterprise anti-abuse safety-net window"],
  [/\bStarter\b[^.\n|]{0,80}\b3\b[^.\n|]{0,40}\bmonth\b/i, "Starter monthly cap"],
  [/\bGrowth\b[^.\n|]{0,80}\b10\b[^.\n|]{0,40}\bmonth\b/i, "Growth monthly cap"],
];

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function requireToken(findings: Finding[], doc: SpecDoc, text: string, line: number, label: string, token: string) {
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required M14 inline-singleton token: ${token}`);
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function sectionRange(doc: SpecDoc) {
  const section = findSectionByAnchor(doc, "48.7.1-m14-seller-bid-success-share");
  if (!section) return null;
  return {
    startLine: section.startLine,
    endLine: section.endLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
  };
}

function findLineInRange(
  doc: SpecDoc,
  startLine: number,
  endLine: number,
  predicate: (line: string) => boolean,
): { text: string; line: number } | null {
  for (let line = startLine; line <= endLine; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
}

function sectionSingletonFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionRange(doc);
  if (!section) {
    push(findings, doc, 0, "48.7.1-m14-seller-bid-success-share", "§48.7.1 M14 section is missing.");
    return findings;
  }

  for (const token of REQUIRED_SECTION_TOKENS) requireToken(findings, doc, section.text, section.startLine, "§48.7.1 M14 section", token);
  for (let line = section.startLine; line <= section.endLine; line++) {
    const text = doc.lines[line] ?? "";
    for (const [pattern, label] of FORBIDDEN_INLINE_CAP_PATTERNS) {
      const match = pattern.exec(text);
      if (match) push(findings, doc, line, match[0], `§48.7.1 must not restate the M14 ${label}; cite ${CANONICAL_ROW} instead.`);
    }
  }
  return findings;
}

function planGatingTableFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionRange(doc);
  if (!section) {
    push(findings, doc, 0, "48.7.1-m14-seller-bid-success-share", "§48.7.1 M14 section is missing.");
    return findings;
  }
  const header = findLineInRange(doc, section.startLine, section.endLine, (text) =>
    text.includes("| Seller plan tier enum | M14 Access | Source |"),
  );
  if (!header) {
    push(findings, doc, section.startLine, "Seller plan tier enum", "§48.7.1 Plan Gating table is missing.");
    return findings;
  }
  const table = parseTableAt(doc, header.line, section.endLine);
  const starter = table.rows.find((row) => row.cells[0] === "`seller_starter`");
  const growth = table.rows.find((row) => row.cells[0] === "`seller_growth`");
  const scale = table.rows.find((row) => row.cells[0] === "`seller_scale`");
  const enterprise = table.rows.find((row) => row.cells[0] === "`seller_enterprise`");

  for (const row of [starter, growth]) {
    if (!row) continue;
    requireToken(findings, doc, row.cells.join(" | "), row.line, `§48.7.1 Plan Gating ${row.cells[0]}`, "Per canonical §34.1.2 entitlement cell");
    requireToken(findings, doc, row.cells.join(" | "), row.line, `§48.7.1 Plan Gating ${row.cells[0]}`, CANONICAL_ROW);
  }
  for (const row of [scale, enterprise]) {
    if (!row) continue;
    requireToken(findings, doc, row.cells.join(" | "), row.line, `§48.7.1 Plan Gating ${row.cells[0]}`, "Unlimited plan-tier promise; safety-net is anti-abuse only");
    requireToken(findings, doc, row.cells.join(" | "), row.line, `§48.7.1 Plan Gating ${row.cells[0]}`, CANONICAL_ROW);
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `m14_inline_plan_tier_numerical_singleton_purged` |"));
  if (!row) {
    push(findings, doc, 0, "`m14_inline_plan_tier_numerical_singleton_purged`", "§M.5 row m14_inline_plan_tier_numerical_singleton_purged is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 m14_inline_plan_tier_numerical_singleton_purged row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "m14_inline_plan_tier_numerical_singleton_purged",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...sectionSingletonFindings(doc),
      ...planGatingTableFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
