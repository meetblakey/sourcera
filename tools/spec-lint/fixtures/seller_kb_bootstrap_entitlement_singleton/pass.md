# Fixture

## 34.1 Plan Tier Definitions (Authoritative) {#34.1-plan-tier-definitions-(authoritative)}

| Feature | Free | Seller Solo | Seller Starter | Seller Growth | Seller Scale | Seller Enterprise | Source |
|---|---|---|---|---|---|---|
| **KB Bootstrap (Opus)** | 1 lifetime (M1 promise) | 1 lifetime + 1/year re-bootstrap | 1 lifetime + 1/year re-bootstrap | 1 lifetime + 3/year re-bootstrap | Unlimited | Unlimited | SPS §3 |

### 34.14.4 Free Allowance Overrides {#34.14.4-free-allowance-overrides}

1. **`kb_bootstrap`: 1 lifetime first-bootstrap grant per Seller Org; annual re-bootstrap cadence per §34.1.2.** Annual re-bootstrap allowances follow the §34.1.2 **KB Bootstrap (Opus)** cell (Seller Solo and Seller Starter: 1/year; Seller Growth: 3/year; Seller Scale/Enterprise: Unlimited). The lifetime grant is tracked in `FreeAllowanceCounter.scope_hint = "lifetime_per_org"`.

## Section 39

| KB Bootstrap Allowance (Seller) | KB Bootstrap (Opus) per Org (plan-gated) | Per §34.1.2 cell **KB Bootstrap (Opus)** | Source: §34.1.2 cell **KB Bootstrap (Opus)**. Lifetime + per-year cadence per §34.14.4. |

## Seller Pricing §3

| KB Bootstrap | 1 lifetime | 1 lifetime + **1/yr re-bootstrap** | 1 lifetime + 1/yr | 1 lifetime + 3/yr | Unlimited | Unlimited |

## Seller Pricing §4

- 1 lifetime KB Bootstrap

## Seller Pricing §21

| KB Bootstrap on Solo | — | 1 lifetime + 1/yr re-bootstrap (between Free's lifetime-only and Starter's lifetime + 1/yr cadence) |

## M.5

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `seller_kb_bootstrap_entitlement_singleton` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/seller_kb_bootstrap_entitlement_singleton.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint + deploy_validator | Fixture assertion. | `not_permitted_entitlement_drift` | runbook | M02.3 |
