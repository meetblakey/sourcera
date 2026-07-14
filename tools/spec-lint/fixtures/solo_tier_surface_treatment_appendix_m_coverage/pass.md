# 44 Performance {#44-performance}

### 44.6.1 Surface Hide List {#44.6.1-surface-hide-list}

1. **AIWallet widget**
2. **Wallet-overage configuration UI**
3. **Wallet auto-topup configuration UI**
4. **Per-capability rate card**
5. **Per-AIOperation Billing Ledger row breakdown**
6. **FreeAllowanceCounter inline counter**
7. **AIWallet state badges**
8. **Contest CTA on per-AIOperation rows**
9. **Cost-base 30-day breaking-change banner**
10. **PostHog wallet-counter freshness diagnostics**

#### M.1 Master Surface/Engine Mapping Table {#m-1-master-surface-engine-mapping-table}

| Engine concept | Spec home | Surface metaphor | Tier visibility | Notes |
|---|---|---|---|---|
| Solo suppression - AIWallet widget (§44.6.1 #1) | §4.8.3 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - wallet-overage configuration (§44.6.1 #2) | §4.8.3 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - wallet auto-topup configuration (§44.6.1 #3) | §4.8.3 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - per-capability rate card (§44.6.1 #4) | §34.3.4 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - per-AIOperation billing-ledger breakdown (§44.6.1 #5) | §4.8.1 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - FreeAllowanceCounter inline counter (§44.6.1 #6) | §4.8.7 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - AIWallet state badges (§44.6.1 #7) | §4.8.3 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - per-AIOperation Contest CTA (§44.6.1 #8) | §34.11.2 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - cost-base breaking-change banner (§44.6.1 #9) | §34.3.3 | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |
| Solo suppression - wallet-counter freshness diagnostics (§44.6.1 #10) | Appendix G | Hidden on Solo. | Hidden on `buyer_solo` and `seller_solo` | Bound. |

#### M.5.60 v7.2.0-REM Phase 44 Performance / Solo P1 addition {#m-5-60-v72rem-phase-44-performance-solo-p1-addition}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `solo_tier_surface_treatment_appendix_m_coverage` | spec_tree_lint | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/solo_tier_surface_treatment_appendix_m_coverage.ts`; verified PASS on live Master Spec and pass/fail fixtures) | pr_lint | Coverage. | M02.3 |
