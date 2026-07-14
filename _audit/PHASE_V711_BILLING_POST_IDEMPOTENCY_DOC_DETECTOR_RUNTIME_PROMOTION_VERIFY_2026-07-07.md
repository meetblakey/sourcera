# Phase v7.1.1 Billing POST Idempotency Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `billing_post_idempotency_key_required`
**Scope:** M02.3 spec-tree runtime promotion only.

## Verdict

PASS for this gate. The v7.1.1 stamp gate still fails on remaining runtime-evidence blockers.

## Gap Closed

The prior D-V8.1-014 closure covered the original affected billing POST endpoints, but the current §32.8 family had expanded. This pass found live gaps before promotion: §32.8.10 and §32.8.24 lacked local **Idempotency** blocks, and older local blocks omitted explicit `X-Idempotent-Replay: true` replay headers or duplicate-side-effect bans. The detector now blocks missing or weak local idempotency semantics across every state-mutating §32.8 POST endpoint.

## Verification

| Check | Command | Result |
|---|---|---|
| Live detector | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/billing_post_idempotency_key_required.ts --spec Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| Pass fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/billing_post_idempotency_key_required.ts --fixture tools/spec-lint/fixtures/billing_post_idempotency_key_required/pass.md --no-emit` | PASS, 0 findings |
| Fail fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/billing_post_idempotency_key_required.ts --fixture tools/spec-lint/fixtures/billing_post_idempotency_key_required/fail.md --no-emit` | FAIL as expected; weak common convention, missing AC binding, weak local block, and missing local block findings emitted |
| Typecheck | `npm --prefix tools/spec-lint run typecheck` | PASS |
| Full runtime-active spec-lint | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --reconciliation _integration/RECONCILIATION.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | PASS, 0 blocking findings |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | FAIL overall on 334 remaining runtime-evidence blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows parsed | 420 | 420 |
| `runtime_active` rows | 83 | 84 |
| `spec_binding_pending_pack_m02_3` rows | 202 | 201 |
| Total blockers | 335 | 334 |

Remaining blockers by owner:

| Owner | Count |
|---|---:|
| M02.3 | 201 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

## Files Updated

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/run-all.ts`
- `tools/spec-lint/gates/billing_post_idempotency_key_required.ts`
- `tools/spec-lint/fixtures/billing_post_idempotency_key_required/pass.md`
- `tools/spec-lint/fixtures/billing_post_idempotency_key_required/fail.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
