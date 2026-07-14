# Protected Asset Archive Fixture

### 4.8.10 DowngradeExcessDataBucket (Org-Scoped, 90-Day Read-Only Preservation) {#4.8.10-downgradeexcessdatabucket}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `status` | Enum | See Appendix J `downgrade_excess_bucket_status`: `active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `archived_class_1_protected`, `restored` | |
| `archive_retention_horizon_years` | Integer | Nullable until archive; standard bucket = 7; Class-1 protected bucket = 10 | Retention metadata asserted by `protected_asset_downgrade_firewall`; values are sourced from §34.6.3 / §34.6.3.A |
| `self_service_restore_until` | Timestamp | Nullable | Populated only for `status=archived_class_1_protected`; computed from §34.6.3.A customer-initiated restoration window |

| From | To | Trigger | Conditions | Notes |
|---|---|---|---|---|
| `archive_pending` | `archived` | Cron archives non-Class-1 entities to cold storage | `archive_storage_ref` set; `archive_retention_horizon_years=7`; entities hard-deleted from hot storage; metadata preserved | Standard bucket path |
| `archive_pending` | `archived_class_1_protected` | Cron archives Class-1 protected assets to cold storage | `data_class=kb_entries_over_cap`; `archive_storage_ref` set; `archive_retention_horizon_years=10`; `self_service_restore_until` set per §34.6.3.A | Class-1 carve-out; NOT the standard `archived` terminal |
| `archived_class_1_protected` | `restored` | Customer requests self-service restore OR Ops-assisted restore inside the §34.6.3.A window | Cold-storage rehydration; SLA: 24 hours; `restored_at` stamped; class-retention metadata retained for audit | Customer-initiated restoration remains available until `self_service_restore_until` |

### 34.6.3.A Class-1 Protected-Asset Carve-Out (Phase 7 V7 D-V7-009 Remediation, 2026-05-07) {#34.6.3.a-class-1-protected-asset-carve-out-phase-7-v7-d-v7-009-remediation-2026-05-07}

| Aspect | Standard (non-Class-1) | Class-1 Protected Assets |
|---|---|---|
| Cold-storage retention | 7 years (§4.8.10 AC #5) | 10 years |
| Customer-initiated restoration window | 0 days post-archive (Ops-assisted only) | 5 years post-archive (self-service via Settings → Billing → "Restore preserved data") |
| `status` | `archived` (§4.8.10 enum value) | `archived_class_1_protected` (Phase 7 V7 D-V7-009 — value added to §4.8.10 `status` enum + Appendix J `downgrade_excess_bucket_status`) |

The `protected_asset_downgrade_firewall` deploy-time validator (§34.20.16 AC #80) is updated to assert that Class-1 assets enter `status=archived_class_1_protected` (NOT `status=archived`) and that the cold-storage retention metadata (`archive_retention_horizon_years`) is set to 10 (NOT 7).

### 34.19.6 Failure Modes

Deploy-time validator `protected_asset_downgrade_firewall` asserts that every Class-1 asset in any DowngradeExcessDataBucket carries `status=archived_class_1_protected` (not `status=archived`) AND `archive_retention_horizon_years=10` (not 7).

### `downgrade_excess_bucket_status` (§4.8.10 DowngradeExcessDataBucket)

`active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `archived_class_1_protected`, `restored`

**Semantics.** State-machine authority lives in §4.8.10. `archived_class_1_protected` is the Class-1 Protected-Asset Carve-Out terminal for protected KB-entry buckets at `preservation_until`; it is distinct from the standard `archived` state and carries `archive_retention_horizon_years` plus `self_service_restore_until` metadata per §34.6.3.A.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `protected_asset_archive_state_canonical` | cross_feature_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/protected_asset_archive_state_canonical.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §4.8.10 / §34.6.3.A / §34.19 / Appendix J archive-state contract only; product archive cron, cold-storage writes, restore execution, and deploy validators remain product-pack evidence) | pr_lint | Assertion. | M02.3 |
