# Sourcera Fixture

| `legal_entity` | Enum | See Appendix J `legal_entity_kind` | Mirrors AIOperation rule; locked from Org's `data_residency_region` |

13. **Seller `data_residency` has no matching `legal_entity` enum value.** Resolved: expansion requires an Appendix J `legal_entity_kind` enum addition plus a Stripe-invoicing entity provisioning runbook.

| `legal_entity` | Enum | Per Appendix J `legal_entity_kind` | Mirrors AIWallet.`legal_entity`; subscribers performing accounting reconciliation MUST partition on this field |

### Legal Entity (§4.8.1, §4.8.3)

**Canonical 4-value set (post-Phase-2V D-AJ-004 + post-v7.2.0-REM-Phase-5 D-RES-004 reconciliation, 2026-05-20):**

`sourcera_us_llc`, `sourcera_eu_gmbh`, `sourcera_apac_pte`, `sourcera_custom`

**Mapping (deterministic from `data_residency_region`; total + surjective; closed set):**

- `us` -> `sourcera_us_llc`
- `eu` -> `sourcera_eu_gmbh`
- `apac` -> `sourcera_apac_pte`
- `custom` -> `sourcera_custom`

**Retired value: `sourcera_uk_ltd`.** Historical rows remain readable; new writes are rejected.

**Companion: `legal_entity_kind` envelope enum (line 49596).** The §51 envelope-facing enum `legal_entity_kind` is the canonical Appendix-G-envelope registration with the same 4-value set.

#### `legal_entity_kind` (Appendix G preamble required property; §40.4 legal-entity registry)

`sourcera_us_llc`, `sourcera_eu_gmbh`, `sourcera_apac_pte`, `sourcera_custom`

| `legal_entity_enum_canonical_consistency` | meta_catalog_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/legal_entity_enum_canonical_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Spec-tree-lint detector at `tools/spec-lint/gates/legal_entity_enum_canonical_consistency.ts`. Asserts the Appendix J body-side "Legal Entity (§4.8.1, §4.8.3)" enum and the Appendix J envelope-facing `legal_entity_kind` enum share the same canonical 4-value membership; every live `legal_entity` field/table citation resolves to Appendix J `legal_entity_kind`; and no live citation references a nonexistent legacy Appendix J enum named legal_entity. Runtime Stripe Customer binding and residency-change behavior remain owned by sibling M24.3 / M11.3 rows. Override path: `not_permitted_billing_singleton` (binding the canonical-enum invariant; bypassing this gate would reintroduce the D-RES-004 P0 attack surface). | `not_permitted_billing_singleton` | `runbooks.sourcera.com/ci-gates/legal_entity_enum_canonical_consistency` | M02.3 |
