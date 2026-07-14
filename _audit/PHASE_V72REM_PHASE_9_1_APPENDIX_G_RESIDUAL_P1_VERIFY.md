# Phase v7.2.0-REM — Phase 9.1 Appendix G Residual P1 Verification

**Date:** 2026-06-23  
**Scope:** D-9.1-002, D-9.1-007, D-9.1-008, D-9.1-016, D-9.1-019  
**Status:** Closed; full spec-lint blocking gates pass.

## 1. Backups

Pre-edit backups were taken before the Appendix G residual pass:

- `legacy-import:_versions/Sourcera_Master_Spec.pre-phase-9-1-appendix-g-residual-p1-2026-06-23.md`
- `legacy-import:_versions/DEFECT_LEDGER.pre-phase-9-1-appendix-g-residual-p1-2026-06-23.md`
- `legacy-import:_versions/V711_BACKLOG_INDEX.pre-phase-9-1-appendix-g-residual-p1-2026-06-23.md`
- `legacy-import:_versions/REMEDIATION_BACKLOG.pre-phase-9-1-appendix-g-residual-p1-2026-06-23.md`
- `legacy-import:_versions/RECONCILIATION.pre-phase-9-1-appendix-g-residual-p1-2026-06-23.md`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER.pre-phase-9-1-appendix-g-residual-p1-2026-06-23.md`

## 2. Sources Read

- Master Spec §13.11 Defense View
- Master Spec §31.8 Billing / webhook mirror contract
- Master Spec §48.3.5, §48.7, §48.8.8 Hero Moment / Seller Onboarding telemetry
- Master Spec §49.1 Seller First-Pass Response Drafting sampling
- Master Spec §51.1, §51.2, §51.7.5 analytics family / envelope / retention contracts
- Master Spec Appendix C, Appendix G, Appendix J, Appendix K, and §M.5
- `_audit/DEFECT_LEDGER.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `_integration/RECONCILIATION.md`

## 3. Adjudication

| Defect | Severity | Classification | Disposition |
|---|---:|---|---|
| D-9.1-002 | P2 | True issue | Closed by registering the residual Defense View outage PostHog mirror. |
| D-9.1-007 | P1 | True issue | Closed by enforcing underscore-form Appendix G Event-cell naming and preserving dotted source names only in source properties. |
| D-9.1-008 | P1 | True issue | Closed by registering `0.2` sampling in Appendix G and Appendix J `sampling_rate_kind`. |
| D-9.1-016 | P1 | True issue | Closed by marking six v7.0.x Hero Moment aliases removed at v7.1.0 and non-emitting. |
| D-9.1-019 | P1 | True issue | Closed by adding Appendix G `event_family` and the Event-Family Binding Matrix. |

No target row was blocked by missing product decision.

## 4. Master Spec Changes

- Appendix G preamble now includes `event_family`, underscore-only Event-cell naming, and the Event-Family Binding Matrix.
- Defense View, Internal Comment, Hero Moment, Seller Onboarding, and residency PostHog Event-cell values now use underscore-form names.
- Dotted webhook names remain available only as Appendix C `event_type` values, AuditEvent action values, or explicit `source_webhook_event_type` properties.
- Appendix J registers `sampling_rate_kind` and expands `event_family` notes to bind retention and routing to Appendix G.
- Appendix K updates Standardized Event Property Set to include `event_family`.
- §M.5.64 adds four residual Appendix G guardrails:
  - `appendix_g_event_name_underscore_normalization`
  - `posthog_sampling_rate_enum_closed`
  - `appendix_g_legacy_alias_retirement_enforced`
  - `appendix_g_event_family_binding_exhaustive`

## 5. Tracking Updates

- `_audit/DEFECT_LEDGER.md` marks D-9.1-002, D-9.1-007, D-9.1-008, D-9.1-016, and D-9.1-019 `remediated 2026-06-23`.
- `_audit/REMEDIATION_BACKLOG.md` records the Appendix G residual update and leaves adjacent lower-severity rows separate.
- `_audit/V711_BACKLOG_INDEX.md` records the 35 -> 31 P1 delta and adds the Phase 9.1 residual note.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` records `AE-V72REM-PH9P91-APPENDIX-G-RESIDUAL-P1-01`.
- `_integration/RECONCILIATION.md` records the classification, change summary, residuals, and sign-off scoreboard.

## 6. Verification

Targeted Appendix G Event-cell scan:

```text
dot_rows=0
```

Full spec lint command:

```bash
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

Result: PASS. Command exited 0. All blocking gates passed.

Blocking gate summary:

```text
blocking gates worst exit code: 0
```

Advisory-only findings remain and are tracked outside this pass:

```text
advisory fail 52  solo_tier_numeric_single_source
advisory fail 112 retention_singleton_section_40_2_canonical
advisory fail 13  section_anchor_slug_no_colon
```

Post-update canonical open-row scan over `_audit/DEFECT_LEDGER.md`:

```text
P0: 8
P1: 31
P2: 617
P3: 198
```

The P0 count remains a known stale ledger-synchronization issue under D-CONS propagation rather than a newly identified live P0 product gap in this pass.

## 7. Residuals

Adjacent lower-severity Appendix G rows remain open unless independently remediated or status-synced: D-9.1-003, D-9.1-009, D-9.1-011, D-9.1-013, D-9.1-014, D-9.1-015, D-9.1-017, D-9.1-018, D-9.1-020, and D-9.1-021.

Broader retention and DSAR rows remain separate and are not closed by this pass, including D-V8.3-013, D-V8.3-026, and D-9.1R-006.
