# Phase V711 Inbox Item Entity Contract Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree runtime evidence for `inbox_item_entity_contract`.
**Outcome:** Promoted to `runtime_active`.

## Scope Boundary

This pass promotes the Master Spec entity / enum / Inbox render contract plus its spec-lint detector. It does not claim product UI, API handler, mobile export, or notification-delivery runtime coverage beyond this row.

## Conflicts Closed

| Gap | Resolution |
|---|---|
| §4.3.22 `Inbox Item Group.group_type` used unregistered literals. | Field now binds to Appendix J `inbox_item_group_type_enum` values. |
| §4.3.22 `anchor_entity_type` used unregistered literals. | Field now binds to Appendix J `anchor_entity_type_enum` values. |
| §4.3.15 referenced Appendix J for `thread_type`, but no enum existed. | Appendix J now registers `unread_marker_thread_type`. |
| §3.12 / §4.3.15 cited non-existent "§29.1 Inbox Feed Schema". | References now cite `InboxItem.direct_mention = true` at §4.3.22.1. |
| `InboxItem` lacked an explicit mention signal. | `InboxItem.direct_mention` now drives Unread Marker mention state. |
| §20.2 `delivery_state` lacked an Appendix J binding. | §20.2 now binds `delivery_state` to `notification_delivery_state`. |
| §4.3.22 retained stale Phase 2 deferral wording. | The active contract now binds §20.2, §29, §32.10.3.B, Appendix J, and §40.2. |

## Verification

| Check | Result |
|---|---|
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with 139 expected findings |
| Full spec-lint batch | Pass, 0 blocking findings |
| Typecheck | Pass |
| `tools/release/stamp_gate.ts --json` | Fails overall on remaining runtime-evidence blockers |

## Stamp-Gate Posture

Latest stamp-gate run parses 420 runtime rows and fails on 294 blockers, down from 295.

| Runtime status | Count |
|---|---:|
| `runtime_active` | 124 |
| `spec_binding_pending_pack_m02_3` | 161 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |

## Artifacts

| Artifact | Path |
|---|---|
| Detector | `tools/spec-lint/gates/inbox_item_entity_contract.ts` |
| Pass fixture | `tools/spec-lint/fixtures/inbox_item_entity_contract/pass.md` |
| Fail fixture | `tools/spec-lint/fixtures/inbox_item_entity_contract/fail.md` |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` |
| Blocker CSV | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv` |
