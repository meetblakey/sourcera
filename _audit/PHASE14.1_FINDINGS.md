# Phase 14.1 — Master Spec ↔ Buyer Pricing Strategy v3 Cross-Doc Walk Findings

**Date.** 2026-05-12.
**Auditor posture.** Senior technical product strategist + staff engineer; Opus-grade depth; non-destructive audit.
**Source documents read end-to-end.** `Sourcera_Buyer_Pricing_Strategy.md` v3 (43 KB; 549 lines); `Sourcera_Master_Spec.md` v7.1.0 §34 (Pricing, ~3,900 lines from §34.1 to §34.20.7), §44.6 (Solo-Tier Surface Treatment, ~155 lines), §13.11 (Defense View, ~210 lines), §34.9 (Onboarding & Trial), §34.17 (Pricing Engineering Requirements), §34.18 (Financial Targets), §51 (PLG Instrumentation surface coverage check via Phase 13V verification log).
**Authoritative outputs.** Defect ledger entries D-14.1-001 through D-14.1-010 (10 rows; 4 P1 + 6 P2); CONSISTENCY_DELTA.md "Buyer Pricing v3" section.

---

## 1. Walk Methodology

The walk traversed BPS v3 in document order — §1 through §15 plus Appendices A and B — and for each substantive concept located the corresponding authoritative home in the Master Spec. For each pair, three checks: (a) the numerical / structural / behavioral content reconciles; (b) the spec is the single authoritative home (no inline restatement in BPS); (c) the spec is at least as complete as the BPS narrative (no narrative-vs-spec coverage gap).

Defects were filed only when a gap met all of: (i) the BPS v3 commitment is materially load-bearing for the v3 launch; (ii) the spec is silent on the dimension OR contradicts BPS narrative; (iii) the gap is not already filed in DEFECT_LEDGER.md (cross-checked against D-PXC-NNN, D-PT-NNN, D-AS-NNN, D-CONS-NNN clusters).

## 2. Pre-Existing Defect Cross-Check (Scope De-duplication)

The PHASE34.PXC walk (2026-05-07) and PHASE34.1 walk (2026-05-07) already filed the following BPS v3 ↔ Master Spec drift defects. Phase 14.1 confirms each is still `open` and does NOT re-file:

| Pre-filed defect | Severity | Scope it covers |
|---|---|---|
| D-AS-002 | P1 | BPS v3 §7 Enterprise volume-discount band (10% / 15% / 20% / 25%) inline restated — should cite §34.2.4 |
| D-AS-003 | P3 | §34.3.3 dual-citation drift on 88% margin floor source ("BPS §2.4" vs "BPS §2.6") |
| D-AS-004 | P1 | §34.18.3 Year-1 plan mix Solo omission (Buyer side: Free 60% / Starter 15% / Growth 10% / Scale 10% / Enterprise 5% — no Solo rows) |
| D-AS-006 | P3 | §34 preamble cites BPS v2 / SPS v2 citation key — should cite v3 |
| D-AS-011 | P2 | BPS v3 §13 "Convex compute ≈ 3% of AI cost" vs §34.14.1 "5% infra overhead" — non-comparable units, but both unauthored to a single home |
| D-PT-001 | P1 | Solo per-eval refund-window threshold canonicality (BPS v3 §5.4 says "not been opened ≥3 times"; §34.2.5 narrative says "≤ 3 times" with parenthetical "< 3 recipients OR < 3 distinct viewer sessions" — internal contradiction) |
| D-PXC-015 | P1 | §34.18.5 Free-to-paid scorecard rows omit Solo from paid-tier list ("Free → any paid Buyer tier (Starter / Growth / Scale / Enterprise per §34.1.1) within 90 days" — Solo missing) |

Phase 14.1 inherits these as cross-references; DEFECT_LEDGER.md `links` column on each new D-14.1-NNN row cites the relevant pre-filed defect.

## 3. Section-by-Section Walk (Findings → Defect Mapping)

### BPS v3 §1 Executive Summary → No new defects

- 6-plan structure, per-org pricing, AI-budget-included, ≥90% blended margin → §34.1.1 / §34.2.3 / §34.18.1 reconcile.
- Solo as personal-card on-ramp per §34.1.1 / §34.2.5.

### BPS v3 §2 Strategic Decisions → No new defects

- §2.1 / §2.2 / §2.3 / §2.4 / §2.5 / §2.6 / §2.7 / §2.8 — all 8 decisions map cleanly to §34.x homes.

### BPS v3 §3 Plan Architecture → No new defects (D-AS-002 pre-filed for volume bands)

- 30-row × 6-column plan-architecture table reconciles cell-by-cell with §34.1.1 / §34.1.2 / §34.2.1 / §34.2.2.
- Vendor-Funded Pro Trial Seat footer matches §34.13.

### BPS v3 §4 Free Plan → No new defects

- $5 budget, 25 vendors, 1 GB, 50 KB items, watermarked SR, Defense View preview, no overage / API → all reconcile.

### BPS v3 §5 Buyer Solo Plan → 1 new defect (D-14.1-003); 1 partial-cover (D-14.1-009)

