### 19.6.2 API, Event, and Atomicity Binding {#19.6.2-api-event-and-atomicity-binding}

Every mutation below writes exactly one AuditEvent. Each mutation emits the matching Appendix C webhook / notification event plus Appendix G PostHog mirror. Webhook delivery inherits §31.1-§31.6 and the §31.15 Template Library pack.

| Mutation | Audit action | Appendix C event | Appendix G mirror | Entity |
|---|---|---|---|---|
| Create | `template.created` | `template.created` | `template_created` | `workspace_template` |
| Metadata | `template.metadata_updated` | `template.metadata_updated` | `template_metadata_updated` | `workspace_template` |
| Update available | `template.update_available_received` | `template.update_available_received` | `template_update_available_received` | `workspace_template` |
| Update applied | `template.update_applied` | `template.update_applied` | `template_update_applied` | `workspace_template_version` |
| Delete | `template.deleted` | `template.deleted` | `template_deleted` | `workspace_template` |
| Suggest | `template.suggestion_submitted` | `template.suggestion_submitted` | `template_suggestion_submitted` | `workspace_template` |
| Workspace | `workspace.created_from_template` | `workspace.created_from_template` | `workspace_created_from_template` | `workspace` |

## 31.15 Template Library Webhook Completeness Pack {#31.15-template-library-webhook-completeness-pack}

HMAC-SHA256 signing, immutable `event_id`, payload size ceiling. Payloads MUST NOT include `content_snapshot_json`. Appendix C and Appendix G registrations MUST match the §31.15 event names and payload field sets.

| Event | Class | Trigger | Payload fields | Recipient / subscriber policy | Retry |
|---|---|---|---|---|---|
| `template.created` | `product_domain` | x | `workspace_template_kind` | x | `standard` (F.1) |
| `template.metadata_updated` | `product_domain` | x | `workspace_template_kind` | x | `standard` (F.1) |
| `template.update_available_received` | `product_domain` | x | `workspace_template_kind` | x | `standard` (F.1) |
| `template.update_applied` | `product_domain` | x | `workspace_template_kind` | x | `standard` (F.1) |
| `template.deleted` | `product_domain` | x | `workspace_template_kind` | x | `standard` (F.1) |
| `template.suggestion_submitted` | `product_domain` | x | `workspace_template_kind` | x | `standard` (F.1) |
| `workspace.created_from_template` | `product_domain` | x | `workspace_template_kind` | x | `standard` (F.1) |

## 31.16 Next Section {#31.16-next-section}

**Template Library notification and webhook registrations (§19 / §31.15).**

| Event Kind | Trigger | Recipient | Channel | Cadence | Payload | Retry Curve |
|---|---|---|---|---|---|---|
| `template.created` | x | x | x | x | `workspace_template_kind` | x |
| `template.metadata_updated` | x | x | x | x | `workspace_template_kind` | x |
| `template.update_available_received` | x | x | x | x | `workspace_template_kind` | x |
| `template.update_applied` | x | x | x | x | `workspace_template_kind` | x |
| `template.deleted` | x | x | x | x | `workspace_template_kind` | x |
| `template.suggestion_submitted` | x | x | x | x | `workspace_template_kind` | x |
| `workspace.created_from_template` | x | x | x | x | `workspace_template_kind` | x |

**Scenario Modeling webhook registrations (§14 / §31.16).**

### v7.2.0-REM Phase 4.10 Template Library API/Event P1 Mirrors (2026-06-23) {#appendix-g-v72rem-phase-4-10-template-library-api-event-p1}

Dotted Appendix C names normalize to underscore-form PostHog names. workspace_template_kind source_webhook_event_type.

| Event | Trigger | Key Properties |
|---|---|---|
| `template_created` | x | `source_webhook_event_type='template.created'`, `workspace_template_kind` |
| `template_metadata_updated` | x | `source_webhook_event_type='template.metadata_updated'`, `workspace_template_kind` |
| `template_update_available_received` | x | `source_webhook_event_type='template.update_available_received'`, `workspace_template_kind` |
| `template_update_applied` | x | `source_webhook_event_type='template.update_applied'`, `workspace_template_kind` |
| `template_deleted` | x | `source_webhook_event_type='template.deleted'`, `workspace_template_kind` |
| `template_suggestion_submitted` | x | `source_webhook_event_type='template.suggestion_submitted'`, `workspace_template_kind` |
| `workspace_created_from_template` | x | `source_webhook_event_type='workspace.created_from_template'`, `workspace_template_kind` |

| `workspace_template_event_catalog_consistency` | webhook_catalog_consistency | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/workspace_template_event_catalog_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | x | M02.3 |
