### 4.8.1 AIOperation {#4.8.1-aioperation}

Formula: `cost_base_cents × CapabilityRegistryEntry.value_multiplier`; formula: `cost_base_cents × CapabilityRegistryEntry.cost_multiplier`; default multiplier value lives on CapabilityRegistryEntry, not inline in this row.

### 4.8.2 CapabilityRegistryEntry {#4.8.2-capabilityregistryentry}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `min_value_price_cents` | Integer | ≥ 0 | Floor on `value_price_cents` regardless of `cost_base_cents × CapabilityRegistryEntry.value_multiplier` |
| `value_multiplier` | Decimal(6,3) | Default 10.000 | Per-capability override |
| `cost_multiplier` | Decimal(6,3) | Default 1.050 | Per-capability override |

Ops adjusts (display_name, value_multiplier, cost_multiplier, plan_gate_min_tier).

### 34.3.1 Pricing Formula

value_price_cents[capability] = MAX(min_value_price_cents[capability], cost_base_cents[capability] × CapabilityRegistryEntry.value_multiplier[capability])
cost_price_cents[capability]  = MAX(min_cost_price_cents[capability],  cost_base_cents[capability] × CapabilityRegistryEntry.cost_multiplier[capability])

Default multiplier values live only on §4.8.2 CapabilityRegistryEntry.

## 34.14 Seller Rate Card (Authoritative) {#34.14-seller-rate-card-authoritative}

Every row applies the outcome pricing formula from §34.3: `value_price = MAX(min_value, cost_base × CapabilityRegistryEntry.value_multiplier)` and `cost_price = MAX(min_cost, cost_base × CapabilityRegistryEntry.cost_multiplier)`.

## 48.8 Seller Hero Moment & Onboarding Anti-Patterns {#48.8-seller-hero-moment-and-onboarding-anti-patterns}

Accepted operations use `cost_base_cents × CapabilityRegistryEntry.value_multiplier`; rejected operations use `cost_base × CapabilityRegistryEntry.cost_multiplier`.

## 49.1 Seller Onboarding — Seven-Stage Flow {#49.1-seller-onboarding-seven-stage-flow}

Accepted interactions settle value-priced via CapabilityRegistryEntry.`value_multiplier`; rejections settle at `cost_base_cents × CapabilityRegistryEntry.cost_multiplier`.

**Value Price.** Formula: `cost_base_cents × CapabilityRegistryEntry.value_multiplier`; default value on §4.8.2 CapabilityRegistryEntry.

**Cost Price.** Formula: `cost_base_cents × CapabilityRegistryEntry.cost_multiplier`; default value on §4.8.2 CapabilityRegistryEntry.

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pricing_formula_capability_multiplier_consistency` | numerical_singleton_invariant | **runtime_active** (promoted 2026-07-07; detector `tools/spec-lint/gates/pricing_formula_capability_multiplier_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §4.8.1, §4.8.2, §34.3.1, §34.14, §48, §49, and Appendix M MUST express AIOperation value/cost pricing through `CapabilityRegistryEntry.value_multiplier` and `CapabilityRegistryEntry.cost_multiplier`; hard-coded `cost_base x 10` / `cost_base x 1.05` formula text outside explicit historical notes fails closed. | M02.3 |
