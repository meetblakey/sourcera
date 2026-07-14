# Sourcera Fixture

## 47.4 Data Residency & Compliance Expansion {#47.4-data-residency-and-compliance-expansion}

**Current residency contract.**

- Two production `data_residency_region` values are current: `us` and `eu`.
- APAC is a Phase 2 placeholder.
- `custom` is a future residency value.
- GDPR DPA is signed for applicable customers.
- SOC 2 Type II is targeted.
- Residency has a customer-facing per-user residency selector.

**Phase 2 compliance expansion.**

- APAC is added.
- ISO 27001 certification.
- HIPAA BAA available.
- CCPA compliance certified.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `section_47_4_residency_current_apac_custom` | consistency_drift | spec_binding_pending_pack_m02_3 | pr_lint | §47.4 MUST treat `apac` and `custom` as current residency values while keeping ISO / HIPAA / CCPA certification work in Phase 2. | M02.3 |
