# Fixture

## 4.3.15 Unread Marker

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `user_id` | UUID | Required | |
| `org_id` | UUID | Required | |
| `console` | Enum | Required | |
| `thread_type` | Enum | Appendix J `unread_marker_thread_type`; required | `internal_comment_thread`, `qa_thread`, or `inbox_item_group` |
| `thread_id` | UUID | Required | |
| `workspace_id` | UUID | Nullable | |
| `last_read_at` | Timestamp | Nullable | |
| `last_read_post_id` | UUID | Nullable | |
| `unread_count` | Integer | >= 0 | |
| `has_unread_mention` | Boolean | Default false | |
| `muted_until` | Timestamp | Nullable | |
| `suppressed_reason` | Enum | Appendix J `unread_marker_suppressed_reason` | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `deleted_at` | Timestamp | Nullable | |

## 4.3.22 Inbox Item Group

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `org_id` | UUID | Required | |
| `console` | Enum | buyer fixed | |
| `group_type` | Enum | Appendix J `inbox_item_group_type_enum` | `thread_collapse`, `digest_rollup`, `cross_console_bundle`, `notification_digest`, `marketplace_signal_cluster` |
| `anchor_entity_type` | Enum | Appendix J `anchor_entity_type_enum` | `qa_thread`, `internal_comment_thread`, `workspace`, `bid_workspace`, `requirement`, `response`, `selection_report_draft`, `console_bridge_event_batch`, `digest_window`, `marketplace_signal_cluster` |
| `anchor_entity_id` | UUID | Required | |
| `title` | String | Required | |
| `item_count` | Integer | >= 1 | |
| `unread_count` | Integer | >= 0 | |
| `latest_item_at` | Timestamp | Required | |
| `expires_at` | Timestamp | Nullable | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Nullable | |
| `updated_by` | UUID | Nullable | |
| `deleted_at` | Timestamp | Nullable | |

## 4.3.22.1 InboxItem

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `org_id` | UUID | Required | |
| `console` | Enum | buyer fixed | |
| `workspace_id` | UUID | Nullable | |
| `inbox_item_group_id` | UUID | Nullable | |
| `recipient_user_id` | UUID | Required | |
| `notification_item_type` | Enum | Appendix J `notification_item_type` | |
| `priority` | Enum | Appendix J `inbox_item_priority` | |
| `title` | String | Required | |
| `description` | String | Required | |
| `action_url` | String | Nullable | |
| `action_label` | String | Nullable | |
| `direct_mention` | Boolean | Required; default false | Drives Unread Marker.`has_unread_mention` for `thread_type = inbox_item_group` |
| `source_event_id` | UUID | Nullable | |
| `anchor_entity_type` | Enum | Appendix J `anchor_entity_type_enum` | |
| `anchor_entity_id` | UUID | Nullable | |
| `delivery_state` | Enum | Appendix J `notification_delivery_state` | |
| `read_at` | Timestamp | Nullable | |
| `dismissed_at` | Timestamp | Nullable | |
| `expires_at` | Timestamp | Nullable | |
| `created_at` | Timestamp | Required | |
| `updated_at` | Timestamp | Required | |
| `created_by` | UUID | Nullable | |
| `updated_by` | UUID | Nullable | |
| `deleted_at` | Timestamp | Nullable | |

Grouped items drive Unread Marker upserts through `(recipient_user_id, thread_type='inbox_item_group', thread_id=inbox_item_group_id)`.

## 20.2 Inbox Structure

The buyer Inbox surface is a projection over the canonical entities InboxItem (§4.3.22.1), Inbox Item Group (§4.3.22), and Unread Marker (§4.3.15). §20 MUST NOT introduce another notification-item JSON shape. It cites Appendix J `notification_item_type`, Appendix J `inbox_item_priority`, Appendix J `notification_delivery_state`, InboxItem.`direct_mention`, and §40.2.

## 32.10.3.B Buyer Inbox and Pulse Endpoints

Inbox query parameters use Appendix J `notification_item_type`, Appendix J `notification_delivery_state`, and Appendix J `inbox_item_priority`.

| Object | Fields |
| :---- | :---- |
| Inbox item | `item_id`, `workspace_id`, `org_id`, `notification_item_type`, `priority`, `title`, `description`, `action_url`, `action_label`, `delivery_state`, `read_at`, `dismissed_at`, `expires_at`, `created_at`, `updated_at` |

Inbox mutations update InboxItem and updates Unread Marker. Inbox list filters MUST reject values not registered in Appendix J.

## 40.2 Data Retention & Deletion

| Condition | Retention |
| :---- | :---- |
| Unread Marker | Purged under the parent thread policy. |
| InboxItem (§4.3.22.1) | Retained under the Inbox policy. |
| **Inbox Item Group (§4.3.22)** | Retained under the grouped Inbox policy. |

## Appendix J

#### `inbox_item_group_type_enum`

`thread_collapse`, `digest_rollup`, `cross_console_bundle`, `notification_digest`, `marketplace_signal_cluster`

#### `anchor_entity_type_enum`

`qa_thread`, `internal_comment_thread`, `workspace`, `bid_workspace`, `requirement`, `response`, `selection_report_draft`, `console_bridge_event_batch`, `digest_window`, `marketplace_signal_cluster`

#### `unread_marker_thread_type`

`internal_comment_thread`, `qa_thread`, `inbox_item_group`

InboxItem.`direct_mention`

#### `notification_expiry_class`

`sla_alert_24h_post_deadline`, `phase_transition_7d`, `scoring_activity_3d`, `qa_mention_until_thread_closed`, `persistent_until_dismissed`

#### `notification_item_type`

`phase_transition`, `sla_alert`, `qa_mention`, `amendment_notification`, `disagreement_escalation`, `workspace_invite`, `team_assignment`, `scoring_activity`, `response_activity`, `general_update`

#### `inbox_item_priority`

`high`, `medium`, `low`

#### `notification_delivery_state`

`visible`, `read`, `dismissed`, `expired`, `archived`

#### `unread_marker_suppressed_reason`

`muted`, `left_workspace`, `archived_thread`, `visibility_tightened`, `ops_impersonation_suppressed`

## M.5

| Gate ID | Source phase | Runtime status | Evidence source | Assertion | Failure action | Cross refs |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `inbox_item_entity_contract` | Phase 4.11 P1 | **`runtime_active`** (promoted; detector `tools/spec-lint/gates/inbox_item_entity_contract.ts`) | §20.2 + §4.3.22.1 + §4.3.22 + §4.3.15 + §40.2 + Appendix J. | Must block any raw Notification Item JSON schema and unresolved Inbox entity drift. | PR comment. | §20.2; §4.3.22.1; §4.3.22; §4.3.15; §40.2; Appendix J. |
