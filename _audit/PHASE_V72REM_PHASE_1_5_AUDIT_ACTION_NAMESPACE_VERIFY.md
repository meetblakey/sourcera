# v7.2.0-REM Phase 1.5 Seller Maya Audit-Action Namespace Verification

Date: 2026-06-22

## Scope

Focused pass for D-1.5-006 (P1 enum / consistency drift): §22.20.7 Authored Extensions item #5 still said Seller Maya chip / KB lifecycle actions extended `BillingAdminAuditAction`, while Appendix J had already registered those actions under `audit_event_action_type` — KB additions.

## Adjudication

D-1.5-006 was a true live P1 issue. The action strings and entity-type bindings were already correctly registered in Appendix J by the D-1.5-004 remediation, but §22.20.7 still pointed implementers to the wrong Billing Admin Audit Action namespace.

## Landing Sites

| Defect | Landing site |
| :---- | :---- |
| D-1.5-006 | §22.20.7 Seller Maya Authored Extensions item #5; §M.5.39 `seller_maya_audit_action_namespace`; `tools/spec-lint/gates/seller_maya_audit_action_namespace.ts`; `tools/spec-lint/run-all.ts`. |

## Changes Verified

- §22.20.7 cites Appendix J `audit_event_action_type` (KB additions sub-section) for Seller Maya chip / KB lifecycle actions.
- §22.20.7 explicitly says those Seller Maya actions MUST NOT be registered under the Billing Admin Audit Action namespace.
- Appendix J KB additions continues to register `capability_declaration_chip_added`, `capability_declaration_chip_removed`, `capability_declaration_chip_renamed`, `capability_declaration_deprecated`, `kb_entry.auto_merged`, and `kb_entry.auto_archived` with the D-1.5-004 / D-1.5-006 remediation note.
- §M.5.39 registers runtime-active `seller_maya_audit_action_namespace`.
- `_audit/DEFECT_LEDGER.md`, `_audit/V711_BACKLOG_INDEX.md`, `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, and `_integration/RECONCILIATION.md` record the closure and residual Phase 1.5 scope.

## Backup Evidence

- `legacy-import:_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-1-5-audit-action-namespace.md` md5 `bcfd20db0ed1d234f1604a82803b5290`
- `legacy-import:_versions/DEFECT_LEDGER_pre-2026-06-22-phase-1-5-audit-action-namespace.md` md5 `082ab8eb83d7e4fc8cec6aa41a654b17`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-2026-06-22-phase-1-5-audit-action-namespace.md` md5 `24e7fcd27f48995fa7c5246abba35399`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-1-5-audit-action-namespace.md` md5 `7f836fe2c7b1cc3cecd2414fc333d648`
- `legacy-import:_versions/RECONCILIATION_pre-2026-06-22-phase-1-5-audit-action-namespace.md` md5 `8945179ce323b89d4662da5613811b0f`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-1-5-audit-action-namespace.md` md5 `ce92b3978002811eedf6c5b7814d2887`

## Verification Commands

```bash
npm exec -- tsx gates/seller_maya_audit_action_namespace.ts --spec ../../Sourcera_Master_Spec.md --no-emit
npm run typecheck
npm run all -- --no-emit
rg -n '^\\| D-[^|]+ \\| P1 \\|[^\\n]*\\| open \\|' _audit/DEFECT_LEDGER.md | wc -l
```

## Verified Results

- Direct gate: pass, 0 findings.
- Typecheck: pass.
- Full spec-lint: all blocking gates pass, including `seller_maya_audit_action_namespace`.
- Advisory-only findings remain unchanged in class: `solo_tier_numeric_single_source` (52), `retention_singleton_section_40_2_canonical` (124), and `section_anchor_slug_no_colon` (13).
- Direct DEFECT_LEDGER regex count: 396 open P1 rows after D-1.5-006 closure.
- D-1.5-006 stale-open row scan: clean.
- Merge-marker scan across touched files: clean.

## Residuals

Adjacent Phase 1.5 P1 rows remain open and are not part of this closure:

- D-1.5-007
- D-1.5-008
- D-1.5-009
- D-1.5-010
