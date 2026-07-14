# Bridge Event Body PII Sweep Completeness Pass Fixture

### 4.7.1 Console Bridge Event {#4.7.1-console-bridge-event}

**Field-Level Redaction Rules (Firewall Integrity).**

| Event Kind | Fields CARRIED | Fields NEVER CARRIED |
| :---- | :---- | :---- |
| `qa_thread_post_appended` | `qa_thread_id`, `body_markdown` | Buyer-internal thread replies |
| `phase_advanced` | `workspace_id`, `from_phase`, `to_phase` | User identity |

### 6.8.4.5 Bridge-Event Body Text PII Sweep {#6.8.4.5-bridge-event-body-text-pii-sweep}

| Bridge event kind | Free-text fields scanned |
| :---- | :---- |
| `qa_thread_post_appended` | `body_markdown` |
