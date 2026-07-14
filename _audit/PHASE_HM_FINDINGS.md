# PHASE_HM FINDINGS — Hero Moment Walk (Buyer-side + Seller-side)

**Audit prompt.** Walk every Hero Moment in the spec (buyer-side + seller-side). For each, verify (1) definition (entry / "moment of value" / exit), (2) PostHog event in Appendix G, (3) metric target, (4) recovery path on miss, (5) Solo-Tier Hero Moment if applicable. File defects per `Audit_Prompts.md → Defect Ledger Format`.

**Source pass.** Read end-to-end: §4.4.22 SellerOnboardingSession (lines 6217–6373), §13.12 Buyer Maya Intake (lines 13999–14148), §22.18.6 Stake-Reveal Moments (referenced via §22.18 lines 19297–19453), §22.20 Seller Maya Surface Abstraction + §22.20.6 Magic-Link Hero Moment Polish (lines 19532–19800), §35.1 Buyer Onboarding (lines 31098–31127), §35.2 Seller Onboarding (lines 31128–31307), §35.4 Acceptance Criteria (line 31293), §44.6 Solo-Tier Surface Treatment (lines 33339–33500), §48.1.5 Seller Hero Moment Framework (lines 34032–34076), §48.1.7 Three Conversion Moments (referenced), §48.8 Seller Hero Moment & Onboarding Anti-Patterns (lines 38350–38790), §49.1 Implementation-Level Seven-Stage Flow (lines 38794–39320), Appendix G §48.8.8 canonical Hero Moment registry (lines 44598–44755), Appendix I error code §48 PLG / Hero Moment block (lines 45577–45620), Appendix J `seller_onboarding_invite_source` and related enums (lines 47944–48090).

---

## Hero Moment Inventory (what the spec actually surfaces)

| # | Hero Moment | Anchor | Console | Solo-aware? |
|---|---|---|---|---|
| HM-S1 | **Seller Hero Moment** (canonical) — magic-link → KB Bootstrap → First-Pass Draft → Bid Workspace landing → in-workspace review → first-bid submit → Stake-Reveal Screen | §48.8 + §35.2 + §49.1 + §4.4.22 + §22.20.6 | Seller | Yes (§22.20.6 + §44.6 partial) |
| HM-S2 | **Stake-Reveal Moment 1** — `reveal_moment = free_tier_kb_landing` on the §22.18.4 Seller Panel | §22.18.6.1 + §22.18.4 | Seller | n/a (Free-only by construction) |
| HM-S3 | **Stake-Reveal Moment 2** — `reveal_moment = outcome_debrief` on the post-bid-close debrief overlay | §22.18.6.2 + §48.7 | Seller | No (no Solo override authored) |
| HM-S4 | **Stake-Reveal Moment 3** — `reveal_moment = conversion_threshold` on the KB-ceiling-approach surface | §22.18.6.3 + §48.8.6 CM3 | Seller | No |
| HM-S5 | **Conversion Moment #1** — Second concurrent bid upgrade prompt | §48.1.7 + §48.8.6 CM1 | Seller | No |
| HM-S6 | **Conversion Moment #2** — First EOI attempt upgrade prompt | §48.1.7 + §48.8.6 CM2 | Seller | No |
| HM-S7 | **Conversion Moment #3** — KB ceiling approach upgrade prompt | §48.1.7 + §48.8.6 CM3 | Seller | n/a (Free-only by construction) |
| HM-B1 | **Buyer "What Are You Evaluating?" Intake materialization** — closest structural analog of a Hero Moment on the buyer side; not labeled a Hero Moment in the spec | §13.12 + §35.1 Step 4 | Buyer | Solo plan-tier behavior covered (§13.12.4 truncation) — no Hero Moment framing |
| HM-B2 | **Buyer Onboarding Flow steps 1–7** — generic onboarding, no Hero Moment framing | §35.1 + §35.4 | Buyer | n/a |

**Bare-term confirmation.** The string "Hero Moment" appears 100+ times in the Master Spec, exclusively in seller-side context. The string "Buyer Hero Moment" appears zero times. The §48.8.1 Scope explicitly declares: *"Out of scope. Buyer-side invite-creation UX."*

---

## Per-Hero-Moment 5-Point Walk

Legend: ✅ explicit & complete; ⚠ partial / implicit; ❌ silent.

