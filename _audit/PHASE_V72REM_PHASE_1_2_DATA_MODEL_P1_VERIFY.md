# Phase 1.2 Data Model P1 Verification — v7.2.0-REM

**Date:** 2026-06-21  
**Cluster:** BL-P1-PH12-DM  
**Target rows:** D-1.2-001, D-1.2-002, D-1.2-003, D-1.2-005, D-1.2-007, D-1.2-008, D-1.2-009  
**Result:** Closed for the seven data-model rows named above. Adjacent D-1.2-004 firewall leakage and D-1.2-006 acceptance-criteria rows remain open.

## Source Review

Reviewed current Master Spec §4.3.1 through §4.3.28, §13.2.2, §13.11.7, §13.12.4, §15.2, §39, §40.2, Appendix E, Appendix J, and Appendix M. Confirmed the backlog row's D-1.2-005 evidence was partly stale: §4.3.8 Evaluation Scenario and §4.3.13 Internal Comment Mention already carried `org_id`; the live missing set was §4.3.2, §4.3.3, §4.3.4, §4.3.5, §4.3.6, §4.3.7, and §4.3.10.

## Master Spec Changes Verified

1. §4.3.1 Workspace now declares `intake_eval_starter_id`, `intake_eval_starter_version`, `intake_freetext_label`, `seeded_from_deprecated_redirect_to`, `rubric_config_json`, and `archived_at`.
2. §4.3.2 / §4.3.3 / §4.3.4 / §4.3.5 / §4.3.6 / §4.3.7 / §4.3.10 now declare `org_id`.
3. §4.3.4 Requirement now declares `weight`, `response_type`, and `default_pm_value`, and §13.12.4 maps EvalStarter seed fields into canonical Requirement fields.
4. §4.3.4 Requirement and §4.3.5 Response now bind to the §4.7.1 Console Bridge bounded-lag SLO.
5. §13.2.2 records Rubric as Workspace configuration persisted in `Workspace.rubric_config_json`.
6. §4.3.28 authors `TCOModel` with field table, indexes, scope isolation, retention, relationships, and acceptance criteria; §15.2 points pricing JSON to that entity.
7. §13.11.7 and Appendix M now cite DefenseView's canonical entity anchor as §13.11.7, not a missing §4.3 subsection.
8. §39 adds Workspace intake/rubric and TCOModel size rows; Appendix J adds `tco_pricing_model`.
9. §40.2 and Appendix E bind archive-retention math to `Workspace.archived_at`.

## Ledger / Backlog Updates

- `_audit/DEFECT_LEDGER.md`: seven rows moved to `remediated 2026-06-21`.
- `_audit/REMEDIATION_BACKLOG.md`: BL-P1-PH12-DM count reduced from 7 to 0.
- `_audit/V711_BACKLOG_INDEX.md`: advisory parsed P1-open count reduced from 557 to 550.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`: AE-V72REM-PH12-DM-01 appended as pending.
- `_integration/RECONCILIATION.md`: Phase 1.2 Data Model P1 pass appended.

## Backups

- `legacy-import:_versions/Sourcera_Master_Spec_pre-phase-1-2-data-model-p1-2026-06-21.md` — md5 `d1da625929e2aa20c2d2d98b884f4cca`
- `legacy-import:_versions/DEFECT_LEDGER_pre-phase-1-2-data-model-p1-2026-06-21.md` — md5 `77a5a2fd5cc1cb7a65d1d13bcc9ec2ba`
- `legacy-import:_versions/REMEDIATION_BACKLOG_pre-phase-1-2-data-model-p1-2026-06-21.md` — md5 `8776da42f521dc27ef1cf53a90d3a5bd`
- `legacy-import:_versions/V711_BACKLOG_INDEX_pre-phase-1-2-data-model-p1-2026-06-21.md` — md5 `8e1ad1f044f9f5644a42a637705221fd`
- `legacy-import:_versions/AUTHORED_EXTENSIONS_LEDGER_pre-phase-1-2-data-model-p1-2026-06-21.md` — md5 `c68c683d31280014a55216c22e0f9a03`
- `legacy-import:_versions/RECONCILIATION_pre-phase-1-2-data-model-p1-2026-06-21.md` — md5 `16803088d638c3ff496f2ca0146ceed8`

## Validation

Command:

```bash
npm --prefix tools/spec-lint run all -- --no-emit
```

Result: exit code 0. All blocking gates passed.

Advisory-only findings remain:

- `solo_tier_numeric_single_source`: 52
- `retention_singleton_section_40_2_canonical`: 124
- `section_anchor_slug_no_colon`: 13

These are pre-existing advisory hygiene classes and do not block this closure.

