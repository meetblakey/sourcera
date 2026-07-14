# Phase v7.1.1 API Token Scope Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `appendix_j_api_token_scope_endpoint_consistency`
**Scope:** M02.3 spec-tree runtime promotion only.

## Verdict

PASS for this gate. The v7.1.1 stamp gate still fails on remaining runtime-evidence blockers.

## Gap Closed

Appendix J carried competing API-token scope counts and active endpoint Auth Scope values were not registered. This pass makes Appendix J's primary `api_token_scope` registry, the later mirror paragraph, and §M.5 agree on the canonical 34-value set. The detector blocks unregistered Auth Scopes, stale pre-V3 scopes, registry/mirror count drift, and rate-limit classes in Auth Scope columns.

## Verification

| Check | Command | Result |
|---|---|---|
| Live detector | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_j_api_token_scope_endpoint_consistency.ts --spec Sourcera_Master_Spec.md` | PASS, 0 findings |
| Pass fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_j_api_token_scope_endpoint_consistency.ts --spec tools/spec-lint/fixtures/appendix_j_api_token_scope_endpoint_consistency/pass.md` | PASS, 0 findings |
| Fail fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_j_api_token_scope_endpoint_consistency.ts --spec tools/spec-lint/fixtures/appendix_j_api_token_scope_endpoint_consistency/fail.md` | FAIL as expected; mirror-mismatch, stale-count, rate-limit-as-Auth-Scope, unregistered-scope, missing-consumer, and retired-scope findings emitted |
| Typecheck | `npm --prefix tools/spec-lint run typecheck` | PASS |
| Full runtime-active spec-lint | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --reconciliation _integration/RECONCILIATION.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | PASS, 0 blocking findings |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | FAIL overall on 336 remaining runtime-evidence blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows parsed | 420 | 420 |
| `runtime_active` rows | 81 | 82 |
| `spec_binding_pending_pack_m02_3` rows | 204 | 203 |
| Total blockers | 337 | 336 |

Remaining blockers by owner:

| Owner | Count |
|---|---:|
| M02.3 | 203 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

## Files Updated

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/run-all.ts`
- `tools/spec-lint/gates/appendix_j_api_token_scope_endpoint_consistency.ts`
- `tools/spec-lint/fixtures/appendix_j_api_token_scope_endpoint_consistency/pass.md`
- `tools/spec-lint/fixtures/appendix_j_api_token_scope_endpoint_consistency/fail.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `_audit/DEFECT_LEDGER.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
