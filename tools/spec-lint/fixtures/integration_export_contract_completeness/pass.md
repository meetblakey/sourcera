## 31.3 Integration Phase Export Mapping {#31.3-integration-phase-export-mapping}

Phase-13 Integration Export is a Buyer-console-only workflow. Configuration authority is §5.11 row **Configure Phase 13 Integration Export Mapping** and API scope. Run authority is §5.11 row **Run Phase 13 Integration Export** and API scope. Seller-console, Marketplace, guest, and cross-Workspace sessions return non-leaking HTTP 404.

| Entity | Purpose | Canonical section |
| :---- | :---- | :---- |
| `IntegrationExportConfiguration` | Org-default or Workspace-level target mapping, target credential pointer, and target field mapping | §4.3.38 |
| `IntegrationExportRun` | One async export attempt against a closed Workspace and selected target configuration | §4.3.39 |

The target provider MUST NOT receive Sourcera internal scores, scoring rationale, Internal Comment bodies, draft Selection Report text, non-winning vendors, or Marketplace Match Score internals.

| Event | Trigger | Payload fields | Recipient / subscriber policy | Retry |
| :---- | :---- | :---- | :---- | :---- |
| `integration.export.completed` | `IntegrationExportRun.running -> completed` | `event_id` | Requesting user | `standard` (F.1) |
| `integration.export.failed` | `IntegrationExportRun.running -> failed` OR `running -> partial_failure` | `partial` | Requesting user | `standard` (F.1) |
| `integration.export.canceled` | `IntegrationExportRun.queued/running -> canceled` | `cancel_reason` | Requesting user | `standard` (F.1) |

PostHog mirrors are registered in Appendix G as `integration_export_initiated`, `integration_export_completed`, `integration_export_failed`, and `integration_export_canceled`.
Every terminal run MUST emit exactly one Appendix C event and one Appendix G mirror; partial failures emit `integration.export.failed` with `partial=true`; canceled runs emit `integration.export.canceled` with Appendix J `integration_export_cancel_reason`.
Plan downgrades below §34.1.1 cell **Phase 13 Standard Integration Export** MUST preserve existing configuration rows in read-only / reconnect-disabled mode.

### 4.3.38 IntegrationExportConfiguration {#4.3.38-integrationexportconfiguration}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `target_system` | Enum (Appendix J `integration_export_target_system`) | Required | Target |
| `status` | Enum (Appendix J `integration_export_configuration_status`) | Required | Lifecycle |
| `credential_ciphertext_ref` | String | Required when `status != deleted`; internal vault reference only | Secret pointer |

**Scope isolation.** Buyer-console and Org-scoped, with optional Workspace override.
**Required indexes.** `(org_id, target_system, workspace_id, deleted_at) UNIQUE WHERE deleted_at IS NULL`.
**Retention, DSAR, and residency.** Retention is §40.2 row **IntegrationExportConfiguration / IntegrationExportRun**.

