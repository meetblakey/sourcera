# Fixture

## 4.3.15 Unread Marker

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `thread_type` | Enum | `internal_comment_thread` \| `qa_thread` \| `inbox_item_group` | See Appendix J |

The `inbox_item_group` path derives from §29.1 Inbox Feed Schema.

## 4.3.22 Inbox Item Group

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `group_type` | Enum | Appendix J `inbox_item_group_type_enum` | `workspace_digest`, `seller_thread_digest`, `bid_activity_digest`, `system_bundle`, `ai_recommendation_bundle` |
| `anchor_entity_type` | Enum | Appendix J `anchor_entity_type_enum` | `evaluation_workspace`, `bid_workspace`, `target_account`, `seller_org`, `user`, `system` |

Relationships: Parent to Inbox Item (§2 / Phase 2 integration).

**Integration Deferral Note:** Phase 2 supersedes.

## 4.3.22.1 InboxItem

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | |
| `notification_item_type` | Enum | Appendix J `notification_item_type` | |
| `priority` | Enum | Appendix J `inbox_item_priority` | |
| `delivery_state` | Enum | Appendix J `notification_delivery_state` | |

## 20.2 Inbox Structure

Raw Notification Item JSON schema:

```json
{ "read": false, "type": "SLA_ALERT" }
```

## 32.10.3.B Buyer Inbox and Pulse Endpoints

No Appendix J filter contract.

## 40.2 Data Retention & Deletion

| Condition | Retention |
| :---- | :---- |
| Unread Marker | Present only. |

## Appendix J

#### `inbox_item_group_type_enum`

`workspace_digest`, `seller_thread_digest`

#### `anchor_entity_type_enum`

`evaluation_workspace`, `seller_org`

#### `notification_item_type`

`sla_alert`

#### `inbox_item_priority`

`high`

#### `notification_delivery_state`

`visible`

#### `notification_expiry_class`

`persistent_until_dismissed`

#### `unread_marker_suppressed_reason`

`muted`

## M.5

| Gate ID | Source phase | Runtime status | Evidence source | Assertion | Failure action | Cross refs |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `inbox_item_entity_contract` | Phase 4.11 P1 | `spec_binding_pending_pack_m02_3` | §20.2. | Missing. | PR comment. | §20.2. |
