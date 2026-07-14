# Carry-Over Fixture

### 34.5.1 Upgrade

| Aspect | Behavior |
|---|---|
| Carry-over | Seller-side carry-over is canonical in §34.19.1 / §34.19.1.A (13 protected asset classes and sub-class bridge). Buyer-side carry-over is canonical in §34.5.1.A. No implementation may derive an upgrade handler from an inline list in this row. |

### 34.5.1.A Buyer-Side Upgrade Carry-Over Set {#34.5.1.a-buyer-side-upgrade-carry-over-set}

This table is the buyer-side counterpart to the seller-side §34.19.1 / §34.19.1.A protected-asset table.

| # | Buyer asset class | Scope | Guarantee on Upgrade | Canonical backing rows / fields | Notes |
|---|---|---|---|---|---|
| B1 | Workspaces and in-flight evaluations | Buyer Org / Workspace | 100% retained, read-write | Workspace rows | |
| B7 | DowngradeExcessDataBucket restorations | Buyer Org / Console | 100% retained; restored atomically when plan recovers capacity | DowngradeExcessDataBucket (§4.8.10 / §34.6) | |

### 34.19.1 Protected Asset Classes on Upgrade

Seller table.

### 34.19.1.A Protected Asset Sub-Class Bridge {#34.19.1.a-protected-asset-sub-class-bridge}

This table is the canonical bridge between the thirteen §34.19.1 asset classes and the concrete fields, entities, or audit rows that the preservation harness asserts.

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `plan_upgrade_carry_over_single_source` | content_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/plan_upgrade_carry_over_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §34.5.1 / §34.5.1.A / §34.19.1 / §34.19.1.A source-of-truth coverage only; product plan-change orchestration, Stripe webhook handling, data migration, and preservation harness execution remain product-pack evidence) | pr_lint | Assertion. | M02.3 |