### 4.3.39 IntegrationExportRun {#4.3.39-integrationexportrun}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `status` | Enum (Appendix J `integration_export_run_status`) | Required | State |
| `failure_code` | Enum (Appendix J `integration_export_failure_code`) | Nullable | Failure |
| `cancel_reason` | Enum (Appendix J `integration_export_cancel_reason`) | Nullable | Required when `status='canceled'` |

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| (init) | `queued` | Export request accepted | Workspace is Phase 13 / `closed`; configuration active; plan and RBAC checks pass | Emits Appendix G `integration_export_initiated` |
| `running` | `completed` | All target writes succeed | Target refs stored; counts reconciled | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed` |
| `running` | `partial_failure` | Some target writes fail after at least one succeeds | `failure_code='partial_failure'`; per-item summary stored without bodies | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` with `partial=true` |
| `queued` / `running` | `failed` | Credential, provider, scope, or worker failure prevents usable export | `failure_code` required | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` |
| `queued` / `running` | `canceled` | Workspace reopened, deleted, DSAR hold invalidates source rows, or user cancels before first provider write | No target refs persisted; accepted target record forces `partial_failure` instead | Emits Appendix C `integration.export.canceled` and Appendix G `integration_export_canceled` |

Every terminal run MUST emit exactly one Appendix C terminal event and exactly one Appendix G terminal mirror.

### 32.10.3.F Phase 13 Integration Export Endpoints {#32.10.3.f-phase-13-integration-export-endpoints}

| Method | Path | Auth Scope | RBAC / plan gate | Rate-Limit Class | Idempotency |
| :---- | :---- | :---- | :---- | :---- | :---- |
| POST | `/v1/workspaces/{workspace_id}/exports` | `write:workspaces` | §5.11 Run Phase 13 Integration Export row; §34.1.1 cell **Phase 13 Standard Integration Export**; Workspace Phase 13 / closed | `data_mutation` | REQUIRED |
| GET | `/v1/workspaces/{workspace_id}/exports/{export_id}` | `read:workspaces` | Requester, Workspace Owner/Admin, or current §5.11 run-authorized Workspace role | `workspace_read` | N/A |

`target_system` MUST be one of Appendix J `integration_export_target_system`. `cancel_reason`.

| Endpoint | Side effects |
| :---- | :---- |
| Export create | Creates `IntegrationExportRun`, writes AuditEvent `integration_export.requested`, emits Appendix G `integration_export_initiated`, dispatches the worker after transaction commit |

| HTTP | Code | Condition |
| :---- | :---- | :---- |
| 403 | `integration_export_plan_required` | Current Buyer plan lacks §34.1.1 cell **Phase 13 Standard Integration Export** |
| 409 | `integration_export_workspace_not_closed` | Workspace is not Phase 13 / `closed` or lacks a finalized SelectionRecord |
| 207 | `integration_export_partial_failure` | Poll response for a terminal partial-failure run; response carries safe per-item summaries |

| Configure Phase 13 Integration Export Mapping (§31.3; §4.3.38; §34.1.1 cell **Phase 13 Standard Integration Export**) | yes |
| Run Phase 13 Integration Export (§31.3; §4.3.39; §32.10.3.F; §34.1.1 cell **Phase 13 Standard Integration Export**) | yes |
| **Phase 13 Standard Integration Export** | Included for standard §31.3 targets |
| IntegrationExportConfiguration / IntegrationExportRun (§4.3.38 / §4.3.39 / §31.3) | Retention |
| `integration.export.completed` | IntegrationExportRun `running -> completed` (§4.3.39) | Requesting user |
| `integration.export.failed` | IntegrationExportRun `running -> failed` or `running -> partial_failure` (§4.3.39) | Requesting user |
| `integration.export.canceled` | IntegrationExportRun `queued/running -> canceled` (§4.3.39) | Requesting user |
| `integration_export_completed` | Mirror of Appendix C `integration.export.completed` | `source_webhook_event_type='integration.export.completed'` |
| `integration_export_failed` | Mirror of Appendix C `integration.export.failed` | `source_webhook_event_type='integration.export.failed'` |
| `integration_export_canceled` | Mirror of Appendix C `integration.export.canceled` | `source_webhook_event_type='integration.export.canceled'` |
| `integration_export_plan_required` | 403 | §31.3 / §32.10.3.F export create |
| `integration_export_invalid_state_transition` | 409 | Appendix L.18 worker/admin transition guard |

#### `integration_export_target_system` (§4.3.38, §4.3.39, §31.3)
#### `integration_export_run_status` (§4.3.39, Appendix L.18)
#### `integration_export_failure_code` (§4.3.39, Appendix C `integration.export.failed`)
#### `integration_export_cancel_reason` (§4.3.39, Appendix C `integration.export.canceled`)

**Phase 13 Integration Export.** Buyer-console closed-Workspace workflow.
**IntegrationExportConfiguration.** Org-default or Workspace-level Buyer integration mapping.
**IntegrationExportRun.** Async job and audit row.

### L.18 Integration Export Run State Machine (§4.3.39 / §31.3) {#l-18-integration-export-run-state-machine}

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `running` | `completed` | All target writes succeed | Target refs stored; exported requirement/action-item counts reconcile; provider response bodies are not persisted | Emits Appendix C `integration.export.completed` and Appendix G `integration_export_completed`. |
| `running` | `partial_failure` | Some target writes fail after at least one succeeds | `failure_code='partial_failure'`; per-item failure summary is safe and body-free; at least one `target_record_refs_json` entry exists | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed` with `partial=true`; poll response may carry Appendix I `integration_export_partial_failure`. |
| `queued` / `running` | `failed` | Credential, provider, scope, residency, or worker failure prevents usable export | `failure_code` required; no usable export is available to the caller | Emits Appendix C `integration.export.failed` and Appendix G `integration_export_failed`; retryability derives from `failure_code`. |
| `queued` / `running` | `canceled` | User cancels, Workspace reopens/deletes, DSAR hold blocks source rows, or downgrade blocks new provider writes before first accepted target write | No new provider writes after cancel; accepted target records before cancel force `partial_failure` rather than `canceled`; `cancel_reason` required | Emits Appendix C `integration.export.canceled` and Appendix G `integration_export_canceled`; terminal audit row remains visible per §40.2. |

Every terminal run MUST emit exactly one Appendix C event and exactly one Appendix G mirror with the same `export_id` and terminal status.

| Integration Phase Export Mapping / Phase 13 Integration Export | §31.3, §4.3.38, §4.3.39, §32.10.3.F | Surface |

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `integration_export_contract_completeness` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/integration_export_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §31.3 / §4.3.38-§4.3.39 / §32.10.3.F / Appendix catalogs only; product route handlers, OpenAPI generation, auth/rate-limit middleware, provider writes, worker execution, deploy validators, and integration tests remain product-pack evidence) | pr_lint | Contract | M02.3 |
| `integration_export_terminal_event_pairing` | webhook_catalog_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/integration_export_terminal_event_pairing.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §4.3.39 / §31.3.4 / Appendix C / Appendix G / Appendix L.18 terminal event pairing only; product event emission, outbox writes, duplicate suppression, webhook delivery, PostHog production emission, worker runtime tests, and deploy validators remain product-pack evidence) | pr_lint | Pairing | M02.3 |
