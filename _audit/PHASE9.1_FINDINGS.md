# Phase 9 — Prompt 9.1 — Appendix G PostHog Event Taxonomy End-to-End Audit (2026-05-08)

**Scope.** Walk Appendix G end-to-end: preamble + 19 event blocks (Standard, Advanced Feature, Billing-Domain, KB / MCP / Managed-Agent, KB Value Capture, PLG / Growth-Loop / Anti-Spam, M1–M8, Taxonomy-Domain, Marketplace-Abuse-Domain, Marketplace-Signals-Domain, CRM-Sync-Domain, §48.6 M9–M13, §48.7 M14–M17, §48 PLG Hero Moment additions, §49.1 Seller Onboarding, §50 Ops Console, §51 Analytics Meta, §3 UX Token & State Catalog, §25.7 / §3.12 Internal-Comment + Presence + Unread). Plus the Appendix C ↔ Appendix G coverage assertions in §13.11, Phase 3V (Security / Console-Bridge / DSAR / WorkOS Group), §29 Marketplace Discovery, §31.8 Billing webhook → PostHog mirror.

**Inputs read end-to-end.**

- `Sourcera_Master_Spec.md` Appendix G (lines 42381–43426).
- `Sourcera_Master_Spec.md` Appendix C (lines 41835–42204) for webhook → PostHog mirror coverage assertions.
- `Sourcera_Master_Spec.md` §13.11 Defense View (lines 13382–13688) for the AC #18 Appendix G binding claim and the §13.11.12 failure-mode events.
- `Sourcera_Master_Spec.md` §13.12 Buyer Maya intake (lines 13691–13839) for the `workspace_intake_completed` registration claim.
- `Sourcera_Master_Spec.md` §29.1 / §31.8 / §34.16.7 webhook → PostHog mirror contracts (lines 25540–25980, 30190–30236).
- `Sourcera_Master_Spec.md` §48 PLG (Hero Moment, M1–M17), §49.1 Seven-Stage Flow, §51 Product Usage Analytics, §22 KB conversion moments — for the reverse-pass validation against the prompt's CRITICAL EVENTS TO CONFIRM list.
- `Sourcera_Master_Spec.md` §40.2 retention table and §51.7.5 retention by family — for retention-binding cross-check.

## Method

For each block in Appendix G, walked the six prompt checks (snake_case, properties, privacy, sampling, retention, cohort), the Appendix-C↔G coverage assertion, the preamble Required-Standard-Property-Set conformance, and the webhook → PostHog `.` → `_` transliteration contract from §31.8 AC #16. Reverse-pass against the prompt's 13 CRITICAL EVENTS TO CONFIRM. Self-challenge and counterfactual passes documented at the foot.

## Findings — Promoted to DEFECT_LEDGER.md as D-9.1-001 through D-9.1-021

### Cluster A — Coverage-invariant violations (Appendix C declares Appendix G registration; Appendix G never registers it)

