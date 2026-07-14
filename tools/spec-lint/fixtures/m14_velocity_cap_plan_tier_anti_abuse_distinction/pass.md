### 34.1.2 Seller Plan Tiers {#34.1.2-seller-plan-tiers}

| Feature | Free | Seller Solo | Seller Starter | Seller Growth | Seller Scale | Seller Enterprise | Source |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Bid Success Shares (M14)** | -- | -- | 3/month | 10/month | Unlimited; anti-abuse safety-net 100 publishes / 30-day rolling window, Ops-configurable by `ops_security_admin`, not a plan-tier ceiling | Unlimited; anti-abuse safety-net 100 publishes / 30-day rolling window, Ops-configurable by `ops_security_admin`, not a plan-tier ceiling | §48.7.1; V13 D-48-004 singleton remediation; AE-V72REM-PH48-M14-PLAN-SINGLETON-01 (Seller Solo unavailable pending ratification). |

### 48.7.1 M14 Seller Bid Success Share {#48.7.1-m14-seller-bid-success-share}

#### Anti-Abuse Controls

3. **Velocity throttle:** Per-Seller-Org M14 publish entitlement and the Scale / Enterprise anti-abuse safety-net resolve exclusively from §34.1.2 row **Bid Success Shares (M14)**. §48.7.1 MUST NOT restate plan-tier caps or safety-net thresholds inline. The Scale / Enterprise "Unlimited" semantic remains intact at the plan-tier level; the safety-net is an Ops Security circuit-breaker, not a plan promise. CI gate `m14_velocity_cap_plan_tier_anti_abuse_distinction` (§M.5) asserts that plan-tier availability cites the canonical row.

#### Plan Gating & Entitlement

| Seller plan tier enum | M14 Access | Source |
| :---- | :---- | :---- |
| `seller_free` | Not available | §34.1.2 row **Bid Success Shares (M14)** |
| `seller_solo` | Not available pending AE-V72REM-PH48-M14-PLAN-SINGLETON-01 ratification | §34.1.2 row **Bid Success Shares (M14)**; §44.6 Solo-Tier Surface Treatment |
| `seller_starter` | Per canonical §34.1.2 entitlement cell | §34.1.2 row **Bid Success Shares (M14)** |
| `seller_growth` | Per canonical §34.1.2 entitlement cell | §34.1.2 row **Bid Success Shares (M14)** |
| `seller_scale` | Unlimited plan-tier promise; safety-net is anti-abuse only | §34.1.2 row **Bid Success Shares (M14)** |
| `seller_enterprise` | Unlimited plan-tier promise; safety-net is anti-abuse only | §34.1.2 row **Bid Success Shares (M14)** |

#### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `m14_velocity_cap_plan_tier_anti_abuse_distinction` | content_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/m14_velocity_cap_plan_tier_anti_abuse_distinction.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | §48.7.1 anti-abuse #3 and Plan Gating table cite §34.1.2 row **Bid Success Shares (M14)**; Scale / Enterprise "Unlimited" stays a plan-tier promise; safety-net is anti-abuse only — closes D-48-004 | M02.3 |
