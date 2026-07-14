# Phase v7.1.1 API Rate-Limit Class Registry Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `api_rate_limit_class_registry_consistency`
**Scope:** M02.3 spec-tree runtime promotion only.

## Verdict

PASS for this gate. The v7.1.1 stamp gate still fails on remaining runtime-evidence blockers.

## Gap Closed

Active rate-limit class declarations had unresolved registry drift. §18.9 used unregistered Q&A-local classes (`workspace_collaboration`, `workspace_collaboration_write`), §22.18.2.4 labeled KB export download/concurrency sublimits as rate-limit classes, and §26.8.7 used unregistered `bulk_write` against a stale §32.2 citation. This pass retargets those surfaces to registered §32.4.5 classes and adds a detector that blocks registry mismatch, missing §32.4.5 required cells, unregistered endpoint/prose classes, and Auth Scope / Rate-Limit Class column mix-ups.

## Verification

| Check | Command | Result |
|---|---|---|
| Live detector | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/api_rate_limit_class_registry_consistency.ts --spec Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| Pass fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/api_rate_limit_class_registry_consistency.ts --fixture tools/spec-lint/fixtures/api_rate_limit_class_registry_consistency/pass.md --no-emit` | PASS, 0 findings |
| Fail fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/api_rate_limit_class_registry_consistency.ts --fixture tools/spec-lint/fixtures/api_rate_limit_class_registry_consistency/fail.md --no-emit` | FAIL as expected; registry mismatch, missing required limit cell, unregistered class, key/value row drift, and Auth Scope leakage findings emitted |
| Typecheck | `npm --prefix tools/spec-lint run typecheck` | PASS |
| Full runtime-active spec-lint | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --reconciliation _integration/RECONCILIATION.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | PASS, 0 blocking findings |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | FAIL overall on 335 remaining runtime-evidence blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows parsed | 420 | 420 |
| `runtime_active` rows | 82 | 83 |
| `spec_binding_pending_pack_m02_3` rows | 203 | 202 |
| Total blockers | 336 | 335 |

Remaining blockers by owner:

| Owner | Count |
|---|---:|
| M02.3 | 202 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

## Files Updated

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/run-all.ts`
- `tools/spec-lint/gates/api_rate_limit_class_registry_consistency.ts`
- `tools/spec-lint/fixtures/api_rate_limit_class_registry_consistency/pass.md`
- `tools/spec-lint/fixtures/api_rate_limit_class_registry_consistency/fail.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
