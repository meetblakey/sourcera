# Phase v7.1.1 Solo Microcopy Localization Runtime Promotion Verify

**Date:** 2026-07-07
**Gate:** `solo_microcopy_template_parity`
**Pack:** M02.3
**Result:** promoted to `runtime_active`; stamp gate still blocked by remaining rows.

## Scope

Promote the spec-tree runtime evidence for Solo / Free microcopy localization parity.

## Boundary

This promotes only the Master Spec / UX spec contract and detector. Runtime locale bundle files, actual translations, next-intl wiring, Loops.so template deployment, and product UI tests remain pending unless their own rows carry evidence.

## Conflict Closed

§37.2 and Appendix J define v7.1.1 as production-localized for `supported_ui_locale`: `en-US`, `en-GB`, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `ar-SA`, `he-IL`.

§37.6 still allowed translation unavailability for v7.1.x, and the §M.5 row used stale shorthand locales. That is now closed.

## Disposition

| Surface | Result |
|---|---|
| Master Spec | Added §37.2.1 Solo / Free Microcopy Localization Manifest; §37.6 now requires active LocalizationBundle coverage before v7.1.1 stamp. |
| UX spec | §5.2.19 and §8.1.2 now consume localization keys instead of inline English for Solo pipeline and billing copy. |
| Runtime harness | Added `tools/spec-lint/gates/solo_microcopy_template_parity.ts` and registered it in `tools/spec-lint/run-all.ts`. |
| Fixtures | Added pass/fail fixtures under `tools/spec-lint/fixtures/solo_microcopy_template_parity/`. |
| §M.5 status | Promoted from `spec_binding_pending_pack_m02_3` to `runtime_active`. |
| Blocker inventory | `_audit/V711_RUNTIME_STAMP_GATE_BLOCKER_INVENTORY_2026-07-07.md` and `.csv` regenerated from the latest stamp-gate JSON. |
| Stamp-gate posture | Current stamp gate parses 420 runtime rows and fails on 299 blockers, down from 300. Remaining blockers: 166 M02.3, 102 M11.3, 26 M21.3, 5 M24.3. |

## Verification

| Check | Result |
|---|---|
| Direct detector run | PASS, 0 findings |
| Pass fixture | PASS, 0 findings |
| Fail fixture | FAIL expected, 56 findings |
| Full spec-lint batch | PASS |
| `tools/release/stamp_gate.ts --json` | FAIL expected on 299 remaining runtime-evidence blockers |
