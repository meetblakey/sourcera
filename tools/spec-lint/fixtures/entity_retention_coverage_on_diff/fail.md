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

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Condition | Retention |
| :---- | :---- |
| Organization (§4.2.1) | Org-life + 7 years. |

#### M.5.4 Catalog index {#m-5-4-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Trigger | Failure mode | Authority anchor |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `entity_retention_coverage_on_diff` | V9 | `spec_binding_pending_pack_m02_3` | §4 entity tables + §40.2. | Entity tables require retention rows. | PR comment. | §40.2. |
