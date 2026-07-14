# PHASE 13V FINDINGS — Adversarial Verification of Phase 13 (PLG, Growth, Analytics; §48 + §51)

**Audit prompt.** Adversarial verification of Phase 13 per `Audit_Prompts.md` Prompt V13. Three checks: (1) STRUCTURAL — confirm §48 + §51 audited; (2) ADVERSARIAL — walk one buyer growth loop end-to-end (M-X), walk one seller growth loop end-to-end, construct a Hero Moment failure and confirm recovery path; (3) SIGN-OFF — zero P0 `instrumentation_gap`.

**Baseline.** Master Spec v7.1.0 (2026-04-28). v7.1.0 stamp confirmed against the changelog header on 2026-05-12.

**Phase 13 inputs verified.**

| Sub-prompt | Findings file | Defect cluster | Counts |
|---|---|---|---|
| Prompt 13.1 — §48 M1–M17 walk | `_audit/PHASE48_FINDINGS.md` | `D-48-001` … `D-48-008` | 0 P0 / 4 P1 / 3 P2 / 1 P3 |
| Prompt 13.2 — §48 Network Effects | `_audit/PHASE48.3_FINDINGS.md` | `D-48.3-001` … `D-48.3-015` | 0 P0 / 2 P1 / 11 P2 / 2 P3 |
| Prompt 13.3 — §51 PLG Instrumentation | `_audit/PHASE51_FINDINGS.md` | `D-51-001` … `D-51-024` | 0 P0 / 13 P1 / 10 P2 / 1 P3 |
| Prompt 13.4 — Hero Moment walk | `_audit/PHASE_HM_FINDINGS.md` | `D-HM-001` … `D-HM-016` | 0 P0 / 6 P1 / 8 P2 / 2 P3 |
| **Phase 13 sub-prompt total** | — | 63 defects | **0 P0 / 25 P1 / 32 P2 / 6 P3** |

All four sub-prompt findings files read end-to-end on 2026-05-12. Defect ledger entries verified at `_audit/DEFECT_LEDGER.md` Phase HM section (lines 5110–5177) and Phase 48 / 48.3 / 51 sections (preceding blocks).

---

## 1. STRUCTURAL Check — §48 + §51 audited

V13 verifies whether the Phase 13 sub-prompts covered the full §48 + §51 surface required by the V13 prompt's structural check.

### 1.1 §48 Coverage Map

| §48 Subsection | Subject | Audited by | Verdict |
|---|---|---|---|
| §48.1.1 Buyer Console Paid Path (Five Stages) | PLG funnel framing | — | ❌ NOT directly audited |
| §48.1.2 Seller Console Paid Path | PLG funnel framing | — | ❌ NOT directly audited |
| §48.1.3 PLG Funnel Configurability | PLG funnel configurability | — | ❌ NOT directly audited |
| §48.1.4 Acceptance Criteria | §48.1 AC roll-up | — | ❌ NOT directly audited |
| §48.1.5 Seller Hero Moment Framework | Cross-reference | PHASE_HM | ✅ |
| §48.1.6 Seller Activation Metric & Leading Indicators | Activation Metric | PHASE_HM; PHASE51 (D-51-001 confirms buyer-side absence) | ✅ |
| §48.1.7 Three Conversion Moments — Master Spec Binding | Conversion Moments | PHASE_HM (HM-S5/S6/S7) | ✅ |
| §48.1.8 Acceptance Criteria (Extended) | §48.1 extended AC | — | ❌ NOT directly audited |
| **§48.2 The 10 Core Growth Loops (L1–L10)** | Core PLG loops | — | **❌ NOT directly audited** |
| §48.2.1 Loop Inventory and Status Table | L1–L10 catalog | — | ❌ |
| §48.2.2 Loop L1: Vendor-Invite-Creates-Account | Canonical seller acquisition loop | — | ❌ |
| §48.2.3 Loop L2: Template-Clone-Attribution | Template seller-visibility loop | — | ❌ |
| §48.2.4 Loop L3 (Retired) | Retired Selection Report sharing | — | n/a (retired) |
| §48.2.5 Loop L4: Seller-Profile SEO | Marketplace SEO loop | — | ❌ |
| §48.2.6 Loop L5: Free-AI-Teaser-to-Paid | Free → paid conversion loop | — | ❌ |
| §48.2.7 Loop L6 (Retired) | Retired Domain-Match | — | n/a (retired) |
| §48.2.8 Loop L7: Cmd+K Suggestion Loop | In-product suggestion loop | — | ❌ |
| §48.2.9 Loop L8: Bid-Close-Offers-KB-Sync | KB-sync loop | — | ❌ |
| §48.2.10 Loop L9: Template Publish Incentive | Seller publish loop | — | ❌ |
| §48.2.11 Loop L10: Marketplace Match-Score Teaser | Marketplace teaser loop | — | ❌ |
| §48.2.12 GrowthLoopExecution Entity | Loop instrumentation entity | — | ❌ |
| §48.2.13 Cross-Loop Acceptance Criteria | §48.2 cross-loop AC | — | ❌ |
| §48.3.1 Qualitative Framing | Network effect framing | PHASE48.3 | ✅ |
| §48.3.2 Measurable Signals | 12-row signal table | PHASE48.3 (D-48.3-003) | ✅ |
| §48.3.3 Dashboards | 3 dashboards | PHASE48.3 (D-48.3-008) | ✅ |
| §48.3.4 Acceptance Criteria | §48.3 AC | PHASE48.3 (D-48.3-004) | ✅ |
| §48.3.5 Seller-Side Compounding Network Effects | S1–S7 inventory | PHASE48.3 (D-48.3-005/-006/-007) | ✅ |
| **§48.4 Anti-Spam & Abuse Controls (Global)** | Anti-spam framework | — | **❌ NOT directly audited** |
| §48.4.1 Email Throttling | Per-user/Org throttles | partial via M5/L1 cross-refs | ❌ direct walk absent |
| §48.4.2 DMARC/SPF Reputation | Email reputation | partial via L1 control #4 | ❌ direct walk absent |
| §48.4.3 Shared-Use Domain Detection | Shared-domain registry | partial via M6 / L1 / M16 | ❌ direct walk absent |
| §48.4.4 Content Validators | Anthropic PII detector | — | ❌ |
| §48.4.5 Template Spam ML Classifier | Template spam | — | ❌ |
| §48.4.6 Referral Fraud Controls | M16 fraud controls (7 controls) | partial via M16 (D-48-004) | ❌ direct walk absent |
| §48.4.7 k-Anonymity Floors | k=5/10/20 floors | partial via §48.3.4 AC #2 | ❌ direct walk absent |
| §48.4.8 Suppression List | Email-suppression list | — | ❌ |
| §48.4.9 Global Vendor Opt-Out | Vendor opt-out registry | partial via L1 control #5 | ❌ direct walk absent |
| §48.4.10 SIM Cross-Reference | Signal Integrity Monitor | — | ❌ |
| §48.4.11 Acceptance Criteria | §48.4 AC | — | ❌ |
| §48.4.12 Seller Pricing Acceptable-Use Floor | Cross-plan abuse floor | partial via PHASE48.3 secondary | ❌ direct walk absent |
| §48.5 M1–M8 Growth Mechanics | M1–M8 walk | PHASE48 (D-48-001/-002/-003/-005/-006/-008) | ✅ |
| §48.6 M9–M13 Public Marketplace Content Mechanics | M9–M13 walk | PHASE48 (D-48-001/-002/-003/-006) | ✅ |
| §48.7 M14–M17 Cross-Console & Seller Conversion Mechanics | M14–M17 walk | PHASE48 (D-48-001/-002/-004/-005/-006/-007) | ✅ |
| §48.8 Seller Hero Moment & Onboarding Anti-Patterns | Seller Hero Moment | PHASE_HM (D-HM-001 … D-HM-016) | ✅ |

