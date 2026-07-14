# Phase PT Per-Bid KB-Persistence Closure Verification

**Date:** 2026-07-09  
**Status:** D-PT-003 remediated

## Authority and decision

`Sourcera_Seller_Pricing_Strategy.md §5.4` already required a new successful $199 per-bid charge to reset the Seller Solo 90-day KB-persistence window. Master Spec §34.2.5 lacked that rolling-clock rule. The Master Spec now makes the existing behavior canonical: entries above the Seller Free 50-entry cap remain accessible at the 250-entry Solo ceiling until 90 days after the most recent successful per-bid charge, then follow §34.6 read-only preservation.

No new price, plan tier, API, enum, event, state, retention duration, or Authored Extension was introduced.

## Evidence

| Check | Result |
|---|---|
| Master Spec §34.2.5 | `KB persistence reset on new charge` row present |
| Master Spec §34.2.5 acceptance criteria | #8 names `solo_seller_per_bid_kb_persistence_clock_reset_on_new_charge` |
| Canonical ledger | D-PT-003 is `remediated 2026-07-09` |
| P2 cluster routing | `BL-P2-PHPT-DOC` reduced from 7 to 6; D-PT-004 through D-PT-009 remain open policy decisions |
| Current exact-status scan | P0 0, P1 0, blocked P1 0, P2 549, P3 188 |

## Commands

```zsh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

## Boundary

This closes the documentation ambiguity only. The named QA test, product persistence behavior, and all remaining stamp-gate runtime evidence belong to their owning implementation packs. The stamp gate is still expected to fail until those product/runtime artifacts exist.
