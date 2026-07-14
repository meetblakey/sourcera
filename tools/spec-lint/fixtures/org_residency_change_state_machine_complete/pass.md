# Sourcera Fixture

### 1.6.1 Per-Org Residency Change Procedure {#1.6.1-per-org-residency-change-procedure}

**Eligibility predicates.** The mutation evaluates the closed predicate set below before any Stripe, storage, backup, export, or analytics side effect.

| Predicate | Blocking condition | Detection source | Resolution path | Error |
|---|---|---|---|---|
| `bid_workspace_active_phase_7_through_13` | Active production evaluation | Workspace | Close evaluation | `org_residency_change_eligibility_predicate_violated` |
| `ai_operation_pending_settlement` | Pending AIOperation | AIOperation | Wait | `org_residency_change_eligibility_predicate_violated` |
| `dsar_request_in_flight` | DSAR in flight | DSARRequest | Close DSAR | `org_residency_change_blocked_by_active_dsar` |
| `outcome_contract_in_renewal_window` | Renewal window | OutcomeContract | Complete renewal | `org_residency_change_eligibility_predicate_violated` |

Legal hold is not part of the pre-cutover eligibility predicate set because a legal hold can coexist with a destination-region cutover. It blocks only source-region erasure at the §40.4 source-retention step and keeps the request in `source_retention_hold` until Legal releases the hold.

**State machine.**

| From | To | Trigger | Conditions | Notes |
|---|---|---|---|---|
| `not_requested` | `requested` | Submit | Target differs | Request starts |
| `requested` | `eligibility_blocked` | Preflight fails | Any predicate fails | No side effects |
| `requested` | `approval_pending` | Preflight passes | Approval required | Pending |
| `approval_pending` | `approved` | Approve | Checks pass | Approved |
| `approval_pending` | `cancelled` | Cancel | No side effects | Terminal |
| `approved` | `migration_in_progress` | Start | Locked | Running |
| `migration_in_progress` | `rollback_required` | DSAR begins | Before cutover | Rollback |
| `rollback_required` | `rolled_back` | Rollback completes | Source restored | Terminal |
| `migration_in_progress` | `cutover_committed` | Commit | Validation passes | Cutover |
| `cutover_committed` | `source_retention_hold` | Hold applies | Legal hold | Hold |
| `cutover_committed` | `completed` | No hold | Source purge verified | Terminal |
| `source_retention_hold` | `completed` | Hold clears | Erase completed | Terminal |

**DSAR deadlock rule.** An open DSAR blocks a new residency change with `org_residency_change_blocked_by_active_dsar`. If a DSAR is verified while a request is in `approved` or `migration_in_progress` and before `cutover_committed`, the request transitions to `rollback_required` and then `rolled_back`.

### `org_residency_change_state` (§1.6.1 Per-Org Residency Change Procedure)

`not_requested`, `requested`, `eligibility_blocked`, `approval_pending`, `approved`, `migration_in_progress`, `rollback_required`, `rolled_back`, `cutover_committed`, `source_retention_hold`, `completed`, `cancelled`

**Notes.** The state machine is authoritative in §1.6.1; §32.8.25 polling responses and §50.30 Ops proposals MUST use these values exactly. Terminal states are `completed`, `rolled_back`, and `cancelled`.

| `org_residency_change_state_machine_complete` | state_machine_contract | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/org_residency_change_state_machine_complete.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint + runtime_test | §1.6.1 MUST define the Org residency migration state machine with eligibility predicates, DSAR rollback, legal-hold source-retention behavior, and Appendix J `org_residency_change_state` membership. | M02.3 |
