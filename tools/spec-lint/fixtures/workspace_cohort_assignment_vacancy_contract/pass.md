## 2.6 Cross-Departmental Alignment Patterns

#### 2.6.1.A Cohort Assignment, Misfire, and Vacancy Contract {#2.6.1.a-cohort-assignment-misfire-and-vacancy-contract}

AE-V711-PH2-COHORT-ASSIGNMENT-VACANCY-01. This subsection adds no RBAC role, plan entitlement, webhook, or cross-console projection.

On invite acceptance, the server evaluates the §2.6.1 heuristic once. An inviter-selected cohort persists with source `inviter_selected`. An email change MUST NOT silently recalculate a stored cohort. A heuristic miss keeps the inviter's explicit selection.

A cohort is **vacant** only when an existing current-or-next §10.16 hard gate requires it. The system never auto-promotes another user. §8.4 Team SLA timers do not apply to cohort reassignment. Cohort Reassignment Rate is available. Offline clients render the last authorized value as stale and MUST NOT queue a cohort mutation.

### 4.3.2 Workspace Membership

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `stakeholder_cohort` | Enum | Appendix J `stakeholder_cohort` | — |
| `cohort_assignment_source` | Enum | Appendix J `workspace_membership_cohort_assignment_source` | — |
| `cohort_assigned_at` | Timestamp | — | — |
| `version` | Integer | Required; default 1; increments on every membership or cohort mutation | — |

Cohort fields are Buyer-only and MUST NOT appear in Console Bridge payloads. Cohort fields inherit Workspace Membership retention. Mutations then recompute the §2.6.1.A cohort-coverage predicate atomically.

## 6.9 User Deprovisioning {#6.9-user-deprovisioning}

No transfer of the departing member's cohort.

**Cohort-coverage recompute (same membership-revocation transaction).** Do not auto-promote or reassign another member.

## 10.16 Phase Advancement API {#10.16-phase-advancement-api}

**Cohort-coverage precondition (AE-V711-PH2-COHORT-ASSIGNMENT-VACANCY-01).** An uncovered cohort returns `required_cohort` and `coverage=false`. It does not create a new phase-error code, promote a member, alter membership RBAC.

## 20. Inbox and Pulse

#### 20.2.1.A Cohort Coverage Attention {#20.2.1.a-cohort-coverage-attention}

An unresolved vacancy uses the existing `team_assignment` InboxItem type. It creates no new webhook, email template, notification type, or seller-visible event. Mobile must not queue an offline assignment mutation.

### 20.3.5 Cohort Reassignment Rate {#20.3.5-cohort-reassignment-rate}

Cohort Reassignment Rate is a Team-Mode non-score operational metric. It does not change the four §20.3.1 score terms or weights and emits no webhook / PostHog event.

## 32.10.9 Core Buyer and Administration API Detail Pack

#### 32.10.9.J Workspace Cohort Assignment endpoints {#32.10.9.j-workspace-cohort-assignment-endpoints}

`/v1/workspaces/{workspace_id}/members/{membership_id}/stakeholder-cohort-suggestion`

`/v1/workspaces/{workspace_id}/members/{membership_id}/stakeholder-cohort`

Only the current `workspace_owner` may request a suggestion or mutate a cohort. raw email domain, WorkOS attribute, group, and directory input are never returned. `expected_version` is required. It verifies active accepted membership, expected version, and Workspace Owner authorization. The endpoint adds no plan gate, webhook, PostHog event, Console Bridge event, Seller response field, Marketplace field, or public API projection.

## Appendix I

### v7.1.1 Phase 2 Cohort Assignment Codes {#appendix-i-v711-phase-2-cohort-assignment-codes}

`workspace_membership_cohort_assignment_forbidden`

`workspace_membership_cohort_not_active`

`workspace_membership_cohort_version_conflict`

`workspace_membership_cohort_invalid`

## Appendix J — Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### Workspace Membership Cohort Assignment Source (§2.6.1.A / §4.3.2)

`heuristic_acceptance`, `inviter_selected`, `workspace_owner_override`, `vacancy_resolution`, `solo_to_team_backfill`, `historical_backfill`

### Cohort Vacancy Reason (§2.6.1.A)

`membership_revoked`, `user_deprovisioned`, `cohort_reassigned`, `gate_eligibility_lost`

`workspace_membership_cohort_overridden`

`workspace_membership_cohort_vacancy_opened`

`workspace_membership_cohort_vacancy_resolved`

## Appendix L

### L.24 Workspace Cohort Coverage State Machine {#l-24-workspace-cohort-coverage-state-machine}

**Entity.** Derived Buyer-Workspace cohort coverage; state labels are compendium labels, not a persisted enum.

| From | To | Trigger |
| :---- | :---- | :---- |
| `not_required` | `covered` | — |
| `not_required` | `vacant` | — |
| `covered` | `vacant` | — |
| `vacant` | `covered` | — |

There is no timed SLA escalation, automatic manager promotion; it does not roll back the current phase or create a new error-code family.

## Appendix M

| Cohort Assignment and Vacancy | §2.6.1.A, §4.3.2, Appendix L.24, §20.2.1.A, §32.10.9.J | — |

## Appendix M.5

| `workspace_cohort_assignment_vacancy_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/workspace_cohort_assignment_vacancy_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
