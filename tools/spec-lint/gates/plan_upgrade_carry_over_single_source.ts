/**
 * Gate: `plan_upgrade_carry_over_single_source`
 *
 * Assertion: §34.5.1 points to the buyer and seller carry-over authorities
 * instead of publishing its own duplicate asset inventory.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle, parseTableAt } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "plan_upgrade_carry_over_single_source";

const BUYER_CARRY_OVER_TOKENS = [
  "This table is the buyer-side counterpart to the seller-side §34.19.1 / §34.19.1.A protected-asset table.",
  "| B1 | Workspaces and in-flight evaluations | Buyer Org / Workspace | 100% retained, read-write |",
  "| B7 | DowngradeExcessDataBucket restorations | Buyer Org / Console | 100% retained; restored atomically when plan recovers capacity | DowngradeExcessDataBucket (§4.8.10 / §34.6) |",
] as const;

const SELLER_CARRY_OVER_TOKENS = [
  "### 34.19.1 Protected Asset Classes on Upgrade",
  "### 34.19.1.A Protected Asset Sub-Class Bridge",
  "This table is the canonical bridge between the thirteen §34.19.1 asset classes and the concrete fields, entities, or audit rows that the preservation harness asserts.",
] as const;

const M5_ROW_TOKENS = [
  "content_consistency",
  "runtime_active",
  "tools/spec-lint/gates/plan_upgrade_carry_over_single_source.ts",
  "spec-tree §34.5.1 / §34.5.1.A / §34.19.1 / §34.19.1.A source-of-truth coverage only",
  "product plan-change orchestration, Stripe webhook handling, data migration, and preservation harness execution remain product-pack evidence",
] as const;

const SELLER_INVENTORY_TERMS = [
  "Verification Tier",
  "Promoted Listing history",
  "Pro Trial Seat grants",
  "Buyer relationship history",
  "Committed-spend contract",
  "Saved searches and alerts",
] as const;

function push(findings: Finding[], doc: SpecDoc, line: number, matchedText: string, message: string): void {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matchedText,
    message,
  });
}

function requireDocTokens(findings: Finding[], doc: SpecDoc, tokens: readonly string[], label: string): void {
  for (const token of tokens) {
    if (!doc.text.includes(token)) push(findings, doc, 0, token, `${label} is missing required token: ${token}`);
  }
}

function carryOverRowFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByTitle(doc, /^34\.5\.1 Upgrade$/);
  if (!section) {
    push(findings, doc, 0, "34.5.1 Upgrade", "§34.5.1 Upgrade section is missing.");
    return findings;
  }
  const rows = parseTableAt(doc, section.startLine, section.endLine).rows;
  const carryOverRows = rows.filter((row) => row.cells[0] === "Carry-over");
  if (carryOverRows.length !== 1) {
    push(findings, doc, section.startLine, "Carry-over", "§34.5.1 must have exactly one Carry-over row.");
    return findings;
  }
  const row = carryOverRows[0];
  const text = row.cells.join(" | ");
  for (const token of [
    "Seller-side carry-over is canonical in §34.19.1 / §34.19.1.A",
    "Buyer-side carry-over is canonical in §34.5.1.A",
    "No implementation may derive an upgrade handler from an inline list in this row.",
  ]) {
    if (!text.includes(token)) push(findings, doc, row.line, token, `§34.5.1 Carry-over row is missing token: ${token}`);
  }
  for (const term of SELLER_INVENTORY_TERMS) {
    if (text.includes(term)) {
      push(
        findings,
        doc,
        row.line,
        term,
        "§34.5.1 Carry-over row must cite §34.19.1 / §34.19.1.A instead of duplicating seller asset inventory.",
      );
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 34.19",
  rowClass: "content_consistency",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "34.5.1.a-buyer-side-upgrade-carry-over-set",
      "§34.5.1.A Buyer-side carry-over",
      BUYER_CARRY_OVER_TOKENS,
    );
    if (!findSectionByAnchor(ctx.masterSpec, "34.19.1.a-protected-asset-sub-class-bridge")) {
      push(findings, ctx.masterSpec, 0, "34.19.1.a-protected-asset-sub-class-bridge", "§34.19.1.A protected asset bridge is missing.");
    }
    requireDocTokens(findings, ctx.masterSpec, SELLER_CARRY_OVER_TOKENS, "Seller carry-over authority");
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return [...findings, ...carryOverRowFindings(ctx.masterSpec)];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
