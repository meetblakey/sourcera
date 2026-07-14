# Fixture

### 4.2.6 ApiToken (Org-Scoped) {#4.2.6-apitoken}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `console_scope` | Enum | Appendix J `api_token_console_scope`; required; immutable after create | `buyer`, `seller`, or `both` per §6.6.3 |

`console_scope` is enforced before the endpoint-specific `api_token_scope` check. A token whose `console_scope` does not admit the endpoint console rejects with HTTP 403 `console_isolation_violation`; QA test `api_token_console_scope_precedes_endpoint_scope` asserts.

## 6.6 API Token Authentication {#6.6-api-token-authentication}

### 6.6.3 Token Permissions & Scoping

Every token carries a console_scope ∈ {buyer, seller, both} per Appendix J Phase-3V `api_token_console_scope` enum. Set at creation; immutable. Tokens with `console_scope = buyer` calling seller-side endpoints return HTTP 403 `console_isolation_violation`. Tokens with `console_scope = both` are usable on either console subject to the §32 endpoint's `scope` requirement. Effective permissions include the `console_scope` axis.

## 10.16 Phase Advancement API {#10.16-phase-advancement-api}

```
POST /v1/workspaces/{workspace_id}/advance
X-Sourcera-Console: buyer
```

The request MUST include `X-Sourcera-Console: buyer`; missing or contradictory console headers fail closed before mutation.

## 32.2 Authentication & Rate Limit Headers {#32.2-authentication-and-rate-limit-headers}

### 32.2.1 Console-Scope Disambiguation Header {#32.2.1-console-scope-disambiguation-header}

`X-Sourcera-Console` is the canonical request header.

| Header | Direction | Values | Required when | Failure |
|---|---|---|---|---|
| `X-Sourcera-Console` | Request | `buyer`, `seller` | REQUIRED when the bearer token's §4.2.6 ApiToken.`console_scope` is `both` | HTTP 403 `console_isolation_violation` when absent for a `both` token, not one of the two registered values, or mismatches the endpoint console. |

The server first resolves the bearer token and `console_scope` per §6.6.3, applies endpoint scope/RBAC, and consumes rate limits per §6.6.6 / §32.4.5. §10.16.1 `POST /v1/workspaces/{workspace_id}/advance` declares `X-Sourcera-Console: buyer`; seller-only endpoints use `seller`; a contradictory header still returns `console_isolation_violation`.

# Appendix J: Enumerations {#appendix-j-enumerations}

**`api_token_console_scope` enum.** `buyer`, `seller`, `both`. Set at API token creation time; immutable. Tokens with `console_scope = both` consume from every applicable registered rate-limit bucket per §32.4.5.
