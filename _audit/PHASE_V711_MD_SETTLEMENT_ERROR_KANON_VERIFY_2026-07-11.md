# v7.1.1 Marketplace Discovery Settlement, Error, and k-Anonymity Verification

**Date:** 2026-07-11  
**Defects:** D-MD-013, D-MD-014, D-MD-020  
**Disposition:** documentation/spec remediation complete; `AE-V711-PHMD-SETTLEMENT-ERROR-KANON-01` pending human sign-off; runtime promotion not claimed.

## Conflict and authority resolution

| Gap class | Current authority and resolution |
| :---- | :---- |
| Cap-error aliases | §34.16 / §4.8.12 now use `promoted_listing_monthly_top_up_cap_exceeded` and `promoted_listing_category_cap_exceeded`; the marketplace-discovery aliases are historical only. Appendix I resolves both current and legacy paths. |
| Pre-payment failure | §4.8.12 retains the financial-row lifecycle; §4.4.19.1 owns the replacement-auction audit row; §34.16.1 owns one serializable replacement, the re-cleared price, no-recursion, and no-charge outcomes. `unpaid` is not a PromotedListing state. |
| k-anonymity | §34.16.1.A is the sole numeric home. The seller/public aggregate floor and the revenue-settlement floor have distinct purposes; §4.8.12, §27.11, and §34.16 consume rather than restate them. |
| Webhook catalog | §34.16.7 remains payload/audience authority. Appendix C now registers all 18 events exactly once and Appendix G mirrors their analytics schemas. |

## Evidence

Before: 256 open P2, 90 open P3; 497 runtime rows; 326 active; 186 blockers (169 runtime-evidence, 17 human-ratification).

After: 253 open P2, 90 open P3; 497 runtime rows; 326 active; 187 blockers (169 runtime-evidence, 18 human-ratification).

| Check | Result |
| :---- | :---- |
| TypeScript | PASS |
| Full blocking spec-lint | PASS, 0 findings |
| Exact-status scan | 0 P0, 0 P1, 0 blocked P1, 253 P2, 90 P3 |
| Stamp gate | FAIL as expected: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, 18 human-ratification blockers |
| Generated inventory | 187 rows written to `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `.csv` |

## Remaining release work

No runtime blocker is reclassified as historical. The 169 pack-owned blockers still require their named validators, workflows, product implementation, integration tests, and deploy proof. This cluster additionally requires human ratification plus the migration/backfill, signed Stripe ingest, ledger reconciliation, serial locks, outbox, audit/analytics/DSAR/residency projections, client states, and negative/concurrency tests listed in its AE row.

## Commands

```sh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_after_md_settlement_error_kanon.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv --date 2026-07-11
```
