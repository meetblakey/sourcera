# Phase 38 UserUIPreference Resilience Verification — 2026-07-11

## Scope

D-38-011, D-38-012, D-38-013, D-38-019, and D-38-021.

## Conflict and resolution

§4.2.15 / §40.2 described Pattern B actor pseudonymization, while §6.8.4.3 registered UserUIPreference as Class 4 Pattern A row hard-delete. §6.8.4.3 wins. The §4 and §40 wording now follows it; §4.1.1 retains the transactional idempotency-marker contract. The §38 mirror now includes mutation attribution and the deliberate no-`console` scope rationale.

§38 previously lacked an offline ordering and console-removal contract. §4.2.15 and §38.6.3.1 now require active-console `client_observed_at` plus UUID idempotency keys, duplicate-result reuse, deterministic LWW ordering, a ±5-minute clock window, stale/skew recovery, queue invalidation on console removal, safe preference preservation, and clean re-add initialization.

## Evidence

```text
npm --prefix tools/spec-lint run typecheck
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/ui_preference_resilience_contract.ts --spec Sourcera_Master_Spec.md
! tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/ui_preference_resilience_contract.ts --spec tools/spec-lint/fixtures/ui_preference_resilience_contract/fail.md
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/ui_preference_resilience_contract.ts --spec tools/spec-lint/fixtures/ui_preference_resilience_contract/pass.md
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

Results: typecheck and full spec-lint PASS; live and pass fixture PASS; negative fixture FAILS. Exact-status returns 0 open P0, 0 open P1, 0 blocked P1, 284 open P2, and 98 open P3. Stamp gate correctly FAILS with 497 runtime rows, 326 `runtime_active`, and 181 blockers: 118 M11.3, 29 M21.3, 13 M02.3, 9 M24.3, plus 12 pending human-ratification release blockers.

## Boundary

`ui_preference_resilience_contract` proves documentation consistency only. It does not prove production schema changes, queue behavior, authorization, serializers, DSAR execution, audit delivery, or runtime test coverage. `AE-V711-PH38-UI-PREFERENCE-RESILIENCE-01` remains pending human sign-off for v7.1.1.
