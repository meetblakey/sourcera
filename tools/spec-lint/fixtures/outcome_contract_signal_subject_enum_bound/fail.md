# Fixture

### 4.8.4 OutcomeContract {#4.8.4-outcomecontract}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `signal_subject_entity_kinds` | Array[Enum] | Non-empty subset of Appendix J `outcome_contract_signal_subject_entity_kind` | Downstream entity classes the resolver may watch: `bid_response`, `requirement_response`, `kb_entry`, `capability_declaration`, `document_attachment`, `selection_report_draft`, `unknown_subject`. The contract rule MUST reference only kinds required by that capability's accepted/rejected signals. |

Every `signal_subject_entity_kinds` value MUST resolve to Appendix J `outcome_contract_signal_subject_entity_kind`; unknown, empty, or rule-unreferenced kinds MUST reject publication with HTTP 422 `outcome_contract_signal_subject_kind_invalid`.

### Outcome Contract Signal Subject Entity Kind (§4.8.4)

`bid_response`, `requirement_response`, `kb_entry`, `capability_declaration`, `document_attachment`, `selection_report_draft`

### Appendix I OutcomeContract errors

| Code | HTTP | Meaning |
| :---- | :---- | :---- |
| `outcome_contract_signal_subject_kind_invalid` | 422 | Empty, unknown, or rule-unreferenced subject kind. |

### M.5 catalog

| gate_id | row_class | runtime_status | execution_context | assertion | pack |
| :---- | :---- | :---- | :---- | :---- | :---- |
| `outcome_contract_signal_subject_enum_bound` | deploy_validator | `spec_binding_pending_pack_m02_3` | pr_lint + deploy_validator | Local guard `tools/spec-lint/gates/outcome_contract_signal_subject_enum_bound.ts` and pass/fail fixtures are present; deployed OutcomeContract publisher validation remains required. | M02.3 |
