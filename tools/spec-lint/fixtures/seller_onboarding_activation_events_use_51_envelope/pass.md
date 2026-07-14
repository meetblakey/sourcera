### 49.1.7.A Residual Contracts: Solo, Recovery, Instrumentation, and Provider Failure {#49.1.7.a-residual-contracts-solo-recovery-instrumentation-and-provider-failure}

**Activation event envelope binding.** `seller_onboarding_stage_entered`, `seller_onboarding_first_requirement_response` / documentation alias `seller_first_requirement_response`, `seller_onboarding_first_bid_submitted` / documentation alias `seller_first_bid_submitted`, `hero_moment_completed`, and `seller_onboarding_completed` MUST:

1. Declare `event_family='marketplace'` per §51.1.1.
2. Carry every §51.2.1 Required Standard Property, including `event_id`, `usage_event_id`, `name`, `event_family`, `emitted_at`, `org_id`, `console`, `workspace_id`, `user_id`, `phase`, `entity_ref`, `capability_id`, `plan_tier`, `data_residency_region`, `session_id`, and `schema_version`.
3. Pass the §51.2.5 `UsageEventValidator` at Convex insert and PostHog outbox dispatch.

47. `seller_onboarding_activation_events_use_51_envelope`: malformed emissions reject with Appendix I `usage_event_envelope_violation`.

### 51.2.1 Required Standard Property Set {#51.2.1-required-standard-property-set}

| Property | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `event_id` | UUID | NOT NULL | |
| `usage_event_id` | UUID | NOT NULL | |
| `name` | string | NOT NULL | |
| `event_family` | enum | NOT NULL | |
| `emitted_at` | timestamp | NOT NULL | |
| `org_id` | UUID | NOT NULL | |
| `console` | enum | NOT NULL | |
| `workspace_id` | UUID | nullable | |
| `user_id` | UUID | nullable | |
| `phase` | enum | nullable | |
| `entity_ref` | JSONB | nullable | |
| `capability_id` | string | nullable | |
| `plan_tier` | enum | NOT NULL | |
| `data_residency_region` | enum | NOT NULL | |
| `session_id` | UUID | nullable | |
| `schema_version` | semver | NOT NULL | |

### 51.2.5 Property Validator Contract {#51.2.5-property-validator-contract}

The `UsageEventValidator` runs at two boundaries. Required property missing produces HTTP 422 `usage_event_envelope_violation`, reject insert at Convex, and quarantine to `usage_event_envelope_dlq`.

| `usage_event_envelope_violation` | 422 | §51.2.5 `UsageEventValidator` | Appendix G preamble required property set | `error.analytics.usage_event_envelope_violation` |

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
|---|---|---|---|---|---|
| `seller_onboarding_activation_events_use_51_envelope` | catalog_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/seller_onboarding_activation_events_use_51_envelope.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | pass | M02.3 |
