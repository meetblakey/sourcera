# v7.1.1 Source-Governance Enum and Decision-Frame Verification

**Date:** 2026-07-09  
**Scope:** D-AJ-018, D-5.3-017, D-11.4-003, D-KB18-006

## Resolution

- Appendix J now records final-version-shipped markers for the legacy Target Account status group, retired `sourcera_uk_ltd`, and both retired growth-loop identifiers.
- Runtime-active gate `appendix_j_deprecation_marker_coverage` is registered at §M.5.74 and in `tools/spec-lint/run-all.ts`; its live and positive fixtures pass and its negative fixture fails with four findings.
- §22.1.1 / §22.1.2 now own the Seller KB non-goals and decision principles. The retired KB Engineering Spec is provenance only.
- D-5.3-017 is a stale-open status: current `_integration/Audit_Prompts.md` and `CLAUDE.md` contain no 12-month KB-preservation instruction; §34.19.3 / §22.18.5.3 remain the 90-day authority.
- D-11.4-003 is a stale-open status: §M.1.2 already defines companion-document anchors and current-§22 routing for retired-KB concepts.
- `AGENTS.md`, `CLAUDE.md`, and `_integration/Audit_Prompts.md` now route Verification to §4.4.21 / §27.11.3 / §34.1.2, label §27.10 correctly as Vendor Opt-Out, and treat former Phase 14.19 counts as historical rather than live backlog truth.
- No new product behavior or Authored Extension was introduced.

## Result

| Measure | Before | After |
|---|---:|---:|
| Open P0 | 0 | 0 |
| Open P1 | 0 | 0 |
| Open P2 | 510 | 509 |
| Open P3 | 176 | 173 |
| Runtime rows | 426 | 427 |
| Runtime-active rows | 280 | 281 |
| Stamp blockers | 144 | 144 |

The new row is fully runtime-active spec-tree evidence. Pack-owned product blockers remain unchanged: M11.3 102, M21.3 26, M02.3 11, M24.3 5.

## Verification commands

```zsh
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_j_deprecation_marker_coverage.ts --spec Sourcera_Master_Spec.md
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_j_deprecation_marker_coverage.ts --spec tools/spec-lint/fixtures/appendix_j_deprecation_marker_coverage/pass.md
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/appendix_j_deprecation_marker_coverage.ts --spec tools/spec-lint/fixtures/appendix_j_deprecation_marker_coverage/fail.md
rg -n '§27\.10 Verification Tier|§27\.10 \(Verification Tiers\)|14\.12\.1.*§27\.10' AGENTS.md CLAUDE.md _integration/Audit_Prompts.md Sourcera_Master_Spec.md Sourcera_Seller_Pricing_Strategy.md UX_Design_of_Sourcera.md
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

**Observed:** live gate PASS; positive fixture PASS; negative fixture FAIL with four expected findings; current-source routing scan returns no matches; typecheck PASS; full spec-lint PASS; exact-status scan 0 / 0 / 509 / 173; stamp gate FAIL only on the unchanged 144 runtime-evidence blockers.
