# Phase V72REM Phase 2.2 FeaturedPlacement FTC Observation Verify

**Date:** 2026-06-22  
**Scope:** D-2.2-043 FeaturedPlacement FTC runtime disclosure observation gap.  
**Verdict:** Remediated.

## 1. Adjudication

D-2.2-043 was a true live P1 issue. Current Section 4.4.20 had `ftc_disclosure_label` and `ftc_tooltip_copy_markdown`, and AC #2 required DOM contract tests, but there was no runtime observation timestamp and no per-render telemetry event proving the disclosure actually rendered to a buyer-visible surface.

## 2. Backups

| File | Backup | md5 |
|---|---|---|
| `Sourcera_Master_Spec.md` | `_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-2-2-featured-placement-ftc-observation.md` | `b488525cb39fcf0c7667ff568bce1c1f` |
| `_audit/DEFECT_LEDGER.md` | `_versions/DEFECT_LEDGER_pre-2026-06-22-phase-2-2-featured-placement-ftc-observation.md` | `d942b3c39ad7dc5a866e3a26673fa1ad` |
| `_audit/V711_BACKLOG_INDEX.md` | `_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-2-2-featured-placement-ftc-observation.md` | `15a49eaae7d490a6a3df46bd95168804` |
| `_audit/REMEDIATION_BACKLOG.md` | `_versions/REMEDIATION_BACKLOG_pre-2026-06-22-phase-2-2-featured-placement-ftc-observation.md` | `6f736de92c8de3455d5e6315d4495dfc` |
| `_audit/AUTHORITATIVE_SOURCE_MAP.md` | `_versions/AUTHORITATIVE_SOURCE_MAP_pre-2026-06-22-phase-2-2-featured-placement-ftc-observation.md` | `6befe26db9fdd8a4956dff6030f93b2e` |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-2-2-featured-placement-ftc-observation.md` | `993d5d25d84b5bfa3d0ec5e9c8f7aeae` |
| `_integration/RECONCILIATION.md` | `_versions/RECONCILIATION_pre-2026-06-22-phase-2-2-featured-placement-ftc-observation.md` | `6e4e90f77c0805b93c1524b4e6010083` |

## 3. Change Summary

- Section 4.4.20 now adds `ftc_disclosure_first_observed_render_at` and `ftc_disclosure_last_observed_render_at`.
- Section 4.4.20 FTC Disclosure Compliance now states that DOM tests are insufficient for runtime proof and binds per-render proof to the Usage Event ledger and Appendix G.
- Section 44.1 now owns `FeaturedPlacement FTC disclosure observation latency`.
- New Section 44.7 FTC Native-Ad Compliance Observation defines the server-side render-compositor event contract, required properties, failure handling, stale-observation sweep, and ACs.
- Appendix G registers `featured_placement_ftc_disclosure_rendered` as a PostHog-only compliance observation event.
- `_audit/AUTHORITATIVE_SOURCE_MAP.md` now registers `FEATURED-FTC-OBS-LATENCY`.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` now registers `AE-V72REM-PH22-FEATURED-PLACEMENT-FTC-OBS-01`.
- `_audit/DEFECT_LEDGER.md` marks D-2.2-043 `remediated 2026-06-22`.

## 4. Targeted Verification

Commands run:

```sh
rg -n '^\\| D-2\\.2-043 \\| P1 \\|[^\\n]*\\| open \\|' _audit/DEFECT_LEDGER.md
rg -n '^\\| D-[^|]+ \\| P1 \\|[^\\n]*\\| open \\|' _audit/DEFECT_LEDGER.md | wc -l
rg -n '^\\| D-[^|]+ \\| P1 \\|[^\\n]*\\| open \\|' _audit/DEFECT_LEDGER.md | sed -E 's/^\\| (D-[^ |]+).*/\\1/' | sort -u | wc -l
rg -n 'ftc_disclosure_first_observed_render_at|ftc_disclosure_last_observed_render_at|featured_placement_ftc_disclosure_rendered|FeaturedPlacement FTC disclosure observation latency|FTC Native-Ad Compliance Observation|FEATURED-FTC-OBS-LATENCY|AE-V72REM-PH22-FEATURED-PLACEMENT-FTC-OBS-01|D-2\\.2-043' Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _audit/V711_BACKLOG_INDEX.md _audit/REMEDIATION_BACKLOG.md _audit/AUTHORITATIVE_SOURCE_MAP.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
```

Results:

- D-2.2-043 open-row scan returned no match (`rg` exit 1, expected for no match).
- Open P1 count is 384 rows / 384 unique IDs.
- New fields, source row, Section 44.7 contract, Appendix G event, source-map row, AE ledger row, and reconciliation note all resolve.
- Historical notes that previously said D-2.2-043 was open were time-scoped to point at the later closure.
- Next open P1 row is D-2.2-044.

## 5. Full Gate

Command:

```sh
cd tools/spec-lint && npm run all -- --no-emit
```

Result: exit 0. All blocking gates passed.

Advisory findings only:

- `solo_tier_numeric_single_source`: 52
- `retention_singleton_section_40_2_canonical`: 123
- `section_anchor_slug_no_colon`: 13

## 6. Residuals

D-2.2-044 through D-2.2-047 remain open in the adjacent Phase 2.2 data-model / webhook cluster and require separate remediation.
