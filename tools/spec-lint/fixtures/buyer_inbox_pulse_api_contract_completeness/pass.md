# 20. Inbox & Pulse {#20.-inbox-and-pulse}

All Inbox state mutations bind to §32.10.3.B and require server-side authorization against §5.11 before entity existence is resolved.

| Interaction | API binding | Contract |
| :---- | :---- | :---- |
| Open item | `GET /v1/workspaces/{workspace_id}/inbox/{item_id}` | Re-authorized |
| Mark as read | `POST /v1/workspaces/{workspace_id}/inbox/{item_id}/read` | Idempotent |
| Dismiss | `POST /v1/workspaces/{workspace_id}/inbox/{item_id}/dismiss` | Idempotent |
| Restore dismissed | `POST /v1/workspaces/{workspace_id}/inbox/{item_id}/restore` | Idempotent |
| Mark all as read | `POST /v1/workspaces/{workspace_id}/inbox/mark-all-read` | Requires key |
| Filter | `GET /v1/workspaces/{workspace_id}/inbox?type=&read_state=&delivery_state=` | Appendix J filters |

Desktop and tablet may initiate the async CSV export through §32.10.3.B.
For notification preferences, the API remains §32.10.3.B.
Inbox read, dismiss, restore, and mark-all-read mutations MUST route through §32.10.3.B.

### 32.10.3.B Buyer Inbox and Pulse Endpoints {#32.10.3.b-buyer-inbox-and-pulse-endpoints}

| Method | Path | Auth Scope | RBAC / plan gate | Rate-Limit Class | Idempotency |
| :---- | :---- | :---- | :---- | :---- | :---- |
| GET | `/v1/workspaces/{workspace_id}/inbox` | `read:workspaces` | §5.11 Read Inbox row | `workspace_read` | N/A |
| GET | `/v1/workspaces/{workspace_id}/inbox/{item_id}` | `read:workspaces` | §5.11 Read Inbox row | `workspace_read` | N/A |
| POST | `/v1/workspaces/{workspace_id}/inbox/{item_id}/read` | `write:workspaces` | §5.11 Mark Inbox item row | `data_mutation` | REQUIRED |
| POST | `/v1/workspaces/{workspace_id}/inbox/{item_id}/dismiss` | `write:workspaces` | §5.11 Mark Inbox item row | `data_mutation` | REQUIRED |
| POST | `/v1/workspaces/{workspace_id}/inbox/{item_id}/restore` | `write:workspaces` | §5.11 Mark Inbox item row | `data_mutation` | REQUIRED |
| POST | `/v1/workspaces/{workspace_id}/inbox/mark-all-read` | `write:workspaces` | §5.11 Mark all Inbox items row; mobile simplified per §38.8.2 | `data_mutation` | REQUIRED |
| GET | `/v1/workspaces/{workspace_id}/pulse` | `read:workspaces` | §5.11 View Pulse Health row; Free has no Pulse per §34.8.5 / Appendix M.1 | `workspace_read` | N/A |
| POST | `/v1/workspaces/{workspace_id}/pulse/refresh` | `write:workspaces` | §5.11 Refresh Pulse row | `data_mutation` | REQUIRED |
| GET | `/v1/workspaces/{workspace_id}/pulse/digests` | `read:workspaces` | §5.11 View Pulse Digest Archive row | `workspace_read` | N/A |
| GET | `/v1/workspaces/{workspace_id}/pulse/digests/{digest_id}` | `read:workspaces` | §5.11 View Pulse Digest Archive row | `workspace_read` | N/A |
| POST | `/v1/workspaces/{workspace_id}/pulse/digests/export` | `read:workspaces` | §5.11 Export Pulse Digest Archive CSV row and §34.1.1 Export Formats | `analytics_export` | REQUIRED |
| GET | `/v1/workspaces/{workspace_id}/pulse/digests/export/{export_id}` | `read:workspaces` | Requester or current §5.11 export-authorized role | `analytics_read` | N/A |
| GET | `/v1/workspaces/{workspace_id}/notification-preferences` | `read:workspaces` | Recipient self or §5.11 preference-admin row | `workspace_read` | N/A |
| PATCH | `/v1/workspaces/{workspace_id}/notification-preferences` | `write:workspaces` | Recipient self or §5.11 preference-admin row | `data_mutation` | REQUIRED |

**Request schema bindings.**

