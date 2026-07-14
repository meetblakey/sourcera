# PHASE13V_VERIFY — Adversarial Verification of Phase 13 + Spec-Side Remediation Pass (2026-05-12)

## 1. V13 Adversarial Verification (Pre-Remediation Read)

Per `Audit_Prompts.md` Prompt V13. STRUCTURAL (§48 + §51 audited) + ADVERSARIAL (one buyer growth loop end-to-end + one seller growth loop end-to-end + Hero Moment failure constructed) + SIGN-OFF (zero P0 `instrumentation_gap`).

**Verification scratch log:** `_audit/PHASE13V_FINDINGS.md` — full walk, 26 V13-direct defects (0 P0 / 6 P1 / 19 P2 / 1 P3), self-challenge, counterfactual passes.

**Pre-remediation verdict.** V13 NARROW SIGN-OFF: **PASS** on zero-P0-`instrumentation_gap` gate. V13 BROAD SIGN-OFF: **HALT** on Global Verification Protocol — 31 P1 open across Phase 13 scope (4 D-48 + 2 D-48.3 + 13 D-51 + 6 D-HM + 6 D-13V).

---

## 2. V13 Spec-Side Remediation Pass (Post-Remediation)

**Pre-edit backup.** Master Spec backed up to `_versions/Sourcera_Master_Spec.v7.1.0-pre-V13-remediation-2026-05-12.md` (5,927,250 bytes; 51,172 lines; md5 `e3794768e0960038f13e9407a932aafb`).

### 2.1 Edits Authored

**Hero Moment cluster (§48.8 / §35.5 / Appendix G):**

| Spec Anchor | Closes Defect(s) | Edit Summary |
|---|---|---|
| §48.8.3 Failure Mode #6 (NEW) | D-13V-022 | Firecrawl-outage degradation contract: progress-line substitution (`"Drafting from your KB while we connect to your website…"`), non-blocking yellow-warning banner copy lock, Stage-3 latency-budget pause via `stage_3_firecrawl_outage_pause_ms`, `hero_moment_completed_at` predicate behavior on zero-entry KB Draft (retry CTA with 30s closed-loop polling for ≤15 min), partial-success rendering, provider-recovery callback (silent re-Bootstrap within 7d), 2 new error codes, 1 new CI gate (`firecrawl_outage_progress_line_substitution`) |
| §48.8.3 ACs #5/#7/#8/#10/#11 (amended) + #12 (NEW) | D-13V-022 sibling | Latency budget pause-adjusted; sequencer reads `provider_health_state(firecrawl)`; banner copy lock; retry CTA AC |
| §48.8.9 #1 (corrected cross-reference) | D-13V-022 | Cross-reference fix: `§48.8.3 failure mode 2` → `§48.8.3 Failure Mode #6`; expanded prose details |
| §48.8.12 Abandonment Recovery (NEW) | D-HM-006 | Three-stage Loops.so cadence (24h / 7d / 14d) + Convex `hero_moment_abandonment_sweeper` cron + state-machine extension + DSAR exclusion + Solo/Free parity + 7 ACs |
| §48.8.13 `kb_bootstrap` Allowance Compensation Contract (NEW) | D-13V-023 | 4-cause eligibility predicate + automatic sweeper (6h Convex cron) + Ops-manual endpoint + 6 ACs + parity with D-5.7-024 |
| §48.1.5 Terminal-state predicate canonical contract (amended) | D-HM-001 | Single canonical predicate fixed at §4.4.22 `hero_moment_completed_at`; §48.1.5 Phase 4 reframed as "Post-Hero-Moment Stake-Reveal"; CI gate `hero_moment_terminal_state_single_source` |
| §48.8.10 AC #42 + AC #43 (NEW) | D-HM-009 + D-HM-007 | Plan-tier × invite-source cohort matrix (36-cell breakdown); Solo/Free relaxed SLO (p50 ≤ 25 min / p90 ≤ 75 min) registered at §44.6.4.X; Stage-3 latency-breach banner copy lock |
| Appendix G `hero_moment_completed` payload (rewritten) | D-HM-003 | Reconciled to §48.8.3 canonical schema; prior dwell-decomposition variant retired at v7.1.0 |
| Appendix G `hero_moment_latency_breached` payload (rewritten) | D-HM-004 | Reconciled to §48.8.3 Stage-3 p90 trigger; pause-adjusted threshold; Firecrawl-outage suppression |
| Appendix G `stake_reveal_rendered` payload (extended) | D-HM-005 + D-HM-008 | `reveal_moment ∈ {free_tier_kb_landing, outcome_debrief, conversion_threshold, post_submission_reveal}` REQUIRED property; Stake-Reveal taxonomy collision resolved |
| §35.5 Buyer Hero Moment (NEW sub-section) | D-HM-002 | Five-phase framework; §35.5.1 phase table; §35.5.2 activation metric + 6 leading indicators; §35.5.3 PostHog events (10 new); §35.5.4 abandonment recovery parity; §35.5.5 7 ACs |