- §5.1 Pricing options ✅ §34.2.1 / §34.2.5
- §5.2 Included ✅ §34.1.1 / §13.11.4 / §34.2.5
- **§5.3 Solo→Starter triggers ⚠ — the "≥ 3 throttle events / 30 day window" trigger has no engine-implementable home in spec → D-14.1-003 (P1)**
- §5.4 Per-eval billing mechanics ✅ §34.2.5 (D-PT-001 pre-filed for refund threshold canonicality)
- **§5.5 Surface discipline ⚠ — 3 of 8 items (plan-tier matrix; Pulse Health Score replacement; auto-assigned cohort taxonomy) absent from §44.6.1 + downstream sections → D-14.1-009 (P2)**
- §5.6 / §5.7 Fit / Anti-fit — narrative; not spec scope.

### BPS v3 §6 Business Plan → No new defects

- Starter / Growth / Scale rows reconcile with §34.1.1 / §34.2.1.

### BPS v3 §7 Enterprise Plan → No new defects (D-AS-002 pre-filed for volume bands)

- $3,000/mo floor, $12K/yr commit, dedicated CSM, SLA — all reconcile.
- Coupa / Ariba / ServiceNow / NetSuite named integration targets are companion-doc narrative latitude (spec authors generic "Custom Integrations: Scoped per contract"). Not filed.

### BPS v3 §8 Overage Pricing → No new defects

- Wallet defaults off, 22-capability rate card with new `defense_view_generate` Sonnet $0.80/$0.10, soft 80% notification, hard cap, auto-topup off — all reconcile.

### BPS v3 §9 API Add-On → No new defects

- $99/mo on Business+, included on Enterprise, NOT on Solo, rate-limited per tier — reconciles.

### BPS v3 §10 Required Platform Features → 1 new defect (D-14.1-010)

- Items #1–#10 (preserved from v2) ✅ map cleanly to §34.17.1 MS §2.11 baseline rows.
- **Items #11–#15 (v3 Solo additions: billing surface / per-eval orchestration / SR watermarking / Defense View preview gating / silent throttling) ⚠ — implemented across §44.6 / §34.2.5 / §13.11 but NOT registered in §34.17.1.b Authored Extensions enumeration → D-14.1-010 (P1)**

### BPS v3 §11 PLG Motion → 3 new defects (D-14.1-004, D-14.1-005, D-14.1-006)

- Paid path (Free → Solo → Starter → Growth → Scale → Enterprise) ✅ §34.5 / §48.
- Aha moment (first Pre-Scoring on Free) ✅ §13.
- Ceiling-trigger orchestration ✅ partial — most triggers ✅, throttle-events trigger ❌ (D-14.1-003 above).
- **Leading indicators ⚠ — 11 of 13 absent from §34.18.5 / §51 / Appendix G**
  - 9 funnel / behavioral metrics → D-14.1-006 (P2; aggregated)
  - Solo throttle event rate target → D-14.1-004 (P2; standalone because requires distinct event-aggregation engineering)
  - Per-cohort margin breakouts → D-14.1-005 (P2; standalone because requires distinct per-plan-tier margin attribution engineering)

### BPS v3 §12 Cost Adaptability → 1 new defect (D-14.1-008)

- Value-vs-cost formula adaptation ✅ §34.3.1 / §34.3.3.
- Quarterly review + 30-day notification + annual grandfathering ✅ §34.2.3 #7 / §34.5.1.
- **Solo dynamic-throttling-threshold adjustment ⚠ — BPS implies automatic; §44.6.4 specifies fixed default + manual override only → D-14.1-008 (P2; Critical Question resolution required)**

### BPS v3 §13 Financial Scenarios → 1 new defect (D-14.1-001); D-AS-004 pre-filed for plan mix

- Scenarios A / B / C ✅ §34.18.6.
- **Scenario D (Solo cohort financials) ❌ absent from §34.18.6 → D-14.1-001 (P1)**
- Year-1 plan mix Solo omission → D-AS-004 pre-filed.

### BPS v3 §14 Migration → 2 new defects (D-14.1-002, D-14.1-007)

- v2→v3 deltas table ✅ landed via Phase 14.4–14.10.
- v2 grandfathering of Business customers ✅ §34.2.3 #9.
- **90-day Solo trial mechanism for v2-cohort Free customers ❌ — §34.9 only documents 14-day Business Starter trial → D-14.1-002 (P1)**
- **Selection Report v2 watermarking grandfathering ❌ — §13.11 / §34.5.1 / §34.6 silent → D-14.1-007 (P2)**

### BPS v3 §15 Positioning → No new defects

- Narrative; not spec scope.

### BPS v3 Appendix A Rate Card → No new defects

- "Generated from Master Spec §21.4" + Solo "engineering-transparent, never operator-facing" → both reconcile to §4.8.9 + §44.6.6.

### BPS v3 Appendix B Outcome Signals → No new defects

- 8 illustrative rows + new `defense_view_generate` reconcile to §34.11.1 + §13.11.5.

---

## 4. Counterfactual Pass — Failure Modes Per Defect

Per Audit_Prompts.md MODEL EXPECTATIONS, every defect's surrounding feature is walked for at least 3 realistic failure modes; if a failure mode is unhandled, an additional defect is filed.

