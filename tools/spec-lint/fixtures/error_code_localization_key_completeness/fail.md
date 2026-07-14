# Fixture

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

### Missing Localization Column

| Code | HTTP | Used By | Meaning |
| :---- | :---- | :---- | :---- |
| `unauthorized` | 401 | All §32 API endpoints | Missing token |

### Blank Localization Value

| Code | HTTP | Used By | Meaning | Localization Key |
| :---- | :---- | :---- | :---- | :---- |
| `workspace_not_found` | 404 | GET `/v1/workspaces/{workspace_id}` | Missing workspace | — |

### Wrong Suffix

| Code | HTTP | Used By | Meaning | Localization Key |
| :---- | :---- | :---- | :---- | :---- |
| `bad_request` | 400 | All §32 API endpoints | Bad input | `error.platform.request_bad` |

## Appendix J: Enumerations

Placeholder.
