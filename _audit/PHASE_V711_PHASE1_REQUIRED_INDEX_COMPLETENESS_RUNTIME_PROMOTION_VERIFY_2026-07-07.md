# Phase v7.1.1 — Phase 1 Required Index Completeness Runtime Promotion Verify

**Date:** 2026-07-07  
**Gate:** `phase1_required_index_completeness`  
**Scope:** M02.3 spec-tree runtime evidence.

## Boundary

This pass promotes the Master Spec entity-index contract and detector only. It does not claim database migration execution, Convex schema deployment, query-plan benchmark evidence, product API behavior, or production telemetry proof.

## Disposition

| Surface | Result |
|---|---|
| Runtime harness | Added `tools/spec-lint/gates/phase1_required_index_completeness.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/phase1_required_index_completeness/`. |
| §M.5 status | Promoted `phase1_required_index_completeness` from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source behavior | No new product behavior was authored; existing D-DEC-002 required indexes are now detector-backed. |
| Blocker inventory | Regenerated `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv`. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 282 blockers, down from 283. Remaining blockers: 149 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
|---|---|
| Direct detector run | PASS, 0 findings |
| Pass fixture | PASS, 0 findings |
| Fail fixture | FAIL with 20 expected findings for missing subscribed-thread GIN lookup, missing referee-email exclusivity lookup, missing buyer/vendor 365-day lookup, missing reversal-aware Time-Saved aggregate filter, and pending §M.5 status |
| Typecheck | PASS |
| Full spec-lint batch | PASS, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | FAIL overall on the remaining 282 runtime-evidence blockers |

## Files

| File | Change |
|---|---|
| `Sourcera_Master_Spec.md` | Promoted the §M.5 row to `runtime_active`. |
| `tools/spec-lint/gates/phase1_required_index_completeness.ts` | Added detector. |
| `tools/spec-lint/fixtures/phase1_required_index_completeness/pass.md` | Added positive fixture. |
| `tools/spec-lint/fixtures/phase1_required_index_completeness/fail.md` | Added negative fixture. |
| `tools/spec-lint/run-all.ts` | Registered detector. |
| `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` | Updated counts and closed-row evidence. |
| `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv` | Regenerated from current stamp-gate findings. |
| `_audit/V711_BACKLOG_INDEX.md` | Added current delta note and updated promoted-row count. |

## Commands

```bash
npx tsx tools/spec-lint/gates/phase1_required_index_completeness.ts --spec Sourcera_Master_Spec.md
npx tsx tools/spec-lint/gates/phase1_required_index_completeness.ts --spec tools/spec-lint/fixtures/phase1_required_index_completeness/pass.md
npx tsx tools/spec-lint/gates/phase1_required_index_completeness.ts --spec tools/spec-lint/fixtures/phase1_required_index_completeness/fail.md
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json
```
