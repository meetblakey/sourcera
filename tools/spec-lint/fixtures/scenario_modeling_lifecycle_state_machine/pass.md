### 14.6.4 Scenario Lifecycle State Machine {#14.6.4-scenario-lifecycle-state-machine}

The state labels below are derived from §4.3.8 fields (`results`, `version`, `is_locked`, `deleted_at`) and no parallel status column is introduced.

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `(implicit)` | `original` | | | |
| `(none)` | `created` | | | |
| `created` | `edited` | | | emits `scenario.updated`; stale clients receive `scenario_concurrent_edit_conflict`. |
| `edited` / `created` | `results_recomputed` | | | |
| `created` / `edited` / `results_recomputed` | `locked` | | | Emits `scenario.locked`; future writes return `scenario_phase_locked`. |
| `created` / `edited` / `results_recomputed` | `soft_deleted` | | | |
| `(none)` | `rejected` | | | |

#### `evaluation_scenario_lifecycle_state` (§4.3.8 / §14.6.4)

`original`, `created`, `edited`, `results_recomputed`, `locked`, `soft_deleted`, `rejected`

`rejected` is an API / state-machine outcome label only and MUST NOT be stored as an entity state.

| `scenario_modeling_lifecycle_state_machine` | enum_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/scenario_modeling_lifecycle_state_machine.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | contract | M02.3 |
