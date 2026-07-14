# v7.1.1 DSAR Idempotency Marker Spec-Tree Runtime Promotion Verify

**Date:** 2026-07-09
**Scope:** `dsar_cascade_per_row_idempotency_marker_completeness`
**Outcome:** Promoted to `runtime_active` for spec-tree proof only.

## Gap Closed

§6.8.4.6 required every §6.8.4.3 cascade target to carry `dsar_redacted_under_request_id` and `dsar_redacted_at`, but §4 had no common schema contract binding those fields across the registry.

## Edits

| File | Change |
|---|---|
| `Sourcera_Master_Spec.md` | Added §4.1.1 DSAR Cascade Idempotency Marker Mixin; rebound §6.8.4.6 AC #6; promoted the §M.5 row. |
| `tools/spec-lint/gates/dsar_cascade_per_row_idempotency_marker_completeness.ts` | Added detector. |
| `tools/spec-lint/fixtures/dsar_cascade_per_row_idempotency_marker_completeness/pass.md` | Added positive fixture. |
| `tools/spec-lint/fixtures/dsar_cascade_per_row_idempotency_marker_completeness/fail.md` | Added negative fixture. |
| `tools/spec-lint/run-all.ts` | Wired detector into runtime-active batch. |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Added AE-V9-004 runtime-promotion addendum and non-promotion note for DSAR residency / WorkOS raw-attribute product-code blockers. |
| `_integration/RECONCILIATION.md` | Added promotion + boundary entry. |
| `_audit/V711_BACKLOG_INDEX.md` | Added current execution-surface entry. |
| `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md` / `.csv` | Refreshed from latest stamp-gate JSON. |

## Verification

| Command | Result |
|---|---|
| `npm --prefix tools/spec-lint exec tsx tools/spec-lint/gates/dsar_cascade_per_row_idempotency_marker_completeness.ts -- --spec tools/spec-lint/fixtures/dsar_cascade_per_row_idempotency_marker_completeness/pass.md --no-emit` | PASS, 0 findings. |
| `npm --prefix tools/spec-lint exec tsx tools/spec-lint/gates/dsar_cascade_per_row_idempotency_marker_completeness.ts -- --spec tools/spec-lint/fixtures/dsar_cascade_per_row_idempotency_marker_completeness/fail.md --no-emit` | FAIL as expected, 13 findings. |
| `npm --prefix tools/spec-lint exec tsx tools/spec-lint/gates/dsar_cascade_per_row_idempotency_marker_completeness.ts -- --no-emit` | PASS, 0 findings. |
| `npm --prefix tools/spec-lint run typecheck` | PASS. |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | PASS, 0 blocking findings. |
| `npm --prefix tools/spec-lint exec tsx tools/release/stamp_gate.ts -- --json > _audit/_tmp/v711_stamp_gate_after_dsar_idempotency_marker.json` | FAIL overall on unrelated blockers; promoted gate absent from findings. |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Total blockers | 165 | 164 |
| `runtime_active` rows | 253 | 254 |
| `spec_binding_pending_pack_m02_3` rows | 32 | 31 |
| `spec_binding_pending_pack_m11_3` rows | 102 | 102 |
| `spec_binding_pending_pack_m21_3` rows | 26 | 26 |
| `spec_binding_pending_pack_m24_3` rows | 5 | 5 |

## Not Promoted

| Gate | Reason |
|---|---|
| `dsar_cascade_residency_partition_isolation` | Product-code static analysis is required to prove no cross-region cascade reads and no non-home User source-row mutation. |
| `workos_raw_attributes_not_consumed` | Product-code static analysis is required to prove no WorkOS ingestion path reads `Directory User.raw_attributes`. |

## Boundary

This pass proves only the Master Spec schema contract, registry binding, and detector coverage. It does not prove product cascade-worker mutation behavior, serializable transaction execution, row-write migrations, WorkOS ingestion code, runtime resume behavior, deploy validators, integration tests, or production runtime correctness.
