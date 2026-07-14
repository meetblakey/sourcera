### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `min_price_cents_monthly` | BigInt | >= 0 | Minimum monthly price in integer cents |
| `max_price_cents_monthly` | BigInt | >= min | Maximum monthly price in integer cents |
| `currency_code` | Enum | Appendix J `billing_currency` | Currency |

Seller attempts with Decimal values fail with `marketplace_listing_price_requires_integer_cents`; migration worker converts existing Decimal values.

### 4.5.2 EOI Record {#4.5.2-eoi-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `estimated_contract_value_cents` | BigInt | >= 0 | Estimated contract value in integer cents |
| `currency_code` | Enum | Appendix J `billing_currency` | Currency |

Legacy submissions fail with `eoi_contract_value_requires_integer_cents`; `estimated_contract_value_usd` is a legacy migration alias only.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `marketplace_entity_money_integer_cents` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/marketplace_entity_money_integer_cents.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Integer cents money fields. | M02.3 |

