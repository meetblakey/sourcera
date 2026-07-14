# Phase V711 §47.4 Residency Current APAC/Custom Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `section_47_4_residency_current_apac_custom`
**Pack:** M02.3
**Result:** Promoted to `runtime_active`.

## Scope

This pass promotes the Master Spec documentation contract and detector only. It does not claim deployed storage, DR, observability-routing, compliance-certification, or sovereign-cloud provider runtime proof.

## Finding

§47.4 already treated `apac` and `custom` as current residency values and left ISO 27001, HIPAA BAA, CCPA certification, and expanded sovereign-provider catalog work in Phase 2. The missing piece was runtime evidence: the §M.5 row remained `spec_binding_pending_pack_m02_3` with no detector or fixtures.

## Disposition

| Surface | Result |
| :---- | :---- |
| Runtime harness | Added `tools/spec-lint/gates/section_47_4_residency_current_apac_custom.ts` and registered it in `tools/spec-lint/run-all.ts` `GATES_RUNTIME_ACTIVE`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/section_47_4_residency_current_apac_custom/`. |
| §M.5 status | Row promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Source fixes | §1.6.1 acceptance criteria now includes the §47.4 residency-current gate in the residency gate coverage list. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` updated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 268 blockers, down from 269. Remaining blockers: 135 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
| :---- | :---- |
| Direct detector run | Pass, 0 findings |
| Pass fixture | Pass, 0 findings |
| Fail fixture | Fails with expected findings for missing current four-value residency line, stale APAC/custom future-state language, missing current-contract tokens, missing sovereign-provider Phase 2 token, and pending §M.5 status |
| Typecheck | Pass |
| Full spec-lint batch | Pass, 0 blocking findings |
| `tools/release/stamp_gate.ts --json` | Fails overall on the remaining 268 runtime-evidence blockers |
