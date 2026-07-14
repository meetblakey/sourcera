#### 44.6.4.2 Throttled-Tier Hero Moment SLO {#44.6.4.2-throttled-tier-hero-moment-slo}

This subsection is the sole source for the seller-side Hero Moment activation-metric relaxation that applies to `seller_free` and `seller_solo` cohorts when the §44.6 Solo-Tier Surface Treatment is in force. §48.8.10 AC #42 consumes this table and MUST NOT restate a competing Solo / Free threshold.

The relaxation does not make active-workflow Hero Moment capabilities throttling-eligible. Per §44.6.4 / §44.6.4.1, active-workflow capabilities remain unthrottled; only `low_priority_background` capabilities may be silently suppressed. The relaxation exists because Solo / Free cohorts can lose passive suggestion acceleration while the core bid-response path remains available.

| Cohort family | Applies to plan_tier | Invite-source coverage | p50 target | p90 target | Alert / review path |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Throttled-tier seller Hero Moment relaxation | `seller_free`, `seller_solo` | All six Appendix J `seller_onboarding_invite_source` values per §48.8.10 AC #42 | ≤ 25 minutes | ≤ 75 minutes | Regression > 10% in any `(plan_tier, invite_source)` cell raises §42 P2 to `ops_growth_admin`; quarterly review per §48.8.10 AC #41 |

### 48.8.10 Acceptance Criteria (§48.8 Aggregate) {#48.8.10-acceptance-criteria-aggregate}

For every criterion in this section, the Hero Moment terminal predicate remains `hero_moment_completed_at` per §4.4.22 / §48.1.5. Stake-Reveal measurements are post-Hero-Moment reinforcement metrics and do not redefine completion.

42. **Plan-tier × invite-source cohort breakdown for activation metric. (V13 D-HM-009 remediation 2026-05-12.)** ACs #30 and #31 MUST additionally compute the activation metric across a `plan_tier × invite_source` cross-product cohort matrix (6 plan_tier values × 6 invite_source values = 36 cells). Solo / Free seller cohorts under §44.6 Solo-Tier Surface Treatment throttling MUST be assigned the RELAXED SLO in §44.6.4.2 "Throttled-Tier Hero Moment SLO": `seller_solo` cohort p50 ≤ 25 minutes (versus the paid-tier ≤ 20 min in AC #30), p90 ≤ 75 minutes (versus paid-tier ≤ 60 min); `seller_free` cohort: same relaxed bands as `seller_solo`. Regression > 10% on any (plan_tier, invite_source) cell raises a §42 P2 to `ops_growth_admin`. Deploy-time validator `solo_tier_hero_moment_slo_single_source` (§M.5 — new; pack assignment M02.3) asserts that the §44.6 throttle contract and the §48.8.10 SLO are reconcilable AND that the Solo / Free seller relaxation is registered exclusively at §44.6.4.2.

#### M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `solo_tier_hero_moment_slo_single_source` | content_consistency | **`runtime_active`** (promoted 2026-07-09; detector `tools/spec-lint/gates/solo_tier_hero_moment_slo_single_source.ts`; verified PASS on live Master Spec and pass/fail fixtures) | post-build | §44.6 throttle contract reconcilable with §48.8.10 SLO; Solo/Free seller relaxation registered exclusively at §44.6.4.2 — closes D-HM-009 | M02.3 |
