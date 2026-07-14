# Phase v7.1.1 Appendix M Conformance Posture Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `appendix_m_conformance_posture_completeness`
**Pack:** M02.3
**Result:** promoted to `runtime_active`; stamp gate still blocked by remaining rows.

## Scope

Promote the spec-tree runtime evidence for Appendix M.1 accessibility/i18n conformance posture.

## Boundary

This promotes the Master Spec row-level documentation contract and detector only. Runtime axe scans, UI route tests, responsive fixtures, locale rendering, RTL hooks, and external WCAG audit artifacts remain pending unless their own rows carry evidence.

## Gap Closed

§37.1 required every UI surface to carry a WCAG conformance posture binding, but Appendix M.1 had broad row-level drift. 384 customer-visible or Ops-visible rows now carry `Conformance posture: inherits_§37.1.` True internal-only rows remain exempt.

## Disposition

| Surface | Result |
|---|---|
| Master Spec | Appendix M.1 visible rows now carry explicit conformance posture notes; §M.5 row promoted to `runtime_active`. |
| Runtime harness | Added `tools/spec-lint/gates/appendix_m_conformance_posture_completeness.ts` and registered it in `tools/spec-lint/run-all.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/appendix_m_conformance_posture_completeness/`. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 298 blockers, down from 299. Remaining blockers: 165 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
|---|---|
| Direct detector run | PASS, 0 findings |
| Pass fixture | PASS, 0 findings |
| Fail fixture | FAIL expected, 10 findings |
| Full spec-lint batch | PASS |
| Appendix M.1 posture scan | 517 rows; 389 visible; 0 missing posture |
| `tools/release/stamp_gate.ts --json` | FAIL expected on 298 remaining runtime-evidence blockers |
