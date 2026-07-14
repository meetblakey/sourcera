/**
 * Gate: `downgrade_api_integration_bucket_classes_registered`
 *
 * Assertion: API-key and integration-endpoint downgrade bucket classes are
 * present in every spec-tree authority needed to make the behavior buildable.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import { anchorForLine, findSectionByTitle } from "../lib/spec_loader.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  requireM5RowTokens,
  requireRuntimeActive,
  requireSectionTokensByAnchor,
} from "./responsive_mobile_gate_helpers.js";

const GATE_ID = "downgrade_api_integration_bucket_classes_registered";
const CLASSES = ["api_keys_over_cap", "integration_endpoints_over_cap"] as const;

const ENTITY_TOKENS = [
  "| `data_class` | Enum | See Appendix J `downgrade_excess_data_class`:",
  "`api_keys_over_cap`, `integration_endpoints_over_cap`",
] as const;

const PRE_DOWNGRADE_TOKENS = [
  "| API keys over cap | Count over cap | Existing keys remain usable until revoked or archived, but new key creation, regeneration, and rotation are blocked until count is under cap; unresolved excess enters `DowngradeExcessDataBucket.data_class=api_keys_over_cap` |",
  "| Integration endpoints over cap | Count over cap | Existing webhook / integration endpoints continue delivery while in preservation, but new endpoint registration and secret rotation are blocked until count is under cap; unresolved excess enters `DowngradeExcessDataBucket.data_class=integration_endpoints_over_cap` |",
] as const;

const ENFORCEMENT_TOKENS = [
  "Per §4.8.10 `downgrade_excess_data_class` enum (Appendix J):",
  "`api_keys_over_cap` preserves API-key metadata, hash, prefix, scope, and revocation state.",
  "`integration_endpoints_over_cap` preserves webhook / integration endpoint configuration, signing-secret metadata, delivery cursor, and failure-state rows.",
] as const;

const APPENDIX_J_TOKENS = [
  "### `downgrade_excess_data_class` (§4.8.10 DowngradeExcessDataBucket)",
  "`workspaces`, `requirements_over_cap`, `kb_entries_over_cap`, `vendors_over_cap`, `capability_declarations_over_cap`, `seller_software_over_cap`, `firecrawl_sources_over_cap`, `concurrent_bids_over_cap`, `seller_signals_over_cap`, `evaluations_over_cap`, `team_agent_instructions_over_cap`, `api_keys_over_cap`, `integration_endpoints_over_cap`",
  "`api_keys_over_cap` and `integration_endpoints_over_cap` preserve credentials and integration configuration read-only while blocking new creation, regeneration, re-registration, and rotation until the Org returns under cap.",
] as const;

const M5_ROW_TOKENS = [
  "spec_tree_lint",
  "runtime_active",
  "tools/spec-lint/gates/downgrade_api_integration_bucket_classes_registered.ts",
  "spec-tree §4.8.10 / §34.5.3 / §34.6.4 / Appendix J data-class coverage only",
  "product cap counters, API-key serializers, webhook delivery behavior, credential rotation blocking, and deploy validators remain product-pack evidence",
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

function appendixDataClassFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section = findSectionByTitle(doc, "`downgrade_excess_data_class`");
  if (!section) {
    push(findings, doc, 0, "downgrade_excess_data_class", "Appendix J downgrade_excess_data_class enum is missing.");
    return findings;
  }
  const text = doc.lines.slice(section.startLine, section.endLine + 1).join("\n");
  for (const className of CLASSES) {
    if (!text.includes(`\`${className}\``)) {
      push(findings, doc, section.startLine, className, `Appendix J downgrade_excess_data_class is missing ${className}.`);
    }
  }
  return findings;
}

function classCoverageFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const loci = [
    { title: "§4.8.10 DowngradeExcessDataBucket", anchor: "4.8.10-downgradeexcessdatabucket" },
    { title: "§34.6.4 Entities Subject to Downgrade Enforcement", match: /^34\.6\.4 Entities Subject to Downgrade Enforcement$/ },
  ] as const;
  for (const locus of loci) {
    const section = "anchor" in locus ? null : findSectionByTitle(doc, locus.match);
    const text = "anchor" in locus
      ? doc.text
      : section
        ? doc.lines.slice(section.startLine, section.endLine + 1).join("\n")
        : "";
    if (!("anchor" in locus) && !section) {
      push(findings, doc, 0, locus.title, `${locus.title} section is missing.`);
      continue;
    }
    for (const className of CLASSES) {
      if (!text.includes(className)) push(findings, doc, section?.startLine ?? 0, className, `${locus.title} is missing ${className}.`);
    }
  }
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.2.0-REM Phase 34.19",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    const findings: Finding[] = [];
    requireSectionTokensByAnchor(
      findings,
      ctx.masterSpec,
      "4.8.10-downgradeexcessdatabucket",
      "§4.8.10 DowngradeExcessDataBucket",
      ENTITY_TOKENS,
    );
    requireDocTokens(findings, ctx.masterSpec, PRE_DOWNGRADE_TOKENS, "§34.5.3 pre-downgrade validation");
    requireDocTokens(findings, ctx.masterSpec, ENFORCEMENT_TOKENS, "§34.6.4 API/integration downgrade enforcement");
    requireDocTokens(findings, ctx.masterSpec, APPENDIX_J_TOKENS, "Appendix J downgrade data-class enum");
    requireM5RowTokens(findings, ctx.masterSpec, GATE_ID, M5_ROW_TOKENS);
    requireRuntimeActive(findings, ctx.masterSpec, GATE_ID);
    return [...findings, ...appendixDataClassFindings(ctx.masterSpec), ...classCoverageFindings(ctx.masterSpec)];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
