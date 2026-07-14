# v7.1.1 Phase 2.2 Seller-Entity Hygiene Verification

**Date:** 2026-07-11  
**Defects:** D-2.2-062, D-2.2-063, D-2.2-066  
**Verdict:** PASS — three P3 documentation rows closed; no product-runtime promotion.

## Current-source resolution

The filed §4.4.19 and §4.4.21 checks used the retired single `org_id.plan_tier` shape and duplicated Seller-tier sets. `Organization.seller_plan_tier` is the current per-console field; §34.1.2 owns eligibility and §5.11 owns feature access. The three sources now agree.

§4.4.1, §4.4.2, §4.4.3, §4.4.5, and §4.4.6 now have canonical heading anchors. No entity field, plan eligibility, API, entitlement, billing, or verification workflow changed.

## Recurrence guard

`seller_entity_plan_gate_and_anchor_hygiene` passed on the live Master Spec and its positive fixture. Its negative fixture failed as expected on missing anchors, missing canonical plan bindings, and retained `org_id.plan_tier` plan-set text.

The guard is static documentation proof only. Entitlement evaluation, billing, verification-review workflow, and production plan enforcement remain product-pack evidence.

Full spec-lint passed. The live exact-status scan reports 0 open P0, 0 open P1, 0 blocked P1, 341 open P2, and 116 open P3. The stamp gate parses 482 runtime rows with 312 `runtime_active` rows and remains blocked on the same 168 runtime-evidence rows: 118 M11.3, 29 M21.3, 12 M02.3, and 9 M24.3.

## Commands

```sh
npm --prefix tools/spec-lint run typecheck
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/seller_entity_plan_gate_and_anchor_hygiene.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/seller_entity_plan_gate_and_anchor_hygiene.ts --spec tools/spec-lint/fixtures/seller_entity_plan_gate_and_anchor_hygiene/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/seller_entity_plan_gate_and_anchor_hygiene.ts --spec tools/spec-lint/fixtures/seller_entity_plan_gate_and_anchor_hygiene/fail.md --no-emit
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json > _audit/_tmp/v711_stamp_gate_2026-07-11_phase22-seller-entity-hygiene.json
tools/spec-lint/node_modules/.bin/tsx tools/release/generate_runtime_blocker_inventory.ts --root . --stamp-json _audit/_tmp/v711_stamp_gate_2026-07-11_phase22-seller-entity-hygiene.json --md _audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY.md --csv _audit/v711_runtime_stamp_gate_blockers.csv --date 2026-07-11
```
