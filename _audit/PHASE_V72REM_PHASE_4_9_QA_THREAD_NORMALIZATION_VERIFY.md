# Phase V72REM Phase 4.9 Q&A Thread Normalization Verification

Date: 2026-06-22

Status: closed for the Phase 4.9 P1 normalization subset.

## Scope

This verification covers the §18 Q&A Threads normalization pass and closes these P1 defect rows:

- D-4.9-001
- D-4.9-002
- D-4.9-003
- D-4.9-004
- D-4.9-005
- D-4.9-006
- D-4.9-007
- D-4.9-008
- D-4.9-009
- D-4.9-012
- D-4.9-013
- D-4.9-015

Residual rows intentionally remain open:

- D-4.9-010: numerical singleton migration for §18 literals into §34.1.1 / §39.
- D-4.9-014: Appendix M / cross-console retrieval surface mapping for the Q&A Suggestion agent.
- D-4.9-011: P2 Appendix M consistency drift.

## Pre-Edit Backups

| File | Backup | MD5 |
|---|---|---|
| `Sourcera_Master_Spec.md` | `_versions/Sourcera_Master_Spec_pre-phase-4-9-qa-thread-normalization-2026-06-22.md` | `d96b7f3848a01cf6bc5e535f57bd2ed6` |
| `_audit/DEFECT_LEDGER.md` | `_versions/DEFECT_LEDGER_pre-phase-4-9-qa-thread-normalization-2026-06-22.md` | `81ce0285d95481344e725f138c788a49` |
| `_audit/REMEDIATION_BACKLOG.md` | `_versions/REMEDIATION_BACKLOG_pre-phase-4-9-qa-thread-normalization-2026-06-22.md` | `1847a3a534e068ec1e207e25e40d070f` |
| `_audit/V711_BACKLOG_INDEX.md` | `_versions/V711_BACKLOG_INDEX_pre-phase-4-9-qa-thread-normalization-2026-06-22.md` | `b5542ec904e3b727920ff881fe1b487f` |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-4-9-qa-thread-normalization-2026-06-22.md` | `6de372ae1e15c52b9d075f2902bd816c` |
| `_integration/RECONCILIATION.md` | `_versions/RECONCILIATION_pre-phase-4-9-qa-thread-normalization-2026-06-22.md` | `e78b36fbab41002adbaa2d05d4744d58` |

## Post-Edit Fingerprints

| File | MD5 |
|---|---|
| `Sourcera_Master_Spec.md` | `73bf8a7b597d8d56742013b9c72f2f60` |
| `_audit/DEFECT_LEDGER.md` | `0a0cf1ac23e10293dc629ab5207856be` |
| `_audit/REMEDIATION_BACKLOG.md` | `17de9a66088a11f5ca7d994b3e288737` |
| `_audit/V711_BACKLOG_INDEX.md` | `852a8fd0862aed612479d16f752a6585` |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | `ff4ac1871a50ad89f73bdb61798bacb4` |
| `_integration/RECONCILIATION.md` | `1ef38b64dca062dcfd830c22c95e79fb` |

## Master Spec Landing Sites

| Landing site | Verification |
|---|---|
| §18.3.1 | Replaced the JSON-shaped thread schema with Q&A Thread / Q&A Post / Q&A Mention field tables, required metadata fields, indexes, scope isolation, relationships, retention, DSAR, residency, and migration notes. |
| §4.3.15 | Retired the future-normalization deferral; Unread Marker Q&A mention derivation now uses normalized Q&A Mention rows, with `qa_post_mentions` limited to migration fallback. |
| §4.6.2 | Aligned Q&A attachments to the canonical `qa_thread_post` attachment owner entity. |
| §18.3.2 / §18.3.3 | Authored NDA-aware visibility, PRIVATE -> PUBLIC rules, pre-flip suppression, active-NDA suppression, and vendor identity masking fields. |
| §18.5.2 / §18.5.3 | Bound attachments, malware failure behavior, Q&A Mention rows, Appendix C/G event emission, §29.3 notification preferences, digest behavior, DSAR redaction, and residency re-checks. |
| §18.8 / §18.9 / §18.10 | Added acceptance criteria, API contracts, error-code references, idempotency expectations, privacy, DSAR, residency, and notification behavior. |
| §40.2 | Added Q&A Thread / Post / Mention and Q&A Attachment retention rows. |
| Appendix C / G / I / J / L.13 | Registered Q&A domain events, analytics events, error codes, enums, audit actions, and the Q&A Thread status state machine. |

Appendix L.13 is used for the Q&A Thread state machine because Appendix L.8 is already occupied in the active Master Spec; the older defect recommendation's L.8 label was stale numbering, not a product requirement.

## Ledger And Backlog Evidence

`_audit/DEFECT_LEDGER.md` now marks D-4.9-001 / -002 / -003 / -004 / -005 / -006 / -007 / -008 / -009 / -012 / -013 / -015 as:

`remediated 2026-06-22 (v7.2.0-REM Phase 4.9 Q&A normalization pass)`

The parsed advisory P1-open count is now 448.

`_audit/REMEDIATION_BACKLOG.md` row `BL-P1-PH4P49-DM` now has count `0`, preserving residual notes for D-4.9-010 and D-4.9-014.

Top-50 backlog arithmetic after the update:

- top table rows: 50
- summed row count: 50
- nonzero rows: 14
- zero rows: 36
- `BL-P1-PH4P49-DM`: 0

`_audit/V711_BACKLOG_INDEX.md` records the 460 -> 448 advisory parsed P1-open-count delta and names the residual Phase 4.9 rows.

`_integration/AUTHORED_EXTENSIONS_LEDGER.md` records `AE-V72REM-PH4P49-QA-NORMALIZATION-01` as pending human ratification.

`_integration/RECONCILIATION.md` records the defect-to-landing-site map and the residual rows intentionally left open.

## Verification Commands

Stale body-language scan:

`rg -n '"posts"|"user_role"|Vendor \| Buyer|§18\.3\.1 does not normalize|future phase should normalize|qa_thread_status.*Appendix L\.8|owner_entity_type.*qa_post' Sourcera_Master_Spec.md`

Result: no matches.

Conflict-marker scan:

`rg -n '<{7}|={7}|>{7}' Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _audit/REMEDIATION_BACKLOG.md _audit/V711_BACKLOG_INDEX.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md`

Result: no matches.

Spec lint:

`npm --prefix tools/spec-lint run all -- --no-emit`

Result: exit code 0. Blocking gates passed. Advisory findings remain for already-open singleton / anchor classes, including the Phase 4.9 residual numeric-singleton row D-4.9-010; this verification does not close those residuals.

## Closure Decision

The active Master Spec no longer contains the old §18 JSON body, embedded-post schema, `Vendor | Buyer` author-role drift, future-normalization language, stale Appendix L.8 Q&A status reference, or stale `qa_post` attachment owner reference. The normalization subset is a true issue set and is closed for the twelve P1 rows listed above.
