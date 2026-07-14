# Phase v7.1.1 - Phase 1.7 Billing Data-Model and Enum Residual Verification

Date: 2026-07-12

## Scope

- D-1.7-009: CommittedSpendContract cardinality versus AIWallet binding.
- D-1.7-015: persisted AIWallet monetary names versus public API names.
- D-1.7-016: FreeAllowanceCounter quota decrease below consumed usage.
- D-1.7-017: OutcomeContract signal-subject enum authority.

## Authority conflicts and resolutions

1. §34.12.5's single Enterprise pool and AIWallet's singular FK override the stale §4.8.8 overlapping-active narrative. The current contract is at most one active CommittedSpendContract per Org.
2. Appendix K's ratified migration-safe `value_dollars` storage convention overrides the filed wholesale-rename recommendation. §32.8.0 now defines an explicit, no-conversion API mapping.
3. Quota decreases below already-consumed usage reject rather than rewriting consumption history or silently clamping.
4. Appendix J now owns the closed OutcomeContract signal-subject set.

## Runtime boundary

No runtime status was promoted. `committed_spend_single_pool_invariant` and `value_dollars_storage_convention_audit` remain pending under their existing packs. §M.5.111 adds `free_allowance_quota_decrease_guard` (M24.3) and `outcome_contract_signal_subject_enum_bound` (M02.3). AE-V711-PH17-BILLING-DATA-MODEL-01 is approved by explicit user ratification.

## Required proof

- `npm run typecheck`: PASS.
- `npm run all`: PASS; zero blocking spec-lint findings.
- Exact-status scanner: 0 P0, 0 P1, 194 P2, 69 P3.
- Stamp gate: 512 runtime rows, 332 `runtime_active`, 178 blockers.
- Blockers by pack: 122 M11.3, 31 M21.3, 15 M02.3, 10 M24.3; zero human-ratification blockers.
- Blocker inventory regenerated at `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md` and `_audit/v711_runtime_stamp_gate_blockers.csv`.
