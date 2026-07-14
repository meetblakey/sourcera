### 4.3.34 PolicyDocument {#4.3.34-policydocument}

DSAR Pattern B applies to actor FKs; body-field PII sweep applies to extracted text and display filename; storage, backups, and provider processing must remain in `data_residency_region` per §42.4.2.

### 4.3.35 PolicyControl {#4.3.35-policycontrol}

Raw text, traceability, embedding vectors, and guidance fields are body-field PII-sweep targets under §6.8.4.5. Embeddings are co-located with the Workspace residency partition and purge with the source PolicyControl row.

### 4.3.36 PolicyIngestionJob {#4.3.36-policyingestionjob}

Provider identifiers are hashed; no raw provider prompt or document body is stored on the job; provider processing must use the same approved region or fail with `policy_ingestion_residency_mismatch`.

### 4.3.37 PolicyAmendment {#4.3.37-policyamendment}

Actor FKs follow Pattern B. `proposed_requirement_json` and `review_decision_note` are body-field PII-sweep targets. Residency follows the parent PolicyDocument and Workspace.

### 6.8.4.3 Cascade Class Coverage Registry {#6.8.4.3-cascade-class-coverage-registry}

| Entity | Name | Class | Rule |
|---|---|---|---|
| §4.3.34 | PolicyDocument | 1 + 4 | Pattern B on `uploaded_by_user_id`, `created_by`, `updated_by`; binary / body sweep |
| §4.3.35 | PolicyControl | 1 | Pattern B on `created_by`, `updated_by`; body-field sweep |
| §4.3.36 | PolicyIngestionJob | 1 | Pattern B on `created_by`, `updated_by` |
| §4.3.37 | PolicyAmendment | 1 + 4 | Pattern B on `assigned_to_user_id`, `created_by`, `updated_by`; body-field sweep |

## 12.9 Acceptance Criteria {#12.9-acceptance-criteria}

Retention, DSAR, residency, logs, backups, and provider-processing behavior MUST match §40.2, §6.8, §42.4.2, and §42.6.1.B.

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

**PolicyDocument / PolicyControl / PolicyIngestionJob / PolicyAmendment (§4.3.34-§4.3.37)**. DSAR: actor FKs Pattern B; `filename_display`, PolicyControl.`raw_text`, `traceability_json`, `implementation_guidance`, `evidence_indicators`, PolicyAmendment.`proposed_requirement_json`, and `review_decision_note` are §6.8.4.5 body-field PII-sweep targets; provider processing, embeddings, object storage, logs, and backups inherit same partition per §42.4.2.

### 42.4.2 Residency-Bound Backups {#42.4.2-residency-bound-backups}

This anchors backup storage and replication to same-residency partitions and authors the DSAR backup re-pseudonymization contract. All per-row Residency cells MUST declare "backups inherit partition per §42.4.2".

### v7.2.0-REM Phase 10 Additions (2026-06-14) — §12 Policy Ingestion Error Codes {#appendix-i-v72rem-phase-10}

`policy_ingestion_residency_mismatch`

#### M.5.49 v7.2.0-REM Phase 12 Policy Ingestion P1 addition {#m-5-49-v72rem-phase-12-policy-ingestion-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `policy_ingestion_residency_dsar_contract` | privacy_invariant | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/policy_ingestion_residency_dsar_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Privacy contract. | M02.3 |
