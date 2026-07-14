### 50.14.3 Growth PM Dashboard {#50.14.3-growth-pm-dashboard}

| Widget | Data Source | Purpose | Breach Alert |
|---|---|---|---|
| Retention D1/D7/D30 | PostHog retention model generated from the §51.0.2 Retention Cohorts registry | Cohort retention curves; this widget consumes §51.0.2 and does not define anchor or returning events inline | D7 retention < 30% |

### 51.0.2 Retention Cohorts {#51.0.2-retention-cohorts}

User retention is measured at three cadences (D1, D7, D30).

| Cohort Kind | Anchor Event | Returning Event | Targets (Paid Tier) | Targets (Solo / Free) |
|---|---|---|---|---|
| **Buyer Org D7** | `workspace_created` | `phase_advanced` | ≥ 60% | ≥ 40% |
| **Buyer Org D30** | Same | Same | ≥ 40% | ≥ 25% |
| **Seller Org D7** | `first_bid_submitted_at` | `bid_submitted` | ≥ 55% | ≥ 35% |
| **Seller Org D30** | Same | Same | ≥ 35% | ≥ 20% |

Cohort computation: PostHog Retention model with the anchor event as `start` and the returning event as `return`. The CI gate `retention_cohort_canonical_consumer` asserts no inline cohort definitions exist outside §51.0.2.

### 51.3.2 Data Model {#51.3.2-data-model-usagedashboardsnapshot}

| Field | Type | Notes |
|---|---|---|
| `retention_cohort_summary_json` | JSONB | Cached display projection generated only from §51.0.2 Retention Cohorts without redefining anchor or returning events |

### 51.3.3 Panels & KPIs {#51.3.3-panels-kpis}

The dashboard renders six top-level panels.

| Panel | Content | k-anon Floor | Data Source |
|---|---|---|---|
| 6 — Engagement & Retention | D1 / D7 / D30 retention curves from §51.0.2; panel consumes §51.0.2 and MUST NOT define anchor or returning events inline | k=10 | PostHog Retention model generated from §51.0.2 |

### 51.3.7 Acceptance Criteria {#51.3.7-acceptance-criteria-51-3}

11. Panel 6 Engagement & Retention MUST generate D1 / D7 / D30 rows only from §51.0.2 Retention Cohorts; tests assert no anchor-event, returning-event, or target-band definitions are authored outside §51.0.2.

### 51.5.6 Acceptance Criteria {#51.5.6-acceptance-criteria-51-5}

1. Seller parity dashboard surfaces ALL six Panel types of §51.3, including Engagement & Retention (generated only from §51.0.2 Retention Cohorts).

### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `retention_cohort_canonical_consumer` | content_consistency | runtime_active | post-build | tools/spec-lint/gates/retention_cohort_canonical_consumer.ts enforces §51.0.2 as the exhaustive retention-cohort registry; §50.14.3, §51.3, and §51.5 consume it | M02.3 |
