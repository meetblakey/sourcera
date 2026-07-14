# Phase V711 Console-Scope Header Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07  
**Scope:** M02.3 spec-tree runtime evidence for `console_scope_both_header_required`.

## Verdict

PASS for the spec-tree gate. The detector artifact exists, is registered in the runtime-active spec-lint batch, passes on the live Master Spec, and has positive / negative fixtures.

The v7.1.1 stamp gate still fails overall on remaining runtime-evidence blockers.

## Scope Boundary

This pass promotes a documentation/spec-tree gate only. It does not claim product API-handler enforcement, Convex middleware behavior, or deployed endpoint tests. Those remain owned by separate product-code/runtime §M.5 rows where present.

## Evidence

| Check | Result |
| :---- | :---- |
| `npm --prefix tools/spec-lint run gate -- console_scope_both_header_required --spec ../../Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| `npm --prefix tools/spec-lint run gate -- console_scope_both_header_required --spec fixtures/console_scope_both_header_required/pass.md --no-emit` | PASS, 0 findings |
| `npm --prefix tools/spec-lint run gate -- console_scope_both_header_required --spec fixtures/console_scope_both_header_required/fail.md --no-emit` | FAIL as expected; missing registry / enum / token-axis bindings and invalid `X-Sourcera-Console: both` example detected |
| `npm --prefix tools/spec-lint run typecheck` | PASS |
| `npm --prefix tools/spec-lint run all -- --no-emit` | PASS, 0 blocking findings |
| `npx tsx tools/release/stamp_gate.ts --json` | FAIL overall on 329 remaining runtime-evidence blockers |

## What Changed

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/console_scope_both_header_required.ts` and registered it in `tools/spec-lint/run-all.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/console_scope_both_header_required/`. |
| §M.5 status | Promoted `console_scope_both_header_required` from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Blocker inventory | Regenerated `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv` and updated the markdown summary. |

## Current Stamp-Gate Posture

| Metric | Count |
| :---- | ----: |
| Runtime rows parsed | 420 |
| `runtime_active` rows | 89 |
| Remaining blockers | 329 |
| M02.3 blockers | 196 |
| M11.3 blockers | 102 |
| M21.3 blockers | 26 |
| M24.3 blockers | 5 |
