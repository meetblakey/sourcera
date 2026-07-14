# v7.1.1 Section 3 Customer-Copy and Vendor-Curation Boundary Verification

**Date:** 2026-07-11  
**Scope:** D-3UX-007, D-3UX-008, D-3UX-023  
**Verdict:** PASS for documentation consistency; not runtime promotion proof.

## Conflict and Resolution

The Scoring Matrix used `Phase ≥ 3` despite Vendor curation beginning at Buyer Team `pipeline_stage_id >= 4` and Buyer Solo `Define`/later. Its disabled tooltip exposed an engine ordinal. Separately, the Knowledge Base quota banner exposed a resolved Seller plan and a next-tier label.

§3.7.6.2 now distinguishes Team and Solo eligibility while using only customer-facing Vendor Discovery / Define text. §3.7.6.6 now uses plan-neutral quota copy and delegates the entitlement decision to §34.1.2 / §5.11. §3.7.11 adds the two acceptance-test bindings.

## Proof

| Check | Result |
|---|---|
| Red contract probe before implementation | Failed on five missing boundary and copy tokens |
| `section3_customer_copy_engine_boundary` on live Master Spec | PASS |
| Passing fixture | PASS |
| Failing fixture | FAIL as expected; 16 findings |
| TypeScript | PASS |
| Full blocking spec-lint | PASS; 0 blocking findings |
| Stamp gate | FAIL as expected on 168 unrelated runtime-evidence blockers |

## Boundary

The static gate verifies only Master Spec copy, eligibility declarations, acceptance criteria, and §M.5 registration. It does not prove client-side gating, entitlement resolution, user-visible rendering, or analytics delivery.

## Current Release Posture

The stamp gate parses 468 runtime rows: 298 `runtime_active`, 118 M11.3 blockers, 29 M21.3 blockers, 12 M02.3 blockers, 9 M24.3 blockers, and two non-blocking release-only rows. The exact-status scan reports 0 open P0, 0 open P1, 0 blocked P1, 376 open P2, and 135 open P3.

## Commands

```zsh
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/section3_customer_copy_engine_boundary.ts --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/section3_customer_copy_engine_boundary.ts --fixture tools/spec-lint/fixtures/section3_customer_copy_engine_boundary/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/section3_customer_copy_engine_boundary.ts --fixture tools/spec-lint/fixtures/section3_customer_copy_engine_boundary/fail.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_2026-07-11_phase29-section3-customer-copy.json
```
