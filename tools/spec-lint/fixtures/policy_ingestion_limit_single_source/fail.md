# 12. Policy-Powered Requirement Generation {#12.-policy-powered-requirement-generation}

### 12.8.1 Ingestion Limits {#12.8.1-ingestion-limits}

Policy Ingestion accepts 100 MB per upload and a 7-day deadline.

# 39. Object Size Constraints {#39.-object-size-constraints}

| Entity | Field | Limit | Notes |
|---|---|---|---|
| PolicyDocument | `file_byte_size` | 100 MB per upload | Source. |

### v7.2.0-REM Phase 10 Additions (2026-06-14) — §12 Policy Ingestion Catalog-Completeness Enums {#appendix-j-v72rem-phase-10}

Band thresholds are the numeric singletons at §12.3.1 (`high` ≥ 0.80; `low_confidence` 0.60–0.79; `unknown_framework` < 0.60).

#### M.5.49 v7.2.0-REM Phase 12 Policy Ingestion P1 addition {#m-5-49-v72rem-phase-12-policy-ingestion-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `policy_ingestion_limit_single_source` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint | Limit singleton. | M02.3 |
