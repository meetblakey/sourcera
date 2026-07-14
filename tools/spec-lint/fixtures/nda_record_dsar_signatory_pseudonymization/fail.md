### 4.5.3 NDA Record {#4.5.3-nda-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `created_by` | UUID (FK) | User ID | Rewrite on DSAR |
| `nda_buyer_signatory_email` | String | Valid email | Retain unchanged |

### 6.8.4.1 Cascade Pseudonymization Pattern {#6.8.4.1-cascade-pseudonymization-pattern}

| §4 entity | Pseudonymization pattern | Notes |
|---|---|---|
| §4.5.3 NDA Record (`signed_by_user_id`) | Pattern B | Stale row |

### 6.8.4.3 Cascade Class Coverage Registry {#6.8.4.3-cascade-class-coverage-registry}

| § | Entity | Class (§6.8.4) | Pattern (§6.8.4.1) | Notes |
|---|---|---|---|---|
| §4.5.3 | NDA Record | 5 (binding contract) | Pattern B on `signed_by_user_id` | Stale row |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `nda_record_dsar_signatory_pseudonymization` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | NDA DSAR pseudonymization. | M02.3 |

