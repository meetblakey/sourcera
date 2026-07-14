# Downgrade Status Fixture

### 4.8.10 DowngradeExcessDataBucket (Org-Scoped, 90-Day Read-Only Preservation) {#4.8.10-downgradeexcessdatabucket}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `status` | Enum | See Appendix J `downgrade_excess_bucket_status`: `active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `archived_class_1_protected`, `restored` | |

| From | To | Trigger | Conditions | Notes |
|---|---|---|---|---|
| `archive_pending` | `archived` | Cron archives non-Class-1 entities to cold storage | standard | |
| `archive_pending` | `archived_class_1_protected` | Cron archives Class-1 protected assets to cold storage | protected | |
| `archived_class_1_protected` | `restored` | Customer requests self-service restore OR Ops-assisted restore inside the §34.6.3.A window | eligible | |

### 34.5.1.A Buyer-Side Upgrade Carry-Over Set {#34.5.1.a-buyer-side-upgrade-carry-over-set}

Buyer table.

### 34.19.1.A Protected Asset Sub-Class Bridge {#34.19.1.a-protected-asset-sub-class-bridge}

Bridge table.

### 34.6.3.A Class-1 Protected-Asset Carve-Out

| Aspect | Standard | Class-1 |
|---|---|---|
| `status` | `archived` (§4.8.10 enum value) | `archived_class_1_protected` |

The `preservation_status=hard_archived` field name referenced in the prior §34.19.6 #2 wording is retired; the validator now asserts against the canonical §4.8.10 `status` enum membership.

### 34.19.6 Failure Modes

The prior wording "no asset in the 13-class list enters `preservation_status=hard_archived`" referenced a phantom field/value combination not present in §4.8.10's `status` enum; that wording is retired in favor of the canonical §4.8.10 enum membership check.

### `downgrade_excess_bucket_status` (§4.8.10 DowngradeExcessDataBucket)

`active_preservation`, `notice_sent_d60`, `notice_sent_d80`, `archive_pending`, `archived`, `archived_class_1_protected`, `restored`

State-machine authority lives in §4.8.10.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `downgrade_excess_bucket_status_enum_canonical` | enum_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/downgrade_excess_bucket_status_enum_canonical.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §4.8.10 / §34.6 / §34.19 / Appendix J status-enum coverage only; product downgrade cron, archive writes, protected-asset restore execution, and runtime firewall behavior remain product-pack evidence) | pr_lint | Assertion. | M02.3 |
