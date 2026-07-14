# Phase V711 FGA Custom Role Scope Runtime Promotion Verify

**Date:** 2026-07-09
**Gate:** `fga_custom_role_scope_canonical_consumer`
**Disposition:** Promoted to `runtime_active`

## Scope

This pass promotes only the §5.13.1 / Appendix J role-scope registry documentation contract and its spec-tree detector. It proves:

- Every current Sourcera RBAC role enum value has exactly one Appendix J `fga_custom_role_scope_type` binding.
- Appendix J `fga_custom_role_scope_type` contains `organization`, `workspace`, `bid_workspace`, `marketplace`, and `platform`.
- `marketplace_public_reader` remains explicitly anonymous / non-FGA.
- Ops roles use Appendix J `platform`.

It does not claim product role-resolution code paths, WorkOS API integration, deploy-validator proof, integration tests, SCIM runtime behavior, or WorkOS FGA API behavior.

## Conflict Closed

§5.13.1 previously mapped `seller_kb_viewer` twice: once to `organization` and once to `bid_workspace`. That contradicted the gate's exactly-one-scope invariant. The same table used prose-only `platform-wide` for Ops roles instead of Appendix J `platform`.

The pass removes the duplicate `seller_kb_viewer` bid-workspace binding while preserving its org-scoped KB/Bid-read authority, and changes Ops-role scope to `platform`.

## Changes

| Surface | Result |
|---|---|
| Runtime harness | Added `tools/spec-lint/gates/fga_custom_role_scope_canonical_consumer.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/fga_custom_role_scope_canonical_consumer/`. |
| Spec-lint registry | Registered the gate in `tools/spec-lint/run-all.ts`. |
| Master Spec | Promoted §M.5.4 `fga_custom_role_scope_canonical_consumer` from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| AE ledger | Added the AE-3V-002 runtime-promotion addendum. |
| Reconciliation | Added this closeout note. |
| Blocker inventory | Removed the stale CSV blocker row and refreshed the Markdown inventory to 219 blockers. |

## Verification

| Check | Command | Result |
|---|---|---|
| Direct detector | `npx tsx tools/spec-lint/gates/fga_custom_role_scope_canonical_consumer.ts --spec Sourcera_Master_Spec.md --no-emit` | PASS, 0 findings |
| Pass fixture | `npx tsx tools/spec-lint/gates/fga_custom_role_scope_canonical_consumer.ts --spec tools/spec-lint/fixtures/fga_custom_role_scope_canonical_consumer/pass.md --no-emit` | PASS, 0 findings |
| Fail fixture | `npx tsx tools/spec-lint/gates/fga_custom_role_scope_canonical_consumer.ts --spec tools/spec-lint/fixtures/fga_custom_role_scope_canonical_consumer/fail.md --no-emit` | FAIL as expected, 8 findings |
| Typecheck | `npx tsc --noEmit` from `tools/spec-lint` | PASS |
| Full spec-lint | `npm run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` from `tools/spec-lint` | PASS, 0 blocking findings |
| Stamp gate | `npx tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_after_fga_scope_canonical.json` | FAIL overall on remaining blockers; target gate absent |

## Stamp-Gate Posture

| Metric | Count |
|---|---:|
| Runtime rows parsed | 420 |
| `runtime_active` | 199 |
| `spec_binding_pending_pack_m02_3` | 86 |
| `spec_binding_pending_pack_m11_3` | 102 |
| `spec_binding_pending_pack_m21_3` | 26 |
| `spec_binding_pending_pack_m24_3` | 5 |
| `spec_binding_release_gate_only` | 2 |
| Total blockers | 219 |

`fga_custom_role_scope_canonical_consumer` has 0 current stamp-gate findings.
