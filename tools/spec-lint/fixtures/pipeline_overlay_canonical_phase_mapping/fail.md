### 47.3.1 Full-Scope Capability Contracts {#47.3.1-full-scope-capability-contracts}

#### 47.3.1.E WorkspacePipelinePhaseOverlay {#47.3.1.e-workspacepipelinephaseoverlay}

Custom phases fork the engine.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `canonical_phase_span` | Array | Optional | Can be empty |

### 47.3.3 Acceptance Criteria {#47.3.3-production-capability-acceptance-criteria}

6. Custom pipeline overlays are flexible.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
|---|---|---|
| `pipeline_overlay_activated` | Active | `workspace_id` |

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

| Code | HTTP | Surface | Meaning | Retry | Localization |
|---|---|---|---|---|---|
| `pipeline_overlay_invalid_phase_span` | 422 | §47.3 | Invalid. | `permanent` | `error.pipeline.pipeline_overlay_invalid_phase_span` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `pipeline_overlay_status`

`draft`, `active`

#### M.5.69 v7.1.1 Full-Scope Capability Remediation addition (2026-07-07) {#m-5-69-v711-full-scope-capability-remediation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pipeline_overlay_canonical_phase_mapping` | state_machine_contract | spec_binding_pending_pack_m02_3 | pr_lint | Overlays exist. | M02.3 |
