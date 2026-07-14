# Sourcera {#sourcera}

[40.4 Data Residency Contract Registry & Import Round-Trip Fidelity](#40.4-import-round-trip-fidelity)

## 40.4 Data Residency Contract Registry & Import Round-Trip Fidelity {#40.4-import-round-trip-fidelity}

This subsection is the canonical data-plane residency contract consumed by §1.6, §4 entity rows, §6.7, §6.8, §32, §41, §42, §47, §50, and Appendix J. Historical citations that say "§40.4 residency" resolve here; import round-trip fidelity remains in §40.4.3 below.

### 40.4.1 Residency Contract Registry {#40.4.1-residency-contract-registry}

| `data_residency_region` | Primary data plane | Backup / DR plane | Export / import staging | Observability and provider routing | Billing legal entity |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `us` | US customer-data shard and US object-storage backend | Same-residency replica | US signer and US object store | US provider routing | `sourcera_us_llc` |
| `eu` | EU customer-data shard and EU object-storage backend | Same-residency replica | EU signer and EU object store | EU provider routing | `sourcera_eu_gmbh` |
| `apac` | APAC customer-data shard and APAC object-storage backend | Same-residency replica | APAC signer and APAC object store | APAC provider routing | `sourcera_apac_pte` |
| `custom` | Enterprise sovereign customer-data shard and object-storage backend | Contract-defined same-sovereignty replica | Contract-defined signer and object store | Contract-defined provider routing | `sourcera_custom` |

### 40.4.2 Export, Import, Migration, and Source-Retention Rules {#40.4.2-export-import-migration-and-source-retention-rules}

1. Exports are generated in the source entity's residency partition.
2. Imports stage in the target Organization / Workspace residency before validation.
3. Provider processing for document parsing, embeddings, policy extraction, email dispatch metadata, analytics, logging, and support references must either run in-region or use a contract-approved `custom` routing exception.
4. A §1.6.1 residency migration snapshots source data, restores to target, validates row / object / hash counts, re-roots audit hash chains, executes §34.10.5.A billing rebinding.
5. Source-retention hold lasts for the §40.2 evacuation-grace-period row.
6. Cross-region replication for DR requires the §42.4.2 DPA-addendum-approved replica policy.

### 40.4.3 Import Round-Trip Fidelity {#40.4.3-import-round-trip-fidelity}

**Acceptance Criteria:**

- Export, import, DSAR, and audit artifacts MUST preserve their source residency partition through staging, signing, and download; CI gate `section_40_4_residency_contract_resolves` asserts.
- `apac` and `custom` MUST be accepted by every §40.4 consumer that already accepts `us` and `eu`; no consumer may narrow the enum inline.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `section_40_4_residency_contract_resolves` | cross_reference_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/section_40_4_residency_contract_resolves.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Every body citation to "§40.4 residency" MUST resolve to a residency contract registry and MUST NOT point only to import round-trip fidelity. | M02.3 |
