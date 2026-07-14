# Phase v7.2.0-REM — Year-1 Plan-Mix P1 Verify

Date: 2026-06-21  
Scope: D-AS-004 / D-AS-005 (`numerical_singleton`)  
Status: remediated in Master Spec body; AE-12.4-02 condition satisfied.

## Backups

- `_versions/Sourcera_Master_Spec_pre-v72REM-year1-plan-mix-p1-2026-06-21.md`
- `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-v72REM-year1-plan-mix-p1-2026-06-21.md`
- `_versions/DEFECT_LEDGER_pre-v72REM-year1-plan-mix-p1-2026-06-21.md`
- `_versions/RECONCILIATION_pre-v72REM-year1-plan-mix-p1-2026-06-21.md`

## Remediation Summary

- §34.18.3 now defines Year-1 mix on the paid-exit denominator.
- Free is excluded from the paid-exit denominator and remains tracked through §34.18.5 Free-to-paid conversion.
- Buyer paid mix now matches BPS v3 §13: 35% Solo subscription / 25% Solo per-eval / 20% Business Starter / 12% Business Growth / 6% Business Scale / 2% Enterprise.
- Seller paid mix now matches SPS v3 §14: 25% Solo subscription / 25% Solo per-bid / 25% Starter / 15% Growth / 8% Scale / 2% Enterprise.
- Static `% of rev_subscription` planning splits were removed from §34.18.3; revenue-weighted mix is computed from BillingEvent / Stripe rows using §34.1 / §34.2.
- §34.20.15 AC #74 now tracks the Solo-inclusive paid-exit mix.
- AE-12.4-02 status now records `condition satisfied 2026-06-21`.
- `_audit/DEFECT_LEDGER.md` transitions D-AS-004 and D-AS-005 to `remediated 2026-06-21`.

## Verification Commands

```sh
rg -n "Buyer Solo subscription|Buyer Solo per-evaluation|Seller Solo subscription|Seller Solo per-bid|35/25/20/12/6/2|25/25/25/15/8/2|AE-12.4-02|D-AS-004|D-AS-005" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _integration/RECONCILIATION.md _integration/AUTHORED_EXTENSIONS_LEDGER.md
rg -n "Free \\| 60%|Free \\| 55%|Year-1 exit mix targets \\(Buyer 60/25/10/5|D-AS-004 and D-AS-005 remain open|conditional on v7\\.1\\.1 §34\\.18\\.3 Solo-row" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _integration/RECONCILIATION.md _integration/AUTHORED_EXTENSIONS_LEDGER.md
```

## Expected Results

- The first command finds the new Solo-inclusive paid-exit rows, scorecard AC, AE-12.4-02 condition-satisfied status, and remediated D-AS-004 / D-AS-005 rows.
- The second command returns no live stale hits for the retired Free-inclusive §34.18.3 mix, the old AC #74 shorthand, or "D-AS-004 and D-AS-005 remain open".

## Actual Results

PASS on 2026-06-21:

- New-row grep found §34.18.3 Buyer Solo subscription / Buyer Solo per-evaluation / Seller Solo subscription / Seller Solo per-bid rows, §34.20.15 AC #74 `35/25/20/12/6/2` and `25/25/25/15/8/2`, AE-12.4-02 condition-satisfied status, and D-AS-004 / D-AS-005 remediated rows.
- Stale-string grep for the retired Free-inclusive §34.18.3 table, old AC #74 shorthand, "D-AS-004 and D-AS-005 remain open", and the prior "conditional on v7.1.1 §34.18.3 Solo-row" phrase returned no live hits.

## Counterfactuals

1. A reader using only §34.18.3 can distinguish paid-exit mix from Free acquisition share; the denominator no longer silently changes between Master Spec and companion pricing docs.
2. A finance-scorecard implementation can track Buyer 35/25/20/12/6/2 and Seller 25/25/25/15/8/2 without deriving those values from a retired Free-inclusive table.
3. AE-12.4-02 no longer blocks v7.1.1 stamp on Solo-row authoring; separate Solo Scenario D defects remain open and are not silently closed by this pass.
