| Surface | Owner | Label | Visibility | Notes |
| :---- | :---- | :---- | :---- | :---- |
| **Scenarios & TCO (§14, §15)** | | | | |
| Scenario List | §14.2 / §32.10.3.E | Scenarios | All Buyer tiers | Buyer-console only; parent Workspace residency. Conformance posture: inherits_§37.1. |
| Scenario Detail / Form | §14.2 / §14.3 | Form | All Buyer tiers | report-inclusion controls remain hidden on Buyer Free / Buyer Solo / Business Starter. Conformance posture: inherits_§37.1. |
| Scenario Comparison Matrix | §14.5 | Matrix | All Buyer tiers | Conformance posture: inherits_§37.1. |
| Scenario Sensitivity Chart | §14.5.3 / §14.10.2 | Chart | All Buyer tiers | Persisted sensitivity may invoke `scenario_modeling`; preview-only remains session-local. Conformance posture: inherits_§37.1. |
| Simulation Mode Overlay | §14.7 | Simulate | All Buyer tiers | Volatile until saved; saved output flows through Scenario create/update. Conformance posture: inherits_§37.1. |
| Original Scoring Implicit Scenario | §14.6.1 / §14.6.4 | Baseline | All Buyer tiers | Derived and immutable; delete returns `scenario_original_delete_forbidden`. Conformance posture: inherits_§37.1. |
| Scenario CSV Export | §14.5.2 / §32.10.3.E | Export | All Buyer tiers | Deterministic export; no AIOperation; no seller-console data. Conformance posture: inherits_§37.1. |
| Scenario Phase-12 Lock | §14.6.4 | Locked | All Buyer tiers | mutation requests return `scenario_phase_locked`. Conformance posture: inherits_§37.1. |

| `scenario_modeling_appendix_m_surface_coverage` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/scenario_modeling_appendix_m_surface_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | contract | M02.3 |
