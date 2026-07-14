### 47.3.1 Full-Scope Capability Contracts {#47.3.1-full-scope-capability-contracts}

#### 47.3.1.E WorkspacePipelinePhaseOverlay {#47.3.1.e-workspacepipelinephaseoverlay}

Custom pipeline phases are overlays, not engine forks. The canonical 13-phase Sourcera Method remains the state machine.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `canonical_phase_span` | Array[Enum] | Non-empty; Appendix J `pipeline_phase` | Mapped canonical phases |
| `gate_checklist_json` | JSONB | Nullable | Customer checklist items; cannot bypass canonical gates |
| `status` | Enum (Appendix J `pipeline_overlay_status`) | Required | `draft`, `active`, `retired` |

**Conflict resolution.** custom phase labels and gates are supported when they map to the canonical engine; custom engine phases are still prohibited.

### 47.3.2 APIs, Events, Errors, and Gates {#47.3.2-apis-events-errors-and-gates}

| Surface | Required registrations |
|---|---|
| Pipeline overlays | Appendix I: `pipeline_overlay_invalid_phase_span`, `pipeline_overlay_canonical_gate_bypass`; Appendix G: `pipeline_overlay_activated`; §M.5: `pipeline_overlay_canonical_phase_mapping`. |

### 47.3.3 Acceptance Criteria {#47.3.3-production-capability-acceptance-criteria}

6. Custom pipeline overlays MUST map to canonical `pipeline_phase` values and MUST NOT bypass canonical §10 phase gates.

## Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

| Event | Trigger | Key Properties |
|---|---|---|
| `pipeline_overlay_activated` | WorkspacePipelinePhaseOverlay transitions to `active` | `workspace_id`, `pipeline_overlay_id`, `canonical_phase_span[]`, `canonical_gate_bypass_blocked=true` |

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

| Code | HTTP | Surface | Meaning | Retry | Localization |
|---|---|---|---|---|---|
| `pipeline_overlay_invalid_phase_span` | 422 | §47.3 launch-contract endpoint families | Overlay references no canonical phase. | `permanent` | `error.pipeline.pipeline_overlay_invalid_phase_span` |
| `pipeline_overlay_canonical_gate_bypass` | 403 | §47.3 launch-contract endpoint families | Overlay attempted to bypass a canonical §10 phase gate. | `permanent` | `error.pipeline.pipeline_overlay_canonical_gate_bypass` |

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

#### `pipeline_overlay_status`

`draft`, `active`, `retired`

**`pipeline_phase` canonical 13-value enum.** `phase_1_stakeholder_alignment`, `phase_13_contract_closure`.

#### M.5.69 v7.1.1 Full-Scope Capability Remediation addition (2026-07-07) {#m-5-69-v711-full-scope-capability-remediation-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `pipeline_overlay_canonical_phase_mapping` | state_machine_contract | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/pipeline_overlay_canonical_phase_mapping.ts`; verified PASS on live Master Spec and pass/fail fixtures; scope boundary: spec-tree §47.3 WorkspacePipelinePhaseOverlay canonical-mapping contract only; product overlay validators, phase-engine enforcement, and runtime tests remain product-pack evidence) | pr_lint | Appendix G `pipeline_overlay_activated` row registered; MUST NOT bypass canonical §10 gates | M02.3 |
