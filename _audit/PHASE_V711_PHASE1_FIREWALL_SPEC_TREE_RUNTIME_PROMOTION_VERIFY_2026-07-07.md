# Phase V711 Phase 1 Firewall Spec-Tree Runtime Promotion Verify

**Date:** 2026-07-07
**Gates:** `enum_bound_no_inline_sentinel_admission`, `heat_map_cell_field_allowlist_drift_detect`
**Pack:** M02.3
**Result:** Promoted to `runtime_active`.

## Scope

This pass promotes the Master Spec documentation contracts and spec-tree detectors only. It does not claim product-code write-time validator, deploy-validator, serializer, or runtime mutation-handler proof.

## Findings

The two §M.5.13 rows were valid spec-tree gates but remained `spec_binding_pending_pack_m02_3` without current detector artifacts.

Verification found two source conflicts before promotion:

1. §4.4.8 `scope_ref_type` did not list the `seller_org_page` and `software_page` values already present in Appendix J `vendor_opt_out_scope_ref_type`.
2. Appendix J `page_publication_status` and its `page_status` alias still said HeatMapCell used `suppressed_by_opt_out`, contradicting §4.4.16's Vendor-Identity-Free Aggregate Invariant.

Both conflicts were fixed before promotion.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/enum_bound_no_inline_sentinel_admission.ts` and `tools/spec-lint/gates/heat_map_cell_field_allowlist_drift_detect.ts`; registered both in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/enum_bound_no_inline_sentinel_admission/` and `tools/spec-lint/fixtures/heat_map_cell_field_allowlist_drift_detect/`. |
| §M.5 status | Both rows promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §4.4.8 `scope_ref_type` now matches Appendix J; Appendix J HeatMapCell subset usage now excludes `suppressed_by_opt_out`; §M.5.13 detector paths now point to `tools/spec-lint/gates/...`. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` updated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 266 blockers, down from 268. Remaining blockers: 133 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector runs | Pass, 0 findings for both gates |
| Pass fixtures | Pass, 0 findings for both gates |
| Fail fixtures | Fail with expected findings for closed-enum drift, inline sentinel admission, incomplete §4.4.8 enum citations, HeatMapCell forbidden fields, HeatMapAggregationCard forbidden fields, stale `suppressed_by_opt_out` subset usage, and pending §M.5 status |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 266 runtime-evidence blockers |
