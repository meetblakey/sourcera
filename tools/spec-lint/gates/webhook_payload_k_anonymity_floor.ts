/**
 * Gate: `webhook_payload_k_anonymity_floor`
 *
 * Assertion: Marketplace-discovery customer-visible settlement webhooks expose
 * only recipient-owned rows or k=5 aggregates, never competitor-owned auction
 * settlement identity.
 */

import { computeSectionRanges, parseTableAt } from "../lib/spec_loader.js";
import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { TableRow } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  findLine,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
} from "./enterprise_security_gate_helpers.js";

const GATE_ID = "webhook_payload_k_anonymity_floor";

const SETTLED = "promoted_listing.auction_settled";
const LOST = "promoted_listing.auction_lost";
const SETTLED_MIRROR = "promoted_listing_auction_settled";
const LOST_MIRROR = "promoted_listing_auction_lost";

function sectionByTitle(doc: SpecDoc, title: string): { text: string; startLine: number; endLine: number } | null {
  const section = computeSectionRanges(doc).find((range) => range.heading.title.includes(title));
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

function tableAfterLine(doc: SpecDoc, line: number, toLine?: number): TableRow[] {
  return parseTableAt(doc, line, toLine).rows;
}

function rowWithFirstCell(rows: TableRow[], value: string): TableRow[] {
  return rows.filter((row) => (row.cells[0] ?? "").includes(`\`${value}\``));
}

function singleRow(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  rows: TableRow[],
  value: string,
  line: number,
): TableRow | null {
  const matches = rowWithFirstCell(rows, value);
  if (matches.length !== 1) {
    push(findings, doc, line, value, `${label} must contain exactly one row for ${value}; found ${matches.length}.`);
    return matches[0] ?? null;
  }
  return matches[0];
}

function requireRowTokens(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  row: TableRow | null,
  tokens: readonly string[],
) {
  if (!row) return;
  const text = row.cells.join(" | ");
  for (const token of tokens) {
    if (!text.includes(token)) push(findings, doc, row.line, token, `${label} row is missing required token: ${token}`);
  }
}

function rejectRowTokens(
  findings: Finding[],
  doc: SpecDoc,
  label: string,
  row: TableRow | null,
  tokens: readonly RegExp[],
) {
  if (!row) return;
  const text = row.cells.join(" | ");
  for (const token of tokens) {
    const match = text.match(token);
    if (match) push(findings, doc, row.line, match[0], `${label} row exposes a forbidden settlement-privacy token.`);
  }
}

function marketplaceCatalogFindings(findings: Finding[], doc: SpecDoc) {
  const body = sectionByTitle(doc, "34.16.7 Webhooks and API Surfaces");
  if (!body) {
    push(findings, doc, 0, "34.16.7", "§34.16.7 Webhooks and API Surfaces section is missing.");
    return;
  }

  requireTokens(findings, doc, body, "§34.16.7 audience privacy contract", [
    "Customer-visible marketplace-discovery webhooks MUST satisfy one of three payload-audience rules",
    "recipient-owned row only",
    "k-anonymized aggregate with an explicit k=5 floor",
    "Ops-only",
    "`promoted_listing.auction_settled` is recipient-owned only and MUST NOT include a multi-winner array",
    "`promoted_listing.auction_lost` MUST NOT include winner `org_id`, winner `paid_cents`, or any winner-owned `promoted_listing_id`",
  ]);

  const rows = tableAfterLine(doc, body.startLine, body.endLine);
  const settled = singleRow(findings, doc, "§34.16.7 marketplace-discovery catalog", rows, SETTLED, body.startLine);
  const lost = singleRow(findings, doc, "§34.16.7 marketplace-discovery catalog", rows, LOST, body.startLine);

  requireRowTokens(findings, doc, "§34.16.7 auction_settled", settled, [
    "winner: {org_id: <recipient_org_id>, paid_cents, rank, promoted_listing_id}",
    "Yes (winning Org only; self row only)",
    SETTLED_MIRROR,
  ]);
  rejectRowTokens(findings, doc, "§34.16.7 auction_settled", settled, [
    /\bwinners\[\]/i,
    /\ball winners\b/i,
    /\bbidders \+ winners\b/i,
    /\bnon-winning\b/i,
  ]);

  requireRowTokens(findings, doc, "§34.16.7 auction_lost", lost, [
    "recipient_org_id",
    "result: \"not_selected\"",
    "bidder_count_bucket ∈ {below_k, k_or_above}",
    "Yes (non-winning bidder Org only)",
    LOST_MIRROR,
  ]);
  rejectRowTokens(findings, doc, "§34.16.7 auction_lost", lost, [
    /\bwinners\[\]/i,
    /\bwinner_org_id\b/i,
    /\bwinner_paid(?:_cents|_amount)?\b/i,
    /\bwinner_promoted_listing_id\b/i,
    /\bwinner:\s*\{/i,
    /\bpaid_cents\b/i,
  ]);
}

function appendixCFindings(findings: Finding[], doc: SpecDoc) {
  const marker = findLine(doc, (line) => line.includes("Marketplace-Discovery-Domain additions"));
  if (!marker) {
    push(findings, doc, 0, "Marketplace-Discovery-Domain additions", "Appendix C marketplace-discovery additions table is missing.");
    return;
  }

  const rows = tableAfterLine(doc, marker.line);
  const settled = singleRow(findings, doc, "Appendix C marketplace-discovery additions", rows, SETTLED, marker.line);
  const lost = singleRow(findings, doc, "Appendix C marketplace-discovery additions", rows, LOST, marker.line);

  requireRowTokens(findings, doc, "Appendix C auction_settled", settled, [
    "Winning Seller Org only; self row only",
    "winner: {org_id: <recipient_org_id>, paid_cents, rank, promoted_listing_id}",
  ]);
  rejectRowTokens(findings, doc, "Appendix C auction_settled", settled, [
    /\bwinners\[\]/i,
    /\ball winners\b/i,
    /\bbidders \+ winners\b/i,
    /\bNon-winning\b/,
  ]);

  requireRowTokens(findings, doc, "Appendix C auction_lost", lost, [
    "Non-winning bidder Seller Org only",
    "result: \"not_selected\"",
    "bidder_count_bucket ∈ {below_k, k_or_above}",
  ]);
  rejectRowTokens(findings, doc, "Appendix C auction_lost", lost, [
    /\bwinner_org_id\b/i,
    /\bwinner_paid(?:_cents|_amount)?\b/i,
    /\bwinner_promoted_listing_id\b/i,
    /\bwinner:\s*\{/i,
    /\bpaid_cents\b/i,
  ]);
}

function appendixGFindings(findings: Finding[], doc: SpecDoc) {
  const marker = findLine(doc, (line) => line.includes("These rows register the §34.16.7 marketplace-discovery PostHog parallel events"));
  if (!marker) {
    push(findings, doc, 0, "§34.16.7 marketplace-discovery PostHog parallel events", "Appendix G marketplace-discovery mirror table is missing.");
    return;
  }

  const rows = tableAfterLine(doc, marker.line);
  const settled = singleRow(findings, doc, "Appendix G marketplace-discovery mirror", rows, SETTLED_MIRROR, marker.line);
  const lost = singleRow(findings, doc, "Appendix G marketplace-discovery mirror", rows, LOST_MIRROR, marker.line);

  requireRowTokens(findings, doc, "Appendix G auction_settled mirror", settled, [
    "Mirror of `promoted_listing.auction_settled`",
    "recipient_org_id",
    "promoted_listing_id",
    "paid_cents",
    "rank",
  ]);
  rejectRowTokens(findings, doc, "Appendix G auction_settled mirror", settled, [
    /\bwinners\[\]/i,
    /\ball winners\b/i,
  ]);

  requireRowTokens(findings, doc, "Appendix G auction_lost mirror", lost, [
    "Mirror of `promoted_listing.auction_lost`",
    "recipient_org_id",
    "promoted_listing_id",
    "bidder_count_bucket",
  ]);
  rejectRowTokens(findings, doc, "Appendix G auction_lost mirror", lost, [
    /\bwinner_org_id\b/i,
    /\bwinner_paid(?:_cents|_amount)?\b/i,
    /\bwinner_promoted_listing_id\b/i,
    /\bwinner:\s*\{/i,
    /\bpaid_cents\b/i,
  ]);
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Promoted Listing Webhook Audience P1",
  rowClass: "cross_feature_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    marketplaceCatalogFindings(findings, doc);
    appendixCFindings(findings, doc);
    appendixGFindings(findings, doc);
    requireTokens(findings, doc, sectionByTitle(doc, "27.11.8 Acceptance Criteria"), "§27.11.8 webhook audience privacy AC", [
      "`promoted_listing.auction_settled` and `promoted_listing.auction_lost` fire at most once per `(auction_id, recipient_org_id, event_type)` tuple",
      "loser payloads include no winner identity, winner paid amount, or winner-owned `promoted_listing_id`",
      "promoted_listing_auction_webhook_audience_privacy",
    ]);
    requireTokens(findings, doc, sectionByTitle(doc, "34.16.8 Acceptance Criteria"), "§34.16.8 webhook audience privacy AC", [
      "Marketplace Discovery webhook payloads MUST enforce recipient self-only or k=5 aggregate disclosure",
      "`promoted_listing.auction_settled` emits one recipient-owned winner row to each winner",
      "non-winners receive `promoted_listing.auction_lost` with no winner identity, winner paid amount, or winner-owned `promoted_listing_id`",
      "webhook_payload_k_anonymity_floor",
    ]);
    findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
