# Phase V711 Error Envelope Doc-Detector Runtime Promotion Verify

**Date:** 2026-07-07  
**Scope:** M02.3 spec-tree runtime evidence for `error_envelope_canonical`.

## Verdict

PASS for the spec-tree gate. The detector artifact exists, is registered in the runtime-active spec-lint batch, passes on the live Master Spec, and has positive / negative fixtures.

The v7.1.1 stamp gate still fails overall on remaining runtime-evidence blockers.

## Scope Boundary

This pass promotes a documentation/spec-tree gate only. It does not claim product API-handler middleware, deployed response serialization, client rendering, or integration-test coverage.

## Source Fixes

| Surface | Fix |
| :---- | :---- |
| §6.7 audit-secret strip failure | Replaced stale top-level `error_code` body with the §32.6 nested `error.code` envelope. |
| §22 MCP / KB tool examples | Replaced legacy `error.type` / `retry_after_ms`-only examples with §32.6-shaped `error.code`, `error.message`, `error.details`, and `error.request_id`. |
| §27.6.5 taxonomy write rejection | Replaced string-form `error` payload with the standard nested error envelope and moved endpoint-specific fields under `error.details`. |
| §51.3.5 usage analytics | Moved `http_status` under `error.details` and added `localization_key`, `details`, and `retry_after_seconds`. |

## Evidence

| Check | Result |
| :---- | :---- |
| `npm --prefix tools/spec-lint run gate -- error_envelope_canonical --spec ../../Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| `npm --prefix tools/spec-lint run gate -- error_envelope_canonical --spec fixtures/error_envelope_canonical/pass.md --no-emit` | PASS, 0 findings |
| `npm --prefix tools/spec-lint run gate -- error_envelope_canonical --spec fixtures/error_envelope_canonical/fail.md --no-emit` | FAIL as expected; catches top-level `error_code`, string `error`, legacy `error.type`, missing `details`, missing `request_id`, and unregistered codes |
| `npm --prefix tools/spec-lint run typecheck` | PASS |
| `npm --prefix tools/spec-lint run all -- --no-emit` | PASS, 0 blocking findings |
| `npx tsx tools/release/stamp_gate.ts --json` | FAIL overall on 328 remaining runtime-evidence blockers |

## What Changed

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/error_envelope_canonical.ts` and registered it in `tools/spec-lint/run-all.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/error_envelope_canonical/`. |
| §M.5 status | Promoted `error_envelope_canonical` from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Blocker inventory | Regenerated `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.csv` and updated the markdown summary. |

## Current Stamp-Gate Posture

| Metric | Count |
| :---- | ----: |
| Runtime rows parsed | 420 |
| `runtime_active` rows | 90 |
| Remaining blockers | 328 |
| M02.3 blockers | 195 |
| M11.3 blockers | 102 |
| M21.3 blockers | 26 |
| M24.3 blockers | 5 |
