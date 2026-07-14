# Fixture

### 4.2.6 ApiToken (Org-Scoped) {#4.2.6-apitoken}

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `console_scope` | Enum | local enum | buyer/seller/both |

## 6.6 API Token Authentication {#6.6-api-token-authentication}

Tokens may use both consoles.

## 10.16 Phase Advancement API {#10.16-phase-advancement-api}

```
POST /v1/workspaces/{workspace_id}/advance
X-Sourcera-Console: both
```

## 32.2 Authentication & Rate Limit Headers {#32.2-authentication-and-rate-limit-headers}

### 32.2.1 Console-Scope Disambiguation Header {#32.2.1-console-scope-disambiguation-header}

`X-Sourcera-Console` is a request header.

# Appendix J: Enumerations {#appendix-j-enumerations}

**`api_token_console_scope` enum.** buyer, seller, both.
