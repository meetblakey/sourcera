# Phase V72REM — Phase 8 API Catalog Existing-Surfaces P1 Verify

**Date:** 2026-06-21  
**Scope:** Catalog-only remediation for already-authored API surfaces in Phase 8 Prompt 8.1.

## Closed Defects

| Defect | Result | Evidence |
|---|---|---|
| D-V8.1-003 | remediated | §32.5 now registers the Vendor Opt-Outs family and points to §27.10.6 as the full-detail source. §27.10.6 path convention and endpoint table are normalized to `/v1/opt-outs`. |
| D-V8.1-004 | remediated | §32.5 now registers Marketplace Discovery promoted-listing seller, buyer, and Ops endpoints and points to §27.11.7 as the full-detail source. |
| D-V8.1-005 | remediated | §32.5 now registers Verification Review submission/read/withdraw/Ops decision endpoints under the Marketplace Discovery family and points to §27.11.7 as the full-detail source. |

## Master Spec Changes

- Added §32.5 `Vendor Opt-Outs` endpoint family covering `POST /v1/opt-outs`, list/read/revoke, and authority-attestation lifecycle endpoints.
- Added §32.5 `Marketplace Discovery` endpoint family covering promoted listings, verification reviews, featured placement requests, buyer projections, display preferences, and Ops marketplace actions.
- Normalized §27.10.6 Vendor Opt-Out path convention from `/api/v1/opt-outs` to `/v1/opt-outs`.
- Clarified that console-qualified Marketplace Discovery roots (`/v1/seller/marketplace`, `/v1/buyer/marketplace`, `/v1/ops/marketplace`) are canonical under the §32.1 `/v1` API version, not alternate API prefixes.

## Tracking Updates

- `_audit/DEFECT_LEDGER.md` canonical rows D-V8.1-003 / -004 / -005 moved to `remediated 2026-06-21`.
- `_audit/REMEDIATION_BACKLOG.md` row `BL-P1-PH8P81-API` scope-corrected from 13 to 4 live API-authoring residuals: D-V8.1-002, D-V8.1-006, D-V8.1-008, D-V8.1-015.
- No new Authored Extension row was created. This pass catalogued and normalized existing Master Spec behavior rather than authoring new product behavior.

## Residuals

- D-V8.1-001 remains open as the broad §32.5 list-only parent for older buyer/admin families.
- D-V8.1-002 remains open for OutcomeContract introspection endpoints.
- D-V8.1-006 remains open for EOI lifecycle endpoints.
- D-V8.1-008 remains open for seller-side Bid Workspace / KB / Managed Agent / Cross-Console Bridge families.
- D-V8.1-009 remains open for broader path-prefix hygiene outside the Vendor Opt-Out / Marketplace Discovery surfaces handled here.
- D-V8.1-015 remains open for Disqualification Reversal endpoint detail and 207 schema registration.
- D-V8.1-021 remains in the webhook backlog, not this API-authoring row.
- D-V8.1-026 remains in the data-model backlog, not this API-authoring row.

## Backups

- `_versions/Sourcera_Master_Spec_pre-phase-8-api-catalog-existing-surfaces-2026-06-21.md`
- `_versions/DEFECT_LEDGER_pre-phase-8-api-catalog-existing-surfaces-2026-06-21.md`
- `_versions/REMEDIATION_BACKLOG_pre-phase-8-api-catalog-existing-surfaces-2026-06-21.md`
- `_versions/RECONCILIATION_pre-phase-8-api-catalog-existing-surfaces-2026-06-21.md`

## Verification Results

- Targeted scan `rg -n '/api/v1/opt-outs|canonical \`/api/v1/\` prefix' Sourcera_Master_Spec.md`: no matches.
- Targeted stale-status scan for D-V8.1-003 / -004 / -005 open rows and a 13-count `BL-P1-PH8P81-API` backlog row: no matches.
- Full lint `npm --prefix tools/spec-lint run all -- --no-emit`: blocking gates pass, exit code 0. Advisory-only findings remain unchanged in the known buckets: `solo_tier_numeric_single_source`, `retention_singleton_section_40_2_canonical`, and `section_anchor_slug_no_colon`.