| ID | Severity | Surface | Summary |
|----|----------|---------|---------|
| D-9.1-001 | P1 | §13.11 Defense View → Appendix G | `defense_view.generated`, `defense_view.regenerated`, `defense_view.regenerated_due_to_source_change` declared registered in Appendix G by AC #18 (line 13674) and Appendix C Coverage invariant (line 42153). NOT in any Appendix G table. CI gate `appendix_c_to_appendix_g_coverage` would fail. |
| D-9.1-002 | P2 | §13.11.12 fm #5 → Appendix G | `defense_view.generation_failed_third_party_outage` declared a PostHog event (line 13631) but unregistered. |
| D-9.1-004 | P1 | Appendix C Phase 3V (lines 42155–42204) → Appendix G | All 19 Phase-3V PostHog mirrors (5 Security-Domain, 1 Console-Bridge-Anomaly, 7 DSAR-Lifecycle, 6 WorkOS Group Lifecycle) asserted registered ("PostHog mirror. Every event above is registered in Appendix G…"; CI gate `appendix_c_to_appendix_g_coverage` extends). NONE registered in Appendix G. |
| D-9.1-005 | P1 | §34.16.7 (lines 30200–30216) → Appendix G | All 17 `marketplace_discovery` PostHog mirrors (`promoted_listing_*`, `featured_placement_*`, `verification_review_*`, `verification_tier_revoked`, `verification_recertification_due`, `marketplace_discovery_*`) listed in the "PostHog Parallel" column with §31.8 AC #16 mirror contract. NONE registered in Appendix G. |
| D-9.1-006 | P1 | §31.8 (lines 25540–25980) → Appendix G Billing-Domain block | §31.8 AC #16 mandates parallel PostHog events with `.`→`_` transliteration for all billing webhooks (`billing.ai_operation.settled`, `billing.ai_operation.contested`, `billing.plan.upgraded`, `billing.plan.downgraded`, `billing.plan.downgrade_scheduled`, `billing.committed_spend.contract_activated`, `billing.wallet.threshold_crossed`, `billing.wallet.hard_cap_reached`, `billing.wallet.unsuspended`, etc.). Appendix G Billing-Domain block (lines 42482–42498) registers only 7 events (`billing_wallet_viewed`, three `billing_contest_*`, `billing_auto_topup_executed`, `upgrade_cta_viewed`, `upgrade_completed`). 10+ canonical billing PostHog events MISSING. |
| D-9.1-010 | P1 | §13.12.7 / §13.12.10 AC #21 → Appendix G | `workspace_intake_completed` declared a PostHog event ("Appendix G — flagged Authored Extension; registration in §51 follow-up", line 13775). Follow-up registration never landed. The audit's expected `buyer_maya_intake_completed` is functionally unbuildable as written. |

### Cluster B — Naming-convention and enum violations within Appendix G

| ID | Severity | Surface | Summary |
|----|----------|---------|---------|
| D-9.1-007 | P1 | Appendix G dot-form events (multiple blocks) | The §48.7 normalization note (line 42952): "All event names are normalized to underscore form (per Appendix G naming convention)." Dot-form events still registered: §48.3.5 S1–S7 block (`match_score.calibration_event_recorded`, `ghost_bid_import.created`, `ghost_bid_import.k_anonymity_redacted`, `pro_trial_seat_grant.created`, `pro_trial_seat_grant.converted`, `template.featured_placement_earned`, `seller_org.invited_vendor_inventory_added`); §48.8.8 block (`kb_entry.q_and_a_onboarding_created`, `kb_entry.confidence_updated`); Internal-Comment-Domain block (9 events `internal_comment_thread.*`, `internal_comment_post.moderated`, `internal_comment_thread.firewall_violation_blocked`); Defense-View references (`defense_view.generated`, `defense_view.regenerated`, `defense_view.regenerated_due_to_source_change`). Per §31.8 AC #16 the underscore form is the canonical PostHog form; dot-form is for webhooks and notifications only. |
| D-9.1-008 | P1 | Preamble `sampling_rate` enum (line 42404) vs §49.1 (line 43222) | Preamble enum: `sampling_rate ∈ {1.0, 0.1, 0.01}`. §49.1 sampling discipline: `seller_first_pass_response_drafted` carries `sampling_rate=0.2` (1-in-5 sampling). 0.2 is NOT in the enum. Dashboards applying inverse-weighting on a closed-enum cardinality-bounded property would mis-weight 1-in-5 sampled rows. Either preamble enum extends to include 0.2, or §49.1 sampling rate moves to 0.1 and accepts the cap. |
| D-9.1-009 | P2 | Bare `plan_tier` property (multiple blocks) | Preamble registers `plan_tier_buyer` AND `plan_tier_seller` with mutual nullability rules. Bare `plan_tier` (KB Value Capture: `plan_tier`, `plan_tier_at_view`, `plan_tier_at_initiation`, `plan_tier_at_completion`, `plan_tier_at_failure`; Internal-Comment preamble: `plan_tier`; §49.1: `plan_tier_at_debrief`) is unscoped. Per §34.10.3 a single Org may carry buyer + seller plan-tier subscriptions concurrently — bare `plan_tier` cannot be unambiguously resolved without console context. |
| D-9.1-016 | P1 | §48 Hero Moment naming-reconciliation table (lines 43041–43048) | Six legacy event aliases declared retired at v7.1.0 ("Dual-emit through v7.0.x; legacy retired at v7.1.0"): `seller_onboarding_conversion_moment_recorded`, `stake_reveal_displayed`, `stake_reveal_dismissed`, `hero_moment_first_pass_response_submitted`, `seller_invite_pre_arrival_dispatched`, `seller_invite_pre_arrival_failed`. Spec is at v7.1.0 (header). Legacy events still registered as full Appendix G tables alongside canonical replacements with no "REMOVED at v7.1.0" annotation. Emitter behavior is ambiguous: emit canonical only, or both? §51 `usage_analytics_alias_retirement_overdue` would page on overdue legacy emissions. |
| D-9.1-015 | P3 | Preamble line 42385 vs §51.2.5 | Preamble: "rejected at the outbox validator with `usage_event_envelope_violation` (Appendix I)" conflates the Appendix I HTTP 422 customer-surface error code with the Appendix G PostHog meta-event `usage_analytics_envelope_violation`. Per §51.2.5 line 41110 the two names are functionally split. Preamble wording is a citation error. |

