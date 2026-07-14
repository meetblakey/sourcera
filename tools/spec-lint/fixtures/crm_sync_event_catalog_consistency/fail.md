### 31.9.6 CRMSyncActivityEvent (Append-Only, Seller-Console-Scoped) {#31.9.6-crmsyncactivityevent}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `activity_state` | Enum | `pending`, `succeeded`, `failed_needs_review` | Review queue uses a shadow state. |

### 31.9.10 Webhook Catalog {#31.9.10-webhook-catalog}

The canonical customer-facing namespace is `crm_sync.*`.

| event_type | Trigger | Key payload |
| :---- | :---- | :---- |
| `seller.crm_sync.connection_activated` | t | p |
| `seller.crm_sync.activity_written` | t | p |
| `seller.crm_sync.extra_event` | t | p |

### 31.9.14 Acceptance Criteria {#31.9.14-acceptance-criteria}

22. CRM Sync events should align.

### CRM-Sync-Domain Events (Webhook + Seller User Notification — added §31.9)

| Event | Trigger | Recipient |
| :---- | :---- | :---- |
| `seller.crm_sync.connection_activated` | t | r |
| `seller.crm_sync.connection_activated` | duplicate | r |
| `seller.crm_sync.activity_written` | t | r |

### CRM-Sync-Domain Events (added §31.9)

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `seller_crm_sync_connection_activated` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.connection_paused'` |
| `seller_crm_sync_activity_written` | Webhook mirror | no source |
| `seller_crm_sync_extra_event` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.extra_event'` |

**Analytics-only CRM Sync events.** These PostHog events are not customer webhook mirrors.

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `crm_sync_activity_emitted` | t | missing flag |

#### `crm_sync_activity_state`

`pending`, `succeeded`, `failed_needs_review`.

| `crm_sync_event_catalog_consistency` | catalog_consistency | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Catalogs align. | M02.3 |
