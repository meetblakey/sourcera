# Fixture

## 10 Evaluation Pipeline {#10-evaluation-pipeline}

```json
{
  "error": {
    "code": "gate_validation_failed",
    "message": "Cannot advance.",
    "details": {
      "failed_checks": ["requirements_approved"]
    },
    "request_id": "req_123"
  }
}
```

## 22 Seller Knowledge Base {#22-seller-knowledge-base}

Inline example: `{"error":{"code":"stale_attach_ref","message":"Expired.","details":{"attach_ref":"expired"},"request_id":"req_123"}}`.

## 31 Webhooks {#31-webhooks}

No error example here.

## 32 API {#32-api}

## 32.6 Error Handling {#32.6-error-handling}

```json
{
  "error": {
    "code": "gate_validation_failed",
    "message": "Cannot advance.",
    "localization_key": "error.workflow.gate_validation_failed",
    "details": {
      "failed_checks": ["requirements_approved"]
    },
    "request_id": "req_123",
    "retry_after_seconds": null
  }
}
```

# Appendix I: Error Codes {#appendix-i-error-codes}

| Code | HTTP | Used By | Notes | Localization Key |
| :---- | :---- | :---- | :---- | :---- |
| `gate_validation_failed` | 422 | §10 / §32 | Gate failed. | `error.workflow.gate_validation_failed` |
| `stale_attach_ref` | 409 | §22 | Attach ref expired. | `error.platform.stale_attach_ref` |