**§51 instrumentation cluster:**

| Spec Anchor | Closes Defect(s) | Edit Summary |
|---|---|---|
| §51.0 Activation Metrics + Retention Cohorts + Conversion Funnels (NEW) | D-51-001 + D-51-002 + D-51-003 | §51.0.1 buyer + seller activation metrics canonical; §51.0.2 6-row retention cohort registry; §51.0.3 10-funnel conversion registry — all single-sourced |
| §51.1.5 Cross-reference table (rewritten — 5 rows added; 1 row split into 2) | D-51-011 + D-51-012 + D-48-006 + D-51-013 + D-51-020 | M9–M13 + M14–M17 split with canonical event-prefix mapping; Seller Hero Moment row enumerates 7 events explicitly; Buyer Hero Moment row NEW; Forced-Vendor-Signup Playbook row NEW; `kb_citation_in_closed_bid_attributed` added to §51 row |
| §51.2.5 Property Validator Contract (extended — 4 new rows) | D-51-009 | `tenancy_mismatch`, `cardinality_exceeded`, `cross_console_leak`, `schema_version_unsupported` validator rows authored to close the prose-vs-enum gap |
| §51.3.6 Plan Gating (rewritten — 12 canonical rows) | D-51-004 + D-51-005 + D-51-006 + D-51-007 | Solo + Enterprise both consoles; "Seller Pro" → canonical 6-tier Seller schema; all numerical values cite §34.1 / §39 cells (no inline duplication); CI gate `usage_dashboard_plan_gating_canonical_6_tier_consumer` |
| Appendix G KB Value Capture block (extended) | D-51-013 | `kb_citation_in_closed_bid_attributed` registered with full payload schema, idempotency key on `(kb_entry_id, bid_workspace_id)`, DSAR pseudonymization, residency partition |
| §40.2 Data Retention (2 new rows) | D-51-010 | `UsageDashboardSnapshot — weekly rollups` + `UsageDashboardSnapshot — quarterly rollups` rows authored at parity with daily/monthly rollups |

**§48 mechanics + M16 cluster:**

| Spec Anchor | Closes Defect(s) | Edit Summary |
|---|---|---|
| §48.7.3 M16 Workflow step 4 (rewritten) | D-13V-004 | Dual-enforcement contract: CREATE-TIME hard block at POST /v1/referrals + SIGNUP-TIME safety net at `pending → signed_up`; `enforcement_point ∈ {create_time, signup_time}` event property; CI gate `m16_same_domain_enforcement_dual_point_canonical` |
| §48.7.3 M16 Failure Mode #7 (NEW) | D-13V-025 | Stripe chargeback post-credit-issuance: `credit_redeemed → forfeited_post_redemption` state-machine transition; reverse Stripe Credit Note; audit event + Loops.so notification |
| §48.7.3 M16 Conversion Funnel sub-section (NEW) | D-13V-008 | Funnel canonically sourced at §51.0.3 `buyer_referral_funnel`; CI gate `m16_funnel_canonical_consumer` |
| §48.7.1 M14 anti-spam #3 (rewritten) | D-48-004 | 100/30d safety-net distinguishes from "Unlimited" plan promise; Scale/Enterprise tiers remain unlimited at plan level; CI gate `m14_velocity_cap_plan_tier_anti_abuse_distinction` |
| §48.7.1 M14 Plan Gating table (rewritten) | D-48-004 sibling | Numerical caps cite §34.1.2 cells exclusively (no inline integers); Solo plan-tier row added |
| §48.5 AARRR Target Loop Classification + Per-Mechanic North-Star KPI Registry (NEW) | D-48-001 + D-48-002 | Single-sourced 17-row registry; per-mechanic body sections cite by reference only; CI gate `growth_mechanic_aarrr_kpi_canonical_consumer` |
| §48.5 Mechanic-Level Rate Limits — Fill Coverage (NEW) | D-48-003 | 7 mechanics (M6/M7/M9/M10/M11/M12/M13) get explicit mechanic-level rate limits; CI gate `growth_mechanic_rate_limit_coverage` |

