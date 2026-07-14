# Phase v7.1.1 Section 40.4 Residency Contract Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `section_40_4_residency_contract_resolves`
**Owner pack:** M02.3

## Scope

Promote the §40.4 residency-contract row from `spec_binding_pending_pack_m02_3` to `runtime_active` after detector, fixture, typecheck, full spec-lint, and stamp-gate proof.

## Source Changes

| Surface | Result |
|---|---|
| Runtime harness | Added `tools/spec-lint/gates/section_40_4_residency_contract_resolves.ts` and registered it in `tools/spec-lint/run-all.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/section_40_4_residency_contract_resolves/`. |
| Master Spec | §M.5.63 row promoted to `runtime_active`; detector proves §40.4 heading, registry, migration/source-retention rules, APAC/custom inclusion, and §M.5 proof text. |
| Conflict closed | The table-of-contents label no longer presents §40.4 as only "Import Round-Trip Fidelity"; it now points to the data residency contract registry and import round-trip fidelity. |
| Gap closed | §40.4 `custom` registry row now explicitly states customer-data shard behavior. |
| Scope boundary | Documentation and spec-lint promotion only. No deployed storage, signer, provider-routing, DR, or migration-worker runtime proof is claimed. |

## Verification

| Check | Result |
|---|---|
| Direct detector run | PASS, 0 findings |
| Pass fixture | PASS, 0 findings |
| Fail fixture | FAIL as expected with 23 findings |
| Typecheck | PASS |
| Full spec-lint batch | PASS, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | FAIL overall on the remaining 269 runtime-evidence blockers |

## Stamp-Gate Posture

Current stamp gate parses **420** runtime rows and reports:

| Runtime status | Count |
|---|---:|
| `runtime_active` | 149 |
| `spec_binding_pending_pack_m02_3` | 136 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |
