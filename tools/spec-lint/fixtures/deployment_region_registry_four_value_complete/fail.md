# Sourcera Fixture

## 1.6 Deployment Regions {#1.6-deployment-regions}

| Region | Value | Coverage | Notes |
|---|---|---|---|
| US | `us` | North America | Default |
| EU | `eu` | European Union | GDPR |
| UK | `uk` | United Kingdom | Retired |

### 4.2.1 Organization

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `data_residency_region` | Enum (Appendix J `data_residency_region`) | `us` \| `eu` | Missing APAC and custom. |

## 40.4 Data Residency Contract Registry & Import Round-Trip Fidelity {#40.4-import-round-trip-fidelity}

### 40.4.1 Residency Contract Registry {#40.4.1-residency-contract-registry}

| `data_residency_region` | Primary data plane |
|---|---|
| `us` | US |
| `eu` | EU |

## 47.4 Data Residency & Compliance Expansion {#47.4-data-residency-and-compliance-expansion}

- APAC remains a Phase 2 placeholder.

### `data_residency_region` (Data Residency Region)

`us`, `eu`

#### `residency_region_kind` (Appendix G preamble required property; §40.4 residency registry)

`us`, `eu`, `ap`

| `deployment_region_registry_four_value_complete` | enum_consistency | spec_binding_pending_pack_m02_3 | pr_lint | Old row. | M02.3 |
