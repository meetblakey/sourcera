# Fixture

### 4.3.18.A Usage Event Daily Aggregate (Org-Scoped, Per-Console, Per-Capability Daily Read Model) {#4.3.18.a-usage-event-daily-aggregate}

Daily aggregate read model.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto-generated |

**Indexes:**

- `(org_id, usage_date_utc)`.

**Scope Isolation:** Org-scoped.

**Acceptance Criteria:**
1. Aggregate exists.

| `usage_event_daily_aggregate_entity_contract` | data_model_contract | spec_binding_pending_pack_m02_3 | pr_lint | §4.3.18.A MUST define UsageEventDailyAggregate. | M02.3 |
