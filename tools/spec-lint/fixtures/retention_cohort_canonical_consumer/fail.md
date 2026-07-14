### 50.14.3 Growth PM Dashboard {#50.14.3-growth-pm-dashboard}

| Widget | Data Source | Purpose | Breach Alert |
|---|---|---|---|
| Retention D1/D7/D30 | PostHog retention model | Cohort retention curves | D7 retention < 30% |

### 51.0.2 Retention Cohorts {#51.0.2-retention-cohorts}

User retention is measured at three cadences (D1, D7, D30).

| Cohort Kind | Anchor Event | Returning Event | Targets (Paid Tier) | Targets (Solo / Free) |
|---|---|---|---|---|
| **Buyer Org D7** | `workspace_created` | `phase_advanced` | ≥ 60% | ≥ 40% |

Cohort computation: PostHog Retention model with the anchor event as `start` and the returning event as `return`. The CI gate `retention_cohort_canonical_consumer` asserts no inline cohort definitions exist outside §51.0.2.

### 51.3.2 Data Model {#51.3.2-data-model-usagedashboardsnapshot}

No retention field.

### 51.3.3 Panels & KPIs {#51.3.3-panels-kpis}

The dashboard renders five top-level panels.

| Panel | Content | k-anon Floor | Data Source |
|---|---|---|---|
| 5 — Trend | D1 / D7 / D30 retention curves. The anchor event is `workspace_created`; the returning-user event is `phase_advanced`. | k=10 | PostHog |

### 51.3.7 Acceptance Criteria {#51.3.7-acceptance-criteria-51-3}

10. Dashboard emits an event.

### 51.5.6 Acceptance Criteria {#51.5.6-acceptance-criteria-51-5}

1. Seller parity dashboard surfaces ALL five Panel types of §51.3.

### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `retention_cohort_canonical_consumer` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | no inline definitions | M02.3 |
