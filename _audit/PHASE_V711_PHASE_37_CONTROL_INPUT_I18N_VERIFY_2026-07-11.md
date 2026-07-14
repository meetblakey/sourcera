# v7.1.1 Phase 37 Timing, Input, Live-Region, and i18n Authority Verification — 2026-07-11

## Scope

Resolve `D-37-012`, `D-37-013`, `D-37-015`, `D-37-017`, and `D-37-018`.

## Conflict resolution

`D-37-012` and `D-37-013` were genuine missing contracts. `AE-V711-PH37-CONTROL-INPUT-01` adds only the 60-second session warning, idle-versus-hard-cap boundary, long-motion control, and purpose-bound HTML `autocomplete` contract. It is pending human sign-off and does not assert product runtime evidence.

`D-37-015` compiles existing local ARIA-Live cadence without creating a global throttle. `D-37-017` preserves the §41.2.2 email resolver while allowing the specific §2.8.7 and §27.11.9.14 display contracts to win. `D-37-018` separates existing AIWallet billing/locked-FX, TCO snapshot, and Seller Marketplace display-only authority without creating a new currency preference or changing a billing amount.

## Evidence commands

```text
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json <stamp-json> --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv --date 2026-07-11
```

## Runtime boundary

TypeScript and full blocking spec-lint pass. Exact status is 0 open P0, 0 open P1, 0 blocked P1, 265 open P2, and 90 open P3. The stamp gate is expected to fail: 497 runtime rows, 326 `runtime_active`, and 183 blockers (118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 14 pending-human-ratification release blockers). The pending extension must stay visible until a human disposition and the listed UI, accessibility, browser/native, and form-component evidence are supplied.
