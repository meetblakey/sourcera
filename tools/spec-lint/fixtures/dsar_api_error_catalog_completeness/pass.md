# DSAR API Error Catalog Completeness Pass Fixture

### 6.8.13 DSAR API Contract {#6.8.13-dsar-api-contract}

Errors: `dsar_subject_request_rate_limited` (429), `dsar_request_scope_forbidden` (404), `validation_error` (422), `idempotency_key_request_mismatch` (409).
Errors: `dsar_verification_failed` (401), `dsar_request_invalid_state_transition` (422), `dsar_request_not_found` (404).
Returns `dsar_request_export_not_ready` (409); returns `dsar_request_export_link_expired` (410).
Errors: `dsar_request_withdrawal_not_allowed` (409), `dsar_extension_not_allowed` (409), `dsar_org_admin_subject_notice_required` (422).

## Appendix I: Error Code Catalog

| Code | HTTP | Used By | Meaning | Localization Key |
| :---- | :---- | :---- | :---- | :---- |
| `validation_error` | 422 | All §32 write endpoints, including §6.8.13 DSAR endpoints | Validation failed. | `error.validation.validation_error` |
| `idempotency_key_request_mismatch` | 409 | All §32 state-mutating endpoints that require `Idempotency-Key`, including §6.8.13 DSAR endpoints | Replay body differed. | `error.platform.idempotency_key_request_mismatch` |
| `dsar_subject_request_rate_limited` | 429 | §6.8.13 DSAR endpoints | Rate-limited. | `error.privacy.dsar_subject_request_rate_limited` |
| `dsar_request_scope_forbidden` | 404 | §6.8.13 DSAR endpoints | Scope forbidden. | `error.privacy.dsar_request_scope_forbidden` |
| `dsar_verification_failed` | 401 | §6.8.13 DSAR endpoints | Verification failed. | `error.privacy.dsar_verification_failed` |
| `dsar_request_invalid_state_transition` | 422 | §6.8.13 DSAR endpoints | Invalid transition. | `error.privacy.dsar_request_invalid_state_transition` |
| `dsar_request_not_found` | 404 | §6.8.13 DSAR endpoints | Not found. | `error.entity.dsar_request_not_found` |
| `dsar_request_export_not_ready` | 409 | §6.8.13 DSAR endpoints | Export not ready. | `error.privacy.dsar_request_export_not_ready` |
| `dsar_request_export_link_expired` | 410 | §6.8.13 DSAR endpoints | Link expired. | `error.privacy.dsar_request_export_link_expired` |
| `dsar_request_withdrawal_not_allowed` | 409 | §6.8.13 DSAR endpoints | Withdrawal not allowed. | `error.privacy.dsar_request_withdrawal_not_allowed` |
| `dsar_extension_not_allowed` | 409 | §6.8.13 DSAR endpoints | Extension not allowed. | `error.privacy.dsar_extension_not_allowed` |
| `dsar_org_admin_subject_notice_required` | 422 | §6.8.13 DSAR endpoints | Subject notice proof required. | `error.privacy.dsar_org_admin_subject_notice_required` |
