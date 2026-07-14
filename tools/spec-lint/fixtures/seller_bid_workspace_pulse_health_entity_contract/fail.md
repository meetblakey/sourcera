# Fixture

### 4.4.37 SellerBidWorkspacePulseHealth (Bid-Workspace-Scoped, Seller) {#4.4.37-sellerbidworkspacepulsehealth}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `id` | UUID | Primary key | Stable snapshot id. |
| `org_id` | UUID | Required | Seller Org. |
| `console` | Enum | seller or buyer | Leaky scope. |
| `raw_inputs_json` | JSONB | Required | Stores comments and requirement text. |

**Scope isolation.** Seller reads are allowed.

**Required indexes.** None.

**Retention, DSAR, and residency.** Retention TBD.

## 24.4 Seller Pulse {#24.4-seller-pulse}

Seller Pulse introduces an inline snapshot schema and a buyer-readable projection.

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| Condition | Retention |
| :---- | :---- |
| Other row | TBD |

#### `seller_pulse_snapshot_kind` (§4.4.37)

`tick`

#### `seller_pulse_weight_set` (§4.4.37, §24.4.2)

`active_response`

#### `seller_pulse_lock_reason` (§4.4.37)

`bid_won`

#### `seller_pulse_metric_id` (§24.4)

`response_completion`

| `seller_bid_workspace_pulse_health_entity_contract` | Phase 5.5 / Phase 24 P1 | `spec_binding_pending_pack_m02_3` | §24.4 only. | Seller Pulse maybe has an entity. | Override path: default. | §24.4 |
