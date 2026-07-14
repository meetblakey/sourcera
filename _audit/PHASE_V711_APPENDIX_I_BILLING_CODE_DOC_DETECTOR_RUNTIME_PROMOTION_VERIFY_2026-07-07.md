# Phase v7.1.1 Appendix I Billing-Code Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `appendix_i_billing_code_completeness`
**Scope:** M02.3 spec-tree runtime promotion only.

## Verdict

PASS for this gate. The v7.1.1 stamp gate still fails on remaining runtime-evidence blockers.

## Gap Closed

The §4.8.1.A Ops emergency-reversal emit path referenced two HTTP error codes that were missing from Appendix I Pre-existing Billing Domain Codes:

- `ai_operation_emergency_reversal_reason_invalid`
- `ai_operation_emergency_reversal_volume_cap_exceeded`

Both now have Appendix I rows with HTTP status, Used By, retryability, and localization key.

## Verification

| Check | Command | Result |
|---|---|---|
| Live detector | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_i_billing_code_completeness.ts --spec Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| Pass fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_i_billing_code_completeness.ts --fixture tools/spec-lint/fixtures/appendix_i_billing_code_completeness/pass.md --no-emit` | PASS, 0 findings |
| Fail fixture | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_i_billing_code_completeness.ts --fixture tools/spec-lint/fixtures/appendix_i_billing_code_completeness/fail.md --no-emit` | FAIL as expected; missing-row finding emitted |
| Typecheck | `npm --prefix tools/spec-lint run typecheck` | PASS |
| Full runtime-active spec-lint | `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --reconciliation _integration/RECONCILIATION.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit` | PASS, 0 blocking findings |
| Stamp gate | `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --spec Sourcera_Master_Spec.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --defect-ledger _audit/DEFECT_LEDGER.md --json` | FAIL overall on 340 remaining runtime-evidence blockers |

## Stamp-Gate Delta

| Metric | Before | After |
|---|---:|---:|
| Runtime rows parsed | 420 | 420 |
| `runtime_active` rows | 77 | 78 |
| `spec_binding_pending_pack_m02_3` rows | 208 | 207 |
| Total blockers | 341 | 340 |

Remaining blockers by owner:

| Owner | Count |
|---|---:|
| M02.3 | 207 |
| M11.3 | 102 |
| M21.3 | 26 |
| M24.3 | 5 |

## Files Updated

- `Sourcera_Master_Spec.md`
- `tools/spec-lint/run-all.ts`
- `tools/spec-lint/gates/appendix_i_billing_code_completeness.ts`
- `tools/spec-lint/fixtures/appendix_i_billing_code_completeness/pass.md`
- `tools/spec-lint/fixtures/appendix_i_billing_code_completeness/fail.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv`
- `_audit/V711_BACKLOG_INDEX.md`
- `_integration/RECONCILIATION.md`
