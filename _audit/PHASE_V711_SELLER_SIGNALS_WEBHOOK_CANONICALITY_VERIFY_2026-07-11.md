# v7.1.1 Seller Signals Webhook Canonicality — Verification

**Date:** 2026-07-11  
**Defect:** D-V72REM-PH6-002  
**Verdict:** PASS — documentation canonicality closed; no runtime promotion.

## Conflict and resolution

Appendix C was the canonical identifier and audience authority while §27.9.9 and Appendix G used incompatible aliases. Appendix C controls. §27.9.9, direct-invite / DSAR / de-anonymization consumers, and Appendix G now use the same Marketplace-Signals family. Retired aliases are historical migration labels only and cannot emit, subscribe, or re-register.

A cohort rejected before first visibility does not produce a customer webhook. A later suppression can emit only canonical `marketplace.seller_signal.cohort_suppressed`, only for a previously visible cohort, and with no buyer, count, delta, or reason.

## Evidence

| Check | Result |
|---|---|
| `appendix_c_to_appendix_g_coverage` v1.1 | PASS — 0 findings |
| TypeScript typecheck | PASS |
| Full blocking spec-lint | PASS — 0 findings |
| Exact-status right-edge scan | 0 open P0; 0 open P1; 0 blocked P1; 338 open P2; 114 open P3 |
| Stamp gate | FAIL — unchanged 168 external runtime-evidence blockers |

## Commands

```sh
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_c_to_appendix_g_coverage.ts --spec Sourcera_Master_Spec.md --no-emit
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_2026-07-11_final-corpus-pass.json
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_2026-07-11_final-corpus-pass.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/v711_runtime_stamp_gate_blockers.csv --date 2026-07-11
```

## Boundary

AE-V711-PH6-SELLER-SIGNALS-WEBHOOK-CANONICALITY-01 is **pending human sign-off. Authored Extension — requires human sign-off.** This workspace contains no event producer, subscription-migration, consumer-compatibility, audit-persistence, webhook-delivery, or end-to-end privacy-test evidence. The static gate verifies documentation only and does not reduce the 168 runtime blockers.
