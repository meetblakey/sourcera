# API Integration Downgrade Fixture

### 4.8.10 DowngradeExcessDataBucket (Org-Scoped, 90-Day Read-Only Preservation) {#4.8.10-downgradeexcessdatabucket}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `data_class` | Enum | See Appendix J `downgrade_excess_data_class`: `workspaces`, `requirements_over_cap`, `api_keys_over_cap`, `integration_endpoints_over_cap` | What's preserved |

### 34.5.3 Pre-Downgrade Validation (Performed at Customer Confirmation Click)

| Resource | Cap diff surfaced | Action available to customer in 14-day window |
|---|---|---|
| API keys over cap | Count over cap | Existing keys remain usable until revoked or archived, but new key creation, regeneration, and rotation are blocked until count is under cap; unresolved excess enters `DowngradeExcessDataBucket.data_class=api_keys_over_cap` |
| Integration endpoints over cap | Count over cap | Existing webhook / integration endpoints continue delivery while in preservation, but new endpoint registration and secret rotation are blocked until count is under cap; unresolved excess enters `DowngradeExcessDataBucket.data_class=integration_endpoints_over_cap` |

### 34.6.4 Entities Subject to Downgrade Enforcement

Per §4.8.10 `downgrade_excess_data_class` enum (Appendix J): `workspaces`, `requirements_over_cap`, `kb_entries_over_cap`, `vendors_over_cap`, `capability_declarations_over_cap`, `seller_software_over_cap`, `firecrawl_sources_over_cap`, `concurrent_bids_over_cap`, `seller_signals_over_cap`, `evaluations_over_cap`, `team_agent_instructions_over_cap`, `api_keys_over_cap`, `integration_endpoints_over_cap`.

`api_keys_over_cap` preserves API-key metadata, hash, prefix, scope, and revocation state.

`integration_endpoints_over_cap` preserves webhook / integration endpoint configuration, signing-secret metadata, delivery cursor, and failure-state rows.

### `downgrade_excess_data_class` (§4.8.10 DowngradeExcessDataBucket)

`workspaces`, `requirements_over_cap`, `kb_entries_over_cap`, `vendors_over_cap`, `capability_declarations_over_cap`, `seller_software_over_cap`, `firecrawl_sources_over_cap`, `concurrent_bids_over_cap`, `seller_signals_over_cap`, `evaluations_over_cap`, `team_agent_instructions_over_cap`, `api_keys_over_cap`, `integration_endpoints_over_cap`

`api_keys_over_cap` and `integration_endpoints_over_cap` preserve credentials and integration configuration read-only while blocking new creation, regeneration, re-registration, and rotation until the Org returns under cap.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `downgrade_api_integration_bucket_classes_registered` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/downgrade_api_integration_bucket_classes_registered.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §4.8.10 / §34.5.3 / §34.6.4 / Appendix J data-class coverage only; product cap counters, API-key serializers, webhook delivery behavior, credential rotation blocking, and deploy validators remain product-pack evidence) | pr_lint | Assertion. | M02.3 |
