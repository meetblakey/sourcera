# v7.1.1 Phase 6/10 Runtime Gate Promotion + Registry AE Disposition Verify

**Date:** 2026-06-24  
**Scope:** §M.5.18 Phase 6 catalog-completeness gates, §M.5.19 Phase 10 policy-ingestion gates, seven v7.2.0-REM registry AE rows, and tracker prose in `_audit/V711_BACKLOG_INDEX.md` / `_audit/REMEDIATION_BACKLOG.md`.

## Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-v711-phase6-phase10-runtime-gate-promotion-2026-06-24.md`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-v711-phase6-phase10-runtime-gate-promotion-2026-06-24.md`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-v711-phase6-phase10-runtime-gate-promotion-2026-06-24.md`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-v711-phase6-phase10-runtime-gate-promotion-2026-06-24.md`
- `legacy-import:_versions/RECONCILIATION_pre-v711-phase6-phase10-runtime-gate-promotion-2026-06-24.md`
- `legacy-import:_versions/spec-lint-run-all_pre-v711-phase6-phase10-runtime-gate-promotion-2026-06-24.ts`
- `legacy-import:_versions/spec-lint-README_pre-v711-phase6-phase10-runtime-gate-promotion-2026-06-24.md`
- `legacy-import:_versions/spec-lint-types_pre-v711-phase6-phase10-runtime-gate-promotion-2026-06-24.ts`

## Runtime Wiring

Added eight detectors under `tools/spec-lint/gates/` and registered them in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`:

| Gate | §M.5 home | Result |
|---|---|---|
| `appendix_c_webhook_catalog_completeness` | §M.5.18 | `runtime_active` |
| `appendix_c_to_appendix_g_coverage` | §M.5.18 | `runtime_active` |
| `appendix_c_to_appendix_f_retry_class_coverage` | §M.5.18 | `runtime_active` |
| `webhook_default_retry_class` | §M.5.18 | `runtime_active` |
| `appendix_j_enum_completeness` | §M.5.18 | `runtime_active` |
| `policy_ingestion_enum_canonical_consumer` | §M.5.19 | `runtime_active` |
| `appendix_l_policy_ingestion_state_machine_canonicality` | §M.5.19 | `runtime_active` |
| `policy_ingestion_webhook_catalog_completeness` | §M.5.19 | `runtime_active` |

## Corpus Corrections Found by the New Gates

- Appendix G now includes the underscore-form mirror for `marketplace_discovery.anonymization_threshold_breach`.
- §12.3 now explicitly cites Appendix J `policy_ingestion_job_status`, `policy_framework_kind`, `policy_framework_confidence_band`, and `policy_framework_inference_outcome`.
- `appendix_l_policy_ingestion_state_machine_canonicality` now strips parenthetical labels from state-machine cells so `* (non-terminal)` resolves to the registered wildcard state.
- `policy_ingestion_webhook_catalog_completeness` now accepts the existing Appendix C wording `webhook retry class (Appendix F.1)` instead of requiring one exact markdown emphasis shape.

## AE Disposition

| AE row | Disposition |
|---|---|
| `AE-V72REM-PH6-01` | Re-targeted to v7.1.2 for the deferred Convex SellerSignal enum-typed body adoption. |
| `AE-V72REM-PH6-02` | Approved 2026-06-24; five §M.5.18 gates promoted to `runtime_active`. |
| `AE-V72REM-PH10-01` | Approved 2026-06-24; Appendix L.9 substate modeling decision accepted. |
| `AE-V72REM-PH10-02` | Approved 2026-06-24; three §M.5.19 gates promoted to `runtime_active`. |
| `AE-V72REM-PH12-01` | Approved 2026-06-24; Defense View regeneration reason superset accepted. |
| `AE-V72REM-PH5.5-01` | Approved 2026-06-24; seller-visible Q&A projection accepted. |
| `AE-V72REM-PH8P81-API-01` | Approved 2026-06-24; Phase 8 Prompt 8.1 API detail pack accepted. |

Stale closure-note prose was also status-synced so AE-37-01 is no longer described as a v7.1.1 pending-AE blocker. AE-37-01 remains acknowledged, with outside WCAG-firm follow-up owed at the annual §37.4 audit / Phase 37 §37.5 rewrite. AE-V9-004 remains the only hard external counter-signature blocker identified in this pass.

## Verification

| Command | Result |
|---|---|
| `npm --prefix tools/spec-lint run typecheck` | Pass |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass: 0 blocking findings; 0 advisory findings |

## Residuals

- This pass does not claim all `spec_binding_pending_pack_*` rows are closed. Product-codebase and other pack-owned rows remain governed by §M.5.1.1 and the `v7_1_1_stamp_gate_runtime_status_audit`.
- AE-V9-004 outside-counsel GDPR Art. 12(3) sign-off remains the hard external AE blocker unless signed or formally retargeted.
- Current table-row scan shows 46 older Phase 12 / Phase 13 pending rows still require row-level approval, acknowledgement, supersession, or retargeting before stamp if their target remains <= v7.1.1.
- Lower-severity backlog remains 614 P2 rows and 195 P3 rows at the last exact-status scanner snapshot.
