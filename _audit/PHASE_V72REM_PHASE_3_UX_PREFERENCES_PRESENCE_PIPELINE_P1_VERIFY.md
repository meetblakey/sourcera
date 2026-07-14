# Phase 3 UX Preferences / Presence / Pipeline P1 Verification

**Date:** 2026-06-23  
**Program:** v7.2.0-REM  
**Scope:** D-3UX-010, D-3UX-021, D-3UX-022, D-3UX-028; adjacent P2 closures D-3UX-031 and D-3UX-032.  
**Outcome:** PASS — target P1 rows closed in canonical ledger; adjacent P2 rows closed; blocking spec-lint gates pass.

## Source Review

Read and cross-checked before remediation:

- Master Spec §3.8 Side Peek Dimensions & Behavior.
- Master Spec §3.9 Cursor Presence Visualization.
- Master Spec §3.11 Dark Mode Parity Rules.
- Master Spec §3.12 Presence & Unread Tracking.
- Master Spec §3.14 Pipeline Surface Compression.
- Master Spec §4.2.1 Organization.
- Master Spec §4.2.14 UserAccessibilityPreference.
- Master Spec §4.3.14 PresenceRecord.
- Master Spec §38.6.3 UserUIPreference responsive-layout contract.
- Appendix G, Appendix J, Appendix K, and Appendix M.1.
- `UX_Design_of_Sourcera.md` §5.2.19 PipelineSurface.
- `_audit/DEFECT_LEDGER.md`, `_audit/REMEDIATION_BACKLOG.md`, `_audit/V711_BACKLOG_INDEX.md`, `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, and `_integration/RECONCILIATION.md`.

## Classification

| Defect | Severity | Classification | Closure |
|---|---:|---|---|
| D-3UX-010 | P1 | True issue | Added Organization.`default_theme_mode`, §4.2.16 OrganizationPreference, Appendix K glossary support, and Appendix M preference mapping. |
| D-3UX-021 | P1 | True issue | Promoted UserUIPreference to §4.2.15 and made it the canonical theme + Side Peek width preference entity. |
| D-3UX-022 | P1 | True issue | Registered `active_idle` through §4.3.14 and Appendix J `presence_session_status`; reconciled §3 / Appendix G / Appendix K thresholds. |
| D-3UX-028 | P1 | True issue | Added §3.14.6 Failure Modes, §3.14.7 Acceptance Criteria, and §3.14.8 Observability plus Appendix G/J support. |
| D-3UX-031 | P2 | True adjacent issue | §3.8.8 AC #2 now scopes Side Peek width clamp by responsive breakpoint tier. |
| D-3UX-032 | P2 | True adjacent issue | Resolved Side Peek persistence to a single per-surface/per-breakpoint-tier UserUIPreference field. |

No target row was stale, duplicate, or blocked by a missing product decision.

## Files Updated

- `Sourcera_Master_Spec.md`
- `_audit/DEFECT_LEDGER.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `_integration/RECONCILIATION.md`

## Backups

Backups taken before authoritative edits:

- `legacy-import:_versions/Sourcera_Master_Spec_pre-phase-3-ux-preferences-presence-pipeline-p1-2026-06-23.md`
- `legacy-import:_versions/DEFECT_LEDGER_pre-phase-3-ux-preferences-presence-pipeline-p1-2026-06-23.md`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-phase-3-ux-preferences-presence-pipeline-p1-2026-06-23.md`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-phase-3-ux-preferences-presence-pipeline-p1-2026-06-23.md`
- `legacy-import:_versions/RECONCILIATION_pre-phase-3-ux-preferences-presence-pipeline-p1-2026-06-23.md`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-3-ux-preferences-presence-pipeline-p1-2026-06-23.md`

## Ledger / Index Result

Canonical row statuses updated:

- D-3UX-010 -> `remediated 2026-06-23 (v7.2.0-REM Phase 3 UX Preferences/Presence/Pipeline P1)`
- D-3UX-021 -> `remediated 2026-06-23 (v7.2.0-REM Phase 3 UX Preferences/Presence/Pipeline P1)`
- D-3UX-022 -> `remediated 2026-06-23 (v7.2.0-REM Phase 3 UX Preferences/Presence/Pipeline P1)`
- D-3UX-028 -> `remediated 2026-06-23 (v7.2.0-REM Phase 3 UX Preferences/Presence/Pipeline P1)`
- D-3UX-031 -> `remediated 2026-06-23 (v7.2.0-REM Phase 3 UX Preferences/Presence/Pipeline P1)`
- D-3UX-032 -> `remediated 2026-06-23 (v7.2.0-REM Phase 3 UX Preferences/Presence/Pipeline P1)`

Open P1 scanner:

```text
open_p1_rows=106
unique_open_p1_ids=106
```

Index-series P1 count moves from 110 to 106 by four-row P1 delta. Lower-severity Phase 3 UX rows remain open unless separately remediated or status-synced.

## Authored Extension

Added pending AE row:

- `AE-V72REM-PH3UX-PREFERENCES-PRESENCE-PIPELINE-P1-01`

Reason: the current Master Spec referenced user, org, and Ops theme-preference behavior plus PipelineSurface observability before the full §4 entity, enum, telemetry, and surface/engine contracts existed.

## Lint Verification

Command:

```bash
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

Result: exit code 0.

Blocking gates:

```text
blocking gates worst exit code: 0
```

Advisory-only findings remain:

```text
solo_tier_numeric_single_source: 52
retention_singleton_section_40_2_canonical: 115
section_anchor_slug_no_colon: 13
```

These advisory findings are not introduced by this pass and do not block the required gate.
