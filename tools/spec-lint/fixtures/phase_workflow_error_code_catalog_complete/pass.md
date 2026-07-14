# Fixture

## 2 Method {#2-method}

Team-mode soft-gate skips return HTTP 422 `phase_advancement_soft_gates_not_permitted_in_team_mode`.
Solo-mode skips emit Audit Event `phase_advanced_with_unmet_gates`; that event is not an HTTP error code.

## 10 Evaluation Pipeline {#10-evaluation-pipeline}

Score mutation after Phase 12 returns `scores_immutable_phase_12_plus`.
Hard-gate failure returns `gate_validation_failed`.

```json
{
  "error": {
    "code": "pipeline_phase_invalid_enum_value",
    "message": "Invalid phase.",
    "details": {},
    "request_id": "req_123"
  }
}
```

## 32 API {#32-api}

The Phase Advancement endpoint can return `phase_advancement_dependency_unavailable`.

# Appendix I: Error Codes {#appendix-i-error-codes}

### Phase & Workflow Errors

| Code | HTTP | Used By | Meaning | Localization Key |
| :---- | :---- | --- | :---- | --- |
| `scores_immutable_phase_12_plus` | 409 | §10 / §32.5 workspace workflow endpoints | Score mutation attempted after Phase 12. | `error.workflow.scores_immutable_phase_12_plus` |
| `pipeline_phase_invalid_enum_value` | 400 | §10 / §32.5 workspace workflow endpoints | Target phase is invalid. | `error.workflow.pipeline_phase_invalid_enum_value` |
| `gate_validation_failed` | 422 | §10 / §32.5 workspace workflow endpoints | Gate validation failed. | `error.workflow.gate_validation_failed` |
| `phase_advancement_soft_gates_not_permitted_in_team_mode` | 422 | §10 / §32.5 workspace workflow endpoints | Soft gates are solo-only. | `error.workflow.phase_advancement_soft_gates_not_permitted_in_team_mode` |
| `phase_advancement_dependency_unavailable` | 503 | §10 / §32.5 workspace workflow endpoints | Required dependency unavailable. | `error.workflow.phase_advancement_dependency_unavailable` |
