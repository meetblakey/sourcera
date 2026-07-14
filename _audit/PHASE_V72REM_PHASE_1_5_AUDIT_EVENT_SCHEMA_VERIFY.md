# v7.2.0-REM Phase 1.5 Audit Event Schema Single-Source Verification

Date: 2026-06-22

## Scope

Focused pass for D-1.5-008 (P1 data_model / consistency drift): §6.7.2 Audit Log Structure restated a stale AuditEvent field list instead of citing canonical §4.6.1 Audit Event.

## Adjudication

D-1.5-008 was a true live P1 issue. The filed line numbers were stale, but the defect remained live: §6.7.2 still listed old local field names and omitted current §4.6.1 fields, creating an incompatible schema path for audit emitters.

## Landing Sites

| Defect | Landing site |
| :---- | :---- |
| D-1.5-008 | §6.7.2 Audit Log Structure; §M.5.40 `audit_event_schema_single_source_of_truth`; `tools/spec-lint/gates/audit_event_schema_single_source_of_truth.ts`; `tools/spec-lint/run-all.ts`. |

## Changes Verified

- §6.7.2 states every audit log entry is a §4.6.1 Audit Event row.
- §6.7.2 states §4.6.1 is the sole schema source.
- §6.7.2 no longer carries a local field bullet list.
- §6.7.2 no longer contains stale aliases `organization_id`, `resource_type`, `resource_id`, or `api_token_id`.
- §6.7.2 names the current canonical §4.6.1 fields `org_id`, `console`, `entity_type`, `entity_id`, `user_agent`, `status`, `failure_reason`, and `notes`.
- §M.5.40 registers runtime-active `audit_event_schema_single_source_of_truth`.
- `_audit/DEFECT_LEDGER.md`, `_audit/V711_BACKLOG_INDEX.md`, `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, and `_integration/RECONCILIATION.md` record the closure and residual Phase 1.5 scope.

## Backup Evidence

- `legacy-import:_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-1-5-audit-event-schema-single-source.md` md5 `40d4998fcef4e739d756860764e64d49`
- `legacy-import:_versions/DEFECT_LEDGER_pre-2026-06-22-phase-1-5-audit-event-schema-single-source.md` md5 `dd69d1f4e7d36755a90643784c9f2807`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-1-5-audit-event-schema-single-source.md` md5 `749600205ae0f79f6dffb4fc3f99e781`
- `legacy-import:_versions/RECONCILIATION_pre-2026-06-22-phase-1-5-audit-event-schema-single-source.md` md5 `e539eaae27d6f2f26ba447759e5b42b6`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-1-5-audit-event-schema-single-source.md` md5 `b366358f8d54597608bbfa98b6ef14a8`

## Verification Commands

```bash
npm exec -- tsx gates/audit_event_schema_single_source_of_truth.ts --spec ../../Sourcera_Master_Spec.md --no-emit
npm run typecheck
npm run all -- --no-emit
rg -n '^\\| D-[^|]+ \\| P1 \\|[^\\n]*\\| open \\|' _audit/DEFECT_LEDGER.md | wc -l
```

## Verified Results

- Direct gate: pass, 0 findings.
- Typecheck: pass.
- Full spec-lint: all blocking gates pass, including `audit_event_schema_single_source_of_truth`.
- Advisory-only findings remain unchanged in class: `solo_tier_numeric_single_source` (52), `retention_singleton_section_40_2_canonical` (124), and `section_anchor_slug_no_colon` (13).
- Direct DEFECT_LEDGER regex count: 395 open P1 rows after D-1.5-008 closure.
- D-1.5-008 stale-open row scan: clean.
- Pending-verification text scan across the new reconciliation / verification records: clean.
- Merge-marker scan across touched files: clean.

## Residuals

Adjacent Phase 1.5 P1 rows remain open and are not part of this closure:

- D-1.5-007
- D-1.5-009
- D-1.5-010
