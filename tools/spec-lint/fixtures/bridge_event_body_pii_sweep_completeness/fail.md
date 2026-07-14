# Bridge Event Body PII Sweep Completeness Fail Fixture

### 4.7.1 Console Bridge Event {#4.7.1-console-bridge-event}

**Field-Level Redaction Rules (Firewall Integrity).**

| Event Kind | Fields CARRIED | Fields NEVER CARRIED |
| :---- | :---- | :---- |
| `qa_thread_post_appended` | `qa_thread_id`, `body_markdown`, `public_reason` | Buyer-internal thread replies |
| `missing_event` | `summary_text` | Buyer-internal thread replies |

### 6.8.4.5 Bridge-Event Body Text PII Sweep {#6.8.4.5-bridge-event-body-text-pii-sweep}

| Bridge event kind | Free-text fields scanned |
| :---- | :---- |
| `qa_thread_post_appended` | `not_carried_field` |
| `ghost_event` | `body_markdown` |
