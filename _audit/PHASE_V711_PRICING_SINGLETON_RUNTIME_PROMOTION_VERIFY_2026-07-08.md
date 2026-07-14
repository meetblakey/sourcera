# Phase V711 Pricing Singleton Runtime Promotion Verify — 2026-07-08

## Scope

Promotes the Phase PT pricing singleton spec-tree gates:

- `solo_per_eval_refund_open_threshold_singleton`
- `seller_kb_bootstrap_entitlement_singleton`

## Scope Boundary

This pass promotes documentation and spec-tree detector evidence only. It does not claim product-code billing runtime, Stripe handler, refund workflow, Convex deploy-validator, or integration-test proof beyond the spec-lint contracts named here.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added two companion-doc-aware detectors under `tools/spec-lint/gates/` and registered them in `tools/spec-lint/run-all.ts`. |
| Harness input support | `tools/spec-lint/lib/gate.ts`, `run-all.ts`, and `types.ts` now support Buyer/Seller pricing companion docs for multi-file gates. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/<gate_id>/` for both pricing singleton gates. |
| §M.5 status | Two §M.5.32 rows promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | SPS §21 migration shorthand now preserves Starter's lifetime + annual re-bootstrap cadence; AE-14.9-05 no longer repeats the retired inclusive-open-count literal while documenting the corrected threshold. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-08.md` and `.csv` refreshed from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 244 blockers, down from 246. Remaining blockers: 111 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector runs | Pass, 0 findings for both pricing singleton gates |
| Pass fixtures | Pass, 0 findings for both pricing singleton gates |
| Fail fixtures | Fail with expected findings: refund threshold 13, KB Bootstrap entitlement 15 |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 244 runtime-evidence blockers |

## Artifacts

- `_audit/_tmp/v711_stamp_gate_latest.json`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-08.md`
- `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-08.csv`
- `_versions/Sourcera_Master_Spec_pre-pricing-singleton-runtime-promotion-2026-07-08.md`
- `_versions/Sourcera_Buyer_Pricing_Strategy_pre-pricing-singleton-runtime-promotion-2026-07-08.md`
- `_versions/Sourcera_Seller_Pricing_Strategy_pre-pricing-singleton-runtime-promotion-2026-07-08.md`