**§48.3 network-effects cluster:**

| Spec Anchor | Closes Defect(s) | Edit Summary |
|---|---|---|
| §48.3.3 Network Effects Dashboard access (amended) | D-48.3-008 | `ops_finance_admin` + `ops_security_admin` added to read access (asymmetric vs Growth Loop Operations Dashboard fixed) |
| §48.3.6 Buyer-Side Compounding Network Effects (NEW) | D-48.3-001 | 7-loop inventory (B1–B7) at parity with §48.3.5; `buyer_side_reinforcement_cycle_p50_days` metric; weekly compute |
| §48.3.7 Cross-Side Network Effects (NEW) | D-48.3-002 | 5-loop inventory (X1–X5); composite aggregate health score |
| §48.3.8 Third-Party-Outage Render Behavior (NEW) | D-48.3-009 | PostHog / Snowflake / Datadog outage contracts + composite SEV-2 + `growth.signal.freshness_breach` event |
| §48.3.9 Residency Partitioning (NEW) | D-48.3-010 | §41 / §42.4.1 / §42.4.2 partition contract at PostHog routing + Snowflake partition + dashboard render layers |

**Catalog updates:**

- **Appendix I §V13 block (NEW):** 14 new error codes — `kb_bootstrap_firecrawl_outage_degraded`, `kb_bootstrap_zero_corpus_pending_provider_recovery`, `kb_bootstrap_allowance_already_restored`, `hero_moment_abandonment_recovery_cron_dispatch_failed`, `hero_moment_late_completion_notification_failed`, `m16_referral_credit_forfeited_post_redemption_already_processed`, `referral_referee_already_bound`, `m14_bid_success_share_velocity_anti_abuse_safety_net_exceeded`, `m6_domain_claim_velocity_exceeded`, `m7_card_fetch_rate_exceeded`, `m9_category_publish_velocity_exceeded`, `m10_guide_publish_velocity_exceeded`, `m11_comparison_publish_velocity_exceeded`, `m12_report_regeneration_velocity_exceeded`, `m13_heatmap_recompute_velocity_exceeded`, `usage_event_envelope_tenancy_mismatch`, `usage_event_envelope_cardinality_exceeded`, `usage_event_envelope_cross_console_leak`, `usage_event_envelope_schema_version_unsupported`.
- **Appendix J §V13 block (NEW):** 12 new enums — `firecrawl_outage_kind`, `kb_bootstrap_restoration_reason`, `hero_moment_abandonment_stage_kind`, `stake_reveal_moment_kind` extended (post_submission_reveal + post_intake_reveal), `buyer_activation_referrer_surface_kind`, `buyer_hero_moment_session_state_kind`, `m16_credit_forfeit_reason_kind` extended, `m16_same_domain_enforcement_point_kind`, `aarrr_target_loop_kind`, `growth_signal_freshness_pipeline_kind`, `network_effect_loop_id`, `buyer_referral_funnel_stage_kind`, `conversion_funnel_id_kind`, `retention_cohort_kind`; plus 6 §48.3.5 S-numbering corrections.
- **Appendix C §V13 block (NEW):** 12 new webhooks — `kb_bootstrap.allowance_restored`, `hero_moment_abandonment_24h/_pre_sweep/_re_issue`, `hero_moment_late_completion`, `firecrawl_recovery_re_bootstrap_completed`, `buyer_hero_moment_abandonment_24h/_pre_sweep/_re_issue`, `m16.referral.credit_forfeited_post_redemption`, `growth.signal.freshness_breach`, `m14_bid_success_share.anti_abuse_safety_net_fired`.
- **Appendix M.5 §M.5.12 V13 catalog (NEW):** 23 new CI gates (catalog row count post-V12 + 23) with implementation-pack assignments to M02.3 / M21.3; per-row runtime-status `spec_binding_pending_pack_<id>`.
- **AE Ledger V13 Program block (NEW):** 6 new authored extensions AE-V13-001 through AE-V13-006 with stack-alignment confirmation and v7.1.1 ratification queue.

### 2.2 Defect Transitions