### Cluster C — Reverse-pass: critical events missing or under-specified

| ID | Severity | Surface | Summary |
|----|----------|---------|---------|
| D-9.1-003 | P2 | §13.11 Defense View | `defense_view_opened` and `defense_view_dismissed` events MISSING. Generation/regeneration events fire only on AIOperation invocation; per-open and per-close events are needed for funnel analysis (open-rate by tier, dwell-time, dismissal-method). The AC #18 binding does not mandate per-open events; OutcomeContract `accepted_signal` derives from DB `opened_at` field, not a PostHog event. |
| D-9.1-011 | P2 | Hero Moment seller-side bootstrap | `seller_kb_first_entry_indexed` (audit reverse-pass) is not registered. Closest event is `seller_bootstrap_entry_synthesized` (sampled 1-in-10, fires on every entry). The "first entry indexed" milestone is required for §48.1 PLG funnel "Bootstrap First Entry" stage. Currently derived from `seller_bootstrap_completed` carrying `entry_count > 0` — but that fires once at terminal state, not on the first-entry transition. |
| D-9.1-012 | P1 | §34.16.1 Promoted Listings | `marketplace_promoted_listing_clicked` (line 42472) carries an `impression_id` property — implying an upstream impression event. No `marketplace_promoted_listing_impression` event registered. CTR analytics and the `marketplace_promoted_click_through_rate` PostHog dashboard (line 30178) cannot compute denominator. Post-click EOI attribution similarly requires `marketplace_promoted_listing_eoi`; missing. |
| D-9.1-013 | P2 | §34.16.4 Featured Placement | `growth_loop_l9_featured_placement_shown` covers the impression. No `featured_placement_clicked` or `featured_placement_eoi` registered for the click-through and conversion attribution funnel. The 5 `featured_placement.*` webhook events (§29 lines 30206–30209) lack their PostHog click counterpart. |
| D-9.1-014 | P2 | §10 Pipeline / §17 Workspace Analytics | `buyer_evaluation_started` and `buyer_evaluation_completed` (audit reverse-pass) are not registered under those names. Workspace-lifecycle events (`workspace_created`, `workspace_archived`, `phase_advanced`) cover the underlying transitions, but the explicit "evaluation started → completed" funnel pair (referenced in §48.1 PLG funnel narrative) is missing as named — Phase ≥ 1 entry vs Phase 13 closure are derivable from `phase_advanced` but require analyst-side derivation and lack a binding contract. |

### Cluster D — Property-table and contract under-specification

