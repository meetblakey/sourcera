# Phase 2.2 CapabilityDeclaration and Opt-Out RBAC Completion Verification

**Date:** 2026-07-09  
**Status:** D-2.2-040, D-2.2-053, and D-2.2-054 remediated

## Conflict and resolution

Approved AE-14.8 Seller Maya behavior existed in §22.20, Appendix J, and Appendix L but was absent from the local `CapabilityDeclaration` entity contract. The Vendor Opt-Out entity also omitted `seller_org_owner` although the current Seller role matrix and API endpoint allow that role.

§4.4.4 now defines the Seller-only display-label override, immutable provenance, Buyer-projection firewall, source-pairing invariant, and approved row-7a auto-publish transition. §39 owns the label-size limit. §4.4.8 now permits the same `seller_billing_admin`, `seller_org_admin`, and `seller_org_owner` writer set as §5.5.1 and §27.10.6.

No new Authored Extension was created: AE-14.8-01 through AE-14.8-04 are already approved in the canonical ledger.

## Verification

| Check | Result |
|---|---|
| TypeScript | PASS |
| Full spec lint with AE ledger | PASS |
| AE-14.8 approval rows | Present and approved |
| §4.4.4 row 7a and local fields | Present |
| Canonical ledger rows | D-2.2-040, D-2.2-053, D-2.2-054 are remediated |
| Exact-status scan | P0 0, P1 0, blocked P1 0, P2 546, P3 188 |

## Commands

```zsh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
```

## Boundary

This is a specification closure. Product authorization and state-transition tests remain required runtime evidence in their owning packs; no §M.5 runtime row was promoted.
