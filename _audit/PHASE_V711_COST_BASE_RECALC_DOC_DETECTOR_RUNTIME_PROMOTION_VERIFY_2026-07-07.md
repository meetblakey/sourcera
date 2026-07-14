# Phase v7.1.1 Cost-Base Recalc Runtime Promotion Verify

**Date:** 2026-07-07
**Gates:** `cost_base_recalc_cron_canonicality`; `cost_base_recalc_sample_window_canonicality`; `margin_floor_breach_event_canonicality`
**Pack:** M02.3
**Result:** Promoted to `runtime_active`

## Scope

This pass promotes spec-tree runtime evidence for the cost-base recalc cadence, sample-window authority, and margin-floor breach event contracts.

## Scope Boundary

This pass promotes the Master Spec source-authority contracts and spec-lint detectors only. Runtime cron execution, pricing publication locks, Ops Finance approval workflow, webhook delivery, Stripe posting, billing tests, and deploy validators remain pending unless their own rows carry runtime evidence.

## Conflicts Closed

The recalc cadence now has one source: scheduler cron `cost_base_recalc_nightly`, nightly at 03:00 UTC, across §4.8.6, §34.3.3, §34.11.3, and §34.17.1.

The recalc sample window now has one source: the prior 30-day rolling window with `sample_window_started_at` and `sample_window_ended_at`, across §4.8.6, §34.3.3, §34.17.1, and Appendix K.

Margin-floor events now use prefixed event names only: immediate cost-base breaches emit `billing.cost_base_recalc.margin_floor_breach` with standard retry, while realized monthly hard-floor misses emit `billing.finance.margin_floor_breach_hard` with Appendix F.2 financial-impact retry. The retired unprefixed alias and `min_margin_floor_pct` default are blocked.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added three gates under `tools/spec-lint/gates/` and registered them in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/cost_base_recalc_cron_canonicality/`, `cost_base_recalc_sample_window_canonicality/`, and `margin_floor_breach_event_canonicality/`. |
| §M.5 status | All three rows are promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §4.8.6, §31.8.12, §34.3.3, §34.11.3, §34.17.1, §50.12.7, §50.12.13, Appendix C, Appendix F.2, Appendix G, Appendix K, and §M.5 now carry the canonical contracts. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 304 blockers, down from 307. Remaining blockers: 171 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| `cost_base_recalc_cron_canonicality` direct detector | Pass, 0 findings |
| `cost_base_recalc_cron_canonicality` pass/fail fixtures | Pass fixture passes; fail fixture fails with expected stale cron and pending-status findings |
| `cost_base_recalc_sample_window_canonicality` direct detector | Pass, 0 findings |
| `cost_base_recalc_sample_window_canonicality` pass/fail fixtures | Pass fixture passes; fail fixture fails with expected stale 24h-window, missing field, and pending-status findings |
| `margin_floor_breach_event_canonicality` direct detector | Pass, 0 findings |
| `margin_floor_breach_event_canonicality` pass/fail fixtures | Pass fixture passes; fail fixture fails with expected stale alias, missing prefixed event, retired threshold, and pending-status findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 304 runtime-evidence blockers |
