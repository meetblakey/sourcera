### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto |
| `category` | Enum | `erp`, `crm`, `other` | Inline legacy enum |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `marketplace_listing_category_taxonomy_fk` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | §4.5.1 Marketplace Listing MUST use `category_taxonomy_node_id`. | M02.3 |

