# v7.2.0-REM Promoted Listing Max-Bid Reject P1 Verify

**Date:** 2026-06-21

**Scope:** D-MD-004.

**Result:** PASS.

## Finding

§34.16.5 said over-max Promoted Listing bids were clamped with an unregistered `bid_clamped_to_max` audit event, while §34.16.7 defined HTTP 400 `promoted_listing_bid_above_max` as the error path. The two behaviors were mutually exclusive.

## Remediation

- §34.16.5 Failure Mode #1 now rejects excess bids with HTTP 400 `promoted_listing_bid_above_max`.
- Rejected over-max bids write no bid row, auction run, or MarketplaceDiscoveryRevenueRecord.
- The unregistered `bid_clamped_to_max` behavior is removed from live behavior text.
- `_audit/DEFECT_LEDGER.md` marks D-MD-004 `remediated 2026-06-21`.

## Verification

Targeted grep confirmed `bid_clamped_to_max` is absent from the live Master Spec and that §34.16.5 now cites `promoted_listing_bid_above_max` as a rejection path.

No Authored Extension row was required because this pass chooses the already-authored §34.16.7 rejection path and does not add a new event.