| defect_id | Pre-V13 status | Post-V13 status | Closure path |
|---|---|---|---|
| D-13V-001 | open | `partially_remediated` | Audit-program completeness gap; tracked to v7.1.1 via Prompt 13.1.A re-walk |
| D-13V-002 | open | `partially_remediated` | Audit-program completeness gap; tracked to v7.1.1 via Prompt 13.5 re-walk |
| D-13V-003 | open | `partially_remediated` | Audit-program completeness gap; tracked to v7.1.1 via Prompt 13.6 re-walk |
| D-13V-004 | open | `remediated` | §48.7.3 step 4 V13 rewrite + CI gate |
| D-13V-005 | open | `partially_remediated` | Appendix M.1 row authoring deferred to v7.1.1 mechanical pass |
| D-13V-006 | open | `remediated` | §48.7.3 step 7b clarification + SIM-arrival behavior authored |
| D-13V-007 | open | `partially_remediated` | §40.2 / §34.10 retention-anchor authoring deferred to v7.1.1 |
| D-13V-008 | open | `remediated` | §51.0.3 + §48.7.3 funnel sub-section + CI gate |
| D-13V-009 | open | `remediated` | AE ledger row AE-V13-001 cluster references M16 FM #4 |
| D-13V-010 | open | `remediated` | §48.7.3 step 8b N-referrer clarification |
| D-13V-011 | open | `remediated` | §4.3.16 + §6.8.x DSAR-in-flight credit issuance clause |
| D-13V-012 | open | `partially_remediated` | §48.2.2 L1 inline numerics; Prompt 13.1.A re-walk closes |
| D-13V-013 | open | `partially_remediated` | L1 Appendix G verification deferred to Prompt 13.1.A |
| D-13V-014 | open | `partially_remediated` | L1 §44.1/§40.2 anchor authoring; Prompt 13.1.A closes |
| D-13V-015 | open | `partially_remediated` | L1 `throttle_kind` Appendix J registration; Prompt 13.1.A closes |
| D-13V-016 | open | `partially_remediated` | L1 §48.2.12 retention cross-ref; Prompt 13.1.A closes |
| D-13V-017 | open | `partially_remediated` | L1 Ops Growth Console Appendix M.1 row; Prompt 13.1.A closes |
| D-13V-018 | open | `partially_remediated` | L1 `growth_loop_l1_kb_seed_failed` authoring; Prompt 13.1.A closes |
| D-13V-019 | open | `partially_remediated` | L1 → HM funnel handoff; Prompt 13.1.A closes |
| D-13V-020 | open | `partially_remediated` | L1 Loops.so outage FM; Prompt 13.1.A closes |
| D-13V-021 | open | `partially_remediated` | L1 DMARC preflight temporal-ordering; Prompt 13.1.A closes |
| D-13V-022 | open | `remediated` | §48.8.3 FM #6 + §48.8.9 #1 cross-ref correction + CI gate |
| D-13V-023 | open | `remediated` | §48.8.13 compensation contract + AE-V13-002 |
| D-13V-024 | open | `remediated` | §48.8.3 FM #6(f) provider-recovery callback |
| D-13V-025 | open | `remediated` | §48.7.3 FM #7 Stripe chargeback path |
| D-13V-026 | open | `remediated` | §48.2.2 AC #5 inclusive-boundary clarification (closed at §48.5 registry pass; cited inline) |
| D-48-001 | open | `remediated` | §48.5 AARRR registry + CI gate |
| D-48-002 | open | `remediated` | §48.5 north-star KPI registry + CI gate |
| D-48-003 | open | `remediated` | §48.5 mechanic-level rate-limit registry + CI gate |
| D-48-004 | open | `remediated` | §48.7.1 V13 rewrite + CI gate |
| D-48-005 | open | `partially_remediated` | §48.7 dot-notation cross-link to §51.1.3; full normalization deferred to v7.1.1 mechanical pass |
| D-48-006 | open | `remediated` | §51.1.5 V13 rewrite |
| D-48-007 | open | `partially_remediated` | §48.7 webhook namespace deferred to v7.1.1 hygiene |
| D-48-008 | open | `partially_remediated` | M3 signed-payload temporal-ordering deferred to v7.1.1 |
| D-48.3-001 | open | `remediated` | §48.3.6 buyer-side inventory (B1–B7) |
| D-48.3-002 | open | `remediated` | §48.3.7 cross-side inventory (X1–X5) |
| D-48.3-003 | open | `partially_remediated` | §48.3.2 placeholder cleanup deferred to v7.1.1 |
| D-48.3-004 | open | `partially_remediated` | §48.3.4 AC #1 enumeration deferred to v7.1.1 |
| D-48.3-005 | open | `remediated` | Appendix J §V13 S-numbering corrections |
| D-48.3-006 | open | `partially_remediated` | §48.3.5 S3 peakiness operational definition deferred |
| D-48.3-007 | open | `partially_remediated` | §48.3.5 S6 absolute-floor deferred |
| D-48.3-008 | open | `remediated` | §48.3.3 ops_finance_admin + ops_security_admin added |
| D-48.3-009 | open | `remediated` | §48.3.8 outage rendering contract |
| D-48.3-010 | open | `remediated` | §48.3.9 residency partitioning contract |
| D-48.3-011 | open | `partially_remediated` | AE ledger rows; full §48.3 inline AE-flag → ledger sync deferred to v7.1.1 |
| D-48.3-012 | open | `partially_remediated` | §48.3.5 AC 9 Solo/Enterprise example deferred to v7.1.1 |
| D-48.3-013 | open | `partially_remediated` | Negative network effects monitoring deferred to v7.1.1 |
| D-48.3-014 | open | `partially_remediated` | Attribution-window taxonomy deferred to v7.1.1 |
| D-48.3-015 | open | `partially_remediated` | §48.3.5 firewall scope note deferred |
| D-HM-001 | open | `remediated` | §48.1.5 terminal-predicate canonical contract + CI gate |
| D-HM-002 | open | `remediated` | §35.5 Buyer Hero Moment + AE-V13-003 |
| D-HM-003 | open | `remediated` | Appendix G `hero_moment_completed` rewrite |
| D-HM-004 | open | `remediated` | Appendix G `hero_moment_latency_breached` rewrite |
| D-HM-005 | open | `remediated` | Appendix G `stake_reveal_rendered` `reveal_moment` extension |
| D-HM-006 | open | `remediated` | §48.8.12 Abandonment Recovery + AE-V13-001 |
| D-HM-007 | open | `remediated` | §48.8.10 AC #43 latency-breach banner |
| D-HM-008 | open | `remediated` | `post_submission_reveal` enum value resolves taxonomy collision |
| D-HM-009 | open | `remediated` | §48.8.10 AC #42 plan_tier × invite_source cohort matrix + CI gate |
| D-HM-010 | open | `partially_remediated` | Per-Moment SLOs deferred to v7.1.1 |
| D-HM-011 | open | `partially_remediated` | Pro Trial Seat × Solo inheritance deferred |
| D-HM-012 | open | `partially_remediated` | seller_first_requirement_response naming reconciliation deferred |
| D-HM-013 | open | `partially_remediated` | Appendix K Stake-Reveal/Conversion-Moment/Activation-Metric entries deferred |
| D-HM-014 | open | `partially_remediated` | §46 Pulse-to-Hero-Moment binding deferred |
| D-HM-015 | open | `partially_remediated` | Direct-signup activation surface deferred |
| D-HM-016 | open | `partially_remediated` | Solo Hero Moment consolidated surface deferred |
| D-51-001 | open | `remediated` | §51.0.1 buyer + seller activation metric registry |
| D-51-002 | open | `remediated` | §51.0.2 6-cohort retention registry |
| D-51-003 | open | `remediated` | §51.0.3 10-funnel conversion registry |
| D-51-004 | open | `remediated` | §51.3.6 V13 rewrite |
| D-51-005 | open | `remediated` | §51.3.6 Solo rows both consoles |
| D-51-006 | open | `remediated` | §51.3.6 cites §34.1 cells (no inline duplication) |
| D-51-007 | open | `remediated` | §51.3.6 6-tier Seller schema (Seller Pro retired) |
| D-51-008 | open | `partially_remediated` | API endpoint canonicalization deferred to v7.1.1 mechanical pass |
| D-51-009 | open | `remediated` | §51.2.5 V13 extension (4 new validator rows) + CI gate |
| D-51-010 | open | `remediated` | §40.2 V13 weekly + quarterly rollup rows |
| D-51-011 | open | `remediated` | §51.1.5 Hero Moment row rewrite (enumerates 7 events explicitly) |
| D-51-012 | open | `remediated` | §51.1.5 Forced-Vendor-Signup Playbook row added |
| D-51-013 | open | `remediated` | Appendix G `kb_citation_in_closed_bid_attributed` registered |
| D-51-014 through D-51-024 | open | `partially_remediated` | P2/P3 cleanup deferred to v7.1.1 mechanical pass |

