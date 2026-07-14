/**
 * Gate: `policy_ingestion_limit_single_source`
 *
 * Assertion: Policy Ingestion plan, throughput, page, token, field-size,
 * confidence, dedup, deadline, and batch values are owned by §39.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { forbidTokens, m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor, sectionTextByTitle } from "./policy_ingestion_gate_helpers.js";

const SECTION_39_TOKENS = [
  "PolicyDocument | `file_byte_size` | 100 MB per upload",
  "PolicyDocument | `page_count` per upload",
  "PolicyDocument | pages per billing month",
  "PolicyIngestionJob | ingestions per billing month",
  "PolicyIngestionJob | extraction token budget | 100,000 tokens per job",
  "PolicyIngestionJob | `partial_extraction_reason` | 1,000 chars",
  "PolicyIngestionJob | `resume_section_locator` | 500 chars",
  "Policy Ingestion | framework confidence thresholds",
  "PolicyControl | `control_id` | 120 chars",
  "PolicyControl | `title` | 100 chars",
  "PolicyControl | `description` | 500 chars",
  "PolicyControl | dedup cosine similarity threshold | 0.900",
  "PolicyControl | dedup default-checked threshold | 0.950",
  "PolicyAmendment | `review_deadline_at` duration | 7 calendar days from creation",
  "PolicyAmendment | batch review threshold | 5 pending amendments per PolicyIngestionJob",
] as const;

const SECTION_12_TOKENS = [
  "Plan access and billing posture are canonical in §34.1.1 cell **Policy Ingestion (Opus capability)** and §34.8.5 `policy_parsing`.",
  "Throughput, page, token, file-size, field-size, confidence-threshold, dedup-threshold, and batch-review limits are canonical in §39.",
  "§12 must cite those tables and must not carry duplicate plan numerals.",
  "| Object and throughput limits | §39 Policy Ingestion rows | Upload, extraction, dedup, amendment, publish |",
] as const;

const SECTION_32_TOKENS = [
  "§39 limits",
  "§39 page or file-size limit exceeded",
  "§39 token budget",
  "§39 throughput cap exhausted",
] as const;

const APPENDIX_J_TOKENS = [
  "Band threshold values are the §39 `Policy Ingestion | framework confidence thresholds` singleton; Appendix J owns enum values only.",
] as const;

const FORBIDDEN_OUTSIDE_SECTION_39 = [
  "100 MB per upload",
  "100 pages",
  "250 pages",
  "500 pages",
  "300 pages",
  "2,500 pages",
  "100,000 tokens per job",
  "high-confidence auto-accept: 0.800+",
  "low-confidence confirm: 0.600-0.799",
  "unknown/manual: below 0.600",
  "0.60–0.79",
  "0.80",
  "dedup cosine similarity threshold | 0.900",
  "dedup default-checked threshold | 0.950",
  "7 calendar days from creation",
  "7-day review deadline",
  "7-day deadline",
  "5 pending amendments per PolicyIngestionJob",
] as const;

function sourceRowsFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "39.-object-size-constraints"), "§39 Policy Ingestion singleton rows", SECTION_39_TOKENS);
  return findings;
}

function consumerFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  const section12 = sectionTextByAnchor(doc, "12.-policy-powered-requirement-generation");
  const section32 = sectionTextByAnchor(doc, "32.10.3.c-policy-ingestion-endpoints");
  const appendixJ = sectionTextByAnchor(doc, "appendix-j-v72rem-phase-10");

  requireTokens(findings, doc, sectionTextByTitle(doc, "12.8.1 Ingestion Limits"), "§12.8.1 Policy Ingestion limits", SECTION_12_TOKENS);
  requireTokens(findings, doc, section32, "§32.10.3.C Policy Ingestion limit citations", SECTION_32_TOKENS);
  requireTokens(findings, doc, appendixJ, "Appendix J Policy Ingestion confidence-band source binding", APPENDIX_J_TOKENS);

  forbidTokens(findings, doc, section12, "§12 Policy Ingestion body", FORBIDDEN_OUTSIDE_SECTION_39);
  forbidTokens(findings, doc, section32, "§32.10.3.C Policy Ingestion API contract", FORBIDDEN_OUTSIDE_SECTION_39);
  forbidTokens(findings, doc, appendixJ, "Appendix J Policy Ingestion enum block", [
    "Band thresholds are the numeric singletons at §12.3.1",
    "`high` ≥ 0.80",
    "`low_confidence` 0.60–0.79",
    "`unknown_framework` < 0.60",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "policy_ingestion_limit_single_source",
  sourcePhase: "v7.2.0-REM Phase 12",
  rowClass: "numerical_singleton_invariant",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...sourceRowsFindings(ctx.masterSpec),
      ...consumerFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "policy_ingestion_limit_single_source"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
