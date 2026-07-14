### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `status` | Enum | Appendix J `marketplace_listing_status` | Listing lifecycle |

**State Machine.**

| From | To | Trigger | Conditions | Actor | Notes |
|---|---|---|---|---|---|
| (init) | `draft` | Create | OK | Seller | |
| `draft` | `published` | Publish | OK | Seller | |
| `published` | `flagged_for_review` | Report | OK | System | |
| `flagged_for_review` | `hidden` | Hold | OK | Ops | |
| `hidden` | `archived` | Archive | OK | Seller | |
| `archived` | `removed` | Remove | OK | Ops | |

### 4.5.2 EOI Record {#4.5.2-eoi-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `eoi_status` | Enum | Appendix J `eoi_record_status` | EOI lifecycle |

**State Machine.**

| From | To | Trigger | Conditions | Actor | Notes |
|---|---|---|---|---|---|
| (init) | `draft` | Create | OK | User | |
| `draft` | `submitted` | Submit | OK | User | |
| `submitted` | `acknowledged` | Ack | OK | User | |
| `acknowledged` | `approved` | Approve | OK | Buyer | |
| `submitted` | `rejected` | Reject | OK | User | |
| `draft` | `withdrawn` | Withdraw | OK | User | |

### 4.5.3 NDA Record {#4.5.3-nda-record}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `nda_status` | Enum | Appendix J `nda_record_status` | NDA lifecycle |

**State Machine.**

| From | To | Trigger | Conditions | Actor | Notes |
|---|---|---|---|---|---|
| (init) | `draft` | Create | OK | User | |
| `draft` | `pending_buyer` | Submit | OK | Seller | |
| `draft` | `pending_seller` | Submit | OK | Buyer | |
| `pending_buyer` | `executed` | Sign | OK | Buyer | |
| `pending_seller` | `changes_requested` | Request | OK | Seller | |
| `changes_requested` | `expired` | Expire | OK | System | |
| `executed` | `revoked` | Revoke | OK | Ops | |

### `marketplace_listing_status`

`draft`, `published`, `flagged_for_review`, `hidden`, `archived`, `removed`

### `eoi_record_status`

`draft`, `submitted`, `acknowledged`, `approved`, `rejected`, `withdrawn`

### `nda_record_status`

`draft`, `pending_buyer`, `pending_seller`, `changes_requested`, `executed`, `expired`, `revoked`

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `marketplace_entity_lifecycle_enum_completeness` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/marketplace_entity_lifecycle_enum_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Lifecycle enum completeness. | M02.3 |

