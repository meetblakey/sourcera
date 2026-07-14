# Fixture

### 27.11.8 Acceptance Criteria

30. **Webhook idempotency and audience privacy — settlement no-duplicates.** `promoted_listing.auction_settled` and `promoted_listing.auction_lost` fire at most once per `(auction_id, recipient_org_id, event_type)` tuple even under settlement-job retry; every participating bidder Org receives exactly one terminal outcome event; loser payloads include no winner identity, winner paid amount, or winner-owned `promoted_listing_id`; QA tests `promoted_listing_settlement_idempotency` and `promoted_listing_auction_webhook_audience_privacy` assert.

### 34.16.7 Webhooks and API Surfaces

**Catalog (18 events).**

| Event | Payload Shape | Trigger | Retry Class | User-Visible | Severity | Loops.so Template | PostHog Parallel |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `promoted_listing.auction_settled` | `{event_id, event_type, occurred_at, category_id, auction_id, settled_at, recipient_org_id, winner: {org_id: <recipient_org_id>, paid_cents, rank, promoted_listing_id}, total_winners, unfilled_slots, reserve_price_cents}` | Monday 03:00 UTC settlement job | standard | Yes (winning Org only; self row only) | info | `tpl_promoted_won` | `promoted_listing_auction_settled` |
| `promoted_listing.auction_lost` | `{event_id, event_type, occurred_at, category_id, auction_id, settled_at, recipient_org_id, promoted_listing_id, result: "not_selected", slot_fill_state ∈ {all_slots_filled, partially_filled, no_winners}, bidder_count_bucket ∈ {below_k, k_or_above}, reserve_price_cents}` | Monday 03:00 UTC settlement job | standard | Yes (non-winning bidder Org only) | info | `tpl_promoted_not_selected` | `promoted_listing_auction_lost` |

**Audience privacy.** Customer-visible marketplace-discovery webhooks MUST satisfy one of three payload-audience rules: (1) recipient-owned row only; (2) k-anonymized aggregate with an explicit k=5 floor per §34.16.1 / §27.11.2; or (3) Ops-only. `promoted_listing.auction_settled` is recipient-owned only and MUST NOT include a multi-winner array. `promoted_listing.auction_lost` MUST NOT include winner `org_id`, winner `paid_cents`, or any winner-owned `promoted_listing_id`.

### 34.16.8 Acceptance Criteria

11. Marketplace Discovery webhook payloads MUST enforce recipient self-only or k=5 aggregate disclosure. `promoted_listing.auction_settled` emits one recipient-owned winner row to each winner; non-winners receive `promoted_listing.auction_lost` with no winner identity, winner paid amount, or winner-owned `promoted_listing_id`; QA test `promoted_listing_auction_webhook_audience_privacy` and deploy-time validator `webhook_payload_k_anonymity_floor` assert.

**Marketplace-Discovery-Domain additions (§27.11.7 + §27.11.2 — D-6.2-003 / D-6.2-019).**

| Event Kind | Trigger | Recipient | Channel | Cadence | Payload | Retry Curve |
|---|---|---|---|---|---|---|
| `promoted_listing.auction_settled` | Weekly Promoted Listing settlement selects this seller as a winner | Winning Seller Org only; self row only | Webhook | Monday 03:00 UTC settlement | `{event_id, event_type, occurred_at, category_id, auction_id, settled_at, recipient_org_id, winner: {org_id: <recipient_org_id>, paid_cents, rank, promoted_listing_id}, total_winners, unfilled_slots, reserve_price_cents}` | `standard` (F.1) |
| `promoted_listing.auction_lost` | Weekly Promoted Listing settlement does not select this seller | Non-winning bidder Seller Org only | Webhook | Monday 03:00 UTC settlement | `{event_id, event_type, occurred_at, category_id, auction_id, settled_at, recipient_org_id, promoted_listing_id, result: "not_selected", slot_fill_state ∈ {all_slots_filled, partially_filled, no_winners}, bidder_count_bucket ∈ {below_k, k_or_above}, reserve_price_cents}` | `standard` (F.1) |

These rows register the §34.16.7 marketplace-discovery PostHog parallel events. Customer-visible webhook payloads MUST obey the §34.16.7 audience-privacy rules; PostHog mirrors MUST NOT add competitor-owned settlement identity beyond the recipient-owned source payload.

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `promoted_listing_auction_settled` | Mirror of `promoted_listing.auction_settled` | `source_webhook_event_type`, `category_id`, `auction_id`, `settled_at`, `recipient_org_id`, `promoted_listing_id`, `paid_cents`, `rank`, `total_winners`, `unfilled_slots`, `reserve_price_cents` |
| `promoted_listing_auction_lost` | Mirror of `promoted_listing.auction_lost` | `source_webhook_event_type`, `category_id`, `auction_id`, `settled_at`, `recipient_org_id`, `promoted_listing_id`, `result`, `slot_fill_state`, `bidder_count_bucket`, `reserve_price_cents` |

#### M.5.20 v7.2.0-REM P1 webhook payload privacy additions (D-MD-005 closure) {#m-5-20-v72rem-p1-webhook-payload-privacy-additions}

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `webhook_payload_k_anonymity_floor` | cross_feature_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/webhook_payload_k_anonymity_floor.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Customer-visible marketplace-discovery webhook payloads are recipient-owned, k=5 aggregate, or Ops-only. | `not_permitted_console_firewall` | `runbooks.sourcera.com/ci-gates/webhook_payload_k_anonymity_floor` | M02.3 |
