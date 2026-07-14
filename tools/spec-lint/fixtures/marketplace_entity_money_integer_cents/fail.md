### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `min_price_usd` | Decimal | >= 0 | Legacy dollars |
| `currency_code` | String | Inline | Currency |

### 4.5.2 EOI Record {#4.5.2-eoi-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `estimated_contract_value_usd` | Decimal | >= 0 | Legacy dollars |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `marketplace_entity_money_integer_cents` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | Integer cents money fields. | M02.3 |

