# v7.2.0-REM Free-to-Paid Solo P1 Verify — 2026-06-21

## Scope

Focused P1 plan-gating pass for D-PXC-015.

Touched artifacts:

- `Sourcera_Master_Spec.md`
- `_audit/DEFECT_LEDGER.md`
- `_integration/RECONCILIATION.md`

Pre-edit backups:

- `legacy-import:_versions/Sourcera_Master_Spec_pre-v72REM-free-to-paid-solo-p1-2026-06-21.md`
- `legacy-import:_versions/DEFECT_LEDGER_pre-v72REM-free-to-paid-solo-p1-2026-06-21.md`
- `legacy-import:_versions/RECONCILIATION_pre-v72REM-free-to-paid-solo-p1-2026-06-21.md`

## Closure

D-PXC-015 is remediated.

§34.18.5 Monthly Finance Scorecard now treats Solo as a paid conversion destination on both Buyer and Seller sides:

- Buyer Free → any paid Buyer tier includes Solo and counts Solo subscription or per-eval.
- Seller Free → any paid Seller tier includes Solo and counts Solo subscription or per-bid.

## Verification

- Old buyer scorecard phrase removed: `any paid Buyer tier (Starter / Growth / Scale / Enterprise per §34.1.1)`.
- Old seller scorecard phrase removed: `Free → Starter within 90 days`.
- Replacement rows cite §34.1.1 and §34.1.2 and include Solo.
- Canonical D-PXC-015 ledger row has 12 cells and status `remediated 2026-06-21`.

## Residuals

No Authored Extension row is required. Solo is already canonical in §34.1.1 and §34.1.2.

D-AS-004 and D-AS-005 remain open because the Year-1 plan-mix discrepancy requires a product/pricing decision, not a simple scorecard target-set correction.
