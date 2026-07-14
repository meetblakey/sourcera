# Phase v7.2.0-REM — Appendix I Billing Error Code Catalog P1 Verification

Date: 2026-06-21

## Scope

This pass closes D-V8.1-016 by registering the §32.8.10-.22 billing API error codes in Appendix I Billing Endpoint Errors and adding the §M.5 validator `appendix_i_billing_error_code_catalog_complete`.

## Source Authority

Master Spec remains authoritative. §32.8 endpoint tables already authored these error names and statuses; Appendix I is the canonical error-code catalog home.

## Closed Defect

| Defect | Status | Evidence |
| :---- | :---- | :---- |
| D-V8.1-016 | remediated 2026-06-21 | Appendix I Billing Endpoint Errors now registers all 39 missing §32.8 billing API codes; §M.5 now asserts `appendix_i_billing_error_code_catalog_complete`. |

## Added Appendix I Rows

`topup_amount_out_of_range`, `payment_method_declined`, `payment_method_not_registered`, `wallet_topup_disabled_for_enterprise_committed`, `topup_rate_limit_exceeded`, `export_window_exceeds_retention`, `export_cost_center_forbidden`, `export_rate_limit_exceeded`, `export_queue_saturated`, `contest_record_not_found`, `contest_role_insufficient`, `contest_withdraw_role_insufficient`, `contest_withdraw_not_filer`, `contest_already_resolved`, `contest_withdraw_reason_required`, `committed_spend_role_insufficient`, `committed_spend_contract_not_found`, `committed_spend_already_opted_out`, `committed_spend_optout_window_closed`, `committed_spend_optout_reason_required`, `plan_change_role_insufficient`, `plan_change_confirm_token_required`, `plan_change_downgrade_preview_token_expired`, `committed_spend_migration_intent_required`, `enterprise_plan_change_requires_ops_signoff`, `plan_change_rate_limit_exceeded`, `pro_trial_seat_role_insufficient`, `pro_trial_seat_grant_not_found`, `pro_trial_seat_already_resolved`, `pro_trial_seat_grant_expired`, `pro_trial_seat_acknowledgement_token_invalid`, `pro_trial_seat_auto_downgrade_not_acknowledged`, `snapshot_window_exceeds_retention`, `pricing_pin_role_insufficient`, `pricing_version_not_published`, `pricing_pin_window_exceeds_plan_limit`, `pricing_version_already_pinned`, `audit_log_full_view_requires_org_admin`, `audit_view_namespace_out_of_scope`.

## Validation

- Negative grep target: no canonical D-V8.1-016 row remains `open`, and no active remediation text says the 39 §32.8 billing codes are absent from Appendix I.
- Positive grep target: all 39 code strings resolve in Appendix I / endpoint contexts, D-V8.1-016 is `remediated 2026-06-21`, the §M.5 gate is present, and the reconciliation closeout names this pass.

## Executed Checks

- Negative status/stale-wording sweep: PASS — no active `open` D-V8.1-016 row, stale "Append all 39 codes" remediation instruction, "D-V8.1-016 remains open" wording, or source/Appendix typo remains in the active files touched by this pass.
- Positive catalog sweep: PASS — all 39 error-code strings resolve, the Appendix I rows carry endpoint anchors in their meanings, §M.5 includes `appendix_i_billing_error_code_catalog_complete`, and the defect ledger plus reconciliation closeout name the completed pass.

## Residuals

D-V8.1-001, D-V8.1-015, D-V8.1-017, D-V8.1-018, D-V8.1-019, D-V8.1-020, and the broader §32 endpoint-detail backlog remain open.
