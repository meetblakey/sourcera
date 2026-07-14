# Phase v7.1.1 Growth Mechanic Rate-Limit Runtime Promotion Verify

**Date:** 2026-07-09
**Scope:** Promote `growth_mechanic_rate_limit_coverage` only after live Master Spec proof, pass/fail fixture proof, TypeScript proof, full spec-lint proof, and stamp-gate proof.

## Result

PASS for the named spec-tree runtime promotion.

The release stamp gate still fails, as expected, on unrelated runtime-evidence blockers.

## Documentation Gap Closed

`growth_mechanic_rate_limit_coverage` was not historical. The live gap was real:

- §48.5 claimed mechanic-level rate-limit coverage but only listed M6, M7, and M9-M13.
- M4 lacked a concrete conversion-velocity guard and matching Appendix I error.
- M8 had an inline Ops recompute throttle but was not bound into the central M1-M17 registry.

This pass closes that documentation gap by expanding §48.5 to all M1-M17 rows, adding the M4 velocity guard, and registering Appendix I `m4_conversion_velocity_exceeded`.

## Commands

| Check | Command | Result |
|---|---|---|
| Live detector | `npx tsx tools/spec-lint/gates/growth_mechanic_rate_limit_coverage.ts --spec Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| Pass fixture | `npx tsx tools/spec-lint/gates/growth_mechanic_rate_limit_coverage.ts --spec tools/spec-lint/fixtures/growth_mechanic_rate_limit_coverage/pass.md --no-emit` | PASS, 0 findings |
| Fail fixture | `npx tsx tools/spec-lint/gates/growth_mechanic_rate_limit_coverage.ts --spec tools/spec-lint/fixtures/growth_mechanic_rate_limit_coverage/fail.md --no-emit` | FAIL as expected, 27 findings |
| Typecheck | `npm run typecheck` from `tools/spec-lint` | PASS |
| Full spec-lint batch | `npm run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` from `tools/spec-lint` | PASS, 0 blocking findings |
| Stamp gate | `npx tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json > _audit/_tmp/v711_stamp_gate_after_growth_rate_limit.json` | FAIL as expected on 228 unrelated runtime-evidence blockers |

## Stamp-Gate Evidence

Latest source: `_audit/_tmp/v711_stamp_gate_after_growth_rate_limit.json`

| Runtime status | Count |
|---|---:|
| `runtime_active` | 190 |
| `spec_binding_pending_pack_m02_3` | 95 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |

Blockers: 228.

Target gate findings for `growth_mechanic_rate_limit_coverage`: 0.

## Artifacts

- `tools/spec-lint/gates/growth_mechanic_rate_limit_coverage.ts`
- `tools/spec-lint/fixtures/growth_mechanic_rate_limit_coverage/pass.md`
- `tools/spec-lint/fixtures/growth_mechanic_rate_limit_coverage/fail.md`
- `Sourcera_Master_Spec.md` §48.5, M4, Appendix I, and §M.5.12
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.csv`
- `_audit/_tmp/v711_stamp_gate_after_growth_rate_limit.json`
- `_audit/_tmp/v711_stamp_gate_latest.json`

## Boundary

This verification proves spec-tree rate-limit documentation coverage only. It does not prove product-runtime throttling, deploy validators, integration tests, billing runtime, marketplace runtime, or analytics-emission behavior.
