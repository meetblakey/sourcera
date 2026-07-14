# v7.2.0-REM Volume Discount Companion P1 Verify — 2026-06-21

## Scope

Focused P1 numerical-singleton pass for D-AS-002.

Touched artifacts:

- `Sourcera_Buyer_Pricing_Strategy.md`
- `Sourcera_Seller_Pricing_Strategy.md`
- `_audit/DEFECT_LEDGER.md`
- `_integration/RECONCILIATION.md`

Pre-edit backups:

- `_versions/Sourcera_Buyer_Pricing_Strategy_pre-v72REM-volume-discount-companion-p1-2026-06-21.md`
- `_versions/Sourcera_Seller_Pricing_Strategy_pre-v72REM-volume-discount-companion-p1-2026-06-21.md`
- `_versions/DEFECT_LEDGER_pre-v72REM-volume-discount-companion-p1-2026-06-21.md`
- `_versions/RECONCILIATION_pre-v72REM-volume-discount-companion-p1-2026-06-21.md`

## Closure

D-AS-002 is remediated.

Buyer Pricing v3 §7 and Seller Pricing v3 §9 no longer restate the Enterprise volume-discount band thresholds inline. Both companion docs now cite Master Spec §34.2.4 as the authoritative source for Enterprise Committed Spend volume-discount bands.

## Verification

- Exact old Buyer companion phrase removed: `Volume discount on overage: 10% at $25K commit, 15% at $50K, 20% at $100K, 25% at $250K+`.
- Exact old Seller companion phrase removed: `Volume discount on overage: 10% at $25K, 15% at $50K, 20% at $100K, 25% at $250K+`.
- Replacement lines in both companion docs cite Master Spec §34.2.4.
- Canonical D-AS-002 ledger row has 12 cells and status `remediated 2026-06-21`.

## Residuals

No new Authored Extension row is required. This pass removes duplicate numerical restatement and does not change the discount policy.

Future validator hardening remains appropriate: extend `volume_discount_band_single_source` to scan the Buyer and Seller pricing companion docs, not only the Master Spec.
