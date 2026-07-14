# Conversion Funnel Registry Fixture

### 51.0.3 Conversion Funnel Registry per Growth Path {#51.0.3-conversion-funnel-registry-per-growth-path}

The conversion funnel registry is the closed list of customer-facing PLG funnels. Every funnel binds to (a) ordered stage list, (b) anchor / continuation / terminal event names from Appendix G, (c) per-stage conversion target, (d) §51 dashboard surface that renders it, (e) §42 alert threshold on stage-level regression.

| Funnel ID | Stages (event names) | Customer-Visible Surface | §42 Alert |
|---|---|---|---|
| `buyer_conversion_funnel` | `user_signed_in` → `workspace_created` → `phase_advanced` → `procurement_completed` | §51.3 Org-Level Dashboard "Procurement Funnel" panel | Stage-level conversion regression > 15% → P3 |
| `seller_conversion_funnel` | `seller_onboarding_landing_rendered` → `seller_sso_completed` → `seller_onboarding_first_requirement_response` → `seller_onboarding_first_bid_submitted` → `seller_bid_workspace_closed` | §51.5 Seller Parity Dashboard "Onboarding Funnel" panel | Stage-level conversion regression > 15% → P3 |
| `forced_vendor_signup_funnel` | `growth_loop_l1_invite_emitted` → `growth_loop_l1_invite_clicked` → `growth_loop_l1_signup_attributed` → `seller_onboarding_first_requirement_response` → `growth_loop_l1_first_bid_completed` → `seller_bid_workspace_closed` | §51.5 Seller Parity Dashboard "Forced-Signup Funnel" panel | Stage-level conversion regression > 20% → P2 |
| `hero_moment_funnel` (seller) | `seller_onboarding_landing_rendered` → `seller_sso_completed` → `seller_hero_moment_displayed` → `hero_moment_completed` → `seller_onboarding_first_requirement_response` | §51.5 Seller Parity Dashboard "Hero Moment Funnel" panel | Stage-level regression > 10% |
| `hero_moment_funnel` (buyer) | `buyer_hero_moment_eval_starter_intake_started` → `buyer_hero_moment_eval_starter_intake_submitted` → `buyer_hero_moment_materialization_completed` → `buyer_hero_moment_completed` → `buyer_first_requirement_edit` | §51.3 Org-Level Dashboard "Buyer Hero Moment Funnel" panel | Stage-level regression > 10% |
| `conversion_moment_funnel` (CM1 / CM2 / CM3 / CM4) | `seller_onboarding_conversion_moment_fired` → `seller_onboarding_conversion_moment_clicked` → `upgrade_completed` | §51.5 Seller Parity Dashboard "Conversion Moment Funnel" panel | Per-CM trailing-90-day click-through-to-upgrade < 5% → P3 |
| `pro_trial_seat_funnel` (M17) | `m17_pro_trial_seat_grant_issued` → `pro_trial_seat_grant_activated` → `pro_trial_seat_grant_converted_to_paid` | §51.5 Seller Parity Dashboard "Pro Trial Seat Funnel" panel | < 30% activation OR < 20% conversion → P3 |
| `buyer_referral_funnel` (M16) | `m16_referral_created` → `m16_referral_link_shared` → `m16_referral_referee_signed_up` → `m16_referral_referee_activated` → `m16_referral_credit_issued` → `m16_referral_credit_applied` → `m16_referral_credit_fully_redeemed` | §51.3 Org-Level Dashboard "Referral Funnel" panel | Stage-level regression > 15% → P3 |

CI gate `conversion_funnel_registry_canonical_consumer` (§M.5 — new; pack assignment M02.3) asserts: (a) every funnel in §51.0.3 has all listed event names registered in Appendix G; (b) every customer-visible §51 dashboard panel that surfaces a funnel queries it from this registry only; (c) no inline funnel-stage definition exists outside §51.0.3. The PostHog Insights → Funnels backing store auto-generates the funnel queries from §51.0.3 via the §51.1.4 outbox dual-write pipeline.

### 51.3.3 Panels & KPIs {#51.3.3-panels-kpis}

Procurement Funnel, Buyer Hero Moment Funnel, and Referral Funnel are generated from §51.0.3.

### 51.5.6 Acceptance Criteria — §51.5 {#51.5.6-acceptance-criteria-51-5}

Onboarding Funnel, Forced-Signup Funnel, Hero Moment Funnel, Conversion Moment Funnel, and Pro Trial Seat Funnel are generated from §51.0.3.

# Appendix G: PostHog Event Taxonomy {#appendix-g-posthog-event-taxonomy}

`user_signed_in`, `workspace_created`, `phase_advanced`, `procurement_completed`, `seller_onboarding_landing_rendered`, `seller_sso_completed`, `seller_onboarding_first_requirement_response`, `seller_onboarding_first_bid_submitted`, `seller_bid_workspace_closed`, `growth_loop_l1_invite_emitted`, `growth_loop_l1_invite_clicked`, `growth_loop_l1_signup_attributed`, `growth_loop_l1_first_bid_completed`, `seller_hero_moment_displayed`, `hero_moment_completed`, `buyer_hero_moment_eval_starter_intake_started`, `buyer_hero_moment_eval_starter_intake_submitted`, `buyer_hero_moment_materialization_completed`, `buyer_hero_moment_completed`, `buyer_first_requirement_edit`, `seller_onboarding_conversion_moment_fired`, `seller_onboarding_conversion_moment_clicked`, `upgrade_completed`, `m17_pro_trial_seat_grant_issued`, `pro_trial_seat_grant_activated`, `pro_trial_seat_grant_converted_to_paid`, `m16_referral_created`, `m16_referral_link_shared`, `m16_referral_referee_signed_up`, `m16_referral_referee_activated`, `m16_referral_credit_issued`, `m16_referral_credit_applied`, `m16_referral_credit_fully_redeemed`.

# Appendix J

**`conversion_funnel_id_kind`** (V13): `buyer_conversion_funnel`, `seller_conversion_funnel`, `forced_vendor_signup_funnel`, `hero_moment_funnel_seller`, `hero_moment_funnel_buyer`, `conversion_moment_funnel_cm1`, `conversion_moment_funnel_cm2`, `conversion_moment_funnel_cm3`, `conversion_moment_funnel_cm4`, `pro_trial_seat_funnel`, `buyer_referral_funnel`.

#### M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `conversion_funnel_registry_canonical_consumer` | content_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/conversion_funnel_registry_canonical_consumer.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | §51.0.3 closed registry; every Appendix G event referenced exists; every §51 dashboard panel queries from registry; PostHog Insights funnels auto-gen from registry — closes D-51-003 | M02.3 |
