# Phase v7.1.1 DSAR Cascade Class Coverage Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `dsar_cascade_class_coverage_completeness`
**Scope:** M02.3 spec-tree runtime evidence for §6.8.4.3 DSAR cascade class coverage.

## Scope Boundary

This pass promotes the Master Spec §4 / §6.8.4.3 static-analysis contract only. It does not claim DSAR cascade-worker product runtime, Convex schema idempotency-marker parity, body-redaction runtime execution, aggregate recompute runtime, or product-code serializer evidence.

## Conflict / Gap Closed

The live detector found real registry gaps before promotion. §6.8.4.3 lacked cascade-class rows for 59 §4 entities carrying User-attribution fields, including `UserUIPreference`, `ApiToken`, `PolicyDocument`, seller marketplace public pages, NDA version/signature records, marketplace match artifacts, and agent/MCP configuration rows. Three existing rows (`Taxonomy Node`, `CapabilityRegistryEntry`, `SellerOutcomeSignalConfig`) claimed `n/a` despite actor fields. A separate row-number conflict also existed: §6.8.4.4 used retained-row class `#16` for marketplace aggregates while §6.8.5 row `#16` was already email suppression / unsubscribe evidence.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/dsar_cascade_class_coverage_completeness.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/dsar_cascade_class_coverage_completeness/`. |
| §M.5 status | The row is promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | Added explicit §6.8.4.3 rows / treatments for every parser-detected §4 User-attribution entity; moved marketplace aggregates to §6.8.5 row `17`; updated Appendix J and Appendix C aggregate-recompute payload references. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 286 blockers, down from 287. Remaining blockers: 153 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with 1 expected finding for `n/a` treatment on a User-attribution entity |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 286 runtime-evidence blockers |

## Remaining Boundaries

- `dsar_cascade_per_row_idempotency_marker_completeness` remains pending and owns schema / idempotency-marker parity.
- `dsar_cascade_aggregate_recompute_*`, bridge-redaction runtime, partial-failure runtime, statutory-ceiling runtime, and pseudonym-epoch runtime gates remain M11.3 / M21.3 product-runtime evidence.
- Product-code serializer/API gates remain pending unless product-code evidence exists; no spec-side promotion was claimed for those rows.
