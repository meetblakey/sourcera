# Fixture

### 4.3.18.A Usage Event Daily Aggregate (Org-Scoped, Per-Console, Per-Capability Daily Read Model) {#4.3.18.a-usage-event-daily-aggregate}

Daily aggregate read model derived from §4.3.18 Usage Event rows. Raw Usage Event remains the system of record; this entity exists to keep Usage Dashboard, AI Wallet, and Time-Saved reporting under the §44.5 performance envelope without scanning raw event history.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | Primary key | Auto-generated |
| `org_id` | UUID (FK) | Organization ID | Owning Org |
| `console` | Enum | `buyer` \| `seller` | Source console being aggregated |
| `usage_date_utc` | Date | Required; UTC day bucket | Date derived from Usage Event `created_at` in UTC |
| `capability_id` | UUID (FK) | Capability Declaration ID, nullable | Null when event is not capability-scoped |
| `event_category` | Enum | See Appendix J `usage_event_category` | Rollup dimension |
| `event_count` | BigInt | ≥ 0 | Number of raw Usage Event rows represented |
| `total_ai_value_cents` | BigInt | ≥ 0 | SUM of non-null Usage Event `ai_value_cents`; null values count as 0 |
| `failed_posthog_delivery_count` | Integer | ≥ 0 | Count of represented rows with `posthog_delivery_status=failed` |
| `source_event_high_watermark_at` | Timestamp | Required | Latest Usage Event `created_at` included in this aggregate row |
| `last_recomputed_at` | Timestamp | Required | Last incremental or full recompute timestamp |

**Indexes:**

- UNIQUE `(org_id, console, capability_id, event_category, usage_date_utc)` — one aggregate per rollup bucket.

**Scope Isolation:** Org-scoped and console-filtered.

**Retention:** Retained for Org-life as a non-PII aggregate. DSAR recomputation job MUST rederive affected buckets.

**Authoring Intent:** This read model closes the D-DEC-002 performance gap.

**Acceptance Criteria:**
1. Usage writes MUST enqueue an idempotent aggregate recompute.
2. Aggregate recompute MUST be deterministic from raw Usage Event rows and MUST not use PostHog as source of truth.
3. Aggregate rows MUST contain no PII-bearing fields.

| `usage_event_daily_aggregate_entity_contract` | data_model_contract | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/usage_event_daily_aggregate_entity_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | §4.3.18.A MUST define UsageEventDailyAggregate with field table, unique bucket key, scope isolation, retention/DSAR, indexes, authoring intent, and acceptance criteria whenever dashboard / wallet / Time-Saved query paths cite it. | M02.3 |
