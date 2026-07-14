# Downgrade Status Fixture

### 4.8.10 DowngradeExcessDataBucket (Org-Scoped, 90-Day Read-Only Preservation) {#4.8.10-downgradeexcessdatabucket}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `status` | Enum | See Appendix J `downgrade_excess_bucket_status`: `active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `restored` | |

Active contract still uses `preservation_status=hard_archived`.

### 34.5.1.A Buyer-Side Upgrade Carry-Over Set {#34.5.1.a-buyer-side-upgrade-carry-over-set}

Buyer table.

### 34.19.1.A Protected Asset Sub-Class Bridge {#34.19.1.a-protected-asset-sub-class-bridge}

Bridge table.

### `downgrade_excess_bucket_status` (§4.8.10 DowngradeExcessDataBucket)

`active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `restored`

State-machine authority lives in §4.8.10.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `downgrade_excess_bucket_status_enum_canonical` | enum_catalog_invariant | spec_binding_pending_pack_m02_3 | pr_lint | Assertion. | M02.3 |
