# Phase v7.2.0-REM Phase 2.2 PromotedListingAuctionRun Verification

**Date:** 2026-06-22  
**Defect closed:** D-2.2-045  
**Scope:** PromotedListingAuctionRun entity authoring and §4.4.19 auction-run log completeness.

## 1. Adjudication

D-2.2-045 was a true live P1 data-model/buildability issue. §4.4.19 referenced `PromotedListingAuctionRun` as the append-only auction-decision log and described auction-run DLQ overflow behavior, but the entity had no field table, indexes, state machine, retention/DSAR rule, failure modes, or acceptance criteria. That made auction fairness reconstruction and primary-write-failure recovery unbuildable.

## 2. Changes Verified

- Authored §4.4.19.1 `PromotedListingAuctionRun`.
- Added full field table with `auction_run_id`, category/surface, metric, buyer hash, eligible listings, winner/runner-up fields, bid/clearing fields, decision hash, write status, incident-queue reference, rollup timestamp, residency, and audit fields.
- Added indexes for replay, category/surface fairness review, per-listing reconstruction, seller aggregate reporting, incident reconciliation, and exactly-once decision hashing.
- Added Scope Isolation, Retention & DSAR, state machine, failure modes, and 8 acceptance criteria.
- Rebound §4.4.19 Auction Mechanics step 8, Retention, Failure Modes #2 / #8, and AC #11 to §4.4.19.1.
- Registered Appendix J enum sets:
  - `promoted_listing_auction_run_console_scope`
  - `promoted_listing_auction_metric`
  - `promoted_listing_auction_outcome`
  - `promoted_listing_auction_suppression_reason`
  - `promoted_listing_auction_run_write_status`
- Updated Appendix K `PromotedListingAuctionRun` glossary entry to point to §4.4.19.1.
- Updated §40.2 PromotedListing row to cite §4.4.19.1.
- D-2.2-045 status moved to `remediated 2026-06-22`.
- `_audit/V711_BACKLOG_INDEX.md` parsed P1-open count moved from 383 to 382.
- AE row added: `AE-V72REM-PH22-PROMOTED-LISTING-AUCTION-RUN-01`.

## 3. Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-2-2-promoted-listing-auction-run.md` md5 `bbcae3d29f6c50cccbf888f5095a0501`
- `legacy-import:_versions/DEFECT_LEDGER_pre-2026-06-22-phase-2-2-promoted-listing-auction-run.md` md5 `eead96be9b10769d80cdce6c9233c664`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-2-2-promoted-listing-auction-run.md` md5 `3f93b2566e78a23f0c3879521ae6ef90`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-2026-06-22-phase-2-2-promoted-listing-auction-run.md` md5 `62dccdcbc20c270882cd38ec03d63856`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-2-2-promoted-listing-auction-run.md` md5 `dfb50e4576887215cd937137ff654d61`
- `legacy-import:_versions/RECONCILIATION_pre-2026-06-22-phase-2-2-promoted-listing-auction-run.md` md5 `3dd859ca897304642215a8dac2263b7b`

## 4. Targeted Verification

Command:

```sh
rg -n '^\| D-2\.2-045 \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md
```

Result: no matches (`rg` exit 1 expected).

Command:

```sh
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | wc -l
```

Result: `382`.

Command:

```sh
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | sed -E 's/^\| (D-[^ |]+).*/\1/' | sort -u | wc -l
```

Result: `382`.

Command:

```sh
rg -n 'D-2\.2-045 through D-2\.2-047|D-2\.2-045 remain open|leaving D-2\.2-045|D-2\.2-045, D-2\.2-046' _audit/REMEDIATION_BACKLOG.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
```

Result: no matches (`rg` exit 1 expected).

Command:

```sh
rg -n 'PromotedListingAuctionRun \(Authored Extension\)|PromotedListingAuctionRun.*flagged|PromotedListingAuctionRun.*not yet|PromotedListingAuctionRun \(Platform-Internal|promoted_listing_auction_run_write_status|promoted_listing_auction_suppression_reason' Sourcera_Master_Spec.md _audit/DEFECT_LEDGER.md _audit/V711_BACKLOG_INDEX.md _integration/AUTHORED_EXTENSIONS_LEDGER.md _integration/RECONCILIATION.md
```

Result: live Master Spec hits resolve to §4.4.19.1 and Appendix J; historical RECONCILIATION / AE hits identify prior authored-extension context or the new AE row, not an unfilled entity gap.

## 5. Full Gate

Command:

```sh
cd tools/spec-lint && npm run all -- --no-emit
```

Result: exit 0. All blocking gates passed.

Advisory findings remain non-blocking:

- `solo_tier_numeric_single_source`: 52
- `retention_singleton_section_40_2_canonical`: 122
- `section_anchor_slug_no_colon`: 13

## 6. Final Checksums

- `Sourcera_Master_Spec.md` md5 `10652b46c965803aa8a92537c8edd881`
- `_audit/DEFECT_LEDGER.md` md5 `c3f7b8994da74d2ca30c2f99abd0f070`
- `_audit/V711_BACKLOG_INDEX.md` md5 `a2b62f245a6bbd3a9a3abd0481366798`
- `_audit/REMEDIATION_BACKLOG.md` md5 `fb8e1cb4c9e198efad400d2b8def063b`
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md` md5 `dcd9ba1e85237683bcd99484c9279647`
- `_integration/RECONCILIATION.md` md5 `da76b1adda983315b07cd86df4b07c9d`

## 7. Residuals

D-2.2-046 and D-2.2-047 remain open as adjacent Phase 2.2 webhook catalog clusters. This pass does not claim webhook completeness.
