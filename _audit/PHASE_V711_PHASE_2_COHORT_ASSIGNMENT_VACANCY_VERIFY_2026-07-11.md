# v7.1.1 Phase 2 Cohort Assignment and Vacancy — Verification

**Date:** 2026-07-11  
**Defects:** D-2-020, D-2-021  
**Verdict:** **PASS — documentation closure only; stamp remains blocked.**

## Conflict and Resolution

§2.6.1 allowed a cohort heuristic and owner reassignment but did not specify durable provenance, accepted-assignment re-triggering, coverage recomputation, churn recovery, audit, API, mobile, or metric behavior. §8.4 owns evaluation-triage SLA behavior, not cohort assignment; applying it would create an unsupported deadline or automatic escalation. §5.9 owns Executive Sponsor designation, not email-domain cohort classification.

The new AE-bound §2.6.1.A makes the Buyer Workspace assignment durable and one-time, adds a serialized `historical_backfill` migration that cannot change RBAC, and makes re-suggestion non-mutating until an Owner submits the versioned override. It derives coverage from active eligible members for existing hard gates, recomputes it atomically on membership or eligibility changes, and creates one deduplicated `team_assignment` Inbox action for a vacancy. The Owner explicitly resolves a vacancy; no cohort vacancy auto-promotes a user or blocks phase advancement outside existing §10.16 `gate_validation_failed` behavior.

Appendix J, Appendix L.24, §4.3.2, §6.9, §20, §32.10.9.J, Appendix I, and Appendix M use the same field, enum, audit, error, permission, residency, retention, mobile/offline, and firewall contracts. The four-term `WorkspacePulseHealth` score is unchanged; Cohort Reassignment Rate is expressly a Team-Mode non-score operational metric.

## Authored-Extension Boundary

`AE-V711-PH2-COHORT-ASSIGNMENT-VACANCY-01` remains **pending human sign-off**. This corpus contains no migration, mutation handler, authorization check, atomic recomputation, outbox, audit producer, inbox delivery, metric worker, mobile client, or runtime test. Static consistency is not runtime promotion.

## Evidence

- `workspace_cohort_assignment_vacancy_contract` passes on the live Master Spec and positive fixture.
- The negative fixture fails with the required missing-contract findings.
- TypeScript and the full blocking spec-lint batch pass after ledger and reconciliation updates.
- Exact-status scan: **0 open P0, 0 open P1, 0 blocked P1, 323 open P2, 105 open P3**.
- Stamp gate: **489 runtime rows, 319 `runtime_active`, 168 blockers** — 118 M11.3, 29 M21.3, 12 M02.3, 9 M24.3. Two `spec_binding_release_gate_only` rows remain. The failure is expected and unresolved.

```sh
npm --prefix tools/spec-lint run typecheck
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/workspace_cohort_assignment_vacancy_contract.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/workspace_cohort_assignment_vacancy_contract.ts --spec tools/spec-lint/fixtures/workspace_cohort_assignment_vacancy_contract/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/workspace_cohort_assignment_vacancy_contract.ts --spec tools/spec-lint/fixtures/workspace_cohort_assignment_vacancy_contract/fail.md --no-emit
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/exact_status_scan.ts --ledger _audit/DEFECT_LEDGER.md --json
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```
