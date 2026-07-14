# Phase v7.1.1 UsageEventDailyAggregate Entity Contract Runtime Promotion Verify

**Date:** 2026-07-07  
**Gate:** `usage_event_daily_aggregate_entity_contract`  
**Scope:** M02.3 spec-tree runtime evidence for §4.3.18.A UsageEventDailyAggregate.

## Scope Boundary

This pass promotes the Master Spec entity-contract guard only. It does not claim product aggregation-worker runtime, dashboard-query runtime, Convex schema deployment, PostHog outbox runtime, or performance benchmark evidence.

## Conflict / Gap Closed

§4.3.18.A already authored UsageEventDailyAggregate at entity-table fidelity, but §M.5 still had no detector proof. The promoted detector locks the field table, unique bucket key, scope isolation, retention/DSAR, indexes, authoring intent, and acceptance criteria for dashboard, wallet, and Time-Saved read paths.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/usage_event_daily_aggregate_entity_contract.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/usage_event_daily_aggregate_entity_contract/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | No new product behavior was authored; §M.5 now binds the detector path and fixture-backed proof. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 283 blockers, down from 284. Remaining blockers: 150 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with 27 expected findings for missing aggregate schema, unique key, scope, retention/DSAR, authoring intent, ACs, and §M.5 runtime binding |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 283 runtime-evidence blockers |

## Remaining Boundaries

- `phase1_required_index_completeness` remains pending and owns the D-DEC-002 required-index guard.
- Product aggregation-worker/runtime evidence remains out of scope for this pass.
