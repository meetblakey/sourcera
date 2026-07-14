## 3.8 Side Peek Dimensions & Behavior {#3.8-side-peek-dimensions-and-behavior}

Scoring Matrix (row → Score Detail / Scoring Card)

## 3.10 Bulk Action Toolbar {#3.10-bulk-action-toolbar}

Scoring Matrix (row-level only; Score Detail / Scoring Card opens through Side Peek per §3.8 and §38.6.2; cells are excluded)
| Scoring Matrix (row-level; cells excluded) | Reassign Reviewer, Lock Scores, Unlock Scores |

### 3.10.7 State Machine {#3.10.7-bulk-action-state-machine}

| From | To | Trigger | Conditions | Notes |
| `inactive` | `selecting` | row select | selected count > 0 | event |
| `selecting` | `selecting_all_in_filter` | Cmd+A | ≤ 10,000 | event |
| `dispatching` | `paused_network` | disconnect | chunks remain | idempotency_key |
| `dispatching` | `paused_rate_limit` | 429 | retry after | idempotency_key |
| `dispatching` | `partial_failure_segmented` | partial result | failures | event |
| `partial_failure_segmented` | `dispatching` | retry | permission passes | idempotency_key |

| `bulk_action_toolbar_scope_and_state_completeness` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/bulk_action_toolbar_scope_and_state_completeness.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
