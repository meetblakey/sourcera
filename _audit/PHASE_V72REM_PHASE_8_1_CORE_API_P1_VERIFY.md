# Phase 8.1 Core API Detail P1 Verification

**Date:** 2026-06-24  
**Pass:** v7.2.0-REM Program -> Phase 8.1 Core API Detail P1 Pass  
**Primary defect:** D-V8.1-001  
**Classification:** True issue requiring canonical Master Spec remediation  
**Status:** Closed in canonical spec and ledgers

## Sources Reviewed

- `Sourcera_Master_Spec.md` §4.2.1-§4.2.3, §4.3.1-§4.3.6.1, §4.3.20-§4.3.24, §4.4.4, §4.6.1, §5.6, §6.6, §6.7, §10.16, §12.6-§12.8, §13, §25.3, §25.7, §26.3, §32.1, §32.3, §32.4.5, §32.5, §32.5.1, §32.5.2, §32.10, Appendix I, Appendix J, and §M.5.
- `_audit/DEFECT_LEDGER.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`

## Decision

D-V8.1-001 was a true live buildability issue. The current Master Spec had remediated many specialized API families, but remaining §32.5 core buyer/admin families still had method/path rows without endpoint-local request schemas, response schemas, error sets, auth scopes, RBAC, rate-limit classes, idempotency behavior, or concrete examples. Internal Comments also retained stale `/comments` index rows while §25.7.9 already owned the canonical route family.

## Remediation

- `Sourcera_Master_Spec.md` §32.5 now declares endpoint-detail ownership for index rows.
- `Sourcera_Master_Spec.md` §32.5 now lists canonical Internal Comment routes from §25.7.9 and constrains `/comments` to deprecated compatibility aliases.
- `Sourcera_Master_Spec.md` §32.10.9 now authors the Core Buyer and Administration API Detail Pack for Workspaces, Requirements, Responses, Scores, Vendors / Target Accounts, Selection Reports, Traceability Matrices, Capability Declarations, Audit Events, and Users & Organization.
- Appendix I now registers `invalid_response_id`, `invalid_score_id`, and `invalid_target_account_id`.
- §M.5.68 now registers `core_api_endpoint_detail_completeness`, `core_api_error_code_registration_consistency`, and `internal_comment_legacy_alias_no_shadow_schema`.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` now registers `AE-V72REM-PH8P81-CORE-API-P1-01`.
- `_audit/DEFECT_LEDGER.md`, `_audit/V711_BACKLOG_INDEX.md`, `_audit/REMEDIATION_BACKLOG.md`, and `_integration/RECONCILIATION.md` now record the closure.

## Backups

- `_versions/Sourcera_Master_Spec_pre-phase-8-1-core-api-p1-2026-06-24.md`
- `_versions/DEFECT_LEDGER_pre-phase-8-1-core-api-p1-2026-06-24.md`
- `_versions/V711_BACKLOG_INDEX_pre-phase-8-1-core-api-p1-2026-06-24.md`
- `_versions/REMEDIATION_BACKLOG_pre-phase-8-1-core-api-p1-2026-06-24.md`
- `_versions/RECONCILIATION_pre-phase-8-1-core-api-p1-2026-06-24.md`
- `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-8-1-core-api-p1-2026-06-24.md`

## Verification

Command:

```bash
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

Result:

- Blocking gates: pass, worst exit code 0.
- Advisory gates: existing advisory findings remain for `solo_tier_numeric_single_source`, `retention_singleton_section_40_2_canonical`, and `section_anchor_slug_no_colon`.
- Advisory findings are non-blocking and were not introduced as D-V8.1-001 contract blockers.

Exact-status canonical scanner after this pass:

```text
P0 open_rows=0 unique_open=0
P1 open_rows=3 unique_open=3
P1_open_ids=D-CONS-001,D-CONS-006,D-11.4-001
P2 open_rows=616 unique_open=616
P3 open_rows=196 unique_open=196
P1_blocked=1 D-DEC-005
```

## Remaining P1 Surface

- D-CONS-001 remains open as ledger canonical-status propagation hygiene.
- D-CONS-006 remains open as duplicate-candidate ledger hygiene.
- D-11.4-001 remains open and retargeted to the v7.1.2 Appendix M.1 row-level engine-concept backfill surface.
- D-DEC-005 remains blocked pending Founder / Sales-Ops product decision.
