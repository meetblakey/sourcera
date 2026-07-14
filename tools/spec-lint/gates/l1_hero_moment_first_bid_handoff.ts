/**
 * Gate: `l1_hero_moment_first_bid_handoff`
 *
 * Assertion: L1 and Seller Hero Moment observe the same first-bid
 * submission through the canonical `(seller_org_id, bid_workspace_id)` join,
 * while the short onboarding names remain documentation-only aliases.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, push } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "l1_hero_moment_first_bid_handoff";

function sectionText(doc: SpecDoc, anchor: string): { text: string; line: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return { text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"), line: section.startLine };
}

function requireSectionLineTokens(
  findings: Finding[],
  doc: SpecDoc,
  scope: { text: string; line: number } | null,
  label: string,
  predicate: (line: string) => boolean,
  tokens: readonly string[],
) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  const lines = scope.text.split("\n");
  const index = lines.findIndex(predicate);
  if (index < 0) {
    push(findings, doc, scope.line, label, `${label} row is missing.`);
    return;
  }
  const text = lines[index] ?? "";
  for (const token of tokens) {
    if (!text.includes(token)) push(findings, doc, scope.line + index, token, `${label} row is missing required token: ${token}`);
  }
}

function requireTokens(
  findings: Finding[],
  doc: SpecDoc,
  scope: { text: string; line: number } | null,
  label: string,
  tokens: readonly string[],
) {
  if (!scope) {
    push(findings, doc, 0, label, `${label} section is missing.`);
    return;
  }
  for (const token of tokens) {
    if (!scope.text.includes(token)) push(findings, doc, scope.line, token, `${label} is missing required token: ${token}`);
  }
}

function forbidTokens(findings: Finding[], doc: SpecDoc, scope: { text: string; line: number } | null, label: string, tokens: readonly string[]) {
  if (!scope) return;
  for (const token of tokens) {
    const offset = scope.text.indexOf(token);
    if (offset >= 0) push(findings, doc, scope.line, token, `${label} retains forbidden non-canonical event wording: ${token}`);
  }
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const l1 = sectionText(doc, "48.2.2-l1-vendor-invite-creates-account");
  requireTokens(findings, doc, l1, "§48.2.2 L1 first-bid handoff", [
    "`growth_loop_l1_first_bid_completed`",
    "`seller_org_id`",
    "`bid_workspace_id`",
    "`growth_loop_l1_first_bid_completed` and `seller_onboarding_first_bid_submitted` MUST represent the same logical bid submission",
    "PostHog Insights joined funnel",
  ]);

  requireTokens(findings, doc, sectionText(doc, "48.8.4-in-workspace-value-proof-minutes-3-45"), "§48.8.4 canonical onboarding telemetry", [
    "seller_onboarding_first_requirement_response",
    "seller_onboarding_first_bid_submitted",
    "session_id",
    "bid_workspace_id",
  ]);

  requireTokens(findings, doc, sectionText(doc, "51.0.3-conversion-funnel-registry-per-growth-path"), "§51.0.3 forced-signup funnel", [
    "`forced_vendor_signup_funnel`",
    "growth_loop_l1_first_bid_completed",
    "seller_onboarding_first_bid_submitted",
    "joined to `seller_onboarding_first_bid_submitted` on `(seller_org_id, bid_workspace_id)`",
  ]);
  requireTokens(findings, doc, sectionText(doc, "51.1.5-event-catalog-cross-reference-appendix-g"), "§51.1.5 Forced-Vendor-Signup Playbook", [
    "growth_loop_l1_first_bid_completed",
    "seller_onboarding_first_bid_submitted",
    "same logical L1-linked bid submission",
    "shared analytics join",
  ]);

  const appendixG = sectionText(doc, "appendix-g-posthog-event-taxonomy");
  requireSectionLineTokens(findings, doc, appendixG, "Appendix G L1 first-bid event", (line) => line.trim().startsWith("| `growth_loop_l1_first_bid_completed` |"), [
    "`seller_org_id`",
    "`bid_workspace_id`",
  ]);
  requireSectionLineTokens(findings, doc, appendixG, "Appendix G onboarding first-bid event", (line) => line.trim().startsWith("| `seller_onboarding_first_bid_submitted` |"), [
    "`seller_org_id`",
    "`bid_workspace_id`",
  ]);

  const stage5 = sectionText(doc, "49.1.5-stage-5-in-workspace-review");
  requireTokens(findings, doc, stage5, "§49.1.5 canonical first-response event", [
    "`seller_onboarding_first_requirement_response`",
    "`seller_onboarding_first_requirement_response` is the only emitted event name",
  ]);
  forbidTokens(findings, doc, stage5, "§49.1.5", ["canonical short form", "MUST be emittable under BOTH"]);

  const stage6 = sectionText(doc, "49.1.6-stage-6-first-bid-submission");
  requireTokens(findings, doc, stage6, "§49.1.6 canonical first-bid event", ["`seller_onboarding_first_bid_submitted`"]);
  forbidTokens(findings, doc, stage6, "§49.1.6", ["canonical short form"]);

  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM V13",
  rowClass: "content_consistency",
  executionContext: "post-build",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
