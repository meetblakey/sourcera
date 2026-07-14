# 32. APIs {#32.-apis}

## 32.5 Endpoints {#32.5-endpoints}

### Policy Ingestion

POST   /v1/workspaces/{workspace\_id}/policy-ingestions

### 32.10.3.C Policy Ingestion Endpoints {#32.10.3.c-policy-ingestion-endpoints}

**Endpoint-specific side effects.** Create emits `policy.ingestion.uploaded`.

#### M.5.49 v7.2.0-REM Phase 12 Policy Ingestion P1 addition {#m-5-49-v72rem-phase-12-policy-ingestion-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `policy_ingestion_endpoint_contract_completeness` | api_contract_completeness | spec_binding_pending_pack_m02_3 | pr_lint | API contract. | M02.3 |
