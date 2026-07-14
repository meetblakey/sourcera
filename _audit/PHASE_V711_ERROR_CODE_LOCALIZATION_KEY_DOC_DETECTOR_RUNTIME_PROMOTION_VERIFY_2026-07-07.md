# Phase v7.1.1 Error-Code Localization Key Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree runtime evidence for `error_code_localization_key_completeness`

## Boundary

This pass promotes a documentation/spec-tree gate only. Product i18n runtime rendering, translation bundle generation, client locale negotiation, and localized copy QA remain pending unless their own §M.5 rows carry runtime evidence.

## Gap Closed

The Appendix I preamble required `error.<scope>.<code>` localization keys, but many legacy and post-V8.4 HTTP-code tables still relied on implicit preamble-derived keys instead of explicit row-level keys.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/error_code_localization_key_completeness.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/error_code_localization_key_completeness/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | Backfilled explicit `error.<scope>.<code>` localization keys across 50 Appendix I HTTP-code tables / 742 rows; corrected two table-shape defects surfaced by the detector after the mechanical insert. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 330 blockers, down from 331. Remaining blockers: 197 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected missing-column, blank-key, and wrong-suffix findings |
| `npm --prefix tools/spec-lint run typecheck` | Pass |
| `npm --prefix tools/spec-lint run all -- --no-emit` | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 330 runtime-evidence blockers |

