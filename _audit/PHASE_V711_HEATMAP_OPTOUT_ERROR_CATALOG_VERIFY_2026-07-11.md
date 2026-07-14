# v7.1.1 HeatMapCell Opt-Out and Error-Catalog Verification — 2026-07-11

## Scope

Close `D-V72REM-PH1-002` and `D-V72REM-PH1-003`. `D-2.2-039` remains open.

## Conflict and resolution

§4.4.16 is vendor-identity-free and never probes the Vendor Opt-Out Registry. The prior `heat_map_cell` enum values admitted a no-op target, so they are retired from both sibling enums. Appendix I now registers the two failures already referenced by §4.4.16 and §48.6 M13.

This is a catalog and authority correction only. It adds no Opt-Out Registry probe, HeatMapCell seller field, migration, telemetry event, API route, permission, retention policy, or runtime-evidence claim.

## Evidence commands

```text
rg -n 'vendor_opt_out_scope_ref_type|vendor_opt_out_page_type_filter|heat_map_residency_violation|heat_map_aggregation_card_included_cell_below_k_anon_floor' Sourcera_Master_Spec.md
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

TypeScript and full blocking spec-lint pass. The updated enum guard v1.1.0 passes on the live Master Spec and positive fixture; its negative fixture rejects 11 findings. Exact status is 0 open P0, 0 open P1, 0 blocked P1, 263 open P2, and 90 open P3. The stamp gate remains expected fail: 497 runtime rows, 326 `runtime_active`, and 183 blockers (118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 14 pending-human-ratification release blockers). This work does not close a runtime-evidence row.
