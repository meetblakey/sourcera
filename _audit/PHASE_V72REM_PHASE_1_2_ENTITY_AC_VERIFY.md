# Phase v7.2.0-REM Phase 1.2 Entity Acceptance Criteria Verification

**Date:** 2026-06-22  
**Scope:** D-1.2-006 (`acceptance_criteria`) — §4.3.1 through §4.3.19 Buyer entity anchors.

## 1. Backups

Created before canonical edits:

| File | Backup | md5 |
|---|---|---|
| `Sourcera_Master_Spec.md` | `_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-1-2-entity-acceptance-criteria.md` | `1ca555b61b31ef855ff1a57e518230ce` |
| `_audit/DEFECT_LEDGER.md` | `_versions/DEFECT_LEDGER_pre-2026-06-22-phase-1-2-entity-acceptance-criteria.md` | `07f3cca80c29407712e718ac0345873d` |
| `_audit/V711_BACKLOG_INDEX.md` | `_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-1-2-entity-acceptance-criteria.md` | `c7187db2ce3c25d51b000f16016c7d7b` |
| `_integration/RECONCILIATION.md` | `_versions/RECONCILIATION_pre-2026-06-22-phase-1-2-entity-acceptance-criteria.md` | `4b8865cfa7af5ff0ec05cff8512550c7` |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-1-2-entity-acceptance-criteria.md` | `f4950da73b4db99a1e480cbf6545d9bd` |

## 2. Adjudication

D-1.2-006 was a true live P1 issue. In current state before this pass, §4.3.1-§4.3.19 carried entity field tables and supporting prose but no explicit numbered `**Acceptance Criteria:**` blocks. The first nearby §4.3 AC blocks appeared at later entities. §4.3.9 is a retired anchor, so the correct treatment is a retired-anchor no-live-consumer AC block rather than live CRUD criteria.

## 3. Master Spec Evidence

Targeted scanner over `Sourcera_Master_Spec.md` reports:

```text
4.3.1: line=4420 ac_line=4459 numbered_lines=8
4.3.2: line=4469 ac_line=4488 numbered_lines=8
4.3.3: line=4498 ac_line=4520 numbered_lines=8
4.3.4: line=4530 ac_line=4563 numbered_lines=8
4.3.5: line=4573 ac_line=4597 numbered_lines=8
4.3.6: line=4607 ac_line=4628 numbered_lines=8
4.3.7: line=4638 ac_line=4656 numbered_lines=8
4.3.8: line=4666 ac_line=4706 numbered_lines=8
4.3.9: line=4773 ac_line=4777 numbered_lines=3
4.3.10: line=4782 ac_line=4801 numbered_lines=8
4.3.11: line=4811 ac_line=4854 numbered_lines=8
4.3.12: line=4864 ac_line=4910 numbered_lines=8
4.3.13: line=4920 ac_line=4957 numbered_lines=8
4.3.14: line=4967 ac_line=5008 numbered_lines=8
4.3.15: line=5018 ac_line=5067 numbered_lines=8
4.3.16: line=5077 ac_line=5140 numbered_lines=8
4.3.17: line=5150 ac_line=5217 numbered_lines=8
4.3.18: line=5227 ac_line=5281 numbered_lines=8
4.3.19: line=5291 ac_line=5337 numbered_lines=8
```

Interpretation:

- Live entities §4.3.1-§4.3.8 and §4.3.10-§4.3.19 each now have one explicit AC block with 8 numbered criteria.
- Retired anchor §4.3.9 now has one retired-anchor AC block with 3 numbered criteria.
- The ACs cover create/read/update or append-only behavior, scope isolation, lifecycle/soft-delete or retention, DSAR, and audit/bridge/runtime invariants as applicable to each entity.

## 4. Ledger Evidence

`_audit/DEFECT_LEDGER.md`:

- D-1.2-006 status is `remediated 2026-06-22`.
- Row evidence points to this verification artifact and AE-V72REM-PH12-ENTITY-AC-01.

`_audit/V711_BACKLOG_INDEX.md`:

- Current parsed index-series count row updated to 388 open P1 rows / 387 unique D-* IDs.
- Delta note added for the Phase 1.2 Entity Acceptance Criteria pass.

`_integration/AUTHORED_EXTENSIONS_LEDGER.md`:

- Added AE-V72REM-PH12-ENTITY-AC-01 with pending Founder sole-signer posture plus Engineering Lead / QA named-role trigger.

`_integration/RECONCILIATION.md`:

- Added Phase 1.2 Entity Acceptance Criteria Pass closeout with adjudication, change summary, residuals, and sign-off scoreboard.
- Earlier residual notes that said D-1.2-006 remained open were updated to time-scope the statement and point to this later closure.

## 5. Targeted Status Checks

Established index scanner:

```text
open_p1_rows=388 unique_ids=387
D-1.2-006_open= False
```

Direct row scan:

- `_audit/DEFECT_LEDGER.md` contains D-1.2-006 with `remediated 2026-06-22`.
- No canonical D-1.2-006 row remains `open`.

## 6. Full Spec Lint

Command:

```bash
cd tools/spec-lint && npm run all -- --no-emit
```

Result:

- Exit code: 0.
- All blocking gates pass.
- Advisory-only known findings:
  - `solo_tier_numeric_single_source`: 52
  - `retention_singleton_section_40_2_canonical`: 123
  - `section_anchor_slug_no_colon`: 13

The first lint run after authoring briefly increased `retention_singleton_section_40_2_canonical` to 125 because two new AC lines repeated retention durations. Those new literals were replaced with §40.2 references, and the final lint returned to the prior advisory posture.

## 7. Residuals

This pass intentionally does not close adjacent Phase 1.2 P2 rows:

- D-1.2-010 (`updated_by` fields)
- D-1.2-011 (Response / Score state-machine tables)
- D-1.2-012 (§40.2 retention rows)
- D-1.2-013 (indexes and cascade behavior)

Those require separate field, Appendix L, §40.2, and index authoring passes.
