# Phase v7.2.0-REM Phase 5.7 Seller Onboarding Lifecycle Verify

Date: 2026-06-22
Status: closed for lifecycle/schema subset

## Scope

This verification record covers the Phase 5.7 Seller Onboarding lifecycle/schema remediation pass. It closes the P1 defects whose active Master Spec fixes landed in the SellerOnboardingSession schema, Seller Onboarding operational flow, retention table, enum registry, and Appendix M CI gate catalog.

Closed defects:

- D-5.7-001
- D-5.7-002
- D-5.7-003
- D-5.7-004
- D-5.7-005
- D-5.7-007
- D-5.7-010

Residual Phase 5.7 P1 defects intentionally left open:

- D-5.7-006
- D-5.7-008
- D-5.7-009
- D-5.7-011
- D-5.7-015
- D-5.7-016
- D-5.7-024

## Backups

Pre-edit backups were taken before touching the authoritative files.

| File | Backup | Pre-edit md5 |
|---|---|---|
| Sourcera_Master_Spec.md | legacy-import:_versions/Sourcera_Master_Spec_pre-phase-5-7-seller-onboarding-lifecycle-2026-06-22.md | 28e12aac00375563291876d9e4d34fef |
| _audit/DEFECT_LEDGER.md | legacy-import:_versions/DEFECT_LEDGER_pre-phase-5-7-seller-onboarding-lifecycle-2026-06-22.md | 1f79175bd145901677f7608d7123c4bc |
| _audit/REMEDIATION_BACKLOG.md | legacy-import:_versions/REMEDIATION_BACKLOG_pre-phase-5-7-seller-onboarding-lifecycle-2026-06-22.md | f2265153135e543a0f7e3ee9f2d9e6bb |
| _audit/V711_BACKLOG_INDEX.md | legacy-import:_versions/V711_BACKLOG_INDEX_pre-phase-5-7-seller-onboarding-lifecycle-2026-06-22.md | 19f0a10432309ab5f36d9e0e7cb3883a |
| _integration/AUTHORED_EXTENSIONS_LEDGER.md | legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-5-7-seller-onboarding-lifecycle-2026-06-22.md | 895450a4d65f54ff75e5a55245b1e8e6 |
| _integration/RECONCILIATION.md | legacy-import:_versions/RECONCILIATION_pre-phase-5-7-seller-onboarding-lifecycle-2026-06-22.md | 11b3c776d8dc13cda4fae4100ed9b5d6 |

## Files Changed

| File | Post-edit md5 |
|---|---|
| Sourcera_Master_Spec.md | d96b7f3848a01cf6bc5e535f57bd2ed6 |
| _audit/DEFECT_LEDGER.md | 81ce0285d95481344e725f138c788a49 |
| _audit/REMEDIATION_BACKLOG.md | 1847a3a534e068ec1e207e25e40d070f |
| _audit/V711_BACKLOG_INDEX.md | b5542ec904e3b727920ff881fe1b487f |
| _integration/AUTHORED_EXTENSIONS_LEDGER.md | 6de372ae1e15c52b9d075f2902bd816c |
| _integration/RECONCILIATION.md | e78b36fbab41002adbaa2d05d4744d58 |

## Landing-Site Evidence

### SellerOnboardingSession Schema

Master Spec Section 4.4.22 now carries the lifecycle fields required by the Phase 5.7 closure:

- `stage_5_entry_aiwallet_balance_cents`
- `stage_6_exit_at`
- `stage_7_entered_at`
- `stage_7_win_debrief_rendered_at`
- `stage_7_loss_debrief_rendered_at`
- `stage_7_phase_lapsed_at`
- `completion_state = churned_post_activation`

Section 4.4.22 also now carries write-path invariants for Stage 5 balance snapshot immutability, Stage 6/7 atomic timestamp semantics, and Stage 7 terminal-field exclusivity. The state machine includes `activated` / `reactivated` to `churned_post_activation`, and the acceptance criteria now cover Stage 5 snapshot, Stage 6/7 atomicity, and post-activation churn classification.

### Invite Source and Reactivation Semantics

Master Spec Section 49.1.1 no longer binds the duplicate-session guard to stale `invite_id` language. It now points to `invite_magic_link_id` for the active-or-errored presentation path and to Section 4.4.22 dedup semantics on `(recipient_email_hash, stage_1_arrival_at DESC)`.

