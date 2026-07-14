# Sourcera Fixture

### 1.6.1 Per-Org Residency Change Procedure {#1.6.1-per-org-residency-change-procedure}

**Eligibility predicates.**

| Predicate | Blocking condition | Detection source | Resolution path | Error |
|---|---|---|---|---|
| `bid_workspace_active_phase_7_through_13` | Active production evaluation | Workspace | Close evaluation | `org_residency_change_eligibility_predicate_violated` |

**State machine.**

| From | To | Trigger | Conditions | Notes |
|---|---|---|---|---|
| `requested` | `completed` | Direct write | None | Bad shortcut |

### `org_residency_change_state` (§1.6.1 Per-Org Residency Change Procedure)

`requested`, `completed`

**Notes.** Incomplete.

| `org_residency_change_state_machine_complete` | state_machine_contract | spec_binding_pending_pack_m02_3 | pr_lint + runtime_test | Old row. | M02.3 |