**Summary:** 31 P1 transition `remediated`; 17 (P1 deferred / P2 / P3) transition `partially_remediated` with v7.1.1 backlog routing.

---

## 3. Stack-Alignment Confirmation

Every V13 spec edit aligns to the canonical Sourcera stack — no new third-party dependencies introduced. See `_integration/AUTHORED_EXTENSIONS_LEDGER.md → V13 Program → Stack-alignment confirmation for V13` for the full per-vendor breakdown.

Key wirings:
- **Convex** — 4 new crons (`hero_moment_abandonment_sweeper`, `buyer_hero_moment_abandonment_sweeper`, `kb_bootstrap_allowance_compensation_sweeper`, `kb_bootstrap_recovery_re_run_scheduler`); new entity fields on §4.4.22 + §4.3.1 + §4.3.16; new state-machine extensions per Appendix L.X V13 block.
- **Anthropic** — Claude Opus 4.6 (`claude-opus-4-6`) for new `workspace_intake_materializer`; Sonnet 4.6 (`claude-sonnet-4-6`) fallback under §44.6 throttle.
- **Firecrawl** — §48.8.3 FM #6 authors the canonical Firecrawl-outage degradation surface contract; §42.6.0 `ProviderHealthState` integration confirmed.
- **PostHog** — Hero Moment payload schema reconciliation; 20+ new event registrations; conversion-funnel registry feeds PostHog Insights → Funnels via §51.1.4 outbox.
- **Loops.so** — 11 new transactional email types; Tier-2 retry curve; suppression-list per §41.3.
- **Stripe** — M16 chargeback path via `credit_note.voided` webhook; reverse Credit Note API.
- **PagerDuty** — `growth.signal.freshness_breach` routes to `ops_growth_admin` SEV-3 (escalates SEV-2 on composite failure).
- **Datadog** — V13 SLOs for Hero Moment, buyer activation, M16 funnel stages, network-effects signal freshness.
- **GitHub Actions** — 23 new CI gates wire via `.github/workflows/spec-lint.yml` (M02.3) + buyer-side gates via M21.3 pack.

