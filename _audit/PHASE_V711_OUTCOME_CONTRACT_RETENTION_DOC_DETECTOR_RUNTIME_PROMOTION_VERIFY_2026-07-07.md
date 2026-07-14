# v7.1.1 OutcomeContract Retention Runtime Promotion Verify — 2026-07-07

## Scope

M02.3 spec-tree runtime evidence for `outcome_contract_retention_bounded`.

## Scope Boundary

This pass promotes a documentation/spec-tree gate only. Deployed retention jobs, storage lifecycle enforcement, billing resolver behavior, and database constraints remain pending unless their own §M.5 rows carry runtime evidence.

## Gap Closed

D-3.5-014 had already bounded OutcomeContract retention in §6.8.5 row #9 and §40.2, but the §M.5 row still lacked a runtime detector. This pass found live residual drift before promotion: the §40.2 workspace-deletion carveout, §6.8.4.3 cascade registry, Appendix J `versioned_platform_contract` row, and the §M.5 assertion still carried stale unbounded platform-life wording.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/outcome_contract_retention_bounded.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/outcome_contract_retention_bounded/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | Rewrote stale OutcomeContract unbounded-retention prose in §6.8.4.3, §40.2, Appendix J, and §M.5 to point at the bounded active/superseded-version retention contract. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 322 blockers, down from 323. Remaining blockers: 189 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected unbounded-retention, missing bounded-window, missing redaction-rule, and missing §6.8.5 citation findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 322 runtime-evidence blockers |
