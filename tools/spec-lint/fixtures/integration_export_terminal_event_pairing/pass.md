## 31.3 Integration Phase Export Mapping {#31.3-integration-phase-export-mapping}

| Event | Trigger | Payload fields | Recipient / subscriber policy | Retry |
| :---- | :---- | :---- | :---- | :---- |
| `integration.export.completed` | `IntegrationExportRun.running -> completed` | `event_id` | Requesting user | `standard` (F.1) |
| `integration.export.failed` | `IntegrationExportRun.running -> failed` OR `running -> partial_failure` | `partial` | Requesting user | `standard` (F.1) |
| `integration.export.canceled` | `IntegrationExportRun.queued/running -> canceled` | `cancel_reason` | Requesting user | `standard` (F.1) |

PostHog mirrors are registered in Appendix G as `integration_export_initiated`, `integration_export_completed`, `integration_export_failed`, and `integration_export_canceled`.
Every terminal run MUST emit exactly one Appendix C event and one Appendix G mirror; partial failures emit `integration.export.failed` with `partial=true`; canceled runs emit `integration.export.canceled` with Appendix J `integration_export_cancel_reason`.

### 4.3.39 IntegrationExportRun {#4.3.39-integrationexportrun}

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `running` | `completed` | All target writes succeed | Target refs stored; counts reconciled | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed` |
| `running` | `partial_failure` | Some target writes fail after at least one succeeds | `failure_code='partial_failure'`; per-item summary stored without bodies | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` with `partial=true` |
| `queued` / `running` | `failed` | Credential, provider, scope, or worker failure prevents usable export | `failure_code` required | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` |
| `queued` / `running` | `canceled` | Workspace reopened, deleted, DSAR hold invalidates source rows, or user cancels before first provider write | No target refs persisted; accepted target record forces `partial_failure` instead | Emits Appendix C `integration.export.canceled` and Appendix G `integration_export_canceled` |

Every terminal run MUST emit exactly one Appendix C terminal event and exactly one Appendix G terminal mirror.

### L.18 Integration Export Run State Machine (§4.3.39 / §31.3) {#l-18-integration-export-run-state-machine}

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `running` | `completed` | All target writes succeed | Target refs stored; exported requirement/action-item counts reconcile; provider response bodies are not persisted | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed`. |
| `running` | `partial_failure` | Some target writes fail after at least one succeeds | `failure_code='partial_failure'`; per-item failure summary is safe and body-free; at least one `target_record_refs_json` entry exists | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` with `partial=true`; poll response may carry Appendix I `integration_export_partial_failure`. |
| `queued` / `running` | `failed` | Credential, provider, scope, residency, or worker failure prevents usable export | `failure_code` required; no usable export is available to the caller | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed`; retryability derives from `failure_code`. |
| `queued` / `running` | `canceled` | User cancels, Workspace reopens/deletes, DSAR hold blocks source rows, or downgrade blocks new provider writes before first accepted target write | No new provider writes after cancel; accepted target records before cancel force `partial_failure` rather than `canceled`; `cancel_reason` required | Emits Appendix C `integration.export.canceled` and Appendix G `integration_export_canceled`; terminal audit row remains visible per §40.2. |

Every terminal run MUST emit exactly one Appendix C event and exactly one Appendix G mirror with the same `export_id` and terminal status.

| `integration.export.completed` | IntegrationExportRun `running -> completed` (§4.3.39) | Requesting user |
| `integration.export.failed` | IntegrationExportRun `running -> failed` or `running -> partial_failure` (§4.3.39) | Requesting user |
| `integration.export.canceled` | IntegrationExportRun `queued/running -> canceled` (§4.3.39) | Requesting user |
| `integration_export_completed` | Mirror of Appendix C `integration.export.completed` | `source_webhook_event_type='integration.export.completed'` |
| `integration_export_failed` | Mirror of Appendix C `integration.export.failed` | `source_webhook_event_type='integration.export.failed'` |
| `integration_export_canceled` | Mirror of Appendix C `integration.export.canceled` | `source_webhook_event_type='integration.export.canceled'` |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `integration_export_terminal_event_pairing` | webhook_catalog_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/integration_export_terminal_event_pairing.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §4.3.39 / §31.3.4 / Appendix C / Appendix G / Appendix L.18 terminal event pairing only; product event emission, outbox writes, duplicate suppression, webhook delivery, PostHog production emission, worker runtime tests, and deploy validators remain product-pack evidence) | pr_lint | Pairing | M02.3 |