| # | (1) Definition (entry / value / exit) | (2) PostHog event (App. G) | (3) Metric target | (4) Recovery path on miss | (5) Solo-Tier spec'd |
|---|---|---|---|---|---|
| HM-S1 Seller Hero Moment | ⚠ entry & value clear (magic-link click; "Your bid is ready" landing counter); **exit ambiguous — three different definitions across §4.4.22 / §48.1.5 / §48.8.5** → D-HM-001 | ⚠ canonical events registered (`hero_moment_completed`, `hero_moment_latency_breached`, `hero_moment_first_edit`, `seller_onboarding_first_requirement_response`, `stake_reveal_rendered`) BUT **payload schema drift** between §48.8.3 inline and App. G §48.8.8 canonical → D-HM-003 + D-HM-004 + D-HM-005 + D-HM-012 | ✅ p50 < 20min, p90 < 60min (§48.8.10 AC #30/#31); Stage-3 latency p90 ≤ 10,000ms (§4.4.22 AC #4); §48.8.10 AC #41 quarterly re-commit discipline | ⚠ engineering recovery paths (Firecrawl outage, SSO outage, Bootstrap fail) ✅ but **no user-side abandonment re-engagement email / inbox nudge** → D-HM-006; latency-breach has no user-facing recovery → D-HM-007 | ⚠ surface compression spec'd (§22.20.6 + §44.6) but **no Solo-tier-specific activation-metric cohort or throttled-session SLO** → D-HM-009 |
| HM-S2 Stake-Reveal Moment 1 | ✅ rendering trigger spec'd (§22.18.4.1 — every Seller Panel render on a Free-tier Org); ❌ no entry/exit/value framing as a Hero Moment | ✅ `stake_reveal_rendered {reveal_moment = free_tier_kb_landing, ...}` per §19305; ⚠ App. G canonical registration omits `reveal_moment` property → D-HM-005 | ❌ no metric target (no dwell, no view rate, no click-through) → D-HM-010 | ❌ no recovery path defined; render is best-effort | ✅ Free-only by construction |
| HM-S3 Stake-Reveal Moment 2 | ✅ trigger = bid-close + outcome resolved; value = win/loss debrief; ⚠ exit not framed | ✅ `stake_reveal_rendered {reveal_moment = outcome_debrief, ...}` per §19328 | ❌ no metric target (no open rate, no dwell) → D-HM-010 | ⚠ Win/Loss Debrief delivery has DLQ per §48.7 (engine-side); no user-side miss recovery | ❌ no Solo override (the monetary copy in the debrief is unaddressed by §22.20.6) → D-HM-016 |
| HM-S4 Stake-Reveal Moment 3 | ✅ trigger = KB-ceiling 45-entry threshold; ⚠ value framing collides with Conversion Moment #3 | ✅ `stake_reveal_rendered {reveal_moment = conversion_threshold, ...}` | ❌ no metric target → D-HM-010 | ⚠ overlaps with CM3 frequency cap path | n/a (Free-only by construction); but taxonomy collision with §48.8.6 CM3 → D-HM-008 |
| HM-S5 CM1 Second concurrent bid | ✅ trigger / value / exit clear (§48.8.6 CM1) | ✅ `seller_onboarding_conversion_moment_fired {kind: second_concurrent_bid}` (§48.1.7) | ⚠ no per-CM metric target beyond the §48.8.10 aggregate 18% trailing-90-day conversion (§4.4.22 AC #10) — per-CM funnel not bound to an SLO | ⚠ "Save this EOI for later" affordance applies to CM2 only; CM1 has no save-for-later path; no re-engagement nudge | ❌ Free-only by construction; Solo override not addressed |
| HM-S6 CM2 First EOI | ✅ | ✅ | ⚠ same as CM1 | ✅ "Save this EOI for later" (§48.8.6 CM2) | ❌ same |
| HM-S7 CM3 KB ceiling | ✅ | ✅ + secondary banner event `seller_free_kb_ceiling_reached` (§48.8.6 AC #31) | ⚠ same as CM1/CM2 | ✅ archive affordance + persistent banner | n/a (Free-only) + taxonomy collision → D-HM-008 |
| HM-B1 Buyer Maya Intake | ⚠ structurally a Hero Moment (entry = Workspace creation, value = pre-populated Workspace landing, exit = §13.12.7 callout dismissal) BUT **not labeled a Hero Moment** in the spec → D-HM-002 | ⚠ `workspace_intake_completed` (§13.12.7) registered as Authored Extension, NOT in App. G yet | ⚠ §44.1 latency budget (p95 ≤ 2.5s Free / ≤ 4.5s Solo+) per §13.12.4; **no activation-metric target (e.g., time-to-first-Requirement-edit, intake-completion rate)** | ❌ §13.12.8 #4 covers materializer failure only; no user-abandonment re-engagement; no "you started but didn't finish" nudge → D-HM-002 cascading | ⚠ Solo plan-tier truncation covered (§13.12.4); no Solo Hero Moment framing |
| HM-B2 Buyer Onboarding Flow | ❌ no Hero Moment framing; §35.1 reads as a generic 7-step wizard | ❌ no buyer-side activation event in App. G analogous to `seller_onboarding_first_requirement_response` → D-HM-002 | ❌ only "Buyer onboarding complete in < 10 minutes" (§35.4 line 31295) — no p50/p90, no cohort breakdown, no "first value" target → D-HM-002 | ❌ no abandonment recovery; no re-engagement email sequence; no inbox surface | ❌ no Solo-tier framing in §35.1 / §35.4 |

---

## Cross-Cutting Findings (promoted to ledger)

### F-1 Hero Moment is asymmetric between consoles

The spec instruments a fully-spec'd Seller Hero Moment (§48.8 + §49.1 + §4.4.22 + §22.20.6 + §44.6) and an explicitly-out-of-scope buyer-side counterpart (§48.8.1 Scope). The audit prompt explicitly asks for "buyer-side + seller-side" coverage. The asymmetry is the largest defect cluster (D-HM-002 — buyer Hero Moment missing entirely).

### F-2 Hero Moment exit-condition ambiguity is structural, not cosmetic

`hero_moment_completed_at` (§4.4.22) writes at Stage 3 (≤10s). §48.1.5 Phase 4 = Post-Submission Reveal (≥1 hour later). §48.8.5 names the Stake-Reveal Screen the moment that "is where the vendor first perceives Sourcera as an asset." A reader will get three different answers to "when does the Hero Moment end?" depending on which section they consult. (D-HM-001.)

### F-3 Stake-Reveal taxonomy collision

§22.18.6 enumerates three "Stake-Reveal Moments" (`free_tier_kb_landing`, `outcome_debrief`, `conversion_threshold`). §48.8.5 names a fourth Stake-Reveal Screen (the Hero Moment Phase 4 post-submission reveal). The §48.8.5 surface is NOT one of the §22.18.6 three — and the relationship is not authored. (D-HM-008.)

### F-4 Recovery posture is engineering-only

Hero Moment failure-mode handling is comprehensive on the engineering side (graceful degradation, on-call paging, DLQ retries, capability fallback paths). It is empty on the user side: a seller who abandons mid-Hero-Moment receives no re-engagement email, no inbox nudge, no magic-link re-issue. The audit-prompt's check #4 explicitly requires "recovery path on miss" — abandonment recovery is the most common miss and is unaddressed. (D-HM-006 + D-HM-007.)

### F-5 Solo-tier Hero Moment is partial

§22.20.6 + §44.6 spec the Solo-tier surface compression (suppress AIWallet counter, replace monetary copy with non-monetary stake summary). They do NOT spec Solo-tier-specific activation-metric SLOs, throttled-session SLOs, or the Solo Hero Moment surface as a consolidated specification — a reader has to chase three sections to assemble the full Solo Hero Moment contract. (D-HM-009 + D-HM-016.)

### F-6 Direct-signup cohort has no Hero Moment

`invite_source = direct_signup` is explicitly excluded from the hero-path cohort (§49.1.5 #19; §48.8.10 ACs #30/#31). The spec is silent on what value-moment a direct-signup seller experiences instead. (D-HM-015.)

---

## Self-Challenge Pass

Re-reading findings as a hostile staff engineer:

- **D-HM-001 (P1).** Genuine ambiguity, not pedantic — `hero_moment_completed_at` as a column write at Stage 3 vs. §48.1.5 Phase 4 as the moment-of-completion-acknowledgement is a real semantic divide that engineering will resolve in two different ways. Stays P1.
- **D-HM-002 (P1).** Could a hostile reviewer say "the spec's GTM thesis is that the buyer-side magic moment is a different thing entirely (it's the structured method, not a single rendered moment) and explicitly NOT a Hero Moment by design"? Yes — and the §48.8.1 Scope line ("Out of scope: Buyer-side invite-creation UX") supports that read. But §13.12 Buyer Maya intake IS a Hero Moment in everything but name (entry / value / exit). Held as P1: a junior engineer asked to instrument buyer activation will not know whether to model it on the Seller Hero Moment or invent something new, and the spec doesn't tell them.
- **D-HM-003 / D-HM-004 (P1).** Two different payload schemas for the same event name will produce broken PostHog Insights funnels at runtime. Stays P1.
- **D-HM-005 (P2).** App. G omission of `reveal_moment` is fixable with a single column add; downgrade considered but the omission breaks the §22.18.6 three-Moments funnel queries. Stays P2.
- **D-HM-006 (P1).** A "recovery path on miss" that consists exclusively of "the seller comes back on their own within 7 days" is not a recovery path. Held P1.
- **D-HM-007 (P2).** The latency-breach is internal-only (the seller experiences a slow load, no failure). Junior engineer will not author user-facing handling and the system will silently degrade trust. P2 holds.
- **D-HM-008 (P2).** The taxonomy collision is real but resolution is judgment-call territory — a thoughtful engineer can read past it. P2.
- **D-HM-009 (P1).** Solo-tier activation-metric cohort missing creates ambiguous SLO ownership for the largest projected single seller cohort (per BPS v3 §13 / SPS v3 §14 the Solo split is 25–35%). Held P1.
- **D-HM-010 (P2).** Three Stake-Reveal Moments without metric targets are a measurement gap, not a buildability gap. P2.
- **D-HM-011 (P2).** Pro Trial Seat × Solo-tier-surface inheritance is a single-paragraph clarification; not buildability-blocking but ambiguous. P2.
- **D-HM-012 (P2).** Alias relationship between `seller_first_requirement_response` and `seller_onboarding_first_requirement_response` is documented but PostHog Insights funnel composition diverges. P2 — resolvable by reading §49.1.5 #33 carefully.
- **D-HM-013 (P3).** Glossary completeness is hygiene. P3.
- **D-HM-014 (P2).** §46 cross-section reference is at minimum documentation drift; potentially a hidden buyer-side latency target that should exist. P2.
- **D-HM-015 (P2).** Direct-signup cohort silence is a measurement gap rather than a buildability gap. P2.
- **D-HM-016 (P3).** Lack of a consolidated Solo Hero Moment Surface Specification is documentation hygiene; a senior engineer can assemble it from §22.20.6 + §22.20.5 + §44.6. P3.

No re-classifications.

## Counterfactual Pass (3+ failure modes per Hero Moment)

- **HM-S1 Seller Hero Moment.** (a) Magic-link clicked twice in rapid succession — Section §49.1.1 #2 idempotency on `(invite_id)` covers ✅. (b) Pre-arrival bootstrap completes but seller arrives 8 days later (cleanup sweep purge per §48.8.2 #3 ran) — fallback to in-flight bootstrap on click; degraded latency budget; covered ✅. (c) Seller's residency region differs from buyer's — §40.x cross-region handling per §48.8.9 #8 ✅. (d) **AIWallet exhaustion mid-Hero-Moment on a Solo-tier seller** — §22.20.5 / §44 throttling kicks in but throttle behavior under Hero Moment's 90-second p90 budget is unspecified; potential Hero Moment latency breach at Solo-tier scale → cascades into D-HM-009.
- **HM-S2 Stake-Reveal Moment 1 (Free-tier KB landing).** (a) Seller never lands on the KB landing screen — Moment 1 simply never fires; no recovery; no detection mechanism that the Moment has been "missed". (b) Seller lands within the 24-hour Hero Moment window — Moment 1 fires per §22.18.6.1 — but `stake_reveal_rendered` payload also carries `reveal_moment = post_submission_reveal` from §48.8.5 — same event name, ambiguous moment classification → D-HM-005 + D-HM-008. (c) Seller's KB has 0 entries — per the §22.18.4 empty-state copy renders; Moment 1 still fires; fired-Moment count increments without a real stake-build → telemetry signal noise.
- **HM-S5 Conversion Moment #1.** (a) Seller dismisses the modal and the second bid sits unworked — no re-prompt, no follow-up email; CM1 frequency cap is "fires at most once per Seller Org lifetime" so a missed CM1 is permanently missed. (b) Seller upgrades but Stripe Checkout abandons mid-flow — `seller_onboarding_conversion_moment_modal_closed` fires with `close_action = stripe_checkout_abandoned` but no recovery email; the trigger condition (second concurrent bid) never re-fires. (c) Two concurrent bids arrive within 5 seconds of each other → race condition on which bid is "second" — covered by §48.1.7 mutual-exclusivity.
- **HM-B1 Buyer Maya Intake.** (a) Buyer creates a Workspace, materialization fails partway → §13.12.8 #4 covers (transactional rollback) ✅. (b) Buyer dismisses §13.12.7 callout and never edits a single seeded Requirement → Workspace remains in starter state; no nudge; no engagement signal; no Hero-Moment-equivalent event fires → D-HM-002 cascading. (c) Buyer hits the 25-Workspaces-per-day rate-limit → §13.12.10.5 #20 covers ✅. (d) Buyer is on Solo plan; intake materializer truncates seed to 3 Use Cases / 30 Requirements; the truncation is a quality compromise that may make the Solo Hero Moment land less powerfully → no SLO measures this.

---

## Defects Promoted to DEFECT_LEDGER.md

D-HM-001 through D-HM-016 appended to the ledger in the next commit of this audit prompt.
