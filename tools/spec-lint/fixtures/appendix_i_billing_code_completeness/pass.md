# Fixture

### 4.8.1 AIOperation

Other reasons rejected with HTTP 422 `ai_operation_emergency_reversal_reason_invalid`.

### 4.8.2 CapabilityRegistryEntry

Concurrent Ops writes MUST be rejected with HTTP 409 `capability_registry_concurrent_modification`.

### Pre-existing Billing Domain Codes

| Code | HTTP | Used By | Retryable | Description | Localization Key |
|---|---:|---|---|---|---|
| `ai_operation_emergency_reversal_reason_invalid` | 422 | Ops emergency reversal path | `permanent` | Invalid emergency reversal reason. | `error.billing.ai_operation_emergency_reversal_reason_invalid` |
| `capability_registry_concurrent_modification` | 409 | CapabilityRegistryEntry mutation | `idempotent_retry_only` | Concurrent write. | `error.billing.capability_registry_concurrent_modification` |
