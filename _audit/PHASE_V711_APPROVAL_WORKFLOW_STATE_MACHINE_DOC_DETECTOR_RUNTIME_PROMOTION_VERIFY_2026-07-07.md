# Phase v7.1.1 Approval Workflow State-Machine Doc-Detector Runtime Promotion Verify

Date: 2026-07-07  
Status: PASS  
Gate: `approval_workflow_state_machine_canonicality`  
Scope: M02.3 spec-tree runtime evidence.

## Scope Boundary

This pass promotes a documentation/spec-tree gate only. Product-codebase approval routing, score APIs, phase-advance handlers, and integration tests remain pending unless their own runtime evidence exists.

## Conflict Closed

§5.7 / §5.11 still allowed post-Phase-12 score unlock by Workspace Owner (`score.lock_override`), while §10.12, §4.3.25, Appendix J, and Appendix L.12 require Phase 12 approval rejection / request-changes to remain an Approval Workflow sub-state without unlocking scores or moving the Workspace backward. The stale RBAC path is now replaced with a forbidden post-Phase-12 score-mutation row returning `scores_immutable_phase_12_plus`.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/approval_workflow_state_machine_canonicality.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 345 blockers, down from 346. Remaining blockers: 212 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| `npm --prefix tools/spec-lint run typecheck` | Pass |
| `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --reconciliation _integration/RECONCILIATION.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | Pass, 0 blocking findings |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` | Fails overall on the remaining 345 runtime-evidence blockers |

## Updated Artifacts

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/gates/approval_workflow_state_machine_canonicality.ts`
- `tools/spec-lint/run-all.ts`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
