### 31.8.12 Contest SLA and Pricing Table Lifecycle Webhook Completeness Pack {#31.8.12-contest-sla-and-pricing-table-lifecycle-webhook-completeness-pack}

| Event | Trigger | Required data fields | Retry class | Appendix C / G binding |
| :---- | :---- | :---- | :---- | :---- |
| `billing.cost_base_recalc.margin_floor_breach` | CostBaseRecalculationLog row enters `pending_finance_approval` because `margin_floor_breach=true` | `cost_base_recalculation_log_id` | `standard` | Appendix C row; PostHog `billing_cost_base_recalc_margin_floor_breach` |
| `billing.finance.margin_floor_breach_hard` | Monthly finance close detects realized `rev_ai_wallet` blended margin below the hard floor | `finance_scorecard_id` | `financial_impact` | Appendix C row; PostHog `billing_finance_margin_floor_breach_hard`; Appendix F.2 |

4. Every CostBaseRecalculationLog `margin_floor_breach=true` path MUST emit `billing.cost_base_recalc.margin_floor_breach`; the unprefixed legacy alias `cost_base_recalc.margin_floor_breach` MUST NOT be emitted.
5. Every realized monthly `rev_ai_wallet` hard-floor miss MUST emit `billing.finance.margin_floor_breach_hard` and lock pricing-publish until Ops Finance clears the incident.
6. `billing.contest.sla_breach` and `billing.cost_base_recalc.margin_floor_breach` use the standard Appendix F retry curve.

### 50.12.13 Acceptance Criteria {#50.12.13-acceptance-criteria}

4. Rate-card moves that would breach the §34.18.1 `rev_ai_wallet` 88% hard floor MUST be blocked (HTTP 422, `pricing_admin_change_margin_floor_breach`); override requires senior-quorum + `ops_finance` dual sign-off under the §34.18 floor-asymmetry rule.

### v7.1.1 Billing Governance Webhook Completeness Events {#appendix-c-v711-billing-governance-webhook-completeness-events}

| Event | Trigger | Retry Curve |
| :---- | :---- | :---- |
| `billing.cost_base_recalc.margin_floor_breach` | Cost-base recalc detects a margin-floor breach | `standard` (F.1) |
| `billing.finance.margin_floor_breach_hard` | Monthly close detects realized `rev_ai_wallet` blended margin below the hard floor | `financial_impact` (F.2) |

### v7.1.1 Billing Governance Webhook Completeness Mirrors

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `billing_cost_base_recalc_margin_floor_breach` | Mirror of `billing.cost_base_recalc.margin_floor_breach` | `source_webhook_event_type` |
| `billing_finance_margin_floor_breach_hard` | Mirror of `billing.finance.margin_floor_breach_hard` | `source_webhook_event_type` |

- `billing.finance.margin_floor_breach_hard`

### M.5.46 v7.2.0-REM Phase CONS Pricing Core

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `margin_floor_breach_event_canonicality` | webhook_catalog_consistency | **runtime_active** | pr_lint | Cost-base recalc margin-floor breaches MUST emit `billing.cost_base_recalc.margin_floor_breach` with standard retry; realized monthly hard-floor misses MUST emit `billing.finance.margin_floor_breach_hard` with Appendix F.2 financial-impact retry; unprefixed legacy aliases or missing Appendix C/G/F registrations fail. Detector `tools/spec-lint/gates/margin_floor_breach_event_canonicality.ts`. | M02.3 |
