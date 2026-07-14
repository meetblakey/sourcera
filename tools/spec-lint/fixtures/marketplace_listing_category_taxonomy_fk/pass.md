### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto |
| `category_taxonomy_node_id` | UUID (FK) | FK -> Taxonomy Node (§4.5.4) where `kind=marketplace_category` | Canonical category binding |

**Legacy category migration.** Legacy values migrate. New writes MUST NOT accept the inline enum and return `marketplace_listing_category_requires_taxonomy_node`.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `marketplace_listing_category_taxonomy_fk` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/marketplace_listing_category_taxonomy_fk.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §4.5.1 Marketplace Listing MUST use `category_taxonomy_node_id`. | M02.3 |

