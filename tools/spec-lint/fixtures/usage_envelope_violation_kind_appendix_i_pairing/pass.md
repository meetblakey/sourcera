### 51.2.5 Property Validator Contract {#51.2.5-property-validator-contract}

Validator contract:

| Check | Behavior on Violation |
| :---- | :---- |
| Required property missing | HTTP 422 `usage_event_envelope_violation` |
| Unknown property (not in Appendix G + §51.2 superset) | HTTP 422 `usage_event_envelope_unknown_property`; emit meta-event; reject insert |
| Property type mismatch | HTTP 422 `usage_event_envelope_type_mismatch` |
| Property value outside enum | HTTP 422 `usage_event_envelope_enum_violation` |
| `capability_id` does not resolve to a CapabilityRegistryEntry | HTTP 422 `usage_event_capability_unresolved` |
| `data_residency_region` mismatch vs. org's canonical region | HTTP 422 `usage_event_residency_mismatch` |
| DSAR-redacted `user_id` dispatched as raw value | HTTP 500 `usage_event_dsar_redaction_failure` |
| `org_id` does not match the inserting Convex tenant context | HTTP 422 `usage_event_envelope_tenancy_mismatch` |
| Person-property cardinality exceeded for the event family | HTTP 422 `usage_event_envelope_cardinality_exceeded` |
| `console` field disagrees with firewall scope | HTTP 422 `usage_event_envelope_cross_console_leak` |
| `schema_version` envelope property points to a retired or unsupported version | HTTP 422 `usage_event_envelope_schema_version_unsupported` |

Canonical `usage_envelope_violation_kind` mapping:

| `usage_envelope_violation_kind` | Authorizing validator check | Appendix I error code | Required behavior |
| :---- | :---- | :---- | :---- |
| `missing_required` | Required property missing | `usage_event_envelope_violation` | Emit `usage_analytics_envelope_violation`; reject insert at Convex; quarantine to `usage_event_envelope_dlq` at outbox. |
| `enum_violation` | Property value outside enum | `usage_event_envelope_enum_violation` | Emit `usage_analytics_envelope_violation`; reject insert; name the Appendix J registry anchor. |
| `type_mismatch` | Property type mismatch | `usage_event_envelope_type_mismatch` | Emit `usage_analytics_envelope_violation`; reject insert; name declared and observed types. |
| `tenancy_mismatch` | `org_id` does not match the inserting Convex tenant context | `usage_event_envelope_tenancy_mismatch` | Emit `usage_analytics_envelope_violation`; reject insert; route to tenant-isolation audit. |
| `residency_mismatch` | `data_residency_region` mismatch vs. org's canonical region | `usage_event_residency_mismatch` | Emit `usage_analytics_envelope_violation`; reject insert; page Ops observability. |
| `cardinality_exceeded` | Person-property cardinality exceeded for the event family | `usage_event_envelope_cardinality_exceeded` | Emit `usage_analytics_envelope_violation`; reject insert; quarantine to outbox. |
| `cross_console_leak` | `console` field disagrees with firewall scope | `usage_event_envelope_cross_console_leak` | Emit `usage_analytics_envelope_violation`; reject insert; route to Security on-call audit. |
| `schema_version_unsupported` | `schema_version` points to a retired or unsupported version | `usage_event_envelope_schema_version_unsupported` | Emit `usage_analytics_envelope_violation`; reject insert; quarantine to outbox. |
| `residency_partition_denial` | Cross-residency dashboard/read partition attempt | `usage_event_residency_partition_denial` | Emit `usage_analytics_envelope_violation`; deny the read/render path; no dashboard data renders. |
| `capability_unresolved` | `capability_id` does not resolve to a CapabilityRegistryEntry | `usage_event_capability_unresolved` | Emit `usage_analytics_envelope_violation`; block for `mutation=true`; warn-and-emit for reads during allowed deployment window. |
| `dsar_redaction_failure` | DSAR-redacted `user_id` dispatched as raw value | `usage_event_dsar_redaction_failure` | Emit `usage_analytics_envelope_violation`; page Security on-call; remediate inside the §6.8 DSAR SLA. |

