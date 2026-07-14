# Fixture

### 4.6.1 Audit Event {#4.6.1-audit-event}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto-generated |
| `prev_event_hash` | String(64) | sha256 hex; required | Per §6.7.5. |
| `event_content_hash` | String(64) | sha256 hex; required | Per §6.7.5. |
| `chain_position` | BIGINT | monotonic >= 0; required; UNIQUE per partition | Per §6.7.5. |

### 6.7.5 Audit Log Integrity Protection {#6.7.5-audit-log-integrity-protection}

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `prev_event_hash` | String(64) | sha256 hex; required | Previous hash. |
| `event_content_hash` | String(64) | sha256 hex; required | Content hash. |
| `chain_position` | BIGINT | monotonic >= 0; required | Cursor. |

1. Every AuditEvent INSERT MUST populate `prev_event_hash`, `event_content_hash`, and `chain_position`. CI gate `audit_event_hash_chain_columns_present` asserts.
