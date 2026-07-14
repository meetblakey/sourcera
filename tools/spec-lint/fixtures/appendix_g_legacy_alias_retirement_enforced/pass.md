# Fixture

## 51.8.5 Observability paging {#51.8.5-observability-paging}

| Signal | Route |
| :---- | :---- |
| `usage_analytics_alias_retirement_overdue` | Data on-call |

## Appendix G {#appendix-g}

**Alias-retirement enforcement.** At v7.1.0 and later, the six legacy alias names in the table below are historical schema references only. Production emitters MUST NOT emit them, PostHog dashboards MUST NOT consume them, and the outbox validator quarantines any late emission with `usage_analytics_alias_retirement_overdue` using the canonical replacement as `canonical_event_name`.

| Legacy alias | Canonical replacement | Timeline |
| :---- | :---- | :---- |
| `seller_onboarding_conversion_moment_recorded` | `seller_onboarding_conversion_moment_fired` | Legacy retired at v7.1.0 |
| `stake_reveal_displayed` | `stake_reveal_rendered` | Legacy retired at v7.1.0 |
| `stake_reveal_dismissed` | `stake_reveal_navigated_away` | Legacy retired at v7.1.0 |
| `hero_moment_first_pass_response_submitted` | `seller_onboarding_first_requirement_response` | Legacy retired at v7.1.0 |
| `seller_invite_pre_arrival_dispatched` | `seller_invite_pre_arrival_enrichment_started` | Legacy retired at v7.1.0 |
| `seller_invite_pre_arrival_failed` | `seller_invite_pre_arrival_enrichment_failed` | Legacy retired at v7.1.0 |

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `usage_analytics_alias_retirement_overdue` | Late alias emission | `retired_alias_name`, `canonical_event_name` |

## 51.3 Org-Level Usage Dashboard {#51.3-org-level-usage-dashboard}

Current dashboards consume canonical events only.

### M.5 catalog

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `appendix_g_legacy_alias_retirement_enforced` | deprecation_contract | `spec_binding_pending_pack_m02_3` | pr_lint + runtime_test | Local guard `tools/spec-lint/gates/appendix_g_legacy_alias_retirement_enforced.ts` and fixtures are present; runtime emitter and dashboard-query evidence remains required. | M02.3 |
