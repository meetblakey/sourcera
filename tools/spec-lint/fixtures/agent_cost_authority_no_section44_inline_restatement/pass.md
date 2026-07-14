# 44 Performance {#44-performance}

## 44.2 Agent Performance Budgets {#44.2-agent-performance-budgets}

**Cost Authority.** Per-requirement list price, cost base, and value / cost prices are not authored in §44.2. The authoritative homes are CapabilityRegistryEntry (§4.8.2), CostBaseRecalculationLog (§4.8.6), the pricing formula (§34.3.1), and the rate-card surfaces (§34.3.4 / §34.14.1).

**AI Included-Budget Ceilings.** Per-tier AI included-budget ceilings are authoritative in §34.1 (plan tier definitions) and §34.10 (AI Wallet Service). Per-Org wallet behavior, overage, cap enforcement, and auto-topup semantics are authoritative in §34.10. §44.2 does not restate per-tier budget values; consumers MUST reference §34.1 and §34.10 for the authoritative AI-consumption budget limits.

#### M.5.60 v7.2.0-REM Phase 44 Performance / Solo P1 addition {#m-5-60-v72rem-phase-44-performance-solo-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `agent_cost_authority_no_section44_inline_restatement` | numerical_singleton_invariant | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/agent_cost_authority_no_section44_inline_restatement.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Authority. | M02.3 |
