# Phase v7.1.1 Pricing Formula Multiplier Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `pricing_formula_capability_multiplier_consistency`
**Pack:** M02.3
**Result:** Promoted to `runtime_active`

## Scope

This pass promotes spec-tree runtime evidence for the AIOperation value/cost pricing formula.

## Scope Boundary

This pass promotes the Master Spec source-authority contract and spec-lint detector only. Runtime pricing-engine code, CostBaseRecalculationLog execution, PricingTableVersion publication, Stripe posting, and deploy validators remain pending unless their own rows carry runtime evidence.

## Conflict Closed

§34.3.1 already made `CapabilityRegistryEntry.value_multiplier` and `CapabilityRegistryEntry.cost_multiplier` authoritative. Active prose still contained shorthand formulas such as `cost_base × {10, 1.05}` and unqualified `cost_base_cents × value_multiplier` outside the registry context. The pass corrected those references so pricing derives from per-capability registry fields, with default multiplier values living on §4.8.2.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/pricing_formula_capability_multiplier_consistency.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/pricing_formula_capability_multiplier_consistency/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §4.8.2, §21.4, §21.5, Appendix K, and §M.5 now route active formula text through `CapabilityRegistryEntry.value_multiplier` / `CapabilityRegistryEntry.cost_multiplier`; §34.3.1 and §34.14 remain the canonical pricing formula anchors. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 301 blockers, down from 302. Remaining blockers: 168 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected hard-coded multiplier, missing registry-field binding, missing Appendix K binding, and pending-status findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 301 runtime-evidence blockers |
