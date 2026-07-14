# v7.2.0-REM Promoted Listing Plan-Gate Error-Code P1 Verify

**Date:** 2026-06-21

**Scope:** D-MD-003.

**Result:** PASS.

## Finding

Promoted Listing plan-tier eligibility had two competing 403 codes: `promoted_listing_plan_tier_below_scale` from §4.4.19 and `marketplace_discovery_sku_unavailable_on_plan` from §4.8.12 / Appendix I. The earlier D-PXC-009 pass surfaced the plan gate in §34.16.1 and §34.16.8, but the error-code synonym remained.

## Remediation

- §34.16.7 now includes `promoted_listing_plan_tier_below_scale` in the marketplace-discovery error-code table.
- §4.8.12 failure mode #2 and AC #7 now use `promoted_listing_plan_tier_below_scale` for Promoted Listing plan-gate failures.
- Appendix I `marketplace_discovery_sku_unavailable_on_plan` is narrowed to a deprecated/generic non-PromotedListing ledger/SKU plan-gate code.
- `_audit/DEFECT_LEDGER.md` marks D-MD-003 `remediated 2026-06-21`.

## Verification

Targeted grep confirmed Promoted Listing plan-tier surfaces cite `promoted_listing_plan_tier_below_scale` and that `marketplace_discovery_sku_unavailable_on_plan` no longer appears as the PromotedListing plan-gate error. The generic code remains catalogued only as non-PromotedListing/deprecated Appendix I vocabulary.

No Authored Extension row was required because this pass resolves an error-code naming collision without changing eligibility.
