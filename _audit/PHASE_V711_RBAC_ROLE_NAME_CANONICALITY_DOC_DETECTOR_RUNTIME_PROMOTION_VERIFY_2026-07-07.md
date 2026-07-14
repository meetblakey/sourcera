# Phase v7.1.1 RBAC Role-Name Canonicality Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `rbac_role_name_canonicality`
**Scope:** M02.3 spec-tree runtime promotion only.

## Verdict

PASS for this gate. The v7.1.1 stamp gate still fails on remaining runtime-evidence blockers.

## Gap Closed

§5.6 used `marketplace_public_reader` as the synthetic unauthenticated public-read Marketplace actor, but Appendix J `marketplace_role` omitted it. Appendix J now registers the value. The detector enforces §5.3 / §5.5 / §5.6 role-table labels against Appendix J canonical role enums and blocks retired Title-Case role labels.

## Verification

| Check | Command | Result |
|---|---|---|
| Live detector | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/rbac_role_name_canonicality.ts --spec Sourcera_Master_Spec.md` | PASS, 0 findings |
| Pass fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/rbac_role_name_canonicality.ts --spec tools/spec-lint/fixtures/rbac_role_name_canonicality/pass.md` | PASS, 0 findings |
| Fail fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/rbac_role_name_canonicality.ts --spec tools/spec-lint/fixtures/rbac_role_name_canonicality/fail.md` | FAIL as expected; retired-label and missing-role findings emitted |
| Typecheck | `npm --prefix tools/spec-lint run typecheck` | PASS |
| Full runtime-active spec-lint | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --reconciliation _integration/RECONCILIATION.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | PASS, 0 blocking findings |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | FAIL overall on 337 remaining runtime-evidence blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows parsed | 420 | 420 |
| `runtime_active` rows | 80 | 81 |
| `spec_binding_pending_pack_m02_3` rows | 205 | 204 |
| Total blockers | 338 | 337 |

Remaining blockers by owner:

| Owner | Count |
|---|---:|
| M02.3 | 204 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

## Files Updated

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/run-all.ts`
- `tools/spec-lint/gates/rbac_role_name_canonicality.ts`
- `tools/spec-lint/fixtures/rbac_role_name_canonicality/pass.md`
- `tools/spec-lint/fixtures/rbac_role_name_canonicality/fail.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
