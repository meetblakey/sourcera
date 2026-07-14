# Phase v7.2.0-REM — Phase 4.6 TCO Runtime/API/Event P1 Verification

**Date:** 2026-06-23  
**Scope:** D-4.6-007, D-4.6-008, D-4.6-009, D-4.6-010, D-4.6-011, D-4.6-012, D-4.6-013, D-4.6-014  
**Status:** Closed / remediated or stale-status-synced in the canonical ledger.

## Sources Read

- `Sourcera_Master_Spec.md` §1.3 / §1.6, §4.3.28 / §4.7.1, §6.8, §15, §25.1.2, §31, §32, §40.2, Appendix C, Appendix G, Appendix I, Appendix J, Appendix K.
- `_audit/DEFECT_LEDGER.md` Phase 4.6 rows.
- `_audit/REMEDIATION_BACKLOG.md` BL-P1-PH4P46-DM.
- `_audit/V711_BACKLOG_INDEX.md`.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`.

## Classification

| Defect | Classification | Evidence / disposition |
|---|---|---|
| D-4.6-007 | True issue | §32.5 / §32.5.2 now define TCO model, pricing-requirement, configure, recalculate, breakdown, and export endpoints with auth, RBAC, rate-limit class, idempotency, schemas, examples, errors, and side effects. |
| D-4.6-008 | True issue | §31.17, Appendix C, and Appendix G now register TCO customer webhook events and observability mirrors. |
| D-4.6-009 | True issue | §15.4.2 and §15.7.4 now define single-vendor percentile behavior and prevent NaN propagation. |
| D-4.6-010 | Partially stale / partially true | Current §4.3.28 / §40.2 already covered parent Workspace retention, DSAR, and residency cascade; §15.3.2a now closes the missing residency-bound recalculation short-circuit. |
| D-4.6-011 | True issue | §15.2.6, §4.7.1, and §25.1.2 now define seller-facing Pricing Requirement projection and redact TCO internals / competing-vendor data. |
| D-4.6-012 | True issue | §15.5.2 and Appendix J now register TCO AuditEvent action and entity vocabulary. |
| D-4.6-013 | True issue | §15.2.3, §4.3.28.1, §4.3.28.3, Appendix J, and Appendix I now replace free-form discount scope with typed `discount_applied_to` validation. |
| D-4.6-014 | True issue | §15.2.5, §15.7.1, §32.5.2, and Appendix I now reject circular, too-deep, cross-model, and unsupported `percentage_of_license` references. |

## Files Updated

- `Sourcera_Master_Spec.md`
- `_audit/DEFECT_LEDGER.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_integration/RECONCILIATION.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `_audit/PHASE_V72REM_PHASE_4_6_TCO_RUNTIME_API_EVENT_P1_VERIFY.md`

## Backups

- `_versions/Sourcera_Master_Spec_pre-phase-4-6-tco-runtime-p1-2026-06-23.md`
- `_versions/DEFECT_LEDGER_pre-phase-4-6-tco-runtime-p1-2026-06-23.md`
- `_versions/V711_BACKLOG_INDEX_pre-phase-4-6-tco-runtime-p1-2026-06-23.md`
- `_versions/REMEDIATION_BACKLOG_pre-phase-4-6-tco-runtime-p1-2026-06-23.md`
- `_versions/RECONCILIATION_pre-phase-4-6-tco-runtime-p1-2026-06-23.md`
- `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-4-6-tco-runtime-p1-2026-06-23.md`

## Count Evidence

Right-edge canonical-row parser after row updates:

```text
open_p1_rows=110
unique_open_p1_ids=110
```

The parser intentionally reads the status cell from the right edge because some ledger cells contain pipe characters inside enum examples; fixed-column parsers undercount.

## Verification

Command run:

```bash
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

Result:

```text
blocking gates worst exit code: 0 (advisory findings are non-blocking)
```

Blocking gates all passed. Advisory-only findings remain in pre-existing singleton and heading-anchor hygiene classes:

- `solo_tier_numeric_single_source`
- `retention_singleton_section_40_2_canonical`
- `section_anchor_slug_no_colon`

No advisory finding is introduced by or specific to the Phase 4.6 TCO Runtime/API/Event rows closed in this pass.

## Residuals

Lower-severity Phase 4.6 rows remain open unless separately remediated or status-synced, including D-4.6-015, D-4.6-016, D-4.6-019, D-4.6-021, D-4.6-023, D-4.6-028, D-4.6-029, and D-4.6-030 where still marked open.
