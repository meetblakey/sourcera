/**
 * Gate: `solo_mode_engine_field_not_in_seller_serializers`
 *
 * Assertion: the spec-tree seller / marketplace / public-pricing contracts do
 * not authorize `evaluation_owner_mode` to cross the buyer-to-seller boundary.
 * This proves the documentation contract only; product serializer/runtime tests
 * remain separate evidence.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByAnchor, findSectionByTitle, fenceMask } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens } from "./enterprise_security_gate_helpers.js";

const FIELD = "evaluation_owner_mode";

const REQUIRED_2_8_6 = [
  "The seller never learns the buyer's `evaluation_owner_mode`.",
  "The Console Bridge Event payload (§4.7.1) excludes the field",
  "the Public Pricing API (§32, §4.8.9) excludes the field",
  "the Marketplace Listing exposes only the buyer Workspace's `pipeline_stage_id`, never its mode",
];

const REQUIRED_2_8_7 = [
  "The `evaluation_owner_mode` field MUST NOT appear in any Console Bridge Event payload (§4.7.1), any seller-visible API response (§32), any Marketplace Listing serialization (§27), or the Public Pricing API (§4.8.9).",
  "The seller MUST NOT learn the buyer's mode under any code path.",
];

const FORBIDDEN_SCOPES = [
  { label: "§4.7.1 Console Bridge Event", anchor: "4.7.1-console-bridge-event" },
  { label: "§4.5.1 Marketplace Listing", anchor: "4.5.1-marketplace-listing" },
  { label: "§27 Marketplace", anchor: "27.-vendor-discovery-and-rfp-marketplace" },
  { label: "§32.8.1 Public Pricing API", anchor: "32.8.1-get-pricing" },
  { label: "§32.10.4 Seller Bid Workspace Endpoints", anchor: "32.10.4-seller-bid-workspace-endpoints" },
  { label: "§32.10.4.B Seller Inbox / Analytics Endpoints", anchor: "32.10.4.b-seller-inbox-nda-execution-and-seller-analytics-endpoints" },
  { label: "§32.10.4.A Seller Teams / Response Endpoints", anchor: "32.10.4.a-seller-teams-triage-queue-and-vendor-response-endpoints" },
  { label: "§32.10.5 Seller KB Management Endpoints", anchor: "32.10.5-seller-kb-management-endpoints" },
];

const NEGATIVE_CONTEXT_RE = /\b(?:MUST NOT|must not|never|excludes?|excluded|forbidden|not appear|Buyer-only|buyer-only)\b/;

function push(findings: Finding[], doc: SpecDoc, line: number, matched: string, message: string) {
  findings.push({
    file: doc.path,
    line,
    anchor: anchorForLine(doc, line),
    matched_text: matched,
    message,
  });
}

function sectionRange(doc: SpecDoc, anchor: string): { startLine: number; endLine: number } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return { startLine: section.startLine, endLine: section.endLine };
}

function sectionTextByTitle(doc: SpecDoc, title: RegExp): { text: string; startLine: number; endLine: number } | null {
  const section = findSectionByTitle(doc, title);
  if (!section) return null;
  return {
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    startLine: section.startLine,
    endLine: section.endLine,
  };
}

function forbiddenFieldFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const mask = fenceMask(doc);

  for (const scopeDef of FORBIDDEN_SCOPES) {
    const range = sectionRange(doc, scopeDef.anchor);
    if (!range) {
      push(findings, doc, 0, scopeDef.label, `${scopeDef.label} section is missing.`);
      continue;
    }

    for (let line = range.startLine; line <= range.endLine; line += 1) {
      if (mask[line]) continue;
      const text = doc.lines[line] ?? "";
      if (!text.includes(FIELD)) continue;
      if (NEGATIVE_CONTEXT_RE.test(text)) continue;
      push(
        findings,
        doc,
        line,
        text.trim(),
        `${scopeDef.label} must not expose \`${FIELD}\` in seller-visible, marketplace-visible, bridge, or public-pricing payload contracts.`,
      );
    }
  }

  return findings;
}

export const gate: SpecLintGate = {
  id: "solo_mode_engine_field_not_in_seller_serializers",
  sourcePhase: "14.4",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_console_firewall",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    requireTokens(findings, doc, sectionTextByTitle(doc, /^2\.8\.6 Cross-Console Behavior$/), "§2.8.6 Cross-Console Behavior", REQUIRED_2_8_6);
    requireTokens(findings, doc, sectionTextByTitle(doc, /^2\.8\.7 Acceptance Criteria$/), "§2.8.7 Acceptance Criteria", REQUIRED_2_8_7);
    findings.push(...forbiddenFieldFindings(doc));
    findings.push(...m5RuntimeActiveFindings(doc, "solo_mode_engine_field_not_in_seller_serializers"));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
