### 4.8.1 AIOperation {#4.8.1-aioperation}

Formula: `cost_base_cents × value_multiplier`; formula: `cost_base_cents × cost_multiplier`.

### 4.8.2 CapabilityRegistryEntry {#4.8.2-capabilityregistryentry}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `min_value_price_cents` | Integer | ≥ 0 | Floor on `value_price_cents` regardless of `cost_base_cents × value_multiplier` |
| `value_multiplier` | Decimal(6,3) | Default 10.000 | Per-capability override |

### 34.3.1 Pricing Formula

value_price_cents[capability] = MAX(min_value_price_cents[capability], cost_base_cents[capability] × value_multiplier[capability])

## 34.14 Seller Rate Card (Authoritative) {#34.14-seller-rate-card-authoritative}

Prices listed are derived as `cost_base × {10, 1.05}` per §34.3.1.

## 48.8 Seller Hero Moment & Onboarding Anti-Patterns {#48.8-seller-hero-moment-and-onboarding-anti-patterns}

Accepted operations use cost_base x 10.

## 49.1 Seller Onboarding — Seven-Stage Flow {#49.1-seller-onboarding-seven-stage-flow}

Rejected operations use cost_base x 1.05.

**Value Price.** Default formula: `cost_base_cents × value_multiplier` (default `value_multiplier = 10.000`).

**Cost Price.** Default formula: `cost_base_cents × cost_multiplier` (default `cost_multiplier = 1.050`).

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pricing_formula_capability_multiplier_consistency` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint | Formula text checked. | M02.3 |
