# v7.1.1 Marketplace-Domain PromotedListing and Engagement-Telemetry Verification

**Date:** 2026-07-11  
**Scope:** D-MD-009, D-MD-016, D-MD-018  
**Disposition:** Source-contract remediated; `AE-V711-PHMD-MARKETPLACE-DOMAIN-TELEMETRY-01` pending human sign-off. No runtime promotion claimed.

## Source conflict and selected authority

| Conflict | Resolution |
|---|---|
| §4.4.19 / §34.16 omitted Marketplace-Domain scope while §27.11.9.12 required it and the filed D-MD-016 route cited retired §43. | §4.5.6 and Appendix K are current Marketplace-Domain authority; §4.4.19 owns the persisted row; §34.16 owns auction, webhook, and retention bindings. |
| §34.16 / detailed Appendix G used `marketplace_promoted_listing_clicked`; §27.11 / a later Appendix G row used `marketplace_promoted_clicked`. | `marketplace_promoted_listing_clicked` is canonical because it is the registered impression → click → EOI funnel member. The other name is historical-only and forbidden for new writes. |
| §34.16.4 declared platform-only click data, but §34.16.6 / §40.2 did not define a lifecycle. | Existing Usage Event retention, DSAR, and residency rules now bind the named engagement stream; no duration was duplicated. |

## Remediation

- §4.4.19 / §4.4.19.1 add immutable `marketplace_domain_id`, domain/category eligibility, scoped indexes and locks, filtered projection, auction-audit scope, mutation error, concurrency rule, and acceptance criterion.
- §27.11 removes the retired §43 routing, consumes the current field contract, and names the canonical click event.
- §34.16 scopes auctions, category caps, bids, webhooks, idempotency, audience privacy, and acceptance criteria by Marketplace Domain while leaving seller-wide plan entitlement and monthly allotment in §34.1.2.
- §40.2 and §34.16.6 bind Promoted Listing engagement telemetry to the existing Usage Event retention, DSAR, residency, compaction, aggregate-recompute, and cross-domain boundary.
- Appendix G carries `marketplace_domain_id` on Promoted Listing webhook mirrors and funnel events; the historical alias has no new-write schema.
- Appendix I, Appendix K, `_integration/RECONCILIATION.md`, and `_integration/AUTHORED_EXTENSIONS_LEDGER.md` align the error, terminology, conflict record, and ratification boundary.

## Counts

| Measure | Before | After |
|---|---:|---:|
| Open P2 rows | 259 | 256 |
| Open P3 rows | 90 | 90 |
| Runtime rows | 497 | 497 |
| `runtime_active` | 326 | 326 |
| Pack-owned runtime-evidence blockers | 169 | 169 |
| Pending human-ratification blockers | 16 | 17 |
| Total stamp blockers | 185 | 186 |

The blocker increase is the new pending AE. It is current release work, not historical closure. The 169 pack-owned runtime-evidence blockers remain unresolved: 118 M11.3, 29 M21.3, 13 M02.3, and 9 M24.3.

## Verification commands

```sh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_after_md_domain_telemetry.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.csv --date 2026-07-11
```

## Runtime boundary

Passing source lint proves only corpus consistency. Required external evidence remains: field migration/backfill, authorization resolver, serializable locks, render/query filtering, webhook and PostHog delivery, alias suppression, buyer-residency partitioning, DSAR worker/outbox/aggregate recomputation, mobile/native-link behavior, retries, concurrency, and cross-domain non-leak tests.
