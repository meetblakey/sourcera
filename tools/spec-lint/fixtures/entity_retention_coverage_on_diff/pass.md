# Entity Retention Fixture

## 4.2 Core Entities

### 4.2.1 Organization

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `created_at` | Timestamp | Required | |

### 4.2.2 TeamMembership

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `team_id` | UUID | Required | |

### 4.2.3 Retired Thing (Retired in V4)

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Condition | Retention |
| :---- | :---- |
| Organization (§4.2.1) | Org-life + 7 years. |
| TeamMembership (§4.2.2) | Team-life + 7 years. |

#### M.5.4 Catalog index {#m-5-4-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `entity_retention_coverage_on_diff` | V9 | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/entity_retention_coverage_on_diff.ts`; verified PASS on live Master Spec and pass/fail fixtures) | §4 entity tables + §40.2. | Entity tables require retention rows. | PR comment. | §40.2. |
