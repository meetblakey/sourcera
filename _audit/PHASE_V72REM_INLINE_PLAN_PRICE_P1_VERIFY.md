# v7.2.0-REM Inline Plan/Price P1 Verify — 2026-06-21

## Scope

Focused inline pricing and plan-tier single-source pass for:

- D-AS-001
- D-MD-001

Incidental closure:

- D-AS-013

Touched artifacts:

- `Sourcera_Master_Spec.md`
- `_audit/DEFECT_LEDGER.md`
- `_integration/RECONCILIATION.md`

Pre-edit backups:

- `legacy-import:_versions/Sourcera_Master_Spec_pre-v72REM-inline-plan-price-p1-2026-06-21.md`
- `legacy-import:_versions/DEFECT_LEDGER_pre-v72REM-inline-plan-price-p1-2026-06-21.md`
- `legacy-import:_versions/RECONCILIATION_pre-v72REM-inline-plan-price-p1-2026-06-21.md`

## Closure

D-AS-001 is remediated.

§48.8.6 Conversion Moment #1 no longer restates the Seller Starter price inline. The modal now resolves monthly and annual Seller Starter pricing from §34.2.2.

D-MD-001 is remediated.

§34.16 no longer restates the old five-tier Buyer/Seller plan list in the `rev_subscription` Source column. The row now cites §34.1.1 and §34.1.2 as the plan-tier authorities.

Additional same-pattern cleanup: §5.2 Billing Admin no longer restates the old five-tier Buyer/Seller plan list and now cites the §34.1.1 Buyer plan-tier set and §34.1.2 Seller plan-tier set.

D-AS-013 is remediated as an incidental same-line citation cleanup.

§48.8.6 no longer cites Seller Pricing §3 for the annual-price-ratio rule.

## Verification

- Exact stale modal price phrase removed: `Seller Starter — $49 / month`.
- §48.8.6 replacement line cites §34.2.2 for Seller Starter monthly and annual pricing.
- Exact stale §34.16 plan-list phrase removed: `Buyer Free / Starter / Growth / Scale / Enterprise; Seller Free / Starter / Growth / Scale / Enterprise`.
- §34.16 `rev_subscription` Source cites §34.1.1 and §34.1.2.
- §5.2 Billing Admin cites §34.1.1 and §34.1.2 instead of restating the stale five-tier list.
- Canonical D-AS-001 and D-MD-001 ledger rows have 12 cells and status `remediated 2026-06-21`.
- Canonical D-AS-013 ledger row has 12 cells and status `remediated 2026-06-21`.

## Residuals

No Authored Extension row is required. This pass removes stale inline numerical authority and does not change pricing or plan eligibility.

D-AS-004 and D-AS-005 remain open because the Year-1 plan-mix discrepancy requires a product/pricing decision.
