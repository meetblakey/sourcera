# Phase V711 Solo Billing Card Price Singleton Runtime Promotion Verify

**Date:** 2026-07-07
**Scope:** M02.3 spec-tree runtime evidence for `solo_billing_card_price_single_source`.

## Scope Boundary

This pass promotes a documentation/spec-tree gate only. It does not promote billing runtime tests, Convex deploy validators, API serializers, or product-codebase rows without their own runtime evidence.

## Drift Closed

UX §8.1.2 carried static Solo billing-card prices. The surface now uses canonical placeholders sourced from Master Spec §34.2.1 / §34.2.2 / §34.2.5:

| Variant | Current source behavior |
| :---- | :---- |
| Subscription | `{canonical Solo subscription price}/mo` resolved from §34.2.1 / §34.2.2 at presentation time. |
| Buyer per-evaluation | `{canonical per-evaluation price}` resolved from §34.2.5 at presentation time. |
| Seller per-bid | `{canonical per-bid price}` resolved from §34.2.5 at presentation time. |

## Evidence

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/solo_billing_card_price_single_source.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| §M.5 status | Promoted `solo_billing_card_price_single_source` from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 351 blockers, down from 352. Remaining blockers: 218 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| `tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/solo_billing_card_price_single_source.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --no-emit` | Pass, 0 findings |
| `npm --prefix tools/spec-lint run typecheck` | Pass |
| `npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md` | Pass, 0 blocking findings |
| `tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json` | Fails overall on the remaining 351 runtime-evidence blockers |

## Residual

Adjacent Solo runtime rows remain pending where they require application evidence: seller serializers, charge handlers, AIOperation write tests, telemetry routing, billing-runtime tests, and deploy validators.
