# Fixture

## 5.10 Active Workspace Definition

**Definition.** An "Active Workspace" is one that meets BOTH criteria:

1. `Workspace.status` ∈ `{active}` per Appendix J `workspace_status` enum; MUST NOT be `draft`, `suspended`, `closed`, or `archived`.
2. `Workspace.pipeline_phase` ∈ `{phase_1_stakeholder_alignment, phase_2_requirement_definition, phase_3_use_case_validation, phase_4_vendor_discovery, phase_5_vendor_outreach, phase_6_vendor_bidding, phase_7_response_refinement, phase_8_due_diligence, phase_9_final_clarifications, phase_10_team_scoring, phase_11_score_review, phase_12_selection, phase_13_contract_closure}` per Appendix J `pipeline_phase`; integer storage in `pipeline_stage_id` MUST resolve through the Appendix J Pipeline Phase Integer ↔ Enum Mapping table. Pre-V3 prose used the integer comparison `pipeline_stage_id < 13` and the retired pre-V4 12-phase enum.

**Usage:** Used in reporting. CI gate `workspace_status_canonical_consumer` asserts every active-workspace predicate consumes the enum, not the integer ordinal.

**`workspace_status` enum.** `draft`, `active`, `suspended`, `closed`, `archived`. Used by §5.10 Active Workspace Definition. The pre-V3 §5.10 ordinal comparison `pipeline_stage_id < 13` is retired in favor of explicit enum membership; the §5.10 active-workspace predicate consumes the enum-membership rule `workspace_status = 'active' AND pipeline_phase ∈ {phase_1, ..., phase_13_contract_closure}` rather than the integer-range form. CI gate `workspace_status_canonical_consumer` consumes the 13-value enum membership; pre-V4 ordinal `pipeline_stage_id < 13` comparisons remain forbidden.

| Gate | Phase | Runtime status | Trigger scope | Assertion | Failure output | Authority anchor |
|---|---|---|---|---|---|---|
| `workspace_status_canonical_consumer` | 3V | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/workspace_status_canonical_consumer.ts`; verified PASS on live Master Spec and pass/fail fixtures) | Master Spec active-workspace predicate sections. | Active Workspace predicates consume `workspace_status` and 13-value `pipeline_phase`. | PR comment naming stale ordinal use. | §5.10 V3; Appendix J `pipeline_phase`; AE-3V-001. |