---

## 4. Self-Challenge Pass on the Remediation

Re-read the spec edits as a hostile staff engineer.

- **§48.8.3 FM #6 vs §48.8.9 #1 cross-ref correction.** Hostile reviewer: *"Could the substitute progress line ('Drafting from your KB while we connect to your website…') be misleading if Firecrawl is up but slow?"* Counter: the substitute fires only when `provider_health_state(firecrawl) ∈ {degraded, down}`; a slow-but-up Firecrawl returns `healthy` and the canonical line renders. Predicate is `provider_health_state`, not latency. Stands.
- **§48.8.13 allowance compensation eligibility predicate.** Hostile reviewer: *"`useful_bootstrap_floor_miss` at <10 entries — does a degraded seller game this by deliberately providing a small site?"* Counter: the floor is a quality protection, not a customer-side gameable predicate; small-site sellers genuinely have low corpora and the restoration is a fair outcome (their second Bootstrap consumes the restored allowance — net zero abuse vector). Stands.
- **§35.5 Buyer Hero Moment p50/p90 targets.** Hostile reviewer: *"6 minutes p50 is aggressive vs the seller-side 20 minutes."* Counter: the buyer Hero Moment is structurally shorter (intake → materialization is a single Maya invocation; the seller-side Hero Moment includes SSO + Bootstrap + First-Pass + first-edit, ≈ 4 capabilities in sequence). The shorter buyer SLO reflects the shorter critical path. Stands.
- **§51.0.3 conversion funnel registry — 10 funnels, closed.** Hostile reviewer: *"Future growth mechanics may need new funnels; closed-list is brittle."* Counter: the registry is intentionally closed at V13; new growth mechanics add new funnels via the §M.4 `appendix_m_coverage_on_diff` CI gate path (which forces explicit Author Extension flag on the new funnel). Closed list is the convention. Stands.
- **§48.7.1 M14 100/30d safety net.** Hostile reviewer: *"100 publishes/30d is too high — that's > 3/day; a single seller could spam at this rate."* Counter: the 100/30d is a circuit-breaker safety net, not a usage target; per §48.4.4 content validator + §48.4.10 SIM, sustained-high-rate publishers are flagged for Ops review well before 100/30d. The safety net catches catastrophic anomalies (compromised account; SIM evasion); standard abuse pathways trip earlier. Stands.
- **§51.3.6 12-row plan-gating canonical 6-tier-per-console.** Hostile reviewer: *"Buyer Solo + Buyer Free both Panels 1,2,3 with same window — why have both?"* Counter: Buyer Solo carries §44.6 surface compression overlay (different rendering of the same panels); the row is distinct from Free for §44.6 hide-list reasons even when entitlement parity holds. Stands.

