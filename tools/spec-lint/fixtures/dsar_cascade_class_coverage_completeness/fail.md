### 4.2.6 ApiToken (Org-Scoped) {#4.2.6-api-token}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Required | Primary key |
| `created_by` | UUID (FK User) | Required | Token creator |
| `updated_by` | UUID (FK User) | Nullable | Last actor |

### 6.8.4.3 Cascade Class Coverage Registry (D-9.2-001 / D-9.2-006 V9 remediation, 2026-05-09) {#6.8.4.3-cascade-class-coverage-registry}

| § | Entity | Class (§6.8.4) | Pattern (§6.8.4.1) | Notes |
| :---- | :---- | :---- | :---- | :---- |
| §4.2.6 | ApiToken | 1 (security-audit metadata) | n/a | Invalid: User-attribution fields cannot use n/a treatment. |
