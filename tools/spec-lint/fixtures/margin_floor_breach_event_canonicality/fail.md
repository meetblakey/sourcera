### 31.8.12 Contest SLA and Pricing Table Lifecycle Webhook Completeness Pack {#31.8.12-contest-sla-and-pricing-table-lifecycle-webhook-completeness-pack}

| Event | Trigger | Required data fields | Retry class | Appendix C / G binding |
| :---- | :---- | :---- | :---- | :---- |
| `cost_base_recalc.margin_floor_breach` | CostBaseRecalculationLog row breaches floor | `cost_base_recalculation_log_id` | `standard` | Appendix C row |

4. Every CostBaseRecalculationLog `margin_floor_breach=true` path may emit `cost_base_recalc.margin_floor_breach`.

### 50.12.13 Acceptance Criteria {#50.12.13-acceptance-criteria}

4. Rate-card moves breaching the `min_margin_floor_pct` (default 25%) MUST be blocked.

### v7.1.1 Billing Governance Webhook Completeness Events {#appendix-c-v711-billing-governance-webhook-completeness-events}

| Event | Trigger | Retry Curve |
| :---- | :---- | :---- |
| `cost_base_recalc.margin_floor_breach` | Cost-base recalc detects a margin-floor breach | `standard` |

### v7.1.1 Billing Governance Webhook Completeness Mirrors

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `billing_cost_base_recalc_margin_floor_breach` | Mirror of `cost_base_recalc.margin_floor_breach` | `source_webhook_event_type` |

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `margin_floor_breach_event_canonicality` | webhook_catalog_consistency | spec_binding_pending_pack_m02_3 | pr_lint | Event aliases checked. | M02.3 |