**§48 structural verdict.** Three §48 surface blocks are NOT directly audited by Phase 13 sub-prompts: (a) §48.1.1–§48.1.4 + §48.1.8 (5 subsections — PLG funnel-framing and acceptance criteria); (b) §48.2 (12 subsections — L1–L10 Core Growth Loops + GrowthLoopExecution entity + cross-loop ACs); (c) §48.4 (12 subsections — Anti-Spam & Abuse Controls framework). Phase 13.1 explicitly scoped to M1–M17 per its prompt text ("Walk §48; for each numbered growth mechanic M1–M17, verify the 7-point checklist…") — but the V13 STRUCTURAL bar is "§48 audited," and §48.2 / §48.4 / §48.1 (in parts) are §48 surface. Filed as D-13V-001 (§48.2 L1–L10 unaudited) and D-13V-002 (§48.4 Anti-Spam unaudited) and D-13V-003 (§48.1.1–.4 + .8 PLG framing unaudited).

### 1.2 §51 Coverage Map

| §51 Subsection | Subject | Audited by | Verdict |
|---|---|---|---|
| §51.1 Event Taxonomy | Event families + dual-write + alias governance | PHASE51 (D-51-009 / -011 / -020) | ✅ |
| §51.2 Standardized Event Properties | Property registry + cardinality + validator | PHASE51 (D-51-009 / -014 / -018) | ✅ |
| §51.3 Org-Level Usage Dashboard | Customer-facing Org dashboard | PHASE51 (D-51-004 / -005 / -006 / -008 / -014 / -015 / -016) | ✅ |
| §51.4 User-Level Usage Dashboard | Customer-facing user dashboard | PHASE51 (D-51-006 / -015 / -016 / -019 / -023) | ✅ |
| §51.5 Seller Usage Parity | Seller customer-facing dashboard | PHASE51 (D-51-007 / -008 / -013 / -016 / -019 / -023) | ✅ |
| §51.6 Time-Saved Baseline Model | Time-Saved + conversion factors | PHASE51 (D-51-015 / -022) | ✅ |
| §51.7 Retention & DSAR | UsageEvent retention + DSAR | PHASE51 (D-51-010) | ✅ |
| §51.8 Aggregate Acceptance Criteria | §51 aggregate AC | PHASE51 (D-51-019 / -021 / -024) | ✅ |

**§51 structural verdict.** All eight §51 subsections directly audited by Phase 13.3. ✅

---

## 2. ADVERSARIAL Check #1 — Buyer Growth Loop End-to-End: M16 Buyer Referral Credit

**Selection rationale.** M16 (§48.7.3) is a canonical buyer-issued growth mechanic with a complete lifecycle (10 workflow steps + 13 telemetry events + 4 webhooks + Stripe Credit Note settlement + 9 anti-abuse controls + 10 acceptance criteria + 6 failure modes). It is the most fully-spec'd buyer-side growth loop in §48 and the highest-value test case for instrumentation completeness, plan-gating discipline, and fraud-control coherence.

### 2.1 End-to-End Trace (10 Workflow Steps)

| Step | Audit Checklist Dimension | Verdict | Evidence | New Defect? |
|---|---|---|---|---|
| 1 — Create referral | (3) plan gating | ⚠ inline plan-tier $100/$200 | §48.7.3 line 38016 — "$100 for Scale, $200 for Enterprise" duplicated against §4.3.16 + §34.1.1 inline | already covered by D-48-004 |
| 1 — Create referral | (6) APIs | ✅ POST /v1/referrals + 4 endpoints | §48.7.3 lines 38122–38128 — full §32 contract | — |
| 1 — Create referral | (14) edge: same-domain check temporal ordering | ❌ ambiguous — step 1 vs step 4 enforcement | API endpoint lists `m16_same_domain_blocked` (HTTP 422) at create time (step 1 enforcement); Workflow step 4 says "At signup" enforcement; two enforcement points unreconciled | **D-13V-004 (NEW) P1 acceptance_criteria** |
| 2 — Share link | (6) instrumentation | ✅ `m16.referral.link_shared` | §48.7.3 line 38085 | — |
| 3 — Referee click + signup | (6) instrumentation | ✅ `m16.referral.referee_signed_up` | §48.7.3 line 38086 | — |
| 3 — Referee click + signup | (12) Appendix M coverage | ⚠ "Referral Link Landing Page" UX surface introduced inline; Appendix M.1 row coverage not verified | §48.7.3 line 38048 — "Custom Sourcera signup page with referral attribution" | **D-13V-005 (NEW) P2 surface_engine_mapping** |
| 4 — Same-domain block | (6) instrumentation | ✅ `m16.referral.same_domain_blocked` | §48.7.3 line 38087 | — |
| 5 — Payment-method overlap | (6) Stripe webhook contract | ✅ `invoice.paid` consumption | §48.7.3 line 38036 | — |
| 6 — Min-activity gating | (1) versioning | ✅ `activity_threshold_policy_version` stamping | §48.7.3 line 38037 — versioning prevents retroactive disqualification | — |
| 7 — Fraud signal aggregation | (14) edge: SIM signal arrives between step 7 and step 9 | ❌ silent on intermediate-fraud detection re-evaluation | step 7 fires at `activated` transition; step 9 nightly job re-evaluates; behavior if SIM-side fraud signal arrives between is unspecified | **D-13V-006 (NEW) P2 acceptance_criteria** |
| 8 — Referee Exclusivity Rule | (5) state machine | ✅ `pending → forfeited` with `credit_forfeited_reason = referee_exclusivity_claimed` | §48.7.3 line 38039 + §4.3.16 + Appendix L.2 | — |
| 9 — Credit issued (nightly) | (3) plan gating + (10) numerical singleton — 365 days expiry | ⚠ 365-day expiry inline without §40.2 or §34 anchor | §48.7.3 line 38040 — "credit_expires_at = credit_issued_at + 365 days"; not registered in §40.2 or §34.10.X | **D-13V-007 (NEW) P2 numerical_singleton** |
| 10 — Credit redemption | (6) instrumentation | ✅ `m16.referral.credit_applied` per invoice | §48.7.3 line 38041 | — |

