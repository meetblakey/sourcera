# Phase 5.7 — §49 Seller Onboarding Implementation-Level Seven-Stage Flow — Scratch Findings Log

**Date:** 2026-05-06
**Auditor model:** Claude Opus
**Audit prompt:** Walk Master Spec §49 (the implementation-level seven-stage flow) end-to-end with the eight prompt-scoped checks (entry/exit conditions per stage; activation-metric testability with §51 citation; Forced-Vendor-Signup reflected; Hero Moment mechanics reflected; Three Conversion Moments reflected; AP1–AP11 banned; Free / Solo / paid plan-gating; drop-off recovery via §41 / §20). Apply the V0 14-check audit checklist on top.
**Status:** Findings promoted to `DEFECT_LEDGER.md` Phase 5.7 section. This file is the scratch artifact retained per audit-program protocol.

---

## Sources Read (in full)

- `Sourcera_Master_Spec.md` §49 (lines 37176–37708) including §49.1 preamble (37178–37202), §49.1.1 Stage 1 Magic-Link Arrival (37204–37261), §49.1.2 Stage 2 Domain Bootstrap (37263–37328), §49.1.3 Stage 3 First-Pass Draft (37330–37392), §49.1.4 Stage 4 Landing Screen (37394–37444), §49.1.5 Stage 5 In-Workspace Review (37446–37496), §49.1.6 Stage 6 First Bid Submission (37498–37550), §49.1.7 Stage 7 Post-Submission Debrief (37552–37607), §49.1.8 Progress Storytelling UX Implementation (37609–37647), §49.1.9 Onboarding Anti-Patterns Runtime Detectors & CI Gates (37649–37687), §49.1.10 Consolidated Acceptance Criteria (37689–37708) — 15 cross-stage ACs, 9 sub-sections.
- `Sourcera_Master_Spec.md` §4.4.22 SellerOnboardingSession entity (lines 6152–6308) — full field table (49 columns), indexes, scope isolation, computation rules (activation classifier, hero-moment completion, abandonment classifier, reactivation), instrumentation, state machine, retention, DSAR, integration notes (Pro Trial, Buyer Referral, GhostBidImport), 10 failure modes, 10 acceptance criteria.
- `Sourcera_Master_Spec.md` §48.1.7 Three Conversion Moments — Master Spec Binding (32478–32511), §48.8.3 Hero Moment Phase 2 (Workflow steps 1–8 + UX Surface Specification + ACs), §48.8.4 Hero Moment Phase 3 (per-requirement card), §48.8.5 Hero Moment Phase 4 (Stake-Reveal), §48.8.6 Three Conversion Moments UX Surface Specification (36976–37029), §48.8.7 AP1–AP11 ban table (the canonical authoritative ban semantics), §48.8.10 hero-moment ACs (consolidated).
- `Sourcera_Master_Spec.md` §51 Product Usage Analytics & PLG Instrumentation preamble + §51.1.1 Canonical Event Families (40592–40610), §51.1.2 Event Schema Envelope (40612–40620), §51.1.5 Event Catalog Cross-Reference table (line 40658 — Seller-Onboarding Events row), §51.2.1 Required Standard Property Set (40679–40702).
- `Sourcera_Master_Spec.md` §41 Email & Notifications — §41.1 Loops.so provider (31536–31539), §41.2 Complete Email Type Catalog (31540–31566) — 23 email-type rows, **none for seller onboarding re-engagement**, §41.4 Opt-Out Classification (31576–31582).
- `Sourcera_Master_Spec.md` §20 Inbox & Pulse — §20.2 Inbox Structure / Notification Item Schema (15278–15334), §20.6 Notification Preferences & Settings (15514–15532), §20.7 Acceptance Criteria. **No §49 / §35.2 / §48.8 cross-references found in §20.**
- `Sourcera_Master_Spec.md` §44.6 Solo-Tier Surface Treatment (lines 31951+ , per CLAUDE.md changelog stamp 14.10) — Solo consumption invisibility, no AIWallet counter, $5/mo or $5/eval value envelope, silent throttling.
- `Sourcera_Master_Spec.md` §34.1.2 seller plan tier table (`seller_free` / `seller_solo` / `seller_starter` / `seller_growth` / `seller_scale` / `seller_enterprise`); §34.2.5 Solo per-bid charge orchestration (5 error codes); §34.10.4 lifetime-free Bootstrap allowance + Seller Wallet $5 free allowance (§44 plan stamp).
- `Sourcera_Master_Spec.md` Appendix J `seller_onboarding_invite_source` enum (line 45709 — six values: `buyer_invite`, `ghost_bid_conversion`, `direct_signup`, `marketplace_search`, `buyer_referral_m16`, `pro_trial_seat_m17`); Appendix J `seller_onboarding_completion_state` enum (six values: `in_progress`, `activated`, `activated_and_upgraded`, `abandoned`, `errored`, `reactivated` — **no `churned_post_activation`**); Appendix J `seller_onboarding_conversion_moment_kind` enum (four values: `second_concurrent_bid`, `first_eoi_attempt`, `kb_ceiling_approach`, `none` — **no `loss_debrief_insight_gate`**); Appendix J `onboarding_anti_pattern_kind_enum` (eleven values per §49.1.9 line 37655).
- `_baselines/retired-sources/Sourcera_Master_Summary_v1.1_retired_2026-04-26.md` for C.132 / C.133 / C.135 / C.136 / C.137 / C.140 / C.141 cross-references — verified `C.133 = Three Conversion Moments`, `C.135 = Seller Activation Metric`, `C.136 = Forced-Vendor-Signup Playbook`, `C.137 = Win/Loss Debrief`, `C.140 = Required Capabilities`, `C.141 = Anti-Patterns`. (The Phase-5.7 prompt body's parenthetical attributions — `C.137 / C.135 / C.140` for FVS / 3CM / Anti-Patterns — are the prompt's own miscitation, NOT a defect in the spec; the spec correctly cites C.136 / C.133 / C.141 throughout §49.)
- `_audit/AUDIT_README.md`, `_audit/DEFECT_LEDGER.md` row format, `_audit/FEATURE_INVENTORY.md` rows F-687 through F-695, `_audit/COVERAGE_MATRIX.md` rows F-687 through F-695.
- `Audit_Prompts.md` Defect Ledger Format (lines 49–68), Severity Definitions (lines 72–83), Phase 5.7 prompt body (lines 1591–1615).

