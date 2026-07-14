/**
 * Gate: `policy_ingestion_entity_contract_completeness`
 *
 * Assertion: §12 Policy Ingestion resolves to complete PolicyDocument,
 * PolicyControl, PolicyIngestionJob, and PolicyAmendment entity contracts.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import {
  fieldNamesByAnchor,
  m5RuntimeActiveFindings,
  push,
  requireTokens,
  sectionTextByAnchor,
  tableRowsByAnchor,
} from "./policy_ingestion_gate_helpers.js";

const ENTITIES = [
  {
    anchor: "4.3.34-policydocument",
    label: "§4.3.34 PolicyDocument",
    fields: [
      "id",
      "org_id",
      "workspace_id",
      "console",
      "uploaded_by_user_id",
      "filename_display",
      "mime_type",
      "file_sha256",
      "file_byte_size",
      "page_count",
      "language_code",
      "data_residency_region",
      "source_attachment_id",
      "storage_object_key",
      "current_policy_ingestion_job_id",
      "framework_kind",
      "framework_confidence",
      "framework_confidence_band",
      "framework_inference_outcome",
      "superseded_by_policy_document_id",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
      "deleted_at",
    ],
    tokens: [
      "**Scope isolation.**",
      "**Required indexes.**",
      "**Retention, DSAR, and residency.**",
      "**Acceptance criteria.**",
      "§40.2 row **PolicyDocument / PolicyControl / PolicyIngestionJob / PolicyAmendment**",
      "DSAR Pattern B",
      "body-field PII sweep",
      "§42.4.2",
    ],
  },
  {
    anchor: "4.3.35-policycontrol",
    label: "§4.3.35 PolicyControl",
    fields: [
      "id",
      "org_id",
      "workspace_id",
      "console",
      "policy_document_id",
      "policy_ingestion_job_id",
      "control_id",
      "title",
      "description",
      "framework_kind",
      "framework_section",
      "framework_reference",
      "raw_text",
      "page_references",
      "source_section",
      "implementation_guidance",
      "evidence_indicators",
      "traceability_json",
      "embedding_model_version",
      "embedding_dimension",
      "embedding_vector_ref",
      "dedup_similarity_max",
      "dedup_group_id",
      "dedup_action",
      "merged_into_policy_control_id",
      "requirement_id",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
      "deleted_at",
    ],
    tokens: [
      "**Scope isolation.**",
      "**Required indexes.**",
      "**Deduplication contract.**",
      "**Retention, DSAR, and residency.**",
      "**Acceptance criteria.**",
      "§40.2 row **PolicyDocument / PolicyControl / PolicyIngestionJob / PolicyAmendment**",
      "§6.8.4.5",
      "Embeddings are co-located with the Workspace residency partition",
    ],
  },
  {
    anchor: "4.3.36-policyingestionjob",
    label: "§4.3.36 PolicyIngestionJob",
    fields: [
      "id",
      "org_id",
      "workspace_id",
      "console",
      "policy_document_id",
      "status",
      "idempotency_key_hash",
      "client_request_id",
      "framework_kind",
      "framework_confidence",
      "framework_confidence_band",
      "framework_inference_outcome",
      "controls_extracted_count",
      "controls_estimated_total_count",
      "partial_extraction_reason",
      "resume_section_locator",
      "resume_token_hash",
      "dedup_candidate_count",
      "dedup_resolved_count",
      "dedup_retry_count",
      "amendments_created_count",
      "error_code",
      "provider_request_ids_hash",
      "started_at",
      "completed_at",
      "failed_at",
      "cancelled_at",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
      "deleted_at",
    ],
    tokens: [
      "**Scope isolation.**",
      "**Required indexes.**",
      "**State machine.**",
      "**Retention, DSAR, and residency.**",
      "**Acceptance criteria.**",
      "State machine in Appendix L.9",
      "no raw provider prompt or document body is stored on the job",
      "provider processing must use the same approved region or fail with `policy_ingestion_residency_mismatch`",
    ],
  },
  {
    anchor: "4.3.37-policyamendment",
    label: "§4.3.37 PolicyAmendment",
    fields: [
      "id",
      "org_id",
      "workspace_id",
      "console",
      "policy_ingestion_job_id",
      "policy_control_id",
      "requirement_id",
      "status",
      "assigned_to_user_id",
      "assigned_to_role_snapshot",
      "review_deadline_at",
      "framework_kind",
      "policy_custom_use_case_category",
      "use_case_id",
      "proposed_requirement_json",
      "review_decision_note",
      "batch_group_id",
      "published_at",
      "rejected_at",
      "reassigned_at",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
      "deleted_at",
    ],
    tokens: [
      "**Scope isolation.**",
      "**Required indexes.**",
      "**Assignment and deprovisioning.**",
      "**Retention, DSAR, and residency.**",
      "**Acceptance criteria.**",
      "State machine in Appendix L.10",
      "Actor FKs follow Pattern B",
      "body-field PII-sweep targets",
    ],
  },
] as const;

function entityFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  for (const entity of ENTITIES) {
    const section = sectionTextByAnchor(doc, entity.anchor);
    if (!section) {
      push(findings, doc, 0, entity.anchor, `${entity.label} section is missing.`);
      continue;
    }
    const table = tableRowsByAnchor(doc, entity.anchor);
    if (!table?.header || table.header.cells.join("|") !== "Field|Type|Constraints|Notes") {
      push(findings, doc, section.startLine, "Field | Type | Constraints | Notes", `${entity.label} must carry a production field table.`);
    }
    const fields = fieldNamesByAnchor(doc, entity.anchor);
    for (const field of entity.fields) {
      if (!fields.includes(field)) {
        push(findings, doc, section.startLine, field, `${entity.label} is missing required field ${field}.`);
      }
    }
    requireTokens(findings, doc, section, entity.label, entity.tokens);
  }
  return findings;
}

function policySectionFindings(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "12.1-overview"), "§12.1 Policy Ingestion overview", [
    "PolicyDocument (§4.3.34)",
    "PolicyControl (§4.3.35)",
    "PolicyIngestionJob (§4.3.36)",
    "PolicyAmendment (§4.3.37)",
    "Seller KB upload, seller Managed Agent retrieval, Marketplace Discovery, and Console Bridge materialization are out of scope.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-k-phase-12-policy-ingestion"), "Appendix K Policy Ingestion glossary block", [
    "**PolicyDocument.**",
    "**PolicyControl.**",
    "**PolicyIngestionJob.**",
    "**PolicyAmendment.**",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "12.2-supported-document-types"), "§12.2 Attachment security binding", [
    "Attachment security scan",
    "`scan_status='clean'`",
    "`policy_ingestion_attachment_scan_failed`",
    "`attachment_scan_pending`",
  ]);
  return findings;
}

export const gate: SpecLintGate = {
  id: "policy_ingestion_entity_contract_completeness",
  sourcePhase: "v7.2.0-REM Phase 12",
  rowClass: "data_model_contract",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.1.0",
  run(ctx: GateContext): Finding[] {
    return [
      ...entityFindings(ctx.masterSpec),
      ...policySectionFindings(ctx.masterSpec),
      ...m5RuntimeActiveFindings(ctx.masterSpec, "policy_ingestion_entity_contract_completeness"),
    ];
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