### 2.2 Funnel Definition Probe

Audit Prompt V13's check requires "instrumentation confirmed." The M16 funnel — `m16.referral.created → link_shared → referee_signed_up → referee_activated → credit_issued → credit_applied → credit_redeemed` — is implied by the 13-event registry but is NOT explicitly named, NOT bound to a §51.1.5 funnel-stage cross-reference, NOT surfaced on the §51.3 Org-Level Usage Dashboard, and NOT named on any §51 dashboard. D-51-003 names the absence of buyer conversion funnels in §51 in the aggregate; the M16 walk confirms the gap and locates a concrete, lifecycle-complete buyer-side mechanic with no canonical funnel definition. **D-13V-008 (NEW) P1 instrumentation_gap** — M16 funnel definition absent across §48.7.3 / §51.1.5 / §51.3.

### 2.3 Plan Gating Numerical Drift

The M16 §48.7.3 Plan Gating table at lines 38071–38076 duplicates `$100` (Scale) and `$200` (Enterprise) inline. Per §M.4 numerical-singleton policy, these are owned by §34.1.1 (Buyer Plan Tier Definitions) and §4.3.16 (BuyerReferral entity field `credit_value_usd`). Three authoritative homes for the same number. Already covered by D-48-004 (which calls out the §48.7.1 / §48.7.3 / §48.7.4 inline plan-tier numerics class). No new defect.

### 2.4 Counterfactual Failure Modes for M16

1. **Referrer Org downgrades from Scale to Starter between step 1 (referral creation) and step 9 (credit issuance).** Resolved per §48.7.3 Failure Mode #4: `credit_value_usd` is frozen at referral creation; current plan does not retroactively disqualify. ✅ Authored Extension flagged. (Confirm AE row in `_integration/AUTHORED_EXTENSIONS_LEDGER.md` — verified absent: **D-13V-009 (NEW) P2 authored_extension** — Failure Mode #4 AE flag without ledger row.)
2. **Stripe Credit Note creation fails (Stripe outage).** Resolved per §48.7.3 Failure Mode #5: 5-attempt exponential backoff (1s/2s/4s/8s/16s) + DLQ + Ops alert. ✅
3. **Two Scale Orgs simultaneously create referrals for the same `referee_email` within the same second.** Per §4.3.16 + Appendix L.2 Referee Exclusivity Rule: first to bind `referee_org_id` at `pending → signed_up` wins; losing referrals go to `forfeited`. Multiple `pending` rows co-exist by design at step 1. ✅ But: if both referrals are still `pending` and a third referral arrives, the spec is silent on whether the third row also waits-and-races or whether a velocity check fires. **D-13V-010 (NEW) P2 acceptance_criteria** — same-`referee_email` multi-referrer queue depth and race behavior unspec'd at >2 referrer cardinality.
4. **Referee Org reaches activation threshold but is then DSAR-erased before step 9 nightly issuance.** Spec is silent. §4.3.16 says `referee_email` is pseudonymized on DSAR but doesn't address whether the credit issues post-pseudonymization (the rows still bind `referee_org_id`; the underlying user contact is gone). **D-13V-011 (NEW) P2 dsar** — DSAR-erased referee between activation and nightly credit issuance: behavior unspec'd.

---

## 3. ADVERSARIAL Check #2 — Seller Growth Loop End-to-End: L1 Vendor-Invite-Creates-Account

**Selection rationale.** L1 (§48.2.2) is the canonical seller-side acquisition loop and the foundational PLG mechanism in the Sourcera Seller funnel. Every Forced-Vendor-Signup execution flows through L1. L1 is NOT directly audited by Phase 13 sub-prompts (D-13V-001) — V13 walks it as the structural completion of the §48 audit surface.

### 3.1 End-to-End Trace

