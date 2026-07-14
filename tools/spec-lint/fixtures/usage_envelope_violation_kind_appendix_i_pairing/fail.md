### 51.2.5 Property Validator Contract {#51.2.5-property-validator-contract}

Validator contract:

| Check | Behavior on Violation |
| :---- | :---- |
| Required property missing | HTTP 422 `usage_event_envelope_violation` |
| Unknown property | HTTP 422 `usage_event_envelope_unknown_property` |

Canonical `usage_envelope_violation_kind` mapping:

| `usage_envelope_violation_kind` | Authorizing validator check | Appendix I error code | Required behavior |
| :---- | :---- | :---- | :---- |
| `missing_required` | Required property missing | `usage_event_envelope_violation` | Reject. |
| `enum_violation` | Unknown property and enum mismatch | `usage_event_envelope_unknown_property` | Reject. |
| `type_mismatch` | Property type mismatch | `usage_event_envelope_type_mismatch` | Reject. |
| `residency_mismatch` | Residency mismatch | `usage_event_residency_mismatch` | Reject. |
| `residency_partition_denial` | Cross-residency dashboard/read partition attempt | `usage_event_residency_mismatch` | Reject. |

## Appendix G Events

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `usage_analytics_envelope_violation` | Validator rejects an event | `violation_kind ∈ {missing_required, enum_violation, type_mismatch, residency_mismatch}` |

### §51 Product Usage Analytics Errors {#appendix-i-section-51-additions}

The old prose claims all codes pair with Appendix J.

| Code | HTTP | Used By | Notes | Localization Key |
| :---- | :---- | :---- | :---- | --- |
| `usage_event_envelope_violation` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=missing_required`. | `error.analytics.usage_event_envelope_violation` |
| `usage_event_envelope_unknown_property` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=enum_violation`. | `error.analytics.usage_event_envelope_unknown_property` |
| `usage_event_envelope_type_mismatch` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=type_mismatch`. | `error.analytics.usage_event_envelope_type_mismatch` |
| `usage_event_residency_mismatch` | 422 | §51.2.5 | Pairs with `usage_envelope_violation_kind=residency_mismatch` and `usage_envelope_violation_kind=residency_partition_denial`. | `error.ops.usage_event_residency_mismatch` |

#### `usage_envelope_violation_kind` (Appendix G `usage_analytics_envelope_violation.violation_kind`; drives Appendix I error codes)

`missing_required`, `enum_violation`, `type_mismatch`, `tenancy_mismatch`, `residency_mismatch`, `cardinality_exceeded`, `cross_console_leak`, `schema_version_unsupported`, `residency_partition_denial`, `capability_unresolved`, `dsar_redaction_failure`

#### M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `usage_envelope_violation_kind_appendix_i_pairing` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | Old prose authorizes this loosely. | M02.3 |
