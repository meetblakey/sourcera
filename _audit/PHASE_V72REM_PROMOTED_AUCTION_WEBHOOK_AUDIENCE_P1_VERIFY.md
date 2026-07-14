# Phase v7.2.0-REM — Promoted Listing Auction Webhook Audience P1 Verify

Date: 2026-06-21  
Scope: D-MD-005 (`firewall_leakage`)  
Status: remediated in Master Spec body; AE-V72REM-MD-005-01 pending for M02.3 runtime wiring.

## Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-v72REM-promoted-auction-webhook-audience-p1-2026-06-21.md`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-v72REM-promoted-auction-webhook-audience-p1-2026-06-21.md`
- `legacy-import:_versions/DEFECT_LEDGER_pre-v72REM-promoted-auction-webhook-audience-p1-2026-06-21.md`
- `legacy-import:_versions/RECONCILIATION_pre-v72REM-promoted-auction-webhook-audience-p1-2026-06-21.md`

## Remediation Summary

- §34.16.7 now defines 18 marketplace-discovery webhook events.
- `promoted_listing.auction_settled` is winner-only and carries one recipient-owned `winner` self row.
- `promoted_listing.auction_lost` is the non-winning bidder event and carries no winner identity, winner paid amount, or winner-owned `promoted_listing_id`.
- Settlement idempotency is scoped to `(auction_id, recipient_org_id, event_type)`.
- Appendix C registers both settlement events.
- Appendix G registers `promoted_listing_auction_settled` and `promoted_listing_auction_lost`.
- §34.16.8 AC #11 and §27.11.8 AC #30 add QA coverage.
- §M.5.20 registers `webhook_payload_k_anonymity_floor`.
- `_audit/DEFECT_LEDGER.md` transitions D-MD-005 to `remediated 2026-06-21`.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` registers AE-V72REM-MD-005-01 as `pending`.

## Verification Commands

```sh
rg -n "promoted_listing\.auction_settled|promoted_listing\.auction_lost|webhook_payload_k_anonymity_floor|D-MD-005" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _integration/RECONCILIATION.md _integration/AUTHORED_EXTENSIONS_LEDGER.md
rg -n "Yes \(bidders \+ winners\)|winners: \[\{org_id, paid_cents|info \(winners\), info \(non-winners\)" Sourcera_Master_Spec.md
rg -n "promoted_listing_auction_settled|promoted_listing_auction_lost" Sourcera_Master_Spec.md
```

## Expected Results

- The live Master Spec no longer contains the old customer-visible `winners: [{org_id, paid_cents, rank, promoted_listing_id}]` payload or "Yes (bidders + winners)" audience for `promoted_listing.auction_settled`.
- `promoted_listing.auction_settled` appears in §34.16.7, Appendix C, and Appendix G as a winner self-only event.
- `promoted_listing.auction_lost` appears in §34.16.7, Appendix C, and Appendix G as a redacted non-winner event.
- `webhook_payload_k_anonymity_floor` appears in §34.16.7, §34.16.8 AC #11, §M.5.20, `_integration/RECONCILIATION.md`, and the AE ledger.
- Remaining appearances of the old leaking payload, if any, are limited to historical defect evidence outside the live Master Spec.

## Actual Results

PASS on 2026-06-21:

- New event/gate coverage grep found the expected §27.11.8 / §34.16.7 / §34.16.8 / Appendix C / Appendix G / §M.5.20 / ledger / reconciliation / AE-ledger references.
- Old live-spec leakage grep for "Yes (bidders + winners)", `winners: [{org_id, paid_cents`, and `info (winners), info (non-winners)` returned no hits in `Sourcera_Master_Spec.md`.
- Stale-open grep for "D-MD-005 remains open" and an open D-MD-005 canonical row returned no hits in `_audit/DEFECT_LEDGER.md` or `_integration/RECONCILIATION.md`.

## Counterfactuals

1. A two-bidder auction where the loser tries to learn the winner's identity through `auction_lost` fails: the payload has only recipient-owned `promoted_listing_id`, redacted fill state, and no winner `org_id` / `paid_cents`.
2. A settlement retry cannot duplicate winner or loser notifications because the idempotency key is `(auction_id, recipient_org_id, event_type)`.
3. A future body edit that reintroduces `winners[]` into a customer-visible marketplace-discovery webhook is caught by `webhook_payload_k_anonymity_floor`; the generic Appendix C/G/F gates alone would not be sufficient.
