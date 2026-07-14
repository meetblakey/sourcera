# v7.1.1 M16 Funnel Canonical Consumer Runtime Promotion Verification

**Date:** 2026-07-07
**Gate:** `m16_funnel_canonical_consumer`
**Scope:** M02.3 spec-tree runtime evidence only.

## Scope Boundary

This pass promotes a documentation/spec-lint contract only. It does not claim PostHog Insights runtime generation, product emitter execution, dashboard query runtime, Convex deployment, or production telemetry proof.

## Conflicts Closed

- §48.7.3 said §51.0.3 was the sole M16 funnel source, but still duplicated the seven-stage list inline.
- §51.0.3 used stale event name `m16_referral_credit_redeemed`; Appendix G registers `m16_referral_credit_fully_redeemed`.

The Master Spec now makes §51.0.3 the only M16 stage source, keeps §48.7.3 as a registry citation, and aligns the M16 terminal stage to the Appendix G event name.

## Verification

| Check | Command | Result |
| :---- | :---- | :---- |
| Direct detector run | `npx tsx tools/spec-lint/gates/m16_funnel_canonical_consumer.ts --spec Sourcera_Master_Spec.md --no-emit` | Pass, 0 findings |
| Pass fixture | `npx tsx tools/spec-lint/gates/m16_funnel_canonical_consumer.ts --fixture tools/spec-lint/fixtures/m16_funnel_canonical_consumer/pass.md --no-emit` | Pass, 0 findings |
| Fail fixture | `npx tsx tools/spec-lint/gates/m16_funnel_canonical_consumer.ts --fixture tools/spec-lint/fixtures/m16_funnel_canonical_consumer/fail.md --no-emit` | Fails with expected findings for stale inline stage list, stale `m16_referral_credit_redeemed`, missing Appendix G event coverage, diagnostic event in funnel row, and pending §M.5 status |
| Typecheck | `npm --prefix tools/spec-lint run typecheck` | Pass |
| Full spec-lint batch | `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | Fails overall on the remaining 280 runtime-evidence blockers |

## Stamp-Gate Posture

| Metric | Count |
| :---- | ---: |
| Runtime rows parsed | 420 |
| `runtime_active` | 138 |
| `spec_binding_pending_pack_m02_3` | 147 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |
| Blocking rows | 280 |

## Updated Artifacts

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/gates/m16_funnel_canonical_consumer.ts`
- `tools/spec-lint/fixtures/m16_funnel_canonical_consumer/pass.md`
- `tools/spec-lint/fixtures/m16_funnel_canonical_consumer/fail.md`
- `tools/spec-lint/run-all.ts`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