### D-14.1-001 — §34.18.6 Scenario D

1. **Scenario D published with stale Stripe-fee assumption.** BPS v3 §13 uses 2.9% + $0.30 per Stripe charge. Stripe pricing changes annually. The §34.18.6 Scenario D row should cite a Stripe-fee snapshot date and link to a `_integration/snapshots/` frozen pointer. Mitigation: D-14.1-001 recommendation already cites BPS v3 §13 verbatim — Phase 14 reconciliation owner should add a `stripe_fee_snapshot_date` annotation when authoring the spec row.
2. **Refund reserve assumption (5% of per-eval volume) drifts from realized refund rate.** §34.18.5 Finance scorecard should add a "Solo per-eval refund rate" tracker so Scenario D's 5% assumption is observable. Cross-references D-14.1-006 (per-cohort metrics).
3. **CSM cost line absent from Scenario D ($0).** Scenario D assumes "no CSM on Solo, low-touch support". If Solo support workload exceeds prediction (e.g., per-eval refund-judgment volume drives a hidden CSM-like burden), the 92% margin claim is at risk. Mitigation: D-14.1-006 + D-14.1-005 add the per-cohort margin observability that would surface this drift.

All 3 failure modes are addressed by the existing recommendation set OR by other Phase 14.1 defects. No additional defects filed.

### D-14.1-002 — §34.9 90-day Solo trial

1. **Trial-account gaming.** A user creates multiple Free orgs to chain Solo trials. Mitigation: recommendation explicitly authors "one trial per `(org_id, legal_entity)` per lifetime; deploy-time validator `solo_trial_one_per_org_lifetime`". Adequate.
2. **Trial customer hits Solo absorbed envelope and triggers throttling — does §44.6.4 throttling fire on trial users?** Per §44.6 Authoring Intent, Solo surface contract applies to all `plan_tier ∈ {buyer_solo, seller_solo}` orgs regardless of subscription state. Trial users would experience throttling identically. Recommendation should explicitly cite §44.6 applicability to trial accounts. Sub-defect not filed; tracked as a sub-bullet in D-14.1-002 recommendation refinement (see Self-Challenge Pass §5).
3. **Trial expiry + payment-method-on-file race.** A user adds a payment method on day 90 at 23:59 UTC; the day-91 auto-downgrade cron fires at 00:01 UTC; race results in unintended downgrade. §34.9.1 14-day Starter trial does not specify the timestamp-comparison granularity (UTC midnight? Org `current_period_ends_at`? Anniversary clock?). The 90-day Solo trial recommendation should mirror whatever §34.9.1's contract is and tighten timestamp granularity. Sub-defect not filed; tracked as a sub-bullet in recommendation refinement.

### D-14.1-003 — Solo upgrade-CTA throttling threshold

1. **Threshold-event aggregation under Solo Org with concurrent contralateral console.** Per §34.10.3 Solo-co-resident rule, two engine-side envelope counters run independently per console. The 3-events-in-30d aggregation is per-console (BPS v3 §11 implies per-Org perspective is fine); recommendation should clarify per-`(org_id, console)` aggregation (which the recommendation already does — adequate).
2. **Throttling event ≠ throttling effective.** §44.6.4 #6 specifies auto-clear at envelope rollover. A throttling event firing at 80% utilization that immediately auto-clears at billing-cycle rollover should still count toward the 3-events trigger. The recommendation should clarify "throttling-engaged event count" not "throttling-currently-active duration". Sub-defect not filed; recommendation phrasing already implicitly correct ("`solo.envelope.throttling_engaged ≥ 3 events in rolling 30-day window`").
3. **Per-eval mode "envelope hit" distinct from subscription "throttle event".** Per-eval mode hits the envelope at 100% per single eval; subscription mode aggregates over 30 days. Recommendation already cites both modes distinctly. Adequate.

### D-14.1-004 — §34.18.5 Solo silent-throttle event-rate target

1. **Cohort denominator ambiguity.** "5% of Solo accounts in any 30-day window" — denominator could be: (a) Solo accounts active at any point in the 30-day window; (b) Solo accounts that consumed at least 1 AIOp; (c) Solo accounts at start of window. The recommendation should specify (b) — Solo accounts with ≥ 1 AIOp in the window — to avoid trivial 0-throttle scores from inactive accounts. Sub-defect not filed; tracked as scorecard-row authoring detail.
2. **Per-eval mode vs subscription mode separate cohorts.** The 5% target may differ between subscription Solo (predictable monthly cycles) vs per-eval Solo (lumpy single-eval consumption). Recommendation should split into two rows. Sub-defect not filed; covered by D-14.1-005 cohort split recommendation.
3. **Cross-console Solo (Buyer Solo + Seller Solo).** Per §34.10.3 #2, the two consoles' envelope counters are independent. The 5% target should be evaluated per-(org, console). Adequate; recommendation cites §44.6.5 per-console event source.

### D-14.1-005 — §34.18.5 per-cohort margin breakouts

