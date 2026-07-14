# Phase v7.2.0-REM Phase 2.2 Marketplace Ledger Rebind Verification

**Date:** 2026-06-22  
**Defect closed:** D-2.2-044  
**Scope:** PromotedListing marketplace-discovery charge ledger rebinding and source-entity reconciliation contract.

## 1. Adjudication

D-2.2-044 was a true live P1 buildability issue, but the filed remediation recommendation to author a separate `MarketplaceDiscoveryLedgerEntry` table was superseded by existing Master Spec authority. Current §4.8.12 already defines `MarketplaceDiscoveryRevenueRecord` as the seller-Org-scoped, accounting-isolated, non-AI revenue line for Marketplace Discovery.

The live defect was narrower and more precise:

1. §4.4.19 still referenced the undefined `MarketplaceDiscoveryLedgerEntry` placeholder.
2. §34.20.13 AC #63 still said `MarketplaceDiscoveryRevenueRecord` needed to be added later, even though §4.8.12 already existed.
3. §4.8.12 lacked a source-entity FK pair, so PromotedListing `spend_to_date_cents` could not be reconciled unambiguously to revenue rows by listing.

## 2. Changes Verified

- §4.4.19 `clearing_price_cents`, `spend_to_date_cents`, Auction Mechanics step 5, and AC #6 now bind PromotedListing charges to `MarketplaceDiscoveryRevenueRecord` (§4.8.12).
- §4.8.12 now carries `source_entity_type` and `source_entity_id`.
- §4.8.12 now has a source-entity reconciliation index on `(seller_org_id, source_entity_type, source_entity_id, billing_period_start)`.
- §4.8.12 Source-entity scope, state-machine create condition, failure mode #16, and AC #19 make PromotedListing source linkage mandatory.
- Appendix I registers `marketplace_discovery_source_entity_required` and `marketplace_discovery_source_entity_mismatch`.
- Appendix J registers `marketplace_discovery_source_entity_type`.
- Appendix K retires `MarketplaceDiscoveryLedgerEntry` as an alias to §4.8.12.
- §34.20.13 AC #63 states no separate `MarketplaceDiscoveryLedgerEntry` entity exists in the live spec.
- D-2.2-044 status moved to `remediated 2026-06-22`.
- `_audit/V711_BACKLOG_INDEX.md` parsed P1-open count moved from 384 to 383.
- AE row added: `AE-V72REM-PH22-MARKETPLACE-LEDGER-REBIND-01`.

## 3. Backups

- `_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-2-2-marketplace-ledger-rebind.md` md5 `af465f05b791cf92284de088c53ac057`
- `_versions/DEFECT_LEDGER_pre-2026-06-22-phase-2-2-marketplace-ledger-rebind.md` md5 `6916fe08aa3877cfbb07da5a65b9706c`
- `_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-2-2-marketplace-ledger-rebind.md` md5 `10a55ae9ad8eb258b870c38bcda9bbc3`
- `_versions/REMEDIATION_BACKLOG_pre-2026-06-22-phase-2-2-marketplace-ledger-rebind.md` md5 `5d74c9a3ce5541b1a10bca6a4a9f77af`
- `_versions/AUTHORITATIVE_SOURCE_MAP_pre-2026-06-22-phase-2-2-marketplace-ledger-rebind.md` md5 `8817a0e3f59abbe647e1028bce824d73`
- `_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-2-2-marketplace-ledger-rebind.md` md5 `d0ca659b3f7a889828709353f89655c5`
- `_versions/RECONCILIATION_pre-2026-06-22-phase-2-2-marketplace-ledger-rebind.md` md5 `38c6efbb92cdc62c3a1aa13509fe2776`

## 4. Targeted Verification

Command:

```sh
rg -n '^\| D-2\.2-044 \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md
```

Result: no matches (`rg` exit 1 expected).

Command:

```sh
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | wc -l
```

Result: `383`.

Command:

```sh
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | sed -E 's/^\| (D-[^ |]+).*/\1/' | sort -u | wc -l
```

Result: `383`.

Command:

```sh
rg -n 'D-2\.2-044 through D-2\.2-047|D-2\.2-044 remain open|leaving D-2\.2-044|D-2\.2-044, D-2\.2-045' _audit/REMEDIATION_BACKLOG.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
```

Result: no matches (`rg` exit 1 expected).

Command:

```sh
rg -n 'MarketplaceDiscoveryLedgerEntry' Sourcera_Master_Spec.md
```

Result: one live-body match, Appendix K retired alias only.

## 5. Full Gate

Command:

```sh
cd tools/spec-lint && npm run all -- --no-emit
```

Result: exit 0. All blocking gates passed.

Advisory findings remain non-blocking and pre-existing in class:

- `solo_tier_numeric_single_source`: 52
- `retention_singleton_section_40_2_canonical`: 123
- `section_anchor_slug_no_colon`: 13

## 6. Final Checksums

- `Sourcera_Master_Spec.md` md5 `bbcae3d29f6c50cccbf888f5095a0501`
- `_audit/DEFECT_LEDGER.md` md5 `eead96be9b10769d80cdce6c9233c664`
- `_audit/V711_BACKLOG_INDEX.md` md5 `3f93b2566e78a23f0c3879521ae6ef90`
- `_audit/REMEDIATION_BACKLOG.md` md5 `62dccdcbc20c270882cd38ec03d63856`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` md5 `dfb50e4576887215cd937137ff654d61`
- `_integration/RECONCILIATION.md` md5 `3dd859ca897304642215a8dac2263b7b`

## 7. Residuals

D-2.2-045, D-2.2-046, and D-2.2-047 remain open as adjacent Phase 2.2 auction-run and webhook catalog clusters. This pass does not claim those rows.
