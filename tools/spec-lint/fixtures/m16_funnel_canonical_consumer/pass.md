### 48.7.3 M16 Buyer Referral Credit {#48.7.3-m16-buyer-referral-credit}

#### M16 Conversion Funnel

The canonical M16 buyer referral conversion funnel is registered at §51.0.3 as `buyer_referral_funnel`. Funnel stage definitions, ordered anchor events, customer-visible dashboard surface, and §42 alert thresholds are single-sourced at §51.0.3 to prevent inline drift. §48.7.3 cites §51.0.3 and does not duplicate the funnel definition. The telemetry table above is the lifecycle/event catalog for M16; only §51.0.3 decides which of those events are funnel stages versus side-channel diagnostics for the §51.3 Org-Level Dashboard "Referral Funnel" panel. CI gate `m16_funnel_canonical_consumer` (§M.5) asserts the §51.0.3 registry is the sole authoring home for the M16 funnel.

### 51.0.3 Conversion Funnel Registry per Growth Path {#51.0.3-conversion-funnel-registry-per-growth-path}

| Funnel ID | Stages (event names) | Customer-Visible Surface | §42 Alert |
|---|---|---|---|
| `buyer_referral_funnel` (M16) | `m16_referral_created` → `m16_referral_link_shared` → `m16_referral_referee_signed_up` → `m16_referral_referee_activated` → `m16_referral_credit_issued` → `m16_referral_credit_applied` → `m16_referral_credit_fully_redeemed` | §51.3 Org-Level Dashboard "Referral Funnel" panel | Stage-level regression > 15% → P3 |

### §48.7 M14-M17 Cross-Console & Seller Conversion Mechanics — Event Additions {#appendix-g-section-48-7-additions}

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `m16_referral_created` | accepted | `buyer_referral_id` |
| `m16_referral_link_shared` | shared | `buyer_referral_id` |
| `m16_referral_referee_signed_up` | signup | `buyer_referral_id` |
| `m16_referral_referee_activated` | activated | `buyer_referral_id` |
| `m16_referral_credit_issued` | issued | `buyer_referral_id` |
| `m16_referral_credit_applied` | applied | `buyer_referral_id` |
| `m16_referral_credit_fully_redeemed` | redeemed | `buyer_referral_id` |
| `m16_referral_same_domain_blocked` | blocked | `buyer_referral_id` |
| `m16_referral_payment_overlap_detected` | detected | `buyer_referral_id` |
| `m16_referral_fraud_sweep_completed` | sweep | `buyer_referral_id` |
| `m16_referral_exclusivity_blocked` | exclusivity | `buyer_referral_id` |
| `m16_referral_credit_expired` | expired | `buyer_referral_id` |
| `m16_referral_ops_override` | override | `buyer_referral_id` |

#### M.5.12 V13 catalog additions {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `m16_funnel_canonical_consumer` | content_consistency | **`runtime_active`** (promoted 2026-07-07; detector `tools/spec-lint/gates/m16_funnel_canonical_consumer.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | §51.0.3 `buyer_referral_funnel` registry is sole authoring home; no inline funnel-stage definition in §48.7.3 — closes D-13V-008 | M02.3 |
