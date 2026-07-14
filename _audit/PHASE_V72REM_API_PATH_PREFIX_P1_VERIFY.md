# Phase API Path Prefix Canonicality P1 Verification

**Program:** v7.2.0-REM Program  
**Date:** 2026-06-24  
**Scope:** D-V8.1-009; adjacent D-V6-005 and D-6.2-024; D-8.2-019 recommendation hygiene.

## 1. Source Review

Sources read before classification:

- Master Spec §27.10.3 Enforcement Surfaces.
- Master Spec §27.10.6 API Endpoints.
- Master Spec §27.11.2 Promoted Listings.
- Master Spec §27.11.7 API Endpoints.
- Master Spec §31.11 Webhook Subscription Model and Registration Guard.
- Master Spec §32.1 Overview.
- Master Spec §32.5 Endpoints.
- Master Spec §M.5 CI Gate Catalog.
- `_audit/DEFECT_LEDGER.md`.
- `_audit/V711_BACKLOG_INDEX.md`.
- `_audit/REMEDIATION_BACKLOG.md`.

## 2. Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-api-path-prefix-p1-2026-06-24.md`
- `legacy-import:_versions/DEFECT_LEDGER_pre-api-path-prefix-p1-2026-06-24.md`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-api-path-prefix-p1-2026-06-24.md`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-api-path-prefix-p1-2026-06-24.md`
- `legacy-import:_versions/RECONCILIATION_pre-api-path-prefix-p1-2026-06-24.md`

## 3. Classification

| Defect | Severity | Classification | Resolution |
|---|---|---|---|
| D-V8.1-009 | P1 | True issue | Live Master Spec endpoint contracts now use the §32.1 `/v1` API root. §M.5.66 registers `api_path_prefix_canonical`. |
| D-V6-005 | P2 | Stale-open | Current §27.10.3 row 18 explicitly enumerates Match Score Programmatic API `/v1/marketplace/match-scores/*` and opt-out behavior. |
| D-6.2-024 | P3 | Stale-open plus path-normalization closure | Current §27.10.6 and §27.11.7 now share the §32.1 `/v1` root. |
| D-8.2-019 | P1 | Still open | Integration Export API authoring remains unresolved; endpoint examples in the recommendation now use `/v1` so the future pass cannot reintroduce the retired prefix. |

## 4. Canonical Spec Changes

- Normalized live Master Spec endpoint path tokens from the retired api-prefixed v1 root to `/v1`.
- Updated §31.11 authoring-intent prose so it does not preserve a forbidden literal in live spec text.
- Added §M.5.66 `api_path_prefix_canonical` with running row arithmetic 326 -> 327.

No Authored Extension row was added because this pass enforces existing §32.1 authority and does not author new product behavior.

## 5. Tracking Updates

- `_audit/DEFECT_LEDGER.md`: D-V8.1-009, D-V6-005, and D-6.2-024 transitioned to `remediated 2026-06-24`; D-8.2-019 remains `open` with `/v1` recommendation examples.
- `_audit/V711_BACKLOG_INDEX.md`: current delta note added; exact-status count moved to 5 open P1 rows / 5 unique IDs.
- `_audit/REMEDIATION_BACKLOG.md`: current delta note added; Phase 8 API cluster and D-6.2-024 hygiene row updated.
- `_integration/RECONCILIATION.md`: Phase API Path Prefix Canonicality P1 block appended.

## 6. Verification

- `rg -n "/api/v1" Sourcera_Master_Spec.md`: no matches.
- Exact-status canonical row scan after tracking updates:
  - P0 open rows: 0 / 0 unique.
  - P1 open rows: 5 / 5 unique.
  - P2 open rows: 616 / 616 unique.
  - P3 open rows: 196 / 196 unique.
  - Blocked P1: D-DEC-005.
- Remaining open P1 rows:
  - D-CONS-001
  - D-CONS-006
  - D-V8.1-001
  - D-8.2-019
  - D-11.4-001

- Full spec lint:
  - Command: `npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit`
  - Exit code: 0.
  - Blocking gates: pass.
  - Advisory failures remain:
    - `solo_tier_numeric_single_source`: 52.
    - `retention_singleton_section_40_2_canonical`: 107.
    - `section_anchor_slug_no_colon`: 13.
