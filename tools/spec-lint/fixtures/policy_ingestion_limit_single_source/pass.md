# 12. Policy-Powered Requirement Generation {#12.-policy-powered-requirement-generation}

### 12.8.1 Ingestion Limits {#12.8.1-ingestion-limits}

Plan access and billing posture are canonical in §34.1.1 cell **Policy Ingestion (Opus capability)** and §34.8.5 `policy_parsing`. Throughput, page, token, file-size, field-size, confidence-threshold, dedup-threshold, and batch-review limits are canonical in §39. §12 must cite those tables and must not carry duplicate plan numerals.

| Topic | Source of truth | Enforcement |
|---|---|---|
| Object and throughput limits | §39 Policy Ingestion rows | Upload, extraction, dedup, amendment, publish |

# 32. APIs {#32.-apis}

### 32.10.3.C Policy Ingestion Endpoints {#32.10.3.c-policy-ingestion-endpoints}

§39 limits. §39 page or file-size limit exceeded. §39 token budget. §39 throughput cap exhausted.

# 39. Object Size Constraints {#39.-object-size-constraints}

| Entity | Field | Limit | Notes |
|---|---|---|---|
| PolicyDocument | `file_byte_size` | 100 MB per upload | Source. |
| PolicyDocument | `page_count` per upload | buyer_free / buyer_solo / business_starter: 100 pages; business_growth: 250 pages; business_scale / buyer_enterprise: 500 pages | Source. |
| PolicyDocument | pages per billing month | buyer_free: 300 pages; buyer_solo: 100 pages; business_starter: 300 pages; business_growth: 2,500 pages; business_scale / buyer_enterprise: unlimited subject to §34.1.1 wallet / committed-spend posture | Source. |
| PolicyIngestionJob | ingestions per billing month | buyer_free: Free Allowance + Wallet per §34.1.1; buyer_solo: 1 engine-absorbed ingestion; business_starter: 3; business_growth: 10; business_scale: unlimited subject to wallet; buyer_enterprise: committed | Source. |
| PolicyIngestionJob | extraction token budget | 100,000 tokens per job | Source. |
| PolicyIngestionJob | `partial_extraction_reason` | 1,000 chars | Source. |
| PolicyIngestionJob | `resume_section_locator` | 500 chars | Source. |
| Policy Ingestion | framework confidence thresholds | high-confidence auto-accept: 0.800+; low-confidence confirm: 0.600-0.799; unknown/manual: below 0.600 | Source. |
| PolicyControl | `control_id` | 120 chars | Source. |
| PolicyControl | `title` | 100 chars | Source. |
| PolicyControl | `description` | 500 chars | Source. |
| PolicyControl | dedup cosine similarity threshold | 0.900 | Source. |
| PolicyControl | dedup default-checked threshold | 0.950 | Source. |
| PolicyAmendment | `review_deadline_at` duration | 7 calendar days from creation | Source. |
| PolicyAmendment | batch review threshold | 5 pending amendments per PolicyIngestionJob | Source. |

### v7.2.0-REM Phase 10 Additions (2026-06-14) — §12 Policy Ingestion Catalog-Completeness Enums {#appendix-j-v72rem-phase-10}

**`policy_framework_confidence_band`**: Band threshold values are the §39 `Policy Ingestion | framework confidence thresholds` singleton; Appendix J owns enum values only.

#### M.5.49 v7.2.0-REM Phase 12 Policy Ingestion P1 addition {#m-5-49-v72rem-phase-12-policy-ingestion-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `policy_ingestion_limit_single_source` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/policy_ingestion_limit_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Limit singleton. | M02.3 |
