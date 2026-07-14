# Phase v7.1.1 API Path Prefix Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `api_path_prefix_canonical`
**Owner pack:** M02.3

## Scope

Promote the API path-prefix row from `spec_binding_pending_pack_m02_3` to `runtime_active` after detector, fixture, typecheck, and full spec-lint proof.

## Source Changes

| Surface | Result |
|---|---|
| Runtime harness | Added `tools/spec-lint/gates/api_path_prefix_canonical.ts` and registered it in `tools/spec-lint/run-all.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/api_path_prefix_canonical/`. |
| Master Spec | §M.5.66 row promoted to `runtime_active`; live REST method/path tokens now use `/v1`; stale `/api/v1`, non-`/v1`, and placeholder endpoint examples are blocked. |
| Scope boundary | Documentation and spec-lint promotion only. No deployed API gateway, router, SDK generation, or production endpoint proof is claimed. |

## Verification

| Check | Result |
|---|---|
| Direct detector run | PASS, 0 findings |
| Pass fixture | PASS, 0 findings |
| Fail fixture | FAIL as expected with 12 findings |
| Typecheck | PASS |
| Full spec-lint batch | PASS, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | FAIL overall on the remaining 273 runtime-evidence blockers |

## Stamp-Gate Posture

Current stamp gate parses **420** runtime rows and reports:

| Runtime status | Count |
|---|---:|
| `runtime_active` | 145 |
| `spec_binding_pending_pack_m02_3` | 140 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |

