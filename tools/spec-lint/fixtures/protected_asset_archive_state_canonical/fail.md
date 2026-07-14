# Protected Asset Archive Fixture

### 4.8.10 DowngradeExcessDataBucket (Org-Scoped, 90-Day Read-Only Preservation) {#4.8.10-downgradeexcessdatabucket}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `status` | Enum | See Appendix J `downgrade_excess_bucket_status`: `active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `restored` | |
| `archive_retention_horizon_years` | Integer | Nullable until archive; standard bucket = 7 | |

| From | To | Trigger | Conditions | Notes |
|---|---|---|---|---|
| `archive_pending` | `archived` | Cron archives all entities to cold storage | `archive_retention_horizon_years=7` | Standard bucket path |

### 34.6.3.A Class-1 Protected-Asset Carve-Out (Phase 7 V7 D-V7-009 Remediation, 2026-05-07) {#34.6.3.a-class-1-protected-asset-carve-out-phase-7-v7-d-v7-009-remediation-2026-05-07}

Class-1 assets use the standard archived path.

### 34.19.6 Failure Modes

Protected assets can enter `status=archived`.

### `downgrade_excess_bucket_status` (§4.8.10 DowngradeExcessDataBucket)

`active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `restored`

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `protected_asset_archive_state_canonical` | retention_privacy_invariant | spec_binding_pending_pack_m02_3 | deploy_validator + runtime_test | Assertion. | M02.3 |
