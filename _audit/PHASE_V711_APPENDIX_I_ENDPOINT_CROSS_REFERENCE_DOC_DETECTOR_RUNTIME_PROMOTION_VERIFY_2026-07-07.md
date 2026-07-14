# Phase v7.1.1 Appendix I Endpoint Cross-Reference Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree runtime evidence for `appendix_i_endpoint_cross_reference_completeness`

## Boundary

This pass promotes a documentation/spec-tree gate only. Product API handlers, client error rendering, endpoint integration tests, deploy validators, and localized string registries remain pending unless their own §M.5 rows carry runtime evidence.

## Gap Closed

The Appendix I preamble required every error-code row to carry endpoint traceability, but legacy and post-V8.4 tables still relied on section prose or row meanings instead of a concrete `Used By` / `Endpoint` field.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/appendix_i_endpoint_cross_reference_completeness.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/appendix_i_endpoint_cross_reference_completeness/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | Backfilled explicit Used By traceability across 35 Appendix I HTTP-code tables / 442 rows; tightened four weak trace cells; updated `cold_pipeline_no_vendor_response_abort_path` to match the expanded Appendix I row shape. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 331 blockers, down from 332. Remaining blockers: 198 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected missing-column, blank-used-by, and weak-trace findings |
| `npm --prefix tools/spec-lint run typecheck` | Pass |
| `npm --prefix tools/spec-lint run all -- --no-emit` | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 331 runtime-evidence blockers |

