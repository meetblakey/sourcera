# Phase v7.1.1 Appendix I Billing Error-Code Catalog Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree runtime evidence for `appendix_i_billing_error_code_catalog_complete`

## Boundary

This pass promotes a documentation/spec-tree gate only. Product API handlers, localized error rendering, client error mapping, deploy validators, and endpoint integration tests remain pending unless their own §M.5 rows carry runtime evidence.

## Gap Closed

The active §32.8 billing API family had endpoint-local error/catalog drift:

- §32.8.17 used shorthand prose instead of an explicit endpoint-local error table.
- §32.8.18 referenced unregistered `org_not_found`.
- §32.8.19 and §32.8.21 used shorthand billing error prose instead of concrete Appendix I-backed tables.
- §32.8.23 lacked an acceptance criterion binding §32.8.10-.22 endpoint error tables to Appendix I.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/appendix_i_billing_error_code_catalog_complete.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/appendix_i_billing_error_code_catalog_complete/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | Replaced shorthand §32.8.17 / §32.8.19 / §32.8.21 error prose with concrete endpoint-local tables; replaced §32.8.18 `org_not_found` with canonical non-leak billing errors; added §32.8.23 AC #23. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 332 blockers, down from 333. Remaining blockers: 199 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected shorthand-prose, missing-code, HTTP drift, and missing-AC findings |
| `npm --prefix tools/spec-lint run typecheck` | Pass |
| `npm --prefix tools/spec-lint run all -- --no-emit` | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 332 runtime-evidence blockers |

