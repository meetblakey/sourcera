# Fixture

## 34.1 Plan Tier Definitions (Authoritative) {#34.1-plan-tier-definitions-(authoritative)}

| Feature | Free | Buyer Solo | Source |
|---|---|---|
| **Per-evaluation pricing alternative** | — | $199 / completed evaluation (charged on Selection Report PDF export; 7-day refund window with < 3-open automated check; 90-day read-only retention; mid-eval subscription conversion crediting per §34.2.5) | BPS §5.1, §5.4 |

### 34.2.5 Solo-Tier Per-Evaluation / Per-Bid Charge Orchestration (Authoritative) {#34.2.5-solo-tier-per-evaluation-per-bid-charge-orchestration}

| Aspect | Value | Source |
|---|---|---|
| Refund eligibility check | Selection Report PDF MUST have been opened < 3 times | BPS §5.4 |
| At 3+ opens | Refund is operator-judgment | BPS §5.4 |

3. The 7-day refund window with < 3-open automated check MUST be evaluated automatically at refund-request time.

## Appendix M.1

| Solo per-evaluation charge orchestration (Buyer Solo charge on Selection Report PDF export) | §34.2.5 | Refund CTA available within 7 days if PDF opened < 3 times. | Buyer Solo |

## BPS §5.4

Refund window. 7-day refund window from charge, no questions asked, provided the Selection Report PDF has not been opened ≥3 times. After 3 opens, refund is judgment-call.

## AE Ledger

AE-V72REM-PHPT-PRICING-SINGLETON-01 confirms < 3-open and 3+ operator-judgment semantics.

## M.5

| Gate | Class | Runtime status | Execution context | Assertion | Override path | Runbook | Pack |
|---|---|---|---|---|---|---|---|
| `solo_per_eval_refund_open_threshold_singleton` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-08; detector `tools/spec-lint/gates/solo_per_eval_refund_open_threshold_singleton.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint + deploy_validator | Fixture assertion. | `not_permitted_refund_threshold_drift` | runbook | M02.3 |
