# v7.1.1 Phase 2.2 Typed Marketplace Dimensions — Verification

**Date:** 2026-07-11  
**Scope:** D-2.2-060 / D-2.2-061; typed region and industry dimensions across HeatMapCell and SellerSignal.

## Conflict and resolution

The prior Master Spec stored country/macro regions and NAICS/taxonomy values in mixed strings. `US` / `us` was not safely classifiable. §4.4.16 is canonical: typed `kind` + `id` pairs replace those strings, while ambiguous legacy values quarantine rather than infer. Appendix J controls the pair discriminators and macro values. §27.9.15.6's real-time-to-email fallback contradicted Appendix J; Appendix J's no-fallback rule now controls.

## Coverage completed

- §4.4.16 HeatMapCell fields, unique index, migration, quarantine, concurrency, audit, retention/residency references, and acceptance criteria.
- §4.4.18 SellerSignal fields, index, distinctiveness tuple, and typed cohort generation.
- §27.9 preference payloads, API filters, DSAR recompute tuple, accessibility/mobile/retry handling, and acceptance criteria.
- §6.8.4.4, Appendix C, Appendix G, M13 SEO/Schema.org, Appendix I, Appendix J, Appendix K, and Appendix M gate text.
- `heat_map_cell_field_allowlist_drift_detect` v1.1.0 now rejects legacy fields and requires the cross-surface typed contract; positive and negative fixtures cover recurrence.

## Evidence

| Check | Result |
| :---- | :---- |
| Live typed-dimension gate | PASS — 0 findings |
| Positive fixture | PASS — 0 findings |
| Negative fixture | FAIL as expected — 22 findings |
| TypeScript typecheck | PASS |
| Full spec-lint | PASS — 0 blocking findings |

Commands:

```sh
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/heat_map_cell_field_allowlist_drift_detect.ts --spec Sourcera_Master_Spec.md
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/heat_map_cell_field_allowlist_drift_detect.ts --fixture tools/spec-lint/fixtures/heat_map_cell_field_allowlist_drift_detect/pass.md
tools/spec-lint/node_modules/.bin/tsx tools/spec-lint/gates/heat_map_cell_field_allowlist_drift_detect.ts --fixture tools/spec-lint/fixtures/heat_map_cell_field_allowlist_drift_detect/fail.md
npm --prefix tools/spec-lint run typecheck
npm --prefix tools/spec-lint run all -- --spec ../../Sourcera_Master_Spec.md --ux ../../UX_Design_of_Sourcera.md --reconciliation ../../_integration/RECONCILIATION.md --ae-ledger ../../_integration/AUTHORED_EXTENSIONS_LEDGER.md --decisions ../../_integration/Decisions.md --no-emit
```

## Status

D-2.2-060 and D-2.2-061 are remediated as documentation defects. AE-V711-PH22-TYPED-MARKETPLACE-DIMENSIONS-01 is **pending human sign-off**. Product migration, locking, AuditEvent writes, serializers, API validation, and runtime tests are not present in this workspace; this report does not claim them as implemented.
