# Phase v7.2.0-REM Phase 6 Bidding Window Floor P1 Verify

Date: 2026-06-21
Scope: D-4.2-012
Status: PASS

## Source Surfaces Checked

- `Sourcera_Master_Spec.md` §10.6 Phase Gate Rules and Acceptance Criteria
- `Sourcera_Master_Spec.md` §10.16.1 Phase Advancement API error table
- `Sourcera_Master_Spec.md` Appendix I Phase & Workflow Errors
- `Sourcera_Master_Spec.md` §M.5 CI gate catalog
- `_audit/DEFECT_LEDGER.md` D-4.2-012 canonical row

## Verification Result

The Phase 6 bidding close minimum is now enforceable at the Phase Advancement API boundary:

- §10.6 requires `bidding_close_at >= phase_6_entered_at + 7 calendar days`.
- §10.6 specifies Workspace `data_residency_region` time-zone evaluation with UTC fallback.
- §10.6 and §10.16.1 bind below-floor attempts to HTTP 422 `phase_6_bidding_close_below_minimum_window`.
- Appendix I registers `phase_6_bidding_close_below_minimum_window`.
- §M.5 registers `phase_6_bidding_close_minimum_seven_days`.
- D-4.2-012 is marked `remediated 2026-06-21`.
- D-4.2-031 remains open for broader phase-duration time-zone/business-calendar semantics.

## Targeted Parse Output

```text
sec106_floor True
sec106_timezone True
sec106_error True
sec1016_error_table True
appendix_i_row True
gate_present True
D-4.2-012 1 True False
all_pass True
```

