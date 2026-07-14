### 47.3.1 Full-Scope Capability Contracts {#47.3.1-full-scope-capability-contracts}

#### 47.3.1.C WorkspaceScoringRubricVersion {#47.3.1.c-workspacescoringrubricversion}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `version` | Integer | >= 1 | Mutable |

### 47.3.3 Acceptance Criteria {#47.3.3-production-capability-acceptance-criteria}

4. Rubrics can change.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
|---|---|---|
| `scoring_rubric_version_activated` | Activated | `workspace_id` |

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

| Code | HTTP | Surface | Meaning | Retry | Localization |
|---|---|---|---|---|---|
| `rubric_version_locked` | 409 | §47.3 | Locked. | `permanent` | `error.scoring.rubric_version_locked` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `rubric_version_status`

`draft`, `active`

#### M.5.69 v7.1.1 Full-Scope Capability Remediation addition (2026-07-07) {#m-5-69-v711-full-scope-capability-remediation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `rubric_version_score_immutability` | data_integrity_invariant | spec_binding_pending_pack_m02_3 | pr_lint | Rubric rows exist. | M02.3 |
