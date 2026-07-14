# Fixture

### 34.5.4 Solo Throttling-Pressure Upgrade CTA

| Console / Solo billing mode | Trigger source | Threshold | Target plan |
| :---- | :---- | :---- | :---- |
| Buyer Solo subscription | `solo.envelope.throttling_engaged` | >= 3 events in a rolling 30-day window per `(org_id, console=buyer)` | `business_starter` |
| Buyer Solo per-evaluation | `solo.envelope.exhausted` | First event in that evaluation | `business_starter` |
| Seller Solo subscription | `solo.envelope.throttling_engaged` | >= 3 events in a rolling 30-day window per `(org_id, console=seller)` | `seller_starter` |
| Seller Solo per-bid | `solo.envelope.exhausted` | First event in that bid | `seller_starter` |

The trigger writes `billing.solo_upgrade_cta.triggered` and PostHog `solo_upgrade_cta_triggered`. The CTA MUST NOT render inside the throttling toast. The payload MUST NOT include envelope values, costs, raw content, buyer identity, seller identity, or per-capability spend. `upgrade_completed.trigger = ai_budget_exhaustion`.

#### 44.6.5.A Sustained Throttling Upgrade-CTA Aggregation

Modes are `subscription_throttling_3_in_30d`, `per_eval_envelope_hit`, and `per_bid_envelope_hit`. Subscription uses the same >= 3 events in rolling 30-day rule. Per-evaluation and per-bid use the first `solo.envelope.exhausted` event. The no-toast upsell invariant applies.

Appendix C registers `billing.solo_upgrade_cta.triggered`. Appendix G registers `solo_upgrade_cta_triggered`. Appendix J `solo_upgrade_cta_trigger_mode` registers `subscription_throttling_3_in_30d`, `per_eval_envelope_hit`, `per_bid_envelope_hit`; `upgrade_completed_trigger` registers `solo_envelope_pressure`.

### M.5 catalog

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid` | cross_feature_invariant | `spec_binding_pending_pack_m02_3` | pr_lint + deploy_validator | Local guard `tools/spec-lint/gates/solo_upgrade_cta_threshold_3_events_30d_subscription_immediate_per_eval_bid.ts` and pass/fail fixtures verify source consistency; deployed aggregation, idempotency, and render evidence remains required. | M02.3 |
