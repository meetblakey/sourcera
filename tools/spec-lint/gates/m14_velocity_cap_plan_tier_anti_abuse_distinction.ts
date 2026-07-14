/**
 * Gate: `m14_velocity_cap_plan_tier_anti_abuse_distinction`
 *
 * Assertion: M14 plan-tier availability, Starter/Growth caps, and
 * Scale/Enterprise anti-abuse safety-net thresholds are owned by §34.1.2 row
 * "Bid Success Shares (M14)"; §48.7.1 cites that row without restating numbers.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

const CANONICAL_ROW = "§34.1.2 row **Bid Success Shares (M14)**";

const PRICE_ROW_TOKENS = [
  "3/month",
  "10/month",
  "Unlimited; anti-abuse safety-net 100 publishes / 30-day rolling window",
  "Ops-configurable by `ops_security_admin`",
  "not a plan-tier ceiling",
  "V13 D-48-004 singleton remediation",
  "AE-V72REM-PH48-M14-PLAN-SINGLETON-01",
];

const VELOCITY_TOKENS = [
  `resolve exclusively from ${CANONICAL_ROW}`,
  "§48.7.1 MUST NOT restate plan-tier caps or safety-net thresholds inline",
  'The Scale / Enterprise "Unlimited" semantic remains intact at the plan-tier level',
  "the safety-net is an Ops Security circuit-breaker, not a plan promise",
  "`m14_velocity_cap_plan_tier_anti_abuse_distinction`",
];

const M5_TOKENS = [
  "**`runtime_active`**",
  "tools/spec-lint/gates/m14_velocity_cap_plan_tier_anti_abuse_distinction.ts",
  "verified PASS on live Master Spec and pass/fail fixtures",
  "anti-abuse #3 and Plan Gating table cite §34.1.2 row **Bid Success Shares (M14)**",
  'Scale / Enterprise "Unlimited" stays a plan-tier promise',
  "safety-net is anti-abuse only",
];

const FORBIDDEN_INLINE_CAP_PATTERNS: Array<[RegExp, string]> = [
  [/\b3\s*\/\s*month\b/i, "Starter monthly cap"],
  [/\b10\s*\/\s*month\b/i, "Growth monthly cap"],
  [/\b100\s+publishes\b/i, "Scale/Enterprise anti-abuse safety-net threshold"],
  [/\b30-day rolling window\b/i, "Scale/Enterprise anti-abuse safety-net window"],
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
  if (!text.includes(token)) push(findings, doc, line, token, `${label} is missing required M14 velocity singleton token: ${token}`);
}

function sectionRange(doc: SpecDoc, anchor: string) {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    startLine: section.startLine,
    endLine: section.endLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
  };
}

function findLine(doc: SpecDoc, predicate: (line: string) => boolean): { text: string; line: number } | null {
  for (let line = 1; line < doc.lines.length; line++) {
    const text = doc.lines[line] ?? "";
    if (predicate(text)) return { text, line };
  }
  return null;
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

function pricingRowFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByAnchor(doc, "34.1.2-seller-plan-tiers") ?? findSectionByTitle(doc, "34.1.2 Seller Plan Tiers");
  if (!section) {
    push(findings, doc, 0, "34.1.2-seller-plan-tiers", "§34.1.2 Seller Plan Tiers section is missing.");
    return findings;
  }
  const table = parseTableAt(doc, section.startLine, section.endLine);
  const row = table.rows.find((candidate) => candidate.cells[0] === "**Bid Success Shares (M14)**");
  if (!row) {
    push(findings, doc, section.startLine, "**Bid Success Shares (M14)**", "§34.1.2 is missing the canonical Bid Success Shares (M14) row.");
    return findings;
  }

  const rowText = row.cells.join(" | ");
  for (const token of PRICE_ROW_TOKENS) requireToken(findings, doc, rowText, row.line, "§34.1.2 Bid Success Shares (M14) row", token);
  if (row.cells[3] !== "3/month") push(findings, doc, row.line, row.cells[3] ?? "", "§34.1.2 Seller Starter M14 cell must be the canonical 3/month cap.");
  if (row.cells[4] !== "10/month") push(findings, doc, row.line, row.cells[4] ?? "", "§34.1.2 Seller Growth M14 cell must be the canonical 10/month cap.");
  for (const index of [5, 6]) {
    const cell = row.cells[index] ?? "";
    if (!cell.startsWith("Unlimited; anti-abuse safety-net")) {
      push(findings, doc, row.line, cell, "§34.1.2 Seller Scale/Enterprise M14 cells must preserve Unlimited as the plan-tier promise and describe the safety-net as anti-abuse only.");
    }
  }
  return findings;
}

function antiAbuseFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionRange(doc, "48.7.1-m14-seller-bid-success-share");
  if (!section) {
    push(findings, doc, 0, "48.7.1-m14-seller-bid-success-share", "§48.7.1 M14 section is missing.");
    return findings;
  }
  const line = findLineInRange(doc, section.startLine, section.endLine, (text) => text.includes("**Velocity throttle:**"));
  if (!line) {
    push(findings, doc, section.startLine, "**Velocity throttle:**", "§48.7.1 anti-abuse control #3 Velocity throttle is missing.");
    return findings;
  }
  for (const token of VELOCITY_TOKENS) requireToken(findings, doc, line.text, line.line, "§48.7.1 Velocity throttle", token);
  for (const [pattern, label] of FORBIDDEN_INLINE_CAP_PATTERNS) {
    const match = pattern.exec(line.text);
    if (match) push(findings, doc, line.line, match[0], `§48.7.1 Velocity throttle must cite §34.1.2 instead of restating the ${label}.`);
  }
  return findings;
}

function planGatingFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = sectionRange(doc, "48.7.1-m14-seller-bid-success-share");
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
  const expectedRows = new Map([
    ["`seller_free`", "Not available"],
    ["`seller_solo`", "Not available pending AE-V72REM-PH48-M14-PLAN-SINGLETON-01 ratification"],
    ["`seller_starter`", "Per canonical §34.1.2 entitlement cell"],
    ["`seller_growth`", "Per canonical §34.1.2 entitlement cell"],
    ["`seller_scale`", "Unlimited plan-tier promise; safety-net is anti-abuse only"],
    ["`seller_enterprise`", "Unlimited plan-tier promise; safety-net is anti-abuse only"],
  ]);

  for (const [tier, access] of expectedRows) {
    const row = table.rows.find((candidate) => candidate.cells[0] === tier);
    if (!row) {
      push(findings, doc, header.line, tier, `§48.7.1 Plan Gating table is missing ${tier}.`);
      continue;
    }
    const rowText = row.cells.join(" | ");
    requireToken(findings, doc, rowText, row.line, `§48.7.1 Plan Gating ${tier}`, access);
    requireToken(findings, doc, rowText, row.line, `§48.7.1 Plan Gating ${tier}`, CANONICAL_ROW);
    for (const [pattern, label] of FORBIDDEN_INLINE_CAP_PATTERNS) {
      const match = pattern.exec(rowText);
      if (match) push(findings, doc, row.line, match[0], `§48.7.1 Plan Gating table must cite §34.1.2 instead of restating the ${label}.`);
    }
  }
  return findings;
}

function m5Findings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const row = findLine(doc, (line) => line.trim().startsWith("| `m14_velocity_cap_plan_tier_anti_abuse_distinction` |"));
  if (!row) {
    push(findings, doc, 0, "`m14_velocity_cap_plan_tier_anti_abuse_distinction`", "§M.5 row m14_velocity_cap_plan_tier_anti_abuse_distinction is missing.");
    return findings;
  }
  for (const token of M5_TOKENS) requireToken(findings, doc, row.text, row.line, "§M.5 m14_velocity_cap_plan_tier_anti_abuse_distinction row", token);
  return findings;
}

export const gate: SpecLintGate = {
  id: "m14_velocity_cap_plan_tier_anti_abuse_distinction",
  sourcePhase: "V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    return [
      ...pricingRowFindings(doc),
      ...antiAbuseFindings(doc),
      ...planGatingFindings(doc),
      ...m5Findings(doc),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
