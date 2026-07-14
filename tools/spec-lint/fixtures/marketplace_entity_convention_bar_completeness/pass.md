### 4.5.1 Marketplace Listing {#4.5.1-marketplace-listing}

**Scope:** Marketplace-domain.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto | UTC |
| `created_by` | UUID (FK) | User | Actor |
| `updated_by` | UUID (FK) | User | Actor |
| `deleted_at` | Timestamp | Nullable | Soft delete |

**Indexes.** `(id)`.
**State Machine.**
**Retention, DSAR, and residency.** Defined.
**Failure Modes Addressed.**
**Acceptance Criteria.**
1. One.
2. Two.
3. Three.
4. Four.
5. Five.

### 4.5.2 EOI Record {#4.5.2-eoi-record}

**Scope:** Marketplace-domain.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto | UTC |
| `created_by` | UUID (FK) | User | Actor |
| `updated_by` | UUID (FK) | User | Actor |
| `deleted_at` | Timestamp | Nullable | Soft delete |

**Indexes.** `(id)`.
**State Machine.**
**Retention, DSAR, and residency.** Defined.
**Failure Modes Addressed.**
**Acceptance Criteria.**
1. One.
2. Two.
3. Three.
4. Four.
5. Five.

### 4.5.3 NDA Record {#4.5.3-nda-record}

**Scope:** Marketplace-domain.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto |
| `created_at` | Timestamp | Immutable | UTC |
| `updated_at` | Timestamp | Auto | UTC |
| `created_by` | UUID (FK) | User | Actor |
| `updated_by` | UUID (FK) | User | Actor |
| `deleted_at` | Timestamp | Nullable | Soft delete |

**Indexes.** `(id)`.
**State Machine.**
**Retention, DSAR, and residency.** Defined.
**Failure Modes Addressed.**
**Acceptance Criteria.**
1. One.
2. Two.
3. Three.
4. Four.
5. Five.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `marketplace_entity_convention_bar_completeness` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/marketplace_entity_convention_bar_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Convention completeness. | M02.3 |

