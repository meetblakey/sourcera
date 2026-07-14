# Protected Asset Purge Fixture

### 34.6.2 Customer Actions During the 90-Day Window {#34.6.2-customer-actions-during-the-90-day-window}

| Action | Behavior |
|---|---|
| **Hard-delete preserved entity** | Customer can choose to permanently delete any preserved entity inside the bucket. |

### 34.19.7 Acceptance Criteria

5. Protected-asset downgrade firewall MUST block Class-1 protected assets from entering the standard archive state.

### `downgrade_excess_bucket_status` (§4.8.10 DowngradeExcessDataBucket)

`active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `archived_class_1_protected`, `restored`

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `protected_asset_purge_guard` | privacy_safety_invariant | spec_binding_pending_pack_m02_3 | api_contract_test + deploy_validator | Assertion. | M02.3 |
