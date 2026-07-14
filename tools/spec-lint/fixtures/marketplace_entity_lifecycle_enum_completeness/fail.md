### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `status` | Enum | Inline enum | Listing lifecycle |

**State Machine.**

| From | To | Trigger | Conditions | Actor | Notes |
|---|---|---|---|---|---|
| (init) | `draft` | Create | OK | Seller | |
| `draft` | `published` | Publish | OK | Seller | |

### 4.5.2 EOI Record {#4.5.2-eoi-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `eoi_status` | Enum | Appendix J `eoi_record_status` | EOI lifecycle |

**State Machine.**

| From | To | Trigger | Conditions | Actor | Notes |
|---|---|---|---|---|---|
| (init) | `draft` | Create | OK | User | |

### 4.5.3 NDA Record {#4.5.3-nda-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `nda_status` | Enum | Appendix J `nda_record_status` | NDA lifecycle |

**State Machine.**

| From | To | Trigger | Conditions | Actor | Notes |
|---|---|---|---|---|---|
| (init) | `draft` | Create | OK | User | |

### `marketplace_listing_status`

`draft`, `published`

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `marketplace_entity_lifecycle_enum_completeness` | spec_tree_lint | spec_binding_pending_pack_m02_3 | pr_lint | Lifecycle enum completeness. | M02.3 |

