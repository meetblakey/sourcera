# API Integration Downgrade Fixture

### 4.8.10 DowngradeExcessDataBucket (Org-Scoped, 90-Day Read-Only Preservation) {#4.8.10-downgradeexcessdatabucket}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `data_class` | Enum | See Appendix J `downgrade_excess_data_class`: `workspaces`, `requirements_over_cap`, `api_keys_over_cap` | What's preserved |

### 34.5.3 Pre-Downgrade Validation (Performed at Customer Confirmation Click)

| Resource | Cap diff surfaced | Action available to customer in 14-day window |
|---|---|---|
| API keys over cap | Count over cap | Existing keys remain usable until revoked or archived, but new key creation, regeneration, and rotation are blocked until count is under cap; unresolved excess enters `DowngradeExcessDataBucket.data_class=api_keys_over_cap` |

### 34.6.4 Entities Subject to Downgrade Enforcement

Per §4.8.10 `downgrade_excess_data_class` enum (Appendix J): `workspaces`, `requirements_over_cap`, `api_keys_over_cap`.

### `downgrade_excess_data_class` (§4.8.10 DowngradeExcessDataBucket)

`workspaces`, `requirements_over_cap`, `api_keys_over_cap`

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `downgrade_api_integration_bucket_classes_registered` | plan_gating_invariant | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Assertion. | M02.3 |
