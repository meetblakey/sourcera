# Fixture

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

### Standard HTTP Errors

| Code | HTTP | Meaning | Used By |
| :---- | :---- | :---- | :---- |
| `unauthorized` | 401 | Missing token | All authenticated endpoints |

### API Detail Pack Errors

| Error Code | HTTP | Endpoint | Notes |
| :---- | :---- | :---- | :---- |
| `workspace_not_found` | 404 | GET `/v1/workspaces/{workspace_id}` | Non-leak read miss. |

### Internal Integrity Events (Non-HTTP)

| Code | Shape | Notes |
| :---- | :---- | :---- |
| `audit_chain_break_detected` | Internal event | Not an API response. |

## Appendix J: Enumerations

Placeholder.