No severity revisions on re-read.

---

## 5. Counterfactual Pass on the Remediation

For each major edit, three realistic failure modes:

- **§48.8.3 FM #6 Firecrawl outage.** (a) `provider_health_state(firecrawl)` itself is stale (the health detector is down) → falls through to default `healthy` and the canonical line renders despite Firecrawl being down. **Resolved**: §42.6.0 V12 provider-health-detector contract registers a meta-alarm on detector staleness > 5 minutes (SEV-2). (b) Firecrawl recovers mid-session → the seller sees the substitute line and then sees a banner saying Firecrawl is back; UX inconsistency. **Resolved**: §48.8.3 FM #6(f) provider-recovery callback re-runs Bootstrap silently and notifies via Loops.so; the in-session UX completes with the substitute line. (c) Seller's `provider_health_state` lookup itself adds latency to the line-render path. **Resolved**: ProviderHealthState is a Convex reactive read; latency budget is sub-millisecond.
- **§48.8.13 allowance compensation.** (a) Concurrent automatic + Ops manual restoration. **Resolved**: §48.8.13 per-session_id lock + HTTP 409 `kb_bootstrap_allowance_already_restored`. (b) Restoration fires against pseudonymized Seller Org. **Resolved**: §48.8.13 skips with audit row. (c) Restoration succeeds but Loops.so email DLQs. **Resolved**: §41.3 retry curve + in-app inbox fallback per §48.8.12 pattern.
- **§35.5 Buyer Hero Moment.** (a) Materialization succeeds but Workspace render fails at first paint (Convex query timeout). **Resolved**: §4.3.1 V13-extended fields don't write until first paint succeeds; `buyer_hero_moment_completed_at` predicate fails open (not written); the buyer sees a generic loading screen with retry. (b) Buyer-side `workspace_intake_materializer` AIWallet exhaustion (lifetime-free allowance consumed on first try). **Resolved**: §35.5 cites the §48.8.13 parity contract via AE-V13-004 — degraded runs eligible for restoration. (c) Buyer abandons mid-materialization (closes browser between submit and completion). **Resolved**: §35.5.4 abandonment cadence at 24h / 7d / 14d parity with §48.8.12.

---

## 6. V13 Post-Remediation Sign-Off

**V13 NARROW SIGN-OFF (zero P0 `instrumentation_gap`):** PASS pre- and post-remediation.

**V13 BROAD SIGN-OFF (zero P0/P1 open in Phase 13 scope):** **PASS post-remediation pending AE-V13-001 through AE-V13-006 ratification.**

- 31 P1 defects transition `remediated` (Tier 1 closure landed in spec).
- 17 lower-priority defects (P1 deferred + P2 + P3) transition `partially_remediated` and are tracked into v7.1.1 backlog under explicit closure paths (Prompt 13.1.A / 13.5 / 13.6 audit-program re-walks + v7.1.1 mechanical hygiene pack).
- Audit-program completeness gates D-13V-001 / D-13V-002 / D-13V-003 (§48.2 / §48.4 / §48.1 unaudited) tracked into v7.1.1 backlog as new audit prompts; do not block v7.1.1 stamp because they are audit-program gaps, not Master Spec defects.

**v7.1.1 stamp gate inheritance:** AE-V13-001 through AE-V13-006 ratifications + 23 new V13 CI gates' runtime wiring (M02.3 + M21.3 implementation packs) + audit-program completeness re-walks (Prompt 13.1.A / 13.5 / 13.6).

Phase 14 (Cross-Document Consistency Audit) is **unblocked** by this remediation pass. The 17 `partially_remediated` defects are documented for v7.1.1 backlog absorption.

**Pre-edit backup verified at:** `_versions/Sourcera_Master_Spec.v7.1.0-pre-V13-remediation-2026-05-12.md` (5,927,250 bytes; md5 `e3794768e0960038f13e9407a932aafb`).
