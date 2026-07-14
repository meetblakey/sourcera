# v7.1.1 Pipeline Status / Console Firewall Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 runtime evidence promotion for five §M.5 rows:

- `workspace_status_state_machine_canonicality`
- `pipeline_phase_canonical_13_value_consumer`
- `pipeline_phase_state_machine_canonicality`
- `console_bridge_no_dsar_event_kinds`
- `console_bridge_no_group_event_kinds`

## Conflicts Found And Closed

| Conflict | Remediation |
|---|---|
| §10.13.7 treated Solo Selection Report export grace expiry as a rollback from `phase_13_contract_closure` to `phase_12_selection`, while Appendix L.11 makes Phase 13 terminal and rejects backward transitions. | §10.13.7 now changes `solo_charge_state` only; the expired export path emits `selection_report_export_grace_expired_billing_blocked` and does not emit `workspace.phase_advanced`. |
| §10.14 described Workspace status values `cancelled` / `deletion_in_progress`, while Appendix J `workspace_status` allows only `draft`, `active`, `suspended`, `closed`, and `archived`. | §10.14 now uses `CancellationRequest.status` (`undo_grace`, `processing`, `recovered`) and restores Workspace state from `CancellationRequest.prior_workspace_status`; no invalid Workspace status is written. |

## Runtime Evidence

| Gate | Evidence |
|---|---|
| `workspace_status_state_machine_canonicality` | Detector added at `tools/spec-lint/gates/workspace_status_state_machine_canonicality.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS. |
| `pipeline_phase_canonical_13_value_consumer` | Detector added at `tools/spec-lint/gates/pipeline_phase_canonical_13_value_consumer.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS. |
| `pipeline_phase_state_machine_canonicality` | Detector added at `tools/spec-lint/gates/pipeline_phase_state_machine_canonicality.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS. |
| `console_bridge_no_dsar_event_kinds` | Detector added at `tools/spec-lint/gates/console_bridge_no_dsar_event_kinds.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS. |
| `console_bridge_no_group_event_kinds` | Detector added at `tools/spec-lint/gates/console_bridge_no_group_event_kinds.ts`; wired into `tools/spec-lint/run-all.ts`; direct run PASS. |

## Verification

| Check | Result |
|---|---|
| Direct detector runs | Pass, 0 findings for all five gates. |
| `npm --prefix tools/spec-lint run typecheck` | Pass. |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings. |
| `tools/release/stamp_gate.ts --json` | Fails overall on remaining runtime-evidence blockers. Current parse: 420 runtime rows; 370 blockers. |

## Stamp-Gate Delta

| Owning pack | Remaining blockers |
|---|---:|
| `m02_3` | 237 |
| `m11_3` | 102 |
| `m21_3` | 26 |
| `m24_3` | 5 |

**Disposition:** The five rows above are promoted to `runtime_active`. No product-codebase rows were promoted. Remaining blockers require their own runtime evidence before stamp promotion.
