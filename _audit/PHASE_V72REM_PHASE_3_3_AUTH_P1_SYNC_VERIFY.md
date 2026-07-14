# Phase 3.3 Auth P1 Sync Verify — 2026-06-21

## Scope

This pass checked the live Master Spec against Phase 3.3 auth P1 rows and separated stale status rows from true residuals.

## Master Spec Changes Verified

- §4.2.1 now uses canonical `Organization.mfa_enforcement_level` instead of a live `mfa_required_org_wide` Boolean schema row.
- §34.1.1 / §34.1.2 now contain **Session Duration**, **Idle Timeout**, and **API Token Lifetime** authority cells.
- §34.1.1 now contains **Custom Domain (Auto-Join)**.
- §34.1.2 now contains the missing Seller **API Keys** mirror used by §6.6.2.
- §39 now contains authority rows for ApiToken token format, ApiToken lifetime, MfaRecoveryCode recovery-code count, Session duration / idle timeout, and DomainAutoJoinClaim custom-domain count.
- §6.2, §6.3, §6.4, §6.6, §6.7.6, §7.1.2, and §33.2 now cite or align to those canonical homes.

## Ledger / Backlog Changes Verified

- Closed / status-synced true body closures: D-3.3-001, D-3.3-002, D-3.3-006 through D-3.3-011, D-3.3-015 through D-3.3-020, D-3.3-022 through D-3.3-025, D-3.3-028 through D-3.3-030, and D-3.3-033 through D-3.3-037.
- Closed adjacent duplicate schema row: D-1.1-017.
- BL-P1-PH33-DOC reduced from 9 to 2 after live-spec verification.

## Residuals Identified Before Closeout

| Defect | Why still true |
|---|---|
| D-3.3-003 | Before the residual closeout addendum below, Appendix M.1 had grouped Identity & Security rows but not the exact nine per-surface §6 rows requested by the defect. |
| D-3.3-012 | Before the residual closeout addendum below, existing coverage included `security.mfa_factor_changed` user notifications and `auth.mfa_*` AuditEvents, but explicit org-level MFA enforcement/regeneration webhook rows in Appendix C/G were unauthored. |

## Targeted Verification Commands

Expected targeted scan outcomes after this pass:

- `rg "users\\.mfa_enabled" Sourcera_Master_Spec.md` returns only the §6.2.2 deprecation note explaining the retired pre-V3 reference; there is no live schema assertion that User carries that field.
- `rg "Session Duration|Idle Timeout|API Token Lifetime|Custom Domain \\(Auto-Join\\)|recovery_codes_per_enrollment|secret_random_segment_length|org_id_prefix_length" Sourcera_Master_Spec.md` returns the new §34 / §39 authority rows and their §6 references.
- `rg '^\\| D-3\\.3-(003|012) \\|' _audit/DEFECT_LEDGER.md` shows the two intentionally open P1 residuals.

## Notes

- AE-V72REM-PH33-AUTH-SINGLETON-01 is pending ratification before the v7.1.1 stamp.
- Runtime wiring remains unchanged. Existing gates such as `mfa_enforcement_level_canonical_consumer` keep their prior implementation-pack status.
- Full spec lint command `npm --prefix tools/spec-lint run all -- --no-emit` passed all blocking gates. Advisory-only findings remain for `solo_tier_numeric_single_source` (52), `retention_singleton_section_40_2_canonical` (124), and `section_anchor_slug_no_colon` (13).
- Git checks were unavailable because this folder is not a Git repository.

## Residual P1 Closeout Addendum (2026-06-21)

This addendum verifies closure of the two true residual Phase 3.3 P1 rows identified above.

## Master Spec Changes Verified

- Appendix M.1 now includes exact rows for the nine §6 auth surfaces: login screen, sign-out CTA, session-expiration toast, MFA enrollment wizard, recovery-code display screen, domain-claim wizard, DNS-verification flow, guest-invite acceptance flow, and API-token management page.
- Appendix C Security-Domain Events now registers `mfa.enrolled`, `mfa.unenrolled`, `mfa.recovery_codes_regenerated`, `org.mfa_enforcement_level_set`, and `org.mfa_enforcement_level_cleared`.
- Appendix G now registers the corresponding PostHog mirror rows: `mfa_enrolled`, `mfa_unenrolled`, `mfa_recovery_codes_regenerated`, `org_mfa_enforcement_level_set`, and `org_mfa_enforcement_level_cleared`.

## Ledger / Backlog Changes Verified

- D-3.3-003 moved to `remediated 2026-06-21`.
- D-3.3-012 moved to `remediated 2026-06-21`.
- BL-P1-PH33-DOC reduced from 2 to 0.
- AE-V72REM-PH33-AUTH-RESIDUAL-01 added as the pending ratification row for the Appendix M.1 and Appendix C/G additions.

## Targeted Verification Commands

Expected targeted scan outcomes after this addendum:

- `rg "Login screen \\(WorkOS-managed\\)|Sign-out CTA|Session-expiration toast|MFA enrollment wizard|Recovery-code display screen|Domain-claim wizard|DNS-verification flow|Guest-invite acceptance flow|API-token management page" Sourcera_Master_Spec.md` returns all nine Appendix M.1 rows.
- `rg 'mfa\\.enrolled|mfa\\.unenrolled|mfa\\.recovery_codes_regenerated|org\\.mfa_enforcement_level_set|org\\.mfa_enforcement_level_cleared|mfa_enrolled|mfa_unenrolled|mfa_recovery_codes_regenerated|org_mfa_enforcement_level_set|org_mfa_enforcement_level_cleared' Sourcera_Master_Spec.md` returns the five Appendix C rows and five Appendix G mirror rows.
- `rg '^\\| D-3\\.3-(003|012) \\|' _audit/DEFECT_LEDGER.md` shows both rows as remediated.
- `rg 'BL-P1-PH33-DOC' _audit/REMEDIATION_BACKLOG.md` shows count `0`.

## Full Lint After Addendum

- `npm --prefix tools/spec-lint run all -- --no-emit` passed all blocking gates after the residual closeout edits.
- Advisory-only findings remain unchanged in class: `solo_tier_numeric_single_source` (52), `retention_singleton_section_40_2_canonical` (124), and `section_anchor_slug_no_colon` (13).