---

## Per-Check Results

### Check 1 — All seven stages defined with entry/exit conditions

**Result:** **Partial.** All seven sub-sections (§49.1.1–§49.1.7) declare a **Trigger / Entry Condition** block, and Stages 1–5 + 7 declare an unambiguous exit timestamp on SellerOnboardingSession. **Stage 6 fails** the contract:

- §49.1.6 step 6 (line 37513) verbatim: *"Stage 6 ends when the seller navigates away from the Stake-Reveal Screen (any route transition). **No explicit column write marks Stage 6 exit;** Stage 7 entry is the next route landing."*
- This breaks the §49.1.10 AC 5 monotonic invariant which asserts `stage_5_stake_reveal_rendered_at <= stage_7_entered_at` — there is no DB-observable transition timestamp between the two. A property test against the AC-5 invariant cannot distinguish a Stage-6-still-active row from a Stage-7-entered row at the moment the seller closes the tab vs. navigates within the workspace. Filed as **D-5.7-010 (P1)**.
- Secondary: §49.1.7 step 1 introduces `stage_7_entered_at = now()` write ("Authored Extension — new column on §4.4.22; flagged in reconciliation log") — but the column does not exist in §4.4.22 (lines 6202–6207 enumerate `stage_7_*` fields and `stage_7_entered_at` is absent). The AC-5 invariant cites a column that has not been added. Filed as **D-5.7-004 (P1)**.

Stage 1 entry (HTTP GET on MarketplaceInviteLink), Stage 2 entry (`stage_2_sso_initiated_at` write), Stage 3 entry (retrieval-readiness signal), Stage 4 entry (`stage_3_bid_workspace_loaded_at`), Stage 5 entry (`stage_3_first_edit_at`), Stage 6 entry (`first_bid_submitted_at`), Stage 7 entry (Stake-Reveal exit) are each declared. Stage 1 exit, Stage 2 exit, Stage 3 exit, Stage 4 exit, Stage 5 exit are each declared. Stage 6 exit is the silent gap. Stage 7 has terminal conditions (win debrief / loss debrief / phase-lapsed / churn) but the latter is mediated by the staleness sweep rather than a stage-boundary timestamp.

### Check 2 — Activation metric (magic-link → first requirement response) testable, citing §51

