# 12. Policy-Powered Requirement Generation {#12.-policy-powered-requirement-generation}

## 12.1 Overview {#12.1-overview}

Policy Ingestion source-of-record rows are PolicyDocument (§4.3.34), PolicyControl (§4.3.35), PolicyIngestionJob (§4.3.36), and PolicyAmendment (§4.3.37). Seller KB upload, seller Managed Agent retrieval, Marketplace Discovery, and Console Bridge materialization are out of scope.

### 4.3.34 PolicyDocument {#4.3.34-policydocument}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | | |
| `org_id` | UUID | | |
| `workspace_id` | UUID | | |
| `console` | Enum | | |
| `uploaded_by_user_id` | UUID | | |
| `filename_display` | String | | |
| `mime_type` | String | | |
| `file_sha256` | String | | |
| `file_byte_size` | Integer | | |
| `page_count` | Integer | | |
| `language_code` | String | | |
| `data_residency_region` | Enum | | |
| `source_attachment_id` | UUID | | |
| `storage_object_key` | String | | |
| `current_policy_ingestion_job_id` | UUID | | |
| `framework_kind` | Enum | | |
| `framework_confidence` | Decimal | | |
| `framework_confidence_band` | Enum | | |
| `framework_inference_outcome` | Enum | | |
| `superseded_by_policy_document_id` | UUID | | |
| `created_at` | Timestamp | | |
| `updated_at` | Timestamp | | |
| `created_by` | UUID | | |
| `updated_by` | UUID | | |
| `deleted_at` | Timestamp | | |

**Scope isolation.** Buyer only.
**Required indexes.** Required.
**Retention, DSAR, and residency.** Retention is §40.2 row **PolicyDocument / PolicyControl / PolicyIngestionJob / PolicyAmendment**. DSAR Pattern B applies. body-field PII sweep applies. §42.4.2 binds backups.
**Acceptance criteria.** Present.

### 4.3.35 PolicyControl {#4.3.35-policycontrol}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | | |
| `org_id` | UUID | | |
| `workspace_id` | UUID | | |
| `console` | Enum | | |
| `policy_document_id` | UUID | | |
| `policy_ingestion_job_id` | UUID | | |
| `control_id` | String | | |
| `title` | String | | |
| `description` | String | | |
| `framework_kind` | Enum | | |
| `framework_section` | String | | |
| `framework_reference` | String | | |
| `raw_text` | String | | |
| `page_references` | Array | | |
| `source_section` | String | | |
| `implementation_guidance` | String | | |
| `evidence_indicators` | String | | |
| `traceability_json` | JSONB | | |
| `embedding_model_version` | String | | |
| `embedding_dimension` | Integer | | |
| `embedding_vector_ref` | String | | |
| `dedup_similarity_max` | Decimal | | |
| `dedup_group_id` | UUID | | |
| `dedup_action` | Enum | | |
| `merged_into_policy_control_id` | UUID | | |
| `requirement_id` | UUID | | |
| `created_at` | Timestamp | | |
| `updated_at` | Timestamp | | |
| `created_by` | UUID | | |
| `updated_by` | UUID | | |
| `deleted_at` | Timestamp | | |

**Scope isolation.** Buyer only.
**Required indexes.** Required.
**Deduplication contract.** Required.
**Retention, DSAR, and residency.** Retention is §40.2 row **PolicyDocument / PolicyControl / PolicyIngestionJob / PolicyAmendment**. §6.8.4.5 applies. Embeddings are co-located with the Workspace residency partition.
**Acceptance criteria.** Present.

### 4.3.36 PolicyIngestionJob {#4.3.36-policyingestionjob}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | | |
| `org_id` | UUID | | |
| `workspace_id` | UUID | | |
| `console` | Enum | | |
| `policy_document_id` | UUID | | |
| `status` | Enum | | State machine in Appendix L.9 |
| `idempotency_key_hash` | String | | |
| `client_request_id` | String | | |
| `framework_kind` | Enum | | |
| `framework_confidence` | Decimal | | |
| `framework_confidence_band` | Enum | | |
| `framework_inference_outcome` | Enum | | |
| `controls_extracted_count` | Integer | | |
| `controls_estimated_total_count` | Integer | | |
| `partial_extraction_reason` | String | | |
| `resume_section_locator` | String | | |
| `resume_token_hash` | String | | |
| `dedup_candidate_count` | Integer | | |
| `dedup_resolved_count` | Integer | | |
| `dedup_retry_count` | Integer | | |
| `amendments_created_count` | Integer | | |
| `error_code` | String | | |
| `provider_request_ids_hash` | Array | | |
| `started_at` | Timestamp | | |
| `completed_at` | Timestamp | | |
| `failed_at` | Timestamp | | |
| `cancelled_at` | Timestamp | | |
| `created_at` | Timestamp | | |
| `updated_at` | Timestamp | | |
| `created_by` | UUID | | |
| `updated_by` | UUID | | |
| `deleted_at` | Timestamp | | |

**Scope isolation.** Buyer only.
**Required indexes.** Required.
**State machine.** State machine in Appendix L.9.
**Retention, DSAR, and residency.** no raw provider prompt or document body is stored on the job; provider processing must use the same approved region or fail with `policy_ingestion_residency_mismatch`.
**Acceptance criteria.** Present.

### 4.3.37 PolicyAmendment {#4.3.37-policyamendment}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | | |
| `org_id` | UUID | | |
| `workspace_id` | UUID | | |
| `console` | Enum | | |
| `policy_ingestion_job_id` | UUID | | |
| `policy_control_id` | UUID | | |
| `requirement_id` | UUID | | |
| `status` | Enum | | State machine in Appendix L.10 |
| `assigned_to_user_id` | UUID | | |
| `assigned_to_role_snapshot` | String | | |
| `review_deadline_at` | Timestamp | | |
| `framework_kind` | Enum | | |
| `policy_custom_use_case_category` | Enum | | |
| `use_case_id` | UUID | | |
| `proposed_requirement_json` | JSONB | | |
| `review_decision_note` | String | | |
| `batch_group_id` | UUID | | |
| `published_at` | Timestamp | | |
| `rejected_at` | Timestamp | | |
| `reassigned_at` | Timestamp | | |
| `created_at` | Timestamp | | |
| `updated_at` | Timestamp | | |
| `created_by` | UUID | | |
| `updated_by` | UUID | | |
| `deleted_at` | Timestamp | | |

**Scope isolation.** Buyer only.
**Required indexes.** Required.
**Assignment and deprovisioning.** Required.
**Retention, DSAR, and residency.** Actor FKs follow Pattern B. `proposed_requirement_json` and `review_decision_note` are body-field PII-sweep targets.
**Acceptance criteria.** Present.

### Phase 12 Policy Ingestion P1 Additions — Glossary Terms {#appendix-k-phase-12-policy-ingestion}

**PolicyDocument.** Term.
**PolicyControl.** Term.
**PolicyIngestionJob.** Term.
**PolicyAmendment.** Term.

## 12.2 Supported Document Types {#12.2-supported-document-types}

| Dimension | Contract | Error / source |
|---|---|---|
| Attachment security scan | `upload_ref` must resolve to a clean Attachment with `scan_status='clean'` | `policy_ingestion_attachment_scan_failed`; `attachment_scan_pending` |

#### M.5.49 v7.2.0-REM Phase 12 Policy Ingestion P1 addition {#m-5-49-v72rem-phase-12-policy-ingestion-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `policy_ingestion_entity_contract_completeness` | data_model_contract | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/policy_ingestion_entity_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Entity contract. | M02.3 |
