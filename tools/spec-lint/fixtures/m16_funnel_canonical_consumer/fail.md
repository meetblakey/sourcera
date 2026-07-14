### 48.7.3 M16 Buyer Referral Credit {#48.7.3-m16-buyer-referral-credit}

#### M16 Conversion Funnel

The canonical M16 buyer referral conversion funnel is registered at §51.0.3 as `buyer_referral_funnel`. The 13 telemetry events compose the 7 funnel stages (`created → link_shared → referee_signed_up → referee_activated → credit_issued → credit_applied → credit_redeemed`) plus diagnostics.

### 51.0.3 Conversion Funnel Registry per Growth Path {#51.0.3-conversion-funnel-registry-per-growth-path}

| Funnel ID | Stages (event names) | Customer-Visible Surface | §42 Alert |
|---|---|---|---|
| `buyer_referral_funnel` (M16) | `m16_referral_created` → `m16_referral_link_shared` → `m16_referral_referee_signed_up` → `m16_referral_referee_activated` → `m16_referral_credit_issued` → `m16_referral_credit_applied` → `m16_referral_credit_redeemed` → `m16_referral_credit_expired` | §51.3 Org-Level Dashboard "Referral Funnel" panel | Stage-level regression > 15% → P3 |

### §48.7 M14-M17 Cross-Console & Seller Conversion Mechanics — Event Additions {#appendix-g-section-48-7-additions}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `m16_referral_created` | accepted | `buyer_referral_id` |
| `m16_referral_link_shared` | shared | `buyer_referral_id` |
| `m16_referral_referee_signed_up` | signup | `buyer_referral_id` |
| `m16_referral_referee_activated` | activated | `buyer_referral_id` |
| `m16_referral_credit_issued` | issued | `buyer_referral_id` |
| `m16_referral_credit_applied` | applied | `buyer_referral_id` |
| `m16_referral_credit_redeemed` | stale | `buyer_referral_id` |

#### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `m16_funnel_canonical_consumer` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | §51.0.3 loosely owns the funnel. | M02.3 |
