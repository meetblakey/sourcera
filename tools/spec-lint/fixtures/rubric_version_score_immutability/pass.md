### 47.3.1 Full-Scope Capability Contracts {#47.3.1-full-scope-capability-contracts}

#### 47.3.1.C WorkspaceScoringRubricVersion {#47.3.1.c-workspacescoringrubricversion}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `version` | Integer | >= 1; unique per Workspace | Monotonic |
| `status` | Enum (Appendix J `rubric_version_status`) | Required | `draft`, `active`, `retired`, `locked` |
| `grade_scale_json` | JSONB | Required | FM/PM/DNM/EX plus any customer labels; values remain within §13.2 bounds |
| `pm_default_value` | Decimal | 0.1-0.9 | Snapshot value |

Score calculations persist the rubric version used so historical rankings do not drift.

### 47.3.2 APIs, Events, Errors, and Gates {#47.3.2-apis-events-errors-and-gates}

| Surface | Required registrations |
|---|---|
| Custom rubrics | Appendix I: `rubric_version_locked`, `rubric_activation_requires_approval`; Appendix G: `scoring_rubric_version_activated`; §M.5: `rubric_version_score_immutability`. |

### 47.3.3 Acceptance Criteria {#47.3.3-production-capability-acceptance-criteria}

4. Rubric versions MUST preserve historical scoring. Activating a new rubric cannot change an already-submitted ScoreGradeEntry or finalized Selection Record.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
|---|---|---|
| `scoring_rubric_version_activated` | WorkspaceScoringRubricVersion transitions to `active` | `workspace_id`, `rubric_version_id`, `prior_rubric_version_id`, `historical_scores_preserved=true` |

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

| Code | HTTP | Surface | Meaning | Retry | Localization |
|---|---|---|---|---|---|
| `rubric_version_locked` | 409 | §47.3 launch-contract endpoint families | Rubric version is locked and cannot mutate. | `permanent` | `error.scoring.rubric_version_locked` |
| `rubric_activation_requires_approval` | 403 | §47.3 launch-contract endpoint families | Rubric activation requires approval. | `permanent` | `error.scoring.rubric_activation_requires_approval` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `rubric_version_status`

`draft`, `active`, `retired`, `locked`

#### M.5.69 v7.1.1 Full-Scope Capability Remediation addition (2026-07-07) {#m-5-69-v711-full-scope-capability-remediation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `rubric_version_score_immutability` | data_integrity_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/rubric_version_score_immutability.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §47.3 WorkspaceScoringRubricVersion immutability contract only; product rubric activation transactions, score persistence, and runtime tests remain product-pack evidence) | pr_lint | Appendix G `scoring_rubric_version_activated` row registered; historical ScoreGradeEntry / SelectionRecord calculations unchanged | M02.3 |
