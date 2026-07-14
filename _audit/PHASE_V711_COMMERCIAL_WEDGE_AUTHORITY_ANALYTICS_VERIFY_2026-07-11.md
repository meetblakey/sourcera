# v7.1.1 Commercial Wedge Authority and Analytics Verification

**Date:** 2026-07-11  
**Scope:** Commercial wedge authority, GTM alignment, and retired-source table regression only.

## Conflict Resolved

§48.1.5 labeled retired Master Summary / C-number provenance as `Authoritative Source`; §31.9 did the same for retired CRM prose. That contradicted the source hierarchy. Current §48.8, §22, §27, §31.9, §34, §42, §48.3, and §51 contracts now control. Retired material is not retained in an authority cell.

§48.0.1 now binds existing accountable functions to the existing forced-signup and Hero Moment funnels, Marketplace/SEO signals, integrity controls, dashboards, alerts, and kill paths. It introduces no metric, threshold, RBAC grant, product behavior, or release claim. GTM and Seller Pricing documents cite §48.0.1 and remain narrative companions.

## Regression Proof

1. Red test: before the detector update, `authoritative_table_fail.md` placed `retired Master Summary §6.28.2` in an `Authoritative Source` cell and incorrectly passed.
2. `retired_summary_current_authority_absent` v1.1.0 now parses the authority column rather than treating any historical note as exempt.
3. Live Master Spec — PASS.
4. Standard positive fixture — PASS.
5. Standard negative fixture — expected FAIL.
6. `authoritative_table_fail.md` — expected FAIL with the table-authority finding.

## Full Verification

```sh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_after_commercial_wedge_authority.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv --date 2026-07-11
```

Results: typecheck PASS; full blocking spec-lint PASS; exact-status 0 open P0, 0 open P1, 0 blocked P1, 275 open P2, 94 open P3. Stamp gate expected FAIL: 497 runtime rows, 326 `runtime_active`, 182 blockers (118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, 13 human-ratification). The generated inventory remains `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `.csv`.

## Boundary

AE-V711-SOURCE-AUTHORITY-WEDGE-01 is already approved and covers this clarification. Product mobile, CRM, analytics ingestion, dashboard rendering, SEO, and release evidence remain unresolved only where the current stamp gate reports them.
