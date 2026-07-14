# Sourcera Fixture

## 1.6 Deployment Regions {#1.6-deployment-regions}

| Region | Value | Coverage | Notes |
|---|---|---|---|
| US | `us` | North America | Default |
| EU | `eu` | European Union | GDPR |
| APAC | `apac` | Asia-Pacific | Singapore primary |
| Custom | `custom` | Sovereign | Label required |

### 4.2.1 Organization

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `data_residency_region` | Enum (Appendix J `data_residency_region`) | `us` \| `eu` \| `apac` \| `custom` | Data location. Authoritative enum at Appendix J `data_residency_region` and Appendix J `residency_region_kind` alias. `custom` uses `custom_sovereign_residency_label`. |

## 40.4 Data Residency Contract Registry & Import Round-Trip Fidelity {#40.4-import-round-trip-fidelity}

### 40.4.1 Residency Contract Registry {#40.4.1-residency-contract-registry}

| `data_residency_region` | Primary data plane |
|---|---|
| `us` | US |
| `eu` | EU |
| `apac` | APAC |
| `custom` | Sovereign |

## 47.4 Data Residency & Compliance Expansion {#47.4-data-residency-and-compliance-expansion}

- Four production `data_residency_region` values are current: `us`, `eu`, `apac`, and `custom` (§1.6 / Appendix J).
- APAC is a current production residency value, not a Phase 2 placeholder.
- `custom` is the Enterprise / sovereign-cloud route.
- `User.home_residency_region` is infrastructure-only.

### `data_residency_region` (Data Residency Region)

`us`, `eu`, `apac`, `custom`

#### `residency_region_kind` (Appendix G preamble required property; §40.4 residency registry)

`us`, `eu`, `apac`, `custom`

| `deployment_region_registry_four_value_complete` | enum_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/deployment_region_registry_four_value_complete.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §1.6, §4.2.1, §40.4, §47.4, Appendix J `data_residency_region`, and Appendix J `residency_region_kind` MUST expose the same four live values: `us`, `eu`, `apac`, `custom`. | M02.3 |