1. **Stripe per-charge fee attribution to per-eval cohort.** Per-eval cohort has 2.9% + $0.30 per $199 charge ≈ $6.07 fee per eval; subscription cohort has 2.9% + $0.30 per $49 monthly charge ≈ $1.72 fee per month. Per-cohort margin attribution must include this. Recommendation cites §34.10.5 Stripe meter events as data source. Adequate.
2. **Refund cost attribution.** Per §34.2.5 7-day refund window with ≤3-open check, per-eval cohort has refund overhead absent from subscription. Recommendation should cite `sourcera_solo_charge_refunded` Stripe meter event for refund-cost contribution. Adequate.
3. **Solo absorbed-envelope cost attribution to `rev_ai_wallet`.** Per §44.6, Solo's engine-absorbed envelope is engine-side only — the COGS of Solo AIOps don't flow through the customer-visible AIWallet. Per-cohort margin computation must source COGS from `AIOperation.actual_cost_cents` (per AE-1 in §34.17.1.b) joined to `org.plan_tier`, NOT from AIWallet `consumed_value_dollars`. Recommendation should clarify the COGS data source. Sub-defect not filed; tracked as engineering-implementation detail in recommendation.

### D-14.1-006 — Leading indicators

1. **PostHog event under-coverage.** 9 funnel metrics require source PostHog events; some may already exist (e.g., `wallet.threshold_crossed` covers "% of Free hitting AI budget ceiling"). Recommendation cites §51 PLG instrumentation registry — Phase 14 owner should perform a per-metric source-event inventory before authoring the scorecard rows.
2. **90-day rolling-window aggregation cost.** Computing "Solo subscription → Starter conversion % at 90 days" requires per-Org event-history aggregation across rolling 90-day window. Convex query cost may be material. Recommendation cites Convex aggregation as the natural source (no separate batch process needed) but Phase 14 owner should validate with Engineering.
3. **Cohort denominator drift over time.** "% of Free that export a watermarked Selection Report" depends on Free-tier Selection-Report-export volume which may itself be a slow signal (Free users may take weeks to reach Phase 12 Selection). Recommendation should cite a minimum-cohort-size rule (e.g., metric not reported until ≥ 100 Selection Report exports in window). Sub-defect not filed; tracked as scorecard-authoring detail.

### D-14.1-007 — Selection Report v2 watermarking grandfathering

1. **Selection Report regenerated under Workspace bounce-back from Phase 13 to Phase 12.** §10.13.5 / §10.12.5 specifies that a Workspace bounced back to Phase 12 mutates the Selection Report (re-creates the immutable bundle). Does the regenerated SR inherit the original `created_at` (preserving v2 grandfathering) or get a new `created_at` (losing v2 grandfathering)? Recommendation should clarify: the grandfathering rule keys on `original_created_at`, NOT on the latest regeneration timestamp. Sub-defect not filed; tracked as engineering-implementation detail.
2. **`v3_watermarking_effective_at` setting authority.** Recommendation cites "Pricing-Admin-set timestamp authored once at v3 cutover, stored on `PlatformConfigVersion` per §4.8.9 sibling". The actual authoritative timestamp must be set by Ops Finance + Founder dual-signoff to lock the grandfathering scope. Adequate; recommendation cites §4.8.9 governance.
3. **Org migration mid-cutover.** A new Free Org created during the v3 cutover window (e.g., on the day `v3_watermarking_effective_at` is set) may have ambiguous grandfathering status. Recommendation should specify: SR `created_at < v3_watermarking_effective_at` is grandfathered REGARDLESS of org creation date. Adequate; spec rule is per-SelectionReport not per-Org.

### D-14.1-008 — Solo dynamic-throttling-threshold

1. **Path (a) automatic adjustment failure mode: cost-base recalc oscillation.** If Anthropic prices oscillate, automatic threshold recalibration could create unstable Solo throttling behavior week-over-week. Recommendation should add a `threshold_adjustment_minimum_interval` floor (e.g., quarterly) to dampen. Sub-defect not filed; tracked as path-(a) authoring detail.
2. **Path (b) manual review failure mode: Ops Finance throughput.** If quarterly review is the cadence, throttle-event rate may breach 5% target between reviews. Recommendation should pair path (b) with D-14.1-004 alert-on-breach to trigger out-of-cycle review. Adequate; recommendation cites the linkage.
3. **Default threshold (80%) interaction with Anthropic price spike.** If Anthropic raises prices 30% mid-cycle, Solo unit economics compress without threshold change. The §44.6.7 #9 failure mode addresses this (prices locked at write time; new cost_base applies only post-recalc; margin-floor breach event fires). Adequate; existing spec handles the price-spike case independent of the dynamic-threshold question.

### D-14.1-009 — §44.6.1 surface hide list extensions

