/**
 * Gate: `workspace_cohort_assignment_vacancy_contract`
 *
 * Assertion: The authored cohort reassignment and vacancy contract remains
 * source-bound, Buyer-only, and cannot silently change authorization.
 */

import { isEntrypoint, runGateCli } from "../lib/gate.js";
import type { Finding, GateContext, SpecDoc, SpecLintGate } from "../lib/types.js";
import { findLine, m5RuntimeActiveFindings, push, requireTokens, sectionTextByAnchor } from "./enterprise_security_gate_helpers.js";

const GATE_ID = "workspace_cohort_assignment_vacancy_contract";

function requireLine(doc: SpecDoc, findings: Finding[], token: string, label: string) {
  const line = findLine(doc, (candidate) => candidate.includes(token));
  if (!line) push(findings, doc, 0, token, `${label} is missing required token: ${token}`);
}

function findingsFor(doc: SpecDoc): Finding[] {
  const findings: Finding[] = [];
  requireTokens(findings, doc, sectionTextByAnchor(doc, "2.6.1.a-cohort-assignment-misfire-and-vacancy-contract"), "§2.6.1.A cohort assignment and vacancy", [
    "AE-V711-PH2-COHORT-ASSIGNMENT-VACANCY-01",
    "This subsection adds no RBAC role, plan entitlement, webhook, or cross-console projection.",
    "On invite acceptance, the server evaluates the §2.6.1 heuristic once",
    "An inviter-selected cohort persists with source `inviter_selected`",
    "MUST NOT silently recalculate a stored cohort.",
    "A heuristic miss keeps the inviter's explicit selection",
    "A cohort is **vacant** only when an existing current-or-next §10.16 hard gate requires it",
    "never auto-promotes another user.",
    "§8.4 Team SLA timers do not apply to cohort reassignment",
    "Cohort Reassignment Rate",
    "Offline clients render the last authorized value as stale and MUST NOT queue a cohort mutation.",
  ]);
  for (const token of [
    "| `stakeholder_cohort` | Enum | Appendix J `stakeholder_cohort`",
    "| `cohort_assignment_source` | Enum | Appendix J `workspace_membership_cohort_assignment_source`",
    "| `cohort_assigned_at` | Timestamp |",
    "| `version` | Integer | Required; default 1; increments on every membership or cohort mutation |",
    "Cohort fields are Buyer-only and MUST NOT appear in Console Bridge payloads",
    "Cohort fields inherit Workspace Membership retention.",
    "then recompute the §2.6.1.A cohort-coverage predicate atomically.",
  ]) requireLine(doc, findings, token, "§4.3.2 Workspace Membership");
  requireTokens(findings, doc, sectionTextByAnchor(doc, "6.9-user-deprovisioning"), "§6.9 user deprovisioning", [
    "No transfer of the departing member's cohort.",
    "**Cohort-coverage recompute (same membership-revocation transaction).**",
    "Do not auto-promote or reassign another member.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "10.16-phase-advancement-api"), "§10.16 cohort coverage precondition", [
    "**Cohort-coverage precondition (AE-V711-PH2-COHORT-ASSIGNMENT-VACANCY-01).**",
    "required_cohort",
    "coverage=false",
    "It does not create a new phase-error code, promote a member, alter membership RBAC",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "20.2.1.a-cohort-coverage-attention"), "§20.2.1.A cohort coverage attention", [
    "existing `team_assignment` InboxItem type",
    "It creates no new webhook, email template, notification type, or seller-visible event.",
    "must not queue an offline assignment mutation.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "20.3.5-cohort-reassignment-rate"), "§20.3.5 cohort reassignment rate", [
    "non-score operational metric",
    "does not change the four §20.3.1 score terms or weights",
    "emits no webhook / PostHog event",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "32.10.9.j-workspace-cohort-assignment-endpoints"), "§32.10.9.J cohort API", [
    "`/v1/workspaces/{workspace_id}/members/{membership_id}/stakeholder-cohort-suggestion`",
    "`/v1/workspaces/{workspace_id}/members/{membership_id}/stakeholder-cohort`",
    "Only the current `workspace_owner` may request a suggestion or mutate a cohort",
    "raw email domain, WorkOS attribute, group, and directory input are never returned.",
    "`expected_version`",
    "It verifies active accepted membership, expected version, and Workspace Owner authorization",
    "The endpoint adds no plan gate, webhook, PostHog event, Console Bridge event, Seller response field, Marketplace field, or public API projection.",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-i-v711-phase-2-cohort-assignment-codes"), "Appendix I cohort errors", [
    "workspace_membership_cohort_assignment_forbidden",
    "workspace_membership_cohort_not_active",
    "workspace_membership_cohort_version_conflict",
    "workspace_membership_cohort_invalid",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "appendix-j-controlled-vocabulary-registry"), "Appendix J cohort vocabulary", [
    "### Workspace Membership Cohort Assignment Source (§2.6.1.A / §4.3.2)",
    "`heuristic_acceptance`, `inviter_selected`, `workspace_owner_override`, `vacancy_resolution`, `solo_to_team_backfill`, `historical_backfill`",
    "### Cohort Vacancy Reason (§2.6.1.A)",
    "`membership_revoked`, `user_deprovisioned`, `cohort_reassigned`, `gate_eligibility_lost`",
    "workspace_membership_cohort_overridden",
    "workspace_membership_cohort_vacancy_opened",
    "workspace_membership_cohort_vacancy_resolved",
  ]);
  requireTokens(findings, doc, sectionTextByAnchor(doc, "l-24-workspace-cohort-coverage-state-machine"), "Appendix L.24 cohort coverage state machine", [
    "**Entity.** Derived Buyer-Workspace cohort coverage; state labels are compendium labels, not a persisted enum.",
    "| `not_required` | `covered` |",
    "| `not_required` | `vacant` |",
    "| `covered` | `vacant` |",
    "| `vacant` | `covered` |",
    "There is no timed SLA escalation, automatic manager promotion",
    "it does not roll back the current phase or create a new error-code family.",
  ]);
  requireLine(doc, findings, "| Cohort Assignment and Vacancy | §2.6.1.A, §4.3.2, Appendix L.24, §20.2.1.A, §32.10.9.J |", "Appendix M cohort mapping");
  findings.push(...m5RuntimeActiveFindings(doc, GATE_ID));
  return findings;
}

export const gate: SpecLintGate = {
  id: GATE_ID,
  sourcePhase: "v7.1.1 Phase 2 cohort assignment and vacancy closure",
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
