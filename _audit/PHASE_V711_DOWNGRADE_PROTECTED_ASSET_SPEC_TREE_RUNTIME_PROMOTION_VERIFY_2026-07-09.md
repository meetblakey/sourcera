# Phase v7.1.1 Downgrade / Protected-Asset Spec-Tree Runtime Promotion Verify

**Date:** 2026-07-09
**Scope:** §34.5 / §34.6 / §34.19 / §M.5.65 downgrade and protected-asset M02.3 spec-tree rows.

## Promoted

| Gate | Detector | Runtime status |
|---|---|---|
| `downgrade_excess_bucket_status_enum_canonical` | `tools/spec-lint/gates/downgrade_excess_bucket_status_enum_canonical.ts` | `runtime_active` |
| `plan_upgrade_carry_over_single_source` | `tools/spec-lint/gates/plan_upgrade_carry_over_single_source.ts` | `runtime_active` |
| `downgrade_api_integration_bucket_classes_registered` | `tools/spec-lint/gates/downgrade_api_integration_bucket_classes_registered.ts` | `runtime_active` |

## Not Promoted

| Gate | Reason |
|---|---|
| `protected_asset_archive_state_canonical` | Still pending. Archive transition behavior, retention metadata writes, restore-window enforcement, deploy validation, and runtime tests require product-code/runtime evidence. |
| `protected_asset_purge_guard` | Still pending. Customer purge rejection, legal/DSAR purge routing, API behavior, deploy validation, and runtime tests require product-code/runtime evidence. |

## Conflict Surfaced

Two promoted rows used row classes outside the harness enum or broader than their actual proof:

| Gate | Old row class | Corrected row class |
|---|---|---|
| `downgrade_excess_bucket_status_enum_canonical` | `enum_catalog_invariant` | `enum_consistency` |
| `downgrade_api_integration_bucket_classes_registered` | `plan_gating_invariant` | `spec_tree_lint` |

## Verification

| Check | Result |
|---|---|
| Direct live gates | PASS for all three promoted gates |
| Pass fixtures | PASS for all three promoted gates |
| Fail fixtures | FAIL as expected: 18 / 19 / 17 findings |
| TypeScript | PASS: `npm --prefix tools/spec-lint run typecheck` |
| Full blocking spec-lint | PASS: `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` |
| Stamp gate | Expected FAIL on unrelated blockers only: 167 blockers, 251 `runtime_active`, 34 M02.3, 102 M11.3, 26 M21.3, 5 M24.3, 2 release-only |

## Stamp-Gate Boundary

This pass proves spec-tree downgrade documentation completeness only. It does not claim product downgrade cron behavior, archive writes, protected-asset restore execution, runtime firewall behavior, product plan-change orchestration, Stripe webhook handling, data migration, preservation harness execution, cap counters, API-key serializers, webhook delivery behavior, credential rotation blocking, deploy validators, integration tests, or production runtime correctness.

## Artifacts

- JSON: `_audit/_tmp/v711_stamp_gate_after_downgrade_spec_tree_final.json`
- Latest JSON copy: `_audit/_tmp/v711_stamp_gate_latest.json`
- Inventory: `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.md`
- CSV: `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-09.csv`
- AE ledger addendum: `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- Reconciliation entry: `_integration/RECONCILIATION.md -> v7.1.1 Downgrade / Protected-Asset Spec-Tree Runtime Promotion + Inventory Sync (2026-07-09)`
