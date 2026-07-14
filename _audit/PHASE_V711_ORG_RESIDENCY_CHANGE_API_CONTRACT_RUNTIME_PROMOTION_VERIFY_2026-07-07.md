# Phase v7.1.1 Org Residency Change API Contract Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `org_residency_change_api_contract_complete`
**Owner pack:** M02.3

## Scope

Promote the Org residency-change API contract row from `spec_binding_pending_pack_m02_3` to `runtime_active` after detector, fixture, typecheck, full spec-lint, and stamp-gate proof.

## Source Changes

| Surface | Result |
|---|---|
| Runtime harness | Added `tools/spec-lint/gates/org_residency_change_api_contract_complete.ts` and registered it in `tools/spec-lint/run-all.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/org_residency_change_api_contract_complete/`. |
| Master Spec | §M.5.63 row promoted to `runtime_active`; detector proves §32.8.25 auth, RBAC, rate-limit, idempotency, request / response, error table, audit, webhook family, Appendix C/G/I/J, and stale path protection. |
| Conflict closed | §32.8.25 now separates request-created audit (`entity_type=organization`, `action=created`) from the Appendix C `org.residency_change.initiated` execution event. |
| Stale path closed | Appendix I `stripe_customer_active_duplicate` now cites `/v1/orgs/{org_id}/residency-migration-requests`, not stale `/v1/organizations/{org_id}/...`. |
| Scope boundary | Documentation and spec-lint promotion only. No deployed API handler, migration worker, Stripe rebinding, storage migration, or Ops workflow runtime proof is claimed. |

## Verification

| Check | Result |
|---|---|
| Direct detector run | PASS, 0 findings |
| Pass fixture | PASS, 0 findings |
| Fail fixture | FAIL as expected with 70 findings |
| Typecheck | PASS |
| Full spec-lint batch | PASS, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | FAIL overall on the remaining 270 runtime-evidence blockers |

## Stamp-Gate Posture

Current stamp gate parses **420** runtime rows and reports:

| Runtime status | Count |
|---|---:|
| `runtime_active` | 148 |
| `spec_binding_pending_pack_m02_3` | 137 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |
