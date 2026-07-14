# Phase v7.1.1 Master Spec Ops Source-Binding Cleanup Verify

**Date:** 2026-07-09

## Conflict

Five §50 blocks labeled retired Master Summary clauses as `Source Authority`. That contradicted the corpus hierarchy, which makes the Master Spec canonical and the retired Summary historical only. Featured Placement and the Match Score glossary also used retired Summary material as present-tense authority.

## Resolution

- Replaced the five §50 `Source Authority` blocks with current `Source binding` blocks.
- Bound current Ops behavior to §50.2–§50.5, §4.6.1, §4.4.27, §4.6.3, §27.6, §48.2, §48.4.10, §50.13, and §50.14.
- Marked retired Summary §6.35 and C.93–C.100 as historical provenance only.
- Bound Featured Placement to §4.4.20, §34.16.1.A, and `Sourcera_Seller_Pricing_Strategy.md §12.3`.
- Bound Match Score to §27.4, §4.5.10–§4.5.12, §48.2.11, and §21.4.2.

## Verification

```bash
awk '/^# Section 50:/{in50=1} /^# Section 51:/{in50=0} in50' Sourcera_Master_Spec.md | rg -n '^\*\*Source Authority\.\*\*'
rg -n -i '^\*\*(Source Authority|Authoritative Source).*?(Summary|KB Engineering)|(Summary|KB Engineering).*?\*\*(Source Authority|Authoritative Source)' Sourcera_Master_Spec.md GTM Sourcera_Buyer_Pricing_Strategy.md Sourcera_Seller_Pricing_Strategy.md
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

Results: both targeted retired-authority scans return no matches. TypeScript and full spec-lint pass. Exact-status remains 0 open P0, 0 open P1, 0 blocked P1, 550 open P2, and 188 open P3. The stamp gate remains fail-closed on 144 unchanged runtime-evidence blockers: 102 M11.3, 26 M21.3, 11 M02.3, and 5 M24.3.

## Boundary

No product behavior, defect status, Authored Extension, or §M.5 runtime status changed. Explicit historical-provenance citations remain permitted; active source-authority labels cannot cite retired material.
