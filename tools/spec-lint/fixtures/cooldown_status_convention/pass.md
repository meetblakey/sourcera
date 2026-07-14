# Fixture

## Appendix I: API Error Code Catalog {#appendix-i-api-error-code-catalog}

### v7.2.0-REM Phase 6 Additions (2026-06-14) — §25 Console Bridge + §27 Marketplace Error Codes {#appendix-i-v72rem-phase-6}

| Code | HTTP | Retryable | Meaning |
|---|---|---|---|
| `direct_invite_prior_decline_cooldown` | 429 | `transient` | Buyer declined inside the cooldown window; `Retry-After` set. |
| `featured_placement_seller_cadence_exceeded` | 429 | `transient` | Seller cadence cap; `Retry-After` set. |

Active reference: `direct_invite_prior_decline_cooldown` (HTTP 429 with `Retry-After`).
Historical alias note: `m6_claim_reclaim_cooldown_active` used HTTP 409 pre-V8.4; migrated 409 -> 429.

## Appendix J: Controlled Vocabulary Registry {#appendix-j-controlled-vocabulary-registry}

