# Phase 4.12 Sourcera Agent Drift P1 Verification

**Date:** 2026-06-21  
**Backlog row:** BL-P1-PH4P412-DRIFT  
**Closed rows:** D-4.12-004, D-4.12-005, D-4.12-006, D-4.12-007, D-4.12-008, D-4.12-012  
**AE row:** AE-V72REM-PH4P412-DRIFT-01  
**Status:** Spec-side remediation complete; runtime wiring remains governed by the existing M11.3 / pricing sign-off gates.

## 1. True-Issue Adjudication

| Defect | Current adjudication | Closure basis |
| :---- | :---- | :---- |
| D-4.12-004 | True residual issue. Later P0 work closed much of the family-split gap, but §21.4.1.A still preserved stale alias guidance. | §21.4.1.A now carries the current alias-resolution table for `qa_suggestion`, `kb_suggestion`, `kb_to_response_suggestion`, and first-pass legacy strings. |
| D-4.12-005 | True residual issue. `kb_to_response_suggestion` still appeared as an independent customer-billed seller capability while the current canonical path is `kb_suggestion_seller`. | §21.4.1 row 7 and §21.4.5 now mark `kb_to_response_suggestion` as alias-only and rewrite to `kb_suggestion_seller` before AIOperation write. |
| D-4.12-006 | Stale as an open body defect after D-EM-001, but true at filing time. | §21.4.1.B already authors `qa_suggestion_buyer` / `qa_suggestion_seller`; this pass status-syncs the row and updates the local §21.4.1.A note. |
| D-4.12-007 | Stale as an open body defect after D-EM-003, but true at filing time. | §21.4.1.E already authors `first_pass_rfp_draft` as the per-requirement row distinct from §21.4.2 `first_pass_responses`; this pass status-syncs the row and updates the local alias table. |
| D-4.12-008 | True residual issue. The eight pending seller AE rate-card/outcome rows existed in §34 but did not have §21.4 registry/outcome catalog bindings. | §21.4.2 now seeds the eight AE `CapabilityRegistryEntry` rows as inert pending-signoff rows, and §21.4.5 mirrors their outcome signals. |
| D-4.12-012 | True residual issue. §21.4.4 cited wallet counters instead of the pooled Free + Free budget rule. | §21.4.4 condition #3 now cites §34.10.3. |

## 2. Files Touched

- `Sourcera_Master_Spec.md`
- `_audit/DEFECT_LEDGER.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `_integration/RECONCILIATION.md`
- `_audit/PHASE_V72REM_PHASE_4_12_AGENT_DRIFT_P1_VERIFY.md`

## 3. Pre-Edit Backups

| File | Backup | md5 |
| :---- | :---- | :---- |
| `Sourcera_Master_Spec.md` | `_versions/Sourcera_Master_Spec_pre-phase-4-12-agent-drift-p1-2026-06-21.md` | `0174d14e7ccdcd721b0a655437a608f4` |
| `_audit/DEFECT_LEDGER.md` | `_versions/DEFECT_LEDGER_pre-phase-4-12-agent-drift-p1-2026-06-21.md` | `6c40730f4339a42c306639766d7c9e80` |
| `_audit/REMEDIATION_BACKLOG.md` | `_versions/REMEDIATION_BACKLOG_pre-phase-4-12-agent-drift-p1-2026-06-21.md` | `88d0843121991bcf1c179f99bc94192c` |
| `_audit/V711_BACKLOG_INDEX.md` | `_versions/V711_BACKLOG_INDEX_pre-phase-4-12-agent-drift-p1-2026-06-21.md` | `b5a305460af28f811a10f2cbc4e18032` |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-4-12-agent-drift-p1-2026-06-21.md` | `5a05e6a46a4d70a5ee89751de69b5e2f` |
| `_integration/RECONCILIATION.md` | `_versions/RECONCILIATION_pre-phase-4-12-agent-drift-p1-2026-06-21.md` | `f9a6e4b9ed9ac104e1b7f51b40153332` |

## 4. Spec-Side Assertions

1. `kb_to_response_suggestion` is no longer an independent customer-billed seller capability or entitlement-matrix row; it is a legacy alias resolved to `kb_suggestion_seller` before AIOperation write.
2. `qa_suggestion` legacy aliases resolve to `qa_suggestion_seller`; buyer-side Q&A uses `qa_suggestion_buyer`.
3. `first_pass_rfp_draft` is the per-requirement seller capability; `first_pass_responses` remains the Managed-Agent batch capability.
4. The eight §34.14.1.b seller AE capabilities have §21.4.2 registry seed rows and §21.4.5 outcome rows, but remain production-inert until their sign-off gate passes.
5. Free-plan wallet invocation checks cite §34.10.3 for the unified $5 Free + Free wallet pool.
6. §48.2.9 post-bid KB sync wording uses canonical `kb_suggestion_seller`; legacy `kb_to_response_suggestion` strings are accepted only as alias input before write.

## 5. Ledger / Backlog Result

- `_audit/DEFECT_LEDGER.md`: six P1 rows moved from `open` to `remediated 2026-06-21`.
- `_audit/REMEDIATION_BACKLOG.md`: BL-P1-PH4P412-DRIFT count reduced from 6 to 0.
- `_audit/V711_BACKLOG_INDEX.md`: advisory parsed canonical P1-open count reduced from 531 to 525.
- Adjacent D-4.12 rows D-4.12-013 / -018 / -019 / -025 / -029 / -035 remain open and outside this cluster.

## 6. Validation

`npm --prefix tools/spec-lint run all -- --no-emit`

- Exit code: 0.
- Blocking gates: passed.
- Advisory-only findings remain:
  - `solo_tier_numeric_single_source`: 52
  - `retention_singleton_section_40_2_canonical`: 124
  - `section_anchor_slug_no_colon`: 13

Open-row check: no `open` P1 rows remain for D-4.12-004 / -005 / -006 / -007 / -008 / -012. Parsed canonical P1-open rows now count to 525.