1. **"What to do this week" panel collision with §16 Pulse Health Score.** Solo replaces Pulse Health Score with a simpler panel; §16 Pulse Health Score is a multi-stakeholder Team-Mode surface. Recommendation correctly cites §16.x as the new authoritative home; engineering must ensure the Solo replacement renders only on `evaluation_owner_mode=solo` Workspaces (per §4.3.1 / §22.20).
2. **Email-domain auto-assignment heuristic edge cases.** A stakeholder invited from `cfo@buyerco.com` would auto-assign to the Finance cohort. Edge cases: (a) personal email domain (gmail.com / outlook.com) — fallback to manual cohort selection; (b) consultant email under a third-party domain — fallback to manual; (c) acquisition / domain change. Recommendation cites "explicit fallback to manual cohort selection on > 2 stakeholders trigger" but should also cite "fallback to manual on personal-email-domain detection per §3.5 anti-spam framework". Sub-defect not filed; tracked as authoring detail.
3. **Plan-tier matrix surfacing on upgrade CTA.** Solo operator sees only their plan name in normal operation but full matrix at upgrade-CTA moments. The §34.5 plan-change surface is currently un-Solo-mode-restricted; engineering must gate matrix render on upgrade-CTA context. Recommendation cites §34.5 surface; Phase 14 owner should validate with §34.5 authoring scope.

### D-14.1-010 — §34.17.1.b 5 new AE rows

1. **AE-12 through AE-16 already-shipped (v7.1.0) Authored Extension status conflict.** §44.6 / §34.2.5 / §13.11.4 / §44.6.4 are landed in v7.1.0. The new AE-12 through AE-16 rows are post-hoc registrations of already-shipped features. Recommendation should clarify these are RETROACTIVE Authored Extension registrations for catalog completeness, not new development scope. Sub-defect not filed; tracked as ledger-row metadata.
2. **Deploy-gate `pricing_engineering_coverage` runtime status.** Per CLAUDE.md §16, 119 of 122 §M.5 CI gates are `spec_binding_pending_pack_<id>` — the `pricing_engineering_coverage` gate runtime status is unknown. Recommendation should specify whether the extended assertion ("§34.17.1.b row count ≥ 16 post-v7.1.1") is `spec_binding_pending` or `runtime_active`. Sub-defect not filed; tracked as §M.5 catalog-extension authoring detail.
3. **AE-12 through AE-16 ratification owner.** Per `_integration/AUTHORED_EXTENSIONS_LEDGER.md` release-gate policy, open `pending` rows must ratify before each version stamp. The 5 new AEs require ratification before v7.1.1 stamp. Recommendation explicitly cites this. Adequate.

---

## 5. Self-Challenge Pass (Hostile-Reviewer Persona)

Re-reading findings as a hostile staff engineer prepping engineering, design, QA, analytics, and leadership for sign-off.

### 5.1 Severity Classifications — Are They Rule-Based?

Per Audit_Prompts.md Severity Definitions:

