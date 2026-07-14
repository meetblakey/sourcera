### 3.7.1 State Governance {#3.7.1-state-governance}

| From | To | Trigger | Conditions | Notes |
| `loading` | `ready` | resolved | rows | events `ui_page_state_exited` then `ui_page_state_entered` |
| `loading` | `empty` | resolved | zero rows | event |
| `loading` | `error` | failed | timeout | event |
| `loading` | `partial` | panels | one pending | event |
| `partial` | `ready` | all resolve | no pending | event |
| `partial` | `error` | fatal | no safe panel | event |
| `partial` | `loading` | Direct transition is not permitted | — | route |
| `ready` | `loading` | refetch | invalidated | route |
| `empty` | `loading` | action | request | route |
| `error` | `loading` | retry | allowed | route |

| `page_state_transition_matrix_completeness` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/page_state_transition_matrix_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