Section 49.1.1 also no longer treats reactivation as a lifecycle-specific unique-index behavior. The active behavior now uses `invite_magic_link_id` idempotency, while the canonical reactivation classifier remains in Section 4.4.22.

### Stage 6/7 Telemetry and Operations

Master Spec Section 49.1.6 now requires `stake_reveal_dwell_completed` to fire only after the atomic `stage_6_exit_at` / `stage_7_entered_at` transaction commits. The event carries both timestamps.

Section 49.1.7 and Appendix G no longer describe a sweep-triggered post-activation event. They now identify the trigger as the Section 4.4.22 post-activation churn classifier.

### Retention and Classifier Single Source

Master Spec Section 40.2 now states that SellerOnboardingSession lifecycle classifier windows are defined only in Section 4.4.22 and are not retention TTLs.

Appendix J now registers `churned_post_activation` under `seller_onboarding_completion_state`.

### CI Gate Catalog

Master Spec Section M.5.30 adds two spec-binding gates:

- `seller_onboarding_reactivation_single_source`
- `seller_onboarding_staleness_window_single_source`

The gates are `spec_binding_pending_pack_m11_3`; they are not runtime-active in this pass.

## Ledger and Backlog Evidence

DEFECT_LEDGER marks D-5.7-001, D-5.7-002, D-5.7-003, D-5.7-004, D-5.7-005, D-5.7-007, and D-5.7-010 as remediated on 2026-06-22.

REMEDIATION_BACKLOG row `BL-P1-PH5P57-DM` is now count `0` and records the closed lifecycle/schema subset. Residual adjacent Phase 5.7 P1 rows remain open in the defect ledger.

V711_BACKLOG_INDEX records the advisory parsed P1-open count reduction from 467 to 460.

AUTHORED_EXTENSIONS_LEDGER records `AE-V72REM-PH5P57-LIFECYCLE-01` as pending ratification. RECONCILIATION records the same closure posture and the residual open Phase 5.7 P1 rows.

## Verification Commands

Robust defect-ledger parser:

```text
open_p1 460
remediated Phase 5.7 P1: D-5.7-001, D-5.7-002, D-5.7-003, D-5.7-004, D-5.7-005, D-5.7-007, D-5.7-010
open Phase 5.7 P1: D-5.7-006, D-5.7-008, D-5.7-009, D-5.7-011, D-5.7-015, D-5.7-016, D-5.7-024
```

REMEDIATION_BACKLOG top-table parser:

```text
top_table_rows 50
sum 54
nonzero 15
zero 35
phase57_row BL-P1-PH5P57-DM count 0
```

Active Master Spec stale-text scan:

```text
rg -n "14-day staleness|14 days transitions|unique index on \(invite_id\)|unique index excludes|NEW SellerOnboardingSession|Staleness sweep 60d post-activation|Staleness sweep at 60d post-activation" Sourcera_Master_Spec.md
exit 1, no matches
```

Conflict-marker scan:

```text
rg -n "<{7}|={7}|>{7}" Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _audit/REMEDIATION_BACKLOG.md _audit/V711_BACKLOG_INDEX.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
exit 1, no matches
```

Spec lint:

```text
npm --prefix tools/spec-lint run all -- --no-emit
exit 0
```

Blocking gates passed:

- `appendix_anchor_slug_no_colon`
- `principle_9_anchor_canonicality`
- `appendix_i_internal_event_no_http_status`
- `defense_view_appendix_i_pairing`
- `appendix_m5_runtime_status_coverage`
- `appendix_m5_header_count_parity`
- `eval_starter_appendix_i_pairing`
- `appendix_m5_cross_reference_resolution_completeness`

Advisory findings remained non-blocking:

- `solo_tier_numeric_single_source`: 52
- `retention_singleton_section_40_2_canonical`: 124
- `section_anchor_slug_no_colon`: 13

## Notes

Historical audit evidence and older reconciliation decision text may still quote the stale pre-remediation language by design. The active Master Spec scan confirms those stale strings are not present in the canonical build spec.

The new Section M.5.30 gates are spec-binding commitments queued for M11.3 runtime wiring. They do not assert runtime implementation in this pass.
