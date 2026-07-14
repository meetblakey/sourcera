# Phase 37 Accessibility & i18n P1 Verification

**Date:** 2026-06-22
**Program:** v7.2.0-REM / v7.1.1 stamp-gate backlog
**Cluster:** BL-P1-PH37-A11Y

## Scope

This pass closes the canonical Phase 37 P1 rows D-37-001 through D-37-009 plus the cross-linked Phase 38 touch-target singleton row D-38-008.

The backlog row was stale before remediation: `_audit/REMEDIATION_BACKLOG.md` listed only five Phase 37 P1 rows, but `_audit/DEFECT_LEDGER.md` carried nine open Phase 37 P1 rows. D-38-008 shared the same root cause as D-37-001 and was closed in the same pass.

## Pre-Edit Backups

| File | Backup | md5 |
|---|---|---|
| `Sourcera_Master_Spec.md` | `_versions/Sourcera_Master_Spec_pre-phase-37-accessibility-i18n-p1-2026-06-22.md` | `e83db52b8f354ac9d06d410c9724eef9` |
| `_audit/DEFECT_LEDGER.md` | `_versions/DEFECT_LEDGER_pre-phase-37-accessibility-i18n-p1-2026-06-22.md` | `42ed0b9e1170dc0172d5ebdec9accdb9` |
| `_audit/REMEDIATION_BACKLOG.md` | `_versions/REMEDIATION_BACKLOG_pre-phase-37-accessibility-i18n-p1-2026-06-22.md` | `44703843aba09f993bf6dbf5366a12d0` |
| `_audit/V711_BACKLOG_INDEX.md` | `_versions/V711_BACKLOG_INDEX_pre-phase-37-accessibility-i18n-p1-2026-06-22.md` | `6a882f01d2f5b49553c05ef84cd4ac8e` |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-37-accessibility-i18n-p1-2026-06-22.md` | `db3e388080001da2e685679f6c6e99a3` |
| `_integration/RECONCILIATION.md` | `_versions/RECONCILIATION_pre-phase-37-accessibility-i18n-p1-2026-06-22.md` | `e53c2591163f37f4ce5856fcf00db08d` |

## True-Issue Adjudication

All ten rows were true P1 issues for stamp-gate purposes.

| Defect | Adjudication |
|---|---|
| D-37-001 | True issue: §37 and §38 had conflicting touch-target contracts. |
| D-37-002 | True issue: §37.3 contradicted §38.11 on RTL implementation posture. |
| D-37-003 | True issue: Settings -> Accessibility had references but no buildable settings surface or entity backing. |
| D-37-004 | True issue: §37 acceptance criteria were not specific enough to test WCAG conformance. |
| D-37-005 | True issue: §37 lacked Appendix M.1 / M.5 surface and gate bindings. |
| D-37-006 | True issue: VoiceOver coverage was absent from the screen-reader matrix. |
| D-37-007 | True issue: WCAG reflow fixtures for 320 CSS px and 400% zoom were missing. |
| D-37-008 | True issue: focus-management contracts were scattered and not aggregated in §37. |
| D-37-009 | True issue: bypass-blocks / skip-link behavior was not sufficiently specified. |
| D-38-008 | True issue: duplicate touch-target singleton drift remained in §3.4 / §38.1 / §38.5 after the §37 fix. |

## Spec Changes

- Added §4.2.14 `UserAccessibilityPreference` with field table, required indexes, scope isolation, retention / DSAR / residency, and acceptance criteria.
- Added Settings -> Accessibility to §36.1 and rewired §3.9.7 / §3.11.8 / §3.12.9 to the new preference entity.
- Rewrote §37.1 through §37.6 into a buildable accessibility and i18n contract: conformance posture, locale resolution, RTL behavior, accessibility settings, test pipeline, and numbered acceptance criteria.
- Normalized touch-target references in §3.4 / §37.1 / §38.1 / §38.5 / §46.3 to cite §38.6.2 instead of restating target-size values.
- Added 320 CSS px and 400% zoom reflow fixtures to §38.6.5 / §38.6.6.
- Added `UserAccessibilityPreference` retention coverage to §40.2.
- Updated §46.3 / §46.17 references to the new §37.5 / §37.6 meanings.
- Registered new accessibility enums and audit values in Appendix J.
- Registered Accessibility Settings, UserAccessibilityPreference, ARIA-Live, BCP-47, CSS Logical Properties, WCAG 2.1 AA, and axe-core in Appendix K.
- Added §37 rows to Appendix M.1 and eight Phase 37 gates to Appendix M.5; live §M.5 row-count prose now reads 162.

## Tracking Updates

- `_audit/DEFECT_LEDGER.md`: D-37-001 through D-37-009 and D-38-008 now read `remediated 2026-06-22`.
- `_audit/REMEDIATION_BACKLOG.md`: BL-P1-PH37-A11Y count reduced to 0 and ID cell expanded to D-37-001 through D-37-009 plus D-38-008.
- `_audit/V711_BACKLOG_INDEX.md`: advisory parsed P1-open count reduced from 503 to 493.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`: added AE-V72REM-PH37-A11Y-01 as `pending`.
- `_integration/RECONCILIATION.md`: appended Phase 37 Accessibility & i18n P1 closeout.

## Verification

### Target Status Check

Result: PASS.

All target rows now report `remediated 2026-06-22`: D-37-001, D-37-002, D-37-003, D-37-004, D-37-005, D-37-006, D-37-007, D-37-008, D-37-009, and D-38-008.

### Parsed P1 Count

Result: PASS.

Canonical parse of `_audit/DEFECT_LEDGER.md` now returns:

```text
P1_OPEN 493
```

This remains advisory until D-CONS latest-status propagation, duplicate review, and cluster-count reconciliation close.

### Conflict Marker Scan

Result: PASS.

No merge-conflict markers were found in the touched spec, audit, or integration files.

### Reference Check

Result: PASS.

The following records contain the expected Phase 37 / D-38-008 references:

- `_audit/DEFECT_LEDGER.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `_integration/RECONCILIATION.md`

### Touch-Target Singleton Check

Result: PASS.

Remaining touch-target contract references cite §38.6.2 / §37.1 rather than restating the old conflicting values. Remaining `44px` / `48x48px` matches are token, typography, icon, or logo references, not touch-target contract rows.

### Spec Lint

Command:

```bash
npm --prefix tools/spec-lint run all -- --no-emit
```

Result: PASS for all blocking gates.

```text
blocking  pass  0  appendix_anchor_slug_no_colon
blocking  pass  0  principle_9_anchor_canonicality
blocking  pass  0  appendix_i_internal_event_no_http_status
blocking  pass  0  defense_view_appendix_i_pairing
blocking  pass  0  appendix_m5_runtime_status_coverage
blocking  pass  0  appendix_m5_header_count_parity
blocking  pass  0  eval_starter_appendix_i_pairing
blocking  pass  0  appendix_m5_cross_reference_resolution_completeness

blocking gates worst exit code: 0
```

Known non-blocking advisory findings remain outside this pass:

```text
advisory  fail   52  solo_tier_numeric_single_source
advisory  fail  124  retention_singleton_section_40_2_canonical
advisory  fail   13  section_anchor_slug_no_colon
```

## Residuals

Phase 37 P2/P3 hygiene rows D-37-010 through D-37-023 remain separate unless closed by follow-on adjudication. Other Phase 38 mobile/responsive rows remain separate. The new §M.5 gates are spec-binding rows only until their M02.3 / M11.3 implementation-pack evidence lands.
