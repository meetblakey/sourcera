# v7.1.1 Core API Detail Runtime Promotion Verify

**Date:** 2026-07-09
**Scope:** `core_api_endpoint_detail_completeness`, `core_api_error_code_registration_consistency`, `internal_comment_legacy_alias_no_shadow_schema`
**Result:** Spec-tree runtime promotion complete; release stamp gate still fails on unrelated runtime-evidence blockers.

## Gap Closed

The Core API Detail cluster was not safe to treat as historical. Current §M.5 still marked all three rows as `spec_binding_pending_pack_m02_3`.

The audit found two live documentation issues:

1. §32.10.9 Audit Event error sets referenced `audit_event_cross_org_access`, `audit_event_direct_write_forbidden`, and `audit_event_immutable`, but Appendix I did not register those codes.
2. The deprecated Internal Comment compatibility route literal appeared outside the §32.10.9.G alias map, conflicting with the alias-only boundary.

## Remediation

| Surface | Change |
|---|---|
| Master Spec §32.5 / §32.10.9.I | Removed literal deprecated Internal Comment route references outside §32.10.9.G while preserving the compatibility contract. |
| Master Spec Appendix I | Registered `audit_event_cross_org_access`, `audit_event_direct_write_forbidden`, and `audit_event_immutable`. |
| Master Spec §M.5.68 | Promoted all three Core API Detail rows to `runtime_active` with spec-tree-only boundaries. |
| Spec-lint runtime | Added and wired `core_api_endpoint_detail_completeness`, `core_api_error_code_registration_consistency`, and `internal_comment_legacy_alias_no_shadow_schema`. |
| Fixtures | Added pass/fail fixtures for all three gates. |
| AE / reconciliation / backlog | Added runtime-promotion addendum to `AE-V72REM-PH8P81-CORE-API-P1-01`; refreshed backlog and blocker inventory. |

## Verification

| Check | Command | Result |
|---|---|---|
| TypeScript | `cd tools/spec-lint && ./node_modules/.bin/tsc --noEmit` | PASS |
| Direct live gates | `cd tools/spec-lint && npx tsx gates/<gate>.ts --spec ../../Sourcera_Master_Spec.md --no-emit` | PASS for all three gates |
| Pass fixtures | `cd tools/spec-lint && npx tsx gates/<gate>.ts --fixture fixtures/<gate>/pass.md --no-emit` | PASS for all three gates |
| Fail fixtures | `cd tools/spec-lint && npx tsx gates/<gate>.ts --fixture fixtures/<gate>/fail.md --no-emit` | FAIL as expected for all three gates |
| Full spec-lint | `cd tools/spec-lint && npm run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | PASS, 0 blocking findings |
| Stamp gate | `npx tsx tools/release/stamp_gate.ts --json` | FAIL on remaining unrelated blockers; promoted targets absent |
| Legacy alias scan | `rg -n "/v1/workspaces/\\{workspace_id\\}/comments" Sourcera_Master_Spec.md` | Only §32.10.9.G alias-map occurrences remain |

## Stamp-Gate Posture

| Metric | Before | After |
|---|---:|---:|
| Runtime rows parsed | 420 | 420 |
| Runtime-active rows | 209 | 212 |
| Total blockers | 209 | 206 |
| M02.3 blockers | 76 | 73 |
| M11.3 blockers | 102 | 102 |
| M21.3 blockers | 26 | 26 |
| M24.3 blockers | 5 | 5 |

JSON evidence: `_audit/_tmp/v711_stamp_gate_after_core_api_detail.json`
Current inventory: `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md`

## Boundary

This closure proves spec-tree API-contract completeness only. Product OpenAPI generation, SDK generation, route shims, endpoint handlers, auth middleware, rate-limit middleware, idempotency persistence, generated clients, runtime API tests, deploy validators, integration tests, and production runtime correctness remain pack-owned evidence.
