# Fixture

### 34.2.5 Solo-Tier Per-Evaluation / Per-Bid Charge Orchestration (Authoritative) {#34.2.5-solo-tier-per-evaluation-per-bid-charge-orchestration}

| Aspect | Value | Source |
|---|---|---|
| Refund eligibility check | Selection Report PDF MUST have been opened <= 3 times | BPS §5.4 |

The third open remains automatically eligible for refund.

## BPS §5.4

Refund window. The Selection Report PDF may be opened ≤ 3 times and still qualify.

## M.5

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `solo_per_eval_refund_open_threshold_singleton` | numerical_singleton_invariant | spec_binding_pending_pack_m02_3 | pr_lint + deploy_validator | Fixture assertion. | `not_permitted_refund_threshold_drift` | runbook | M02.3 |
