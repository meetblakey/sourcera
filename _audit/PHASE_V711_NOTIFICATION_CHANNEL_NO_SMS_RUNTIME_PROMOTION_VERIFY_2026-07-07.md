# Phase V711 Notification Channel No-SMS Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree runtime evidence for `notification_channel_no_sms`.
**Backup:** `_versions/Sourcera_Master_Spec_pre-notification-channel-no-sms-runtime-promotion-2026-07-07.md`

## Scope Boundary

This pass promotes the §20 / §32.10.3.B no-SMS notification-channel contract and spec-lint detector only. It does not author or claim any SMS provider, template, plan gate, API surface, compliance workflow, or Appendix C/G/I/J support contract.

## Gap Closed

§20 already said SMS is unsupported and §32.10.3.B rejected SMS channel keys, but the §M.5 row remained pending without detector proof. The new detector locks the unsupported contract and blocks future positive SMS support text unless the full provider, API, compliance, and Appendix C/G/I/J contract is authored first.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/notification_channel_no_sms.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/notification_channel_no_sms/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §M.5 now points to the active detector and explicitly binds §20 unsupported-SMS preference behavior to §32.10.3.B preference PATCH rejection. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 290 blockers, down from 291. Remaining blockers: 157 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| `npm --prefix tools/spec-lint run gate -- notification_channel_no_sms --spec ../../Sourcera_Master_Spec.md --no-emit` | Pass, 0 findings |
| `npm --prefix tools/spec-lint run gate -- notification_channel_no_sms --spec fixtures/notification_channel_no_sms/pass.md --no-emit` | Pass, 0 findings |
| `npm --prefix tools/spec-lint run gate -- notification_channel_no_sms --spec fixtures/notification_channel_no_sms/fail.md --no-emit` | Fails with 16 expected findings for missing unsupported-SMS contract text, pending §M.5 status, missing §32 preference PATCH rejection, and positive SMS support prose |
| `npm --prefix tools/spec-lint run typecheck` | Pass |
| `npm --prefix tools/spec-lint run all -- --no-emit` | Pass, 0 blocking findings |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` | Fails overall on the remaining 290 runtime-evidence blockers |

## Remaining Stamp-Gate Shape

| Pack | Remaining blockers |
| :---- | ----: |
| M02.3 | 157 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

The stamp remains blocked until these rows receive their own evidence and are promoted through §M.5.
