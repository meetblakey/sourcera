## 2.6 Cross-Departmental Alignment Patterns {#2.6-cross-departmental-alignment-patterns}

Their controlled values are Appendix J `stakeholder_cohort`; they are distinct from the WorkspaceMembership RBAC role. The engine uses this subsection's email-domain heuristics. Auto-assignment heuristics are advisory and never prevent invite acceptance.

§13.6.2 / §13.6.3 is authoritative. `Pending Vendor Clarification` is retired as a score-workflow state. The only resolution choices are Accept Average, an auditable Lead override, or Request Re-Evaluation. This section does not add a vendor follow-up task, a new API, a webhook, or a new persisted state field.

`score.disagreement_card_visible` or `score.disagreement_escalated`

## Appendix J — Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### Audit Event Action Type — Score Disagreement Resolution (§13.6.2 / §13.6.3)

`score.disagreement_card_visible`, `score.disagreement_escalated`

The actions are AuditEvent-only.

### Stakeholder Cohort (§2.6.1)

`exec_sponsor`, `evaluation_lead`, `functional_lead`, `technical_evaluator`, `sme_evaluator`

It is independent of `WorkspaceMembership.role` and does not grant RBAC permissions.

## Appendix L

### L.23 Score Disagreement Resolution State Machine {#l-23-score-disagreement-resolution-state-machine}

**Entity.** Derived Buyer `Score` resolution workflow; these labels are compendium labels, not a persisted enum or field. §13.6.2 / §13.6.3 owns the threshold keys, UI, decision choices, and payloads.

| From | To | Trigger | Conditions | Notes |
| :---- | :---- | :---- | :---- | :---- |
| `independent_scoring` | `card_visible` | Divergence evaluation | — | Emit `score.disagreement_card_visible` |
| `card_visible` | `lead_resolution` | Automatic escalation or Use Case Lead opens Review Disagreement | — | Automatic escalation emits `score.disagreement_escalated` |
| `lead_resolution` | `resolved` | Use Case Lead chooses Accept Average or Override to specific grade | — | — |
| `lead_resolution` | `reevaluation_requested` | Use Case Lead chooses Request Re-Evaluation | — | — |
| `reevaluation_requested` | `independent_scoring` | Re-evaluation starts | — | — |

`Pending Vendor Clarification` is not a Score state. This state machine introduces no API, webhook, new Score field, or cross-console projection.

Score retention, DSAR pseudonymization, and residency for this workflow remain §4.3.6 / §6.8 / §40.2 authority.

## Appendix M.5

| `score_disagreement_and_cohort_enum_contract` | spec_tree_lint | **`runtime_active`** (detector `tools/spec-lint/gates/score_disagreement_and_cohort_enum_contract.ts`; verified PASS on live Master Spec and pass/fail fixtures) |
