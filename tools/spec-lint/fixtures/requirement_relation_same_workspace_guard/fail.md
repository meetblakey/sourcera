### 47.3.1 Full-Scope Capability Contracts {#47.3.1-full-scope-capability-contracts}

#### 47.3.1.D RequirementRelation {#47.3.1.d-requirementrelation}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `workspace_id` | UUID | FK -> Workspace | Any Workspace |

### 47.3.3 Acceptance Criteria {#47.3.3-production-capability-acceptance-criteria}

5. Relations are optional.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
|---|---|---|
| `requirement_relation_changed` | Changed | `workspace_id` |

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

| Code | HTTP | Surface | Meaning | Retry | Localization |
|---|---|---|---|---|---|
| `requirement_relation_cycle_detected` | 422 | §47.3 | Cycle. | `permanent` | `error.requirement.requirement_relation_cycle_detected` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `requirement_relation_kind`

`parent_child`

#### M.5.69 v7.1.1 Full-Scope Capability Remediation addition (2026-07-07) {#m-5-69-v711-full-scope-capability-remediation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `requirement_relation_same_workspace_guard` | data_integrity_invariant | spec_binding_pending_pack_m02_3 | pr_lint | RequirementRelation rows exist. | M02.3 |
