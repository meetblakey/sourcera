# Phase v7.2.0-REM — Phase 1.4 Marketplace Entity P1 Verification

**Date:** 2026-06-22  
**Scope:** D-1.4-003 through D-1.4-012  
**Status:** Closed as `remediated 2026-06-22` in `_audit/DEFECT_LEDGER.md`

## 1. Adjudication

D-1.4-003 through D-1.4-012 were true live P1 authoring issues against the current Master Spec. The live Marketplace Listing (§4.5.1), EOI Record (§4.5.2), and NDA Record (§4.5.3) entity contracts were below the §4 convention bar and lacked one or more of: complete field contract, `console` discriminator, scope isolation, required indexes, state-machine table, retention / DSAR / residency rule, failure modes, numbered acceptance criteria, Appendix J enum binding, and integer-cent monetary fields.

Specific live defects confirmed:

- Marketplace Listing used a local category enum instead of the §4.5.4 marketplace taxonomy.
- Marketplace Listing and EOI Record used dollar / Decimal monetary semantics instead of integer cents.
- EOI Record and NDA Record lifecycle fields lacked complete Appendix J-bound state machines.
- NDA Record contained signatory email PII without an explicit DSAR pseudonymization rule.

## 2. Remediation Summary

Master Spec changes:

- §4.5.1 Marketplace Listing now has a complete entity contract with `console='seller'`, required indexes, scope isolation, retention / DSAR / residency, state machine, failure modes, and numbered acceptance criteria.
- §4.5.1 replaces the live inline category enum with `category_taxonomy_node_id` pointing to §4.5.4 Taxonomy Node where `kind=marketplace_category`; the old enum appears only in migration notes.
- §4.5.1 uses `min_price_cents_monthly`, `max_price_cents_monthly`, and `currency_code`.
- §4.5.2 EOI Record now has a complete marketplace-scoped entity contract, required indexes, state machine, retention / DSAR / residency, failure modes, and numbered acceptance criteria.
- §4.5.2 uses `estimated_contract_value_cents` and `currency_code`.
- §4.5.3 NDA Record now has a complete marketplace-scoped contract entity contract, required indexes, state machine, retention / DSAR / residency, failure modes, and numbered acceptance criteria.
- §6.8.4.1 now assigns Marketplace Listing, EOI Record, and NDA Record DSAR behavior; NDA signatory emails use string-column pseudonymization while preserving the NDA contract row.
- §31.9 and §32.10.3 now reference `estimated_contract_value_cents` plus `currency_code`.
- Appendix I registers `eoi_contract_value_requires_integer_cents`, `marketplace_listing_category_requires_taxonomy_node`, `marketplace_listing_price_requires_integer_cents`, and `nda_invalid_state_transition`.
- Appendix J registers `marketplace_entity_console`, `marketplace_listing_status`, `eoi_record_status`, `nda_record_status`, `nda_record_type`, and `nda_record_issued_by`.
- §M.5.42 adds gates for marketplace category taxonomy FK, lifecycle enum completeness, integer-cent money fields, convention-bar completeness, and NDA signatory pseudonymization.

Tracking changes:

- `_audit/DEFECT_LEDGER.md` rows D-1.4-003 through D-1.4-012 now carry `remediated 2026-06-22`.
- `_audit/V711_BACKLOG_INDEX.md` current index-series count is 366 open P1 rows after this pass.
- `_audit/REMEDIATION_BACKLOG.md` includes the Phase 1.4 F-6 cross-reference.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` includes AE-V72REM-PH14-MARKETPLACE-ENTITIES-01 as pending.
- `_integration/RECONCILIATION.md` includes the Phase 1.4 Marketplace Entity P1 Pass closure note.

## 3. Verification Commands

**D-1.4 open-row scan**

Command:

```bash
rg -n '^\| D-1\.4-(?:00[3-9]|01[0-2]) \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md
```

Result: no matches.

**Current P1 open-row count**

Command:

```bash
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | wc -l
```

Result: `366`.

**Current P1 unique-ID count**

Command:

```bash
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | sed -E 's/^[0-9]+:\| (D-[^ |]+).*/\1/' | sort -u | wc -l
```

Result: `365`.

**Duplicate open-ID scan**

Command:

```bash
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | sed -E 's/^[0-9]+:\| (D-[^ |]+).*/\1/' | sort | uniq -d
```

Result: `D-CONS-006`. This is a pre-existing ledger-hygiene residual: one D-CONS row is the deduplication-program row and the other is the wallet-state enum drift row. It is not part of the Phase 1.4 marketplace entity closure.

**Legacy marketplace field scan**

Command:

```bash
rg -n 'min_price_usd_monthly|max_price_usd_monthly|estimated_contract_value_usd|### Marketplace Listing Statuses|### Marketplace EOI Statuses|### NDA Statuses|`category` \| Enum \|' Sourcera_Master_Spec.md
```

Result: no live Marketplace Listing price fields, no live Marketplace EOI dollar field, and no retired Appendix J marketplace status headings. Remaining `estimated_contract_value_usd` hits are explicit legacy-migration notes in §4.5.2. Remaining `` `category` | Enum |`` hits are unrelated WorkspaceTemplate / CapabilityDeclaration / KBDocument category fields.

**Tracking-surface scan**

Command:

```bash
rg -n 'AE-V72REM-PH14-MARKETPLACE-ENTITIES-01|PHASE_V72REM_PHASE_1_4_MARKETPLACE_ENTITIES_VERIFY|D-1\.4-003 through D-1\.4-012' _audit/V711_BACKLOG_INDEX.md _audit/REMEDIATION_BACKLOG.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
```

Result: references present in V711 backlog index, remediation backlog, AE ledger, and reconciliation log.

**Full spec lint**

Command:

```bash
cd tools/spec-lint && npm run all -- --no-emit
```

Result: blocking gates pass. Advisory-only failures remain:

- `solo_tier_numeric_single_source`: 52
- `retention_singleton_section_40_2_canonical`: 122
- `section_anchor_slug_no_colon`: 13

The lint runner reported `blocking gates worst exit code: 0`.

## 4. Backup Artifacts

- `legacy-import:_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-1-4-marketplace-entities.md` — md5 `49d0af00cc52508cb4e918b2173e9280`
- `legacy-import:_versions/DEFECT_LEDGER_pre-2026-06-22-phase-1-4-marketplace-entities.md` — md5 `5ae2bf306d46b92e91797195904dbc38`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-1-4-marketplace-entities.md` — md5 `2986b3dd4d6ee65698cd4251e0aea859`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-2026-06-22-phase-1-4-marketplace-entities.md` — md5 `5a196974d893be3469d556d77b62504a`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-1-4-marketplace-entities.md` — md5 `d569f0896fb5c39bf235b291557bc93e`
- `legacy-import:_versions/RECONCILIATION_pre-2026-06-22-phase-1-4-marketplace-entities.md` — md5 `ad7bae5089c5ef7a2ae3fc09633eced2`

## 5. Residuals

- D-CONS-006 is duplicated as an open P1 ID in `_audit/DEFECT_LEDGER.md`; this is ledger-count hygiene, not a Phase 1.4 product-spec residual.
- AE-V72REM-PH14-MARKETPLACE-ENTITIES-01 remains pending ratification before v7.1.1 stamp under the current AE policy.
- Full spec lint has advisory-only findings unrelated to Phase 1.4 marketplace entities.
