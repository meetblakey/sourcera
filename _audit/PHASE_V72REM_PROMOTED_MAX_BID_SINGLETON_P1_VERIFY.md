# Phase v7.2.0-REM — Promoted Listing Max-Bid Singleton P1 Verification

Date: 2026-06-21

Scope: D-MD-006 (`numerical_singleton`) for the Promoted Listing max-bid sanity cap.

Backups taken before edit:

- `_versions/Sourcera_Master_Spec_pre-v72REM-promoted-max-bid-singleton-p1-2026-06-21.md`
- `_versions/DEFECT_LEDGER_pre-v72REM-promoted-max-bid-singleton-p1-2026-06-21.md`
- `_versions/RECONCILIATION_pre-v72REM-promoted-max-bid-singleton-p1-2026-06-21.md`

## Verdict

Pass. D-MD-006 is remediated in the spec and ledger.

## Changes Verified

1. §4.4.19 PromotedListing now includes `max_bid_cents` as a fixed platform validation constant bound to §39.
2. §39 Object Size Constraints now owns `PromotedListing.max_bid_cents (system cap)` as the single source of truth for the $10,000 per-category weekly submitted-bid ceiling.
3. §34.16.5 Failure Mode #1 and §34.16.7 `promoted_listing_bid_above_max` now cite the §39 source instead of carrying an orphan cap.
4. Appendix I registers `promoted_listing_bid_above_max` for the submitted `bid_cents` rejection path.
5. The unauthored "harder caps configurable per category" claim is removed from live Master Spec behavior.
6. `_audit/DEFECT_LEDGER.md` marks D-MD-006 `remediated 2026-06-21` and updates stale residual notes in D-MD-002 / D-MD-004 / D-MD-007.
7. `_integration/RECONCILIATION.md` records the pass and leaves only D-MD-005 open from the P1 Promoted Listing cluster.

## Targeted Checks

Executed:

```bash
rg -n "max_bid_cents|harder caps configurable|promoted_listing_bid_above_max|D-MD-006|D-MD-005 remains open|D-MD-006 remain" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _integration/RECONCILIATION.md
rg -n "bid_clamped_to_max|clamped with|Excess bids are clamped|harder caps configurable per category" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _integration/RECONCILIATION.md
```

Observed:

- Live Master Spec hits show `max_bid_cents` in §4.4.19, §39, §34.16.5, §34.16.7, and Appendix I.
- No live Master Spec hit remains for `harder caps configurable per category`.
- No live Master Spec hit remains for `bid_clamped_to_max`, `clamped with`, or `Excess bids are clamped`.
- Remaining `bid_clamped_to_max` / old-phrase hits are in historical ledger/reconciliation descriptions only.

## Residuals

D-MD-005 remains open for the auction-settlement webhook audience / competitor-leakage issue. The broader simple `bid_cents` versus dual-metric `bid_impression_cents` / `bid_eoi_cents` auction-model inconsistency is outside D-MD-006 and should be filed separately if Promoted Listing auction unification enters scope.