| ID | Severity | Surface | Summary |
|----|----------|---------|---------|
| D-9.1-017 | P2 | Standard Events (lines 42423–42440) and Advanced Feature Events (lines 42446–42478) | Per-event property contract registers property NAMES only — no types, no nullability, no descriptions. Every other Appendix G block (Billing, KB, KB Value Capture, PLG, M1–M8, Marketplace Abuse, etc.) carries richer property type/enum/description annotations. The Standard / Advanced Feature events (`requirement_*`, `vendor_*`, `response_*`, `score_*`, `workspace_*`, `phase_advanced`, `intelligence_*`, `tco_*`, `marketplace_*`, `nda_signed`, `amendment_applied`) are operationally important and the property-type ambiguity is implementation drift risk. |
| D-9.1-018 | P2 | Cohort assignment rules (multiple blocks) | §48.6 / §48.4.7 events that gate on k-anonymity carry `k_anon_satisfied`, `cohort_size`, `floor` — explicit. §51 registers `usage_analytics_k_anon_floor_hit`. Internal Comment + Hero Moment + Standard / Advanced blocks do not specify cohort assignment rules even where fanout-dynamics imply suppression below k-floors (e.g., presence-fanout events on small workspaces, mention-events on tiny teams, `score_submitted` on a single-reviewer workspace). |
| D-9.1-019 | P1 | Preamble line 42416 retention contract | "Retention periods are defined in §40.2 and §51.7.5 by event family, not per-row." Several blocks (Standard Events, Advanced Feature Events, KB-Value-Capture, Defense-View references, Internal-Comment) do not declare event-family membership. Without explicit family binding the §40.2 / §51.7.5 retention rule is unenforceable; the §51.1.4 11-canonical-family registry has no row-level binding for these events. The `posthog_retention_family_binding` validator (implicit at §51.1.4) cannot resolve them. |
| D-9.1-020 | P3 | Customer-visibility classification (multiple blocks) | §50 (Ops events) and §51 (Analytics meta) explicitly declare per-event customer-visibility (dual-emit vs Sourcera-internal). Standard Events, Advanced Feature Events, Billing-Domain Events, Marketplace-Abuse Events, Marketplace-Signals Events, CRM-Sync Events, and Taxonomy Events blocks do not declare customer-visibility scope. Emitters cannot determine whether to dual-emit to the customer's PostHog project per §50.2.1. |
| D-9.1-021 | P2 | §31.8 AC #16 / §34.16.7 webhook→PostHog mirror | Mirror contract is silent on whether free-text webhook payload fields (`reviewer_notes_text`, `denial_reason_text`, `revocation_reason_text`, `editorial_rationale_text`, `cancellation_reason_text`, `failure_reason_text`) propagate to PostHog event-level properties. PostHog property cardinality budget and §40 PII redaction require explicit filter contract. Free-text in PostHog is unbounded cardinality + potential PII vector. |

## Self-Challenge Pass (Opus-mandatory)

Re-read every defect as a hostile reviewer:

- **D-9.1-001 / 004 / 005 / 006 / 010** (coverage-invariant violations): evidence is reproducible — quoted line numbers from Appendix C and section-level binding claims. Severity P1 is correct: these CI gates are not in `Build_Execution_Strategy.md` (would be P0); they are in Appendix C body and would fail at deploy validator. Recommendation is sharp: register the missing events in Appendix G under the appropriate domain block.
- **D-9.1-007** (dot-form): the §48.7 normalization note is the binding contract. Internal-Comment block explicitly violates it with 9 events. Reviewer might object that Internal-Comment events are "under construction" — but the block is registered, not a draft. Severity P1 stands.
- **D-9.1-008** (sampling_rate=0.2): hostile reviewer might say "the preamble enum should expand to {1.0, 0.5, 0.2, 0.1, 0.01} to accommodate any future sampling rate." Counter: the preamble's `Cardinality discipline` lists `sampling_rate` as a deliberately bounded property; expanding without registration is the defect. Severity P1 stands.
- **D-9.1-016** (legacy retirement at v7.1.0): hostile reviewer might say "the 'Dual-emit through v7.0.x' window already lapsed; emitters know to drop legacy." Counter: the legacy events are still registered as full tables; the phrase "Legacy name (pre-remediation) → Canonical name (§48.8.8)" inside Appendix G could be read as still-active dual-emit. Without an explicit "REMOVED at v7.1.0" annotation, junior engineers will not safely retire the legacy emitters. Severity P1 stands.
- **D-9.1-014** (buyer_evaluation_started/completed): rolled DOWN from P1 to P2 on self-challenge — `phase_advanced` + `workspace_created` + `workspace_archived` cover the underlying funnel transitions and can be aggregated by analysts. Naming-only gap that two readers can resolve consistently with `phase_advanced(from_phase=null, to_phase=1)` and `phase_advanced(to_phase=13)` proxy queries. P2.
- **D-9.1-002** (defense_view.generation_failed_third_party_outage): rolled DOWN from P1 to P2 on self-challenge — single failure-mode event, low blast-radius. The §13.11.12 fm #5 narrative is observable through `defense_view.regenerated` regeneration_reason_code or AIOperation reversal logs, so analysts have a fallback. P2.
- **D-9.1-013** (featured_placement clicked / EOI): rolled DOWN from P1 to P2 on self-challenge — `growth_loop_l9_featured_placement_shown` + `marketplace_eoi_submitted` (existing) cover the impression and EOI sides; only the click step is genuinely missing, and click can be derived from session-level navigation if the surface uses standard link telemetry. P2.

