# v7.1.1 DSAR Audit Actor / Redaction Enum Runtime Promotion Verify — 2026-07-07

## Scope

M02.3 spec-tree runtime evidence for `dsar_audit_actor_and_redaction_enum_registration`.

## Scope Boundary

This pass promotes a documentation/spec-tree gate only. Deployed AuditEvent serialization, DSAR cascade worker implementation, event ingestion, and schema validators remain pending unless their own §M.5 rows carry runtime evidence.

## Gap Closed

D-3.5-015 had already registered the DSAR cascade worker actor and redaction-path enum, but the §M.5 row still lacked a runtime detector. This pass found one live residual enum gap before promotion: §29.7 used `notification_failure_audit_pseudonymized` as a DSAR row-redaction path without Appendix J registration.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/dsar_audit_actor_and_redaction_enum_registration.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/dsar_audit_actor_and_redaction_enum_registration/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | Added `notification_failure_audit_pseudonymized` to Appendix J `audit_event_payload_redaction_path` and bound it to §29.7. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 321 blockers, down from 322. Remaining blockers: 188 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected missing-actor-field and missing-redaction-path findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 321 runtime-evidence blockers |
