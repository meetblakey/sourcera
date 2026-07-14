# Phase V7.1.1 AP Enum Semantic Map Verification — 2026-07-12

## Scope

- Defect: `D-5.7-021`.
- Authority conflict: §48.8.7 ban semantics versus misleading legacy Appendix J enum-key suffixes.

## Resolution

- §48.8.7 owns the AP-number ↔ persisted-key map and canonical ban semantics.
- Appendix J keys remain frozen opaque storage and telemetry identifiers.
- §49.1.9 consumes the map and no longer carries an unresolved build blocker.
- Appendix I AP1–AP6 errors now describe the §48.8.7 bans.
- Unmapped or mismatched pairs fail closed with HTTP 422 `onboarding_anti_pattern_kind_unmapped`.
- No runtime row was promoted.

## Verification

Run from `tools/spec-lint`:

```bash
npm run typecheck
npm run all
```

Then run the exact-status scanner, stamp gate, and blocker-inventory generator from their live repository paths.
