# v7.1.1 L1 / Hero Moment First-Bid Handoff Verification

**Date:** 2026-07-11  
**Scope:** D-13V-019 and D-HM-012  
**Verdict:** PASS for documentation consistency; not runtime promotion proof.

## Conflict and Resolution

`growth_loop_l1_first_bid_completed` and `seller_onboarding_first_bid_submitted` described the same L1-linked first bid without a documented join. Separately, §49 called the short onboarding names canonical while Appendix G named the long forms canonical.

The Master Spec now makes `(seller_org_id, bid_workspace_id)` the only L1-to-Hero-Moment join. L1 retains `growth_loop_execution_id`; Seller Onboarding retains `session_id`. The source transaction / two-outbox-row requirement is AE-V13-011, pending Engineering and Analytics ratification for v7.1.2. `seller_onboarding_first_requirement_response` and `seller_onboarding_first_bid_submitted` are the only emitted names. Short forms are documentation-only aliases.

## Proof

| Check | Result |
|---|---|
| Red contract probe before implementation | Failed on the missing L1 payload, join rule, and canonical Stage-6 event row |
| `l1_hero_moment_first_bid_handoff` on live Master Spec | PASS |
| Passing fixture | PASS |
| Failing fixture | FAIL as expected; 22 findings |
| TypeScript | PASS |
| Full blocking spec-lint | PASS; 0 blocking findings |
| Stamp gate | FAIL as expected on 168 unrelated runtime-evidence blockers |

## Boundary

The static gate proves the Master Spec event names, fields, aliases, and funnel join agree. It does not prove source-transaction writes, outbox idempotency, PostHog delivery, dashboard-query materialization, or product-runtime behavior. Those remain pack-owned runtime evidence.

## Current Release Posture

The stamp gate parses 467 runtime rows: 297 `runtime_active`, 118 M11.3 blockers, 29 M21.3 blockers, 12 M02.3 blockers, 9 M24.3 blockers, and two non-blocking release-only rows. The exact-status scan reports 0 open P0, 0 open P1, 0 blocked P1, 379 open P2, and 135 open P3.

## Commands

```zsh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/l1_hero_moment_first_bid_handoff.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/l1_hero_moment_first_bid_handoff.ts --fixture tools/spec-lint/fixtures/l1_hero_moment_first_bid_handoff/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/l1_hero_moment_first_bid_handoff.ts --fixture tools/spec-lint/fixtures/l1_hero_moment_first_bid_handoff/fail.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_2026-07-11_phase28-l1-hero-first-bid-handoff.json
```
