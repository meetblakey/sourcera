## 6.1 Authentication Architecture {#6.1-authentication-architecture}

### 6.1.3 Acceptance Criteria

`auth.sso_session_assertion` and `auth.login_failed` are required. WorkOS outage follows the §49.1.1 magic-link fallback path. Deprovisioning follows the §6.9.6 60-second SLA. `workos_raw_attributes_not_consumed` applies.

## 6.2 Multi-Factor Authentication (MFA) {#6.2-multi-factor-authentication-(mfa)}

### 6.2.6 Acceptance Criteria

`mfa_enforcement_change.warned_at` starts the 14-calendar-day grace window. Expiry returns `mfa_enrollment_grace_window_active_pending_user_enrollment`. Recovery use emits `auth.mfa_recovery_code_used`; reset uses `removal_reason = admin_reset`.

## 40.2 Data Retention & Deletion {#40.2-data-retention-and-deletion}

| MfaRecoveryCode (§4.2.7) | Residency: User home region / owning Org region. |
| MfaEnrollment (§4.2.8) | Residency: User home region / owning Org region. |

## Appendix K: Glossary {#appendix-k-glossary}

**Single Sign-On (SSO).**
**Security Assertion Markup Language (SAML).**
**System for Cross-domain Identity Management (SCIM).**
**WorkOS.**
**OpenID Connect (OIDC).**
**Magic Link.**
**Bearer Token.**
**WebAuthn.**
**FIDO2.**
**Time-based One-Time Password (TOTP).**
**Recovery Code.**

## Appendix M.5

| `identity_authentication_acceptance_and_glossary_completeness` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/identity_authentication_acceptance_and_glossary_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
