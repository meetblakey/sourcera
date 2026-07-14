# Fixture

## 2 Method {#2-method}

Team-mode soft-gate skips return HTTP 422 `phase_advancement_soft_gates_not_permitted_in_team_mode`.

## 10 Evaluation Pipeline {#10-evaluation-pipeline}

Score mutation after Phase 12 returns `scores_immutable_phase_12_plus`.

```json
{
  "error": {
    "code": "gate_validation_failed",
    "message": "Cannot advance.",
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
| `scores_immutable_phase_12_plus` |  | §10 / §32.5 workspace workflow endpoints | Score mutation attempted after Phase 12. | `error.workflow.scores_immutable_phase_12_plus` |
| `gate_validation_failed` | 422 |  | Gate validation failed. | `error.workflow.gate_validation_failed` |
