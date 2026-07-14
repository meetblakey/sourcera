# Phase v7.1.1 Phase 1 Billing Legacy USD Field Absence Runtime Promotion Verify

**Date:** 2026-07-07  
**Gate:** `phase1_billing_legacy_usd_field_absence`  
**Scope:** M02.3 spec-tree runtime evidence for Phase DEC cents-backed billing field migration.

## Scope Boundary

This pass promotes the live Master Spec text guard only. It does not claim product database migration execution, Convex schema deployment, serializer parity, Stripe runtime mapping, or historical audit-log rewrites.

## Conflict / Gap Closed

The Phase DEC remediation moved Phase 1 billing fields to cents-backed names, but the §M.5 row still had no runtime detector. The new detector blocks retired live Master Spec field names `credit_value_usd`, `credit_redeemed_usd`, `ai_value_dollars`, `loaded_hourly_rate_usd`, and `value_saved_usd`, while permitting only historical `_versions` snapshots or migration notes explicitly marked retired.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/phase1_billing_legacy_usd_field_absence.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/phase1_billing_legacy_usd_field_absence/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | No new product behavior was authored; §M.5 now binds the detector path and fixture-backed proof. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 285 blockers, down from 286. Remaining blockers: 152 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with 1 expected finding for `credit_value_usd` in live text |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 285 runtime-evidence blockers |

## Remaining Boundaries

- `phase1_billing_field_cents_uniformity` remains pending and owns broader cents-backed schema naming / storage parity.
- `usage_event_daily_aggregate_entity_contract` and `phase1_required_index_completeness` remain pending Phase DEC document-contract rows.
- Product-code/runtime evidence remains out of scope for this pass.
