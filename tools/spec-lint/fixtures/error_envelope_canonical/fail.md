# Fixture

## 10 Evaluation Pipeline {#10-evaluation-pipeline}

```json
{
  "error_code": "gate_validation_failed",
  "failed_checks": ["requirements_approved"]
}
```

## 22 Seller Knowledge Base {#22-seller-knowledge-base}

Inline example: `{"error":{"type":"stale_attach_ref","message":"Expired.","retry_after_ms":0}}`.

## 31 Webhooks {#31-webhooks}

```json
{
  "error": "consumer_requires_approved_tag"
}
```

## 32 API {#32-api}

## 32.6 Error Handling {#32.6-error-handling}

```json
{
  "error": {
    "code": "not_registered",
    "message": "Missing details and request id."
  }
}
```

# Appendix I: Error Codes {#appendix-i-error-codes}

| Code | HTTP | Used By | Notes | Localization Key |
| :---- | :---- | :---- | :---- | :---- |
| `gate_validation_failed` | 422 | §10 / §32 | Gate failed. | `error.workflow.gate_validation_failed` |
