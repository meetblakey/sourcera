### 4.5.3 NDA Record {#4.5.3-nda-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `created_by` | UUID (FK) | User ID | Pattern B DSAR treatment |
| `updated_by` | UUID (FK) | User ID | Pattern B DSAR treatment |
| `revoked_by` | UUID (FK) | User ID | Pattern B DSAR treatment |
| `change_requested_by` | UUID (FK) | User ID | Pattern B DSAR treatment |
| `nda_buyer_signatory_email` | String | Valid email | Pattern A string-column pseudonymization on DSAR |
| `nda_seller_signatory_email` | String | Valid email | Pattern A string-column pseudonymization on DSAR |

`created_by`, `updated_by`, `revoked_by`, and `change_requested_by` follow Pattern B. `nda_buyer_signatory_email` and `nda_seller_signatory_email` follow Pattern A string-column pseudonymization to `anonymized_<console>_user_<base32(hash)[:16]>@anonymized.invalid`; the contract row, signature timestamps, NDA type, issuer, version pointer, change-request hash, and non-PII legal facts are preserved.

### 6.8.4.1 Cascade Pseudonymization Pattern {#6.8.4.1-cascade-pseudonymization-pattern}

| §4 entity | Pseudonymization pattern | Notes |
|---|---|---|
| §4.5.3 NDA Record (`created_by`, `updated_by`, `revoked_by`, `change_requested_by`, signatory emails) | Pattern B for UUID FK fields; Pattern A string-column pseudonymization for `nda_buyer_signatory_email` / `nda_seller_signatory_email` | `anonymized_<console>_user_<base32(hash)[:16]>@anonymized.invalid` |

### 6.8.4.3 Cascade Class Coverage Registry {#6.8.4.3-cascade-class-coverage-registry}

| § | Entity | Class (§6.8.4) | Pattern (§6.8.4.1) | Notes |
|---|---|---|---|---|
| §4.5.3 | NDA Record | 5 (binding contract) | Pattern B on `created_by`, `updated_by`, `revoked_by`, `change_requested_by`; Pattern A on `nda_buyer_signatory_email`, `nda_seller_signatory_email` | Contract retained. |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `nda_record_dsar_signatory_pseudonymization` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/nda_record_dsar_signatory_pseudonymization.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | NDA DSAR pseudonymization. | M02.3 |

