# Cost Base Publish Gate Fixture

### 4.8.6 CostBaseRecalculationLog (Platform-Scoped, Nightly Audit Record) {#4.8.6-costbaserecalculationlog}

**Acceptance Criteria.**

2. `drift_severity ∈ {alert_10_25, critical_gt_25}` MUST require explicit `ops_finance_admin` approval before publication. This AC is the canonical publish-gating rule; the prior row is retired and reconciled to cite this AC's enum membership ("`drift_severity ∈ {alert_10_25, critical_gt_25}` blocks auto-publish; ≥10% drift requires Finance approval"). Deploy-time validator `cost_base_publish_gate_threshold_single_source` (Appendix M.5) asserts no inline 25% threshold remains in §34 / §4.8.x bodies.

### 34.3.3 Cost-Base Recalculation (Operational Policy Layer)

**Authoritative publish-gating rule.** A cost-base recalc that produces `drift_severity ∈ {normal, warning_5_10}` AND `margin_floor_breach=false` **auto-publishes** a new `PricingTableVersion` (§4.8.9) within 60 seconds of recalc completion. A recalc that produces `drift_severity ∈ {alert_10_25, critical_gt_25}` OR `margin_floor_breach=true` **does NOT auto-publish**; the recalc enters `pending_finance_approval`. Concretely: a 12% drift on `policy_parsing` enters `pending_finance_approval` and blocks auto-publish until Ops Finance approves. The gate is evaluated against the §4.8.6 enum — never against an inline 25% threshold.

## Appendix K Glossary {#appendix-k-glossary}

**Drift Severity.** The categorical magnitude of the per-capability cost_base change observed by the nightly recalc job: `normal` (≤5%), `warning_5_10` (5–10%), `alert_10_25` (10–25%), `critical_gt_25` (>25%). Drives auto-apply vs explicit Ops Finance approval routing per §4.8.6 AC #2 and §34.3.3.

### M.5.4 Catalog index {#appendix-m5-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Assertion | Enforcement | Authority |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `cost_base_publish_gate_threshold_single_source` | V11 (D-11.3-002 remediation) | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/cost_base_publish_gate_threshold_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | §4.8.6 AC #2, §34.3.3 Cost-Base Recalculation publish-gating policy, Appendix K Drift Severity, and Master Spec post-edit grep. | Every cost-base publish-gate reference MUST resolve to the §4.8.6 enum-membership contract: `drift_severity ∈ {alert_10_25, critical_gt_25}` OR `margin_floor_breach=true` blocks auto-publish and requires explicit Ops Finance approval; stale single-threshold "≥25% auto-publish block" logic, §34.18 authority routing, or inline 25%-only trigger text fails. | PR comment naming the stale threshold, broken authority pointer, or inline drift; merge blocked. Override path: `not_permitted_billing_singleton` (binding cost-base publish-gate revenue-leakage invariant). Runbook: `runbooks.sourcera.com/ci-gates/cost_base_publish_gate_threshold_single_source`. | §4.8.6 AC #2; §34.3.3 Authoritative publish-gating rule; Appendix K Drift Severity. |
