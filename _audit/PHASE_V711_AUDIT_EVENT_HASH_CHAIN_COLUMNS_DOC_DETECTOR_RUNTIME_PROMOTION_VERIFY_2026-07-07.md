# v7.1.1 Audit Event Hash-Chain Columns Runtime Promotion Verify — 2026-07-07

## Scope

M02.3 spec-tree runtime evidence for `audit_event_hash_chain_columns_present`.

## Scope Boundary

This pass promotes the documentation/spec-tree schema guard only. Deployed AuditEvent INSERT behavior, database constraints, and runtime hash-chain scan coverage remain pending unless their own §M.5 rows carry runtime evidence.

## Gap Closed

AE-3.4-001 and D-3.4-001 already authored the three AuditEvent hash-chain fields and §6.7.5 acceptance criteria, but the §M.5 row still lacked a runtime detector. This pass adds a detector that locks the schema and integrity-contract references.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/audit_event_hash_chain_columns_present.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/audit_event_hash_chain_columns_present/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | No product-behavior rewrite was required. The detector locks §4.6.1 and §6.7.5 coverage for `prev_event_hash`, `event_content_hash`, and `chain_position`. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 324 blockers, down from 325. Remaining blockers: 191 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected missing-column, missing-required, and missing-AC findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 324 runtime-evidence blockers |
