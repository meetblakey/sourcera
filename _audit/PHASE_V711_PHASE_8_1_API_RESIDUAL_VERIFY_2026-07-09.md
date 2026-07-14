# v7.1.1 Phase 8.1 API Residual Verification

**Date:** 2026-07-09  
**Verdict:** Nine canonical P2 rows closed; release remains blocked by current product/runtime evidence gaps.

## Scope

Closed D-V8.1-007, D-V8.1-017, D-V8.1-019, and D-V8.1-027 through D-V8.1-032.

## Before / After

| Measure | Before | After | Delta |
|---|---:|---:|---:|
| Open P0 | 0 | 0 | 0 |
| Open P1 | 0 | 0 | 0 |
| Blocked P1 | 0 | 0 | 0 |
| Open P2 | 443 | 434 | -9 |
| Open P3 | 156 | 156 | 0 |
| §M.5 runtime rows | 452 | 457 | +5 |
| `runtime_active` rows | 290 | 291 | +1 |
| Runtime-evidence blockers | 160 | 164 | +4, newly visible product checks |

Current blocker split: 116 M11.3, 28 M21.3, 12 M02.3, and 8 M24.3.

## Remediation

- Declared MCPSessionTokenRecord mint/revoke internal-only and absent from public v1 by design.
- Made standard `Retry-After` canonical; retained the X-prefixed header only as an equal-value compatibility copy.
- Replaced bare plan names with canonical buyer/seller plan enums and separated entitlement from quota.
- Added HTTP 207, 304, 410, and 423 semantics and recovery guidance.
- Rewrote §32.7 as measurable, negative-path acceptance criteria.
- Added Stripe-timeout, Billing Ledger export-failure, Enterprise signoff-expiry, KB-export-pause, and cross-console filter contracts.
- Registered export/plan states, cascade actions, events, analytics, audit actions, and error codes.
- Added §39.1 numerical singletons and made §32.4.5 the binding registry rather than a second numerical authority.
- Registered §M.5.84 recurrence and runtime-evidence rows.

## Conflicts Resolved

- §34.1.1 / §34.1.2 override the filed bare-plan quota interpretation. API-key count does not grant general API access.
- `Retry-After` is canonical; `X-RateLimit-RetryAfter` is compatibility-only.
- §39.1 owns named class numerics; §32.4.5 owns class binding, scope, and errors.
- KB export `paused` is now a real non-terminal state rather than prose mapped to `queued`.

## Runtime Evidence Boundary

`api_phase81_residual_contract_completeness` is active as spec-tree proof. These product checks remain blockers:

| Gate | Pack | Missing evidence |
|---|---|---|
| `api_multistatus_schema_registration` | M02.3 | Generated OpenAPI validator and schema test |
| `api_standard_retry_after_runtime_consistency` | M11.3 | Middleware and API integration tests |
| `billing_async_failure_state_runtime_consistency` | M11.3 | Worker and API integration tests |
| `api_rate_limit_plan_quota_runtime_consistency` | M24.3 | Entitlement deploy validator and API integration test |

Exact paths are recorded in §M.5.84 and `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.csv`.

## Verification

```zsh
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/api_phase81_residual_contract_completeness.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/api_phase81_residual_contract_completeness.ts --spec tools/spec-lint/fixtures/api_phase81_residual_contract_completeness/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/api_phase81_residual_contract_completeness.ts --spec tools/spec-lint/fixtures/api_phase81_residual_contract_completeness/fail.md --no-emit
tools/spec-lint/node_modules/.bin/tsc --noEmit -p tools/spec-lint/tsconfig.json
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --reconciliation _integration/RECONCILIATION.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

Observed:

- Live residual gate: PASS.
- Positive fixture: PASS.
- Negative fixture: FAIL with 37 expected findings.
- TypeScript: PASS.
- Full spec-lint: PASS with zero blocking findings.
- Existing rate-limit, billing-error, idempotency, and pagination gates: PASS.
- Exact-status right-edge scan: 0 P0, 0 P1, 0 blocked P1, 434 P2, 156 P3.
- Stamp gate: expected FAIL on 164 missing runtime-evidence rows after parsing 457 rows with 291 active.

## Evidence

- Master Spec §22.8.3.1, §25.3.10a, §32, §39.1, §44.1, Appendix C, Appendix G, Appendix I, Appendix J, and §M.5.84.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` AE-V72REM-PH8P81-CORE-API-P1-01 addendum.
- `_audit/_tmp/v711_stamp_gate_after_phase81_api_residual.json`.
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md` and `.csv`.
