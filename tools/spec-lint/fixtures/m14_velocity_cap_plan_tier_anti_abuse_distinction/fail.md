### 34.1.2 Seller Plan Tiers {#34.1.2-seller-plan-tiers}

| Feature | Free | Seller Solo | Seller Starter | Seller Growth | Seller Scale | Seller Enterprise | Source |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Bid Success Shares (M14)** | -- | -- | 3/month | 10/month | Unlimited; anti-abuse safety-net 100 publishes / 30-day rolling window | Unlimited; anti-abuse safety-net 100 publishes / 30-day rolling window | §48.7.1 |

### 48.7.1 M14 Seller Bid Success Share {#48.7.1-m14-seller-bid-success-share}

#### Anti-Abuse Controls

3. **Velocity throttle:** Seller Starter can publish 3/month, Seller Growth can publish 10/month, and Scale / Enterprise can publish 100 publishes / 30-day rolling window before anti-abuse review. Scale is still unlimited.

#### Plan Gating & Entitlement

| Seller plan tier enum | M14 Access | Source |
| :---- | :---- | :---- |
| `seller_free` | Not available | §48.7.1 |
| `seller_solo` | Not available | §48.7.1 |
| `seller_starter` | 3/month | §48.7.1 |
| `seller_growth` | 10/month | §48.7.1 |
| `seller_scale` | Unlimited plus 100 publishes / 30-day rolling window | §48.7.1 |
| `seller_enterprise` | Unlimited plus 100 publishes / 30-day rolling window | §48.7.1 |

#### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `m14_velocity_cap_plan_tier_anti_abuse_distinction` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | Weak M14 cap check. | M02.3 |
