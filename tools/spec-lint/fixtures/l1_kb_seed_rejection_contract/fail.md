### 48.2.2 L1: Vendor-Invite-Creates-Account {#48.2.2-l1-vendor-invite-creates-account}

`growth_loop_l1_kb_seeded` is the only bootstrap outcome.

### 48.2.12 GrowthLoopExecution Entity {#48.2.12-growthloopexecution-entity}

| From | To | Trigger | Conditions |
| :---- | :---- | :---- | :---- |
| `in_progress` | `converted` | Bootstrap accepted | Accepted |

### 51.1.5 Event Catalog Cross-Reference (→ Appendix G) {#51.1.5-event-catalog-cross-reference-appendix-g}

| Playbook | Events |
| :---- | :---- |
| Forced-Vendor-Signup Playbook | `growth_loop_l1_kb_seeded` |

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `growth_loop_l1_kb_seeded` | Bootstrap acceptance | `growth_loop_execution_id` |

## Appendix M

| Gate ID | Row class | Runtime status | Execution context | Assertion | Pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `l1_kb_seed_rejection_contract` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | incomplete | M02.3 |
