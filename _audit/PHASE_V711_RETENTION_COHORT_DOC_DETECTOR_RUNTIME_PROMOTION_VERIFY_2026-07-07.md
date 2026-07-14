# Phase v7.1.1 Retention Cohort Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `retention_cohort_canonical_consumer`
**Pack:** M02.3
**Result:** Promoted to `runtime_active`

## Scope

This pass promotes spec-tree runtime evidence for the §51.0.2 Retention Cohorts canonical-consumer contract.

## Scope Boundary

This pass promotes the Master Spec analytics-source contract and spec-lint detector only. PostHog query generation, dashboard rendering code, deployed analytics jobs, and deploy validators remain pending unless their own rows carry runtime evidence.

## Conflict Closed

§51.0.2 already defined the canonical Retention Cohorts registry. §50.14.3 still used D1 / D7 / D30 retention labels without binding them to §51.0.2, and §51.0.2 claimed an Engagement & Retention panel that §51.3 did not define. The fix makes §50.14.3 consume §51.0.2, adds the §51.3 Engagement & Retention panel, and prevents downstream surfaces from redefining cohort anchor or returning events inline.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/retention_cohort_canonical_consumer.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/retention_cohort_canonical_consumer/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §50.14.3 now binds retention dashboard labels to §51.0.2; §51.3 adds `retention_cohort_summary_json`, defines Panel 6 Engagement & Retention, and adds acceptance criteria requiring §51.0.2 as the only cohort source. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 307 blockers, down from 308. Remaining blockers: 174 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected missing §51.0.2 authority, missing dashboard field, missing panel, inline cohort redefinition, and pending-status findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 307 runtime-evidence blockers |
