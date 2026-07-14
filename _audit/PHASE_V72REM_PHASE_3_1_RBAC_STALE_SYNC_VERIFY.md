# Phase V72REM Phase 3.1 RBAC Stale-Sync Verification

**Date:** 2026-06-21  
**Verdict:** PASS for stale-status sync; residual true RBAC and Appendix K issues remain open.

## Scope

This pass verifies canonical-row status updates only. It does not add new Master Spec product behavior. The current Master Spec already contains body text that resolves nine Phase 3.1 P1 rows that still carried stale `open` status in `_audit/DEFECT_LEDGER.md`.

## Closed as Body-Backed

| Defect | Verification basis | Result |
|---|---|---|
| D-3.1-001 | §5.1 contains the Role-overlay union-of-permissions rule and cross-console firewall clause. | PASS |
| D-3.1-006 | §5.3 uses the Appendix J `workspace_role_kind` values `workspace_owner`, `workspace_admin`, `use_case_lead`, `reviewer`, `guest`; legacy Evaluation Lead / Evaluator / Scorer labels are retired in the role table. | PASS |
| D-3.1-013 | §5.5 binds Seller Console roles to Appendix J `seller_workspace_role` values and retires Bid Owner / Bid Contributor / Bid Viewer as canonical row labels. | PASS |
| D-3.1-015 | §5.5 enumerates the 12-role seller-console role set. | PASS |
| D-3.1-017 | §5.6 binds Marketplace roles to Appendix J `marketplace_role` and §5.11.3 materializes Marketplace role-operation coverage. | PASS |
| D-3.1-018 | §5.6 states `marketplace_publisher` is seller-Org-only and binds buyer-Org misgrant to HTTP 422 `marketplace_publisher_buyer_org_grant_invalid`. | PASS |
| D-3.1-019 | §5.6 normalizes Marketplace Viewer / public-reader semantics and requires buyer-Org context for EOI submission; §5.11.3 carries the operation-level boundary. | PASS |
| D-3.1-021 | §5.7 no longer relies on non-canonical Evaluator / Scorer RBAC names for scoring availability; scoring resolves through canonical workspace roles and guest scorer/full-participant profiles. | PASS |
| D-3.1-022 | §5.8 binds Policy Ingestion to `workspace_owner`, `workspace_admin`, and `use_case_lead`, with HTTP 403 `policy_ingestion_role_insufficient` for denied roles. | PASS |

## Residuals Left Open

The following remain true RBAC authoring gaps and are not closed by this status sync:

- D-3.1-003 — Member role still needs operation-level permission lists and §5.11 Member-column treatment.
- D-3.1-004 — Org Owner / Org Admin wording still needs the explicit console-firewall carveout.
- D-3.1-005 — Org Admin billing-read access still conflicts across §5.2 / §4.8 / §5.11 and needs explicit resolution.
- D-3.1-007 — Buyer Console workspace roles still need per-role Operation × Surface × RBAC Check × Audit Action permission lists.
- D-3.1-014 — Seller Console roles still need operation-level permission lists analogous to §5.2.1.

The following remain true Appendix K glossary gaps and stay outside the RBAC body cluster:

- D-3.1-008 — Buyer Console role glossary entries.
- D-3.1-016 — Seller Console role glossary entries.
- D-3.1-020 — Marketplace role glossary entries.

## Ledger / Backlog Verification

- `_audit/DEFECT_LEDGER.md` canonical rows D-3.1-001, D-3.1-006, D-3.1-013, D-3.1-015, D-3.1-017, D-3.1-018, D-3.1-019, D-3.1-021, and D-3.1-022 now carry `remediated 2026-06-21` stale-sync status and cite this file.
- `_audit/REMEDIATION_BACKLOG.md` BL-P1-PH31-RBAC now counts only the five true §5 body/config residuals: D-3.1-003, D-3.1-004, D-3.1-005, D-3.1-007, and D-3.1-014.
- No Authored Extension row was added. This pass reconciles status against already-authored and already-approved body text.
- No §M.5 CI gate was added. Existing gates `rbac_role_name_canonicality` and `fga_custom_role_scope_canonical_consumer` remain the runtime-wiring path.
