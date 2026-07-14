# Fixture

### 4.6.1 Audit Event {#4.6.1-audit-event}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto-generated |
| `prev_event_hash` | String(64) | sha256 hex | Missing required and §6.7.5 pointer. |
| `event_content_hash` | String(64) | sha256 hex; required | Missing §6.7.5 pointer. |

### 6.7.5 Audit Log Integrity Protection {#6.7.5-audit-log-integrity-protection}

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `prev_event_hash` | String(64) | sha256 hex; required | Previous hash. |
| `event_content_hash` | String(64) | sha256 hex | Missing required. |

1. Hash-chain fields exist.