Severity revisions promoted into the ledger rows below.

## Counterfactual Pass (3+ realistic failure modes per defect)

Spot check on the most-impactful defects (D-9.1-004 Phase 3V, D-9.1-005 Marketplace-Discovery, D-9.1-006 Billing) — each with three failure modes:

**D-9.1-004 Phase 3V missing PostHog mirrors:**

1. *Partial failure.* DSAR `dsar.fulfilled` webhook delivered but PostHog mirror absent → DSAR-fulfilled-rate dashboard reads zero → SLA-breach false alarm → on-call paged for a non-incident → trust erosion. Spec does not address.
2. *Adversarial input.* Attacker triggers repeated `security.suspicious_login_attempt` webhooks at high rate → no PostHog mirror means anomaly-detection on the SIM dashboard is blind → SIM cannot quench → security incident undetected. Spec does not address.
3. *Dependency outage.* WorkOS down → `org.workos_groups_api_outage` webhook fires repeatedly → no PostHog mirror means Sourcera-internal availability dashboards do not reflect WorkOS impact → on-call doesn't know to escalate to WorkOS support. Spec does not address.

→ Counterfactual confirms D-9.1-004 severity P1.

**D-9.1-005 Marketplace-Discovery missing PostHog mirrors:**

1. *Partial failure.* `promoted_listing.auction_settled` webhook delivered, Stripe `promoted_listing.paid` follows, but PostHog `promoted_listing_paid` mirror absent → revenue reconciliation dashboard `marketplace_revenue_reconciliation` (§34.16.7 line 30220) reads zero → revenue forecasting model misses Promoted Listing line item → quarterly billing report incomplete. Spec invariant `marketplace_revenue_reconciliation` is not enforceable as written.
2. *Adversarial input.* Seller attempts to game the second-price auction by clearing & re-bidding within the auction window → without `promoted_listing_bid_submitted` PostHog event, anti-spam SIM cannot detect the velocity → §34.16.5 ad-blindness controls cannot tune.
3. *Verification revocation cascade.* `verification.tier_revoked` webhook fires on a seller with active Promoted Listing → no PostHog mirror means the `verification_tier_revoked` event does not feed the `featured_placement.cancelled` / `promoted_listing.terminated_eligibility_lost` chain → cascade-completion latency cannot be observed.

→ Counterfactual confirms D-9.1-005 severity P1.

**D-9.1-006 Billing-domain missing mirrors:**

1. *Partial failure.* `billing.ai_operation.settled` webhook delivered (financial-impact retry curve) but PostHog mirror missing → `billing_ai_operation_settled` 1-in-N sampled aggregate cannot compute → daily AIOperation-acceptance-rate dashboard reads zero → wallet-burn forecasting drifts.
2. *Idempotency replay.* §31.8 AC #2 ensures `billing.ai_operation.settled` fires exactly once per AIOperation; if the PostHog mirror is missing, exactly-once is not enforceable on the dashboard side and double-counting cannot be detected.
3. *Dependency outage.* Stripe outage → `billing.plan.upgraded` cannot fire → no PostHog signal of the failed upgrade → Sales-Ops dashboard shows a flat upgrade rate that may mask a 100% Stripe outage.