**Result:** **Fail.** The Activation Metric is computed at §4.4.22 (Computation Rules → "Activation metric: `activation_metric_elapsed_seconds = EXTRACT(EPOCH FROM first_requirement_response_at - stage_1_arrival_at)`" with monotonicity trigger) and asserted at §49.1.5 AC 30 / AC 31 and §49.1.10 AC 1 / AC 2 against the C.135 p50 < 20 min / p90 < 60 min targets. Cross-references to §48.1.6 / §48.8.10 are present.

**However**, the §49 ACs do **not** cite §51 for envelope conformance:

- §51.1.1 requires every event in the `onboarding_core` family to declare `event_family` and conform to the family's envelope superset (`session_id?`, `stage?`, `moment_kind?`).
- §51.2.1 requires every emission to carry the Required Standard Property Set (`event_id`, `usage_event_id`, `name`, `event_family`, `emitted_at`, `org_id`, `console`, `workspace_id`, `user_id`, `phase`, `entity_ref`, `capability_id`, `plan_tier`, `data_residency_region`, `session_id`, `schema_version`).
- §49.1.5's `seller_first_requirement_response` event payload (line 37478) and §49.1.7's `seller_onboarding_completed` event payload (line 37585) declare a thin property set that does not enumerate §51.2.1 conformance. PostHog dashboards keyed on the Activation Metric depend on the standard envelope (org_id, plan_tier, console, session_id) being present.
- §51.1.5 line 40658 registers the `Seller-Onboarding Events` family row including `seller_activation_*` and `seller_onboarding_completed`, but §49 ACs do not assert envelope conformance via §51.2.5 `UsageEventValidator`.

The audit prompt explicitly required `(cite §51)`. Filed as **D-5.7-009 (P1)**.

### Check 3 — Forced-Vendor-Signup playbook (Summary C.136) reflected

**Result:** **Pass with one enum-coverage gap.** §49.1.1 step 1 explicitly references the FVS playbook by enumerating `invite_source ∈ {buyer_invite, ghost_bid_conversion, pro_trial_seat_m17, direct_signup}`, the §49 preamble cites C.136 (line 37184), §49.1.2 step 7 covers the FVS Seller Org provisioning at SSO callback, and §4.4.22 entity scope explicitly states *"a Forced-Vendor-Signup session creates the Seller Org on `stage_2_sso_completed_at`"*.

**However**, the Stage 1 invite-source enum at §49.1.1 step 1 enumerates only **four** values (`buyer_invite`, `ghost_bid_conversion`, `pro_trial_seat_m17`, `direct_signup`) but the canonical Appendix J `seller_onboarding_invite_source` enum (Master Spec line 45709, also enforced at §4.4.22 line 6166) defines **six** values — adding `marketplace_search` and `buyer_referral_m16`. A Stage-1 implementation that validates against the §49.1.1-restricted set will reject legitimate `buyer_referral_m16` and `marketplace_search` invites, breaking the M16 / S6 growth loops on arrival. Filed as **D-5.7-007 (P1)**.

