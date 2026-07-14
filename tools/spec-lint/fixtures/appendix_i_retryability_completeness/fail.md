# Fixture

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

### v7.2.0-REM Phase 6 Additions (2026-06-14) — §25 Console Bridge + §27 Marketplace Error Codes {#appendix-i-v72rem-phase-6}

| Code | HTTP | Meaning |
|---|---|---|
| `console_bridge_event_cross_org_access` | 404 | Cross-Org access; existence not leaked. |

| Code | HTTP | Retryable | Meaning |
|---|---|---|---|
| `match_score_feedback_rate_limit_exceeded` | 429 | Yes, after Retry-After | Rate limit; honor Retry-After. |

- `heat_map_cell_vendor_identity_field_forbidden` — HTTP 422; validation failure. Used by: §4.4.16. Localization key: `error.firewall.heat_map_cell_vendor_identity_field_forbidden`.

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}
