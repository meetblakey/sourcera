# v7.1.1 Phase & Workflow Error-Code Catalog Runtime Promotion Verify — 2026-07-07

## Scope

M02.3 spec-tree runtime evidence for `phase_workflow_error_code_catalog_complete`.

## Scope Boundary

This pass promotes a documentation/spec-tree gate only. Product API-handler emission, deployed middleware behavior, and integration-test coverage remain pending unless their own §M.5 rows carry runtime evidence.

## Gap Closed

D-4.2-004 and D-4.2-005 were remediated on 2026-06-21, but the §M.5 row still lacked a runtime detector artifact. This pass adds the detector and promotes the row after proof.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/phase_workflow_error_code_catalog_complete.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/phase_workflow_error_code_catalog_complete/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | No product-behavior rewrite was required. The detector locks active §2 / §10 / §32 phase-workflow wire errors to Appendix I Phase & Workflow Errors rows with HTTP, Used By, Meaning, and Localization Key metadata. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 327 blockers, down from 328. Remaining blockers: 194 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected missing-row, missing-HTTP, missing-Used-By, and missing-dependency-row findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 327 runtime-evidence blockers |

## Notes

No repo-level `package.json` or `tsconfig.json` exists in this folder. Detector compile/runtime validation is covered through `npx tsx` direct execution and the full `tools/spec-lint/run-all.ts` batch.
