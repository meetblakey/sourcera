# Phase 2 Method Residual P1 Verification

**Date:** 2026-06-23
**Program:** v7.2.0-REM
**Scope:** D-2-005, D-2-009, D-2-024, D-2-028, D-2-033, D-2-036, D-2-037, D-2-042

## Sources Read

- `Sourcera_Master_Spec.md` §2.1-§2.8
- `Sourcera_Master_Spec.md` §4.2.2, §4.3.1, §4.3.29, §4.3.30
- `Sourcera_Master_Spec.md` §10.16.1, §19, §34.1.1, §39
- `Sourcera_Master_Spec.md` Appendix J and §M.5
- `UX_Design_of_Sourcera.md` §5.2.19
- `_audit/DEFECT_LEDGER.md`
- `_audit/REMEDIATION_BACKLOG.md`
- `_audit/V711_BACKLOG_INDEX.md`

## Classification

| Defect | Classification | Evidence / Resolution |
| :---- | :---- | :---- |
| D-2-005 | True issue | §2.3 had Do / Don't guidance but no numbered ACs. §2.3.3 now defines FM proportion warnings, EJ rubric enforcement, EJ notes, calibration AuditEvent evidence, and Solo soft-skip behavior. |
| D-2-009 | True issue | §2.4.1 had local vendor-count thresholds. §2.4.1 / §2.4.3 now cite §34.1.1 and §39 for enforceable limits and mark shortlist counts as Method guidance. |
| D-2-024 | True issue | §2.7 RFI/RFP language and §19 Use Case Bundle language lacked a buyer-side kind discriminator. WorkspaceTemplate.`kind` and Appendix J `workspace_template_kind` now bind `use_case_bundle`, `rfi`, and `rfp`. |
| D-2-028 | Stale-open status sync | Current §10.16.1 already includes `soft_gates_enabled`, Solo warning response behavior, and Team-mode HTTP 422 `phase_advancement_soft_gates_not_permitted_in_team_mode`; no spec body change required for this row. |
| D-2-033 | True issue | §2.8 did not distinguish returning Solo operators from first-run onboarding. §2.8 now keeps contextual invites Workspace-local and stores first-run dismissal on OrgMembership.`solo_intro_dismissed_at`. |
| D-2-036 | True issue | §2.8 did not bind mobile behavior. §2.8 now binds Solo mobile rendering to UX §5.2.19 and adds AC coverage for segmented control, bottom-sheet details, 48px targets, and deadline visibility. |
| D-2-037 | True issue | §2.8.5 did not define concurrent automatic Team promotion behavior. §2.8 / §4.3.1 now serialize on `(workspace_id)` and require exactly one mode-change AuditEvent. |
| D-2-042 | True issue | §2.1-§2.7 lacked complete Method AC coverage. §2.2.5 already existed; this pass added §2.1.1, §2.3.3, §2.4.3, §2.5.3, §2.6.4, and §2.7.3. |

## Spec Changes

- Added numbered Method acceptance criteria in §2.1.1, §2.3.3, §2.4.3, §2.5.3, §2.6.4, and §2.7.3.
- Updated §2.4.1 to delegate vendor tracking limits to §34.1.1 / §39 and treat shortlist counts as non-blocking guidance.
- Added buyer WorkspaceTemplate.`kind`, WorkspaceTemplateVersion kind consistency, §19 kind rendering/filtering, and Appendix J `workspace_template_kind`.
- Added §2.8 returning-operator behavior, mobile behavior, and automatic Team-transition concurrency semantics.
- Added OrgMembership.`solo_intro_dismissed_at`.
- Registered Appendix J `scoring_calibration_session_recorded` and `workspace_evaluation_owner_mode_change_trigger_reason`.
- Updated §M.5 WorkspaceTemplate enum guardrail binding to include §2.7 and `workspace_template_kind`.

## Tracking Updates

- `_audit/DEFECT_LEDGER.md`: target rows now carry `remediated 2026-06-23`.
- `_audit/V711_BACKLOG_INDEX.md`: Phase 2 Method Residual P1 delta note added.
- `_audit/REMEDIATION_BACKLOG.md`: BL-P1-PH2-AC row updated to include residual P1 closure.
- `_integration/RECONCILIATION.md`: Phase 2 Method Residual P1 pass appended.
- `_integration/AUTHORED_EXTENSIONS_LEDGER.md`: AE-V72REM-PH2-METHOD-RESIDUAL-P1-01 appended.

## Counts

- Index-series P1 count: 134 -> 126 by eight-row delta.
- Fresh canonical-row status scan after closure: 126 open P1 rows / 126 unique open P1 IDs.
- Short supplementary status-transition tables are excluded from the scanner; naive literal `| open |` scans overcount by including transition-history rows.

## Verification

Command:

```bash
npx tsx tools/spec-lint/run-all.ts --spec Sourcera_Master_Spec.md --ux UX_Design_of_Sourcera.md --ae-ledger _integration/AUTHORED_EXTENSIONS_LEDGER.md --no-emit
```

Result: pass for all blocking gates. Advisory-only residuals remain unchanged in the known buckets:

- `solo_tier_numeric_single_source`: 52 advisory findings.
- `retention_singleton_section_40_2_canonical`: 115 advisory findings.
- `section_anchor_slug_no_colon`: 13 advisory findings.

Blocking gates worst exit code: 0. Advisory findings are non-blocking.
