### 4.7.1 Console Bridge Event (Cross-Console, Firewall-Bounded Sync Unit) {#4.7.1-console-bridge-event}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `event_kind` | Enum | See Appendix J `console_bridge_event_kind`: `requirement_created`, `response_submitted` | Bridge operation kind. |

**Field-Level Redaction Rules (Firewall Integrity).**

| Event Kind | Fields CARRIED | Fields NEVER CARRIED |
| :---- | :---- | :---- |
| `requirement_created` | `requirement_id`, `title` | Internal scores, buyer-private notes |
| `response_submitted` | `response_id`, `response_payload` | N/A (seller→buyer direction; same redaction rules apply in reverse for buyer-internal data) |

### `console_bridge_event_kind` (§4.7.1 Console Bridge Event Kind)

`requirement_created`, `response_submitted`

**`console_bridge_event_kind`** (§4.7.1): `requirement_created`, `response_submitted` (2 values).
