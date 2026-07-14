### 48.8.10 Acceptance Criteria (§48.8 Aggregate) {#48.8.10-acceptance-criteria-aggregate}

30. The Hero Moment p50 `activation_metric_elapsed_seconds` MUST satisfy §44.1 on the trailing 30-day rolling window for **all six canonical `invite_source` cohorts** per Appendix J `seller_onboarding_invite_source` enum (`buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`).
31. The Hero Moment p90 `activation_metric_elapsed_seconds` MUST satisfy §44.1 on the trailing 30-day rolling window for **all six canonical `invite_source` cohorts** per Appendix J `seller_onboarding_invite_source` enum (`buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`).
39. Per-`invite_source` cohort breakdowns MUST be queryable for **all six canonical Appendix J `seller_onboarding_invite_source` values** (`buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`).

### 49.1.10 Acceptance Criteria {#49.1.10-acceptance-criteria}

1. **Activation Metric p50 target.** All six canonical `invite_source` cohorts per Appendix J `seller_onboarding_invite_source` (`buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`) MUST satisfy the target.
2. **Activation Metric p90 target.** All six canonical `invite_source` cohorts per Appendix J `seller_onboarding_invite_source` (`buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`) MUST satisfy the target.
10. **Invite-source cohort breakdowns queryable.** Per-`invite_source` cohort breakdowns MUST be queryable for all six canonical Appendix J `seller_onboarding_invite_source` values (`buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`).

#### `seller_onboarding_invite_source` (§4.4.22)

`buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`.

### M.5.4 Catalog index {#m.5.4-catalog-index}

| Gate ID | Source phase | Runtime status | Scope | Failure mode | Runbook | Authority anchor |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| `seller_activation_cohort_canonical_enum` | V11 | **`runtime_active`** (detector `tools/spec-lint/gates/seller_activation_cohort_canonical_enum.ts`) | §48.8.10 / §49.1.10 activation metric and dashboard invite-source cohorts + Appendix J `seller_onboarding_invite_source` enum. | Activation metric and dashboard cohort references MUST consume the canonical six-value Appendix J `seller_onboarding_invite_source` enum. | Runbook. | Appendix J `seller_onboarding_invite_source`; §48.8.10; §49.1.10. |
