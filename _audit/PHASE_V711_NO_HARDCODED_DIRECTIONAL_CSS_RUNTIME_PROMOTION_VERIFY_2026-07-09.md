# v7.1.1 No Hardcoded Directional CSS Runtime Promotion Verify

**Date:** 2026-07-09

## Scope

Promoted `no_hardcoded_directional_css` from `spec_binding_pending_pack_m02_3` to `runtime_active`.

## Resolution

- Added §37.3.1 Directional CSS Allow-List.
- Added `tools/spec-lint/gates/no_hardcoded_directional_css.ts`.
- Added pass/fail fixtures under `tools/spec-lint/fixtures/no_hardcoded_directional_css/`.
- Wired the detector into `tools/spec-lint/run-all.ts`.
- Refreshed `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md` and `.csv`.

## Boundary

This proves spec / UX style snippets and CSS/TSX files present in this repository. Product runtime RTL behavior remains owned by `rtl_directionality_runtime_contract`.

## Verification

| Check | Result |
|---|---|
| `npx tsx tools/spec-lint/gates/no_hardcoded_directional_css.ts --fixture tools/spec-lint/fixtures/no_hardcoded_directional_css/pass.md --no-emit` | PASS |
| `npx tsx tools/spec-lint/gates/no_hardcoded_directional_css.ts --fixture tools/spec-lint/fixtures/no_hardcoded_directional_css/fail.md --no-emit` | FAIL as expected |
| `npx tsx tools/spec-lint/gates/no_hardcoded_directional_css.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --no-emit` | PASS |
| `npm --prefix tools/spec-lint run typecheck` | PASS |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md` | PASS |
| `npx tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_after_no_hardcoded_directional_css.json` | FAIL expected; 146 unrelated runtime-evidence blockers remain |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows | 426 | 426 |
| `runtime_active` rows | 277 | 278 |
| Total blockers | 147 | 146 |
| M02.3 blockers | 14 | 13 |
| M11.3 blockers | 102 | 102 |
| M21.3 blockers | 26 | 26 |
| M24.3 blockers | 5 | 5 |

`no_hardcoded_directional_css` is absent from `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.csv` and `_audit/_tmp/v711_stamp_gate_latest.json`.

`DEFECT_LEDGER.md` was not modified in this slice; exact-status posture remains 0 open P0, 0 open P1, 0 blocked P1, 595 open P2, and 191 open P3 rows.
