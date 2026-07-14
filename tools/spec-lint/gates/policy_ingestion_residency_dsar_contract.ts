/**
 * Gate: `policy_ingestion_residency_dsar_contract`
 *
 * Assertion: Policy Ingestion entities resolve to §40.2 retention, §6.8 DSAR
 * sweep coverage, §42.4.2 residency-bound backup/provider processing, and the
 * residency mismatch error code.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./policy_ingestion_gate_helpers.js";

function entityPrivacyFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.34-policydocument"), "§4.3.34 PolicyDocument privacy contract", [
    "DSAR Pattern B applies to actor FKs",
    "body-field PII sweep applies to extracted text and display filename",
    "storage, backups, and provider processing must remain in `data_residency_region` per §42.4.2",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.35-policycontrol"), "§4.3.35 PolicyControl privacy contract", [
    "Raw text, traceability, embedding vectors, and guidance fields are body-field PII-sweep targets under §6.8.4.5",
    "Embeddings are co-located with the Workspace residency partition and purge with the source PolicyControl row.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.36-policyingestionjob"), "§4.3.36 PolicyIngestionJob privacy contract", [
    "Provider identifiers are hashed",
    "no raw provider prompt or document body is stored on the job",
    "provider processing must use the same approved region or fail with `policy_ingestion_residency_mismatch`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "4.3.37-policyamendment"), "§4.3.37 PolicyAmendment privacy contract", [
    "Actor FKs follow Pattern B",
    "`proposed_requirement_json` and `review_decision_note` are body-field PII-sweep targets",
    "Residency follows the parent PolicyDocument and Workspace.",
  ]);
  return findings;
}

function registryFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "6.8.4.3-cascade-class-coverage-registry"), "§6.8.4.3 Policy Ingestion DSAR cascade rows", [
    "| §4.3.34 | PolicyDocument | 1 + 4 | Pattern B on `uploaded_by_user_id`, `created_by`, `updated_by`; binary / body sweep |",
    "| §4.3.35 | PolicyControl | 1 | Pattern B on `created_by`, `updated_by`; body-field sweep |",
    "| §4.3.36 | PolicyIngestionJob | 1 | Pattern B on `created_by`, `updated_by` |",
    "| §4.3.37 | PolicyAmendment | 1 + 4 | Pattern B on `assigned_to_user_id`, `created_by`, `updated_by`; body-field sweep |",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "40.2-data-retention-and-deletion"), "§40.2 Policy Ingestion retention row", [
    "**PolicyDocument / PolicyControl / PolicyIngestionJob / PolicyAmendment (§4.3.34-§4.3.37)**",
    "DSAR: actor FKs Pattern B",
    "`filename_display`, PolicyControl.`raw_text`, `traceability_json`, `implementation_guidance`, `evidence_indicators`, PolicyAmendment.`proposed_requirement_json`, and `review_decision_note` are §6.8.4.5 body-field PII-sweep targets",
    "provider processing, embeddings, object storage, logs, and backups inherit same partition per §42.4.2",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "42.4.2-residency-bound-backups"), "§42.4.2 residency-bound backups", [
    "backup storage and replication to same-residency partitions",
    "DSAR backup re-pseudonymization contract",
    "per-row Residency cells MUST declare \"backups inherit partition per §42.4.2\"",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-i-v72rem-phase-10"), "Appendix I Policy Ingestion residency mismatch", [
    "`policy_ingestion_residency_mismatch`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "12.9-acceptance-criteria"), "§12.9 Policy Ingestion privacy acceptance criteria", [
    "Retention, DSAR, residency, logs, backups, and provider-processing behavior MUST match §40.2, §6.8, §42.4.2, and §42.6.1.B.",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "policy_ingestion_residency_dsar_contract",
  sourcePhase: "v7.2.0-REM Phase 12",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_gdpr_art_17",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...entityPrivacyFindings(ctx.masterSpec),
      ...registryFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "policy_ingestion_residency_dsar_contract"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
