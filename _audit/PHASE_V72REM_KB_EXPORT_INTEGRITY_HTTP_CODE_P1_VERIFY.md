# Phase V72REM KB Export Integrity HTTP Code P1 Verification

**Date:** 2026-06-21

**Scope:** D-V8.1-010 only.

## Result

PASS. The stale §22.18.7 AC #55 HTTP 502 reference is corrected to HTTP 410, matching §32.9.2, §32.9.4 AC #89, and Appendix I.

## Evidence

- §22.18.7 AC #55 now says `kb_export_archive_integrity_failed` returns HTTP 410.
- §32.9.2 still registers HTTP 410 for `kb_export_archive_integrity_failed`.
- §32.9.4 AC #89 still asserts HTTP 410 `kb_export_archive_integrity_failed`.
- Appendix I still registers `kb_export_archive_integrity_failed` as HTTP 410.
- §M.5 now registers `kb_export_integrity_http_code_single_source`.
- D-V8.1-010 is marked `remediated 2026-06-21` in `_audit/DEFECT_LEDGER.md`.
- `_integration/RECONCILIATION.md` contains the `KB Export Integrity HTTP Code P1 Pass (2026-06-21)` closeout note.

## Residuals

- Broader §32 endpoint-detail defects remain open and are outside this pass.
- D-V8.1-014 and D-V8.1-016 remain open for idempotency and Appendix I billing-error completeness.

## Targeted Checks

The targeted negative check found no active HTTP 502 / HTTP 404 / HTTP 500 pairing with `kb_export_archive_integrity_failed`, and no open D-V8.1-010 row.

The targeted positive check found the 410 pairings, §M.5 validator, remediated ledger row, and reconciliation closeout note.
