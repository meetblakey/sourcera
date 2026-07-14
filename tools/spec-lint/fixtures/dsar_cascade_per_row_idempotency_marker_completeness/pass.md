## 4.1 Model Design Principles {#4.1-model-design-principles}

### 4.1.1 DSAR Cascade Idempotency Marker Mixin {#4.1.1-dsar-cascade-idempotency-marker-mixin}

**Scope.** Every persisted entity registered in §6.8.4.3 Cascade Class Coverage Registry inherits the following fields as part of its §4 schema. Entity-specific field tables MUST NOT rename, narrow, or omit them.

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `dsar_redacted_under_request_id` | UUID (FK -> §4.6.5 DSARRequest.`id`) | Nullable; set atomically during a successful row-level DSAR mutation; never set by non-DSAR writes | Idempotency marker for DSAR partial-failure resume. |
| `dsar_redacted_at` | Timestamp | Nullable; required iff `dsar_redacted_under_request_id IS NOT NULL` | UTC timestamp of the successful row-level DSAR redaction mutation. |

### 4.2.6 ApiToken (Org-Scoped) {#4.2.6-api-token}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Required | Primary key |
| `created_by` | UUID (FK User) | Required | Token creator |
| `updated_by` | UUID (FK User) | Nullable | Last actor |

### 6.8.4.3 Cascade Class Coverage Registry (D-9.2-001 / D-9.2-006 V9 remediation, 2026-05-09) {#6.8.4.3-cascade-class-coverage-registry}

| § | Entity | Class (§6.8.4) | Pattern (§6.8.4.1) | Notes |
| :---- | :---- | :---- | :---- | :---- |
| §4.2.6 | ApiToken | 1 (security-audit metadata) | Pattern B on `created_by`, `updated_by` | Metadata retained; secret destroyed. |
