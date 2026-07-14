# Phase V711 AIOperation Settlement-State Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** `aioperation_settlement_state_canonical_consumer`
**Result:** PASS for detector promotion; release stamp still FAILS on unrelated runtime-evidence blockers.

## Scope Boundary

This pass promotes a documentation/spec-tree gate only. Product-code AIOperation writers, contest handlers, webhook serializers, and billing replay tests remain pending unless their own §M.5 rows carry runtime evidence.

## Gap Closed

D-V8.1-022 previously removed the retired AIOperation `committed` settlement-state token from §32.8.13. This pass adds a repeatable detector that keeps the closure live:

- Appendix J `ai_operation_settlement_state` must define exactly `pending`, `accepted`, `rejected`, `auto_accepted`, `contested`, and `reversed`.
- §4.8.1 AIOperation must list only those canonical values for `settlement_state`.
- §4.8.5 ContestRecord must define `original_settlement_state` as the accepted / auto-accepted restore pointer.
- §32.8.13 contest withdrawal must restore AIOperation.`settlement_state` from `contested` to ContestRecord.`original_settlement_state`.
- Retired `committed` settlement-state prose and AIOperation `status` transition wording are rejected.

## Files

| File | Change |
|---|---|
| `tools/spec-lint/gates/aioperation_settlement_state_canonical_consumer.ts` | Added detector. |
| `tools/spec-lint/fixtures/aioperation_settlement_state_canonical_consumer/pass.md` | Added positive fixture. |
| `tools/spec-lint/fixtures/aioperation_settlement_state_canonical_consumer/fail.md` | Added negative fixture. |
| `tools/spec-lint/run-all.ts` | Registered detector in `GATES_RUNTIME_ACTIVE`. |
| `Sourcera_Master_Spec.md` | Promoted §M.5 row to `runtime_active`. |
| `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv` | Regenerated blocker inventory. |
| `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` | Updated count posture and closed-gate row. |
| `_audit/V711_BACKLOG_INDEX.md` | Added current delta note. |
| `_integration/RECONCILIATION.md` | Added closeout note. |

## Verification

| Check | Result |
|---|---|
| `npx tsx tools/spec-lint/gates/aioperation_settlement_state_canonical_consumer.ts --spec Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| `npx tsx tools/spec-lint/gates/aioperation_settlement_state_canonical_consumer.ts --spec tools/spec-lint/fixtures/aioperation_settlement_state_canonical_consumer/pass.md --no-emit` | PASS, 0 findings |
| `npx tsx tools/spec-lint/gates/aioperation_settlement_state_canonical_consumer.ts --spec tools/spec-lint/fixtures/aioperation_settlement_state_canonical_consumer/fail.md --no-emit` | FAIL as expected |
| `npm --prefix tools/spec-lint run typecheck` | PASS |
| `npm --prefix tools/spec-lint run all -- --no-emit` | PASS, 0 blocking findings |
| `npx tsx tools/release/stamp_gate.ts --json` | FAILS overall on remaining 333 runtime-evidence blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| `runtime_active` rows | 84 | 85 |
| `spec_binding_pending_pack_m02_3` rows | 201 | 200 |
| Total blockers | 334 | 333 |

