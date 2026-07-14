### 48.7.1 M14 Seller Bid Success Share {#48.7.1-m14-seller-bid-success-share}

#### Anti-Abuse Controls

3. **Velocity throttle:** Per-Seller-Org M14 publish entitlement and the Scale / Enterprise anti-abuse safety-net resolve exclusively from §34.1.2 row **Bid Success Shares (M14)**. §48.7.1 MUST NOT restate plan-tier caps or safety-net thresholds inline. The Scale / Enterprise "Unlimited" semantic remains intact at the plan-tier level; the safety-net is an Ops Security circuit-breaker, not a plan promise.

#### Plan Gating & Entitlement

*(V13 D-48-004 remediation 2026-05-12 — numerical caps cite §34.1.2 cited cells exclusively; no inline integer duplication.)*

| Seller plan tier enum | M14 Access | Source |
| :---- | :---- | :---- |
| `seller_starter` | Per canonical §34.1.2 entitlement cell | §34.1.2 row **Bid Success Shares (M14)** |
| `seller_growth` | Per canonical §34.1.2 entitlement cell | §34.1.2 row **Bid Success Shares (M14)** |
| `seller_scale` | Unlimited plan-tier promise; safety-net is anti-abuse only | §34.1.2 row **Bid Success Shares (M14)** |
| `seller_enterprise` | Unlimited plan-tier promise; safety-net is anti-abuse only | §34.1.2 row **Bid Success Shares (M14)** |

AI generation cost is `cost_center=platform_marketing` per §21.4.3. *(V13 D-48-004 amendment: numerical values single-sourced at §34.1.2; CI gate `m14_inline_plan_tier_numerical_singleton_purged` (§M.5 — new) asserts the §48.7.1 body carries no inline integer plan-tier caps.)*

#### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `m14_inline_plan_tier_numerical_singleton_purged` | content_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/m14_inline_plan_tier_numerical_singleton_purged.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | §48.7.1 carries no inline integer plan-tier caps; all M14 caps and safety-net thresholds cite §34.1.2 cells — closes D-48-004 sibling | M02.3 |
