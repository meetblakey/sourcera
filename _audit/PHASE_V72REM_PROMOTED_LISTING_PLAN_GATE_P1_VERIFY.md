# v7.2.0-REM Promoted Listing Plan Gate P1 Verify — 2026-06-21

## Scope

Focused P1 plan-gating pass for D-PXC-009.

Touched artifacts:

- `Sourcera_Master_Spec.md`
- `_audit/DEFECT_LEDGER.md`
- `_integration/RECONCILIATION.md`

Pre-edit backups:

- `legacy-import:_versions/Sourcera_Master_Spec_pre-v72REM-promoted-listing-plan-gate-p1-2026-06-21.md`
- `legacy-import:_versions/DEFECT_LEDGER_pre-v72REM-promoted-listing-plan-gate-p1-2026-06-21.md`
- `legacy-import:_versions/RECONCILIATION_pre-v72REM-promoted-listing-plan-gate-p1-2026-06-21.md`

## Closure

D-PXC-009 is remediated.

§34.16.1 SKU 1 now states Promoted Listing bid submission is available only to Seller Scale and Seller Enterprise per §34.1.2. Ineligible Orgs are rejected with HTTP 403 `promoted_listing_plan_tier_below_scale`, matching §4.4.19 AC #1 and Appendix I.

§34.16.8 now includes an explicit Promoted Listing plan-tier eligibility acceptance criterion.

## Verification

- §34.16.1 auction step 2 contains `promoted_listing_plan_tier_below_scale`.
- §34.16.8 contains a plan-tier eligibility acceptance criterion for Seller Scale / Seller Enterprise.
- Appendix I already registers `promoted_listing_plan_tier_below_scale`.
- Canonical D-PXC-009 ledger row has 12 cells and status `remediated 2026-06-21`.

## Residuals

No Authored Extension row is required. This pass binds §34.16.1 to already-canonical plan eligibility.

D-PXC-010 and D-PXC-011 remain open for Verification Tier criteria and narrative-plan-gating reconciliation.
