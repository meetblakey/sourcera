# Phase V711 Appendix J Rate-Limit Path Runtime Promotion Verify

**Date:** 2026-07-07

## Scope

M02.3 spec-tree runtime evidence for `appendix_j_rate_limit_class_path_resolves`.

## Scope Boundary

This pass promotes the Master Spec documentation contract and detector only. It does not claim API gateway runtime enforcement, deployed endpoint behavior, Convex route implementation, or production analytics export proof.

## Gap Closed

The source already contained the corrected §51 analytics endpoint family, but the §M.5 row stayed pending because no detector artifact proved that Appendix J §51 rate-limit path references resolve to actual endpoint rows. The promotion adds fixture-backed enforcement that:

- Appendix J §51 path lists use concrete backticked method/path entries.
- Every Appendix J method/path entry exists in §51.3.5, §51.4.4, or §51.5.5.
- Every §51.3.5 / §51.4.4 / §51.5.5 endpoint is represented in Appendix J.
- §51 endpoint classes use registered `analytics_read` or `analytics_export` values.
- Backticked legacy `/usage/dashboard` method/path aliases fail unless a dual-emit/deprecation row is authored.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/appendix_j_rate_limit_class_path_resolves.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/appendix_j_rate_limit_class_path_resolves/`. |
| §M.5 status | Row promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | No new product behavior authored. §M.5 now binds detector path and fixture-backed proof. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` updated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 276 blockers, down from 277. Remaining blockers: 143 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected findings for missing Appendix J path coverage, missing endpoint coverage, unregistered rate-limit class, legacy `/usage/dashboard` method/path alias, and pending §M.5 status |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 276 runtime-evidence blockers |

## Artifact

Latest stamp-gate JSON: `/tmp/sourcera_stamp_gate_after_rate_limit_path.json`.
