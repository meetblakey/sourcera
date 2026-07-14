# v7.2.0-REM Promoted Listing Monthly-Cap P1 Verify

**Date:** 2026-06-21

**Scope:** D-MD-002.

**Result:** PASS.

## Finding

§34.16 previously described the Promoted Listing seller monthly cap as "first / 1 primary + 4 additional," which collapsed Seller Scale and Seller Enterprise into the same effective cap. §34.1.2 and §27.11.2 already define the plan-included allotment as plan-tier-specific and the purchased-top-up hard cap as a separate 4/month limit.

## Remediation

- §34.16.1 now cites §34.1.2 **Promoted Marketplace Placements** as the plan-included monthly allotment authority.
- §34.16.1 now distinguishes plan-included allotments from the 4 purchased-top-up hard cap enforced by §4.4.19 / §27.11.2.
- §34.16.8 AC #6 and §34.20.13 AC #60 now express the monthly cap as plan-included allotment + up to 4 purchased top-ups per billing month.
- Appendix J and Appendix K now clarify that the 4/month hard cap applies to purchased top-ups, not total monthly placements.
- `_audit/DEFECT_LEDGER.md` marks D-MD-002 `remediated 2026-06-21`.

## Verification

Targeted grep confirmed the stale `1 primary + 4 additional` and `4 additional promoted listings per month beyond their first` strings are absent from the live Master Spec. Positive grep confirmed the replacement references to §34.1.2 plan-included allotments, purchased top-ups, `promoted_listing_category_locked`, and `promoted_listing_monthly_top_up_cap_exceeded`.

No Authored Extension row was required because the pass restores existing source-of-truth bindings rather than adding new cap semantics.
