# Sourcera Fixture

## 47.4 Data Residency & Compliance Expansion {#47.4-data-residency-and-compliance-expansion}

**Current residency contract.**

- Four production `data_residency_region` values are current: `us`, `eu`, `apac`, and `custom` (§1.6 / Appendix J).
- APAC is a current production residency value, not a Phase 2 placeholder. Singapore-region primary / same-residency failover behavior is governed by §42.4.1 / §42.4.2.
- `custom` is the Enterprise / sovereign-cloud route. The enum remains `custom`; the customer-specific label lives in Organization.`custom_sovereign_residency_label` and is subject to §1.6.1 / §40.4 / §34.10.5.A.
- GDPR DPA is signed for applicable customers.
- SOC 2 Type II is targeted; current evidence and audit-report entitlement rows are governed by §33 and §34.
- Residency is controller-side and Organization-scoped. Sourcera does not provide a customer-facing per-user subject-side residency selector; `User.home_residency_region` is infrastructure-only for identity PII writes and DSAR cascades (§4.2.3.1).

**Phase 2 compliance expansion.**

- ISO 27001 certification.
- HIPAA BAA available.
- CCPA compliance certified.
- Expanded sovereign-cloud provider catalog for additional `custom_sovereign_residency_label` values, subject to contract and §40.4 provider-routing approval.

## Appendix M {#appendix-m}

| Gate ID | Row class | Runtime status | Execution context | Assertion | Owner |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `section_47_4_residency_current_apac_custom` | consistency_drift | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/section_47_4_residency_current_apac_custom.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §47.4 MUST treat `apac` and `custom` as current residency values while keeping ISO / HIPAA / CCPA certification work in Phase 2. | M02.3 |
