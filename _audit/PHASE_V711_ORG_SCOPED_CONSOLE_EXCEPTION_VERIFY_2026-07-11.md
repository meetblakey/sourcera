# v7.1.1 Org-Scoped Console-Exception Verification

**Date:** 2026-07-11  
**Scope:** D-1.2-017.

## Conflict and Resolution

Buyer Referral is Buyer-originated, so a fixed console could be inferred. Pro Trial Seat Grant is one record with Buyer-issuer and Seller-redeemer projections, so a fixed console or origin field would be false. The entities now declare these existing scope exceptions directly.

No product behavior changed. Both entities retain their existing non-leaking 404 boundaries and are not Console Bridge or Marketplace records.

## Before / After

| Surface | Before | After |
|---|---:|---:|
| Open P2 rows | 302 | 301 |
| Open P3 rows | 100 | 100 |
| Runtime rows | 494 | 495 |
| Runtime-active rows | 324 | 325 |
| Total stamp blockers | 170 | 170 |

## Verification Commands

```bash
npm --prefix tools/spec-lint run typecheck

tools/spec-lint/node_modules/.bin/tsx \
  tools/spec-lint/gates/org_scoped_console_exception_contract.ts \
  --spec Sourcera_Master_Spec.md

tools/spec-lint/node_modules/.bin/tsx \
  tools/spec-lint/gates/org_scoped_console_exception_contract.ts \
  --spec tools/spec-lint/fixtures/org_scoped_console_exception_contract/pass.md

! tools/spec-lint/node_modules/.bin/tsx \
  tools/spec-lint/gates/org_scoped_console_exception_contract.ts \
  --spec tools/spec-lint/fixtures/org_scoped_console_exception_contract/fail.md

tools/spec-lint/node_modules/.bin/tsx \
  tools/release/exact_status_scan.ts \
  --ledger _audit/DEFECT_LEDGER.md --json

tools/spec-lint/node_modules/.bin/tsx \
  tools/release/stamp_gate.ts --json
```

## Current Evidence

- TypeScript: PASS.
- New guard: live and pass fixture pass; fail fixture rejects.
- Exact-status: 1,979 canonical rows; 0 open P0; 0 open P1; 301 open P2; 100 open P3.
- Stamp gate: expected FAIL; 495 runtime rows; 325 runtime-active; 170 blockers = 118 M11.3 + 29 M21.3 + 12 M02.3 + 9 M24.3 + 2 human-ratification AEs.
