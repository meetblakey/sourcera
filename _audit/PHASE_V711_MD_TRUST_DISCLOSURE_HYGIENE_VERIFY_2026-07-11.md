# v7.1.1 Marketplace Trust, Disclosure, and Accounting Hygiene Verification

**Date:** 2026-07-11  
**Defects:** D-MD-008, D-MD-010, D-MD-011, D-MD-012, D-MD-015, D-MD-017, D-MD-019  
**Disposition:** source-backed documentation cleanup; no Authored Extension and no runtime promotion.

## Source conflicts resolved

| Class | Current authority |
| :---- | :---- |
| Paid-surface disclosure | Appendix K **FTC Native-Advertising Disclosure** centralizes FTC Act §5, the December 2015 Commission policy statement, and FTC staff guidance. §27.11 owns rendering; §34.16 consumes it. |
| Badge / visual / ranking behavior | §34.16.2 / §27.11.3 own earned verification badges; §27.11.6 G3 owns Featured and Promoted separation; §27.4 / §27.11.6 G2 own Match Score exclusion. |
| Finance vocabulary | §4.8.3 owns `BillingLedger.revenue_stream_class`; §4.8.12 owns the fixed entity-level `MarketplaceDiscoveryRevenueRecord.cost_center`. |
| Stale labels | The MarketplaceDiscoveryRevenueRecord `(AE)` annotation and current-behavior v7.0.0 labels were removed; historical introduction remains labeled where relevant. |

## Verification

- Full blocking spec-lint: PASS, 0 findings.
- TypeScript: PASS.
- Exact-status before/after: 253 P2 / 90 P3 → 249 P2 / 87 P3; P0, P1, and blocked P1 remain 0.
- Stamp gate: expected FAIL, unchanged at 497 runtime rows, 326 active, and 187 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, and 18 pending human-ratification blockers.
- The generated blocker inventory is refreshed after the final metadata update.
- No source change claims product runtime evidence or alters the 169 pack-owned runtime blockers.

## Commands

```sh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```
