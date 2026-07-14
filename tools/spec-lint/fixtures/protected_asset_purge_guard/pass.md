# Protected Asset Purge Fixture

### 34.6.2 Customer Actions During the 90-Day Window {#34.6.2-customer-actions-during-the-90-day-window}

| Action | Behavior |
|---|---|
| **Hard-delete preserved entity** | Customer can choose to permanently delete a non-Class-1 preserved entity inside the bucket; this is irreversible and audit-logged with `org.preserved_entity_purged`. Class-1 protected assets reject customer-initiated purge with HTTP 422 `protected_asset_purge_forbidden`; legal / DSAR purge paths remain governed by §6.8 / §40.2 and require Ops + Legal audit evidence, not customer acknowledgement. |

### 34.19.7 Acceptance Criteria

5. Protected-asset downgrade firewall MUST block Class-1 protected assets from entering the standard `status=archived` terminal in a DowngradeExcessDataBucket; deploy-time validator asserts they enter `status=archived_class_1_protected` with §34.6.3.A retention metadata, and that customer-initiated purge returns `protected_asset_purge_forbidden`.

### 34.20.16 Pricing Quality Gates

80. The protected-asset downgrade firewall MUST reject any Class-1 protected asset bucket whose §4.8.10 `status` enters the standard `archived` state instead of `archived_class_1_protected`; deploy-time validator asserts `archive_retention_horizon_years`, `self_service_restore_until`, and the `protected_asset_purge_forbidden` customer-purge rejection path.

### Appendix I Billing Errors

| Error Code | HTTP | Surface | Meaning | Localization Key |
|---|---|---|---|---|
| `protected_asset_purge_forbidden` | 422 | §32.8 billing endpoint family | §34.6.2 customer attempted to hard-delete a Class-1 protected asset inside a DowngradeExcessDataBucket; legal / DSAR purge paths must use §6.8 / §40.2 Ops + Legal audit workflow instead. | `error.billing.protected_asset_purge_forbidden` |

### Class-1 Protected-Asset Carve-Out

Customer self-serve purge is rejected with `protected_asset_purge_forbidden`; legal / DSAR purge follows §6.8 / §40.2.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `protected_asset_purge_guard` | cross_feature_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/protected_asset_purge_guard.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §34.6.2 / §34.19.7 / §34.20.16 / Appendix I purge-forbidden contract only; product billing endpoint implementation, customer action handler, legal / DSAR purge workflow, and deploy validators remain product-pack evidence) | pr_lint | Assertion. | M02.3 |
