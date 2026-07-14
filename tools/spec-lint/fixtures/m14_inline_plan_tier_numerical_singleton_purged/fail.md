### 48.7.1 M14 Seller Bid Success Share {#48.7.1-m14-seller-bid-success-share}

#### Anti-Abuse Controls

3. **Velocity throttle:** Seller Starter gets 3/month, Seller Growth gets 10/month, and Scale / Enterprise has a 100 publishes / 30-day rolling window safety-net.

#### Plan Gating & Entitlement

| Seller plan tier enum | M14 Access | Source |
| :---- | :---- | :---- |
| `seller_starter` | 3/month | §48.7.1 |
| `seller_growth` | 10/month | §48.7.1 |
| `seller_scale` | Unlimited, 100 publishes / 30-day rolling window safety-net | §48.7.1 |
| `seller_enterprise` | Unlimited, 100 publishes / 30-day rolling window safety-net | §48.7.1 |

#### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `m14_inline_plan_tier_numerical_singleton_purged` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | Weak M14 singleton check. | M02.3 |
