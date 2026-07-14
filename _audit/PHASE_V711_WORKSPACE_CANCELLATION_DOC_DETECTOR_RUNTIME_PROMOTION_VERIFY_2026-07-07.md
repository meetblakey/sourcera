# v7.1.1 Workspace Cancellation Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree detector promotion for four §M.5 rows:

- `workspace_cancellation_reason_enum_registered`
- `workspace_cancellation_window_single_source`
- `workspace_recovery_event_catalog_completeness`
- `workspace_cancellation_event_delivery_conformance`

## Scope Boundary

These are documentation/spec-tree gates only. Product-codebase gates remain pending unless their own Convex / API / UI / deploy-validator evidence exists.

## Conflicts Closed

| Conflict | Resolution |
|---|---|
| §10.14.5 used ambiguous "Within 30 days of cancellation" wording, conflicting with the canonical 14-day undo grace plus 30-day processing/recovery window. | §10.14.5 now states recovery is available during Days 14-44 from cancellation initiation, and that no recovery is possible after Day 44 unless a §40.2 retention exemption applies. |
| §10.14.3 projected recovery through `canceled_reason_public`, while §4.7.1 `workspace_reopened_ops` uses `reopen_reason_public`. | §10.14.3 now projects `reopen_reason_public="buyer_recovered_during_grace"`. |
| Appendix G `workspace_recovered` used `prior_status`, while §10.14 payloads use `prior_workspace_status`. | Appendix G now uses `prior_workspace_status`. |

## Runtime Evidence

| Gate | Evidence |
|---|---|
| `workspace_cancellation_reason_enum_registered` | Detector added at `tools/spec-lint/gates/workspace_cancellation_reason_enum_registered.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `workspace_cancellation_window_single_source` | Detector added at `tools/spec-lint/gates/workspace_cancellation_window_single_source.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `workspace_recovery_event_catalog_completeness` | Detector added at `tools/spec-lint/gates/workspace_recovery_event_catalog_completeness.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |
| `workspace_cancellation_event_delivery_conformance` | Detector added at `tools/spec-lint/gates/workspace_cancellation_event_delivery_conformance.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS on live Master Spec. |

## Verification

| Check | Result |
|---|---|
| Direct detector runs | Pass, 0 findings for all four gates. |
| `npm --prefix tools/spec-lint run typecheck` | Pass. |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings. |
| `tools/release/stamp_gate.ts --json` | Fails overall on remaining runtime-evidence blockers. Current parse: 420 runtime rows; 364 blockers. |

## Stamp-Gate Delta

| Owning pack | Remaining blockers |
|---|---:|
| `m02_3` | 231 |
| `m11_3` | 102 |
| `m21_3` | 26 |
| `m24_3` | 5 |

**Disposition:** The four rows above are promoted to `runtime_active`. No product-codebase row was promoted.
