# Phase v7.2.0-REM — Phase 9.1 Appendix G Instrumentation P1 Verification

**Date:** 2026-06-22
**Cluster:** `BL-P1-PH9P91-INSTR`
**Status:** Spec-side remediation complete; runtime wiring remains governed by M21.3 / release-orchestration gates.

## Scope

This pass closes the six live P1 instrumentation-gap rows in the Phase 9.1 Appendix G cluster:

- D-9.1-001 — Defense View generation/regeneration PostHog registrations.
- D-9.1-004 — Phase 3V notification mirror registrations.
- D-9.1-005 — Marketplace Discovery webhook-to-PostHog mirror registrations.
- D-9.1-006 — Billing base §31.8 mirror registrations.
- D-9.1-010 — Buyer Maya intake completion registration.
- D-9.1-012 — Promoted-listing impression and EOI funnel registrations.

The pass intentionally does not close D-9.1-002 / -003 / -007 / -008 / -009 / -011 / -013 / -014 / -016 / -019, which remain separate instrumentation, naming, enum, consistency, or retention rows.

## True-Issue Adjudication

All six rows were true spec issues against the current Master Spec before this pass:

- The relevant product sections and Appendix C rows claimed Appendix G coverage that was absent.
- Billing and Marketplace Discovery surfaces required parallel PostHog mirrors, but Appendix G did not register the complete live event families.
- `marketplace_promoted_listing_clicked` referenced an `impression_id` without a corresponding impression event, making CTR denominator enforcement underspecified.
- Buyer Maya intake telemetry was declared as an authored follow-up, but no Appendix G event row existed.

## Remediation Summary

- Added Defense-View-Domain Appendix G events: `defense_view_generated`, `defense_view_regenerated`, `defense_view_regenerated_due_to_source_change`.
- Added Phase 3V mirror events for Security-Domain, Console-Bridge-Anomaly, DSAR-Lifecycle, and WorkOS Group Lifecycle notifications.
- Added Buyer-Maya-Intake event `workspace_intake_completed`.
- Added Marketplace-Discovery-Domain mirror events for the live §34.16.7 event set, including `promoted_listing_auction_lost`.
- Added promoted-listing funnel events `marketplace_promoted_listing_impression` and `marketplace_promoted_listing_eoi`.
- Extended Billing-Domain events with missing base §31.8 mirrors.
- Normalized Defense View references so Appendix G mirror events are underscore-form while dotted source webhook types remain source payload values.

## Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-phase-9-1-appendix-g-instr-p1-2026-06-22.md` — md5 `933ed70af65ec3e02e30b74607378aa8`
- `legacy-import:_versions/DEFECT_LEDGER_pre-phase-9-1-appendix-g-instr-p1-2026-06-22.md` — md5 `b933867efc6e42faac5d4736c1fe9a65`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-phase-9-1-appendix-g-instr-p1-2026-06-22.md` — md5 `21b7f113acb71740d80d3784fcfa3669`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-phase-9-1-appendix-g-instr-p1-2026-06-22.md` — md5 `558d64bcc9929fc5fb49993ffc3123b1`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-9-1-appendix-g-instr-p1-2026-06-22.md` — md5 `9a727cc89f334f317fbe346cfe106ad2`
- `legacy-import:_versions/RECONCILIATION_pre-phase-9-1-appendix-g-instr-p1-2026-06-22.md` — md5 `57c6785dad82d6091cfde58dcf40f207`

## Artifact Updates

- `_audit/DEFECT_LEDGER.md` — six rows moved to `remediated 2026-06-22`.
- `_audit/REMEDIATION_BACKLOG.md` — `BL-P1-PH9P91-INSTR` count reduced to 0.
- `_audit/V711_BACKLOG_INDEX.md` — advisory parsed P1-open count reduced from 513 to 507 and delta note added.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` — AE-V72REM-PH9P91-INSTR-01 added as pending.
- `_integration/RECONCILIATION.md` — Phase 9.1 reconciliation block added.

## Verification Commands

- Confirm no targeted rows remain open in `_audit/DEFECT_LEDGER.md`.
- Confirm parsed canonical P1-open count is 507.
- Confirm `BL-P1-PH9P91-INSTR` shows count 0.
- Confirm AE / reconciliation / index references resolve.
- Run `npm --prefix tools/spec-lint run all -- --no-emit`.
- Scan touched files for conflict markers.

## Verification Results

- Targeted rows D-9.1-001 / -004 / -005 / -006 / -010 / -012 are no longer open.
- Robust right-edge parse of `_audit/DEFECT_LEDGER.md` reports 507 canonical P1 rows with `status=open`.
- `_audit/REMEDIATION_BACKLOG.md` row `BL-P1-PH9P91-INSTR` reports count 0.
- AE, reconciliation, backlog index, backlog row, and verification-file references resolve for AE-V72REM-PH9P91-INSTR-01.
- Conflict-marker scan across touched files returned no matches.
- `npm --prefix tools/spec-lint run all -- --no-emit` exited 0. Blocking gates passed. Advisory-only findings remain: `solo_tier_numeric_single_source` (52), `retention_singleton_section_40_2_canonical` (124), and `section_anchor_slug_no_colon` (13).

## Residuals

The following rows remain open and are not part of this closure:

- D-9.1-002 — Defense View third-party-outage failure event.
- D-9.1-003 — Defense View opened/dismissed UX events.
- D-9.1-007 — dot-form / underscore-form naming convention drift.
- D-9.1-008 — sampling-rate enum violation.
- D-9.1-009 — event-block cross-link issue.
- D-9.1-011 — audit-reverse-pass event naming gap.
- D-9.1-013 — marketplace promoted-listing clicked property drift.
- D-9.1-014 — buyer-evaluation started/completed funnel naming.
- D-9.1-016 — Hero Moment legacy alias retirement ambiguity.
- D-9.1-019 — event-family retention binding gap.