| Convention Dimension | Verdict | Evidence | New Defect? |
|---|---|---|---|
| (1) Mechanism + Trigger + Acting / Targeted entity | ✅ all present | §48.2.2 lines 34158–34164 | — |
| (1) GrowthLoopExecution row contract | ✅ per-execution + 60-day attribution | §48.2.2 line 34166 | — |
| (3) Plan-tier eligibility / throttle | ⚠ inline per-tier throttle 20/50/100/200/unlimited (§48.2.2 line 34181); inline numerical singletons not cited to §34.1.1 | line 34181 | **D-13V-012 (NEW) P2 numerical_singleton** — L1 anti-spam #1 inline per-tier throttle duplicates §34.1.1 |
| (4) Rate limits explicit | ✅ 6 controls (per-user, per-target-domain, shared-use, DMARC, opt-out, SIM) | §48.2.2 lines 34179–34186 | — |
| (5) Anti-spam | ✅ 6 controls cross-link §48.4.1 / §48.4.2 / §48.4.3 / §48.4.9 / §48.4.10 | line 34186 | — |
| (6) Telemetry events | ✅ 6 events registered | §48.2.2 lines 34170–34177 | — |
| (6) Telemetry — Appendix G registration | ⚠ events declared "(Appendix G — new)" inline; not verified against canonical Appendix G; given L1 is unaudited by Phase 13.1 (D-13V-001), no Phase 13 finding closes the question | lines 34170+ | **D-13V-013 (NEW) P2 documentation_gap** — L1 events declared "Appendix G — new" inline; Appendix G registration not verified by any Phase 13 sub-prompt |
| (6) Funnel defined | ⚠ AC #6 declares the funnel `growth_loop_l1_invite_emitted → invite_clicked → signup_attributed → first_bid_completed → kb_seeded` MUST be queryable in PostHog Insights → Funnels; performance budget `p95 ≤ 30 seconds` declared inline | §48.2.2 line 34197 | — (but see D-13V-014 below) |
| (6) Performance budget singleton | ⚠ inline p95 ≤ 30 seconds budget without §44.1 anchor | line 34197 | **D-13V-014 (NEW) P2 numerical_singleton** — L1 AC #6 PostHog funnel p95 ≤ 30 s inline; §44.1 has no corresponding row |
| (6) `throttle_kind` enum | ⚠ AC #3 declares `throttle_kind ∈ {per_user, per_target_domain}` — Appendix J registration not verified | line 34194 | **D-13V-015 (NEW) P2 enum** — `throttle_kind` enum used in L1 AC #3 not verified registered in Appendix J |
| (7) Acceptance criteria | ✅ 8 numbered, testable | §48.2.2 lines 34191–34199 | — |
| (8) Plan gating cross-reference | ⚠ inline per-tier throttle (see D-13V-012) | — | — |
| (9) Retention / DSAR / residency | ❌ silent on GrowthLoopExecution retention; §40.2 row not visible from §48.2.2 (and L1 was not directly audited so the §40.2 row presence is unverified) | — | **D-13V-016 (NEW) P2 retention** — §48.2.2 L1 silent on GrowthLoopExecution retention / DSAR / residency contract; §48.2.12 entity definition exists but L1 walk doesn't cross-reference |
| (10) Numerical singletons | ⚠ 60-day attribution window inline (§48.2.2 line 34174); 3σ SIM threshold inline (line 34186) | lines 34174, 34186 | included in D-13V-014 class |
| (12) Surface/engine mapping | ⚠ Ops Growth Console "alert within 5 minutes" referenced (AC #7); no Appendix M.1 row verified | line 34198 | **D-13V-017 (NEW) P2 surface_engine_mapping** — Ops Growth Console SIM-anomaly alert surface referenced in L1 AC #7; Appendix M.1 row not verified |
| (14) Failure modes — abandonment | ⚠ FM #2 (91-day late signup) covers attribution expiry; magic-link expiry/re-issue user-side recovery silent (parallels D-HM-006) | line 34204 | — (covered by D-HM-006 class) |
| (14) Failure modes — first-bid `kb_bootstrap` <60% acceptance | ❌ silent — AC #6 funnel's `growth_loop_l1_kb_seeded` requires ≥60% approval; what happens at <60%? Loop status enum unspec'd | line 34176 | **D-13V-018 (NEW) P2 acceptance_criteria** — L1 `kb_bootstrap` acceptance-rate fork (<60% vs ≥60%) unspec'd at loop level |

### 3.2 L1 → HM-S1 Linkage Probe

L1's `growth_loop_l1_first_bid_completed` event is the upstream signal that funnels into the Hero Moment §48.8.4 `seller_onboarding_first_bid_submitted` event. The spec has both events but does NOT explicitly bind them via a documented funnel-stage relationship in §51.1.5 or in §48.2.2 ACs. A junior engineer reading L1 alone cannot tell where the L1 funnel ends and where the Hero Moment funnel begins. PHASE_HM D-HM-012 covers the parallel naming-drift on `seller_first_requirement_response` vs `seller_onboarding_first_requirement_response`; D-13V-019 (NEW) P2 instrumentation_gap covers the L1 → HM funnel handoff (`growth_loop_l1_first_bid_completed` ↔ `seller_onboarding_first_bid_submitted`).

### 3.3 Counterfactual Failure Modes for L1

1. **Vendor signs up via direct path while invite is in-flight (race).** Resolved per §48.2.2 FM #3 — earliest invite credited; `growth_loop_l1_attribution_ambiguous_resolved` emitted. ✅
2. **Loops.so email send fails (third-party outage).** Spec is silent on whether the GrowthLoopExecution row stays `in_progress` or transitions to `failed_to_send`. §41.2 retry curve may apply but is not cross-referenced from L1. **D-13V-020 (NEW) P2 acceptance_criteria** — L1 silent on Loops.so outage during email send.
3. **Buyer Org's DMARC preflight passes at invite creation but degrades to < 0.85 before send.** §48.2.2 anti-spam control #4 says "a domain with `dmarc_alignment_pass_rate < 0.85` (rolling 7d) defers all L1 invites to a manual-review queue." The check at send-time vs. queue-time is unclear; if checked at queue-time, the deferred email could miss its 60-day attribution window. **D-13V-021 (NEW) P2 acceptance_criteria** — L1 DMARC preflight check temporal ordering vs attribution-window-clock ambiguous.

---

## 4. ADVERSARIAL Check #3 — Hero Moment Failure Construction

**Scenario.** Construct a realistic Hero Moment failure and verify the spec's recovery path.

**Scenario chosen.** **Firecrawl outage during Stage 2 / Stage 3 (kb_bootstrap)** — a third-party-dependency outage on a Tier-1 capability inside the §48.8 Seller Hero Moment p90 ≤ 60-min activation window. Firecrawl is the URL-crawler dependency that powers `kb_bootstrap` per §48.8.3 line 38427 (progress storytelling line "Scanning yourcompany.com…"). Per the Audit Checklist §14 Edge Cases list, Firecrawl is one of the named third-party outages requiring explicit handling.

### 4.1 Timeline

| T | Event | Spec coverage |
|---|---|---|
| T=0 | Seller clicks magic-link | ✅ §48.8.3 step 1 — landing page renders |
| T=0–15s | SSO initiate | ✅ §48.8.3 step 2 |
| T=15s | SSO redirect; `kb_bootstrap` pre-resolved job transitions to `executing` | ✅ §48.8.3 step 3 |
| T=15s | Firecrawl API returns HTTP 503 / connection timeout | partial coverage |
| T=15–30s | Progress storytelling renders *"Scanning yourcompany.com…"* line | ❌ **line is literally false** — Firecrawl is down; no scan is happening. §48.8.3 step 5 anti-pattern #7 explicitly bans faked progress; the literal-truth invariant is broken when the underlying capability is down. |
| T=30s | What does the user see? | ⚠ ambiguous |
| T=90s | `stage_3_bid_workspace_loaded_at` written; `stage_3_population_latency_ms` computed | ⚠ Bootstrap is degraded → KB-Draft entries are zero or sparse |
| T=90s | `hero_moment_completed_at` write condition: "all three Stage 3 surfaces are present (KB Draft + first-pass response + progress strip) AND `stage_3_population_latency_ms ≤ 10,000`" | ⚠ KB Draft surface may render empty; predicate edge-case |

### 4.2 Spec's Stated Recovery Paths

§48.8.9 #1 "Dependency outage: Firecrawl down during Stage 2" states verbatim: *"Graceful degradation per §48.8.3 failure mode 2; Bootstrap proceeds with reduced URL set; session progresses; `capability_degradation_triggered = true`; on-call alerted."*

But §48.8.3 FM #2 reads: *"First-Pass Responder capability unavailable. Graceful degradation per C.140: Bootstrap still runs, KB entries are proposed…"* — this is the FIRST-PASS RESPONDER FM, NOT a Firecrawl-specific FM. §48.8.9 #1 cross-references the wrong FM; §48.8.3 has no Firecrawl-down FM.

### 4.3 Defect Verdict

The §48.8.9 #1 ↔ §48.8.3 FM #2 cross-reference is broken. §48.8.3's enumerated failure modes are: (1) SSO outage, (2) First-Pass Responder unavailable, (3) Stage 3 latency breach, (4) Seller hits Back, (5) Org-disambiguation. None of these is "Firecrawl down." The spec asserts graceful degradation for Firecrawl at the aggregate §48.8.9 level but does NOT author the user-side surface: (i) which progress-storytelling line replaces *"Scanning yourcompany.com…"* when Firecrawl is down? (ii) what does the seller see if Firecrawl is partially up (some pages succeed, others 503)? (iii) does Stage 3 latency budget include the Firecrawl-retry path or does the on-call page fire at T=90s? (iv) does the KB-Draft surface render empty, partial, or with an apology banner? (v) does the `hero_moment_completed_at` predicate satisfy "KB Draft surface is present" when the surface renders with zero entries because Firecrawl was down?

**D-13V-022 (NEW) P1 instrumentation_gap** — §48.8.9 #1 (Firecrawl down) cross-references §48.8.3 FM #2 which is the First-Pass Responder failure mode; no Firecrawl-specific user-side recovery surface is authored (progress-line substitution, partial-success rendering, capability-degradation banner copy, Stage 3 latency-budget interaction, `hero_moment_completed_at` predicate behavior on zero-entry KB Draft). The §48.8.7 #7 banned-anti-pattern (no faked progress) is violated if the *"Scanning yourcompany.com…"* line renders during a Firecrawl outage.

**This is the V13's surfaced P0-candidate.** Severity classification probe: Severity Rule for P0 includes "(a) breaks console firewall, (b) exposes PII/PCI, (c) violates hard regulatory requirement, (d) leaves billing surface ambiguous in a way that allows revenue leakage or double-charge, (e) leaves a CI gate runtime-unwireable." D-13V-022 violates none of (a)–(e); the consequence is a user-visible quality degradation (false progress line + ambiguous recovery), not a stamp-blocking break. **P1 stands** per Severity Rule "P1 = feature unbuildable as written; missing acceptance criteria; missing error code." Engineering cannot build the Firecrawl-degradation surface from the spec.

### 4.4 Recovery Path Verification

Per the V13 prompt's check #3 "Construct a Hero Moment failure. Confirm recovery path."

| Recovery dimension | Spec coverage | Verdict |
|---|---|---|
| Engineering recovery (graceful degradation; on-call paging) | ✅ §48.8.9 #1 + §4.4.22 AC #4 page on-call within 60s of latency breach | ✅ |
| User-side surface during Firecrawl outage (progress line substitution; capability-degradation banner) | ❌ unauthored | **D-13V-022** |
| User-side recovery if Bootstrap fails entirely (KB Draft surface zero entries) | ❌ unauthored; the `kb_bootstrap` "1 lifetime free per Seller Org" rule per §48.8.4 implies the seller has now consumed their one free Bootstrap on a degraded run; no compensation contract | **D-13V-023 (NEW) P1 acceptance_criteria** — lifetime-free `kb_bootstrap` allowance burn on Firecrawl-degraded run lacks compensation contract; parallels D-5.7-024 (Stage-3 mid-streaming abandonment burns lifetime-free allowance with no compensation contract) |
| User-side recovery if seller abandons mid-Firecrawl-outage | partial — D-HM-006 covers abandonment recovery absence generally | covered by D-HM-006 |
| User notification when Firecrawl recovers post-abandonment | ❌ unauthored | **D-13V-024 (NEW) P2 acceptance_criteria** — Firecrawl recovery notification (seller has left; Firecrawl is back; should the system re-run Bootstrap and notify?) unauthored |

**Recovery path verdict: PARTIAL.** Engineering recovery (graceful degradation + on-call paging) is authored. User-side recovery (progress line, banner, allowance compensation, recovery notification) is NOT authored. **The Hero Moment failure CONSTRUCT-AND-VERIFY check FAILS the user-side recovery dimension.**

---

## 5. V13-Originated Defect Roll-Up

24 defects filed against Phase 13V scope, of which all 24 are V13-originated.

| defect_id | severity | class | scope |
|---|---|---|---|
| D-13V-001 | P1 | documentation_gap | §48.2 The 10 Core Growth Loops (L1–L10) NOT directly audited by Phase 13 sub-prompts |
| D-13V-002 | P1 | documentation_gap | §48.4 Anti-Spam & Abuse Controls (12 subsections) NOT directly audited by Phase 13 sub-prompts |
| D-13V-003 | P2 | documentation_gap | §48.1.1–§48.1.4 + §48.1.8 PLG framing + acceptance criteria NOT directly audited |
| D-13V-004 | P1 | acceptance_criteria | M16 same-domain-block enforcement temporal ordering ambiguous (step 1 create-time HTTP 422 vs step 4 "at signup") |
| D-13V-005 | P2 | surface_engine_mapping | M16 Referral Link Landing Page UX surface introduced inline; Appendix M.1 row coverage unverified |
| D-13V-006 | P2 | acceptance_criteria | M16 fraud signal arriving between step 7 (activated transition) and step 9 (nightly job) — re-evaluation behavior unspec'd |
| D-13V-007 | P2 | numerical_singleton | M16 365-day credit expiry inline at §48.7.3 step 9; no §40.2 / §34.10 authoritative anchor |
| D-13V-008 | P1 | instrumentation_gap | M16 conversion funnel (`created → link_shared → signed_up → activated → credit_issued → applied → redeemed`) absent from §48.7.3 and §51.1.5 |
| D-13V-009 | P2 | authored_extension | M16 Failure Mode #4 carries inline Authored-Extension flag; no `_integration/AUTHORED_EXTENSIONS_LEDGER.md` row |
| D-13V-010 | P2 | acceptance_criteria | M16 multi-referrer race for same `referee_email` at >2 referrer cardinality — queue depth + velocity-check behavior unspec'd |
| D-13V-011 | P2 | dsar | M16 DSAR-erased referee between activation and nightly credit issuance — behavior unspec'd |
| D-13V-012 | P2 | numerical_singleton | L1 per-tier invite throttle inline at §48.2.2 anti-spam #1 (20/50/100/200/unlimited); duplicates §34.1.1 |
| D-13V-013 | P2 | documentation_gap | L1 6 telemetry events declared "(Appendix G — new)" inline; Appendix G registration unverified (L1 unaudited per D-13V-001) |
| D-13V-014 | P2 | numerical_singleton | L1 AC #6 PostHog funnel p95 ≤ 30 s + 60-day attribution + 3σ SIM threshold inline; §44.1 / §40.2 anchors absent |
| D-13V-015 | P2 | enum | L1 AC #3 `throttle_kind ∈ {per_user, per_target_domain}` Appendix J registration unverified |
| D-13V-016 | P2 | retention | §48.2.2 L1 silent on GrowthLoopExecution retention / DSAR / residency cross-reference (§48.2.12 entity exists; L1 walk doesn't cite) |
| D-13V-017 | P2 | surface_engine_mapping | L1 AC #7 Ops Growth Console SIM-anomaly alert surface — Appendix M.1 row unverified |
| D-13V-018 | P2 | acceptance_criteria | L1 `kb_bootstrap` acceptance-rate fork (<60% vs ≥60%) — loop status enum unspec'd |
| D-13V-019 | P2 | instrumentation_gap | L1 → HM funnel handoff (`growth_loop_l1_first_bid_completed` ↔ `seller_onboarding_first_bid_submitted`) not explicitly bound in §51.1.5 or §48.2.2 |
| D-13V-020 | P2 | acceptance_criteria | L1 silent on Loops.so outage during email send (state-machine transition; retry behavior; attribution clock) |
| D-13V-021 | P2 | acceptance_criteria | L1 DMARC preflight temporal ordering — send-time vs queue-time check + attribution-window clock interaction unspec'd |
| D-13V-022 | P1 | instrumentation_gap | §48.8.9 #1 (Firecrawl outage) cross-references §48.8.3 FM #2 which is First-Pass Responder; no Firecrawl-specific user-side surface authored (progress-line substitution, banner, partial-success, predicate behavior) |
| D-13V-023 | P1 | acceptance_criteria | Hero Moment lifetime-free `kb_bootstrap` allowance burn on Firecrawl-degraded run lacks compensation contract (parallels D-5.7-024) |
| D-13V-024 | P2 | acceptance_criteria | Firecrawl-recovery notification path (seller abandoned during outage; Firecrawl recovers) unauthored |

**Severity roll-up:** 0 P0 / 6 P1 / 18 P2 / 0 P3.

---

## 6. Self-Challenge Pass

Re-read findings as hostile staff engineer.

- **D-13V-001 (P1).** Hostile reviewer: *"Prompt 13.1 explicitly scoped to M1–M17. §48.2 L-loops are out of scope by the prompt's own text — V13 cannot retroactively expand scope."* Counter: V13 prompt text reads "STRUCTURAL — §48 + §51 audited." V13 inherits Phase-13.1's scope-limit but is structurally responsible for declaring whether the V13 STRUCTURAL bar is met. §48.2 is part of §48 and is not audited; declaring it audited would be false. The finding is filed as `documentation_gap` to indicate that an audit-program completeness gap exists, not a Master Spec defect. **P1 stands** — `Audit_Prompts.md → How to Use This Program §4` prohibits V-prompt advance on unresolved P0/P1; but classifying §48.2 unaudited as P1 instead of P0 reflects that the §48.2 content is well-authored in the spec (the gap is in audit coverage, not in build readiness).
- **D-13V-002 (P1).** Same reasoning as D-13V-001. §48.4 is the canonical anti-spam framework; its unaudited state is an audit-program gap, not a Master Spec defect. **P1 stands.**
- **D-13V-003 (P2).** §48.1.1 / .2 / .3 / .4 / .8 are framing + AC roll-up sub-sections. The PHASE_HM walk traversed §48.1.5 / .6 / .7. PHASE51 walked §51 in full. The unaudited §48.1 sub-sections are lower-stakes (framing, not behavior). **P2 stands** (downgraded from P1 because the missing material is framing-level).
- **D-13V-004 (P1).** Hostile reviewer: *"Step 1 is API enforcement; step 4 is workflow narrative — they describe the same enforcement at two layers."* Counter: the M16 §48.7.3 Workflow table at line 38035 says *"At signup, if `referrer_email_domain = referee_email_domain` (excluding shared-use domains per §48.4.3): `same_domain_suppressed = true`"* — this is at the `pending → signed_up` transition (step 3 event, step 4 enforcement). The POST /v1/referrals API at line 38122 returns `m16_same_domain_blocked` HTTP 422 at create time (step 1). The two paths cannot both be authoritative — either the create-time check rejects (and step 4 never fires) or the create-time check passes and step 4 enforces at signup. **P1 stands.** A junior engineer building the validator will produce two different validators against the same predicate.
- **D-13V-005 / -017 (P2 surface_engine_mapping).** Cosmetic Appendix M coverage probe. P2 stands.
- **D-13V-006 (P2).** Steps 7 / 9 SIM-signal interaction is ambiguous but a thoughtful engineer can resolve it (assume re-evaluation; latest fraud signals win). P2 stands.
- **D-13V-007 / -012 / -014 (P2 numerical_singleton).** Same class as D-48-004; V13 surfaces specific instances at M16 / L1. P2 stands.
- **D-13V-008 (P1).** Hostile reviewer: *"The funnel is implicit in the 13-event registry; engineering can define the funnel in PostHog Insights without spec authoring."* Counter: per the V13 prompt's check #1 "Confirm instrumentation," instrumentation means more than event registration — it means the funnel binding (event → stage), the dashboard surface (panel name + render contract), and the §51.1.5 cross-reference. M16's 13 events are registered but the funnel definition is silent. PostHog Insights authoring without spec guidance produces inconsistent funnels across teams. **P1 stands.** This is the same severity rule that produces D-51-003 (conversion funnel definitions absent from §51 per growth path).
- **D-13V-009 (P2).** §48.7.3 Failure Mode #4 carries the inline "Authored extension — flagged" annotation; CLAUDE.md §13 rule 4 requires a ledger row. P2 stands.
- **D-13V-010 / -011 / -018 / -020 / -021 / -024 (P2 acceptance_criteria).** Edge cases that a thoughtful engineer can resolve but two engineers would resolve differently. P2 stands.
- **D-13V-013 / -015 / -019 (P2).** Cross-document verification gaps surfaced by L1 walk. P2 stands.
- **D-13V-016 (P2 retention).** L1 narrative doesn't cite §48.2.12 retention; §48.2.12 entity exists with retention rules but the L1 walk doesn't pull through. P2 stands.
- **D-13V-022 (P1 instrumentation_gap).** Hostile reviewer: *"Firecrawl is one of many third-party dependencies; the spec's general failure-mode handling at §48.8.9 #1 names graceful degradation; engineering can build the surface from convention."* Counter: §48.8.7 #7 explicitly bans faked progress; the spec's authored progress-storytelling line *"Scanning yourcompany.com…"* is anti-pattern-positive when Firecrawl is down. Engineering cannot resolve this from convention — they need an authored alternate-progress line, an authored degradation banner, and an authored predicate behavior. **P1 stands.** Severity probe: P0 rule (e) "leaves a CI gate runtime-unwireable" — the §48.8.7 AP6/AP7 detector CI gates assert the absence of faked progress; if the spec ships with a literal *"Scanning yourcompany.com…"* line that displays during Firecrawl outage, the detector will fire false-positives or the production path will trip the detector. Borderline P0 candidate but stops short because the detector is a static-text detector (asserting the line is never authored), not a runtime detector (asserting the line never renders when Firecrawl is down). **P1 stands.**
- **D-13V-023 (P1 acceptance_criteria).** Hostile reviewer: *"D-5.7-024 already covers Stage-3 mid-streaming abandonment burning the lifetime-free allowance; D-13V-023 is duplicative."* Counter: D-5.7-024 is about ABANDONMENT (seller leaves); D-13V-023 is about DEGRADATION (seller completes the flow but the platform's third-party dependency was down). The failure modes differ: D-5.7-024 closes by re-issuing magic-link OR compensating the allowance; D-13V-023's compensation question is whether a degraded-but-completed Bootstrap deserves a re-Bootstrap allowance. Different policy choice. **P1 stands** but linked to D-5.7-024.

No severity revisions. Recommendations sharpened where helpful in §7 below.

---

## 7. Counterfactual Pass

Per V13 prompt's "construct a Hero Moment failure," the Firecrawl outage is the primary counterfactual. Three additional counterfactuals across §48 + §51 to confirm Phase 13 coverage:

1. **PostHog ingest outage during the M16 referral funnel.** M16 events are dual-written per §51.1.4 outbox; outbox lag p95 ≤ 60s per §51.1.6 AC-5. Behavior at lag > 60s: dashboards stale; AC-5 lag-breach pages on-call; customer-visible dashboard behavior unspec'd. Covered by D-51-022 (third-party-outage failure modes absent). ✅
2. **Stripe Credit Note creation succeeds at issuance but Stripe later reverses the credit due to chargeback against the referee.** M16 spec is silent. The reversal would require a `referral.credit_redeemed → forfeited_post_redemption` transition with an explicit Appendix L state machine. **D-13V-025 (NEW) P2 state_machine** — M16 Stripe-chargeback-post-issuance state-machine path unauthored.
3. **L1 attribution-window edge case: vendor signs up at T+59d, 23h, 59m via direct path (not via the magic-link).** L1 AC #5: "The 60-day attribution window MUST be evaluated against `growth_loop_execution.created_at`." A 60-day-minus-1-second signup credits the buyer; a 60-day-plus-1-second signup fires `growth_loop_l1_attribution_expired`. Boundary behavior at exactly T+60 days: spec is silent on inclusive vs exclusive bound. **D-13V-026 (NEW) P3 acceptance_criteria** — L1 60-day attribution window boundary inclusivity unspec'd.

Updated total: **26 V13-originated defects — 0 P0 / 6 P1 / 19 P2 / 1 P3.**

---

## 8. Sign-Off Verdict

V13 prompt's narrow sign-off gate: **"zero P0 instrumentation_gap."**

| Sign-off dimension | Verdict |
|---|---|
| Phase 13.1 sub-prompt P0 `instrumentation_gap` count | 0 |
| Phase 13.2 sub-prompt P0 `instrumentation_gap` count | 0 |
| Phase 13.3 sub-prompt P0 `instrumentation_gap` count | 0 |
| Phase 13.4 sub-prompt P0 `instrumentation_gap` count | 0 |
| V13-originated P0 `instrumentation_gap` count | 0 (D-13V-022 P1; not P0 per Severity Rule probe) |
| **Total P0 `instrumentation_gap` across Phase 13 scope** | **0** |

**V13 NARROW SIGN-OFF: PASS** on the zero-P0-instrumentation_gap gate.

### 8.1 Broader Verification Protocol

Per `Audit_Prompts.md → Global Verification Protocol`: *"If any V prompt finds an unresolved P0 or P1 defect, STOP. Do not advance. Append remediation tasks and resolve before continuing."*

Open P1 defects in Phase 13 scope at V13 close:

- Phase 13.1: D-48-001 / -002 / -003 / -004 (4 P1)
- Phase 13.2: D-48.3-001 / -002 (2 P1)
- Phase 13.3: D-51-001 / -002 / -003 / -004 / -005 / -006 / -007 / -008 / -009 / -010 / -011 / -012 / -013 (13 P1)
- Phase 13.4 (PHASE_HM): D-HM-001 / -002 / -003 / -004 / -006 / -009 (6 P1)
- V13-direct: D-13V-001 / -002 / -004 / -008 / -022 / -023 (6 P1)
- **Total Phase 13 open P1:** **31**

**V13 BROAD SIGN-OFF: HALT** on the Global Verification Protocol P1 bar. Phase 14 (Cross-Document Consistency Audit) cannot advance from Phase 13 outputs until the 31 P1 defects are resolved or formally re-classified.

### 8.2 Recommended Remediation Ordering

1. **Tier 1 (closure required before v7.1.1 stamp):**
   - D-13V-022 (Firecrawl-specific user-side recovery — author §48.8.3 FM #6 and §48.8.9 #1 cross-reference correction).
   - D-13V-023 (Bootstrap allowance compensation contract — same §22 / §48.8 cluster as D-5.7-024).
   - D-HM-001 (Hero Moment exit ambiguity — author single terminal predicate).
   - D-HM-002 (Buyer-side Hero Moment authoring — §35.5 Authored Extension).
   - D-HM-003 + D-HM-004 (PostHog event payload schema drift — reconcile §48.8.3 ↔ Appendix G §48.8.8).
   - D-HM-006 (Hero Moment abandonment recovery — §48.8.9.1 Authored Extension).
   - D-HM-009 (Solo-tier Hero Moment SLO cohort — extend §48.8.10 ACs #30 / #31).
   - D-51-001 / -002 / -003 (Buyer Activation Metric, retention cohorts, conversion funnels — §51 instrumentation completeness).
   - D-51-011 / -012 / -013 (Hero Moment wildcard, Forced-Vendor-Signup, `kb_citation_in_closed_bid_attributed` registration).
   - D-51-004 / -005 / -006 / -007 (Plan-gating drift across §51.3.6 / §51.4.5 — Solo + 6-tier Seller).
2. **Tier 2 (closure recommended before v7.1.1 stamp):**
   - D-13V-001 / -002 / -003 (audit-program completeness — re-run Phase 13.1 against §48.2 L1–L10, run a new Phase 13.5 against §48.4 Anti-Spam, run a Phase 13.6 against §48.1 framing).
   - D-13V-004 (M16 same-domain-block temporal ordering).
   - D-13V-008 (M16 funnel definition).
   - D-48-001 / -002 / -003 / -004 (§48 M1–M17 AARRR / KPI / rate-limit / numerical-singleton class).
   - D-48.3-001 / -002 (buyer-side + cross-side network-effect inventories).
   - D-51-008 / -009 / -010 (API endpoint canonicalization, envelope-violation enum drift, §40.2 missing rollup retention rows).
3. **Tier 3 (v7.1.1 backlog):** the 19 P2 + 1 P3 V13-direct defects + the 32 P2 + 6 P3 Phase 13 sub-prompt defects.

### 8.3 Audit-Program Completeness Recommendation

To close D-13V-001 / -002 / -003 cleanly:

- **Run a new Prompt 13.1.A — §48.2 L1–L10 Core Growth Loops Walk.** Mirror the Phase 13.1 7-point checklist applied per L-loop (L1, L2, L4, L5, L7, L8, L9, L10 — 8 active loops; L3 / L6 retired). Surface mechanic-level rate-limit, instrumentation, north-star KPI, AARRR classification, plan-tier eligibility, anti-spam linkages, and event registration. Target output: ≈ 30–50 defects.
- **Run a new Prompt 13.5 — §48.4 Anti-Spam & Abuse Controls Walk.** Walk §48.4.1 – §48.4.12 (10 active subsections; §48.4.1–§48.4.12 numbered 1–12 with two retired). Convention-bar coverage on: throttle algebra; DMARC scoring; shared-use domain registry refresh policy; content validator capability binding to §22; template spam classifier model lifecycle; k-anonymity floor application matrix per §48.3 / §27 / §48.7; vendor opt-out registry residency partition; SIM cross-reference completeness. Target output: ≈ 20–30 defects.
- **Run a new Prompt 13.6 — §48.1 Framing + Acceptance Criteria Walk.** Cover §48.1.1 / .2 / .3 / .4 / .8 — Buyer Console Paid Path, Seller Console Paid Path, PLG Funnel Configurability, Acceptance Criteria, Acceptance Criteria (Extended). Target output: ≈ 5–10 defects.

These three additional prompts can run in parallel and close the V13 STRUCTURAL gap. They are gated to v7.1.1 stamp under the audit-program v1.0 amendment.

---

## 9. Counterfactual + Self-Challenge Logging (audit hygiene)

- Self-challenge pass complete (§6). No severity revisions; one recommendation sharpened (D-13V-022 P0-vs-P1 probe documented).
- Counterfactual pass complete (§7). Two additional defects surfaced (D-13V-025 P2; D-13V-026 P3).
- Pre-edit Master Spec backup: not applicable — V13 is non-destructive audit per `Audit_Prompts.md` default policy.

---

## 10. Run-Log Footnote

This Phase-13V audit was conducted on 2026-05-12 in a fresh local Cowork Opus session. Phase 13 sub-prompt outputs treated as input (read end-to-end via the four PHASE48_FINDINGS / PHASE48.3_FINDINGS / PHASE51_FINDINGS / PHASE_HM_FINDINGS scratch logs). Master Spec v7.1.0 baseline confirmed against the changelog header (`Version: 7.1.0`, `Last Updated: 2026-04-28`, `Status: Current`). Defect rows promoted to `_audit/DEFECT_LEDGER.md` Phase 13V section. Coverage matrix updates for the §48 / §51 row family appended to `_audit/COVERAGE_MATRIX.md` Phase-13V block.
