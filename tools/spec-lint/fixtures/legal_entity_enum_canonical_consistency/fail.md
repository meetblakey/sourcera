# Sourcera Fixture

| `legal_entity` | Enum | See Appendix J `legal_entity` | Mirrors AIOperation rule; locked from Org's `data_residency_region` |

13. **Seller `data_residency` has no matching `legal_entity` enum value.** Resolved: expansion requires an Appendix J `legal_entity` enum addition plus a Stripe-invoicing entity provisioning runbook.

| `legal_entity` | Enum | Per Appendix J `legal_entity` | Mirrors AIWallet.`legal_entity`; subscribers performing accounting reconciliation MUST partition on this field |

### Legal Entity (§4.8.1, §4.8.3)

**Canonical 4-value set (post-Phase-2V D-AJ-004 + post-v7.2.0-REM-Phase-5 D-RES-004 reconciliation, 2026-05-20):**

`sourcera_us_llc`, `sourcera_eu_gmbh`, `sourcera_uk_ltd`, `sourcera_custom`

**Mapping (deterministic from `data_residency_region`; total + surjective; closed set):**

- `us` -> `sourcera_us_llc`
- `eu` -> `sourcera_eu_gmbh`
- `custom` -> `sourcera_custom`

#### `legal_entity_kind` (Appendix G preamble required property; §40.4 legal-entity registry)

`sourcera_us_llc`, `sourcera_eu_gmbh`, `sourcera_apac_pte`, `sourcera_custom`, `sourcera_uk_ltd`

| `legal_entity_enum_canonical_consistency` | meta_catalog_invariant | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Spec-tree-lint detector at `tools/spec-lint/legal_entity_enum_canonical_consistency.ts` + deploy-time validator at `convex/deploy_validators/legal_entity_enum_canonical_consistency.ts`. | `not_permitted_billing_singleton` | `runbooks.sourcera.com/ci-gates/legal_entity_enum_canonical_consistency` | M02.3 |
