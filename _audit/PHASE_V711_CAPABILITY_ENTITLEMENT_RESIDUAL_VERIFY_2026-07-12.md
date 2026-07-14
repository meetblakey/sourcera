# v7.1.1 Capability and Entitlement Residual Verification

**Date:** 2026-07-12  
**Closed:** D-4.12-016, D-4.12-020, D-CONS-014, D-CONS-017, D-EM-012, D-EM-015, D-EM-016, D-EM-017, D-EM-019, D-EM-021

Current source binds Seller Page publication outcomes to §4.4.10/§4.4.11, adds direct §21 registry acceptance criteria, preserves typed §34.8 entitlement rows, makes the §5.11/§34.8/§44.6 surface-engine split explicit, and adjudicates the first-pass capabilities as independent rows. Historical Appendix L, untyped-matrix, missing-validator, and pending-downgrade premises were status-synchronized.

| Command | Result |
| :---- | :---- |
| `npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | PASS |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json` | 0 P0, 0 P1, 29 P2, 0 P3 |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` | Unchanged expected FAIL: 535 rows, 333 active, 200 product/runtime blockers |

No runtime row was added or promoted.
