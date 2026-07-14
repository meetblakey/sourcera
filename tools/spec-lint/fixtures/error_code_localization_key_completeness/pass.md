# Fixture

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

### Standard HTTP Errors

| Code | HTTP | Used By | Meaning | Localization Key |
| :---- | :---- | :---- | :---- | :---- |
| `unauthorized` | 401 | All §32 API endpoints | Missing token | `error.platform.unauthorized` |

### Endpoint Errors

| Error Code | HTTP | Endpoint | Notes | Localization key |
| :---- | :---- | :---- | :---- | :---- |
| `workspace_not_found` | 404 | GET `/v1/workspaces/{workspace_id}` | Non-leak read miss. | `error.workspace.workspace_not_found` |

## Appendix J: Enumerations

Placeholder.
