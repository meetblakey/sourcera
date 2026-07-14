# Fixture

### 27.11.8 Acceptance Criteria

30. **Webhook idempotency.** Settlement webhooks fire under retry.

### 34.16.7 Webhooks and API Surfaces

**Catalog (18 events).**

| Event | Payload Shape | Trigger | Retry Class | User-Visible | Severity | Loops.so Template | PostHog Parallel |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `promoted_listing.auction_settled` | `{event_id, event_type, auction_id, winners[], paid_cents}` | settlement job | standard | Yes (all bidders + winners) | info | `tpl_promoted_won` | `promoted_listing_auction_settled` |
| `promoted_listing.auction_lost` | `{event_id, event_type, auction_id, recipient_org_id, winner_org_id, winner_paid_cents, winner_promoted_listing_id, paid_cents}` | settlement job | standard | Yes (non-winning bidder Org only) | info | `tpl_promoted_not_selected` | `promoted_listing_auction_lost` |

**Audience privacy.** Customer-visible marketplace-discovery webhooks may include winner rows.

### 34.16.8 Acceptance Criteria

11. Marketplace Discovery webhooks emit settlement outcomes.

**Marketplace-Discovery-Domain additions (§27.11.7 + §27.11.2 — D-6.2-003 / D-6.2-019).**

| Event Kind | Trigger | Recipient | Channel | Cadence | Payload | Retry Curve |
|---|---|---|---|---|---|---|
| `promoted_listing.auction_settled` | Weekly Promoted Listing settlement selects winners | All bidders | Webhook | Monday 03:00 UTC settlement | `{event_id, winners[], winner_org_id, paid_cents}` | `standard` (F.1) |
| `promoted_listing.auction_lost` | Weekly Promoted Listing settlement does not select this seller | Non-winning bidder Seller Org only | Webhook | Monday 03:00 UTC settlement | `{event_id, winner_org_id, winner_paid_cents, winner_promoted_listing_id, paid_cents}` | `standard` (F.1) |

These rows register the §34.16.7 marketplace-discovery PostHog parallel events.

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `promoted_listing_auction_settled` | Mirror of `promoted_listing.auction_settled` | `source_webhook_event_type`, `winners[]`, `paid_cents` |
| `promoted_listing_auction_lost` | Mirror of `promoted_listing.auction_lost` | `source_webhook_event_type`, `winner_org_id`, `winner_paid_cents`, `winner_promoted_listing_id`, `paid_cents` |

#### M.5.20 v7.2.0-REM P1 webhook payload privacy additions (D-MD-005 closure) {#m-5-20-v72rem-p1-webhook-payload-privacy-additions}

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `webhook_payload_k_anonymity_floor` | cross_feature_invariant | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Customer-visible settlement payloads expose winners. | `not_permitted_console_firewall` | `runbooks.sourcera.com/ci-gates/webhook_payload_k_anonymity_floor` | M02.3 |