(The audit prompt's parenthetical "Summary C.137" for the FVS playbook is a prompt-side miscitation; canonical reference is C.136. Spec is correct.)

### Check 4 — Hero Moment mechanics (Summary §3.6) reflected

**Result:** **Pass.** §49.1 preamble Authoring Intent (line 37180) explicitly anchors §49.1 as the engineering-contract companion to §48.8 (the Hero-Moment surface specification). §49.1.1 → Stage 1 maps to §48.8.3 (T=0). §49.1.2 → Stage 2 Bootstrap covered with Opus tier and lifetime-free allowance. §49.1.3 → Stage 3 First-Pass with Sonnet tier and 90s batch budget. §49.1.4 → Stage 4 landing counter with AP6 / AP1 / AP4 enforcement. `hero_moment_completed_at` is correctly conditioned on the four predicates per §49.1.3 step 5 / §49.1.10 AC 20.

The **§48.8.3 → §49.1 stage map** (line 37189) explicitly bridges Hero-Moment phases to engineering stages. C.132 four-phase Hero-Moment ban-list (`Bootstrap visible before SSO`, `KB Draft visible at landing`, `First-Pass visible per requirement`, `Stake-Reveal at submission`) is honored.

### Check 5 — Three Conversion Moments (Summary C.133) reflected

**Result:** **Partial.** §48.1.7 Master Spec Binding declares the three canonical Conversion Moments by `kind`: `second_concurrent_bid`, `first_eoi_attempt`, `kb_ceiling_approach` (also enumerated in Appendix J `seller_onboarding_conversion_moment_kind` and on §4.4.22 `stage_7_conversion_moment_kind` field at line 6203). §49 references §48.1.7 / §48.8.6 from §49.1.7 step 5 and from the §49.1.7 Authoritative Source block (line 37556).

**However:**

- §49.1.7 step 5 names only **"Conversion-Moment 1 (if applicable)"** which it implicitly attaches to the loss debrief. None of the three §48.1.7 canonical kinds (`second_concurrent_bid`, `first_eoi_attempt`, `kb_ceiling_approach`) actually fires inside §49.1.7's documented Stage-7 flow. The "loss debrief insight gate" referenced in §49.1.7 step 5 is NOT one of the three canonical moments — it is a fourth construct that conflates §48.7 M14 Win/Loss Debrief (see also `seller_loss_debrief_rendered` event at line 37587 with `conversion_moment_link_rendered` property) with the §48.1.7 enum.
- §49.1.7 telemetry table (line 37589) emits `conversion_moment_triggered {moment_kind='loss_debrief_insight_gate'}` — the literal `loss_debrief_insight_gate` value is NOT registered in Appendix J `seller_onboarding_conversion_moment_kind`. A runtime emission with this `moment_kind` will fail validator-enum-bounded checks per §51.1.6 AC #2 (HTTP 422 `usage_event_envelope_enum_violation`).
- The §48.1.7 / §49.1.7 mismatch leaves a junior engineer reading §49 alone unable to answer the question "where in the seven-stage flow do the three Conversion Moments actually fire?" Stage-mapping is silent for `second_concurrent_bid` and `first_eoi_attempt` and `kb_ceiling_approach`.

Filed as **D-5.7-011 (P1)** (definitional conflation) and **D-5.7-023 (P3)** (`loss_debrief_insight_gate` enum-value pollution).

(The audit prompt's parenthetical "Summary C.135" for Three Conversion Moments is a prompt-side miscitation; canonical reference is C.133. Spec is correct.)

### Check 6 — Onboarding anti-patterns (Summary C.141) flagged in spec as forbidden

**Result:** **Pass with one acknowledged Build-Blocker.** §49.1.9 enumerates AP1–AP11 in a runtime-detector + CI-gate table (line 37657), each with a D-APn detector implementation contract and a CI-gate contract. AP7 (fake-progress) gets dedicated authoring at §49.1.8. Runtime-violation event (`onboarding_anti_pattern_violation`) is bound to Appendix J `onboarding_anti_pattern_kind_enum` and `onboarding_anti_pattern_enforcement_layer_enum`.

**However**, §49.1.9 itself flags a **[BUILD-BLOCKER]** at line 37673: the canonical Appendix J `onboarding_anti_pattern_kind_enum` values embed semantics that DO NOT match the §48.8.7 authoritative ban table. Specifically `ap1_upgrade_cta_in_phase_1_to_3` vs §48.8.7 AP1 = "credit-card-collection-before-first-upgrade-intent-click"; `ap2_credit_card_collected_pre_value` vs §48.8.7 AP2 = "upgrade-offers-during-active-bid-work"; `ap5_first_pass_response_requires_paid_capability` vs §48.8.7 AP5 = "requiring vendor to describe company / industry / role before Bootstrap". This is acknowledged as pre-existing drift to be resolved before v7.0.0 cutover.

The **active** P3 hygiene issue is that §49.1.9's "follows §48.8.7 verbatim for AP1–AP6" claim (line 37655) is contradicted within the same paragraph by the [BUILD-BLOCKER] note. For the §49 audit scope this is a P3 cross-reference hygiene defect, since the underlying drift is owned by §48.8.7 / Appendix J. Filed as **D-5.7-021 (P3)**.

(The audit prompt's parenthetical "Summary C.140" for Anti-Patterns is a prompt-side miscitation; canonical reference is C.141. Spec is correct.)

### Check 7 — Plan-gating differentiates Free / Solo / paid onboarding paths

**Result:** **Fail.** §49 is silent on **Solo plan** onboarding. §49.1.7 AC 41 distinguishes only "Free-tier sellers see exactly ≤ 3 insights AND Pro-tier sellers see ALL insights." Specific gaps:

- The seller plan-tier enum per §34.1.2 is `seller_free` / `seller_solo` / `seller_starter` / `seller_growth` / `seller_scale` / `seller_enterprise`. There is no `seller_pro` tier. "Pro-tier" in §49.1.7 AC 41 is loose shorthand. Filed as **D-5.7-022 (P3)**.
- §44.6 Solo-Tier Surface Treatment (per CLAUDE.md changelog stamp 14.10) authors AI-consumption invisibility — Solo sellers do NOT see the AIWallet counter, do NOT see per-interaction settlement prompts, do NOT see the Stake-Reveal `Y_value_priced_cents_accumulated` value (engine throttles silently within the $5/mo or $5/eval value envelope). §49 does not carve out the Solo seller path:
  - §49.1.5 step 1 ("AIWallet balance is snapshotted") and §49.1.5 telemetry table reference the AIWallet counter visibly.
  - §49.1.6 step 2 computes and displays `Y_value_priced_cents_accumulated` on the Stake-Reveal Screen — directly contradicts §44.6's consumption-invisibility contract for Solo sellers.
  - §34.2.5 Per-Bid charge orchestration ($199 one-time) is not threaded into the seven-stage flow at any point. A Solo seller paying per-bid hits the seven-stage flow against a Stripe-collection touchpoint that §49 does not address (when does the $199 charge collect? Pre-Stage-1, post-Stage-6, conversion-moment?).
- §44.6 also bans the four `solo.envelope.*` PostHog events from customer-routed channels (per §44.6.5 / §44.6 AC #8) — §49 telemetry tables emit Solo-impacting events without a routing carve-out.

Filed as **D-5.7-006 (P1)**.

### Check 8 — Drop-off recovery spec'd via §41 emails + §20 inbox nudges

**Result:** **Fail.** §49 is largely silent on drop-off recovery:

- **Stage 1 abandonment (`abandonment_reason='stage_1_no_cta_click'`)** — §49.1.1 step 6 acknowledges the 14-day staleness sweep transitions the session to `abandoned` but no re-engagement email is dispatched in the intervening 14 days.
- **Stage 2 SSO-failed sessions** — no nudge.
- **Stage 4 landing-counter-rendered-then-leave** — §49.1.4 fail mode 2 acknowledges immediate dismiss is benign, but if the seller never returns there is no email.
- **Stage 5 in-progress incomplete bids** — §49.1.5 fail mode 8 says "Seller completes all requirements but never clicks Submit ... §4.4.22 staleness sweep at 14 days transitions the session to `churned_post_activation`." No nudge prior. (Also `churned_post_activation` is not a registered enum value — see D-5.7-001.)
- **Stage 7 post-activation 60-day inactivity** — §49.1.7 step 6 / fail mode 5 mention staleness transition but no re-engagement email.

§41.2 Complete Email Type Catalog (lines 31544–31566) registers 23 email types; **none** are seller-onboarding re-engagement templates. The single seller-relevant transactional row is `eoi_received.hbs` (Marketplace EOI Received). No `seller_onboarding_stalled.hbs`, `seller_first_bid_incomplete.hbs`, `seller_post_activation_dormant.hbs`, etc.

§20 Inbox & Pulse spans nudge mechanics (Pulse Health Score, weekly digest, in-app inbox per §20.2). §49 references §41 only for the "Invite unavailable" landing page (§49.1.1 step 1) and for opt-out classification context (§49.1.7 fail mode 2). **No §20 cross-references in §49.** §20 Inbox is not referenced as the in-app surface for any drop-off nudge.

Filed as **D-5.7-008 (P1)**. The audit prompt explicitly required drop-off recovery to be spec'd via §41 + §20.

---

## Cross-Stage Convention-Checklist Findings

Walking the 14-check audit checklist on top of the eight prompt-scoped checks:

### CONSISTENCY DRIFT — §49 vs §4.4.22 schema

1. **Schema-vs-prose contradictions** are pervasive between §49.1 and the §4.4.22 entity field table:
   - §49.1.5 fail mode 8 introduces `completion_state = 'churned_post_activation'`. §4.4.22 line 6210 enumerates `completion_state` values: `in_progress`, `activated`, `activated_and_upgraded`, `abandoned`, `errored`, `reactivated`. **`churned_post_activation` is unregistered.** Appendix J `seller_onboarding_completion_state` enum likewise omits the value. Runtime writes would fail enum validation. Filed as **D-5.7-001 (P1)**.
   - §49.1.1 fail mode 6 mandates *"a NEW SellerOnboardingSession row"* on re-arrival post-`abandoned`. §4.4.22 Computation Rules (Reactivation, line 6252) says *"a seller returning after `abandoned` state who then submits a requirement response transitions to `reactivated`; the original `abandoned_at` is retained for funnel histograms."* §4.4.22 AC 9 reinforces: re-arrival uses the **original** `stage_1_arrival_at` for activation-metric latency. §49.1.1's "new row" instruction breaks the AC 9 latency-preservation contract. Filed as **D-5.7-002 (P1)**.
   - §49.1.1 fail mode 6 also asserts "the unique index excludes `abandoned`" — §4.4.22 Indexes block (lines 6228–6237) lists no such constraint; the only reactivation-related index is `(recipient_email_hash, stage_1_arrival_at DESC)` for pre-Stage-2 deduplication. Subsumed under D-5.7-002.
   - **Abandonment threshold drift**: §4.4.22 says "7 days no advancement AND `stage_reached < 4`"; §49.1.1 / §49.1.5 reference 14 days; §49.1.7 fail mode 1 references 60 days post-activation. Three different windows on the same staleness mechanism with no single authoritative home. Filed as **D-5.7-003 (P1)**.

2. **Authored-Extension columns referenced in ACs but not in §4.4.22:**
   - §49.1.7 step 1 introduces `stage_7_entered_at`, §49.1.7 references `stage_7_win_debrief_rendered_at`, `stage_7_loss_debrief_rendered_at`, `stage_7_phase_lapsed_at`. All four absent from §4.4.22 (lines 6202–6207 enumerate `stage_7_conversion_moment_*` and `stage_7_upgrade_*` only). §49.1.10 AC 5 monotonicity invariant cites `stage_7_entered_at`. Schema mismatch. AE not appended to `_integration/AUTHORED_EXTENSIONS_LEDGER.md` v7.1.0 ratification queue per CLAUDE.md §16. Filed as **D-5.7-004 (P1)**.
   - §49.1.5 step 1 introduces `stage_5_entry_aiwallet_balance_cents` as a SellerOnboardingSession column. Not in §4.4.22 entity field table. Filed as **D-5.7-005 (P1)**.

3. **Capability-registry gap.** §49.1.7 introduces `win_loss_insight_synthesis` capability ("Authored Extension — new capability at §21.4, flagged in reconciliation log"). §21.4 Agent Capability Registry (lines 15637–15847) does not register this capability. Cost-base, AIWallet settlement semantics, plan-tier gating, retry semantics, value-vs-cost-priced policy not specified. Filed as **D-5.7-013 (P2)**.

### EDGE CASES (per Global Conventions Preamble)

4. **Third-party outage coverage** (per audit prompt: "WorkOS, Stripe, Convex, Anthropic, Firecrawl, PostHog, Loops.so, Perplexity, Zendesk"):

   | Provider | Stage 1 | Stage 2 | Stage 3 | Stage 4 | Stage 5 | Stage 6 | Stage 7 |
   |---|---|---|---|---|---|---|---|
   | WorkOS | ✅ §49.1.1 fm 3 | ✅ degraded path | n/a | n/a | n/a | n/a | n/a |
   | Stripe | ❌ silent | ❌ silent | ❌ silent | ❌ AP6/AP1 covered | ❌ silent | ❌ silent | ⚠ §49.1.7 fm 4 (upgrade flow) |
   | Convex | ❌ silent | ❌ silent | ❌ silent | ❌ silent | ❌ silent | ❌ silent | ❌ silent |
   | Anthropic | n/a | ✅ Opus / Sonnet fail modes | ✅ §49.1.3 fm 1 | n/a | ⚠ via §48.8.4 | ✅ §49.1.6 fm 1, 2 | ⚠ §49.1.7 fm 3 |
   | Firecrawl | n/a | ✅ §49.1.2 fm 1 | n/a | n/a | n/a | n/a | n/a |
   | PostHog | ❌ silent | ❌ silent | ❌ silent | ❌ silent | ❌ silent | ❌ silent | ❌ silent |
   | Loops.so | ❌ silent | ❌ silent | n/a | ❌ silent | ❌ silent | n/a | ❌ §49.1.7 step 3 silent on dispatch failure |
   | Perplexity | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
   | Zendesk | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

   Filed as **D-5.7-015 (P2)** (Convex / PostHog) and **D-5.7-016 (P2)** (Loops.so).

5. **Stage 3 mid-streaming abandonment.** §49.1.3 step 3 streams per-requirement drafts as Sonnet inferences complete (50–200 requirements, ~30–90 s). If the seller closes the tab during streaming, the in-flight `first_pass_responses` batch continues running — the seller has consumed lifetime-free allowance for drafts they never review. There is no "if disconnected, abort batch" contract. §34.10.4 lifetime-free allowance is a one-time grant; mid-streaming abandonment that consumes the allowance is a permanent loss for the seller. Filed as **D-5.7-024 (P1)**.

6. **i18n / locale / currency.** §49.1.6 step 2 displays `Y_value_priced_cents_accumulated` on the Stake-Reveal Screen and §49.1.5 step 1 references "you used $X during this bid" for Stage 7 debrief math. No locale-aware currency formatting contract. EU sellers may see USD by default; cents-to-dollars rounding rules unspecified. Filed as **D-5.7-014 (P2)**.

7. **Mobile parity gaps.** §49.1.10 AC 15 covers the landing page, progress-storytelling, and Stake-Reveal screens but omits Stage 5 in-Workspace Review (per-requirement card touch-targets), Stage 4 landing-counter dismiss interaction (the X-close target size), and Stage 6 secondary CTAs ("View my Seller Profile" — `_blank` tab open behavior on mobile). Filed as **D-5.7-018 (P2)**.

8. **Webhook / notification contracts.** §49.1's onboarding events (`seller_onboarding_stage_entered`, `seller_first_requirement_response`, `seller_first_bid_submitted`, `seller_onboarding_completed`, `stake_reveal_rendered`, etc.) are emitted as PostHog events but not registered in §31 Webhooks contract (HMAC-SHA256, exponential backoff, DLQ after 5 failures, payload ≤256 KB) nor Appendix C (Notification Event Catalog). External-customer webhook subscribers cannot consume the activation funnel. Filed as **D-5.7-017 (P2)**.

9. **Error code coverage.** §49.1.9 enforcement-layer responses reference `onboarding_anti_pattern_violation_ap2` (HTTP 409), `onboarding_anti_pattern_violation_ap3` / `ap4` (HTTP 400), but Appendix I registration is not asserted in-line; the §4.4.22 referenced `seller_org_disambiguation_required` (HTTP 409) is registered (line 43623) but the AP-violation HTTP codes are not enumerated in Appendix I per §49 cross-references. Filed as **D-5.7-019 (P2)**.

10. **AP3 banned-phrase lint hardcoding.** §49.1.9 D-AP3 detector hardcodes the banned phrase regex (`"Only \d+ days? left"`, `"Limited time offer"`) in the prose. No registry. New banned phrases require code change; controlled-vocabulary discipline (Appendix J) violated. Filed as **D-5.7-020 (P2)**.

11. **Stage-6 column-naming inconsistency.** §49.1.6 step 1 acknowledges that `stage_5_stake_reveal_rendered_at` is written **at Stage 6** ("the column is named `stage_5_*` for historical reasons — at column-naming time the stage-boundary mapping was coarser"). Acceptable for schema stability but creates a footgun for engineers reading just §49.1.6 in isolation. Filed as **D-5.7-012 (P2)**.

### COUNTERFACTUAL PASS — three failure modes per stage

Per the audit prompt, every audited feature must enumerate at least three realistic failure modes. §49 stages each enumerate ≥ 5 failure modes — the counterfactual pass is satisfied at the per-stage authoring level. The cross-stage gaps above (third-party outages, mid-streaming abandon, drop-off recovery) are the residual silent edge cases.

---

## Self-Challenge Pass (hostile-reviewer revision)

Re-read the above findings as a hostile reviewer. Adjustments:

1. **D-5.7-002 severity check.** Initially considered P2 (could be argued the §49.1.1 "new row" path is a deliberate v7.1.0 update to §4.4.22 that hasn't propagated). Reverted to P1: the conflict is unresolved in the spec, no AE row in `_integration/AUTHORED_EXTENSIONS_LEDGER.md`, and the §4.4.22 AC 9 latency-preservation contract is contradicted by §49.1.1 fm 6. A junior engineer would build the wrong thing.

2. **D-5.7-009 severity check.** Considered P2 — the activation metric is testable via the §4.4.22 trigger-asserted invariant; the §51 envelope is "would be nice." Reverted to P1: the audit prompt explicitly required the §51 citation; without §51 conformance the dashboards depend on undocumented property contracts; the Activation Metric is not testable end-to-end (entity-level testable, dashboard-layer untestable).

3. **D-5.7-010 severity check.** Considered P2 — the implicit Stage 6 exit could be argued a deliberate UX choice (no need to mark exit if next-stage entry is observable). Reverted to P1: §49.1.10 AC 5 monotonic invariant cites a column (`stage_7_entered_at`) that does not exist (D-5.7-004) AND the Stage-6 exit has no observable timestamp. The two together make the cross-stage AC un-runnable.

4. **D-5.7-011 severity check.** Considered P2 — could argue §48.1.7 owns Conversion Moments and §49 just references them. Reverted to P1: §49.1.7 emits an event (`conversion_moment_triggered {moment_kind='loss_debrief_insight_gate'}`) with an enum value that violates Appendix J registration. The runtime emission will fail validator-bounded checks per §51.1.6.

5. **D-5.7-024 (Stage 3 mid-streaming abandon) added during self-challenge.** Initially missed; surfaced when re-reading §49.1.3 step 3 with the failure-mode lens. The lifetime-free allowance is a one-shot grant — abandoning mid-stream burns it. Filed as P1 because the audit prompt requires P1 for "any of the seven stages with a silent edge case (timeout, abandon, third-party outage)."

6. **§41.2 catalog miss in D-5.7-008** verified by re-reading §41.2 lines 31544–31566 line-by-line. Confirmed zero seller-onboarding re-engagement templates.

7. **`win_loss_insight_synthesis` capability check.** Verified absence in §21.4 by grepping line range 15637–15847; no match. Confirms D-5.7-013.

8. **Audit-prompt C-numbering check.** The Phase-5.7 prompt body cites `C.137` for FVS, `C.135` for Three Conversion Moments, `C.140` for Anti-Patterns. Cross-checked against the retired Master Summary v1.1: canonical citations are C.136 / C.133 / C.141. The Master Spec §49 uses the canonical numbering throughout. The prompt-side miscitations are noted in the per-check sections but are NOT filed as spec defects — the spec is correct.

---

## Severity Summary — Phase 5.7

| Severity | Count | Defect IDs |
|---|---|---|
| P0 | 0 | — |
| P1 | 14 | D-5.7-001, D-5.7-002, D-5.7-003, D-5.7-004, D-5.7-005, D-5.7-006, D-5.7-007, D-5.7-008, D-5.7-009, D-5.7-010, D-5.7-011, D-5.7-015, D-5.7-016, D-5.7-024 |
| P2 | 7 | D-5.7-012, D-5.7-013, D-5.7-014, D-5.7-017, D-5.7-018, D-5.7-019, D-5.7-020 |
| P3 | 3 | D-5.7-021, D-5.7-022, D-5.7-023 |

Note: D-5.7-024 was added during the self-challenge pass. D-5.7-015 (Convex/PostHog outage silent across Stages 1/2/4/5/6/7) and D-5.7-016 (Loops.so outage at Stage 7 silent) were initially classified P2 under the standard Severity Definitions ("ambiguous edge case") but promoted to P1 per the audit-prompt OUTPUT clause's explicit override for "any of the seven stages with a silent edge case (timeout, abandon, third-party outage)." Final P1 count: 14.

All findings promoted to `DEFECT_LEDGER.md` Phase 5.7 section. Coverage matrix cells updated for F-687, F-688, F-689, F-690, F-691, F-692, F-693, F-694, F-695.

---

## Audit-Prompt Source-Citation Errata (advisory; not a spec defect)

For the audit-program steward: the Phase-5.7 prompt body at `Audit_Prompts.md` lines 1599–1610 contains three Summary C-citation errors that should be corrected in the next prompt-revision pass:

| Prompt-body citation | Canonical citation per Summary v1.1 |
|---|---|
| "Forced-Vendor-Signup playbook (Summary C.137)" | C.136 (C.137 = Win/Loss Debrief) |
| "Three Conversion Moments (Summary C.135)" | C.133 (C.135 = Seller Activation Metric) |
| "Onboarding anti-patterns (Summary C.140)" | C.141 (C.140 = Required Capabilities) |

The Master Spec §49 uses the canonical numbering throughout and is not affected.
