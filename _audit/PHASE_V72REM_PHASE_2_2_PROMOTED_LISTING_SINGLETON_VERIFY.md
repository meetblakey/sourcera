# Phase 2.2 PromotedListing Singleton Verification

**Date:** 2026-06-22  
**Scope:** D-2.2-027 (`§4.4.19 PromotedListing` numerical singleton)  
**Verdict:** PASS — D-2.2-027 is remediated in the Master Spec and canonical ledgers.

## 1. Backups

| File | Backup | md5 |
|---|---|---|
| `Sourcera_Master_Spec.md` | `legacy-import:_versions/Sourcera_Master_Spec_pre-2026-06-22-phase-2-2-promoted-listing-singletons.md` | `0fa948b315ab77ac0b4c7e604ef0a8ba` |
| `_audit/DEFECT_LEDGER.md` | `legacy-import:_versions/DEFECT_LEDGER_pre-2026-06-22-phase-2-2-promoted-listing-singletons.md` | `df6a3f2ae3510235fdd03d0fbf8f30cf` |
| `_audit/V711_BACKLOG_INDEX.md` | `legacy-import:_versions/V711_BACKLOG_INDEX_pre-2026-06-22-phase-2-2-promoted-listing-singletons.md` | `ac98a2724591516532f3ffd564795c26` |
| `_integration/RECONCILIATION.md` | `legacy-import:_versions/RECONCILIATION_pre-2026-06-22-phase-2-2-promoted-listing-singletons.md` | `30ac8060c6b50ee3291e64dbcf3db690` |
| `_integration/AUTHORED_EXTENSIONS_LEDGER.md` | `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-2026-06-22-phase-2-2-promoted-listing-singletons.md` | `5b2392f5dd69a729e6936d7158d46d88` |

## 2. Adjudication

D-2.2-027 was a true live P1 issue. Current §4.4.19 still copied PromotedListing bid ceilings, spend-cap bounds, category cap, purchased-top-up cap, and KB-health floor values directly into the entity contract and eligibility gate. Related §27.11 API examples / error rows, Appendix I errors, Appendix J notes, and Appendix K glossary text repeated parts of the same cap set.

## 3. Closure Summary

- Added §34.16.1.A `Promoted Listing Monetary and Cap Constants` as the canonical table for PromotedListing base rate, bid ceilings, daily/per-EOI cap bounds, category slot cap, purchased-top-up hard cap, KB-health floor, and reserve CPM.
- Rewrote §4.4.19 field constraints, eligibility gate, auction mechanics, failure modes, acceptance criteria, and accounting prose to cite §34.16.1.A cells.
- Rewrote §27.11 API response/error examples to use source-cell references instead of copied cap values.
- Rewrote §39 PromotedListing rows to defer monetary bounds to §34.16.1.A.
- Rebound Appendix I / J / K PromotedListing references to §34.16.1.A.
- Updated `_audit/DEFECT_LEDGER.md`, `_audit/V711_BACKLOG_INDEX.md`, `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, and `_integration/RECONCILIATION.md`.

## 4. Targeted Verification

§4.4.19 targeted stale-string scan:

```json
{
  "section": "4.4.19",
  "stale_found": [],
  "required_cells_missing": []
}
```

Master Spec targeted residual scan returned no matches for:

```text
bid_impression_cents > 5000
bid_eoi_cents > 100000
daily_cap_cents outside $1
kb_health_floor": 60.00
category_cap": 3
top_up_hard_cap_remaining": 4
Category Cap (PromotedListing).*Default = 3
Per-seller monthly cap of 4 additional
```

Established V711 index regex:

```text
rg -n '^\| D-[^|]+ \| P1 \|[^\n]*\| open \|' _audit/DEFECT_LEDGER.md | wc -l
```

Result: `387` open P1 rows. Unique D-* IDs: `386`. `D-2.2-027` open-row scan returned no match.

## 5. Full Lint

Command:

```text
cd tools/spec-lint && npm run all -- --no-emit
```

Result: PASS, exit 0. Blocking gates all pass.

Advisory-only findings remain in the pre-existing posture:

- `solo_tier_numeric_single_source`: 52
- `retention_singleton_section_40_2_canonical`: 123
- `section_anchor_slug_no_colon`: 13

## 6. Residuals

D-2.2-028 remains open as the lower-severity paired pricing-citation row until separately adjudicated or status-propagated. Broader numerical-singleton issues outside PromotedListing remain tracked by their own open P1 rows.
