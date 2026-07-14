/**
 * Gate: `seller_maya_surface_abstraction_engine_unchanged`
 *
 * Assertion: Seller Maya surface abstraction is a rendering-layer contract.
 * CapabilityDeclaration, KB Health, Match Score, and Solo-tier envelope engine
 * semantics remain the authority and are not replaced by §22.20.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { findSectionByAnchor } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";

function sectionText(doc: SpecDoc, anchor: string): { line: number; text: string; anchor?: string } | null {
  const section = findSectionByAnchor(doc, anchor);
  if (!section) return null;
  return {
    line: section.startLine,
    text: doc.lines.slice(section.startLine, section.endLine + 1).join("\n"),
    anchor: section.heading.anchor,
  };
}

function requireTokens(
  doc: SpecDoc,
  section: { line: number; text: string; anchor?: string } | null,
  label: string,
  tokens: string[],
): Finding[] {
  if (!section) {
    return [{ file: doc.path, line: 0, anchor: label, message: `${label} section is missing.` }];
  }
  const findings: Finding[] = [];
  for (const token of tokens) {
    if (!section.text.includes(token)) {
      findings.push({
        file: doc.path,
        line: section.line,
        anchor: section.anchor,
        matched_text: token,
        message: `${label} is missing Seller Maya engine-preservation binding: ${token}`,
      });
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: "seller_maya_surface_abstraction_engine_unchanged",
  sourcePhase: "14.8",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    const doc = ctx.masterSpec;
    const findings: Finding[] = [];

    const sellerMaya = sectionText(doc, "22.20-seller-maya-surface-abstraction");
    findings.push(...requireTokens(doc, sellerMaya, "§22.20 Seller Maya Surface Abstraction", [
      "§22.20 is not a new entity catalog, a new RBAC scope, a new billing semantic, a new state machine, or a new API endpoint.",
      "It introduces no new fields on `KBEntry`, `CapabilityDeclaration`, `SellerOnboardingSession`, `MarketplaceMatchScoreSnapshot`, `KBHealthRollup`, or `AIOperation`; the engine those entities encode is preserved byte-for-byte.",
      "§22.20 is a rendering-layer contract",
      "Engine-side data writes, audit-event emissions, AIOperation settlements, and webhook delivery are unchanged in every compression rule.",
      "CI gate `seller_maya_surface_abstraction_engine_unchanged` (Phase 14.18) asserts at deploy time.",
      "### 22.20.2 Compression Rule 1 — Capability Declarations",
      "### 22.20.3 Compression Rule 2 — KB Governance",
      "### 22.20.4 Compression Rule 3 — Match Scoring Three-Label Compression",
      "### 22.20.5 Compression Rule 4 — AIOp Consumption",
      "`MarketplaceMatchScoreSnapshot` engine writes preserved.",
      "AIWallet counter suppression on Solo / Free.",
      "§22.18.4 Seller Panel exempt from §22.20.5.",
      "CI gate: `seller_maya_surface_abstraction_engine_unchanged` — deploy-time validator asserts that no §4.4.4, §22.5, §27.4, or §44 engine field is mutated as a side effect of the §22.20 surface compression.",
    ]));

    const capabilityDeclaration = sectionText(doc, "4.4.4-capability-declaration");
    findings.push(...requireTokens(doc, capabilityDeclaration, "§4.4.4 Capability Declaration", [
      "`capability_type` field makes this boundary schema-enforced",
      "`state` | Enum | See Appendix J `capability_declaration_state`",
      "Match-Score Eligibility (Derived, Not Stored).",
      "`match_score_eligible = (capability_type = 'taxonomy_declaration') AND (state = 'published') AND (last_taxonomy_validation_at ≥ now − 7 days)`",
    ]));

    const kbHealth = sectionText(doc, "22.5-kb-health-model");
    findings.push(...requireTokens(doc, kbHealth, "§22.5 KB Health Model", [
      "Every KB entry carries a stored `confidence_score`",
      "The decay job runs daily as a Convex scheduled function (`kb_confidence_decay_daily`)",
      "confidence_modifier = clamp(",
      "The KB Health Dashboard groups entries by status",
    ]));

    const matchScore = sectionText(doc, "27.4-marketplace-match-score");
    findings.push(...requireTokens(doc, matchScore, "§27.4 Marketplace Match Score", [
      "Each materialized score writes to a `MarketplaceMatchScoreSnapshot` row",
      "no other code path may mint a score",
      "The feature set is an Ops-managed registry (`MarketplaceMatchFeatureRegistry`, canonical entity §4.5.10",
      "Label-only rendering invariants.",
      "Free/Starter buyer or seller surface MUST NOT expose the numeric score",
    ]));

    const soloTreatment = sectionText(doc, "44.6-solo-tier-surface-treatment");
    findings.push(...requireTokens(doc, soloTreatment, "§44.6 Solo-Tier Surface Treatment", [
      "§44.6 is the authoritative landing for the Phase 14.10 \"AI Consumption Invisibility for Solo\" surface contract.",
      "preserves the entire AIOperation engine",
      "the engine continues to compute and persist the underlying values without surface exposure.",
      "`solo_engine_metering_parity`.",
      "Every provider-invoked AIOperation written by a Solo Org MUST record `value_price_cents` and `cost_price_cents`",
      "A pre-provider suppression decision is the sole exception",
      "No other Solo engine bypass is permitted.",
    ]));

    const appendixM = sectionText(doc, "appendix-m-surface-engine-mapping");
    findings.push(...requireTokens(doc, appendixM, "Appendix M Seller Maya gate row", [
      "| `seller_maya_surface_abstraction_engine_unchanged` | 14.8 |",
      "No commit modifies a §4.4.4 CapabilityDeclaration field, §22.5 KB Health Model rule, §27.4 Match Score computation, or §44 envelope value as a side effect of a §22.20 surface-compression edit.",
      "§22.20 reconciliation entry.",
    ]));

    return findings;
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
