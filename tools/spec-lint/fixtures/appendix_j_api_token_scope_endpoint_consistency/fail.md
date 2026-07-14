# Fixture

## 32 API {#32-api}

| Method | Path | Auth Scope | Rate-Limit Class |
|---|---|---|---|
| GET | `/v1/workspaces` | `read:workspaces` | `workspace_read` |
| GET | `/v1/marketplace` | `marketplace_read` | `marketplace_read` |
| POST | `/v1/old-bids` | `bidding:write` | `data_mutation` |

**Auth Scope.** `write:intelligence`.

Active bad prose uses `analytics:read`.

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### API Token Scopes

`read:workspaces`, `write:intelligence`, `read:billing`

**`api_token_scope` canonical enum.**

`read:workspaces`, `read:billing`.

## Appendix M: Surface and Gate Registry {#appendix-m-surface-and-gate-registry}

| Gate | Runtime status | Assertion |
|---|---|---|
| `appendix_j_api_token_scope_endpoint_consistency` | `runtime_active` | Every endpoint-declared `scope` MUST be a member of the canonical 2-value Appendix J `api_token_scope` enum. |
