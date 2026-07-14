# Cost Base Publish Gate Fixture

### 4.8.6 CostBaseRecalculationLog (Platform-Scoped, Nightly Audit Record) {#4.8.6-costbaserecalculationlog}

**Acceptance Criteria.**

2. A recalc greater than 25% requires Finance approval before publication.

### 34.3.3 Cost-Base Recalculation (Operational Policy Layer)

**Authoritative publish-gating rule.** A recalc auto-publishes unless the cost-base drift reaches ≥ 25% auto-publish block or margin-floor breach.

## Appendix K Glossary {#appendix-k-glossary}

**Drift Severity.** The categorical magnitude of the per-capability cost_base change observed by the nightly recalc job. Drives auto-apply vs explicit Ops Finance approval routing per Summary C.77.

### M.5.4 Catalog index {#appendix-m5-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Assertion | Enforcement | Authority |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `cost_base_publish_gate_threshold_single_source` | V11 (D-11.3-002 remediation) | `spec_binding_pending_pack_m02_3` | §34.18 cost-base publish-gate threshold cells (Buyer + Seller). | The publish-gate threshold value (cost-base publish trigger) MUST appear ONLY in §34.18 cost-base publish-gate authoritative cells. Inline restatement in §22 / §27 / §44 fails. | PR comment naming the duplicating section; merge blocked. Override path: `not_permitted_billing_singleton`. | §34.18 cost-base authoring; Master Spec lines 8688 / 29308 forward-references. |
