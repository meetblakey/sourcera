# Phase v7.1.1 Wallet-State Enum Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `wallet_state_enum_canonicality`
**Pack:** M02.3
**Result:** Promoted to `runtime_active`

## Scope

This pass promotes spec-tree runtime evidence for the AIWallet state enum contract.

## Scope Boundary

This pass promotes the Master Spec enum-source contract and spec-lint detector only. Runtime wallet-state transition code, webhook delivery, billing-worker behavior, and deploy validators remain pending unless their own rows carry runtime evidence.

## Conflict Closed

Appendix J already defined the canonical AIWallet state set: `active`, `soft_warned_50`, `soft_warned_80`, `hard_capped_100`, `hard_capped_auto_topup_monthly_cap`, `payment_failed_grace`, `suspended`, `closed`.

The pass found and corrected one live transition typo: §31.8.4 `billing.wallet.cap_warning_80` allowed `wallet_state ∈ {active, soft_warned_80}` at trigger time. It now allows `wallet_state ∈ {active, soft_warned_50}`, matching the §4.8.3 state machine. One active prose line also used stale "soft-capped" wording; it now says "soft-warning states."

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/wallet_state_enum_canonicality.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/wallet_state_enum_canonicality/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §31.8.4 now uses the correct `soft_warned_50` trigger input for the 80% warning; §21.5 no longer uses active "soft-capped" wallet wording; §M.5 now points to the runtime detector. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 303 blockers, down from 304. Remaining blockers: 170 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected stale `soft_capped_*`, missing enum value, wrong trigger-state, and pending-status findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 303 runtime-evidence blockers |
