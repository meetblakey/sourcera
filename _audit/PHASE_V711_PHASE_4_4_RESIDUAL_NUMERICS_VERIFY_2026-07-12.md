# Phase 4.4 Residual Numerics Verification — 2026-07-12

## Scope

Closed D-4.4-019, D-4.4-021, and D-4.4-025. Phase 4.4 now has zero open canonical rows.

## Current authority

| Contract | Canonical source |
|---|---|
| Score replacement yellow dwell | `UX_Design_of_Sourcera.md` §2.6 `feedback.duration.score_override_highlight` |
| Intake callout dwell | `UX_Design_of_Sourcera.md` §5.2 `IntakeFillCallout.callout.dismiss.timeout` |
| Buyer free-text bound | Master Spec §39 `Workspace.intake_freetext_label` |
| Seeded and blank intake deadline default | Master Spec §4.5.9 `EvalStarter.default_deadline_days` |
| Defense View confidence comparison | Master Spec §13.11.5.A `confidence_threshold_pct / 100` |

No new behavior, Authored Extension, ratification disposition, or runtime promotion was added.

## Commands and results

| Command | Result |
|---|---|
| `npm --prefix tools/spec-lint run typecheck` | PASS |
| `npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit` | PASS |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json` | 1,979 rows; 0 open P0; 0 open P1; 211 open P2; 78 open P3. Output: `_audit/_tmp/v711_exact_status_phase44_residual_numerics_2026-07-12.json`. |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` | RED: 500 runtime rows; 329 `runtime_active`; 190 blockers. Output: `_audit/_tmp/v711_stamp_gate_phase44_residual_numerics_2026-07-12.json`. |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_phase44_residual_numerics_2026-07-12.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv --date 2026-07-12` | PASS; 190 rows: M11.3 118, M21.3 29, M02.3 13, M24.3 9, human ratification 21. |

## Release boundary

The v7.1.1 stamp remains blocked by 169 pack-owned runtime-evidence rows and 21 human-ratification rows. This closure changes neither class.
