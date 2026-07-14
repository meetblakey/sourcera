### 48.2.2 L1: Vendor-Invite-Creates-Account {#48.2.2-l1-vendor-invite-creates-account}

`growth_loop_l1_kb_seed_failed` fires when the linked AIOperation receives the §21.4.5 `kb_bootstrap` rejected signal. The row transitions with `lifecycle_state=decayed` and `lifecycle_state_reason=quality_floor_failed`; `loop_outcome_value_usd` remains null. The callback MUST NOT write `growth_loop_l1_kb_seeded` and carries `bootstrap_ai_operation_id`.

### 48.2.12 GrowthLoopExecution Entity {#48.2.12-growthloopexecution-entity}

| From | To | Trigger | Conditions |
| :---- | :---- | :---- | :---- |
| `in_progress` | `decayed` | `growth_loop_l1_kb_seed_failed` | `quality_floor_failed` |

### 51.1.5 Event Catalog Cross-Reference (→ Appendix G) {#51.1.5-event-catalog-cross-reference-appendix-g}

| Playbook | Events |
| :---- | :---- |
| Forced-Vendor-Signup Playbook | `growth_loop_l1_kb_seed_failed` |

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `growth_loop_l1_kb_seed_failed` | Bootstrap rejection | `growth_loop_execution_id`, `bootstrap_ai_operation_id`, `approval_ratio` |

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `l1_kb_seed_rejection_contract` | content_consistency | **`runtime_active`** (detector `tools/spec-lint/gates/l1_kb_seed_rejection_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | L1 rejection contract. | M02.3 |
