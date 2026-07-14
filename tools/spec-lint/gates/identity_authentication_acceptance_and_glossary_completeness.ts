/**
 * Gate: `identity_authentication_acceptance_and_glossary_completeness`
 *
 * Assertion: §6 acceptance criteria, Appendix K identity vocabulary, and
 * §40.2 MFA retention stay bound to the canonical authentication contracts.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { m5RuntimeActiveFindings, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "identity_authentication_acceptance_and_glossary_completeness";

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "6.1-authentication-architecture"), "§6.1 acceptance criteria", [
    "### 6.1.3 Acceptance Criteria",
    "`auth.sso_session_assertion`",
    "`auth.login_failed`",
    "§49.1.1 magic-link fallback path",
    "§6.9.6 60-second SLA",
    "workos_raw_attributes_not_consumed",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "6.2-multi-factor-authentication-(mfa)"), "§6.2 acceptance criteria", [
    "### 6.2.6 Acceptance Criteria",
    "`mfa_enforcement_change.warned_at`",
    "14-calendar-day grace window",
    "mfa_enrollment_grace_window_active_pending_user_enrollment",
    "`auth.mfa_recovery_code_used`",
    "`removal_reason = admin_reset`",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "40.2-data-retention-and-deletion"), "§40.2 MFA retention", [
    "| MfaRecoveryCode (§4.2.7) |",
    "| MfaEnrollment (§4.2.8) |",
    "Residency: User home region / owning Org region.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-k-glossary"), "Appendix K identity vocabulary", [
    "**Single Sign-On (SSO).**",
    "**Security Assertion Markup Language (SAML).**",
    "**System for Cross-domain Identity Management (SCIM).**",
    "**WorkOS.**",
    "**OpenID Connect (OIDC).**",
    "**Magic Link.**",
    "**Bearer Token.**",
    "**WebAuthn.**",
    "**FIDO2.**",
    "**Time-based One-Time Password (TOTP).**",
    "**Recovery Code.**",
  ]);
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 3.3 identity acceptance and glossary closure",
  rowClass: "spec_tree_lint",
  executionContext: "pr_lint",
  overridePath: "not_permitted_catalog_completeness",
  inputs: { masterSpec: true },
  version: "1.0.0",
  run(ctx: GateContext): Finding[] {
    return findingsFor(ctx.masterSpec);
  },
};

if (isEntrypoint(import.meta.url)) void runGateCli(gate);
