## 4.1 Model Design Principles {#4.1-model-design-principles}

### 4.1.1 DSAR Cascade Idempotency Marker Mixin {#4.1.1-dsar-cascade-idempotency-marker-mixin}

**Scope.** Some cascade entities may carry the following field.

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `dsar_redacted_under_request_id` | String | Required; default `none` | Request marker. |

### 4.2.6 ApiToken (Org-Scoped) {#4.2.6-api-token}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Required | Primary key |
| `dsar_redacted_at` | String | Required | Local override conflicts with the mixin. |

### 6.8.4.3 Cascade Class Coverage Registry (D-9.2-001 / D-9.2-006 V9 remediation, 2026-05-09) {#6.8.4.3-cascade-class-coverage-registry}

| § | Entity | Class (§6.8.4) | Pattern (§6.8.4.1) | Notes |
| :---- | :---- | :---- | :---- | :---- |
| §4.2.6 | ApiToken | 1 (security-audit metadata) | Pattern B on `created_by`, `updated_by` | marker exempt for this entity. |
