### 47.3.1 Full-Scope Capability Contracts {#47.3.1-full-scope-capability-contracts}

#### 47.3.1.D RequirementRelation {#47.3.1.d-requirementrelation}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `workspace_id` | UUID | FK -> Workspace | Same Workspace for both endpoints |
| `source_requirement_id` | UUID | FK -> Requirement | Child or blocked requirement depending on relation kind |
| `target_requirement_id` | UUID | FK -> Requirement | Parent or blocker |
| `relation_kind` | Enum (Appendix J `requirement_relation_kind`) | Required | `parent_child`, `blocks`, `relates_to`, `duplicates`, `supersedes` |

**Rules.** Relations are same-Workspace only, acyclic for `parent_child`, and cannot point to deleted Requirements. Phase advancement fails with HTTP 409 `requirement_blocker_unresolved` when an active `blocks` relation targets an unresolved blocking requirement required by the gate.

### 47.3.2 APIs, Events, Errors, and Gates {#47.3.2-apis-events-errors-and-gates}

| Surface | Required registrations |
|---|---|
| Requirement relations | Appendix I: `requirement_relation_cycle_detected`, `requirement_blocker_unresolved`; Appendix G: `requirement_relation_changed`; §M.5: `requirement_relation_same_workspace_guard`. |

### 47.3.3 Acceptance Criteria {#47.3.3-production-capability-acceptance-criteria}

5. Requirement hierarchy and blocker relations MUST be same-Workspace, acyclic where hierarchical, and enforce phase gates for unresolved blockers.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
|---|---|---|
| `requirement_relation_changed` | RequirementRelation created, resolved, archived, or restored | `workspace_id`, `requirement_relation_id`, `relation_kind`, `same_workspace_validated=true`, `cycle_check_passed=true` |

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

| Code | HTTP | Surface | Meaning | Retry | Localization |
|---|---|---|---|---|---|
| `requirement_relation_cycle_detected` | 422 | §47.3 launch-contract endpoint families | Relation would create a cycle. | `permanent` | `error.requirement.requirement_relation_cycle_detected` |
| `requirement_blocker_unresolved` | 409 | §47.3 launch-contract endpoint families | Phase advancement blocked by an unresolved active Requirement blocker. | `permanent` | `error.requirement.requirement_blocker_unresolved` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `requirement_relation_kind`

`parent_child`, `blocks`, `relates_to`, `duplicates`, `supersedes`

#### M.5.69 v7.1.1 Full-Scope Capability Remediation addition (2026-07-07) {#m-5-69-v711-full-scope-capability-remediation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `requirement_relation_same_workspace_guard` | data_integrity_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/requirement_relation_same_workspace_guard.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §47.3 RequirementRelation same-Workspace / acyclic / blocker contract only; product relation write validators, phase-advancement enforcement, and runtime tests remain product-pack evidence) | pr_lint | Appendix G `requirement_relation_changed` row registered; phase advancement MUST reject unresolved `blocks` relations | M02.3 |