→ Counterfactual confirms D-9.1-006 severity P1.

## Reverse Pass — Critical events confirmation

| Audit-prompt event | Status | Evidence |
|---|---|---|
| `buyer_evaluation_started` / `_completed` | ❌ MISSING (D-9.1-014, P2) | Only `workspace_created`, `workspace_archived`, `phase_advanced` cover the underlying signal. Naming-only gap; analysts can derive but no canonical event. |
| `seller_first_response_submitted` (Hero Moment) | ✅ PRESENT (canonical: `seller_onboarding_first_requirement_response`, line 43142) | Plus retired alias `hero_moment_first_pass_response_submitted` (legacy). |
| `seller_kb_first_entry_indexed` (Hero Moment) | ⚠ PARTIAL (D-9.1-011, P2) | `seller_bootstrap_entry_synthesized` (sampled 1-in-10) covers per-entry; "first entry" milestone derivable but not directly emitted. |
| `seller_magic_link_clicked` | ✅ PRESENT (covered by `seller_onboarding_landing_rendered` + `m1_invite_clicked` + `seller_onboarding_session_created`). |
| `seller_seven_stage_advance_X` | ✅ PRESENT (canonical: `seller_onboarding_stage_entered` with `stage ∈ {1..7}`, §49.1 enum extension). |
| `buyer_maya_intake_completed` | ❌ MISSING (D-9.1-010, P1) | Spec uses `workspace_intake_completed` but it is "Authored Extension; registration in §51 follow-up" and never landed in Appendix G. |
| `defense_view_opened / dismissed` | ❌ MISSING (D-9.1-003, P2) | Generation events present; per-open and per-dismiss not emitted. |
| `promoted_listing_impression / click / EOI` | ⚠ PARTIAL (D-9.1-012, P1) | Click present (`marketplace_promoted_listing_clicked`); impression and EOI missing. |
| `featured_placement_impression / click` | ⚠ PARTIAL (D-9.1-013, P2) | Impression covered by `growth_loop_l9_featured_placement_shown`; click missing. |
| `verification_tier_upgraded` | ❌ MISSING in Appendix G (D-9.1-005, P1) | §29 PostHog parallel column lists `verification_review_approved` as the canonical mirror; never registered in Appendix G. |
| `contest_submitted / approved / rejected` | ✅ PRESENT (`billing_contest_submitted` / `_approved` / `_rejected`, lines 42487–42489). |
| `ai_operation_settled` (sampled) | ❌ MISSING in Appendix G (D-9.1-006, P1) | §31.8 AC #16 mandates `billing_ai_operation_settled` PostHog mirror; never registered. |
| `plan_upgraded / downgraded` | ⚠ PARTIAL (D-9.1-006, P1) | `upgrade_completed` + `upgrade_cta_viewed` present (line 42491–42492); `billing_plan_upgraded` / `billing_plan_downgraded` mirror events from §31.8 webhooks NOT registered in Appendix G — `upgrade_completed` is a different, narrower event. |

## Files updated this pass

- `/Sourcera/_audit/PHASE9.1_FINDINGS.md` (this file).
- `/Sourcera/_audit/DEFECT_LEDGER.md` (21 D-9.1-NNN rows appended).
- `/Sourcera/_audit/COVERAGE_MATRIX.md` (Appendix-G coverage update note appended).

## Phase 9.1 advancement

Halt-rule "zero unresolved P0 in Appendix G surface" — **PASS** (0 P0 by rule-based severity; the regulatory-criticality of DSAR mirrors is captured at P1 because the missing surface is observability, not regulatory-fulfillment itself). Advancement to Phase 9.2 (PostHog Outbox + DLQ + Validator) **UNBLOCKED**. Phase 9.2 inherits the 21 D-9.1-NNN defects for runtime-validator cross-check.
