# Phase V711 Inbox Pulse Mobile Export Parity Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree runtime evidence for `inbox_pulse_mobile_export_parity`.
**Backup:** `_versions/Sourcera_Master_Spec_pre-inbox-pulse-mobile-export-parity-runtime-promotion-2026-07-07.md`

## Scope Boundary

This pass promotes the §20 / §32 / §38 / Appendix I mobile-export parity contract and spec-lint detector only. It does not claim UI E2E coverage, native mobile client implementation, export worker runtime, or product-code API-handler evidence.

## Gap Closed

§20.5.3, §20.8, §32.10.3.B, §38.8.2, §38.8.3, and Appendix I already agreed that Pulse Digest Archive CSV export is unsupported on mobile and returns `pulse_digest_export_mobile_not_supported`, but the §M.5 row remained pending without detector proof. The new detector locks those sources together and rejects contradictory positive mobile-export support text.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/inbox_pulse_mobile_export_parity.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/inbox_pulse_mobile_export_parity/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §M.5 now points to the active detector and explicitly binds §32.10.3.B mobile export rejection before job creation. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 289 blockers, down from 290. Remaining blockers: 156 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| `npm --prefix tools/spec-lint run gate -- inbox_pulse_mobile_export_parity --spec ../../Sourcera_Master_Spec.md --no-emit` | Pass, 0 findings |
| `npm --prefix tools/spec-lint run gate -- inbox_pulse_mobile_export_parity --spec fixtures/inbox_pulse_mobile_export_parity/pass.md --no-emit` | Pass, 0 findings |
| `npm --prefix tools/spec-lint run gate -- inbox_pulse_mobile_export_parity --spec fixtures/inbox_pulse_mobile_export_parity/fail.md --no-emit` | Fails with 20 expected findings for missing §20 / §32 / §38 / Appendix I bindings, pending §M.5 status, and positive mobile-export support prose |
| `npm --prefix tools/spec-lint run typecheck` | Pass |
| `npm --prefix tools/spec-lint run all -- --no-emit` | Pass, 0 blocking findings |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` | Fails overall on the remaining 289 runtime-evidence blockers |

## Remaining Stamp-Gate Shape

| Pack | Remaining blockers |
| :---- | ----: |
| M02.3 | 156 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

The stamp remains blocked until these rows receive their own evidence and are promoted through §M.5.
