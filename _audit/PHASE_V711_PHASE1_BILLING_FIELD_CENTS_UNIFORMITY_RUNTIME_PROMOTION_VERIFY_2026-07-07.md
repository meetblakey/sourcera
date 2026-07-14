# Phase v7.1.1 Phase 1 Billing Field Cents Uniformity Runtime Promotion Verify

**Date:** 2026-07-07  
**Gate:** `phase1_billing_field_cents_uniformity`  
**Scope:** M02.3 spec-tree runtime evidence for Phase DEC monetary field naming and storage.

## Scope Boundary

This pass promotes the Master Spec schema/text guard only. It does not claim product database migration execution, Convex schema deployment, serializer parity, Stripe runtime mapping, billing runtime tests, or historical audit-log rewrites.

## Conflict / Gap Closed

The Phase DEC remediation moved Phase 1 billing fields to cents-backed names, but §M.5 still had no detector proving the field-table and M8 checkpoint contract. The pass also found a live glossary drift: Appendix K listed `ai_value_cents` but omitted the ProTrialSeatGrant field `ai_value_consumed_cents`. The glossary now names both fields.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/phase1_billing_field_cents_uniformity.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/phase1_billing_field_cents_uniformity/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | Appendix K Phase 1 billing cents convention now includes both `ai_value_consumed_cents` and `ai_value_cents`. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 284 blockers, down from 285. Remaining blockers: 151 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with 12 expected findings for Decimal dollar storage, missing cents fields, missing convention tokens, pending §M.5 status, and legacy dollar field shape |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 284 runtime-evidence blockers |

## Remaining Boundaries

- `usage_event_daily_aggregate_entity_contract` remains pending and owns the complete daily aggregate entity contract.
- `phase1_required_index_completeness` remains pending and owns the D-DEC-002 required-index guard.
- Product-code/runtime evidence remains out of scope for this pass.