- **D-14.1-001 (P1).** Rule: "missing acceptance criteria, missing state machine, ... conflicting numerical singleton between Master Spec and a companion strategy doc". Scenario D is a missing scenario in the spec's authoritative scenario-analysis section while BPS v3 publishes it as authoritative. ✅ P1 correctly assigned.
- **D-14.1-002 (P1).** Rule: "missing acceptance criteria, ... missing webhook contract, missing plan-gating row in §5.11/§34.1/§39, missing retention/DSAR/residency clause". 90-day Solo trial mechanism is an entire missing entity (trial start / end / abuse-control / payment-method-grace) that a junior engineer cannot build from BPS v3 alone. ✅ P1 correctly assigned.
- **D-14.1-003 (P1).** Rule: "missing acceptance criteria, missing state machine, missing error code, missing webhook contract". Upgrade-CTA throttling trigger is an entire missing trigger contract (rolling-window aggregation, event emission, CTA render rule). ✅ P1.
- **D-14.1-004 (P2).** Rule: "ambiguous in a way that a thoughtful staff engineer could resolve, but the resolution is not the *same* across two readers". 5% threshold is a Finance-scorecard target — engineering can resolve denominator / cohort-split / cross-console scoping consistently from §34.18.5 + §44.6.5 + §34.10.3. ✅ P2 correctly assigned. Strict-interpretation conversion → P1 noted.
- **D-14.1-005 (P2).** Rule: ambiguous-but-resolvable. Per-cohort margin attribution is a §50 Ops Console / §34.18.5 scorecard authoring scope; engineering can derive consistently from §4.8.1 + §34.10.5. ✅ P2. Strict → P1 noted.
- **D-14.1-006 (P2).** Same rule. 9 funnel metrics are PostHog / scorecard authoring scope; consistent derivation possible. ✅ P2. Strict → P1 noted.
- **D-14.1-007 (P2).** Rule: ambiguous-but-resolvable. SR watermarking grandfathering is a render-time `created_at` comparison — junior engineer can derive consistently once the rule is authored. The defect is the *missing rule*, not an unbuildable scope. ✅ P2 (defensible at P1 if the spec silence would cause incorrect default — see Strict-interpretation note in CONSISTENCY_DELTA.md).
- **D-14.1-008 (P2).** Rule: ambiguous-but-resolvable IF resolution is the same across readers. Two paths exist (a) automatic / (b) manual; readers may pick different paths. ✅ P2. Critical Question resolution required.
- **D-14.1-009 (P2).** Rule: surface contract gap; consistent resolution possible if surfaces are authored. ✅ P2.
- **D-14.1-010 (P1).** Rule: "missing plan-gating row in §5.11/§34.1/§39 ... or surface introduced without an Appendix-M row". §34.17 is the authoritative pricing-engineering-requirements catalog with deploy-gate enforcement (§34.17 AC #2). 5 missing rows in an enforcement-gated catalog = unbuildable as written if the gate is runtime-active. ✅ P1.

All 10 severity classifications hold under hostile review.

### 5.2 Evidence Reproducibility

Each defect's `evidence` column quotes BPS v3 line numbers and spec section anchors that I personally read. A reviewer can re-open BPS v3 at the cited line and the spec at the cited §-anchor and reproduce the gap. ✅ Evidence is reproducible.

### 5.3 Recommendation Sharpness

Each defect's `recommendation` column names a specific spec section to extend, the field / row to add, and the deploy-time validator to wire. A junior engineer with read access to the cited sections can implement the recommendation without further clarification. ✅ Recommendations are sharp.

### 5.4 Cross-Defect Consistency

- D-14.1-003 (upgrade-CTA throttling trigger) and D-14.1-004 (silent-throttle event rate target) and D-14.1-005 (per-cohort margin) all touch the same engine-side data source (`solo.envelope.throttling_engaged` events from §44.6.5). Recommendations are independent but engineering may bundle into a single Phase 14.10.A authoring pass. ✅ Cross-defect consistency holds.
- D-14.1-002 (90-day Solo trial) and D-14.1-007 (SR watermarking grandfathering) and D-14.1-001 (Scenario D) are all v2→v3 migration concerns. A unified "v3 Cutover Migration" sub-section in §34.5 / §34.9 / §34.18 could close all three. Recommendations are independent but bundlable.

### 5.5 Counterfactual Pass Sub-Defects Tracked Inline

The counterfactual pass surfaced ~12 sub-defects (refinements to recommendations, edge-case considerations) that are tracked inline in the §4 counterfactual block. None met the "applicable + spec-silent + not-already-filed" threshold to escalate to a separate defect row. Phase 14.5 (AE Ratification) and Phase 14.7 (v7.1.1 Backlog Status) walks should consume the counterfactual sub-bullets when authoring AE-12 through AE-16 ratification copy and the §34.18.6 Scenario D row.

### 5.6 Halt-Rule Application Discipline

Per Audit_Prompts.md Prompt 14.1 strict reading: "ANY DRIFT IS P1 consistency_drift". Pragmatic interpretation applied per PHASE34.PXC precedent (CONSISTENCY_DELTA.md "Roll-Up by Severity" paragraph). Strict-interpretation alternative (10 P1 / 0 P2) recorded for v7.1.1 backlog completeness. **Self-challenge:** does the pragmatic interpretation under-flag genuine engineering risk? Walking each P2 defect: D-14.1-004 / D-14.1-005 / D-14.1-006 are observability-only (no shipping behavior change required); D-14.1-007 is render-rule authoring (junior-engineer-buildable once authored); D-14.1-008 is a Critical Question (decision needed before authoring); D-14.1-009 is surface authoring (junior-engineer-buildable once authored). None of the P2s blocks v7.1.1 stamp; all are v7.1.x-backlog-eligible. ✅ Pragmatic interpretation defensible.

---

## 6. Decision Trace — What Was NOT Filed (And Why)

| Considered concern | Why not filed |
|---|---|
| BPS v3 §7 Coupa / Ariba / ServiceNow / NetSuite enumeration | Companion-doc narrative latitude where spec authors generic capability ("Custom Integrations: Scoped per contract" at §34.1.1). Not a buildability gap. |
| BPS v3 §8 Defense View Generate $0.80/$0.10 inline rate-card restatement | §34.3.4 is illustrative-only per its own closing paragraph; the canonical full catalog is dynamic. The new capability auto-publishes per §13.11.5 closing paragraph. Not a single-source violation under the §34.3.4 "illustrative" framing. |
| BPS v3 §11 §3 watermarked Selection Report leadership-meeting moment fires Solo CTA | §13.11.4 explicitly authors "Solo unlocks the full view" CTA on Free-tier Defense View preview. Adequate; not a gap. |
| BPS v3 §6.3 5% off overage on Scale | §34.1.1 has "Optional (preferred 5%-off rate)" in Wallet Overage row. Adequate; not a gap. |
| BPS v3 §11 PLG paid path numbering vs §34.5 plan-change taxonomy | Narrative path; not a behavioral gap. The actual triggers are filed via D-14.1-003 / D-14.1-006. |
| BPS v3 §10 #15 Solo silent throttling capability list (`proactive_cmd_k_marketplace_surfacing` / `weekly_kb_refresh_suggestions` / `vendor_page_enrichment_polling`) | §44.6.4.1 explicitly enumerates these 3 capabilities as the v7.1 `low_priority_background` set. Adequate; not a gap. |
| BPS v3 §14 "Existing v6.0.0 Business customers ($499/mo, token-denominated budget) grandfather into Business Growth" | §34.2.3 #9 explicitly covers this. Adequate. |

---

## 7. Sign-Off

- **Phase 14.1 walk completed.** 10 net-new defects filed (D-14.1-001 through D-14.1-010). 7 pre-existing defect cross-references confirmed. Audit posture preserved (non-destructive; Master Spec wins per CLAUDE.md §2).
- **Counterfactual pass completed.** 30 failure-mode considerations across 10 defects; 12 sub-defects tracked inline as recommendation refinements (none met escalation threshold).
- **Self-challenge pass completed.** All 10 severity classifications hold under hostile review; evidence is reproducible; recommendations are sharp; cross-defect consistency holds; halt-rule pragmatic interpretation defensible.
- **Outputs.** `_audit/CONSISTENCY_DELTA.md → "Buyer Pricing v3"` heading appended (~16 KB). `_audit/DEFECT_LEDGER.md → Phase 14.1` block appended (10 defect rows + roll-up + sign-off verdict).
- **v7.1.1 stamp gate inheritance.** D-14.1-001 through D-14.1-010 closure + AE-12 through AE-16 ratification + Critical Question resolution on D-14.1-008 + 5 new CI gate runtime wirings.
- **Phase 14.2 (Master Spec ↔ Seller Pricing v3) is unblocked** — no Phase-14.1 P0 halt.

---

## 8. Phase 14.1 Re-Verification (2026-05-12, second pass)

**Trigger.** Phase 14.1 audit prompt re-issued same day after the original walk closed at 15:04. Independent end-to-end re-read of BPS v3 (549 lines) and Master Spec v7.1.0 §34 / §44.6 / §13.11 / §34.9 / §34.17 / §34.18 with a clean Opus context.

**Re-walk methodology.** For each of D-14.1-001 through D-14.1-010, the cited Master Spec section anchor and the BPS v3 line numbers were re-opened and the evidence quote was verified character-for-character against current file state. The recommendation column was re-read for sharpness and any new dependencies created by Phase 14.2 (Seller Pricing) and Phase 14.3 (subsequent UX walk) were checked.

### 8.1 Re-Verification Outcome — Pre-Filed 10 Defects

| Defect | Re-verification outcome | Notes |
|---|---|---|
| D-14.1-001 | Reproducible at §34.18.6 line 30797 + BPS v3 lines 431–448. Severity P1 holds. Recommendation sharp. | Paired with D-14.2-001 Seller Solo Scenario D (filed Phase 14.2); both should land in the same §34.18.6 extension pass. |
| D-14.1-002 | Reproducible at §34.9.1 line 29766 + BPS v3 line 891 in the migration section (paginated as line 498). Severity P1 holds. Recommendation sharp. | Paired with D-14.2-002 Seller 90-day Solo trial; both should land in a unified §34.9 v3-cutover migration sub-section. |
| D-14.1-003 | Reproducible at §44.6.5 line 33504 + BPS v3 §11 line 357 + §5.3 line 172. Severity P1 holds. Recommendation sharp. | Paired with D-14.2-003 (seller-side); both rolling-window aggregations should land in a unified §44.6.5 telemetry-rolling-aggregation pass. |
| D-14.1-004 | Reproducible at §34.18.5 line 30778 + BPS v3 §11 line 381. Severity P2 holds (strict → P1 still recorded). Recommendation sharp. | Cross-references D-14.1-005 / D-14.1-006 (single Phase-14.x Solo-cohort scorecard authoring pass closes all three). |
| D-14.1-005 | Reproducible at §34.18.5 + §34.18.6 + BPS v3 §11 line 382 + §13 line 437 + §2.6 line 60. Severity P2 holds. Recommendation sharp. | Cross-references D-14.1-004 / D-14.1-006. |
| D-14.1-006 | Reproducible at §34.18.5 + §51 PLG instrumentation registry + BPS v3 §11 lines 370–378. Severity P2 holds. Recommendation sharp. | Cross-references D-14.1-004 / D-14.1-005 / D-14.2-006 (seller-side). |
| D-14.1-007 | Reproducible at §13.11 + §34.5.1 + §34.6 + BPS v3 §14 line 498. Severity P2 holds (strict → P1 still recorded). Recommendation sharp. | Paired with D-14.2-009 Seller KB v2-cutover grandfathering; both should land in a unified v3-cutover-migration sub-section. |
| D-14.1-008 | Reproducible at §44.6.4 line 33469 + BPS v3 §12 line 396. Severity P2 holds; Critical Question remains open in `_integration/Decisions.md`. Recommendation sharp (two-path resolution). | No paired Phase 14.2 defect (seller-side narrative does not imply the same dynamic-threshold mechanism). |
| D-14.1-009 | Reproducible at §44.6.1 line 33420 + §16 + §13.5 + §13.12 + BPS v3 §5.5 lines 191–203. Severity P2 holds. Recommendation sharp. | Paired with D-14.2-008 (seller-side surface compression items); both should land in a unified §44.6.1 extension pass. |
| D-14.1-010 | Reproducible at §34.17.1.b + §44.6 / §34.2.5 / §13.11 + BPS v3 §10 lines 341–345. Severity P1 holds. Recommendation sharp. | Paired with D-14.2-004 (seller-side AE-17 + AE-18); the §34.17 AC #2 deploy-gate row-count assertion should consolidate to ≥ 18 post-v7.1.1. |

All 10 pre-filed defects are confirmed `open` with reproducible evidence, defensible severity, and sharp recommendations. No defects retired or re-classified.

### 8.2 Net-New Finding — D-14.1-011

A re-read of §34.2.5 (Solo-Tier Per-Evaluation / Per-Bid Charge Orchestration) cross-cutting orchestration rule #5 surfaced an internal contradiction that the Phase 14.1 original walk did not catch. The first bullet (line 29249) states "Workspace creation is GATED until charge captures" but immediately negates that claim in the parenthetical and surrounding context. The contradiction is intra-spec (not BPS-vs-spec) and produces a buildability ambiguity: a junior engineer reading the bullet in isolation could build a Workspace-creation gate that contradicts the §34.2.5 `Charge trigger` row and the BPS v3 §5.4 source. Severity P2; filed as D-14.1-011 in the ledger.

**Counterfactual pass (D-14.1-011).** Three failure modes considered: (1) engineering builds a creation gate that defeats the BPS v3 §2.7 personal-card on-ramp; (2) QA writes a creation-blocked acceptance test that contradicts the implementation; (3) customer-success documentation copy promises Workspace creation requires payment. All three are addressed by the recommendation (rewrite the opening sentence + append a clarifying phrase to AC #1 + add the `solo_per_eval_workspace_creation_ungated` validator).

**Self-challenge pass (D-14.1-011).** Hostile-reviewer test: stretched metonymic reading ("Workspace creation" = "Workspace creation of an exportable Selection Report")? Rejected because §34.2.5 row labels (`Charge trigger`, `Charge timing`) are unambiguous and the Workspace is a §10 first-class entity created by `POST /v1/workspaces` with its own lifecycle. The contradiction is a sentence-level semantic error, not a stylistic infelicity. Severity P2 holds under hostile review.

### 8.3 What Was Not Filed in the Re-Verification (And Why)

| Considered concern | Why not filed |
|---|---|
| BPS v3 §10 #15 "≥80%" inline restatement of the §44.6.4 default `throttling_threshold` (80%) | Companion-doc narrative latitude; the §44.6.4 default (80%, configurable per Capability Registry per §4.8.2, range 50–95) is the single source. The inline "≥80%" is descriptive of the default and does not assert authority. Tracked instead as a sub-bullet of D-14.1-010 recommendation refinement (no new defect row). |
| BPS v3 §13 Scenario D AI-COGS math vs §34.3.1 outcome-pricing formula | Phase 14.1 original walk noted this in §4 counterfactual pass D-14.1-001 #1 (stale Stripe-fee snapshot date). Re-verification confirms the math is internally consistent within Scenario D's $0.54-per-customer-per-month absorbed-cost assumption AND with Scenario A's $5.40-per-customer-per-month figure at a 10.8% cost/value ratio. The 70/30 mix's true underlying COGS implication is a Finance-modeling detail that does not propagate to a spec contract; not filed. |
| BPS v3 §10 #15 capability list (`proactive_cmd_k_marketplace_surfacing` / `weekly_kb_refresh_suggestions` / `vendor_page_enrichment_polling`) | §44.6.4.1 enumerates these 3 capabilities exactly. Reconciled. Not a defect. |
| BPS v3 §11 "Solo subscription → Starter conversion % at 90 days" 90-day horizon vs §34.18.5 default 90-day funnel cadence | Compatible with §34.18.5 existing 90-day funnel reporting; the metric horizon is sensibly defaulted. Not a defect. Tracked as a sub-bullet of D-14.1-006 recommendation refinement. |
| BPS v3 §13 Scenario C 42.8% blended margin claim vs §34.18.1 ≥88% margin floor | §34.18.1 88% floor is on AI consumption; Scenario C 42.8% margin is total gross margin including CSM (which is loaded on Enterprise per Scenario C narrative). The 42.8% figure is the consequence of the CSM-loading model, not a violation of the AI-COGS margin floor. Not a defect. |

### 8.4 Sign-Off (Re-Verification)

- Phase 14.1 re-verification walk completed. 1 net-new defect filed (D-14.1-011 P2 consistency_drift; intra-spec contradiction at §34.2.5 cross-cutting rule #5 first bullet).
- All 10 pre-filed Phase 14.1 defects re-walked and confirmed `open` with reproducible evidence.
- Outputs: `_audit/CONSISTENCY_DELTA.md → "Buyer Pricing v3" → "Phase 14.1 Re-Verification (2026-05-12, second pass)"` block appended (~6 KB); `_audit/DEFECT_LEDGER.md → "Phase 14.1 Re-Verification (2026-05-12, second pass)"` block appended (1 defect row + roll-up + sign-off verdict).
- v7.1.1 stamp gate updated: D-14.1-001 through D-14.1-011 closure (was D-14.1-001 through D-14.1-010); 6 new CI gate runtime wirings (was 5; D-14.1-011's `solo_per_eval_workspace_creation_ungated` validator joins them); 1 §34.2.5 paragraph rewrite; 1 §34.2.5 AC #1 sentence append.
- Phase 14.2 (Seller Pricing v3) was completed in parallel after the original Phase 14.1 walk and is unaffected by this re-verification.
