# v7.1.1 Phase 4.6 TCO Residual P2/P3 Closure Verification

**Date:** 2026-07-09  
**Scope:** D-4.6-017, D-4.6-021, D-4.6-023, D-4.6-024, D-4.6-025, D-4.6-026, D-4.6-027, D-4.6-029

## Result

All eight rows are remediated. Exact-status posture moves from 497 to 492 open P2 and from 171 to 168 open P3. P0, P1, and blocked P1 remain zero.

The Master Spec now carries:

- TCOModel and TCOConfiguration optimistic-lock versions, a conflict state table, and **Refresh and merge** recovery.
- A single §44.1 TCO recalculation latency target and bounded workload envelope.
- Mobile, seller-projection, accessibility, empty/loading/stale/error/retry, and observability contracts.
- A current-version `tco_appendix` preflight before export acceptance and Buyer Solo charge attempt, while preserving §34.2.5 / §10.13.7 billing authority.
- Nine Appendix K TCO terms, stable `and` anchors, the corrected Section 15 label, and enum-neutral Appendix M surface rows.
- Runtime-active recurrence gate `tco_residual_contract_completeness` in §M.5.78.

## Source conflict resolved

The prior §38 mobile row omitted `percentage_of_license` from the desktop-only complex structures even though Appendix J and §15 define six Pricing Structures. §15.6.3 now classifies it desktop-only because it requires linked-base validation; §38.8.2 mirrors the complete set.

The filed Selection Report coupling could have duplicated or changed Buyer Solo charge semantics. It does not: §34.2.5 / §10.13.7 remain controlling. TCO preflight only determines whether an export request with `tco_appendix=true` is valid enough to accept.

## Verification

```zsh
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/tco_residual_contract_completeness.ts --spec Sourcera_Master_Spec.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/tco_residual_contract_completeness.ts --fixture tools/spec-lint/fixtures/tco_residual_contract_completeness/pass.md --no-emit
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/tco_residual_contract_completeness.ts --fixture tools/spec-lint/fixtures/tco_residual_contract_completeness/fail.md --no-emit
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --no-emit --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md
tools/spec-lint/node_modules/.bin/tsx tools/release/stamp_gate.ts --json
```

**Observed:** live gate PASS; positive fixture PASS; negative fixture FAIL with expected findings; typecheck PASS; full spec-lint PASS. Stamp gate parses 431 runtime rows, 285 `runtime_active`, and still fails only on 144 product/runtime evidence blockers: 102 M11.3, 26 M21.3, 11 M02.3, and 5 M24.3.

**Authored Extension:** approved AE-V711-PH46-TCO-AC-P2-01 addendum.  
**Backup:** `legacy-import:_versions/Sourcera_Master_Spec.pre-phase46-tco-residual-closure-2026-07-09.md`.
