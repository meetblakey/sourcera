### 48.8.10 Acceptance Criteria (§48.8 Aggregate) {#48.8.10-acceptance-criteria-aggregate}

30. The Hero Moment p50 `activation_metric_elapsed_seconds` MUST satisfy §44.1 for `invite_source ∈ {buyer_invite, ghost_bid_conversion, pro_trial_seat_m17}` cohorts.
31. The Hero Moment p90 `activation_metric_elapsed_seconds` MUST satisfy §44.1 for `invite_source ∈ {buyer_invite, ghost_bid_conversion, pro_trial_seat_m17}` cohorts.
39. Per-`invite_source` cohort breakdowns MUST be queryable for buyer_invite vs ghost_bid_conversion vs pro_trial_seat_m17 vs direct_signup.

### 49.1.3 Onboarding Surface — Stage 3 {#49.1.3-onboarding-surface-stage-3}

7. `invite_source='direct_signup'` sellers are NOT part of the hero-path cohort for activation-metric measurement.

### 49.1.10 Acceptance Criteria {#49.1.10-acceptance-criteria}

1. **Activation Metric p50 target.** Hero-path-cohort (`invite_source ∈ {buyer_invite, ghost_bid_conversion, pro_trial_seat_m17}`) activation metric MUST satisfy §44.1.
2. **Activation Metric p90 target.** Hero-path-cohort (`invite_source ∈ {buyer_invite, ghost_bid_conversion, pro_trial_seat_m17}`) activation metric MUST satisfy §44.1.
10. **Invite-source cohort breakdowns queryable.** Per-`invite_source` cohort breakdowns MUST be queryable on every §49.1 dashboard (buyer_invite vs ghost_bid_conversion vs pro_trial_seat_m17 vs direct_signup).

#### `seller_onboarding_invite_source` (§4.4.22)

`buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`.

### M.5.4 Catalog index {#m.5.4-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Failure mode | Runbook | Authority anchor |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `seller_activation_cohort_canonical_enum` | V11 | `spec_binding_pending_pack_m02_3` | §51.5 seller analytics dashboards + Appendix J `seller_activation_cohort` enum + Master Spec post-edit grep. | All seller-activation cohort references MUST consume values: `pre_activation`, `magic_link_clicked`, `first_win`, `dormant`, `churned`. | Runbook. | Appendix J `seller_activation_cohort`. |