Unknown-property violations are intentionally outside the `usage_envelope_violation_kind` closed set: they use `usage_event_envelope_unknown_property`, emit the same meta-event, reject insert, and name the canonical property registry gap without consuming one of the 11 enum values.

## Appendix G Events

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `usage_analytics_envelope_violation` | PostHog outbox validator rejects an event | `violation_kind ∈ {missing_required, enum_violation, type_mismatch, tenancy_mismatch, residency_mismatch, cardinality_exceeded, cross_console_leak, schema_version_unsupported, residency_partition_denial, capability_unresolved, dsar_redaction_failure}` |

### §51 Product Usage Analytics Errors {#appendix-i-section-51-additions}

The 11 enum-bounded rejection causes pair 1:1 with Appendix J `usage_envelope_violation_kind` per the §51.2.5 canonical mapping table. `usage_event_envelope_unknown_property` is a distinct shape error.

| Code | HTTP | Used By | Notes | Localization Key |
| :---- | :---- | :---- | :---- | --- |
| `usage_event_envelope_violation` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=missing_required`. | `error.analytics.usage_event_envelope_violation` |
| `usage_event_envelope_unknown_property` | 422 | §51.2.5 | Not a `usage_envelope_violation_kind` value; emitted as a distinct envelope shape error outside the closed 11-cause pairing. | `error.analytics.usage_event_envelope_unknown_property` |
| `usage_event_envelope_type_mismatch` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=type_mismatch`. | `error.analytics.usage_event_envelope_type_mismatch` |
| `usage_event_envelope_enum_violation` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=enum_violation`. | `error.analytics.usage_event_envelope_enum_violation` |
| `usage_event_capability_unresolved` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=capability_unresolved`. | `error.agent.usage_event_capability_unresolved` |
| `usage_event_residency_mismatch` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=residency_mismatch`. | `error.ops.usage_event_residency_mismatch` |
| `usage_event_residency_partition_denial` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=residency_partition_denial`. | `error.ops.usage_event_residency_partition_denial` |
| `usage_event_dsar_redaction_failure` | 500 | §51.7.3 | Pairs with `usage_envelope_violation_kind=dsar_redaction_failure`. | `error.privacy.usage_event_dsar_redaction_failure` |

- `usage_event_envelope_tenancy_mismatch` — Pairs with `usage_envelope_violation_kind=tenancy_mismatch`.
- `usage_event_envelope_cardinality_exceeded` — Pairs with `usage_envelope_violation_kind=cardinality_exceeded`.
- `usage_event_envelope_cross_console_leak` — Pairs with `usage_envelope_violation_kind=cross_console_leak`.
- `usage_event_envelope_schema_version_unsupported` — Pairs with `usage_envelope_violation_kind=schema_version_unsupported`.

#### `usage_envelope_violation_kind` (Appendix G `usage_analytics_envelope_violation.violation_kind`; drives Appendix I error codes)

`missing_required`, `enum_violation`, `type_mismatch`, `tenancy_mismatch`, `residency_mismatch`, `cardinality_exceeded`, `cross_console_leak`, `schema_version_unsupported`, `residency_partition_denial`, `capability_unresolved`, `dsar_redaction_failure`

**Notes.** Canonical closed set of 11 envelope-validator rejection causes. Each value pairs 1:1 with a distinct Appendix I error code through the §51.2.5 canonical mapping table. `usage_event_envelope_unknown_property` is a distinct unknown-shape error and is not a `usage_envelope_violation_kind` value. Deploy-time CI gate `usage_envelope_violation_kind_appendix_i_pairing` asserts the pairing.

#### M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `usage_envelope_violation_kind_appendix_i_pairing` | content_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/usage_envelope_violation_kind_appendix_i_pairing.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | §51.2.5 canonical 11-cause mapping authorizes the 11-value Appendix J enum; every value has one distinct Appendix I error code; `usage_event_envelope_unknown_property` remains outside the closed enum pairing — closes D-51-009 | M02.3 |
