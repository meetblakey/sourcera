# v7.2.0-REM Solo Trial P1 Verification (2026-06-21)

## Scope

Verification for the focused P1 pass closing D-14.1-002 and D-14.2-002.

Touched surfaces:
- `Sourcera_Master_Spec.md` §4.2.1, §34.9.5, Appendix C, Appendix G, Appendix I, Appendix J, §M.5.21.
- `_audit/DEFECT_LEDGER.md` canonical rows D-14.1-002 and D-14.2-002.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` AE-V72REM-SOLO-TRIAL-01.
- `_integration/RECONCILIATION.md` 90-Day Solo Trial P1 Pass block.

## Checks

### 1. New binding coverage

Command class:

```sh
rg -n "34\\.9\\.5 90-Day Solo Trial|buyer_solo_migration_90d|seller_solo_migration_90d|billing\\.solo_trial\\.(started|expiry_notice_sent|ended)|org\\.solo_trial_(started|expiry_notice_sent|ended)|solo_trial_(already_redeemed|not_eligible|invalid_state_transition|one_per_org_lifetime)|AE-V72REM-SOLO-TRIAL-01" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
```

Result: PASS.

Evidence summary:
- Master Spec §34.9.5 exists and defines the Buyer/Seller Solo migration trial mechanic.
- Appendix C contains `billing.solo_trial.started`, `billing.solo_trial.expiry_notice_sent`, and `billing.solo_trial.ended`.
- Appendix G contains `solo_trial_started`, `solo_trial_expiry_notice_sent`, and `solo_trial_ended`.
- Appendix I contains `solo_trial_already_redeemed`, `solo_trial_not_eligible`, and `solo_trial_invalid_state_transition`.
- Appendix J contains `trial_state_kind`, `solo_trial_state`, `solo_trial_outcome`, `solo_migration_trial_auto_downgrade`, and `org.solo_trial_*` billing audit actions.
- §M.5.21 contains `solo_trial_one_per_org_lifetime`.
- Defect ledger rows D-14.1-002 and D-14.2-002 cite AE-V72REM-SOLO-TRIAL-01 and this verification file.
- AE ledger and reconciliation both contain AE-V72REM-SOLO-TRIAL-01 / 90-Day Solo Trial P1 Pass entries.

### 2. Stale open-row and obsolete-gap scan

Command class:

```sh
rg -n "<D-14.1-002 open-row pattern>|<D-14.2-002 open-row pattern>|<obsolete missing-Solo-trial wording>|<obsolete Scenario-D residual wording>" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
```

Result: PASS. The scan returned no matches in the live authoritative files.

### 3. Canonical row status check

Command class:

```sh
rg -n "^\\| D-14\\.1-002 \\||^\\| D-14\\.2-002 \\|" _audit/DEFECT_LEDGER.md
```

Result: PASS.

Evidence summary:
- D-14.1-002 status is `remediated 2026-06-21`.
- D-14.2-002 status is `remediated 2026-06-21`.

## Residuals

- D-14.1-007 remains open for Selection Report v2-watermarking grandfathering.
- D-14.2-009 remains open for Seller KB-cap v2-cutover grandfathering.
- D-14.1-003 / D-14.2-003 remain open for Solo upgrade-CTA throttling aggregation.
- AE-V72REM-SOLO-TRIAL-01 remains pending ratification before v7.1.1 stamp.

