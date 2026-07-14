# Phase CONS Pricing Core P1 Verification

**Date:** 2026-06-22
**Scope:** D-CONS-003, D-CONS-004, D-CONS-005, D-CONS-006 (product/pricing row only), D-CONS-007, D-CONS-008, D-CONS-009, D-CONS-010, D-CONS-011, D-CONS-012, D-CONS-013.

## Sources Read

- `Sourcera_Master_Spec.md`: §4.8.1, §4.8.2, §4.8.3, §4.8.5, §4.8.6, §4.8.7, §4.8.14, §21.4, §22.10, §31.8.4, §31.8.12, §32.8, §34, §44.6, §48.8, §49.1, Appendix C, Appendix F, Appendix G, Appendix I, Appendix J, Appendix K, Appendix M.
- `_audit/DEFECT_LEDGER.md`: Phase CONS rows and adjacent ledger-hygiene D-CONS rows.
- `_audit/V711_BACKLOG_INDEX.md`, `_audit/REMEDIATION_BACKLOG.md`, `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, `_integration/RECONCILIATION.md`.

## Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-phase-cons-pricing-core-p1-2026-06-22.md` md5 `c1fabef4854b78a4b954e611d01eb936`
- `legacy-import:_versions/DEFECT_LEDGER_pre-phase-cons-pricing-core-p1-2026-06-22.md` md5 `f240534656bbf26e224f6a82f2b1fd5d`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-phase-cons-pricing-core-p1-2026-06-22.md` md5 `5fda1f78ed82d42e02f1301dbcc04ef3`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-phase-cons-pricing-core-p1-2026-06-22.md` md5 `62216d8f67771d5fc89de70a7f1a7f60`
- `legacy-import:_versions/RECONCILIATION_pre-phase-cons-pricing-core-p1-2026-06-22.md` md5 `7696e4a43b666e9f8574d828a9c6439b`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-cons-pricing-core-p1-2026-06-22.md` md5 `15f4a8b9bcb098a55bee057c13c6eeec`

## Classification

| Defect | Classification | Disposition |
|---|---|---|
| D-CONS-003 | True issue | Remediated by replacing hard-coded value/cost pricing formulas with `CapabilityRegistryEntry.value_multiplier` / `cost_multiplier` references and adding §M.5.46 guard. |
| D-CONS-004 | True issue | Remediated by aligning cost-base recalc cadence to 03:00 UTC across the current Master Spec and adding §M.5.46 guard. |
| D-CONS-005 | True issue | Remediated by binding recalc inputs and `CostBaseRecalculationLog` sample windows to the prior 30-day rolling window. |
| D-CONS-006 | True issue | Remediated for the product/pricing row by canonicalizing wallet-state enum names and keeping the ledger-hygiene D-CONS-006 row open. |
| D-CONS-007 | True issue | Remediated by registering canonical margin-floor events and Appendix C/F/G bindings. |
| D-CONS-008 | True issue | Remediated by adding `contest_record_window_guard` and `contest_record_direct_write_forbidden`. |
| D-CONS-009 | True issue | Remediated by defining FreeAllowanceCounter plan-entitlement partition fields and guard behavior. |
| D-CONS-010 | True issue | Remediated by authoring `SoloEnvelopeCounter` and AE-V72REM-PHCONS-PRICING-CORE-P1-01. |
| D-CONS-011 | Stale/status-sync with cleanup | Current §32.8 endpoint coverage already exists; stale pending endpoint wording was removed and a regression gate was added. |
| D-CONS-012 | Stale/status-sync | Current §31.8 / Appendix C / Appendix G contest webhook coverage already exists; no new event family was authored. |
| D-CONS-013 | True issue | Remediated by adding daily/weekly auto-topup cap fields, API fields, webhook payloads, and errors. |

## Artifacts Updated

- `Sourcera_Master_Spec.md`
- `_audit/DEFECT_LEDGER.md`
- `_audit/V711_BACKLOG_INDEX.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`
- `_integration/RECONCILIATION.md`

## Count Evidence

Command:

```sh
ruby -e 'rows=[]; ids=[]; File.foreach("_audit/DEFECT_LEDGER.md") { |l| next unless l =~ /^\| (D-[^|]+) \| P1 \| [^|]+ \|.*\| open \|/; ids << $1; rows << l }; counts=Hash.new(0); ids.each { |id| counts[id]+=1 }; dupes=counts.select { |_,v| v>1 }; puts "open_p1_rows=#{rows.length}"; puts "open_p1_unique_ids=#{ids.uniq.length}"; puts "duplicate_open_p1_ids=#{dupes.keys.join(",")}"'
```

Result:

```text
open_p1_rows=192
open_p1_unique_ids=192
duplicate_open_p1_ids=
```

## Lint Evidence

Command:

```sh
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

Result:

```text
blocking gates worst exit code: 0 (advisory findings are non-blocking)
```

Advisory-only findings remain pre-existing / out of scope for this batch:

- `solo_tier_numeric_single_source`: 52 advisory findings.
- `retention_singleton_section_40_2_canonical`: 115 advisory findings.
- `section_anchor_slug_no_colon`: 13 advisory findings.

## Residuals

- D-CONS-001 and D-CONS-002 remain Phase CONS halt-rule blockers.
- Ledger-hygiene D-CONS-006 remains open.
- D-CONS-014 through D-CONS-019 remain outside this P1 pricing-core pass unless separately remediated.
