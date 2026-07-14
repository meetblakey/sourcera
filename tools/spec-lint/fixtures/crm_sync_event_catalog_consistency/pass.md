### 31.9.6 CRMSyncActivityEvent (Append-Only, Seller-Console-Scoped) {#31.9.6-crmsyncactivityevent}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `activity_state` | Enum | See Appendix J `crm_sync_activity_state`: `pending`, `in_flight`, `succeeded`, `failed_retryable`, `failed_permanent`, `dead_lettered`, `redacted_by_dsar` | Lifecycle. Review-queue holds are represented by `activity_state='failed_retryable'` plus review-required `failure_category` and null `retry_after_at` until human resolution. |

### 31.9.10 Webhook Catalog {#31.9.10-webhook-catalog}

The canonical customer-facing namespace is `seller.crm_sync.*`; Appendix G PostHog mirrors use the same name with `.` replaced by `_` and carry `source_webhook_event_type` for exact catalog consistency.

| event_type | Trigger | Key payload |
| :---- | :---- | :---- |
| `seller.crm_sync.connection_activated` | t | p |
| `seller.crm_sync.connection_paused` | t | p |
| `seller.crm_sync.connection_auto_resumed` | t | p |
| `seller.crm_sync.connection_revoked` | t | p |
| `seller.crm_sync.connection_disconnected` | t | p |
| `seller.crm_sync.oauth_token_refresh_failed` | t | p |
| `seller.crm_sync.oauth_scope_insufficient_at_upgrade` | t | p |
| `seller.crm_sync.activity_written` | t | p |
| `seller.crm_sync.activity_failed` | t | p |
| `seller.crm_sync.activity_dead_lettered` | t | p |
| `seller.crm_sync.account_created` | t | p |
| `seller.crm_sync.review_queue_item_created` | t | p |
| `seller.crm_sync.field_mapping_updated` | t | p |
| `seller.crm_sync.field_mapping_reverted_on_downgrade` | t | p |
| `seller.crm_sync.field_mapping_schema_drift_detected` | t | p |
| `seller.crm_sync.routing_rule_updated` | t | p |
| `seller.crm_sync.review_queue_saturation` | t | p |
| `seller.crm_sync.connection_health_critical` | t | p |
| `seller.crm_sync.dsar_cascade_notification` | t | p |

### 31.9.14 Acceptance Criteria {#31.9.14-acceptance-criteria}

22. Every CRM Sync webhook event registered in Appendix C MUST match the §31.9.10 emitted `event_type` exactly; every Appendix G CRM Sync PostHog mirror MUST either be the dot-to-underscore transform of that event type and carry `source_webhook_event_type`, or be explicitly labeled `analytics_only`. CI test `crm_sync_event_catalog_consistency` asserts.

### CRM-Sync-Domain Events (Webhook + Seller User Notification — added §31.9)

| Event | Trigger | Recipient |
| :---- | :---- | :---- |
| `seller.crm_sync.connection_activated` | t | r |
| `seller.crm_sync.connection_paused` | t | r |
| `seller.crm_sync.connection_auto_resumed` | t | r |
| `seller.crm_sync.connection_revoked` | t | r |
| `seller.crm_sync.connection_disconnected` | t | r |
| `seller.crm_sync.oauth_token_refresh_failed` | t | r |
| `seller.crm_sync.oauth_scope_insufficient_at_upgrade` | t | r |
| `seller.crm_sync.activity_written` | t | r |
| `seller.crm_sync.activity_failed` | t | r |
| `seller.crm_sync.activity_dead_lettered` | t | r |
| `seller.crm_sync.account_created` | t | r |
| `seller.crm_sync.review_queue_item_created` | t | r |
| `seller.crm_sync.field_mapping_updated` | t | r |
| `seller.crm_sync.field_mapping_reverted_on_downgrade` | t | r |
| `seller.crm_sync.field_mapping_schema_drift_detected` | t | r |
| `seller.crm_sync.routing_rule_updated` | t | r |
| `seller.crm_sync.review_queue_saturation` | t | r |
| `seller.crm_sync.connection_health_critical` | t | r |
| `seller.crm_sync.dsar_cascade_notification` | t | r |

### CRM-Sync-Domain Events (added §31.9)

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `seller_crm_sync_connection_activated` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.connection_activated'` |
| `seller_crm_sync_connection_paused` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.connection_paused'` |
| `seller_crm_sync_connection_auto_resumed` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.connection_auto_resumed'` |
| `seller_crm_sync_connection_revoked` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.connection_revoked'` |
| `seller_crm_sync_connection_disconnected` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.connection_disconnected'` |
| `seller_crm_sync_oauth_token_refresh_failed` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.oauth_token_refresh_failed'` |
| `seller_crm_sync_oauth_scope_insufficient_at_upgrade` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.oauth_scope_insufficient_at_upgrade'` |
| `seller_crm_sync_activity_written` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.activity_written'` |
| `seller_crm_sync_activity_failed` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.activity_failed'` |
| `seller_crm_sync_activity_dead_lettered` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.activity_dead_lettered'` |
| `seller_crm_sync_account_created` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.account_created'` |
| `seller_crm_sync_review_queue_item_created` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.review_queue_item_created'` |
| `seller_crm_sync_field_mapping_updated` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.field_mapping_updated'` |
| `seller_crm_sync_field_mapping_reverted_on_downgrade` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.field_mapping_reverted_on_downgrade'` |
| `seller_crm_sync_field_mapping_schema_drift_detected` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.field_mapping_schema_drift_detected'` |
| `seller_crm_sync_routing_rule_updated` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.routing_rule_updated'` |
| `seller_crm_sync_review_queue_saturation` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.review_queue_saturation'` |
| `seller_crm_sync_connection_health_critical` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.connection_health_critical'` |
| `seller_crm_sync_dsar_cascade_notification` | Webhook mirror | `source_webhook_event_type='seller.crm_sync.dsar_cascade_notification'` |

**Analytics-only CRM Sync events.** These PostHog events are not customer webhook mirrors and MUST carry `analytics_only=true`.

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `crm_sync_activity_emitted` | t | `analytics_only=true` |
| `crm_sync_review_queue_item_resolved` | t | `analytics_only=true` |

#### `crm_sync_activity_state`

`pending`, `in_flight`, `succeeded`, `failed_retryable`, `failed_permanent`, `dead_lettered`, `redacted_by_dsar`.

**State machine (§31.9.6):** `failed_retryable → dead_lettered`; `succeeded | failed_permanent | dead_lettered → redacted_by_dsar`.

| `crm_sync_event_catalog_consistency` | catalog_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/crm_sync_event_catalog_consistency.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Catalogs align. | M02.3 |
