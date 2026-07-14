## 31.3 Integration Phase Export Mapping {#31.3-integration-phase-export-mapping}

| Event | Trigger | Payload fields | Recipient / subscriber policy | Retry |
| :---- | :---- | :---- | :---- | :---- |
| `integration.export.completed` | `IntegrationExportRun.running -> completed` | `event_id` | Requesting user | `standard` (F.1) |
| `integration.export.failed` | `IntegrationExportRun.running -> failed` OR `running -> partial_failure` | `partial` | Requesting user | `standard` (F.1) |

PostHog mirrors are registered in Appendix G as `integration_export_initiated`, `integration_export_completed`, and `integration_export_failed`.

### 4.3.39 IntegrationExportRun {#4.3.39-integrationexportrun}

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `running` | `completed` | All target writes succeed | Target refs stored; counts reconciled | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed` |
| `queued` / `running` | `canceled` | User cancels | Terminal | Terminal customer state |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `integration_export_terminal_event_pairing` | notification_catalog_consistency | spec_binding_pending_pack_m02_3 | pr_lint + runtime_test | Missing canceled pair and runtime-active proof. | M02.3 |
