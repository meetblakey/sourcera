# Fixture

## 34.1 Plan Tier Definitions (Authoritative) {#34.1-plan-tier-definitions-(authoritative)}

| Feature | Free | Seller Solo | Seller Starter | Seller Growth | Seller Scale | Seller Enterprise | Source |
|---|---|---|---|---|---|---|
| **KB Bootstrap (Opus)** | 1 lifetime (M1 promise) | 1/year re-bootstrap | 1/year re-bootstrap | 3/year re-bootstrap | Unlimited | Unlimited | SPS §3 |

### 34.14.4 Free Allowance Overrides {#34.14.4-free-allowance-overrides}

Annual re-bootstrap allowances exist.

## Seller Pricing §21

| KB Bootstrap on Solo | — | 1 lifetime + 1/yr re-bootstrap (between Free's lifetime-only and Starter's 1/yr cap) |

## M.5

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `seller_kb_bootstrap_entitlement_singleton` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Fixture assertion. | `not_permitted_entitlement_drift` | runbook | M02.3 |
