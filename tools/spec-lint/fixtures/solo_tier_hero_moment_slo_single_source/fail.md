### 48.8.10 Acceptance Criteria (§48.8 Aggregate) {#48.8.10-acceptance-criteria-aggregate}

For every criterion in this section, the Hero Moment terminal predicate remains `hero_moment_completed_at` per §4.4.22 / §48.1.5.

42. **Plan-tier x invite-source cohort breakdown.** Solo / Free seller cohorts use p50 ≤ 25 minutes and p90 ≤ 75 minutes. The relaxation is registered with a §44.6.4.X "Throttled-Tier Hero Moment SLO" cross-reference.

#### M.5.12 V13 catalog additions (PLG / Growth / Analytics / Hero Moment) {#m-5-12-v13-additions}

| gate_id | row_class | runtime_status | execution_context | assertion (summary) | pack |
|---|---|---|---|---|---|
| `solo_tier_hero_moment_slo_single_source` | content_consistency | spec_binding_pending_pack_m02_3 | post-build | §44.6 throttle contract reconcilable with §48.8.10 SLO; Solo/Free relaxation registered exclusively at §44.6.4.X — closes D-HM-009 | M02.3 |
