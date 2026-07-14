# v7.1.1 Usage Envelope Violation Kind Appendix I Pairing Runtime Promotion Verification

**Date:** 2026-07-07
**Gate:** `usage_envelope_violation_kind_appendix_i_pairing`
**Scope:** M02.3 spec-tree runtime evidence only.

## Scope Boundary

This pass promotes a documentation/spec-lint contract only. It does not claim product-code validator execution, Convex deployment, PostHog delivery, dashboard read-path runtime, or production telemetry evidence.

## Conflict Closed

The prior source text claimed a 1:1 pairing between Appendix J `usage_envelope_violation_kind` and Appendix I error codes, but two conflicts remained:

- `usage_event_residency_mismatch` was reused for both `residency_mismatch` and `residency_partition_denial`.
- `usage_event_envelope_unknown_property` was described as pairing with `enum_violation`, even though unknown-property is not an Appendix J enum value.

The Master Spec now carries a canonical §51.2.5 11-cause mapping table, a distinct `usage_event_residency_partition_denial` Appendix I code, Appendix G event-property alignment for all 11 values, and explicit exclusion of `usage_event_envelope_unknown_property` from the closed enum pairing.

## Verification

| Check | Command | Result |
| :---- | :---- | :---- |
| Direct detector run | `npx tsx tools/spec-lint/gates/usage_envelope_violation_kind_appendix_i_pairing.ts --spec Sourcera_Master_Spec.md --no-emit` | Pass, 0 findings |
| Pass fixture | `npx tsx tools/spec-lint/gates/usage_envelope_violation_kind_appendix_i_pairing.ts --fixture tools/spec-lint/fixtures/usage_envelope_violation_kind_appendix_i_pairing/pass.md --no-emit` | Pass, 0 findings |
| Fail fixture | `npx tsx tools/spec-lint/gates/usage_envelope_violation_kind_appendix_i_pairing.ts --fixture tools/spec-lint/fixtures/usage_envelope_violation_kind_appendix_i_pairing/fail.md --no-emit` | Fails with expected findings for incomplete mapping, duplicate residency code, unknown-property enum pairing, missing Appendix G values, and pending §M.5 status |
| Typecheck | `npm --prefix tools/spec-lint run typecheck` | Pass |
| Full spec-lint batch | `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | Fails overall on the remaining 281 runtime-evidence blockers |

## Stamp-Gate Posture

| Metric | Count |
| :---- | ---: |
| Runtime rows parsed | 420 |
| `runtime_active` | 137 |
| `spec_binding_pending_pack_m02_3` | 148 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |
| Blocking rows | 281 |

## Updated Artifacts

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/gates/usage_envelope_violation_kind_appendix_i_pairing.ts`
- `tools/spec-lint/fixtures/usage_envelope_violation_kind_appendix_i_pairing/pass.md`
- `tools/spec-lint/fixtures/usage_envelope_violation_kind_appendix_i_pairing/fail.md`
- `tools/spec-lint/run-all.ts`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
