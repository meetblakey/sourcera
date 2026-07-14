# Phase v7.1.1 Appendix I Cooldown Status Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `cooldown_status_convention`
**Scope:** M02.3 spec-tree runtime promotion only.

## Verdict

PASS for this gate. The v7.1.1 stamp gate still fails on remaining runtime-evidence blockers.

## Gap Closed

Time-window blockers with `Retry-After` semantics had stale HTTP 409 references. This pass moves the active references to HTTP 429:

- `direct_invite_prior_decline_cooldown`
- `featured_placement_seller_cadence_exceeded`
- `m6_claim_reclaim_cooldown_active` stale endpoint summary

Intentional fraud-cooldown 403 semantics remain excluded because they are permission / SIM safety states, not auto-resuming cooldown errors.

## Verification

| Check | Command | Result |
|---|---|---|
| Live detector | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/cooldown_status_convention.ts --spec Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| Pass fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/cooldown_status_convention.ts --fixture tools/spec-lint/fixtures/cooldown_status_convention/pass.md --no-emit` | PASS, 0 findings |
| Fail fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/cooldown_status_convention.ts --fixture tools/spec-lint/fixtures/cooldown_status_convention/fail.md --no-emit` | FAIL as expected; stale 409 findings emitted |
| Typecheck | `npm --prefix tools/spec-lint run typecheck` | PASS |
| Full runtime-active spec-lint | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --reconciliation _integration/RECONCILIATION.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | PASS, 0 blocking findings |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | FAIL overall on 338 remaining runtime-evidence blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows parsed | 420 | 420 |
| `runtime_active` rows | 79 | 80 |
| `spec_binding_pending_pack_m02_3` rows | 206 | 205 |
| Total blockers | 339 | 338 |

Remaining blockers by owner:

| Owner | Count |
|---|---:|
| M02.3 | 205 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

## Files Updated

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/run-all.ts`
- `tools/spec-lint/gates/cooldown_status_convention.ts`
- `tools/spec-lint/fixtures/cooldown_status_convention/pass.md`
- `tools/spec-lint/fixtures/cooldown_status_convention/fail.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
