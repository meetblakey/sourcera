# v7.2.0-REM Phase EM Entitlement Matrix P1 Verification

**Date:** 2026-06-23
**Scope:** D-EM-005, D-EM-006, D-EM-007, D-EM-009, D-EM-010, D-EM-011, D-EM-013, D-EM-014, D-EM-018
**Status:** PASS for blocking gates. Advisory-only pre-existing findings remain.

## 1. Sources Read

- Master Spec §4.8.2 CapabilityRegistryEntry and §4.8.7 FreeAllowanceCounter.
- Master Spec §5.11 / §5.11.4 Feature Access Matrix plan-tier overlay.
- Master Spec §21.4.1 / §21.4.1.D / §21.4.6 Capability Registry and sibling-split rows.
- Master Spec §27 / §27.9 Marketplace and seller-signal surfaces.
- Master Spec §31.9 CRM Sync.
- Master Spec §34.3.4, §34.8, and §34.11.1.
- Appendix I, Appendix J, Appendix M.5.
- `_audit/DEFECT_LEDGER.md`, `_audit/REMEDIATION_BACKLOG.md`, `_audit/V711_BACKLOG_INDEX.md`.

## 2. Classification

| Defect | Classification | Evidence |
|---|---|---|
| D-EM-005 | True issue | §34.8.1 did not register the non-`soft` / `hard` runtime classes used by §34.8.5. |
| D-EM-006 | True issue | Security/admin non-AIOperation rows were mixed into the AI capability entitlement path without a runtime discriminator. |
| D-EM-007 | True issue | Seller proactive/signal/CRM/promoted-placement rows mixed AI and non-AIOperation plan-gated surfaces without typed routing. |
| D-EM-009 | True issue | Buyer Marketplace search/filter/match/API rows are §5.11 / §27 feature gates, not CapabilityRegistryEntry-backed AI operations. |
| D-EM-010 | True issue | `upgrade_surface` carried route names, copy strings, and `n/a` without enum or localization binding. |
| D-EM-011 | True issue | `free_allowance_ops` carried prose and `n/a` in a column consumed as an integer quota. |
| D-EM-013 | True issue | §34.3.4 published legacy `kb_suggestion` while the runtime registry and matrix use buyer/seller siblings. |
| D-EM-014 | True issue | §34.8.3 used legacy `kb_suggestion` as a cross-console example even though it is not a cross-console runtime row. |
| D-EM-018 | True issue | `tco_modeling` was deliberately non-AI but still appeared in the matrix without a short-circuit path, causing a null registry lookup risk. |

No target row was classified stale, duplicate, or blocked by a missing product decision.

## 3. Remediation Landing Sites

- §34.8.1 / §34.8.2 / §34.8.5 now define typed enforcement modes, non-AIOperation short-circuit ordering, typed free allowances, enum-routed upgrade surfaces, and CTA Copy Registry bindings.
- §34.3.4 splits `kb_suggestion_buyer` and `kb_suggestion_seller` rate-card rows; legacy `kb_suggestion` is alias-only.
- §21.4.1.D, §21.4.6, and §34.11.1 now align with the sibling split and typed entitlement values.
- §5.11.4 now mirrors non-AIOperation row families for feature-access authority.
- Appendix I registers `capability_not_in_registry`.
- Appendix J registers `capability_enforcement_mode` and `entitlement_upgrade_surface`.
- Appendix M.5.52 registers six guardrails.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` records `AE-V72REM-PHEM-ENTITLEMENT-MATRIX-P1-01`.

## 4. Ledger Updates

- `_audit/DEFECT_LEDGER.md`: D-EM-005, D-EM-006, D-EM-007, D-EM-009, D-EM-010, D-EM-011, D-EM-013, D-EM-014, and D-EM-018 status cells changed to `remediated 2026-06-23 (v7.2.0-REM Phase EM Entitlement Matrix P1)`.
- `_audit/V711_BACKLOG_INDEX.md`: current parsed P1 count updated to 134 open rows / 134 unique IDs.
- `_audit/REMEDIATION_BACKLOG.md`: current delta note added and P1 entitlement program marked 0 P1 after this pass.
- `_integration/RECONCILIATION.md`: Phase EM Entitlement Matrix P1 Pass block appended.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` and `_integration/RECONCILIATION.md`: stale Phase 4.2 forward-looking notes that described D-EM-013 as deferred were superseded to point at the 2026-06-23 D-EM-013 closure.

## 5. Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-phase-em-entitlement-matrix-p1-2026-06-23.md`
- `legacy-import:_versions/DEFECT_LEDGER_pre-phase-em-entitlement-matrix-p1-2026-06-23.md`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-phase-em-entitlement-matrix-p1-2026-06-23.md`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-phase-em-entitlement-matrix-p1-2026-06-23.md`
- `legacy-import:_versions/RECONCILIATION_pre-phase-em-entitlement-matrix-p1-2026-06-23.md`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-em-entitlement-matrix-p1-2026-06-23.md`

## 6. Verification

Command run:

```bash
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

Result: exit code 0. Blocking gates all passed. Advisory gates still report known non-blocking residuals:

- `solo_tier_numeric_single_source`: 52 advisory findings.
- `retention_singleton_section_40_2_canonical`: 115 advisory findings.
- `section_anchor_slug_no_colon`: 13 advisory findings.

Count check: the established right-edge scanner returns 9 open P0-looking rows, 134 open P1 rows / 134 unique open P1 IDs, 633 open P2 rows, and 204 open P3 rows after this batch. `_audit/V711_BACKLOG_INDEX.md` treats the 9 P0-looking rows as historical count drift under the v7.1.0a P0 closure posture; this pass did not alter those non-target rows.
