### 4.7.1 Console Bridge Event (Cross-Console, Firewall-Bounded Sync Unit) {#4.7.1-console-bridge-event}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `event_kind` | Enum | See Appendix J `console_bridge_event_kind`: `requirement_created`, `response_submitted`, `workspace_canceled` | Bridge operation kind. |

**Field-Level Redaction Rules (Firewall Integrity).**

| Event Kind | Fields CARRIED | Fields NEVER CARRIED |
| :---- | :---- | :---- |
| `requirement_created`, `response_submitted` | `id` | Internal scores |
| `requirement_created` | `requirement_id`, `title` | |
| `workspace_canceled` | `workspace_id` | N/A |

### `console_bridge_event_kind` (§4.7.1 Console Bridge Event Kind)

`requirement_created`, `response_submitted`, `workspace_canceled`

**`console_bridge_event_kind`** (§4.7.1): `requirement_created`, `response_submitted`, `workspace_canceled` (3 values).
