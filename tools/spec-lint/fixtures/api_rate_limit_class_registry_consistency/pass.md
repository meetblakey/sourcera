# Fixture

## 32.4.5 Rate-Limit Class Registry {#32.4.5-rate-limit-class-registry}

| Class ID | Applies To | Scope | Soft Limit | Hard Limit | Burst / Concurrency | 429 Error | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `standard_authenticated_per_org` | Default authenticated API class | Org | 5,000 requests/hour | 10,000 requests/hour | 100 requests/minute | `rate_limit_exceeded` | Default. |
| `workspace_read` | Workspace reads | Org | Standard class limits | Standard class limits | Standard class burst | `rate_limit_exceeded` | Read class. |
| `data_mutation` | Workspace mutations | Org + Workspace | 60 requests/minute | 60 requests/minute hard | N/A | `rate_limited` | Write class. |

## 32.10 Fixture Endpoints

| Method | Path | Auth Scope | Rate-Limit Class | Purpose |
| :---- | :---- | :---- | :---- | :---- |
| `GET` | `/v1/workspaces` | `read:workspaces` | `workspace_read` | List Workspaces. |
| `POST` | `/v1/workspaces` | `write:workspaces` | `data_mutation` | Create Workspace. |

**Rate-limit class.** `standard_authenticated_per_org` per §32.4.5.

| Contract field | Value |
| :---- | :---- |
| Auth scope | `read:workspaces` |
| Rate-limit class | `workspace_read` |

## Appendix J: Controlled Vocabularies

### API Rate-Limit Classes

`standard_authenticated_per_org`, `workspace_read`, `data_mutation`
