# Fixture

## 32 API {#32-api}

| Method | Path | Auth Scope | Rate-Limit Class |
|---|---|---|---|
| GET | `/v1/workspaces` | `read:workspaces` | `workspace_read` |
| POST | `/v1/intelligence/briefings` | `write:intelligence` | `ai_invocation` |
| GET | `/v1/billing` | `read:billing` | `billing_read` |

**Auth Scope.** `write:workspaces`.
**Auth Scope.** None.

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

### API Token Scopes

`read:workspaces`, `write:workspaces`, `write:intelligence`, `read:billing`, `admin:ops_compliance`

**`api_token_scope` canonical enum.**

`read:workspaces`, `write:workspaces`, `write:intelligence`, `read:billing`, `admin:ops_compliance`.

## Appendix M: Surface and Gate Registry {#appendix-m-surface-and-gate-registry}

| Gate | Runtime status | Assertion |
|---|---|---|
| `appendix_j_api_token_scope_endpoint_consistency` | `runtime_active` | Every endpoint-declared `scope` MUST be a member of the canonical 5-value Appendix J `api_token_scope` enum. |