| Endpoint family | Request schema |
| :---- | :---- |
| Inbox item state mutation (`read`, `dismiss`, `restore`) | JSON body `{client_request_id}`; `Idempotency-Key` header REQUIRED; no arbitrary fields accepted. |
| Mark-all-read | JSON body `{type[], up_to_item_id, client_request_id}`; `type[]` values MUST resolve to Appendix J `notification_item_type`; `up_to_item_id` nullable; `Idempotency-Key` header REQUIRED. |
| Pulse refresh | JSON body `{client_request_id}`; `Idempotency-Key` header REQUIRED; server derives Workspace, Org, caller, and current-day compute key. |
| Digest export | JSON body `{format='csv', client_request_id}`; `format` currently accepts only `csv`; `Idempotency-Key` header REQUIRED; mobile callers fail before job creation. |
| Notification preferences patch | JSON body `{digest_enabled, pulse_digest_day, channel_preferences, notification_item_type_preferences, client_request_id}`; `pulse_digest_day` MUST resolve to Appendix J; reject SMS channel keys until that contract is authored. |
| Read/list endpoints | No JSON body; query parameters only where listed below; request body presence returns HTTP 422 `request_body_not_allowed`. |

**Response schema bindings.** List endpoints return the §32.3 cursor envelope with top-level `data` and `pagination {next_cursor, has_more, limit}`.

| Object | Fields |
| :---- | :---- |
| Inbox list | §32.3 cursor envelope of Inbox item objects plus `unread_count`, `has_unread_mention`, `dismissed_filter_available` |
| Inbox item | `item_id`, `workspace_id`, `org_id`, `notification_item_type`, `priority`, `title`, `description`, `action_url`, `action_label`, `delivery_state`, `read_at`, `dismissed_at`, `expires_at`, `created_at`, `updated_at` |
| Mark-all-read job | `mark_all_read_job_id`, `status`, `accepted_count`, `failed_count`, `poll_url`, `created_at`, `updated_at` |
| Pulse health | `workspace_pulse_health_id`, `workspace_id`, `recorded_at_utc`, `weight_set`, `composite_score`, `color_band`, `prior_color_band`, `band_transition`, `component_scores`, `last_source_event_cursor` |
| Pulse digest export | `export_id`, `status`, `format`, `requested_at`, `ready_at`, `expires_at`, `download_url` when ready, `artifact_sha256`, `artifact_bytes`, `failure_code` |

**Endpoint-specific side effects.**

| Endpoint | Side effects |
| :---- | :---- |
| Inbox read / dismiss / restore | Mutates InboxItem delivery timestamps, updates Unread Marker, writes AuditEvent, emits Appendix G `inbox_item_read`, `inbox_item_dismissed`, or `inbox_item_restored`. |
| Pulse refresh | Updates the current-day WorkspacePulseHealth row, may emit §31.14 `pulse.health_score_threshold_breached`, and emits Appendix G `pulse_refresh_requested`. |

**Errors.**

| HTTP | Code | Condition |
| :---- | :---- | :---- |
| 409 | `idempotency_key_request_mismatch` | Same key, different body |
| 422 | `pulse_digest_export_mobile_not_supported` | Mobile client attempted digest CSV export |
| 422 | `query_unsupported_filter_combination` | Filter set cannot use an indexed key prefix |
| 429 | `pulse_refresh_debounce_active` | Manual refresh attempted inside the debounce window |

**Acceptance criteria.**

1. Every endpoint MUST reject seller-console tokens, cross-Org tokens, and cross-Workspace tokens before resolving entity existence.
2. Every state-mutating endpoint MUST require `Idempotency-Key`; same-key / same-body replay returns the original response.
3. Preference patch MUST delegate quiet hours, DND, and entity mute semantics to §29.3 and reject SMS channel keys until the SMS contract is authored.

#### M.5.47 v7.2.0-REM Phase 4.11 Inbox and Pulse P1 continuation addition {#m-5-47-v72rem-phase-4-11-inbox-and-pulse-p1-continuation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `buyer_inbox_pulse_api_contract_completeness` | api_contract_completeness | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/buyer_inbox_pulse_api_contract_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §20 ↔ §32.10.3.B API-contract completeness only; production endpoint handlers, auth middleware, idempotency persistence, async export jobs, and runtime API tests remain product-pack evidence) | pr_lint | Every §20 Inbox / Pulse operation named in the surface resolves to a §32.10.3.B endpoint with auth scope, RBAC, rate-limit class, idempotency, request schemas, response schemas, errors, side effects, and acceptance criteria — closes D-4.11-006 API documentation gap. | M02.3 |
